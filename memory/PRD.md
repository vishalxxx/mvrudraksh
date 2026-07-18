# MV Rudraksh — PRD & Progress

## Original Problem Statement
Build a premium, SEO-optimised, fully dynamic Rudraksha e-commerce/catalog website (MV Rudraksh) + complete Admin CMS using React + Supabase + Cloudinary. Order flow via WhatsApp inquiry + UPI (no online payment gateway). Everything CMS-driven — nothing hardcoded.

## Architecture
- **Frontend**: React 19 (CRA), Tailwind, Shadcn UI, Framer Motion, React Router 7
- **Data + Auth**: Supabase (Postgres + RLS + Auth). Direct browser -> Supabase via `@supabase/supabase-js`
- **Media**: Cloudinary (unsigned upload preset `mv_rudraksh_upload`)
- **Design**: Ivory / Cream / Deep Brown / Copper / Gold. Cormorant Garamond + Outfit

## Personas
- Public visitor / seeker (browse, WhatsApp/UPI purchase)
- Admin / editor (full CMS control — no code, no redeploy)

## What's Implemented (2026-02-10)
- Removed "Made with Emergent" badge + emergent-main.js script from `frontend/public/index.html`; updated `<title>` (Helmet-driven) and static meta description now removed so Helmet is the sole source of truth
- Renamed admin URL from `/admin/*` to `/root-access-mvr/*` (App.js routes, AdminLayout nav LINKS, redirects, password-reset redirect target)
- Added "Admin Account" section inside Site Settings (`AdminSettings` in AdminPages.jsx) to change signed-in admin's email + password. Password change re-verifies current password via `signInWithPassword` before calling `supabase.auth.updateUser({ password })`.
- **SEO Boost**: Installed `react-helmet-async` + created `/src/components/Seo.jsx` with reusable `<Seo>` component + schema builders (`orgSchema`, `websiteSchema`, `breadcrumbSchema`, `productSchema`, `articleSchema`, `faqSchema`). App.js wrapped in `HelmetProvider` + global `<GlobalSeo>` emits Organization + WebSite JSON-LD on every page. Per-page `<Seo>` added to Home, Shop (with dynamic category-aware title), ProductDetail (Product schema + breadcrumbs), Categories, Journal, JournalPost (BlogPosting schema), About, Contact, FAQ (FAQPage schema), Privacy/Terms/Shipping/Returns policies, Sitemap, Search (noindex), 404 (noindex). `REACT_APP_SITE_URL` env drives canonical/OG absolute URLs.
- **Auto Sitemap**: Vercel serverless function at `/app/frontend/api/sitemap.xml.js` — queries Supabase for products, categories, and blog posts on every request, emits standards-compliant `sitemap.xml` with `lastmod`, `changefreq`, and `priority`. `vercel.json` rewrites `/sitemap.xml → /api/sitemap.xml`. `robots.txt` added at `frontend/public/robots.txt` with `Disallow: /root-access-mvr` + sitemap reference.
- **Inquiry Email Notifications**: Vercel serverless function at `/app/frontend/api/notify-inquiry.js` sends a branded HTML email via Gmail SMTP (nodemailer, port 465) to `NOTIFY_TO` whenever the frontend POSTs a new inquiry. React contact form calls it fire-and-forget after the Supabase insert (`/app/frontend/src/lib/notifyInquiry.js`). Serverless env: `GMAIL_USER=mvrudraksh@gmail.com`, `GMAIL_APP_PASSWORD=uyzmydrfpgvusgvw`, `NOTIFY_TO=mvrudraksh@gmail.com` (values captured in `.env.vercel`).
- `.env.vercel` template updated with all new server-side env vars (`GMAIL_*`, `NOTIFY_TO`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `PUBLIC_SITE_URL`, `REACT_APP_SITE_URL`).

## What's Implemented (2026-02-05)
### Public site
- Home (dynamic hero, categories bento, featured / best sellers / new arrivals, why-us, testimonials, journal preview, newsletter)
- Shop with advanced filters (Category / Mukhi / Origin / Price) + Sort + URL-driven state
- Product Detail (gallery, WhatsApp CTA, UPI copy, accordions: description/benefits/wearing/spiritual, related)
- Categories, Journal (list + HTML post), Search (products + journal)
- About, Contact (form -> Supabase inquiries), FAQ, Privacy, Terms, Shipping, Returns, Sitemap, 404
- Header (announcement bar, sticky nav, mobile menu, global search modal, social links) + Footer (dynamic)

### Admin CMS (/root-access-mvr)
- Supabase Auth login + forgot-password flow
- Dashboard (7 stat cards)
- Products CRUD (with Cloudinary image upload, all fields — mukhi, origin, mantra, planet, deity, chakra, etc., pricing, discount, stock, badges, SEO, tags, status)
- Categories CRUD, Journal CRUD (HTML content), Testimonials CRUD, Inquiries viewer
- Site Settings JSON editors (site, contact, hero, footer, why_us, social, announcement)
- Site Settings > Admin Account: change signed-in admin's email + password (current-password verified before password change)

### Backend
- One-off setup script `/app/backend/setup_supabase.py` seeded schema + admin + demo data
- Schema in `/app/backend/schema.sql` (pasted in Supabase SQL Editor by user)

## Seeded Content
- 4 categories, 6 products, 3 blog posts, 4 testimonials, 7 site_settings keys
- Admin: `admin@mvrudraksh.com` / `MvRudraksh@2026`

## Backlog (P1)
- Rich text editor (TipTap/Quill) for Journal (currently HTML textarea)
- Certificate PDF viewer on product page
- Wishlist / recently-viewed persistence
- SEO meta tags per route (react-helmet-async) + JSON-LD schema
- Auto sitemap.xml and robots.txt endpoints
- Admin: role-based access (Editor vs Super Admin), audit logs
- Video gallery + Instagram feed live integration
- Order Inquiry admin: mark contacted / converted
- Multi-currency (currently ₹ only)

## Known Notes
- Supabase DDL was applied by user manually via SQL Editor (Supabase REST doesn't allow DDL)
- Anon fetches sometimes double-fire due to React StrictMode dev only — no functional impact
