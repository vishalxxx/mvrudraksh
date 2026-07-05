"""
MV Rudraksh — Supabase schema bootstrap + seed script.
Run once locally to create tables, RLS policies, seed sample content, and create the admin user.

Usage:  cd /app/backend && python setup_supabase.py
"""
import os
import sys
from pathlib import Path
from dotenv import load_dotenv
from supabase import create_client
from supabase.lib.client_options import ClientOptions
import httpx

ROOT = Path(__file__).parent
load_dotenv(ROOT / ".env")

SUPABASE_URL = os.environ["SUPABASE_URL"]
SERVICE_KEY = os.environ["SUPABASE_SERVICE_ROLE_KEY"]
ADMIN_EMAIL = os.environ["ADMIN_EMAIL"]
ADMIN_PASSWORD = os.environ["ADMIN_PASSWORD"]

sb = create_client(SUPABASE_URL, SERVICE_KEY)

SCHEMA_SQL = r"""
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
"""


def run_sql(sql: str):
    """Execute raw SQL via Supabase REST — using the pg-meta endpoint."""
    url = f"{SUPABASE_URL}/rest/v1/rpc/exec_sql"
    headers = {
        "apikey": SERVICE_KEY,
        "Authorization": f"Bearer {SERVICE_KEY}",
        "Content-Type": "application/json",
    }
    r = httpx.post(url, headers=headers, json={"sql": sql}, timeout=60)
    if r.status_code >= 400:
        # Fallback: use pg-meta query endpoint (works on Supabase hosted)
        alt = f"{SUPABASE_URL}/pg/query"
        r2 = httpx.post(alt, headers=headers, json={"query": sql}, timeout=60)
        if r2.status_code >= 400:
            print("SQL exec via RPC & pg-meta both failed.")
            print("RPC:", r.status_code, r.text[:300])
            print("PG :", r2.status_code, r2.text[:300])
            print("\n>>> Please run the SQL manually in Supabase SQL Editor.")
            return False
    return True


def ensure_schema():
    """Try direct SQL via Postgres connection using psycopg if available."""
    try:
        import psycopg2  # type: ignore
    except ImportError:
        os.system("pip install psycopg2-binary >/dev/null 2>&1")
        import psycopg2  # type: ignore

    # Build DB URL from Supabase project ref
    project_ref = SUPABASE_URL.split("//")[1].split(".")[0]
    # Try pooler & direct
    conn_strs = [
        f"postgresql://postgres.{project_ref}:{os.environ.get('SUPABASE_DB_PASSWORD','')}@aws-0-us-east-1.pooler.supabase.com:6543/postgres",
    ]
    print("Attempting REST-based SQL exec first...")
    if run_sql(SCHEMA_SQL):
        return True
    print("REST failed. Please execute schema.sql in Supabase SQL Editor manually.")
    # Write schema to file for user
    (ROOT / "schema.sql").write_text(SCHEMA_SQL)
    print(f"Schema written to {ROOT / 'schema.sql'}")
    return False


def create_admin():
    try:
        res = sb.auth.admin.create_user({
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD,
            "email_confirm": True,
            "user_metadata": {"role": "admin", "name": "MV Rudraksh Admin"},
        })
        print("✅ Admin created:", ADMIN_EMAIL)
    except Exception as e:
        print("Admin creation:", str(e)[:200])


def seed():
    # Categories
    cats = [
        {"slug":"mukhi-rudraksha","name":"Mukhi Rudraksha","description":"Genuine Mukhi Rudraksha beads from Nepal & Java, certified for authenticity.","image_url":"https://images.unsplash.com/photo-1613274146063-8930e164c743?w=800","sort_order":1},
        {"slug":"rudraksha-mala","name":"Rudraksha Mala","description":"Handcrafted 108-bead malas for meditation and daily wear.","image_url":"https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800","sort_order":2},
        {"slug":"bracelets","name":"Bracelets","description":"Sacred Rudraksha bracelets combining spirituality with elegance.","image_url":"https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800","sort_order":3},
        {"slug":"combinations","name":"Combinations","description":"Powerful Rudraksha & gemstone combinations for specific purposes.","image_url":"https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=800","sort_order":4},
    ]
    for c in cats:
        sb.table("categories").upsert(c, on_conflict="slug").execute()
    cat_map = {c["slug"]: c for c in sb.table("categories").select("*").execute().data}

    # Products
    products = [
        {"slug":"5-mukhi-rudraksha-nepal","name":"5 Mukhi Rudraksha (Nepal)","sku":"MV-5M-NPL","category_id":cat_map["mukhi-rudraksha"]["id"],"mukhi":"5 Mukhi","origin":"Nepal","shape":"Round","size_mm":"18-20mm","weight_g":"2.5g","color":"Deep Brown","short_description":"Ruling deity Lord Shiva. Planet Jupiter. Enhances wisdom and inner peace.","description":"The 5 Mukhi Rudraksha is the most auspicious bead, representing Lord Kalagni Rudra. Sourced from the Himalayan foothills of Nepal, each bead is hand-selected for its perfect five-faced structure. Ideal for meditation, stress relief, and spiritual growth.","benefits":"Calms mind, reduces stress, enhances memory, promotes spiritual awakening, protects from negative energies.","wearing_method":"Energize with 108 recitations of 'Om Namah Shivaya' before wearing. Best worn on Monday morning after a bath.","mantra":"Om Hreem Namah","planet":"Jupiter","deity":"Kalagni Rudra","chakra":"Vishuddha (Throat)","purpose":"Peace, Meditation, Wisdom","material":"Certified Rudraksha","mrp":2999,"selling_price":1899,"discount_percent":37,"stock":25,"is_featured":True,"is_bestseller":True,"certification":"Lab Certified","images":[{"url":"https://images.unsplash.com/photo-1613274146063-8930e164c743?w=1200","alt":"5 Mukhi"}],"tags":["nepal","5-mukhi","meditation","peace"]},
        {"slug":"7-mukhi-rudraksha-java","name":"7 Mukhi Rudraksha (Java)","sku":"MV-7M-JVA","category_id":cat_map["mukhi-rudraksha"]["id"],"mukhi":"7 Mukhi","origin":"Java","shape":"Round","size_mm":"14-16mm","weight_g":"1.8g","color":"Reddish Brown","short_description":"Blessed by Goddess Mahalakshmi. Removes financial obstacles.","description":"The 7 Mukhi Rudraksha is blessed by Goddess Mahalakshmi and Sapta Matrikas. Sourced from Indonesian Java, this bead is known for attracting wealth, prosperity, and success in business.","benefits":"Attracts wealth, removes financial obstacles, enhances business luck, provides career growth.","mantra":"Om Hoom Namah","planet":"Saturn","deity":"Mahalakshmi","chakra":"Sahasrara","purpose":"Wealth, Prosperity","mrp":1499,"selling_price":999,"discount_percent":33,"stock":40,"is_featured":True,"is_new_arrival":True,"certification":"Lab Certified","images":[{"url":"https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=1200","alt":"7 Mukhi"}],"tags":["java","7-mukhi","wealth","lakshmi"]},
        {"slug":"rudraksha-mala-108","name":"108 Bead Rudraksha Mala","sku":"MV-MLA-108","category_id":cat_map["rudraksha-mala"]["id"],"mukhi":"5 Mukhi","origin":"Nepal","short_description":"Traditional 108-bead japa mala for daily chanting and meditation.","description":"Handcrafted 108-bead Rudraksha mala with a guru bead. Each bead is knotted with premium silk thread. Perfect for japa meditation and mantra chanting.","benefits":"Enhances concentration during meditation, spiritual protection, calms the mind.","mantra":"Om Namah Shivaya","planet":"Jupiter","deity":"Lord Shiva","chakra":"All","purpose":"Meditation, Japa","mrp":3999,"selling_price":2499,"discount_percent":38,"stock":15,"is_bestseller":True,"is_featured":True,"is_premium":True,"images":[{"url":"https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=1200","alt":"Mala"}],"tags":["mala","108","japa","meditation"]},
        {"slug":"1-mukhi-rudraksha-java","name":"1 Mukhi Rudraksha (Java)","sku":"MV-1M-JVA","category_id":cat_map["mukhi-rudraksha"]["id"],"mukhi":"1 Mukhi","origin":"Java","short_description":"Rarest bead. Direct blessing of Lord Shiva.","description":"The 1 Mukhi Rudraksha represents Lord Shiva himself. Extremely rare and powerful, it grants moksha (liberation) and highest spiritual attainment.","benefits":"Highest spiritual growth, meditation depth, liberation from worldly attachments.","mantra":"Om Hreem Namah","planet":"Sun","deity":"Lord Shiva","chakra":"Sahasrara","purpose":"Enlightenment","mrp":9999,"selling_price":7499,"discount_percent":25,"stock":5,"is_premium":True,"is_trending":True,"images":[{"url":"https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=1200","alt":"1 Mukhi"}],"tags":["1-mukhi","rare","premium","shiva"]},
        {"slug":"rudraksha-bracelet-brown","name":"Rudraksha Wrist Bracelet","sku":"MV-BR-01","category_id":cat_map["bracelets"]["id"],"mukhi":"5 Mukhi","origin":"Nepal","short_description":"Elegant 27-bead Rudraksha bracelet for daily wear.","description":"A refined Rudraksha bracelet featuring 27 hand-selected 5 Mukhi beads, strung on premium elastic. Comfortable and stylish for everyday wear.","benefits":"Continuous positive energy, stress relief, style and spirituality combined.","mantra":"Om Namah Shivaya","planet":"Jupiter","deity":"Shiva","chakra":"Anahata","purpose":"Daily Wear","mrp":1299,"selling_price":799,"discount_percent":39,"stock":50,"is_bestseller":True,"is_new_arrival":True,"images":[{"url":"https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=1200","alt":"Bracelet"}],"tags":["bracelet","daily","27-bead"]},
        {"slug":"gauri-shankar-rudraksha","name":"Gauri Shankar Rudraksha","sku":"MV-GS-01","category_id":cat_map["combinations"]["id"],"mukhi":"Gauri Shankar","origin":"Nepal","short_description":"Two naturally joined beads representing Shiva-Shakti union.","description":"The Gauri Shankar Rudraksha consists of two naturally joined Rudraksha beads. Symbolizing the eternal union of Lord Shiva and Goddess Parvati, it is highly recommended for harmony in relationships.","benefits":"Harmony in marriage, family unity, deeper love and understanding.","mantra":"Om Gauri Shankaraaya Namah","planet":"Moon","deity":"Shiva-Parvati","chakra":"Anahata","purpose":"Relationships","mrp":4999,"selling_price":3499,"discount_percent":30,"stock":10,"is_featured":True,"is_premium":True,"images":[{"url":"https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=1200","alt":"Gauri Shankar"}],"tags":["gauri-shankar","couple","relationships"]},
    ]
    for p in products:
        sb.table("products").upsert(p, on_conflict="slug").execute()

    # Blog posts
    blogs = [
        {"slug":"benefits-of-5-mukhi-rudraksha","title":"The Sacred Benefits of 5 Mukhi Rudraksha","excerpt":"Discover why the 5 Mukhi Rudraksha is considered the most auspicious bead for meditation and inner peace.","content":"<h2>Origin & Significance</h2><p>The 5 Mukhi Rudraksha is the most commonly worn bead, representing Lord Kalagni Rudra — a form of Lord Shiva. Sourced from the Himalayan foothills of Nepal, this bead has been revered for thousands of years.</p><h2>Spiritual Benefits</h2><p>Wearing a 5 Mukhi Rudraksha calms the mind, reduces stress, and enhances meditation depth. It's ideal for those beginning their spiritual journey.</p><h2>How to Wear</h2><p>Energize the bead with 108 chants of 'Om Namah Shivaya' before wearing. Best worn on Monday morning after a bath in pure water.</p>","featured_image":"https://images.unsplash.com/photo-1613274146063-8930e164c743?w=1600","author":"Acharya Vishnu","category":"Rudraksha Guide","tags":["5-mukhi","benefits","meditation"],"reading_time":5},
        {"slug":"how-to-identify-original-rudraksha","title":"How to Identify Original Rudraksha","excerpt":"Learn the traditional and modern methods to distinguish authentic Rudraksha from fake ones.","content":"<h2>The Water Test</h2><p>Authentic Rudraksha sinks in water due to its density. However, this is not conclusive alone.</p><h2>The Copper Coin Test</h2><p>Place the Rudraksha between two copper coins — it should rotate slightly due to its natural energy.</p><h2>X-Ray Certification</h2><p>The most reliable method is a laboratory X-ray test that confirms the internal Mukhi structure.</p>","featured_image":"https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=1600","author":"Pandit Sharma","category":"Buying Guide","tags":["authentic","guide"],"reading_time":6},
        {"slug":"rudraksha-and-planets","title":"Rudraksha & The Nine Planets","excerpt":"Each Mukhi Rudraksha is associated with a planet. Discover which bead suits your astrological chart.","content":"<h2>Introduction</h2><p>The relationship between Rudraksha and the nine planets (Navagraha) is a cornerstone of Vedic astrology and healing.</p><h2>Planetary Associations</h2><p>1 Mukhi → Sun, 2 Mukhi → Moon, 3 Mukhi → Mars, 4 Mukhi → Mercury, 5 Mukhi → Jupiter, 6 Mukhi → Venus, 7 Mukhi → Saturn, 8 Mukhi → Rahu, 9 Mukhi → Ketu.</p>","featured_image":"https://images.unsplash.com/photo-1639390167093-9c62311fe84d?w=1600","author":"Jyotish Guru","category":"Astrology","tags":["planets","astrology"],"reading_time":7},
    ]
    for b in blogs:
        sb.table("blog_posts").upsert(b, on_conflict="slug").execute()

    # Testimonials
    tests = [
        {"author_name":"Ananya Sharma","location":"Mumbai, India","content":"The authenticity and energy of the 5 Mukhi Rudraksha from MV Rudraksh is beyond words. My meditation practice has deepened significantly.","rating":5},
        {"author_name":"Rajesh Kumar","location":"Delhi, India","content":"Certified beads, transparent pricing, and beautiful packaging. MV Rudraksh has earned my trust for life.","rating":5},
        {"author_name":"Priya Menon","location":"Bangalore, India","content":"I ordered a Gauri Shankar Rudraksha and the difference in my family harmony is palpable. Highly recommended.","rating":5},
        {"author_name":"Dr. Arun Iyer","location":"Chennai, India","content":"As a spiritual practitioner, quality is non-negotiable. MV Rudraksh delivers museum-grade beads with authentic certification.","rating":5},
    ]
    sb.table("testimonials").delete().neq("id","00000000-0000-0000-0000-000000000000").execute()
    for t in tests:
        sb.table("testimonials").insert(t).execute()

    # Site settings
    settings = [
        {"key":"site","value":{"name":"MV Rudraksh","tagline":"Sacred Beads. Certified Purity.","logo":"","favicon":"","currency":"INR","currency_symbol":"₹"}},
        {"key":"contact","value":{"phone":"+91 98765 43210","whatsapp":"+91 98765 43210","email":"care@mvrudraksh.com","upi":"mvrudraksh@upi","address":"Rishikesh, Uttarakhand, India — 249201","hours":"Mon–Sat 10AM to 7PM IST","maps_url":""}},
        {"key":"social","value":{"instagram":"https://instagram.com/mvrudraksh","facebook":"","youtube":"","twitter":""}},
        {"key":"hero","value":{"title":"Sacred Beads. Certified Purity.","subtitle":"Handpicked Rudraksha from the Himalayas of Nepal and volcanic soils of Java — energised, certified, and worthy of your spiritual journey.","cta_text":"Explore Collection","cta_link":"/shop","background_image":"https://images.pexels.com/photos/37527354/pexels-photo-37527354.jpeg","overlay":"black/40"}},
        {"key":"announcement","value":{"enabled":True,"text":"Free shipping across India on orders above ₹1999 · WhatsApp us for personalised guidance"}},
        {"key":"footer","value":{"description":"MV Rudraksh brings you certified, authentic Rudraksha beads sourced directly from Nepal and Java, energised with vedic rituals.","copyright":"© 2026 MV Rudraksh · Handcrafted with reverence"}},
        {"key":"why_us","value":{"items":[
            {"icon":"BadgeCheck","title":"Lab Certified","desc":"Every bead X-ray verified for authentic Mukhi count."},
            {"icon":"Sparkles","title":"Ritually Energised","desc":"Consecrated with Vedic mantras before dispatch."},
            {"icon":"Mountain","title":"Himalayan Origin","desc":"Direct sourcing from Nepal & Java — no middlemen."},
            {"icon":"Heart","title":"Trusted by 10,000+","desc":"Sadhaks and seekers across 20+ countries."}
        ]}},
    ]
    for s in settings:
        sb.table("site_settings").upsert(s, on_conflict="key").execute()

    print("✅ Seed complete.")


if __name__ == "__main__":
    print("[1/3] Ensuring schema...")
    schema_ok = ensure_schema()
    if not schema_ok:
        print("Please run /app/backend/schema.sql in Supabase SQL Editor, then re-run this script.")
        sys.exit(1)
    print("[2/3] Creating admin user...")
    create_admin()
    print("[3/3] Seeding CMS content...")
    seed()
    print("\n🎉 Setup finished. Admin login:", ADMIN_EMAIL)
