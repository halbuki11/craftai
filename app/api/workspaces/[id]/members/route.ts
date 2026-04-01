import { NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';

// GET — list workspace members
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: workspaceId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const serviceClient = createServiceClient();

  // Check membership
  const { data: membership } = await serviceClient
    .from('workspace_members')
    .select('role')
    .eq('workspace_id', workspaceId)
    .eq('user_id', user.id)
    .single();

  if (!membership) return NextResponse.json({ error: 'Not a member' }, { status: 403 });

  const { data: members } = await serviceClient
    .from('workspace_members')
    .select('user_id, role, joined_at, profiles(full_name)')
    .eq('workspace_id', workspaceId);

  return NextResponse.json({ members: members || [] });
}
