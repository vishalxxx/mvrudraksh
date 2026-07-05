export const money = (n, symbol = "₹") => {
  if (n === null || n === undefined || isNaN(Number(n))) return `${symbol}0`;
  return `${symbol}${Number(n).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
};

export const slugify = (s) =>
  (s || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export const productImage = (p) => {
  const first = Array.isArray(p?.images) ? p.images[0] : null;
  return first?.url || "https://images.unsplash.com/photo-1613274146063-8930e164c743?w=1200";
};
