import React, { useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * AutoCarousel — horizontally scrollable strip with auto-advance + manual arrow controls.
 * Uses native scroll for smooth touch on mobile. Auto scrolls every `interval` ms.
 */
export default function AutoCarousel({ children, itemClass = "w-72", gap = "gap-5", interval = 3500 }) {
  const scrollerRef = useRef(null);
  const pausedRef = useRef(false);
  const items = React.Children.toArray(children);
  if (items.length === 0) return null;

  useEffect(() => {
    const el = scrollerRef.current; if (!el) return;
    const tick = () => {
      if (pausedRef.current || !el) return;
      const maxScroll = el.scrollWidth - el.clientWidth;
      const step = el.clientWidth * 0.45;
      const next = el.scrollLeft + step;
      if (next >= maxScroll - 2) el.scrollTo({ left: 0, behavior: "smooth" });
      else el.scrollBy({ left: step, behavior: "smooth" });
    };
    const t = setInterval(tick, interval);
    return () => clearInterval(t);
  }, [interval]);

  const step = (dir) => {
    const el = scrollerRef.current; if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.6, behavior: "smooth" });
  };

  return (
    <div
      className="relative"
      onMouseEnter={() => (pausedRef.current = true)}
      onMouseLeave={() => (pausedRef.current = false)}
      data-testid="auto-carousel"
    >
      <div
        ref={scrollerRef}
        className={`flex ${gap} overflow-x-auto scroll-smooth snap-x snap-mandatory pb-2 mv-hide-scrollbar`}
      >
        {items.map((child, i) => (
          <div key={i} className={`shrink-0 snap-start ${itemClass}`}>{child}</div>
        ))}
      </div>

      <button
        type="button"
        aria-label="Previous"
        data-testid="carousel-prev"
        onClick={() => step(-1)}
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 w-10 h-10 rounded-full bg-white/95 shadow-md border flex items-center justify-center hover:bg-white transition"
        style={{ borderColor: "var(--line)", color: "var(--ink)" }}
      >
        <ChevronLeft size={18}/>
      </button>
      <button
        type="button"
        aria-label="Next"
        data-testid="carousel-next"
        onClick={() => step(1)}
        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 w-10 h-10 rounded-full bg-white/95 shadow-md border flex items-center justify-center hover:bg-white transition"
        style={{ borderColor: "var(--line)", color: "var(--ink)" }}
      >
        <ChevronRight size={18}/>
      </button>

      <style>{`
        .mv-hide-scrollbar::-webkit-scrollbar { display: none; }
        .mv-hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
