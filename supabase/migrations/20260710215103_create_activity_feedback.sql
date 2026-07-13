-- Anonymous MVP feedback is accepted only through the server route, which
-- validates the bounded payload and uses the service role. The Data API has
-- no anon/authenticated privileges or policies for this table.
create table public.activity_feedback (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  activity_ids text[] not null,
  rating smallint not null,
  note text null,
  source text not null default 'feedback-page',
  constraint activity_feedback_activity_count_check
    check (cardinality(activity_ids) between 1 and 5),
  constraint activity_feedback_rating_check
    check (rating between 1 and 5),
  constraint activity_feedback_note_length_check
    check (note is null or char_length(note) <= 600),
  constraint activity_feedback_source_check
    check (source in ('activity-day', 'activity-detail', 'feedback-page'))
);

alter table public.activity_feedback enable row level security;

revoke all on table public.activity_feedback from anon, authenticated;
grant insert on table public.activity_feedback to service_role;
