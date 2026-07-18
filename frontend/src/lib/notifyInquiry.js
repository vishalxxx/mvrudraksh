// Fire-and-forget notifier — POSTs inquiry payload to the /api/notify-inquiry serverless function.
// Silently no-ops in preview/dev where the serverless endpoint doesn't exist.
export async function notifyInquiry(payload) {
  try {
    const res = await fetch("/api/notify-inquiry", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) return { ok: false };
    return { ok: true };
  } catch {
    return { ok: false };
  }
}
