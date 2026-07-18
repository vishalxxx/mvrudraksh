import React from "react";
import { Link } from "react-router-dom";
import { productImage, money } from "@/lib/utils.helpers";
import { useSite } from "@/lib/site";

export default function ProductCard({ p }) {
  const { settings } = useSite();
  const sym = settings.site?.currency_symbol || "₹";
  const hasDiscount = Number(p.mrp) > Number(p.selling_price);
  const savings = Number(p.mrp || 0) - Number(p.selling_price || 0);

  return (
    <Link
      to={`/product/${p.slug}`}
      data-testid={`product-card-${p.slug}`}
      className="group block bg-white border rounded-md overflow-hidden transition-all duration-300 hover:shadow-[0_10px_40px_rgba(44,30,22,0.08)]"
      style={{ borderColor: "rgba(209,199,177,0.5)" }}
    >
      <div className="relative overflow-hidden aspect-[4/5]" style={{ background: "var(--cream)" }}>
        <img src={productImage(p)} alt={p.name} className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-105" loading="lazy" />
        <div className="absolute top-3 left-3 flex flex-col gap-1">
          {p.is_bestseller && <span className="text-[10px] uppercase tracking-wider px-2 py-1 rounded-sm" style={{ background: "var(--copper)", color: "white" }}>Best Seller</span>}
          {p.is_new_arrival && <span className="text-[10px] uppercase tracking-wider px-2 py-1 rounded-sm bg-white" style={{ color: "var(--ink)" }}>New</span>}
          {p.is_premium && <span className="text-[10px] uppercase tracking-wider px-2 py-1 rounded-sm" style={{ background: "var(--gold)", color: "var(--ink)" }}>Premium</span>}
        </div>
        {hasDiscount && (
          <div className="absolute top-3 right-3 text-[11px] px-2 py-1 rounded-sm" style={{ background: "var(--ink)", color: "white" }}>
            -{Math.round(((p.mrp - p.selling_price) / p.mrp) * 100)}%
          </div>
        )}
      </div>
      <div className="p-5">
        {p.mukhi && <div className="overline mb-1">{p.mukhi}{p.origin ? ` · ${p.origin}` : ""}</div>}
        <h3 className="font-serif-display text-lg leading-tight mb-2" style={{ color: "var(--ink)" }}>{p.name}</h3>
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-medium" style={{ color: "var(--ink)" }}>{money(p.selling_price, sym)}</span>
          {hasDiscount && <span className="text-sm line-through" style={{ color: "var(--ink-2)" }}>{money(p.mrp, sym)}</span>}
        </div>
        {savings > 0 && <div className="mt-1 text-xs" style={{ color: "var(--copper)" }}>Save {money(savings, sym)}</div>}
      </div>
    </Link>
  );
}
