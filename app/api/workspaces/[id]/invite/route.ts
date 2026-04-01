import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';

// POST — invite member by email
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: workspaceId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { email, role = 'member' } = await request.json();
  if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 });

  const serviceClient = createServiceClient();

  // Check if user is admin/owner
  const { data: membership } = await serviceClient
    .from('workspace_members')
    .select('role')
    .eq('workspace_id', workspaceId)
    .eq('user_id', user.id)
    .single();

  if (!membership || !['owner', 'admin'].includes(membership.role)) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
  }

  const { error } = await serviceClient
    .from('workspace_invites')
    .insert({
      workspace_id: workspaceId,
      email,
      role,
      invited_by: user.id,
    });

  if (error?.code === '23505') {
    return NextResponse.json({ error: 'Already invited' }, { status: 409 });
  }
  if (error) return NextResponse.json({ error: 'Failed to invite' }, { status: 500 });

  return NextResponse.json({ success: true });
}
