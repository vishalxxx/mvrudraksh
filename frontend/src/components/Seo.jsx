import React from "react";
import { Helmet } from "react-helmet-async";

// Prefer a canonical production origin. Fallback to current origin so SEO works everywhere.
const originAtBuild =
  (typeof window !== "undefined" && window.location?.origin) ||
  process.env.REACT_APP_SITE_URL ||
  "";

const SITE_URL = (process.env.REACT_APP_SITE_URL || originAtBuild).replace(/\/$/, "");

const truncate = (s, n = 155) => {
  if (!s) return "";
  const clean = String(s).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  return clean.length > n ? clean.slice(0, n - 1).trimEnd() + "…" : clean;
};

export function absUrl(pathOrUrl = "") {
  if (!pathOrUrl) return SITE_URL;
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  return `${SITE_URL}${pathOrUrl.startsWith("/") ? "" : "/"}${pathOrUrl}`;
}

/**
 * Reusable SEO block for every page. Emits <title>, meta description,
 * canonical, Open Graph, Twitter tags, and any JSON-LD schemas passed in.
 */
export default function Seo({
  title,
  description,
  path = "",
  image,
  type = "website",
  siteName = "MV Rudraksh",
  jsonLd = null,
  noindex = false,
  keywords,
}) {
  const canonical = absUrl(path || (typeof window !== "undefined" ? window.location.pathname : ""));
  const desc = truncate(description);
  const fullTitle = title
    ? title.includes(siteName)
      ? title
      : `${title} · ${siteName}`
    : `${siteName} — Authentic Rudraksha & Spiritual Jewellery`;
  const ogImage = image ? absUrl(image) : undefined;
  const schemas = Array.isArray(jsonLd) ? jsonLd : jsonLd ? [jsonLd] : [];

  return (
    <Helmet prioritizeSeoTags>
      <title>{fullTitle}</title>
      {desc && <meta name="description" content={desc} />}
      {keywords && <meta name="keywords" content={keywords} />}
      {noindex ? <meta name="robots" content="noindex,nofollow" /> : <meta name="robots" content="index,follow" />}
      <link rel="canonical" href={canonical} />

      {/* Open Graph */}
      <meta property="og:site_name" content={siteName} />
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      {desc && <meta property="og:description" content={desc} />}
      <meta property="og:url" content={canonical} />
      {ogImage && <meta property="og:image" content={ogImage} />}

      {/* Twitter */}
      <meta name="twitter:card" content={ogImage ? "summary_large_image" : "summary"} />
      <meta name="twitter:title" content={fullTitle} />
      {desc && <meta name="twitter:description" content={desc} />}
      {ogImage && <meta name="twitter:image" content={ogImage} />}

      {schemas.map((s, i) => (
        <script key={i} type="application/ld+json">{JSON.stringify(s)}</script>
      ))}
    </Helmet>
  );
}

/* ------ Schema builders ------ */
export function orgSchema(settings = {}) {
  const site = settings.site || {};
  const contact = settings.contact || {};
  const social = settings.social || {};
  const sameAs = Object.values(social).filter(Boolean);
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: site.name || "MV Rudraksh",
    url: SITE_URL,
    logo: site.logo ? absUrl(site.logo) : undefined,
    email: contact.email || undefined,
    telephone: contact.phone || undefined,
    address: contact.address
      ? { "@type": "PostalAddress", streetAddress: contact.address }
      : undefined,
    sameAs: sameAs.length ? sameAs : undefined,
  };
}

export function websiteSchema(settings = {}) {
  const site = settings.site || {};
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: site.name || "MV Rudraksh",
    url: SITE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

export function breadcrumbSchema(items = []) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: absUrl(it.path),
    })),
  };
}

export function productSchema(p, settings = {}) {
  const site = settings.site || {};
  const img = (p.images && p.images[0]?.url) || undefined;
  const price = Number(p.selling_price || 0);
  const availability = (p.stock || 0) > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock";
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    sku: p.sku || undefined,
    description: truncate(p.short_description || p.description, 300),
    image: img ? [img] : undefined,
    brand: { "@type": "Brand", name: site.name || "MV Rudraksh" },
    category: p.categories?.name || undefined,
    offers: {
      "@type": "Offer",
      url: absUrl(`/product/${p.slug}`),
      priceCurrency: site.currency || "INR",
      price: price || undefined,
      availability,
      itemCondition: "https://schema.org/NewCondition",
    },
  };
}

export function articleSchema(post, settings = {}) {
  const site = settings.site || {};
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: truncate(post.excerpt || post.content, 300),
    image: post.featured_image ? [post.featured_image] : undefined,
    datePublished: post.published_at || post.created_at,
    dateModified: post.updated_at || post.published_at,
    author: post.author ? { "@type": "Person", name: post.author } : { "@type": "Organization", name: site.name || "MV Rudraksh" },
    publisher: {
      "@type": "Organization",
      name: site.name || "MV Rudraksh",
      logo: site.logo ? { "@type": "ImageObject", url: absUrl(site.logo) } : undefined,
    },
    mainEntityOfPage: absUrl(`/journal/${post.slug}`),
  };
}

export function faqSchema(items = []) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((it) => ({
      "@type": "Question",
      name: it.q,
      acceptedAnswer: { "@type": "Answer", text: it.a },
    })),
  };
}
