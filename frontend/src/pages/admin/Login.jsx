import React, { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/lib/auth";

export default function AdminLogin() {
  const { session } = useAuth();
  const loc = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState("login");
  const [msg, setMsg] = useState("");

  if (session) return <Navigate to={loc.state?.from?.pathname || "/admin"} replace />;

  const submit = async (e) => {
    e.preventDefault();
    setErr(""); setBusy(true); setMsg("");
    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setErr(error.message);
    } else {
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/admin` });
      if (error) setErr(error.message); else setMsg("Password reset link sent to your email.");
    }
    setBusy(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{ background: "var(--cream)" }}>
      <div className="w-full max-w-md p-8 rounded-md bg-white border" style={{ borderColor: "var(--line)" }}>
        <div className="text-center mb-8">
          <div className="font-serif-display text-3xl" style={{color:"var(--ink)"}}>MV <span style={{color:"var(--copper)"}}>Rudraksh</span></div>
          <div className="overline mt-2">Admin CMS</div>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <input required type="email" value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="Email" className="w-full px-4 py-3 border rounded-md text-sm outline-none" style={{ borderColor: "var(--line)" }} data-testid="admin-email"/>
          {mode === "login" && (
            <input required type="password" value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="Password" className="w-full px-4 py-3 border rounded-md text-sm outline-none" style={{ borderColor: "var(--line)" }} data-testid="admin-password"/>
          )}
          <button disabled={busy} data-testid="admin-submit" className="btn-primary w-full">{busy ? "Please wait..." : (mode==="login" ? "Sign In" : "Send Reset Link")}</button>
          {err && <div className="text-sm text-red-600" data-testid="admin-error">{err}</div>}
          {msg && <div className="text-sm" style={{color:"var(--copper)"}}>{msg}</div>}
        </form>
        <div className="mt-6 text-center text-xs" style={{ color: "var(--ink-2)" }}>
          <button onClick={()=>{ setMode(mode==="login"?"forgot":"login"); setErr(""); setMsg(""); }} data-testid="admin-toggle-mode" className="underline hover:text-[var(--copper)]">
            {mode === "login" ? "Forgot password?" : "Back to login"}
          </button>
        </div>
      </div>
    </div>
  );
}
