import { createClient } from "@supabase/supabase-js";

const url = process.env.REACT_APP_SUPABASE_URL;
const anon = process.env.REACT_APP_SUPABASE_ANON_KEY;

export const supabase = createClient(url, anon, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
});

export const CLOUD_NAME = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;
export const UPLOAD_PRESET = process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET;

export async function uploadToCloudinary(file) {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("upload_preset", UPLOAD_PRESET);
  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`, {
    method: "POST",
    body: fd,
  });
  if (!res.ok) throw new Error("Cloudinary upload failed");
  return res.json();
}

export function cldUrl(publicIdOrUrl, transforms = "f_auto,q_auto,w_1200") {
  if (!publicIdOrUrl) return "";
  if (publicIdOrUrl.startsWith("http")) return publicIdOrUrl;
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${transforms}/${publicIdOrUrl}`;
}
