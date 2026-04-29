-- ============================================================
-- dot. — RPC delete_my_account
-- ============================================================
-- Запустить ОДИН РАЗ в Supabase SQL Editor.
-- Даёт возможность пользователю удалить свой аккаунт целиком
-- через кнопку «Удалить аккаунт» в настройках.
--
-- Каскадно удаляются: profiles → tasks, habits, habit_logs,
-- spaces, pages, files, devices (все FK с on delete cascade).
-- ============================================================

create or replace function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Удаляем auth-юзера; cascade FK снесёт всё связанное.
  delete from auth.users where id = auth.uid();
end $$;

revoke all on function public.delete_my_account() from public;
grant execute on function public.delete_my_account() to authenticated;
