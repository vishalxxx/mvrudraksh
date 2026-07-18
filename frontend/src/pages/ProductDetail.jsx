import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useSite } from "@/lib/site";
import { money, productImage } from "@/lib/utils.helpers";
import { MessageCircle, Phone, ChevronRight, Copy, Check } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import Seo, { productSchema, breadcrumbSchema } from "@/components/Seo";

export default function ProductDetail() {
  const { slug } = useParams();
  const { settings } = useSite();
  const [p, setP] = useState(null);
  const [rel, setRel] = useState([]);
  const [mix, setMix] = useState([]);
  const [activeImg, setActiveImg] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("products").select("*, categories(slug,name)").eq("slug", slug).maybeSingle();
      setP(data || null);
      if (data?.category_id) {
        const { data: rl } = await supabase.from("products").select("*").eq("category_id", data.category_id).neq("id", data.id).limit(4);
        setRel(rl || []);
      }
      const { data: mx } = await supabase.from("products").select("*").neq("slug", slug).limit(20);
      // shuffle & take 4 across categories
      const byCat = {};
      (mx || []).forEach(pr => { const k = pr.category_id || "_"; (byCat[k] = byCat[k] || []).push(pr); });
      const picks = Object.values(byCat).map(arr => arr[Math.floor(Math.random()*arr.length)]).slice(0,4);
      setMix(picks);
      window.scrollTo(0, 0);
      setActiveImg(0);
    })();
  }, [slug]);

  if (!p) return <div className="max-w-6xl mx-auto px-6 py-24 text-center" style={{color:"var(--ink-2)"}}>Loading…</div>;

  const c = settings.contact || {};
  const sym = settings.site?.currency_symbol || "₹";
  const imgs = (p.images && p.images.length ? p.images : [{ url: productImage(p) }]);
  const savings = Number(p.mrp || 0) - Number(p.selling_price || 0);
  const waMsg = encodeURIComponent(`Hello MV Rudraksh, I'm interested in "${p.name}" (SKU: ${p.sku || "-"}). Please share more details.`);
  const waLink = c.whatsapp ? `https://wa.me/${c.whatsapp.replace(/\D/g,"")}?text=${waMsg}` : "#";

  const copyUpi = () => { navigator.clipboard.writeText(c.upi||""); setCopied(true); setTimeout(()=>setCopied(false), 1500); };

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-10 py-10">
      <Seo
        title={p.seo_title || (p.mukhi && !new RegExp(`\\b${p.mukhi}\\b.*mukhi`, "i").test(p.name) ? `${p.name} · ${p.mukhi} Mukhi` : p.name)}
        description={p.seo_description || p.short_description || p.description}
        path={`/product/${p.slug}`}
        type="product"
        image={imgs[0]?.url}
        keywords={[p.name, p.mukhi && `${p.mukhi} Mukhi`, p.origin, p.categories?.name, ...(Array.isArray(p.tags) ? p.tags : [])].filter(Boolean).join(", ")}
        jsonLd={[
          productSchema(p, settings),
          breadcrumbSchema([
            {name:"Home",path:"/"},
            {name:"Shop",path:"/shop"},
            ...(p.categories?.slug ? [{name:p.categories.name, path:`/shop?category=${p.categories.slug}`}] : []),
            {name:p.name, path:`/product/${p.slug}`},
          ]),
        ]}
      />
      <nav className="text-xs mb-8" style={{ color: "var(--ink-2)" }}>
        <Link to="/" className="hover:text-[var(--copper)]">Home</Link> <ChevronRight size={12} className="inline mx-1"/>
        <Link to="/shop" className="hover:text-[var(--copper)]">Shop</Link> <ChevronRight size={12} className="inline mx-1"/>
        <span>{p.name}</span>
      </nav>

      <div className="grid lg:grid-cols-[minmax(0,42%)_1fr] gap-12 items-start">
        {/* Gallery */}
        <div>
          <div className="rounded-md overflow-hidden aspect-[4/5] max-w-md mx-auto lg:max-w-none" style={{ background: "var(--cream)" }}>
            <img data-testid="pd-main-image" src={imgs[activeImg]?.url} alt={p.name} className="w-full h-full object-cover"/>
          </div>
          {imgs.length > 1 && (
            <div className="mt-4 grid grid-cols-5 gap-3">
              {imgs.map((im, i) => (
                <button key={i} onClick={()=>setActiveImg(i)} className={`aspect-square rounded-md overflow-hidden border ${activeImg===i?"":""}`} style={{ borderColor: activeImg===i ? "var(--copper)" : "var(--line)" }}>
                  <img src={im.url} alt="" className="w-full h-full object-cover"/>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          {p.mukhi && <div className="overline">{p.mukhi}{p.origin ? ` · ${p.origin}` : ""}</div>}
          <h1 className="font-serif-display text-4xl sm:text-5xl mt-3" style={{ color: "var(--ink)" }}>{p.name}</h1>
          {p.short_description && <p className="mt-4 text-base" style={{ color: "var(--ink-2)" }}>{p.short_description}</p>}

          <div className="flex items-baseline gap-3 mt-6">
            <span className="text-3xl font-medium" style={{ color: "var(--ink)" }}>{money(p.selling_price, sym)}</span>
            {Number(p.mrp) > Number(p.selling_price) && <span className="text-lg line-through" style={{ color: "var(--ink-2)" }}>{money(p.mrp, sym)}</span>}
            {p.discount_percent > 0 && <span className="text-xs px-2 py-1 rounded-sm" style={{ background: "var(--copper)", color: "white" }}>-{Math.round(p.discount_percent)}%</span>}
          </div>
          {savings > 0 && <div className="text-sm mt-1" style={{ color: "var(--copper)" }}>You save {money(savings, sym)}</div>}

          <div className="mt-6 space-y-1 text-sm" style={{ color: "var(--ink-2)" }}>
            {p.sku && <div><b>SKU:</b> {p.sku}</div>}
            {p.size_mm && <div><b>Size:</b> {p.size_mm}</div>}
            {p.weight_g && <div><b>Weight:</b> {p.weight_g}</div>}
            {p.certification && <div><b>Certification:</b> {p.certification}</div>}
            <div><b>Availability:</b> <span style={{color:p.stock>0?"var(--copper)":"#a00"}}>{p.stock>0 ? "In Stock" : "Out of Stock"}</span></div>
          </div>

          {/* CTAs */}
          <div className="mt-8 flex flex-wrap gap-3">
            <a data-testid="whatsapp-inquiry" href={waLink} target="_blank" rel="noreferrer" className="btn-primary" style={{ background: "#25D366" }}>
              <MessageCircle size={16} className="mr-2"/> WhatsApp to Order
            </a>
            {c.phone && <a data-testid="call-btn" href={`tel:${c.phone}`} className="btn-secondary"><Phone size={16} className="mr-2"/> Call {c.phone}</a>}
          </div>

          {/* UPI */}
          {c.upi && (
            <div className="mt-6 p-5 rounded-md border" style={{ borderColor: "var(--line)", background: "var(--cream)" }}>
              <div className="overline mb-2">UPI Payment</div>
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <div className="font-mono text-sm" style={{ color: "var(--ink)" }} data-testid="upi-id">{c.upi}</div>
                    <button onClick={copyUpi} data-testid="copy-upi" className="text-xs inline-flex items-center gap-1 px-3 py-1.5 rounded-sm border bg-white" style={{ borderColor: "var(--line)" }}>
                      {copied ? <><Check size={14}/> Copied</> : <><Copy size={14}/> Copy</>}
                    </button>
                  </div>
                  <p className="text-xs mt-2" style={{ color: "var(--ink-2)" }}>Pay via any UPI app, then share the transaction ID on WhatsApp for confirmation.</p>
                </div>
                <img
                  data-testid="upi-qr"
                  src={c.upi_qr || `https://api.qrserver.com/v1/create-qr-code/?size=180x180&margin=8&data=${encodeURIComponent(`upi://pay?pa=${c.upi}&pn=MV%20Rudraksh&am=${p.selling_price}&cu=INR&tn=${encodeURIComponent(p.name)}`)}`}
                  alt="UPI QR Code"
                  className="w-24 h-24 rounded-md bg-white p-1 border"
                  style={{borderColor:"var(--line)"}}
                />
              </div>
            </div>
          )}

          {/* Accordion sections */}
          <div className="mt-10 divide-y" style={{ borderColor: "var(--line)" }}>
            <Section title="Description">{p.description}</Section>
            <Section title="Benefits">{p.benefits}</Section>
            <Section title="Wearing Method & Mantra">
              {p.wearing_method && <p>{p.wearing_method}</p>}
              {p.mantra && <p className="mt-2 font-serif-display text-lg" style={{color:"var(--copper)"}}>{p.mantra}</p>}
            </Section>
            <Section title="Spiritual Details">
              {p.planet && <div><b>Planet:</b> {p.planet}</div>}
              {p.deity && <div><b>Deity:</b> {p.deity}</div>}
              {p.chakra && <div><b>Chakra:</b> {p.chakra}</div>}
              {p.purpose && <div><b>Purpose:</b> {p.purpose}</div>}
            </Section>
          </div>
        </div>
      </div>

      {/* Related */}
      {rel.length > 0 && (
        <div className="mt-20">
          <h2 className="font-serif-display text-3xl mb-8" style={{ color: "var(--ink)" }}>You may also love</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {rel.map(r => <ProductCard key={r.id} p={r} />)}
          </div>
        </div>
      )}

      {/* Mixed picks across categories */}
      {mix.length > 0 && (
        <div className="mt-16">
          <div className="overline">Explore More</div>
          <h2 className="font-serif-display text-3xl mt-2 mb-8" style={{ color: "var(--ink)" }}>Curated across collections</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {mix.map(r => <ProductCard key={r.id} p={r} />)}
          </div>
        </div>
      )}
    </div>
  );
}

function Section({ title, children }) {
  const [open, setOpen] = useState(true);
  if (!children) return null;
  return (
    <div className="py-5">
      <button onClick={()=>setOpen(v=>!v)} className="w-full flex items-center justify-between text-left">
        <span className="font-serif-display text-xl" style={{ color: "var(--ink)" }}>{title}</span>
        <span style={{ color: "var(--copper)" }}>{open ? "−" : "+"}</span>
      </button>
      {open && <div className="mt-3 text-sm space-y-1" style={{ color: "var(--ink-2)" }}>{children}</div>}
    </div>
  );
}
