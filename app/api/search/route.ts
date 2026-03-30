import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q');
  const type = searchParams.get('type');
  const limit = parseInt(searchParams.get('limit') || '20');

  if (!query || query.length < 2) {
    return NextResponse.json({ error: 'Query must be at least 2 characters' }, { status: 400 });
  }

  const results: { notes?: unknown[]; todos?: unknown[] } = {};

  if (!type || type === 'notes' || type === 'all') {
    const { data: notes } = await supabase
      .from('notes')
      .select('id, title, formatted_content, tags, created_at')
      .eq('user_id', user.id)
      .textSearch('search_vector', query, { type: 'websearch' })
      .limit(limit);

    if (notes) results.notes = notes;
  }

  if (!type || type === 'todos' || type === 'all') {
    const { data: todos } = await supabase
      .from('todos')
      .select('id, title, description, status, priority, created_at')
      .eq('user_id', user.id)
      .ilike('title', `%${query}%`)
      .limit(limit);

    if (todos) results.todos = todos;
  }

  return NextResponse.json(results);
}
