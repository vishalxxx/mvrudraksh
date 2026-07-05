import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const SiteCtx = createContext({ settings: {}, loading: true });

export function SiteProvider({ children }) {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("site_settings").select("*");
      const map = {};
      (data || []).forEach((r) => (map[r.key] = r.value));
      setSettings(map);
      setLoading(false);
    })();
  }, []);

  return <SiteCtx.Provider value={{ settings, loading }}>{children}</SiteCtx.Provider>;
}

export const useSite = () => useContext(SiteCtx);
