import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('settings')
    .eq('id', user.id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(profile?.settings || {});
}

export async function PATCH(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();

  // Handle timezone update (save directly to column)
  if (body.timezone) {
    if (body.autoDetect) {
      // Auto-detect: only update if not already set
      const { data: existing } = await supabase
        .from('profiles')
        .select('timezone')
        .eq('id', user.id)
        .single();

      if (existing?.timezone) {
        return NextResponse.json({ timezone: existing.timezone });
      }
    }

    await supabase
      .from('profiles')
      .update({ timezone: body.timezone })
      .eq('id', user.id);
  }

  // Handle other settings (save to settings JSON)
  const settingsFields = { ...body };
  delete settingsFields.timezone;
  delete settingsFields.autoDetect;

  if (Object.keys(settingsFields).length > 0) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('settings')
      .eq('id', user.id)
      .single();

    const newSettings = { ...profile?.settings, ...settingsFields };

    await supabase
      .from('profiles')
      .update({ settings: newSettings })
      .eq('id', user.id);
  }

  const { data: updated } = await supabase
    .from('profiles')
    .select('timezone, settings')
    .eq('id', user.id)
    .single();

  return NextResponse.json({ timezone: updated?.timezone, ...updated?.settings });
}
