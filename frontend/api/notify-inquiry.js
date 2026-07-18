// Vercel Serverless Function — sends an email notification when a new inquiry is submitted.
// POST /api/notify-inquiry  body: { name, email, phone, message, type, product_name?, product_slug? }
import nodemailer from "nodemailer";

const escape = (s) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

export default async function handler(req, res) {
  // Basic CORS so the browser can call the function on the same Vercel host.
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  const to = process.env.NOTIFY_TO || user;
  if (!user || !pass) return res.status(500).json({ error: "Email not configured" });

  const body = req.body || {};
  const { name, email, phone, message, type, product_name, product_slug } = body;
  if (!name || !email || !message) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: { user, pass: pass.replace(/\s+/g, "") },
  });

  const subject = product_name
    ? `New Rudraksha inquiry · ${product_name} · ${name}`
    : `New MV Rudraksh inquiry · ${name}`;

  const html = `
  <div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;max-width:640px;margin:0 auto;background:#fdfbf7;padding:32px;border-radius:8px;color:#2c1e16;">
    <h2 style="margin:0 0 6px;color:#b26a3f;font-family:Georgia,serif;">MV Rudraksh — New Inquiry</h2>
    <div style="font-size:12px;text-transform:uppercase;letter-spacing:.15em;color:#8a7663;">${escape(type || "contact")}</div>
    <table style="width:100%;margin-top:20px;border-collapse:collapse;font-size:14px;">
      <tr><td style="padding:8px 0;color:#8a7663;width:140px;">Name</td><td style="padding:8px 0;font-weight:600;">${escape(name)}</td></tr>
      <tr><td style="padding:8px 0;color:#8a7663;">Email</td><td style="padding:8px 0;"><a href="mailto:${escape(email)}" style="color:#b26a3f;">${escape(email)}</a></td></tr>
      ${phone ? `<tr><td style="padding:8px 0;color:#8a7663;">Phone</td><td style="padding:8px 0;">${escape(phone)}</td></tr>` : ""}
      ${product_name ? `<tr><td style="padding:8px 0;color:#8a7663;">Product</td><td style="padding:8px 0;">${escape(product_name)}${product_slug ? ` <span style='color:#8a7663;'>(${escape(product_slug)})</span>` : ""}</td></tr>` : ""}
    </table>
    <div style="margin-top:20px;padding:16px 20px;background:#fff;border-left:3px solid #b26a3f;border-radius:4px;">
      <div style="font-size:11px;text-transform:uppercase;letter-spacing:.15em;color:#8a7663;margin-bottom:8px;">Message</div>
      <div style="white-space:pre-wrap;font-size:14px;line-height:1.6;">${escape(message)}</div>
    </div>
    <div style="margin-top:24px;font-size:12px;color:#8a7663;">Sent from mvrudraksh.com · reply directly to reach the customer</div>
  </div>`;

  try {
    await transporter.sendMail({
      from: `"MV Rudraksh" <${user}>`,
      to,
      replyTo: email,
      subject,
      html,
      text: `New inquiry from ${name} (${email})${phone ? " · " + phone : ""}${product_name ? " · product: " + product_name : ""}\n\n${message}`,
    });
    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: e.message || "Send failed" });
  }
}
