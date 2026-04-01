import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';

// GET — list user's workspaces
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const serviceClient = createServiceClient();
  const { data: memberships } = await serviceClient
    .from('workspace_members')
    .select('workspace_id, role, workspaces(id, name, owner_id, created_at)')
    .eq('user_id', user.id);

  const workspaces = (memberships || []).map((m) => {
    const ws = m.workspaces as unknown as { id: string; name: string; owner_id: string; created_at: string } | null;
    return { id: ws?.id, name: ws?.name, owner_id: ws?.owner_id, role: m.role };
  });

  return NextResponse.json({ workspaces });
}

// POST — create workspace
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { name } = await request.json();
  if (!name) return NextResponse.json({ error: 'Name required' }, { status: 400 });

  const serviceClient = createServiceClient();

  const { data: ws, error } = await serviceClient
    .from('workspaces')
    .insert({ name, owner_id: user.id })
    .select('id')
    .single();

  if (error) return NextResponse.json({ error: 'Failed to create workspace' }, { status: 500 });

  // Add creator as owner member
  await serviceClient.from('workspace_members').insert({
    workspace_id: ws.id,
    user_id: user.id,
    role: 'owner',
  });

  return NextResponse.json({ id: ws.id, name });
}
