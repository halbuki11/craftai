import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ conversations: [] });
    }

    const { data: notes, error } = await supabase
      .from('notes')
      .select('id, title, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      return NextResponse.json({ conversations: [] });
    }

    return NextResponse.json({ conversations: notes || [] });
  } catch {
    return NextResponse.json({ conversations: [] });
  }
}
