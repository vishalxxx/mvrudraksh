// Vercel Serverless Function — dynamic sitemap.xml built from Supabase content.
import { createClient } from "@supabase/supabase-js";

const STATIC_ROUTES = [
  { path: "/", priority: 1.0, changefreq: "daily" },
  { path: "/shop", priority: 0.9, changefreq: "daily" },
  { path: "/categories", priority: 0.8, changefreq: "weekly" },
  { path: "/journal", priority: 0.8, changefreq: "weekly" },
  { path: "/about", priority: 0.6, changefreq: "monthly" },
  { path: "/contact", priority: 0.6, changefreq: "monthly" },
  { path: "/faq", priority: 0.5, changefreq: "monthly" },
  { path: "/privacy", priority: 0.3, changefreq: "yearly" },
  { path: "/terms", priority: 0.3, changefreq: "yearly" },
  { path: "/shipping", priority: 0.3, changefreq: "yearly" },
  { path: "/returns", priority: 0.3, changefreq: "yearly" },
];

const xmlEscape = (s) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

export default async function handler(req, res) {
  const site = (process.env.PUBLIC_SITE_URL || `https://${req.headers.host}`).replace(/\/$/, "");
  const url = process.env.SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL;
  const anon = process.env.SUPABASE_ANON_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY;

  const entries = STATIC_ROUTES.map((r) => ({
    loc: `${site}${r.path}`,
    priority: r.priority,
    changefreq: r.changefreq,
  }));

  if (url && anon) {
    try {
      const supabase = createClient(url, anon, { auth: { persistSession: false } });
      const [{ data: products }, { data: cats }, { data: posts }] = await Promise.all([
        supabase.from("products").select("slug, updated_at, status").eq("status", "published"),
        supabase.from("categories").select("slug, updated_at"),
        supabase.from("blog_posts").select("slug, updated_at, published_at, status").eq("status", "published"),
      ]);
      (products || []).forEach((p) => entries.push({ loc: `${site}/product/${p.slug}`, lastmod: p.updated_at, priority: 0.8, changefreq: "weekly" }));
      (cats || []).forEach((c) => entries.push({ loc: `${site}/shop?category=${encodeURIComponent(c.slug)}`, lastmod: c.updated_at, priority: 0.7, changefreq: "weekly" }));
      (posts || []).forEach((p) => entries.push({ loc: `${site}/journal/${p.slug}`, lastmod: p.updated_at || p.published_at, priority: 0.6, changefreq: "monthly" }));
    } catch (e) {
      // fall through with static routes only
    }
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries
  .map(
    (e) =>
      `  <url>
    <loc>${xmlEscape(e.loc)}</loc>${e.lastmod ? `\n    <lastmod>${xmlEscape(e.lastmod)}</lastmod>` : ""}
    <changefreq>${e.changefreq}</changefreq>
    <priority>${e.priority}</priority>
  </url>`
  )
  .join("\n")}
</urlset>`;

  res.setHeader("Content-Type", "application/xml; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400");
  return res.status(200).send(xml);
}
