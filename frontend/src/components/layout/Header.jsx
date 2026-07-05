import React, { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Search, Menu, X, Instagram, Phone } from "lucide-react";
import { useSite } from "@/lib/site";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/shop", label: "Shop" },
  { to: "/categories", label: "Categories" },
  { to: "/journal", label: "Journal" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

export default function Header() {
  const { settings } = useSite();
  const nav = useNavigate();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const ann = settings.announcement;
  const site = settings.site || {};
  const contact = settings.contact || {};
  const social = settings.social || {};

  const submit = (e) => {
    e.preventDefault();
    if (q.trim()) {
      nav(`/search?q=${encodeURIComponent(q.trim())}`);
      setShowSearch(false);
    }
  };

  return (
    <>
      {ann?.enabled && (
        <div data-testid="announcement-bar" className="w-full text-center text-xs py-2 px-4" style={{ background: "var(--ink)", color: "var(--ivory)", letterSpacing: "0.08em" }}>
          {ann.text}
        </div>
      )}
      <header className="sticky top-0 z-40 backdrop-blur-xl" style={{ background: "rgba(253,251,247,0.9)", borderBottom: "1px solid rgba(209,199,177,0.4)" }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="h-20 flex items-center justify-between gap-8">
            <Link to="/" data-testid="site-logo" className="flex items-center gap-2">
              <span className="font-serif-display text-2xl tracking-wide" style={{ color: "var(--ink)" }}>
                MV <span style={{ color: "var(--copper)" }}>Rudraksh</span>
              </span>
            </Link>

            <nav className="hidden lg:flex items-center gap-9">
              {NAV.map((n) => (
                <NavLink
                  key={n.to}
                  to={n.to}
                  data-testid={`nav-${n.label.toLowerCase()}`}
                  className={({ isActive }) =>
                    `text-xs uppercase tracking-[0.18em] transition-colors ${isActive ? "text-[var(--copper)]" : "text-[var(--ink-2)] hover:text-[var(--copper)]"}`
                  }
                >
                  {n.label}
                </NavLink>
              ))}
            </nav>

            <div className="flex items-center gap-4">
              <button data-testid="open-search-btn" onClick={() => setShowSearch(true)} aria-label="Search" className="p-2 hover:text-[var(--copper)] transition">
                <Search size={18} />
              </button>
              {social.instagram && (
                <a href={social.instagram} target="_blank" rel="noreferrer" className="hidden sm:inline-block p-2 hover:text-[var(--copper)] transition" aria-label="Instagram">
                  <Instagram size={18} />
                </a>
              )}
              {contact.phone && (
                <a href={`tel:${contact.phone}`} className="hidden sm:inline-flex items-center gap-2 text-xs tracking-wider text-[var(--ink-2)] hover:text-[var(--copper)]" data-testid="call-link">
                  <Phone size={14} /> {contact.phone}
                </a>
              )}
              <button data-testid="mobile-menu-btn" className="lg:hidden p-2" onClick={() => setOpen((v) => !v)} aria-label="Menu">
                {open ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>

        {open && (
          <div className="lg:hidden border-t" style={{ borderColor: "rgba(209,199,177,0.4)" }}>
            <div className="px-6 py-4 flex flex-col gap-3">
              {NAV.map((n) => (
                <NavLink
                  key={n.to}
                  to={n.to}
                  onClick={() => setOpen(false)}
                  className="py-2 text-sm uppercase tracking-wider text-[var(--ink-2)] hover:text-[var(--copper)]"
                >
                  {n.label}
                </NavLink>
              ))}
            </div>
          </div>
        )}
      </header>

      {showSearch && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-32" style={{ background: "rgba(44,30,22,0.6)" }} onClick={() => setShowSearch(false)}>
          <form onClick={(e) => e.stopPropagation()} onSubmit={submit} className="bg-white rounded-md w-full max-w-2xl mx-4 p-3 shadow-xl">
            <div className="flex items-center gap-3 px-2">
              <Search size={20} className="text-[var(--copper)]" />
              <input
                data-testid="global-search-input"
                autoFocus
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search Rudraksha, Mukhi, benefits, journal…"
                className="flex-1 py-3 outline-none bg-transparent text-lg font-body text-[var(--ink)]"
              />
              <button data-testid="close-search-btn" type="button" onClick={() => setShowSearch(false)} className="p-2 text-[var(--ink-2)]"><X size={18}/></button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
