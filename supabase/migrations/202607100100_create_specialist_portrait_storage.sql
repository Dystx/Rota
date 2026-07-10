-- Private Storage bucket for guide/specialist profile portraits.
--
-- Objects use `<auth user id>/<random object id>.<extension>`. The app's
-- upload action generates this path, while these policies enforce the same
-- ownership rule inside Supabase Storage. Signed URLs are used for previews;
-- the bucket is never public and no external portrait URL is accepted.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'specialist-portraits',
  'specialist-portraits',
  false,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']::text[]
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

-- The column predates Storage and is still named `photo_url` for API
-- compatibility. Clear legacy remote URLs before enforcing the new shape.
update public.specialist_profiles
set photo_url = null
where photo_url is not null
  and photo_url ~* '^https?://';

comment on column public.specialist_profiles.photo_url is
  'Private Storage object path (<user uuid>/<object uuid>.<extension>). Signed URLs are generated at read time.';

alter table public.specialist_profiles
  drop constraint if exists specialist_profiles_photo_storage_path;

alter table public.specialist_profiles
  add constraint specialist_profiles_photo_storage_path
  check (
    photo_url is null
    or photo_url ~* '^[0-9a-f-]{36}/[0-9a-f-]{36}\\.(jpg|png|webp)$'
  );

drop policy if exists specialist_portraits_select_own on storage.objects;
create policy specialist_portraits_select_own
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'specialist-portraits'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  );

drop policy if exists specialist_portraits_insert_own on storage.objects;
create policy specialist_portraits_insert_own
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'specialist-portraits'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  );

drop policy if exists specialist_portraits_update_own on storage.objects;
create policy specialist_portraits_update_own
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'specialist-portraits'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  )
  with check (
    bucket_id = 'specialist-portraits'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  );

drop policy if exists specialist_portraits_delete_own on storage.objects;
create policy specialist_portraits_delete_own
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'specialist-portraits'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  );
