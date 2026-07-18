import React, { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useSite } from "@/lib/site";
import { Mail, Phone, MapPin, MessageCircle } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import Seo, { breadcrumbSchema, faqSchema } from "@/components/Seo";
import { notifyInquiry } from "@/lib/notifyInquiry";

export function About() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-20">
      <Seo
        title="About MV Rudraksh · A Legacy of Purity"
        description="MV Rudraksh sources certified, energised Rudraksha directly from Nepal and Java. Every bead is X-ray tested, lab certified, and ritually consecrated before dispatch."
        path="/about"
        jsonLd={breadcrumbSchema([{name:"Home",path:"/"},{name:"About",path:"/about"}])}
      />
      <div className="text-center mb-10">
        <div className="overline">About</div>
        <h1 className="font-serif-display text-5xl mt-3" style={{ color: "var(--ink)" }}>MV Rudraksh — A Legacy of Purity</h1>
      </div>
      <img src="https://images.pexels.com/photos/28828566/pexels-photo-28828566.jpeg" alt="Temple" className="w-full aspect-[16/9] object-cover rounded-md"/>
      <div className="prose-mv mt-10">
        <p>Mystic Vibe Rudraksh is a sanctuary for seekers, curated by devotees for devotees. Every bead we deliver has been sourced directly from the Himalayan foothills of Nepal and the volcanic soils of Java — regions revered for producing the most potent Rudraksha in the world.</p>
        <h2>Our Sacred Sourcing</h2>
        <p>We work with third-generation cultivators who honour ancient traditions. Each bead is inspected, X-ray tested, and lab certified before ever reaching your hands.</p>
        <h2>Ritual Energisation</h2>
        <p>Before dispatch, every Rudraksha is consecrated at our in-house shrine with 108 recitations of the Mahamrityunjaya mantra, activating its subtle energies.</p>
        <h2>A Promise of Authenticity</h2>
        <p>If you ever have doubts about your bead, we welcome you to visit our lab, meet our acharyas, or simply return your purchase — no questions asked.</p>
      </div>
    </div>
  );
}

export function Contact() {
  const { settings } = useSite();
  const c = settings.contact || {};
  const [form, setForm] = useState({ name:"", email:"", phone:"", message:"" });
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    const { error } = await supabase.from("inquiries").insert({ ...form, type: "contact" });
    if (error) { setErr(error.message); return; }
    // Fire-and-forget email notification (only works on Vercel where /api/notify-inquiry exists).
    notifyInquiry({ ...form, type: "contact" });
    setSent(true);
    setForm({name:"",email:"",phone:"",message:""});
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-20">
      <Seo
        title="Contact MV Rudraksh"
        description="Speak to our acharyas about the right Rudraksha for you. Reach us via WhatsApp, phone, email, or send an inquiry — we respond within a day."
        path="/contact"
        jsonLd={breadcrumbSchema([{name:"Home",path:"/"},{name:"Contact",path:"/contact"}])}
      />
      <div className="text-center mb-14">
        <div className="overline">Reach Us</div>
        <h1 className="font-serif-display text-5xl mt-3" style={{ color: "var(--ink)" }}>Contact MV Rudraksh</h1>
      </div>
      <div className="grid md:grid-cols-2 gap-12">
        <div>
          <ul className="space-y-4" style={{ color: "var(--ink-2)" }}>
            {c.phone && <li className="flex items-start gap-3"><Phone size={16} className="mt-1 text-[var(--copper)]"/><div><b>Phone</b><br/>{c.phone}</div></li>}
            {c.whatsapp && <li className="flex items-start gap-3"><MessageCircle size={16} className="mt-1 text-[var(--copper)]"/><div><b>WhatsApp</b><br/>{c.whatsapp}</div></li>}
            {c.email && <li className="flex items-start gap-3"><Mail size={16} className="mt-1 text-[var(--copper)]"/><div><b>Email</b><br/>{c.email}</div></li>}
            {c.address && <li className="flex items-start gap-3"><MapPin size={16} className="mt-1 text-[var(--copper)]"/><div><b>Address</b><br/>{c.address}</div></li>}
          </ul>
          {c.hours && <div className="mt-8 p-5 rounded-md" style={{background:"var(--cream)"}}><div className="overline mb-1">Business Hours</div><div>{c.hours}</div></div>}
        </div>
        <form onSubmit={submit} className="p-8 rounded-md bg-white border" style={{ borderColor: "var(--line)" }} data-testid="contact-form">
          <div className="grid grid-cols-2 gap-4">
            <input required value={form.name} onChange={(e)=>setForm({...form, name:e.target.value})} placeholder="Full Name" className="px-4 py-3 border rounded-md text-sm outline-none" style={{ borderColor:"var(--line)" }} data-testid="contact-name"/>
            <input required type="email" value={form.email} onChange={(e)=>setForm({...form, email:e.target.value})} placeholder="Email" className="px-4 py-3 border rounded-md text-sm outline-none" style={{ borderColor:"var(--line)" }} data-testid="contact-email"/>
          </div>
          <input value={form.phone} onChange={(e)=>setForm({...form, phone:e.target.value})} placeholder="Phone / WhatsApp" className="mt-4 w-full px-4 py-3 border rounded-md text-sm outline-none" style={{ borderColor:"var(--line)" }} data-testid="contact-phone"/>
          <textarea required rows={5} value={form.message} onChange={(e)=>setForm({...form, message:e.target.value})} placeholder="Your message" className="mt-4 w-full px-4 py-3 border rounded-md text-sm outline-none" style={{ borderColor:"var(--line)" }} data-testid="contact-message"/>
          <button className="mt-5 btn-primary w-full" data-testid="contact-submit">Send Inquiry</button>
          {sent && <div className="mt-4 text-sm" style={{ color: "var(--copper)" }}>Thank you. We will reach out shortly.</div>}
          {err && <div className="mt-4 text-sm text-red-600">{err}</div>}
        </form>
      </div>
    </div>
  );
}

export function FAQ() {
  const items = [
    { q: "Are your Rudraksha certified?", a: "Yes — every bead is X-ray verified and comes with a certificate of authenticity." },
    { q: "How do I choose the right Mukhi?", a: "Consult our journal or WhatsApp our acharyas for personalised guidance based on your goals." },
    { q: "Do you ship internationally?", a: "Yes, we ship worldwide. Contact us on WhatsApp for shipping timelines." },
    { q: "What is your return policy?", a: "We accept returns within 7 days of delivery if the bead is unused and in original packaging." },
    { q: "How do I pay?", a: "Order via WhatsApp or pay directly to our UPI ID. We don't currently support card payments." },
  ];
  return (
    <div className="max-w-3xl mx-auto px-6 py-20">
      <Seo
        title="Rudraksha FAQ · Certification, Shipping, Payment"
        description="Answers to the most common Rudraksha questions — certification, choosing the right Mukhi, worldwide shipping, returns, and payment via UPI/WhatsApp."
        path="/faq"
        jsonLd={[faqSchema(items), breadcrumbSchema([{name:"Home",path:"/"},{name:"FAQ",path:"/faq"}])]}
      />
      <div className="text-center mb-10">
        <div className="overline">Frequently Asked</div>
        <h1 className="font-serif-display text-5xl mt-3" style={{ color: "var(--ink)" }}>FAQ</h1>
      </div>
      <div className="divide-y" style={{ borderColor: "var(--line)" }}>
        {items.map((it, i) => (
          <details key={i} className="py-6 group">
            <summary className="cursor-pointer font-serif-display text-xl flex justify-between items-center" style={{ color: "var(--ink)" }}>{it.q}<span className="text-[var(--copper)]">+</span></summary>
            <p className="mt-3 text-sm" style={{ color: "var(--ink-2)" }}>{it.a}</p>
          </details>
        ))}
      </div>
    </div>
  );
}

function PolicyPage({ title, path, description, children }) {
  return (
    <div className="max-w-3xl mx-auto px-6 py-20">
      <Seo title={title} description={description} path={path} jsonLd={breadcrumbSchema([{name:"Home",path:"/"},{name:title,path}])} />
      <div className="text-center mb-10">
        <div className="overline">Legal</div>
        <h1 className="font-serif-display text-5xl mt-3" style={{ color: "var(--ink)" }}>{title}</h1>
      </div>
      <div className="prose-mv">{children}</div>
    </div>
  );
}

export const Privacy = () => (
  <PolicyPage title="Privacy Policy" path="/privacy" description="How MV Rudraksh collects, uses, and protects your personal information.">
    <p>MV Rudraksh respects your privacy. We collect only the information necessary to process your inquiry and provide our services.</p>
    <h2>Information We Collect</h2><p>Name, email, phone number, and delivery address when you contact or purchase.</p>
    <h2>How We Use It</h2><p>Only to fulfil orders, share updates, and improve your experience — never sold to third parties.</p>
  </PolicyPage>
);
export const Terms = () => (
  <PolicyPage title="Terms & Conditions" path="/terms" description="MV Rudraksh terms of service — product warranty, dispute resolution, and site usage.">
    <p>By using our website you agree to these terms. All products are sold on an as-is basis with the guarantees stated on the product page.</p>
  </PolicyPage>
);
export const Shipping = () => (
  <PolicyPage title="Shipping Policy" path="/shipping" description="Domestic and international shipping timelines for MV Rudraksh orders.">
    <p>We ship within 24-48 hours across India. International shipping timelines vary.</p>
  </PolicyPage>
);
export const Returns = () => (
  <PolicyPage title="Return Policy" path="/returns" description="7-day return window for unused, unopened Rudraksha products.">
    <p>7-day returns for unused, unopened products. Contact us on WhatsApp to initiate a return.</p>
  </PolicyPage>
);

export function Sitemap() {
  const [products, setProducts] = useState([]);
  const [posts, setPosts] = useState([]);
  const [cats, setCats] = useState([]);
  useEffect(() => {
    supabase.from("products").select("slug,name").then(({data})=>setProducts(data||[]));
    supabase.from("blog_posts").select("slug,title").then(({data})=>setPosts(data||[]));
    supabase.from("categories").select("slug,name").then(({data})=>setCats(data||[]));
  }, []);
  return (
    <div className="max-w-4xl mx-auto px-6 py-20">
      <Seo title="Sitemap" description="Full sitemap of MV Rudraksh — pages, products, and journal." path="/sitemap"/>
      <h1 className="font-serif-display text-4xl mb-8" style={{color:"var(--ink)"}}>Sitemap</h1>
      <div className="grid md:grid-cols-3 gap-8 text-sm" style={{color:"var(--ink-2)"}}>
        <div><div className="overline mb-3">Pages</div>{["/","/shop","/about","/contact","/faq","/journal"].map(p=><div key={p}><Link className="hover:text-[var(--copper)]" to={p}>{p}</Link></div>)}</div>
        <div><div className="overline mb-3">Products</div>{products.map(p=><div key={p.slug}><Link className="hover:text-[var(--copper)]" to={`/product/${p.slug}`}>{p.name}</Link></div>)}</div>
        <div><div className="overline mb-3">Journal</div>{posts.map(p=><div key={p.slug}><Link className="hover:text-[var(--copper)]" to={`/journal/${p.slug}`}>{p.title}</Link></div>)}</div>
      </div>
    </div>
  );
}

export function SearchPage() {
  const [sp] = useSearchParams();
  const q = sp.get("q") || "";
  const [prods, setProds] = useState([]);
  const [blogs, setBlogs] = useState([]);
  useEffect(() => {
    if (!q) return;
    supabase.from("products").select("*").or(`name.ilike.%${q}%,description.ilike.%${q}%,mukhi.ilike.%${q}%`).then(({data})=>setProds(data||[]));
    supabase.from("blog_posts").select("*").eq("status","published").or(`title.ilike.%${q}%,excerpt.ilike.%${q}%,content.ilike.%${q}%`).then(({data})=>setBlogs(data||[]));
  }, [q]);
  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      <Seo title={q ? `Search: ${q}` : "Search"} description={`Search results for "${q}" on MV Rudraksh — Rudraksha products and journal articles.`} path="/search" noindex/>
      <div className="overline">Search results for</div>
      <h1 className="font-serif-display text-4xl mt-2" style={{color:"var(--ink)"}}>"{q}"</h1>
      <h2 className="font-serif-display text-2xl mt-10 mb-4" style={{color:"var(--ink)"}}>Products ({prods.length})</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">{prods.map(p=><ProductCard key={p.id} p={p}/>)}</div>
      <h2 className="font-serif-display text-2xl mt-14 mb-4" style={{color:"var(--ink)"}}>Journal ({blogs.length})</h2>
      <ul className="space-y-3">{blogs.map(b=><li key={b.id}><Link to={`/journal/${b.slug}`} className="hover:text-[var(--copper)]">{b.title}</Link></li>)}</ul>
    </div>
  );
}

export function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-6">
      <div className="text-center">
        <div className="overline">404</div>
        <h1 className="font-serif-display text-6xl mt-3" style={{color:"var(--ink)"}}>Page not found</h1>
        <p className="mt-3" style={{color:"var(--ink-2)"}}>The page you seek has been dissolved into the aether.</p>
        <Link to="/" className="btn-primary inline-flex mt-8">Return Home</Link>
      </div>
    </div>
  );
}
