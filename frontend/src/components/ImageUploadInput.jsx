import React, { useState } from "react";
import { uploadToCloudinary } from "@/lib/supabase";

export default function ImageUploadInput({ label, value, onChange, testid }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const handle = async (e) => {
    const f = e.target.files?.[0]; if (!f) return;
    setBusy(true); setErr("");
    try { const r = await uploadToCloudinary(f); onChange(r.secure_url); }
    catch (er) { setErr(er.message); }
    setBusy(false);
  };
  return (
    <div>
      <div className="overline mb-1">{label}</div>
      <div className="flex items-center gap-3">
        {value ? <img src={value} alt="" className="w-16 h-16 rounded-md object-cover border" style={{borderColor:"var(--line)"}}/> : <div className="w-16 h-16 rounded-md border-2 border-dashed" style={{borderColor:"var(--line)"}}/>}
        <label className="btn-secondary text-xs cursor-pointer" data-testid={testid}>
          {busy ? "Uploading…" : (value ? "Replace" : "Upload Image")}
          <input type="file" accept="image/*" onChange={handle} className="hidden"/>
        </label>
        {value && <button type="button" onClick={()=>onChange("")} className="text-xs text-red-600">Remove</button>}
      </div>
      {err && <div className="text-xs text-red-600 mt-1">{err}</div>}
    </div>
  );
}
