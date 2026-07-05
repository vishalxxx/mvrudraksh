import React from "react";
import { Link } from "react-router-dom";
import { Instagram, Facebook, Youtube, Mail, Phone, MessageCircle, MapPin } from "lucide-react";
import { useSite } from "@/lib/site";

export default function Footer() {
  const { settings } = useSite();
  const site = settings.site || {};
  const c = settings.contact || {};
  const s = settings.social || {};
  const f = settings.footer || {};

  return (
    <footer className="mt-24" style={{ background: "var(--ink)", color: "var(--ivory)" }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-16 grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="md:col-span-2">
          <div className="font-serif-display text-4xl mb-4">MV Rudraksh</div>
          <p className="text-sm max-w-md" style={{ color: "rgba(253,251,247,0.75)" }}>{f.description}</p>
          <div className="flex gap-4 mt-6">
            {s.instagram && <a href={s.instagram} target="_blank" rel="noreferrer" data-testid="footer-instagram" className="hover:text-[var(--gold)]"><Instagram size={18} /></a>}
            {s.facebook && <a href={s.facebook} target="_blank" rel="noreferrer" className="hover:text-[var(--gold)]"><Facebook size={18} /></a>}
            {s.youtube && <a href={s.youtube} target="_blank" rel="noreferrer" className="hover:text-[var(--gold)]"><Youtube size={18} /></a>}
          </div>
        </div>
        <div>
          <div className="overline mb-4" style={{ color: "var(--gold)" }}>Explore</div>
          <ul className="space-y-2 text-sm">
            <li><Link to="/shop" className="hover:text-[var(--gold)]">Shop All</Link></li>
            <li><Link to="/categories" className="hover:text-[var(--gold)]">Categories</Link></li>
            <li><Link to="/journal" className="hover:text-[var(--gold)]">Journal</Link></li>
            <li><Link to="/about" className="hover:text-[var(--gold)]">About Us</Link></li>
            <li><Link to="/faq" className="hover:text-[var(--gold)]">FAQ</Link></li>
            <li><Link to="/sitemap" className="hover:text-[var(--gold)]">Sitemap</Link></li>
          </ul>
        </div>
        <div>
          <div className="overline mb-4" style={{ color: "var(--gold)" }}>Reach Us</div>
          <ul className="space-y-3 text-sm" style={{ color: "rgba(253,251,247,0.8)" }}>
            {c.phone && <li className="flex items-start gap-2"><Phone size={14} className="mt-1"/> {c.phone}</li>}
            {c.whatsapp && <li className="flex items-start gap-2"><MessageCircle size={14} className="mt-1"/> {c.whatsapp}</li>}
            {c.email && <li className="flex items-start gap-2"><Mail size={14} className="mt-1"/> {c.email}</li>}
            {c.address && <li className="flex items-start gap-2"><MapPin size={14} className="mt-1"/> {c.address}</li>}
          </ul>
          <div className="overline mt-6 mb-3" style={{ color: "var(--gold)" }}>Policies</div>
          <ul className="space-y-2 text-sm">
            <li><Link to="/privacy" className="hover:text-[var(--gold)]">Privacy Policy</Link></li>
            <li><Link to="/terms" className="hover:text-[var(--gold)]">Terms</Link></li>
            <li><Link to="/shipping" className="hover:text-[var(--gold)]">Shipping</Link></li>
            <li><Link to="/returns" className="hover:text-[var(--gold)]">Returns</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t py-6 text-center text-xs" style={{ borderColor: "rgba(253,251,247,0.1)", color: "rgba(253,251,247,0.5)" }}>
        {f.copyright || "© 2026 MV Rudraksh"}
      </div>
    </footer>
  );
}
