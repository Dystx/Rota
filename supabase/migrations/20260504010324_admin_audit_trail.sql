create table public.admin_audit_trail (
  id uuid not null default gen_random_uuid(),
  actor_user_id uuid not null references auth.users(id) on delete cascade,
  action text not null constraint admin_audit_trail_action_check check (action in ('create', 'update', 'delete')),
  entity_type text not null,
  entity_id text not null,
  before jsonb,
  after jsonb,
  created_at timestamptz not null default now(),
  constraint admin_audit_trail_pkey primary key (id)
);

alter table public.admin_audit_trail enable row level security;

create policy "admin_audit_trail_admin_all" on public.admin_audit_trail
  for all
  to authenticated
  using ((select private.current_app_role()) = 'admin')
  with check ((select private.current_app_role()) = 'admin');

grant select, insert on public.admin_audit_trail to authenticated;

comment on table public.admin_audit_trail is 'Audit log for admin mutations. T33: tracks who changed what CMS entities (places, partners, regions, reviewers) and when.';
