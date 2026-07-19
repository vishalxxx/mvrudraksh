import React, { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import ProductCard from "@/components/ProductCard";
import { SlidersHorizontal, X } from "lucide-react";
import Seo, { breadcrumbSchema } from "@/components/Seo";

const SORTS = [
  { v: "newest", l: "Newest" },
  { v: "price_asc", l: "Price: Low → High" },
  { v: "price_desc", l: "Price: High → Low" },
  { v: "discount", l: "Highest Discount" },
  { v: "az", l: "Alphabetical" },
];

export default function Shop() {
  const [params, setParams] = useSearchParams();
  const [all, setAll] = useState([]);
  const [cats, setCats] = useState([]);
  const [sort, setSort] = useState(params.get("sort") || "newest");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [openFilter, setOpenFilter] = useState(false);

  const selectedCategory = params.get("category") || "";
  const selectedMukhi = params.get("mukhi") || "";
  const selectedOrigin = params.get("origin") || "";
  const selectedPC = params.get("pc") || "";
  const q = params.get("q") || "";

  useEffect(() => {
    (async () => {
      const [{ data: p }, { data: c }] = await Promise.all([
        supabase.from("products").select("*, categories(slug,name)"),
        supabase.from("categories").select("*").order("sort_order"),
      ]);
      setAll(p || []); setCats(c || []);
    })();
  }, []);

  const filtered = useMemo(() => {
    let list = [...all];
    if (selectedCategory) list = list.filter(p => p.categories?.slug === selectedCategory);
    if (selectedMukhi) list = list.filter(p => (p.mukhi || "").toLowerCase() === selectedMukhi.toLowerCase());
    if (selectedOrigin) list = list.filter(p => (p.origin || "").toLowerCase() === selectedOrigin.toLowerCase());
    if (selectedPC) list = list.filter(p => (p.collection || "").toLowerCase() === selectedPC.toLowerCase());
    if (minPrice) list = list.filter(p => Number(p.selling_price) >= Number(minPrice));
    if (maxPrice) list = list.filter(p => Number(p.selling_price) <= Number(maxPrice));
    if (q) {
      const s = q.toLowerCase();
      list = list.filter(p =>
        (p.name||"").toLowerCase().includes(s) ||
        (p.description||"").toLowerCase().includes(s) ||
        (p.mukhi||"").toLowerCase().includes(s) ||
        (p.tags||[]).join(" ").toLowerCase().includes(s)
      );
    }
    switch (sort) {
      case "price_asc": list.sort((a,b)=>Number(a.selling_price)-Number(b.selling_price)); break;
      case "price_desc": list.sort((a,b)=>Number(b.selling_price)-Number(a.selling_price)); break;
      case "discount": list.sort((a,b)=>Number(b.discount_percent)-Number(a.discount_percent)); break;
      case "az": list.sort((a,b)=>a.name.localeCompare(b.name)); break;
      default: list.sort((a,b)=>new Date(b.created_at)-new Date(a.created_at));
    }
    return list;
  }, [all, selectedCategory, selectedMukhi, selectedOrigin, selectedPC, minPrice, maxPrice, q, sort]);

  const catObj = useMemo(() => {
    return cats.find(c => c.slug === selectedCategory);
  }, [cats, selectedCategory]);

  const mukhis = [...new Set(all.map(p => p.mukhi).filter(Boolean))];
  const origins = [...new Set(all.map(p => p.origin).filter(Boolean))];
  const productCats = [...new Set(all.map(p => p.collection).filter(Boolean))];

  const setP = (key, val) => {
    const next = new URLSearchParams(params);
    if (val) next.set(key, val); else next.delete(key);
    setParams(next);
  };

  const activeChips = [
    selectedCategory && { k: "category", v: selectedCategory },
    selectedMukhi && { k: "mukhi", v: selectedMukhi },
    selectedOrigin && { k: "origin", v: selectedOrigin },
    selectedPC && { k: "pc", v: selectedPC },
    q && { k: "q", v: q },
  ].filter(Boolean);

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-10 py-16">
      <Seo
        title={selectedCategory ? `${cats.find(c=>c.slug===selectedCategory)?.name || "Rudraksha"} — Shop` : "Shop Authentic Rudraksha · Nepal & Java Beads"}
        description={selectedCategory
          ? `Browse our curated collection of ${cats.find(c=>c.slug===selectedCategory)?.name || "Rudraksha"} — certified, energised beads sourced directly from Nepal and Java.`
          : "Shop 1-Mukhi to 21-Mukhi Rudraksha, malas, and bracelets. Certified, energised, and shipped worldwide. Advanced filters by Mukhi, origin, price, and purpose."}
        path={selectedCategory ? `/shop?category=${selectedCategory}` : "/shop"}
        jsonLd={breadcrumbSchema([{name:"Home",path:"/"},{name:"Shop",path:"/shop"},...(selectedCategory ? [{name: cats.find(c=>c.slug===selectedCategory)?.name || selectedCategory, path:`/shop?category=${selectedCategory}`}] : [])])}
      />
      
      {catObj && (catObj.banner_url || catObj.image_url) ? (
        <div 
          className="relative w-full rounded-md overflow-hidden mb-12 aspect-[21/9] sm:aspect-[4/1] min-h-[160px] flex items-center justify-center text-center p-6 bg-cover bg-center" 
          style={{ backgroundImage: `url(${catObj.banner_url || catObj.image_url})` }}
          data-testid="category-banner"
        >
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[0.5px]" />
          <div className="relative z-10 text-white max-w-2xl">
            <div className="overline text-[#F5D989] tracking-[0.2em] mb-2">Collection</div>
            <h1 className="font-serif-display text-4xl sm:text-5xl lg:text-6xl text-[#FDFBF7] mb-3">{catObj.name}</h1>
            {catObj.description && <p className="text-sm sm:text-base font-light text-[#FDFBF7]/90">{catObj.description}</p>}
          </div>
        </div>
      ) : (
        <div className="text-center mb-12">
          <div className="overline">Sacred Catalog</div>
          <h1 className="font-serif-display text-5xl sm:text-6xl mt-3" style={{ color: "var(--ink)" }}>Shop Rudraksha</h1>
        </div>
      )}

      <div className="lg:grid lg:grid-cols-[280px_1fr] gap-10">
        {/* Sidebar */}
        <aside className={`${openFilter ? "block" : "hidden"} lg:block`}>
          <div className="lg:sticky lg:top-28 space-y-6 lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto lg:pr-2" data-testid="shop-filters">
            <FilterBlock title="Collection">
              {cats.map(c => (
                <FilterOption key={c.id} label={c.name} checked={selectedCategory===c.slug} onChange={()=>setP("category", selectedCategory===c.slug ? "" : c.slug)} testid={`filter-cat-${c.slug}`}/>
              ))}
            </FilterBlock>
            {productCats.length > 0 && (
              <FilterBlock title="Product Category">
                {productCats.map(pc => (
                  <FilterOption key={pc} label={pc} checked={selectedPC===pc} onChange={()=>setP("pc", selectedPC===pc ? "" : pc)} testid={`filter-pc-${pc.replace(/\s+/g,'-').toLowerCase()}`}/>
                ))}
              </FilterBlock>
            )}
            <FilterBlock title="Mukhi">
              {mukhis.map(m => (
                <FilterOption key={m} label={m} checked={selectedMukhi===m} onChange={()=>setP("mukhi", selectedMukhi===m ? "" : m)} testid={`filter-mukhi-${m.replace(/\s+/g,'-').toLowerCase()}`}/>
              ))}
            </FilterBlock>
            <FilterBlock title="Origin">
              {origins.map(o => (
                <FilterOption key={o} label={o} checked={selectedOrigin===o} onChange={()=>setP("origin", selectedOrigin===o ? "" : o)} testid={`filter-origin-${o.toLowerCase()}`}/>
              ))}
            </FilterBlock>
            <FilterBlock title="Price">
              <div className="flex gap-2">
                <input value={minPrice} onChange={(e)=>setMinPrice(e.target.value)} placeholder="Min" type="number" className="w-full px-3 py-2 border rounded-md bg-white outline-none text-sm" style={{ borderColor: "var(--line)" }} data-testid="filter-min-price"/>
                <input value={maxPrice} onChange={(e)=>setMaxPrice(e.target.value)} placeholder="Max" type="number" className="w-full px-3 py-2 border rounded-md bg-white outline-none text-sm" style={{ borderColor: "var(--line)" }} data-testid="filter-max-price"/>
              </div>
            </FilterBlock>
          </div>
        </aside>

        {/* Products */}
        <div className="min-h-[80vh]">
          <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
            <button className="lg:hidden inline-flex items-center gap-2 px-4 py-2 rounded-md border" style={{ borderColor: "var(--line)" }} onClick={()=>setOpenFilter(v=>!v)} data-testid="mobile-filter-btn">
              <SlidersHorizontal size={16}/> Filters
            </button>
            <div className="text-sm" style={{ color: "var(--ink-2)" }}>{filtered.length} products</div>
            <select value={sort} onChange={(e)=>setSort(e.target.value)} className="px-3 py-2 border rounded-md bg-white text-sm" style={{ borderColor: "var(--line)" }} data-testid="sort-select">
              {SORTS.map(s => <option key={s.v} value={s.v}>{s.l}</option>)}
            </select>
          </div>
          {activeChips.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {activeChips.map(c => (
                <button key={c.k} onClick={()=>setP(c.k,"")} className="inline-flex items-center gap-2 px-3 py-1 rounded-sm text-xs" style={{ background: "var(--cream)", color: "var(--ink)" }}>
                  {c.v} <X size={12}/>
                </button>
              ))}
            </div>
          )}
          {filtered.length === 0 ? (
            <div className="py-24 text-center" style={{ color: "var(--ink-2)" }}>No products match your filters.</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filtered.map(p => <ProductCard key={p.id} p={p} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FilterBlock({ title, children }) {
  return (
    <div>
      <div className="overline mb-3">{title}</div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}
function FilterOption({ label, checked, onChange, testid }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer text-sm" style={{ color: "var(--ink-2)" }}>
      <input data-testid={testid} type="checkbox" checked={checked} onChange={onChange} className="accent-[var(--copper)]"/>
      {label}
    </label>
  );
}
