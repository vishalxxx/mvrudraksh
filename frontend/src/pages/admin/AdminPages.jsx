import React, { useEffect, useState } from "react";
import { supabase, uploadToCloudinary } from "@/lib/supabase";
import { Package, Layers, FileText, MessageSquare, Star, Sparkles, Inbox } from "lucide-react";
import { Link } from "react-router-dom";
import { productImage, slugify, money } from "@/lib/utils.helpers";

export function Dashboard() {
  const [stats, setStats] = useState({});
  useEffect(() => {
    (async () => {
      const [p, c, b, t, i, feat, oos] = await Promise.all([
        supabase.from("products").select("id", { count: "exact", head: true }),
        supabase.from("categories").select("id", { count: "exact", head: true }),
        supabase.from("blog_posts").select("id", { count: "exact", head: true }),
        supabase.from("testimonials").select("id", { count: "exact", head: true }),
        supabase.from("inquiries").select("id", { count: "exact", head: true }),
        supabase.from("products").select("id", { count: "exact", head: true }).eq("is_featured", true),
        supabase.from("products").select("id", { count: "exact", head: true }).eq("stock", 0),
      ]);
      setStats({ products: p.count, categories: c.count, blogs: b.count, testimonials: t.count, inquiries: i.count, featured: feat.count, oos: oos.count });
    })();
  }, []);
  const cards = [
    { k:"products", label:"Total Products", icon:Package, color:"var(--copper)" },
    { k:"categories", label:"Categories", icon:Layers, color:"var(--gold)" },
    { k:"blogs", label:"Journal Posts", icon:FileText, color:"var(--ink)" },
    { k:"testimonials", label:"Testimonials", icon:MessageSquare, color:"var(--copper)" },
    { k:"featured", label:"Featured", icon:Star, color:"var(--gold)" },
    { k:"oos", label:"Out of Stock", icon:Sparkles, color:"#a00" },
    { k:"inquiries", label:"Inquiries", icon:Inbox, color:"var(--copper)" },
  ];
  return (
    <div>
      <h1 className="font-serif-display text-4xl mb-8" style={{color:"var(--ink)"}}>Dashboard</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map(c => (
          <div key={c.k} data-testid={`stat-${c.k}`} className="p-6 bg-white rounded-md border" style={{borderColor:"var(--line)"}}>
            <c.icon size={20} style={{color:c.color}}/>
            <div className="mt-3 text-3xl font-medium" style={{color:"var(--ink)"}}>{stats[c.k] ?? "…"}</div>
            <div className="text-xs uppercase tracking-wider mt-1" style={{color:"var(--ink-2)"}}>{c.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Generic CRUD for products
export function AdminProducts() {
  const [rows, setRows] = useState([]);
  const [editing, setEditing] = useState(null);
  const [busy, setBusy] = useState(false);
  const load = async () => { const {data} = await supabase.from("products").select("*").order("created_at",{ascending:false}); setRows(data||[]); };
  useEffect(() => { load(); }, []);

  const del = async (id) => { if(!window.confirm("Delete this product?")) return; await supabase.from("products").delete().eq("id",id); load(); };
  const dup = async (p) => {
    const { id, created_at, updated_at, published_at, categories, ...rest } = p;
    await supabase.from("products").insert({ ...rest, slug: `${p.slug}-copy-${Date.now()}`, name: `${p.name} (Copy)` });
    load();
  };

  if (editing) return <ProductForm product={editing} onDone={() => { setEditing(null); load(); }} onCancel={()=>setEditing(null)}/>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-serif-display text-4xl" style={{color:"var(--ink)"}}>Products</h1>
        <button data-testid="new-product-btn" className="btn-primary" onClick={()=>setEditing({})}>+ New Product</button>
      </div>
      <div className="bg-white rounded-md border overflow-hidden" style={{borderColor:"var(--line)"}}>
        <table className="w-full text-sm">
          <thead style={{background:"var(--cream)"}}><tr>
            <th className="text-left p-3">Image</th><th className="text-left p-3">Name</th><th className="text-left p-3">Mukhi</th><th className="text-left p-3">Price</th><th className="text-left p-3">Stock</th><th className="text-left p-3">Status</th><th className="p-3"></th>
          </tr></thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.id} className="border-t" style={{borderColor:"var(--line)"}}>
                <td className="p-3"><img src={productImage(r)} alt="" className="w-14 h-14 rounded-md object-cover"/></td>
                <td className="p-3 font-medium" style={{color:"var(--ink)"}}>{r.name}<div className="text-xs" style={{color:"var(--ink-2)"}}>{r.slug}</div></td>
                <td className="p-3">{r.mukhi}</td>
                <td className="p-3">{money(r.selling_price)}</td>
                <td className="p-3">{r.stock}</td>
                <td className="p-3"><span className="text-xs px-2 py-1 rounded-sm" style={{background:r.status==="published"?"var(--copper)":"var(--line)", color:"white"}}>{r.status}</span></td>
                <td className="p-3 text-right whitespace-nowrap">
                  <button onClick={()=>setEditing(r)} className="text-xs px-2 py-1 hover:text-[var(--copper)]" data-testid={`edit-${r.slug}`}>Edit</button>
                  <button onClick={()=>dup(r)} className="text-xs px-2 py-1 hover:text-[var(--copper)]">Duplicate</button>
                  <button onClick={()=>del(r.id)} className="text-xs px-2 py-1 text-red-600">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ProductForm({ product, onDone, onCancel }) {
  const [f, setF] = useState({
    name:"", slug:"", sku:"", mukhi:"", origin:"", size_mm:"", weight_g:"", color:"", description:"", short_description:"",
    benefits:"", wearing_method:"", mantra:"", planet:"", deity:"", chakra:"", purpose:"", material:"", certification:"",
    mrp:0, selling_price:0, discount_percent:0, stock:1, is_featured:false, is_bestseller:false, is_new_arrival:false,
    is_premium:false, is_trending:false, status:"published", images:[], tags:[], seo_title:"", seo_description:"",
    ...product,
  });
  const [busy, setBusy] = useState(false);
  const [cats, setCats] = useState([]);
  useEffect(() => { supabase.from("categories").select("*").then(({data})=>setCats(data||[])); }, []);

  const set = (k, v) => setF(prev => ({...prev, [k]: v}));

  const upload = async (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    setBusy(true);
    try {
      const r = await uploadToCloudinary(file);
      set("images", [...(f.images||[]), { url: r.secure_url, public_id: r.public_id }]);
    } catch (err) { alert("Upload failed: " + err.message); }
    setBusy(false);
  };
  const removeImg = (i) => set("images", f.images.filter((_,idx)=>idx!==i));

  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    const payload = { ...f };
    if (!payload.slug) payload.slug = slugify(payload.name);
    if (typeof payload.tags === "string") payload.tags = payload.tags.split(",").map(s=>s.trim()).filter(Boolean);
    delete payload.categories;
    ["mrp","selling_price","cost_price","discount_percent","stock"].forEach(k => payload[k] = Number(payload[k]||0));
    const { error } = payload.id ? await supabase.from("products").update(payload).eq("id", payload.id) : await supabase.from("products").insert(payload);
    setBusy(false);
    if (error) alert(error.message); else onDone();
  };

  return (
    <form onSubmit={save} className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-serif-display text-3xl" style={{color:"var(--ink)"}}>{f.id ? "Edit Product" : "New Product"}</h1>
        <div className="flex gap-2"><button type="button" onClick={onCancel} className="btn-secondary">Cancel</button><button disabled={busy} className="btn-primary" data-testid="save-product">{busy?"Saving…":"Save"}</button></div>
      </div>
      <div className="bg-white p-6 rounded-md border space-y-4" style={{borderColor:"var(--line)"}}>
        <Grid>
          <Input label="Name" value={f.name} onChange={v=>set("name",v)} required testid="pf-name"/>
          <Input label="Slug" value={f.slug} onChange={v=>set("slug",v)} placeholder="auto"/>
          <Input label="SKU" value={f.sku} onChange={v=>set("sku",v)}/>
          <Select label="Category" value={f.category_id||""} onChange={v=>set("category_id",v||null)} options={[{v:"",l:"—"}].concat(cats.map(c=>({v:c.id, l:c.name})))}/>
          <Input label="Mukhi" value={f.mukhi} onChange={v=>set("mukhi",v)}/>
          <Input label="Origin" value={f.origin} onChange={v=>set("origin",v)}/>
          <Input label="Size (mm)" value={f.size_mm} onChange={v=>set("size_mm",v)}/>
          <Input label="Weight (g)" value={f.weight_g} onChange={v=>set("weight_g",v)}/>
          <Input label="MRP" type="number" value={f.mrp} onChange={v=>set("mrp",v)}/>
          <Input label="Selling Price" type="number" value={f.selling_price} onChange={v=>set("selling_price",v)}/>
          <Input label="Discount %" type="number" value={f.discount_percent} onChange={v=>set("discount_percent",v)}/>
          <Input label="Stock" type="number" value={f.stock} onChange={v=>set("stock",v)}/>
          <Input label="Certification" value={f.certification} onChange={v=>set("certification",v)}/>
          <Select label="Status" value={f.status} onChange={v=>set("status",v)} options={[{v:"published",l:"Published"},{v:"draft",l:"Draft"},{v:"hidden",l:"Hidden"}]}/>
        </Grid>
        <TextArea label="Short Description" value={f.short_description} onChange={v=>set("short_description",v)}/>
        <TextArea label="Full Description" value={f.description} onChange={v=>set("description",v)} rows={5}/>
        <TextArea label="Benefits" value={f.benefits} onChange={v=>set("benefits",v)}/>
        <Grid>
          <Input label="Mantra" value={f.mantra} onChange={v=>set("mantra",v)}/>
          <Input label="Planet" value={f.planet} onChange={v=>set("planet",v)}/>
          <Input label="Deity" value={f.deity} onChange={v=>set("deity",v)}/>
          <Input label="Chakra" value={f.chakra} onChange={v=>set("chakra",v)}/>
          <Input label="Purpose" value={f.purpose} onChange={v=>set("purpose",v)}/>
          <Input label="Material" value={f.material} onChange={v=>set("material",v)}/>
        </Grid>
        <TextArea label="Wearing Method" value={f.wearing_method} onChange={v=>set("wearing_method",v)}/>
        <Input label="Tags (comma separated)" value={Array.isArray(f.tags) ? f.tags.join(", ") : f.tags} onChange={v=>set("tags",v)}/>

        <div>
          <div className="overline mb-2">Images</div>
          <div className="flex gap-3 flex-wrap">
            {(f.images||[]).map((im,i)=>(
              <div key={i} className="relative w-24 h-24 rounded-md overflow-hidden border" style={{borderColor:"var(--line)"}}>
                <img src={im.url} alt="" className="w-full h-full object-cover"/>
                <button type="button" onClick={()=>removeImg(i)} className="absolute top-1 right-1 bg-white/90 rounded-full w-5 h-5 text-xs">×</button>
              </div>
            ))}
            <label className="w-24 h-24 rounded-md border-2 border-dashed flex items-center justify-center text-xs cursor-pointer" style={{borderColor:"var(--line)", color:"var(--ink-2)"}}>
              + Upload
              <input type="file" accept="image/*" onChange={upload} className="hidden" data-testid="pf-upload"/>
            </label>
          </div>
        </div>

        <Grid>
          <Toggle label="Featured" checked={f.is_featured} onChange={v=>set("is_featured",v)}/>
          <Toggle label="Best Seller" checked={f.is_bestseller} onChange={v=>set("is_bestseller",v)}/>
          <Toggle label="New Arrival" checked={f.is_new_arrival} onChange={v=>set("is_new_arrival",v)}/>
          <Toggle label="Premium" checked={f.is_premium} onChange={v=>set("is_premium",v)}/>
          <Toggle label="Trending" checked={f.is_trending} onChange={v=>set("is_trending",v)}/>
        </Grid>

        <div className="pt-4 border-t" style={{borderColor:"var(--line)"}}>
          <div className="overline mb-3">SEO</div>
          <Grid><Input label="SEO Title" value={f.seo_title||""} onChange={v=>set("seo_title",v)}/><Input label="SEO Description" value={f.seo_description||""} onChange={v=>set("seo_description",v)}/></Grid>
        </div>
      </div>
    </form>
  );
}

// Categories admin
export function AdminCategories() {
  const [rows, setRows] = useState([]);
  const [editing, setEditing] = useState(null);
  const load = async () => { const {data} = await supabase.from("categories").select("*").order("sort_order"); setRows(data||[]); };
  useEffect(()=>{load();}, []);
  const save = async (e) => { e.preventDefault(); const payload = {...editing}; if(!payload.slug) payload.slug = slugify(payload.name); const {error} = payload.id ? await supabase.from("categories").update(payload).eq("id",payload.id) : await supabase.from("categories").insert(payload); if(error) alert(error.message); else { setEditing(null); load(); } };
  const del = async (id) => { if(!window.confirm("Delete?")) return; await supabase.from("categories").delete().eq("id",id); load(); };

  return (
    <div>
      <div className="flex items-center justify-between mb-6"><h1 className="font-serif-display text-4xl" style={{color:"var(--ink)"}}>Categories</h1><button className="btn-primary" onClick={()=>setEditing({name:"",slug:"",description:"",image_url:"",sort_order:0})} data-testid="new-cat">+ New</button></div>
      {editing && (
        <form onSubmit={save} className="mb-6 bg-white p-6 rounded-md border space-y-4" style={{borderColor:"var(--line)"}}>
          <Grid>
            <Input label="Name" value={editing.name} onChange={v=>setEditing({...editing, name:v})} required/>
            <Input label="Slug" value={editing.slug} onChange={v=>setEditing({...editing, slug:v})}/>
            <Input label="Image URL" value={editing.image_url||""} onChange={v=>setEditing({...editing, image_url:v})}/>
            <Input label="Sort Order" type="number" value={editing.sort_order} onChange={v=>setEditing({...editing, sort_order:Number(v)})}/>
          </Grid>
          <TextArea label="Description" value={editing.description||""} onChange={v=>setEditing({...editing, description:v})}/>
          <div className="flex gap-3"><button className="btn-primary">Save</button><button type="button" onClick={()=>setEditing(null)} className="btn-secondary">Cancel</button></div>
        </form>
      )}
      <div className="bg-white rounded-md border" style={{borderColor:"var(--line)"}}>
        {rows.map(r=>(
          <div key={r.id} className="p-4 border-b flex items-center justify-between" style={{borderColor:"var(--line)"}}>
            <div className="flex items-center gap-4"><img src={r.image_url} alt="" className="w-12 h-12 rounded-md object-cover"/><div><div className="font-medium" style={{color:"var(--ink)"}}>{r.name}</div><div className="text-xs" style={{color:"var(--ink-2)"}}>{r.slug}</div></div></div>
            <div><button onClick={()=>setEditing(r)} className="text-xs px-2 py-1 hover:text-[var(--copper)]">Edit</button><button onClick={()=>del(r.id)} className="text-xs px-2 py-1 text-red-600">Delete</button></div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Blogs admin
export function AdminBlogs() {
  const [rows, setRows] = useState([]);
  const [editing, setEditing] = useState(null);
  const load = async () => { const {data} = await supabase.from("blog_posts").select("*").order("published_at",{ascending:false}); setRows(data||[]); };
  useEffect(()=>{load();}, []);
  const save = async (e) => { e.preventDefault(); const payload={...editing}; if(!payload.slug) payload.slug=slugify(payload.title); if(typeof payload.tags==="string") payload.tags = payload.tags.split(",").map(s=>s.trim()).filter(Boolean); const {error} = payload.id ? await supabase.from("blog_posts").update(payload).eq("id",payload.id) : await supabase.from("blog_posts").insert(payload); if(error) alert(error.message); else {setEditing(null); load();} };
  const del = async (id) => { if(!window.confirm("Delete?")) return; await supabase.from("blog_posts").delete().eq("id",id); load(); };
  return (
    <div>
      <div className="flex items-center justify-between mb-6"><h1 className="font-serif-display text-4xl" style={{color:"var(--ink)"}}>Journal</h1><button className="btn-primary" onClick={()=>setEditing({title:"",slug:"",excerpt:"",content:"",featured_image:"",author:"",category:"",tags:[],reading_time:5,status:"published"})}>+ New Post</button></div>
      {editing && (
        <form onSubmit={save} className="mb-6 bg-white p-6 rounded-md border space-y-4" style={{borderColor:"var(--line)"}}>
          <Grid>
            <Input label="Title" value={editing.title} onChange={v=>setEditing({...editing,title:v})} required/>
            <Input label="Slug" value={editing.slug} onChange={v=>setEditing({...editing,slug:v})}/>
            <Input label="Author" value={editing.author||""} onChange={v=>setEditing({...editing,author:v})}/>
            <Input label="Category" value={editing.category||""} onChange={v=>setEditing({...editing,category:v})}/>
            <Input label="Featured Image URL" value={editing.featured_image||""} onChange={v=>setEditing({...editing,featured_image:v})}/>
            <Input label="Reading Time (min)" type="number" value={editing.reading_time||5} onChange={v=>setEditing({...editing,reading_time:Number(v)})}/>
            <Input label="Tags (comma)" value={Array.isArray(editing.tags)?editing.tags.join(", "):editing.tags||""} onChange={v=>setEditing({...editing,tags:v})}/>
            <Select label="Status" value={editing.status} onChange={v=>setEditing({...editing,status:v})} options={[{v:"published",l:"Published"},{v:"draft",l:"Draft"}]}/>
          </Grid>
          <TextArea label="Excerpt" value={editing.excerpt||""} onChange={v=>setEditing({...editing,excerpt:v})}/>
          <TextArea label="Content (HTML supported)" value={editing.content||""} onChange={v=>setEditing({...editing,content:v})} rows={12}/>
          <div className="flex gap-3"><button className="btn-primary">Save</button><button type="button" onClick={()=>setEditing(null)} className="btn-secondary">Cancel</button></div>
        </form>
      )}
      <div className="bg-white rounded-md border" style={{borderColor:"var(--line)"}}>
        {rows.map(r=>(
          <div key={r.id} className="p-4 border-b flex items-center justify-between" style={{borderColor:"var(--line)"}}>
            <div>
              <div className="font-medium" style={{color:"var(--ink)"}}>{r.title}</div>
              <div className="text-xs" style={{color:"var(--ink-2)"}}>{r.category} · {r.status}</div>
            </div>
            <div><button onClick={()=>setEditing(r)} className="text-xs px-2 py-1 hover:text-[var(--copper)]">Edit</button><button onClick={()=>del(r.id)} className="text-xs px-2 py-1 text-red-600">Delete</button></div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Testimonials admin
export function AdminTestimonials() {
  const [rows, setRows] = useState([]);
  const [f, setF] = useState({ author_name:"", location:"", content:"", rating:5, is_featured:true });
  const load = async () => { const {data} = await supabase.from("testimonials").select("*").order("created_at",{ascending:false}); setRows(data||[]); };
  useEffect(()=>{load();},[]);
  const add = async (e) => { e.preventDefault(); const {error}=await supabase.from("testimonials").insert(f); if(error) alert(error.message); else { setF({author_name:"",location:"",content:"",rating:5,is_featured:true}); load(); } };
  const del = async (id) => { if(!window.confirm("Delete?"))return; await supabase.from("testimonials").delete().eq("id",id); load(); };
  return (
    <div>
      <h1 className="font-serif-display text-4xl mb-6" style={{color:"var(--ink)"}}>Testimonials</h1>
      <form onSubmit={add} className="mb-6 bg-white p-6 rounded-md border space-y-3" style={{borderColor:"var(--line)"}}>
        <Grid>
          <Input label="Author" value={f.author_name} onChange={v=>setF({...f,author_name:v})} required/>
          <Input label="Location" value={f.location} onChange={v=>setF({...f,location:v})}/>
          <Input label="Rating" type="number" value={f.rating} onChange={v=>setF({...f,rating:Number(v)})}/>
        </Grid>
        <TextArea label="Content" value={f.content} onChange={v=>setF({...f,content:v})}/>
        <button className="btn-primary">Add Testimonial</button>
      </form>
      <div className="bg-white rounded-md border divide-y" style={{borderColor:"var(--line)"}}>
        {rows.map(r=>(
          <div key={r.id} className="p-4 flex items-start justify-between">
            <div><div className="font-medium" style={{color:"var(--ink)"}}>{r.author_name} <span className="text-xs opacity-60">· {r.location}</span></div><div className="text-sm mt-1" style={{color:"var(--ink-2)"}}>"{r.content}"</div></div>
            <button onClick={()=>del(r.id)} className="text-xs px-2 py-1 text-red-600">Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}

// Inquiries admin
export function AdminInquiries() {
  const [rows, setRows] = useState([]);
  useEffect(()=>{ supabase.from("inquiries").select("*").order("created_at",{ascending:false}).then(({data})=>setRows(data||[])); },[]);
  return (
    <div>
      <h1 className="font-serif-display text-4xl mb-6" style={{color:"var(--ink)"}}>Inquiries</h1>
      <div className="bg-white rounded-md border divide-y" style={{borderColor:"var(--line)"}}>
        {rows.length===0 && <div className="p-8 text-center" style={{color:"var(--ink-2)"}}>No inquiries yet</div>}
        {rows.map(r=>(
          <div key={r.id} className="p-4">
            <div className="flex items-center justify-between"><div className="font-medium" style={{color:"var(--ink)"}}>{r.name} <span className="text-xs opacity-60">· {r.email} · {r.phone}</span></div><div className="text-xs" style={{color:"var(--ink-2)"}}>{new Date(r.created_at).toLocaleString()}</div></div>
            <div className="mt-2 text-sm" style={{color:"var(--ink-2)"}}>{r.message}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Site settings admin (JSON editors)
export function AdminSettings() {
  const [rows, setRows] = useState([]);
  const [drafts, setDrafts] = useState({});
  const load = async () => { const {data} = await supabase.from("site_settings").select("*"); setRows(data||[]); const m={}; (data||[]).forEach(r=>m[r.key]=JSON.stringify(r.value,null,2)); setDrafts(m); };
  useEffect(()=>{load();},[]);
  const save = async (key) => { try { const value = JSON.parse(drafts[key]); const {error} = await supabase.from("site_settings").upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict:"key" }); if(error) alert(error.message); else alert("Saved"); } catch(e) { alert("Invalid JSON: "+e.message); } };
  return (
    <div>
      <h1 className="font-serif-display text-4xl mb-6" style={{color:"var(--ink)"}}>Site Settings</h1>
      <p className="text-sm mb-6" style={{color:"var(--ink-2)"}}>Edit any section as JSON. All homepage sections, hero, contact, social, and footer are managed here.</p>
      <div className="space-y-4">
        {rows.map(r=>(
          <div key={r.key} className="bg-white p-4 rounded-md border" style={{borderColor:"var(--line)"}}>
            <div className="flex items-center justify-between mb-3"><div className="font-medium uppercase tracking-wider text-sm" style={{color:"var(--ink)"}}>{r.key}</div><button className="btn-primary text-xs" onClick={()=>save(r.key)} data-testid={`save-setting-${r.key}`}>Save</button></div>
            <textarea rows={10} value={drafts[r.key]||""} onChange={(e)=>setDrafts({...drafts,[r.key]:e.target.value})} className="w-full font-mono text-xs p-3 border rounded-md" style={{borderColor:"var(--line)"}} data-testid={`setting-${r.key}`}/>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---- form primitives ----
function Grid({children}) { return <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>; }
function Input({label, value, onChange, type="text", required, placeholder, testid}) {
  return <label className="block text-sm"><div className="overline mb-1">{label}</div><input required={required} type={type} placeholder={placeholder} value={value ?? ""} onChange={(e)=>onChange(e.target.value)} className="w-full px-3 py-2 border rounded-md outline-none text-sm" style={{borderColor:"var(--line)"}} data-testid={testid}/></label>;
}
function TextArea({label, value, onChange, rows=3}) {
  return <label className="block text-sm"><div className="overline mb-1">{label}</div><textarea rows={rows} value={value ?? ""} onChange={(e)=>onChange(e.target.value)} className="w-full px-3 py-2 border rounded-md outline-none text-sm" style={{borderColor:"var(--line)"}}/></label>;
}
function Select({label, value, onChange, options}) {
  return <label className="block text-sm"><div className="overline mb-1">{label}</div><select value={value ?? ""} onChange={(e)=>onChange(e.target.value)} className="w-full px-3 py-2 border rounded-md text-sm" style={{borderColor:"var(--line)"}}>{options.map(o=><option key={o.v} value={o.v}>{o.l}</option>)}</select></label>;
}
function Toggle({label, checked, onChange}) {
  return <label className="flex items-center gap-2 text-sm" style={{color:"var(--ink-2)"}}><input type="checkbox" checked={!!checked} onChange={(e)=>onChange(e.target.checked)} className="accent-[var(--copper)]"/>{label}</label>;
}
