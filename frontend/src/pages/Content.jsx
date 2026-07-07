import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";

export function Categories() {
  const [cats, setCats] = useState([]);
  useEffect(() => { supabase.from("categories").select("*").order("sort_order").then(({data}) => setCats(data||[])); }, []);
  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-10 py-16">
      <div className="text-center mb-12">
        <div className="overline">Explore</div>
        <h1 className="font-serif-display text-5xl mt-3" style={{ color: "var(--ink)" }}>Categories</h1>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cats.map(c => (
          <Link to={`/shop?category=${c.slug}`} key={c.id} data-testid={`categories-${c.slug}`} className="group relative overflow-hidden rounded-md aspect-[2/1] sm:aspect-[16/9]">
            <img src={c.image_url} alt={c.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"/>
            <div className="absolute inset-0" style={{ background: "linear-gradient(180deg,rgba(0,0,0,0.1),rgba(44,30,22,0.75))" }}/>
            <div className="absolute bottom-0 left-0 p-6" style={{ color: "#FDFBF7" }}>
              <div className="overline" style={{ color: "#F5D989" }}>Collection</div>
              <h2 className="font-serif-display text-3xl">{c.name}</h2>
              <p className="text-sm mt-1 max-w-sm" style={{ color: "rgba(253,251,247,0.85)" }}>{c.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export function Journal() {
  const [posts, setPosts] = useState([]);
  useEffect(() => {
    supabase.from("blog_posts").select("*").eq("status","published").order("published_at",{ascending:false}).then(({data}) => setPosts(data||[]));
  }, []);
  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-10 py-16">
      <div className="text-center mb-16">
        <div className="overline">Wisdom · Guidance · Stories</div>
        <h1 className="font-serif-display text-5xl mt-3" style={{ color: "var(--ink)" }}>The Journal</h1>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {posts.map(b => (
          <Link key={b.id} to={`/journal/${b.slug}`} data-testid={`blog-card-${b.slug}`} className="group rounded-md overflow-hidden bg-white border" style={{ borderColor: "rgba(209,199,177,0.5)" }}>
            <div className="aspect-[16/10] overflow-hidden"><img src={b.featured_image} alt={b.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"/></div>
            <div className="p-6">
              <div className="overline">{b.category} · {b.reading_time || 5} min read</div>
              <h3 className="font-serif-display text-2xl mt-2" style={{ color: "var(--ink)" }}>{b.title}</h3>
              <p className="text-sm mt-2" style={{ color: "var(--ink-2)" }}>{b.excerpt}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export function JournalPost() {
  const { slug } = useParams();
  const [p, setP] = useState(null);
  useEffect(()=>{ supabase.from("blog_posts").select("*").eq("slug",slug).maybeSingle().then(({data})=>setP(data||null)); }, [slug]);
  if (!p) return <div className="p-24 text-center">Loading…</div>;
  return (
    <article className="max-w-3xl mx-auto px-6 py-16">
      <div className="overline">{p.category} · {p.reading_time || 5} min read</div>
      <h1 className="font-serif-display text-4xl sm:text-5xl mt-3" style={{ color: "var(--ink)" }}>{p.title}</h1>
      <div className="mt-3 text-sm" style={{ color: "var(--ink-2)" }}>{p.author && `By ${p.author}`}</div>
      {p.featured_image && <img src={p.featured_image} alt={p.title} className="w-full aspect-[16/9] object-cover rounded-md mt-8"/>}
      <div className="prose-mv mt-10" dangerouslySetInnerHTML={{ __html: p.content || "" }}/>
    </article>
  );
}
