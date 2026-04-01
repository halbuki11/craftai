import { createServiceClient } from '@/lib/supabase/server';
import { generateImage, webResearch } from '@/lib/ai/router';
import { logger } from '@/lib/logger';

export interface ActionResult {
  success: boolean;
  externalId?: string;
  error?: string;
  metadata?: Record<string, unknown>;
}

interface Action {
  type: string;
  params: Record<string, unknown>;
  confidence: number;
}

export async function routeAction(
  action: Action,
  userId: string,
): Promise<ActionResult> {
  logger.info(`[Router] Routing action ${action.type} for user ${userId}`);

  try {
    switch (action.type) {
      case 'quick_answer':
        return {
          success: true,
          metadata: { answer: action.params.answer as string },
        };

      case 'create_content':
        return {
          success: true,
          metadata: { content: action.params.content as string },
        };

      case 'todo_create': {
        const supabase = await createServiceClient();
        const { data, error } = await supabase
          .from('todos')
          .insert({
            user_id: userId,
            title: action.params.title as string,
            due_date: action.params.due_date as string || null,
            priority: action.params.priority as string || 'medium',
          })
          .select('id')
          .single();

        if (error) throw error;
        return { success: true, externalId: data.id };
      }

      case 'generate_image': {
        const imageUrl = await generateImage(
          action.params.prompt as string,
          action.params.style as string | undefined
        );
        return { success: true, metadata: { imageUrl } };
      }

      case 'web_research': {
        const research = await webResearch(
          action.params.query as string | undefined,
          action.params.url as string | undefined
        );
        return { success: true, metadata: { research } };
      }

      case 'summarize':
      case 'note_save':
        return { success: true };

      default:
        return {
          success: true,
          metadata: { answer: action.params.answer as string || '' },
        };
    }
  } catch (error) {
    logger.error(`Action failed: ${action.type}`, error as Error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Action failed',
    };
  }
}
