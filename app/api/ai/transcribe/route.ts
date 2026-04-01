import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { rateLimit } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const rl = rateLimit(`transcribe:${user.id}`, 10, 60_000);
    if (!rl.allowed) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const formData = await request.formData();
    const audio = formData.get('audio') as File | null;

    if (!audio) {
      return NextResponse.json({ error: 'No audio provided' }, { status: 400 });
    }

    // Max 25MB
    if (audio.size > 25 * 1024 * 1024) {
      return NextResponse.json({ error: 'Audio too large' }, { status: 413 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      // Fallback: return empty if no OpenAI key
      return NextResponse.json({ error: 'Transcription not available' }, { status: 503 });
    }

    // Call OpenAI Whisper API directly
    const whisperForm = new FormData();
    whisperForm.append('file', audio, 'audio.webm');
    whisperForm.append('model', 'whisper-1');
    whisperForm.append('response_format', 'json');

    const res = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}` },
      body: whisperForm,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return NextResponse.json({ error: err.error?.message || 'Transcription failed' }, { status: 500 });
    }

    const data = await res.json();
    return NextResponse.json({ text: data.text || '' });
  } catch {
    return NextResponse.json({ error: 'Transcription failed' }, { status: 500 });
  }
}
