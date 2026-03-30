import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { routeMessage } from '@/lib/ai/router';
import { getRecentHistory, getUserContext } from '@/lib/ai/memory';
import { routeAction } from '@/lib/actions/router';
import { saveNote } from '@/lib/actions/note-saver';
import { recordDelivery } from '@/lib/database/deliveries';
import { checkCredits, checkModelAccess } from '@/lib/credits/check';
import { deductCredits } from '@/lib/credits/deduct';
import { resolveSkill, buildSkillPrompt } from '@/lib/skills/registry';
import { type ModelId, DEFAULT_MODEL, calculateCredits } from '@/lib/ai/model-config';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { message, model: requestedModel, skillId } = await request.json();
    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Get user profile + preferences
    const { data: profile } = await supabase
      .from('profiles')
      .select('timezone, settings')
      .eq('id', user.id)
      .single();

    const preferredModel = (requestedModel || profile?.settings?.preferred_model || DEFAULT_MODEL) as ModelId;

    // Check model access
    const modelAccess = await checkModelAccess(user.id, preferredModel);
    if (!modelAccess.allowed) {
      return NextResponse.json({ error: modelAccess.error }, { status: 403 });
    }

    // Resolve skill (auto-detect or manual)
    const { skill } = resolveSkill(message, skillId);
    const multiplier = skill?.creditMultiplier ?? 1;
    const effectiveModel = skill?.defaultModel || preferredModel;

    // Pre-flight credit check
    const creditCheck = await checkCredits(user.id, effectiveModel, multiplier);
    if (!creditCheck.allowed) {
      return NextResponse.json({ error: creditCheck.error, credits_remaining: creditCheck.credits_remaining }, { status: 402 });
    }

    // Get user context
    const [history, userInfo] = await Promise.all([
      getRecentHistory(user.id, 5),
      getUserContext(user.id),
    ]);

    // Route the message (with skill system prompt if available)
    const routing = await routeMessage(message, profile?.timezone || undefined, { history, userInfo }, effectiveModel);

    // Save note if needed
    const shouldSaveNote = routing.actions.some(a =>
      ['note_save', 'create_content', 'web_research'].includes(a.type)
    );

    let noteId = '';
    if (shouldSaveNote) {
      const note = await saveNote({
        userId: user.id,
        transcript: message,
        source: 'web',
        language: routing.detected_language,
        aiConfidence: routing.actions.reduce((sum, a) => sum + a.confidence, 0) / routing.actions.length,
        processingTimeMs: 0,
        formattedContent: routing.formatted_content,
        title: routing.title,
        hasActionItems: routing.actions.some(a => a.type.includes('todo')),
        hasCalendarEvent: routing.actions.some(a => a.type.includes('calendar')),
      });
      noteId = note.id;
    }

    // Execute actions and collect results
    let responseText = '';
    let responseType = 'action';

    for (const action of routing.actions) {
      if (action.type === 'note_save') continue;

      try {
        const result = await routeAction(action, user.id);

        if (noteId) {
          await recordDelivery({
            noteId,
            integration: action.type,
            status: result.success ? 'success' : 'failed',
            externalId: result.externalId,
            errorMessage: result.error,
          });
        }

        if (result.success) {
          if (action.type === 'create_content' && result.metadata?.content) {
            responseText = result.metadata.content as string;
            responseType = 'content';
          } else if (action.type === 'quick_answer' && result.metadata?.answer) {
            responseText = result.metadata.answer as string;
            responseType = 'answer';
          } else if (action.type === 'web_research' && result.metadata?.research) {
            responseText = result.metadata.research as string;
            responseType = 'research';
          } else if (action.type === 'generate_image' && result.metadata?.imageUrl) {
            responseText = result.metadata.imageUrl as string;
            responseType = 'image';
          }
        } else if (result.error) {
          responseText = result.error;
          responseType = 'error';
        }
      } catch (err) {
        logger.error('Chat action error', err as Error);
      }
    }

    // Deduct credits after successful processing
    const totalCredits = calculateCredits(effectiveModel, multiplier);
    const deduction = await deductCredits({
      userId: user.id,
      credits: totalCredits,
      model: effectiveModel,
      skillId: skill?.id,
      actionType: routing.actions[0]?.type,
      source: 'web',
    });

    const response = NextResponse.json({
      response: responseText || routing.response_message,
      type: responseType,
      title: routing.title,
      noteId,
      actions: routing.actions.map(a => a.type),
      skill: skill?.id || null,
      model: effectiveModel,
    });

    // Add credit headers
    response.headers.set('X-Credits-Used', String(totalCredits));
    response.headers.set('X-Credits-Remaining', String(deduction.remaining));

    return response;

  } catch (error) {
    logger.error('Chat API error', error instanceof Error ? error : undefined);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
