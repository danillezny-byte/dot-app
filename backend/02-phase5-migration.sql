-- ============================================================
-- dot. — Phase 5 миграция: закрепление + storage bucket
-- ============================================================
-- Запускать ОДИН РАЗ в Supabase SQL Editor (Dashboard → SQL).
-- ============================================================

-- 1. Колонка pinned_at для закрепления пространств и страниц
alter table public.spaces add column if not exists pinned_at timestamptz;
alter table public.pages  add column if not exists pinned_at timestamptz;
create index if not exists spaces_pinned_idx on public.spaces(pinned_at) where pinned_at is not null;
create index if not exists pages_pinned_idx  on public.pages(pinned_at)  where pinned_at is not null;

-- 2. Storage bucket "images" — для image-блоков на страницах
-- (если предпочитаешь, можно сделать через Dashboard → Storage → New bucket
--  → name: images → Public bucket: ON. SQL ниже делает то же самое.)
insert into storage.buckets (id, name, public)
  values ('images', 'images', true)
  on conflict (id) do nothing;

-- RLS политики для bucket: каждый пользователь может писать в свою папку
-- (имя файла начинается с user.id), читать может кто угодно (т.к. public).
do $$
begin
  if not exists (select 1 from pg_policies where policyname = 'images_insert_own') then
    create policy "images_insert_own" on storage.objects
      for insert to authenticated
      with check (
        bucket_id = 'images'
        and (storage.foldername(name))[1] = auth.uid()::text
      );
  end if;
  if not exists (select 1 from pg_policies where policyname = 'images_delete_own') then
    create policy "images_delete_own" on storage.objects
      for delete to authenticated
      using (
        bucket_id = 'images'
        and (storage.foldername(name))[1] = auth.uid()::text
      );
  end if;
end $$;
