-- Anonymous feedback is accepted through one server route. This shared,
-- server-only minute bucket limits write amplification without trusting a
-- client-supplied identity or exposing the counter through the Data API.
create table public.activity_feedback_rate_limit (
  minute_bucket bigint primary key,
  call_count integer not null default 0,
  updated_at timestamptz not null default now()
);

alter table public.activity_feedback_rate_limit enable row level security;

revoke all on table public.activity_feedback_rate_limit from public, anon, authenticated;
grant select, insert, update, delete on table public.activity_feedback_rate_limit to service_role;

create function public.consume_activity_feedback_token(max_per_minute integer)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
declare
  current_bucket bigint := (extract(epoch from now())::bigint / 60);
  new_count integer;
begin
  delete from public.activity_feedback_rate_limit
  where minute_bucket < current_bucket - 5;

  insert into public.activity_feedback_rate_limit (minute_bucket, call_count)
  values (current_bucket, 1)
  on conflict (minute_bucket) do update
    set call_count = public.activity_feedback_rate_limit.call_count + 1,
        updated_at = now()
  returning call_count into new_count;

  return new_count <= max_per_minute;
end;
$$;

revoke all on function public.consume_activity_feedback_token(integer) from public, anon, authenticated;
grant execute on function public.consume_activity_feedback_token(integer) to service_role;
