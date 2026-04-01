-- ============================================
-- Bu SQL'i Supabase Dashboard > SQL Editor'da çalıştır
-- ============================================

-- 1) Yeni kullanıcı kaydolunca otomatik profil + kredi oluştur
create or replace function public.handle_new_user()
returns trigger as $$
begin
  -- Profil oluştur
  insert into public.profiles (id, full_name, timezone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    'Europe/Istanbul'
  )
  on conflict (id) do nothing;

  -- Free plan subscription
  insert into public.user_subscriptions (user_id, plan_id, status, current_period_start, current_period_end)
  values (
    new.id,
    'free',
    'active',
    now(),
    now() + interval '30 days'
  )
  on conflict (user_id) do nothing;

  -- Free plan: 50K tokens per month
  insert into public.user_credits (user_id, credits_remaining, credits_total, period_start, period_end)
  values (
    new.id,
    50000,
    50000,
    now(),
    now() + interval '30 days'
  )
  on conflict (user_id) do nothing;

  return new;
end;
$$ language plpgsql security definer;

-- Trigger: auth.users tablosuna INSERT olduğunda çalışır
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
