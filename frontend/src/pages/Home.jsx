import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, BadgeCheck, Sparkles, Mountain, Heart, Star } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useSite } from "@/lib/site";
import ProductCard from "@/components/ProductCard";

const ICONS = { BadgeCheck, Sparkles, Mountain, Heart };

export default function Home() {
  const { settings } = useSite();
  const [featured, setFeatured] = useState([]);
  const [best, setBest] = useState([]);
  const [newArr, setNewArr] = useState([]);
  const [cats, setCats] = useState([]);
  const [testis, setTestis] = useState([]);
  const [blogs, setBlogs] = useState([]);

  useEffect(() => {
    (async () => {
      const [{ data: f }, { data: b }, { data: n }, { data: c }, { data: t }, { data: bl }] = await Promise.all([
        supabase.from("products").select("*").eq("is_featured", true).limit(8),
        supabase.from("products").select("*").eq("is_bestseller", true).limit(4),
        supabase.from("products").select("*").eq("is_new_arrival", true).limit(4),
        supabase.from("categories").select("*").order("sort_order").limit(6),
        supabase.from("testimonials").select("*").eq("is_featured", true).limit(4),
        supabase.from("blog_posts").select("*").eq("status", "published").order("published_at", { ascending: false }).limit(3),
      ]);
      setFeatured(f || []); setBest(b || []); setNewArr(n || []); setCats(c || []); setTestis(t || []); setBlogs(bl || []);
    })();
  }, []);

  const hero = settings.hero || {};
  const why = settings.why_us?.items || [];

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden" style={{ minHeight: "82vh" }}>
        <img src={hero.background_image || "https://images.pexels.com/photos/37527354/pexels-photo-37527354.jpeg"} alt="Sacred" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(44,30,22,0.35), rgba(44,30,22,0.55))" }} />
        <div className="relative max-w-5xl mx-auto px-6 lg:px-10 py-32 lg:py-40 text-center">
          <div className="overline fade-up" style={{ color: "#F5D989" }}>Mystic Vibe Rudraksh</div>
          <h1 className="mt-6 font-serif-display text-5xl sm:text-6xl lg:text-7xl leading-[1.05] fade-up" style={{ color: "#FDFBF7" }}>{hero.title || "Sacred Beads. Certified Purity."}</h1>
          <p className="mt-8 max-w-2xl mx-auto text-base sm:text-lg font-light fade-up" style={{ color: "rgba(253,251,247,0.86)" }}>{hero.subtitle}</p>
          <div className="mt-10 flex flex-wrap justify-center gap-4 fade-up">
            <Link data-testid="hero-cta-shop" to={hero.cta_link || "/shop"} className="btn-primary">{hero.cta_text || "Explore Collection"} <ArrowRight size={16} className="ml-2"/></Link>
            <Link data-testid="hero-cta-journal" to="/journal" className="btn-secondary" style={{ background: "rgba(255,255,255,0.08)", color: "#FDFBF7", borderColor: "rgba(255,255,255,0.4)" }}>Read the Journal</Link>
          </div>
        </div>
      </section>

      {/* Categories bento */}
      <Section title="Featured Collections" overline="Curated" >
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {cats.slice(0,4).map((c, i) => (
            <Link key={c.id} to={`/shop?category=${c.slug}`} data-testid={`cat-${c.slug}`} className="group relative overflow-hidden rounded-md aspect-[3/2]">
              <img src={c.image_url} alt={c.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0" style={{ background: "linear-gradient(180deg,rgba(0,0,0,0),rgba(44,30,22,0.7))" }} />
              <div className="absolute bottom-0 left-0 p-6">
                <div className="overline" style={{ color: "#F5D989" }}>Collection</div>
                <div className="font-serif-display text-2xl mt-1" style={{ color: "#FDFBF7" }}>{c.name}</div>
              </div>
            </Link>
          ))}
        </div>
      </Section>

      {/* Featured products */}
      {featured.length > 0 && (
        <Section title="Featured Rudraksha" overline="Handpicked">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featured.slice(0,8).map((p) => <ProductCard key={p.id} p={p} />)}
          </div>
        </Section>
      )}

      {/* Why us */}
      <section className="py-24" style={{ background: "var(--cream)" }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="overline">Why MV Rudraksh</div>
            <h2 className="font-serif-display text-4xl sm:text-5xl mt-4" style={{ color: "var(--ink)" }}>Rooted in reverence. Backed by science.</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {why.map((w, i) => {
              const Ic = ICONS[w.icon] || BadgeCheck;
              return (
                <div key={i} className="p-8 bg-white rounded-md border" style={{ borderColor: "rgba(209,199,177,0.5)" }}>
                  <Ic size={28} style={{ color: "var(--copper)" }} />
                  <div className="mt-5 font-serif-display text-xl" style={{ color: "var(--ink)" }}>{w.title}</div>
                  <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--ink-2)" }}>{w.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Best Sellers */}
      {best.length > 0 && (
        <Section title="Best Sellers" overline="Loved by seekers">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">{best.map(p => <ProductCard key={p.id} p={p} />)}</div>
        </Section>
      )}

      {/* Testimonials */}
      <section className="relative py-28" style={{ background: "var(--ink)", color: "var(--ivory)" }}>
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="overline" style={{ color: "var(--gold)" }}>Voices of Devotees</div>
          <h2 className="font-serif-display text-4xl sm:text-5xl mt-4">Trusted by 10,000+ seekers</h2>
          <div className="grid md:grid-cols-2 gap-8 mt-16">
            {testis.map((t) => (
              <div key={t.id} className="p-8 rounded-md" style={{ background: "rgba(253,251,247,0.05)", border: "1px solid rgba(253,251,247,0.1)" }}>
                <div className="flex justify-center gap-1 mb-4">{Array.from({length:t.rating||5}).map((_,i)=><Star key={i} size={14} fill="#D4AF37" stroke="#D4AF37"/>)}</div>
                <p className="italic font-serif-display text-xl leading-relaxed">"{t.content}"</p>
                <div className="mt-6 text-xs uppercase tracking-widest" style={{ color: "var(--gold)" }}>{t.author_name} · {t.location}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Journal preview */}
      {blogs.length > 0 && (
        <Section title="From the Journal" overline="Wisdom & Guidance">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {blogs.map(b => (
              <Link key={b.id} to={`/journal/${b.slug}`} data-testid={`blog-card-${b.slug}`} className="group block rounded-md overflow-hidden" style={{ background: "var(--cream)" }}>
                <div className="aspect-[16/10] overflow-hidden"><img src={b.featured_image} alt={b.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"/></div>
                <div className="p-6">
                  <div className="overline">{b.category}</div>
                  <h3 className="font-serif-display text-2xl mt-2" style={{ color: "var(--ink)" }}>{b.title}</h3>
                  <p className="mt-2 text-sm" style={{ color: "var(--ink-2)" }}>{b.excerpt}</p>
                </div>
              </Link>
            ))}
          </div>
        </Section>
      )}

      {/* Newsletter */}
      <section className="py-24" style={{ background: "var(--cream)" }}>
        <div className="max-w-2xl mx-auto text-center px-6">
          <div className="overline">Newsletter</div>
          <h3 className="font-serif-display text-4xl mt-4" style={{ color: "var(--ink)" }}>Whispers from the Himalayas</h3>
          <p className="mt-3 text-sm" style={{ color: "var(--ink-2)" }}>Receive rare bead drops, mantras, and monthly guidance.</p>
          <form onSubmit={(e)=>{e.preventDefault();}} className="mt-8 flex gap-2 max-w-md mx-auto">
            <input data-testid="newsletter-email" type="email" required placeholder="Your email" className="flex-1 px-4 py-3 border rounded-md bg-white outline-none focus:border-[var(--copper)]" style={{ borderColor: "var(--line)" }}/>
            <button data-testid="newsletter-submit" className="btn-primary">Subscribe</button>
          </form>
        </div>
      </section>
    </div>
  );
}

function Section({ title, overline, children }) {
  return (
    <section className="py-14">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="flex items-end justify-between mb-8 gap-6 flex-wrap">
          <div>
            <div className="overline">{overline}</div>
            <h2 className="font-serif-display text-4xl sm:text-5xl mt-3" style={{ color: "var(--ink)" }}>{title}</h2>
          </div>
        </div>
        {children}
      </div>
    </section>
  );
}
