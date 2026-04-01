import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';

// GET — list user's uploaded files
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const serviceClient = createServiceClient();
  const { data: files } = await serviceClient
    .from('file_uploads')
    .select('id, file_name, file_type, file_size, note_id, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(100);

  return NextResponse.json({ files: files || [] });
}

// POST — record a file upload
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { fileName, fileType, fileSize, noteId } = await request.json();

  const serviceClient = createServiceClient();
  const { data, error } = await serviceClient
    .from('file_uploads')
    .insert({
      user_id: user.id,
      file_name: fileName,
      file_type: fileType,
      file_size: fileSize || 0,
      note_id: noteId || null,
    })
    .select('id')
    .single();

  if (error) {
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 });
  }

  return NextResponse.json({ id: data.id });
}
