-- Studio Presence — Storage Policies for tenant-assets bucket
--
-- Enables authenticated users to upload and manage their assets in the
-- tenant-assets bucket under:
-- 1. staging/<userId>/... (during onboarding before tenant allocation)
-- 2. tenants/<tenantSlug>/... (for tenants the user belongs to)
--
-- Enables public reading of assets from the public tenant-assets bucket.

-- Helper to fetch tenant slugs for the authenticated user safely without RLS recursion
create or replace function public.current_tenant_slugs()
returns setof text
language sql
stable
security definer
set search_path = public
as $$
  select t.slug
  from public.tenants t
  join public.tenant_members tm on tm.tenant_id = t.id
  where tm.user_id = auth.uid()
$$;

revoke all on function public.current_tenant_slugs() from public;
grant execute on function public.current_tenant_slugs() to authenticated;

-- Ensure bucket exists and is public
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'tenant-assets',
  'tenant-assets',
  true,
  5242880,
  array['image/webp', 'image/png', 'image/jpeg']
)
on conflict (id) do update set
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = array['image/webp', 'image/png', 'image/jpeg'];

-- 1. Public SELECT policy: Anyone can read/download from tenant-assets
do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'tenant_assets_public_select'
  ) then
    create policy tenant_assets_public_select on storage.objects
      for select to public
      using (bucket_id = 'tenant-assets');
  end if;
end $$;

-- 2. Authenticated INSERT policy: Users can upload to their staging folder or their tenants' folder
do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'tenant_assets_authenticated_insert'
  ) then
    create policy tenant_assets_authenticated_insert on storage.objects
      for insert to authenticated
      with check (
        bucket_id = 'tenant-assets'
        and (
          (
            (storage.foldername(name))[1] = 'staging'
            and (storage.foldername(name))[2] = (select auth.uid())::text
          )
          or
          (
            (storage.foldername(name))[1] = 'tenants'
            and (storage.foldername(name))[2] in (select public.current_tenant_slugs())
          )
        )
      );
  end if;
end $$;

-- 3. Authenticated UPDATE policy: Required for upsert: true
do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'tenant_assets_authenticated_update'
  ) then
    create policy tenant_assets_authenticated_update on storage.objects
      for update to authenticated
      using (
        bucket_id = 'tenant-assets'
        and (
          (
            (storage.foldername(name))[1] = 'staging'
            and (storage.foldername(name))[2] = (select auth.uid())::text
          )
          or
          (
            (storage.foldername(name))[1] = 'tenants'
            and (storage.foldername(name))[2] in (select public.current_tenant_slugs())
          )
        )
      )
      with check (
        bucket_id = 'tenant-assets'
        and (
          (
            (storage.foldername(name))[1] = 'staging'
            and (storage.foldername(name))[2] = (select auth.uid())::text
          )
          or
          (
            (storage.foldername(name))[1] = 'tenants'
            and (storage.foldername(name))[2] in (select public.current_tenant_slugs())
          )
        )
      );
  end if;
end $$;

-- 4. Authenticated DELETE policy: Users can delete their staging or tenant assets
do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'tenant_assets_authenticated_delete'
  ) then
    create policy tenant_assets_authenticated_delete on storage.objects
      for delete to authenticated
      using (
        bucket_id = 'tenant-assets'
        and (
          (
            (storage.foldername(name))[1] = 'staging'
            and (storage.foldername(name))[2] = (select auth.uid())::text
          )
          or
          (
            (storage.foldername(name))[1] = 'tenants'
            and (storage.foldername(name))[2] in (select public.current_tenant_slugs())
          )
        )
      );
  end if;
end $$;
