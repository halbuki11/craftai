import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import crypto from 'crypto';

function hashKey(key: string): string {
  return crypto.createHash('sha256').update(key).digest('hex');
}

// GET — list user's API keys
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const serviceClient = createServiceClient();
  const { data: keys } = await serviceClient
    .from('api_keys')
    .select('id, name, key_prefix, is_active, last_used_at, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  return NextResponse.json({ keys: keys || [] });
}

// POST — create new API key
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { name = 'Default' } = await request.json().catch(() => ({}));

  // Generate key: craft_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
  const rawKey = `craft_${crypto.randomBytes(24).toString('hex')}`;
  const prefix = rawKey.slice(0, 12) + '...';

  const serviceClient = createServiceClient();
  const { error } = await serviceClient
    .from('api_keys')
    .insert({
      user_id: user.id,
      name,
      key_hash: hashKey(rawKey),
      key_prefix: prefix,
    });

  if (error) return NextResponse.json({ error: 'Failed to create key' }, { status: 500 });

  // Return full key ONCE — it won't be shown again
  return NextResponse.json({ key: rawKey, prefix });
}

// DELETE — revoke a key
export async function DELETE(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await request.json();
  if (!id) return NextResponse.json({ error: 'Key ID required' }, { status: 400 });

  const serviceClient = createServiceClient();
  await serviceClient
    .from('api_keys')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  return NextResponse.json({ success: true });
}
