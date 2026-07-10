begin;

do $$
begin
  if not exists (
    select 1
    from information_schema.tables
    where table_schema = 'public'
      and table_name = 'app_role_capability_grants'
  ) then
    raise exception 'app_role_capability_grants is required';
  end if;

  if exists (
    select 1
    from pg_proc
    join pg_namespace on pg_namespace.oid = pg_proc.pronamespace
    where pg_namespace.nspname = 'public'
      and pg_proc.prosecdef
  ) then
    raise exception 'public security definer functions are forbidden';
  end if;

  if exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'chat_messages'
      and qual = 'true'
  ) then
    raise exception 'broad chat_messages read policy is forbidden';
  end if;

  if exists (
    select 1
    from pg_proc
    join pg_namespace on pg_namespace.oid = pg_proc.pronamespace
    where pg_namespace.nspname = 'public'
      and pg_get_functiondef(pg_proc.oid) ilike '%user_metadata%'
  ) then
    raise exception 'public authorization functions must not use user_metadata';
  end if;
end;
$$;

rollback;
