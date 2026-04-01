-- Conversations table
create table if not exists conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null default 'Yeni Sohbet',
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Conversation messages table
create table if not exists conversation_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid references conversations(id) on delete cascade not null,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  model text,
  credits_used integer default 0,
  created_at timestamptz default now() not null
);

-- RLS
alter table conversations enable row level security;
alter table conversation_messages enable row level security;

create policy "Users can view own conversations"
  on conversations for select using (auth.uid() = user_id);

create policy "Users can insert own conversations"
  on conversations for insert with check (auth.uid() = user_id);

create policy "Users can update own conversations"
  on conversations for update using (auth.uid() = user_id);

create policy "Users can delete own conversations"
  on conversations for delete using (auth.uid() = user_id);

create policy "Users can view messages in own conversations"
  on conversation_messages for select
  using (conversation_id in (select id from conversations where user_id = auth.uid()));

create policy "Users can insert messages in own conversations"
  on conversation_messages for insert
  with check (conversation_id in (select id from conversations where user_id = auth.uid()));

create policy "Users can delete messages in own conversations"
  on conversation_messages for delete
  using (conversation_id in (select id from conversations where user_id = auth.uid()));

-- Indexes
create index if not exists conversations_user_id_idx on conversations(user_id, updated_at desc);
create index if not exists conversation_messages_conv_id_idx on conversation_messages(conversation_id, created_at asc);

-- Auto-update updated_at on conversations
create or replace function update_conversation_timestamp()
returns trigger as $$
begin
  update conversations set updated_at = now() where id = NEW.conversation_id;
  return NEW;
end;
$$ language plpgsql security definer;

create trigger trg_update_conversation_timestamp
  after insert on conversation_messages
  for each row execute function update_conversation_timestamp();
