import React from "react";
import { NavLink, Outlet, Navigate, useLocation } from "react-router-dom";
import { LayoutDashboard, Package, Layers, FileText, MessageSquare, Settings, LogOut, Inbox } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

const ROOT = "/root-access-mvr";
const LINKS = [
  { to: `${ROOT}`, label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: `${ROOT}/products`, label: "Products", icon: Package },
  { to: `${ROOT}/categories`, label: "Categories", icon: Layers },
  { to: `${ROOT}/blogs`, label: "Journal", icon: FileText },
  { to: `${ROOT}/testimonials`, label: "Testimonials", icon: MessageSquare },
  { to: `${ROOT}/inquiries`, label: "Inquiries", icon: Inbox },
  { to: `${ROOT}/settings`, label: "Site Settings", icon: Settings },
];

export default function AdminLayout() {
  const { session, loading } = useAuth();
  const loc = useLocation();
  if (loading) return <div className="p-24 text-center" style={{color:"var(--ink-2)"}}>Loading…</div>;
  if (!session) return <Navigate to="/root-access-mvr/login" state={{ from: loc }} replace />;

  return (
    <div className="min-h-screen flex" style={{ background: "var(--cream)" }}>
      <aside className="w-64 fixed h-screen p-6 flex flex-col" style={{ background: "var(--ink)", color: "var(--ivory)" }}>
        <div className="font-serif-display text-2xl mb-8">MV <span style={{color:"var(--gold)"}}>Rudraksh</span></div>
        <nav className="flex-1 space-y-1">
          {LINKS.map(l => (
            <NavLink key={l.to} to={l.to} end={l.end} data-testid={`admin-nav-${l.label.toLowerCase()}`}
              className={({isActive}) => `flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition ${isActive ? "bg-[var(--copper)] text-white" : "hover:bg-white/5"}`}>
              <l.icon size={16}/> {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t pt-4 mt-4" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
          <div className="text-xs mb-2 opacity-60">{session.user?.email}</div>
          <button data-testid="admin-signout" onClick={()=>supabase.auth.signOut()} className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm hover:bg-white/5">
            <LogOut size={14}/> Sign Out
          </button>
        </div>
      </aside>
      <main className="flex-1 ml-64 p-8">
        <Outlet />
      </main>
    </div>
  );
}
