-- ============================================================
-- dot. — Database Schema (Этап 1.2)
-- ============================================================
-- Этот файл создаёт все таблицы и правила безопасности.
-- 
-- Как использовать:
-- 1. Откройте свой Supabase проект в браузере
-- 2. В левом меню кликните иконку SQL — это SQL Editor
-- 3. Нажмите "+ New query"
-- 4. Скопируйте ВЕСЬ этот файл и вставьте в редактор
-- 5. Нажмите кнопку Run (или Cmd/Ctrl+Enter)
-- 6. Подождите 5-10 секунд — внизу должно появиться "Success"
-- ============================================================


-- ────────────────────────────────────────────────────────────
-- 1. Расширения (нужны для UUID и шифрования)
-- ────────────────────────────────────────────────────────────
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";


-- ────────────────────────────────────────────────────────────
-- 2. Таблица профилей
-- ────────────────────────────────────────────────────────────
-- Supabase сам управляет таблицей auth.users (с email/паролем).
-- Мы расширяем её своей таблицей profiles, где храним наши данные:
-- имя, тариф, аватар и т.д.
-- ────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text not null,
  name        text,
  avatar_url  text,
  plan        text not null default 'free' check (plan in ('free', 'plus')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Триггер, чтобы при регистрации в auth.users автоматически
-- создавалась пустая запись в profiles
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, email, name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- ────────────────────────────────────────────────────────────
-- 3. Spaces (пространства в Базе знаний)
-- ────────────────────────────────────────────────────────────
create table if not exists public.spaces (
  id          uuid primary key default uuid_generate_v4(),
  owner_id    uuid not null references public.profiles(id) on delete cascade,
  name        text not null,
  icon        text,
  position    integer not null default 0,
  shared_with uuid[] not null default '{}',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  deleted_at  timestamptz
);
create index if not exists spaces_owner_idx on public.spaces(owner_id);
create index if not exists spaces_shared_idx on public.spaces using gin (shared_with);


-- ────────────────────────────────────────────────────────────
-- 4. Pages (страницы внутри пространств, могут быть вложенными)
-- ────────────────────────────────────────────────────────────
create table if not exists public.pages (
  id              uuid primary key default uuid_generate_v4(),
  space_id        uuid not null references public.spaces(id) on delete cascade,
  parent_page_id  uuid references public.pages(id) on delete cascade,
  owner_id        uuid not null references public.profiles(id) on delete cascade,
  title           text not null default '',
  icon            text,
  properties      jsonb not null default '[]',
  blocks          jsonb not null default '[]',
  position        integer not null default 0,
  shared_with     uuid[] not null default '{}',
  last_editor_id  uuid references public.profiles(id),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  deleted_at      timestamptz
);
create index if not exists pages_space_idx on public.pages(space_id);
create index if not exists pages_parent_idx on public.pages(parent_page_id);
create index if not exists pages_owner_idx on public.pages(owner_id);
create index if not exists pages_shared_idx on public.pages using gin (shared_with);


-- ────────────────────────────────────────────────────────────
-- 5. Tasks (задачи)
-- ────────────────────────────────────────────────────────────
create table if not exists public.tasks (
  id           uuid primary key default uuid_generate_v4(),
  owner_id     uuid not null references public.profiles(id) on delete cascade,
  title        text not null,
  notes        text,
  due_at       timestamptz,
  reminder_at  timestamptz,
  priority     text check (priority in ('low', 'medium', 'high', 'urgent')),
  done         boolean not null default false,
  done_at      timestamptz,
  list         text not null default 'inbox',
  shared_with  uuid[] not null default '{}',
  position     integer not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  deleted_at   timestamptz
);
create index if not exists tasks_owner_idx on public.tasks(owner_id);
create index if not exists tasks_due_idx on public.tasks(due_at) where deleted_at is null and done = false;
create index if not exists tasks_shared_idx on public.tasks using gin (shared_with);


-- ────────────────────────────────────────────────────────────
-- 6. Habits (привычки)
-- ────────────────────────────────────────────────────────────
create table if not exists public.habits (
  id           uuid primary key default uuid_generate_v4(),
  owner_id     uuid not null references public.profiles(id) on delete cascade,
  title        text not null,
  icon         text,
  color        text,
  schedule     jsonb not null default '{"type":"daily"}',
  goal_per_day integer not null default 1,
  reminder_at  time,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  deleted_at   timestamptz
);
create index if not exists habits_owner_idx on public.habits(owner_id);


-- ────────────────────────────────────────────────────────────
-- 7. Habit Logs (отметки выполнения привычек)
-- ────────────────────────────────────────────────────────────
create table if not exists public.habit_logs (
  id          uuid primary key default uuid_generate_v4(),
  habit_id    uuid not null references public.habits(id) on delete cascade,
  owner_id    uuid not null references public.profiles(id) on delete cascade,
  date        date not null,
  count       integer not null default 1,
  created_at  timestamptz not null default now(),
  unique(habit_id, date)
);
create index if not exists habit_logs_habit_idx on public.habit_logs(habit_id, date);


-- ────────────────────────────────────────────────────────────
-- 8. Files (метаданные файлов; сами файлы лежат в Storage)
-- ────────────────────────────────────────────────────────────
create table if not exists public.files (
  id             uuid primary key default uuid_generate_v4(),
  owner_id       uuid not null references public.profiles(id) on delete cascade,
  original_name  text not null,
  mime_type      text not null,
  size_bytes     bigint not null,
  storage_path   text not null,
  created_at     timestamptz not null default now()
);
create index if not exists files_owner_idx on public.files(owner_id);


-- ────────────────────────────────────────────────────────────
-- 9. Devices (для пуш-уведомлений и истории устройств)
-- ────────────────────────────────────────────────────────────
create table if not exists public.devices (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid not null references public.profiles(id) on delete cascade,
  push_token   text,
  platform     text check (platform in ('web', 'ios', 'android', 'macos', 'windows')),
  device_name  text,
  last_active  timestamptz not null default now(),
  created_at   timestamptz not null default now()
);
create index if not exists devices_user_idx on public.devices(user_id);


-- ============================================================
-- ROW LEVEL SECURITY (RLS) — главная штука для безопасности
-- ============================================================
-- RLS = "пользователь видит только свои данные".
-- Без RLS любой пользователь смог бы достать данные любого другого.
-- С RLS даже если кто-то украдёт ваш anon key, он не сможет
-- получить чужие данные — БД сама их не отдаст.
-- ============================================================

-- Включаем RLS на всех таблицах
alter table public.profiles    enable row level security;
alter table public.spaces      enable row level security;
alter table public.pages       enable row level security;
alter table public.tasks       enable row level security;
alter table public.habits      enable row level security;
alter table public.habit_logs  enable row level security;
alter table public.files       enable row level security;
alter table public.devices     enable row level security;


-- ── Profiles ─────────────────────────────────────────────────
-- Пользователь видит только свой профиль
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);


-- ── Spaces ───────────────────────────────────────────────────
-- Видишь, если ты владелец ИЛИ если тебе расшарили
create policy "spaces_select" on public.spaces
  for select using (
    auth.uid() = owner_id
    or auth.uid() = any(shared_with)
  );
create policy "spaces_insert" on public.spaces
  for insert with check (auth.uid() = owner_id);
create policy "spaces_update" on public.spaces
  for update using (auth.uid() = owner_id);
create policy "spaces_delete" on public.spaces
  for delete using (auth.uid() = owner_id);


-- ── Pages ────────────────────────────────────────────────────
create policy "pages_select" on public.pages
  for select using (
    auth.uid() = owner_id
    or auth.uid() = any(shared_with)
  );
create policy "pages_insert" on public.pages
  for insert with check (auth.uid() = owner_id);
create policy "pages_update" on public.pages
  for update using (
    auth.uid() = owner_id
    or auth.uid() = any(shared_with)
  );
create policy "pages_delete" on public.pages
  for delete using (auth.uid() = owner_id);


-- ── Tasks ────────────────────────────────────────────────────
create policy "tasks_select" on public.tasks
  for select using (
    auth.uid() = owner_id
    or auth.uid() = any(shared_with)
  );
create policy "tasks_insert" on public.tasks
  for insert with check (auth.uid() = owner_id);
create policy "tasks_update" on public.tasks
  for update using (
    auth.uid() = owner_id
    or auth.uid() = any(shared_with)
  );
create policy "tasks_delete" on public.tasks
  for delete using (auth.uid() = owner_id);


-- ── Habits ───────────────────────────────────────────────────
create policy "habits_all_own" on public.habits
  for all using (auth.uid() = owner_id);


-- ── Habit Logs ───────────────────────────────────────────────
create policy "habit_logs_all_own" on public.habit_logs
  for all using (auth.uid() = owner_id);


-- ── Files ────────────────────────────────────────────────────
create policy "files_all_own" on public.files
  for all using (auth.uid() = owner_id);


-- ── Devices ──────────────────────────────────────────────────
create policy "devices_all_own" on public.devices
  for all using (auth.uid() = user_id);


-- ============================================================
-- Триггер «автообновление updated_at»
-- ============================================================
-- Каждый раз при апдейте записи updated_at будет переставляться
-- на текущее время. Это критично для синхронизации (LWW).
-- ============================================================
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();
create trigger spaces_updated_at before update on public.spaces
  for each row execute function public.set_updated_at();
create trigger pages_updated_at before update on public.pages
  for each row execute function public.set_updated_at();
create trigger tasks_updated_at before update on public.tasks
  for each row execute function public.set_updated_at();
create trigger habits_updated_at before update on public.habits
  for each row execute function public.set_updated_at();


-- ============================================================
-- ГОТОВО
-- ============================================================
-- В Supabase Dashboard → Table Editor вы должны увидеть все таблицы.
-- Дальше переходим к Этапу 1.3 — подключение SDK к коду приложения.
-- ============================================================
