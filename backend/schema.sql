
-- ============ MV Rudraksh CMS Schema ============
create extension if not exists "pgcrypto";

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  description text,
  image_url text,
  banner_url text,
  seo_title text,
  seo_description text,
  sort_order int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  sku text,
  category_id uuid references public.categories(id) on delete set null,
  mukhi text,
  origin text,
  shape text,
  size_mm text,
  weight_g text,
  color text,
  description text,
  short_description text,
  benefits text,
  specifications jsonb default '{}'::jsonb,
  wearing_method text,
  mantra text,
  planet text,
  deity text,
  chakra text,
  purpose text,
  material text,
  collection text,
  tags text[] default '{}',
  images jsonb default '[]'::jsonb,
  videos jsonb default '[]'::jsonb,
  certificate_images jsonb default '[]'::jsonb,
  certificate_pdf text,
  mrp numeric(10,2) default 0,
  selling_price numeric(10,2) default 0,
  cost_price numeric(10,2) default 0,
  discount_percent numeric(5,2) default 0,
  stock int default 1,
  is_featured boolean default false,
  is_bestseller boolean default false,
  is_new_arrival boolean default false,
  is_trending boolean default false,
  is_premium boolean default false,
  certification text,
  availability text default 'in_stock',
  offer_start timestamptz,
  offer_end timestamptz,
  offer_badge text,
  seo_title text,
  seo_description text,
  keywords text[],
  faqs jsonb default '[]'::jsonb,
  status text default 'published',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  published_at timestamptz default now()
);

create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  excerpt text,
  content text,
  featured_image text,
  banner_image text,
  author text,
  category text,
  tags text[] default '{}',
  reading_time int,
  seo_title text,
  seo_description text,
  status text default 'published',
  published_at timestamptz default now(),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.testimonials (
  id uuid primary key default gen_random_uuid(),
  author_name text not null,
  location text,
  content text not null,
  rating int default 5,
  avatar_url text,
  is_featured boolean default true,
  created_at timestamptz default now()
);

create table if not exists public.site_settings (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz default now()
);

create table if not exists public.inquiries (
  id uuid primary key default gen_random_uuid(),
  name text,
  email text,
  phone text,
  message text,
  product_id uuid references public.products(id) on delete set null,
  type text default 'contact',
  status text default 'new',
  created_at timestamptz default now()
);

-- indexes
create index if not exists idx_products_slug on public.products(slug);
create index if not exists idx_products_featured on public.products(is_featured);
create index if not exists idx_products_bestseller on public.products(is_bestseller);
create index if not exists idx_products_category on public.products(category_id);
create index if not exists idx_products_status on public.products(status);
create index if not exists idx_blog_slug on public.blog_posts(slug);
create index if not exists idx_blog_status on public.blog_posts(status);

-- ============ RLS ============
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.blog_posts enable row level security;
alter table public.testimonials enable row level security;
alter table public.site_settings enable row level security;
alter table public.inquiries enable row level security;

do $$ begin
  drop policy if exists "public read categories" on public.categories;
  drop policy if exists "public read products" on public.products;
  drop policy if exists "public read blog" on public.blog_posts;
  drop policy if exists "public read testimonials" on public.testimonials;
  drop policy if exists "public read settings" on public.site_settings;
  drop policy if exists "public insert inquiries" on public.inquiries;
  drop policy if exists "auth manage categories" on public.categories;
  drop policy if exists "auth manage products" on public.products;
  drop policy if exists "auth manage blog" on public.blog_posts;
  drop policy if exists "auth manage testimonials" on public.testimonials;
  drop policy if exists "auth manage settings" on public.site_settings;
  drop policy if exists "auth manage inquiries" on public.inquiries;
end $$;

create policy "public read categories" on public.categories for select to anon, authenticated using (true);
create policy "public read products" on public.products for select to anon, authenticated using (status = 'published');
create policy "public read blog" on public.blog_posts for select to anon, authenticated using (status = 'published');
create policy "public read testimonials" on public.testimonials for select to anon, authenticated using (true);
create policy "public read settings" on public.site_settings for select to anon, authenticated using (true);
create policy "public insert inquiries" on public.inquiries for insert to anon, authenticated with check (true);

-- Authenticated (admin) full manage
create policy "auth manage categories" on public.categories for all to authenticated using (true) with check (true);
create policy "auth manage products" on public.products for all to authenticated using (true) with check (true);
create policy "auth manage blog" on public.blog_posts for all to authenticated using (true) with check (true);
create policy "auth manage testimonials" on public.testimonials for all to authenticated using (true) with check (true);
create policy "auth manage settings" on public.site_settings for all to authenticated using (true) with check (true);
create policy "auth manage inquiries" on public.inquiries for all to authenticated using (true) with check (true);
