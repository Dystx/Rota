create table if not exists public.payment_webhook_events (
  event_id text primary key,
  stripe_session_id text not null,
  trip_id bigint not null references public.trips(id) on delete cascade,
  user_id uuid not null,
  purchase_kind text not null,
  payload jsonb not null default '{}'::jsonb,
  processed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  constraint payment_webhook_events_purchase_kind_check
    check (purchase_kind in ('unlock', 'human_review'))
);

create index if not exists payment_webhook_events_trip_id_created_at_idx
  on public.payment_webhook_events(trip_id, created_at desc);

create index if not exists payment_webhook_events_stripe_session_id_idx
  on public.payment_webhook_events(stripe_session_id);

create or replace function public.fulfill_trip_payment_webhook(
  p_event_id text,
  p_stripe_session_id text,
  p_trip_id bigint,
  p_user_id uuid,
  p_purchase_kind text
)
returns table(fulfillment_status text)
language plpgsql
set search_path = public, pg_temp
as $$
declare
  v_inserted_event_id text;
  v_trip_id bigint;
begin
  if p_purchase_kind not in ('unlock', 'human_review') then
    fulfillment_status := 'invalid';
    return next;
    return;
  end if;

  select id
  into v_trip_id
  from public.trips
  where id = p_trip_id
    and (owner_user_id is null or owner_user_id = p_user_id)
  for update;

  if v_trip_id is null then
    fulfillment_status := 'invalid';
    return next;
    return;
  end if;

  insert into public.payment_webhook_events (
    event_id,
    payload,
    processed_at,
    purchase_kind,
    stripe_session_id,
    trip_id,
    user_id
  )
  values (
    p_event_id,
    jsonb_build_object(
      'purchase_kind', p_purchase_kind,
      'stripe_session_id', p_stripe_session_id,
      'trip_id', p_trip_id::text,
      'user_id', p_user_id::text
    ),
    now(),
    p_purchase_kind,
    p_stripe_session_id,
    p_trip_id,
    p_user_id
  )
  on conflict (event_id) do nothing
  returning event_id into v_inserted_event_id;

  if v_inserted_event_id is null then
    fulfillment_status := 'duplicate';
    return next;
    return;
  end if;

  if p_purchase_kind = 'unlock' then
    update public.trips
    set is_paid = true,
        status = case
          when status in ('in_review', 'reviewed') then status
          else 'paid'
        end,
        updated_at = now()
    where id = p_trip_id;
  else
    update public.trips
    set is_paid = true,
        status = case
          when has_human_review then 'reviewed'
          else 'in_review'
        end,
        updated_at = now()
    where id = p_trip_id;
  end if;

  fulfillment_status := 'fulfilled';
  return next;
end;
$$;

revoke all on function public.fulfill_trip_payment_webhook(text, text, bigint, uuid, text) from public, anon, authenticated;
grant execute on function public.fulfill_trip_payment_webhook(text, text, bigint, uuid, text) to service_role;

alter table public.payment_webhook_events enable row level security;

revoke all on public.payment_webhook_events from public, anon, authenticated;
grant select, insert, update, delete on public.payment_webhook_events to service_role;

comment on table public.payment_webhook_events is 'Server-only Stripe webhook idempotency ledger. No anon/authenticated direct access; webhook fulfillment uses a separate service-role client.';
comment on function public.fulfill_trip_payment_webhook(text, text, bigint, uuid, text) is 'Service-role-only atomic Stripe webhook idempotency and trip payment fulfillment RPC.';
