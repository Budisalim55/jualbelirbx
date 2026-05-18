-- ============================================================
-- JualBeliRBX schema — run di Supabase SQL Editor (sekali jalan)
-- ============================================================

-- profiles: 1-1 dengan auth.users
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null check (char_length(username) between 3 and 20),
  whatsapp text,
  discord text,
  avatar_url text,
  rating_avg numeric(3,2) default 0,
  rating_count integer default 0,
  created_at timestamptz default now()
);

-- listings: item yang dijual
create table if not exists listings (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(title) between 3 and 100),
  description text not null,
  category text not null check (category in ('limited','robux','gamepass','account','other')),
  price_idr integer not null check (price_idr >= 1000),
  image_url text,
  status text not null default 'active' check (status in ('active','sold','paused')),
  created_at timestamptz default now()
);
create index if not exists listings_seller_idx on listings(seller_id);
create index if not exists listings_status_idx on listings(status, created_at desc);
create index if not exists listings_category_idx on listings(category);

-- reviews: rating antar user
create table if not exists reviews (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid references listings(id) on delete set null,
  reviewer_id uuid not null references auth.users(id) on delete cascade,
  reviewee_id uuid not null references auth.users(id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz default now(),
  unique (listing_id, reviewer_id)
);

-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, username, whatsapp)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', 'user_' || substring(new.id::text, 1, 8)),
    new.raw_user_meta_data->>'whatsapp'
  )
  on conflict (id) do nothing;
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users for each row execute function handle_new_user();

-- Auto-update rating on review insert
create or replace function recompute_rating()
returns trigger language plpgsql as $$
begin
  update profiles set
    rating_avg = (select coalesce(avg(rating)::numeric(3,2), 0) from reviews where reviewee_id = new.reviewee_id),
    rating_count = (select count(*) from reviews where reviewee_id = new.reviewee_id)
  where id = new.reviewee_id;
  return new;
end; $$;

drop trigger if exists on_review_insert on reviews;
create trigger on_review_insert
  after insert on reviews for each row execute function recompute_rating();

-- ============================================================
-- Row-Level Security
-- ============================================================
alter table profiles enable row level security;
alter table listings enable row level security;
alter table reviews enable row level security;

-- profiles: anyone can read; only self can update
drop policy if exists "profiles_select" on profiles;
create policy "profiles_select" on profiles for select using (true);
drop policy if exists "profiles_update_self" on profiles;
create policy "profiles_update_self" on profiles for update using (auth.uid() = id);
drop policy if exists "profiles_insert_self" on profiles;
create policy "profiles_insert_self" on profiles for insert with check (auth.uid() = id);

-- listings: anyone can read; only owner can write
drop policy if exists "listings_select" on listings;
create policy "listings_select" on listings for select using (true);
drop policy if exists "listings_insert_self" on listings;
create policy "listings_insert_self" on listings for insert with check (auth.uid() = seller_id);
drop policy if exists "listings_update_self" on listings;
create policy "listings_update_self" on listings for update using (auth.uid() = seller_id);
drop policy if exists "listings_delete_self" on listings;
create policy "listings_delete_self" on listings for delete using (auth.uid() = seller_id);

-- reviews: anyone can read; only logged-in can write
drop policy if exists "reviews_select" on reviews;
create policy "reviews_select" on reviews for select using (true);
drop policy if exists "reviews_insert_logged" on reviews;
create policy "reviews_insert_logged" on reviews for insert with check (auth.uid() = reviewer_id);

-- ============================================================
-- Storage bucket: listings (public read, owner write)
-- ============================================================
insert into storage.buckets (id, name, public) values ('listings', 'listings', true)
on conflict (id) do nothing;

drop policy if exists "listings_storage_read" on storage.objects;
create policy "listings_storage_read" on storage.objects for select using (bucket_id = 'listings');
drop policy if exists "listings_storage_write" on storage.objects;
create policy "listings_storage_write" on storage.objects for insert with check (
  bucket_id = 'listings' and auth.uid()::text = (storage.foldername(name))[1]
);
drop policy if exists "listings_storage_delete" on storage.objects;
create policy "listings_storage_delete" on storage.objects for delete using (
  bucket_id = 'listings' and auth.uid()::text = (storage.foldername(name))[1]
);
