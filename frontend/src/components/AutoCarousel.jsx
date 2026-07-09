import React, { useRef, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function AutoCarousel({ children, itemClass = "w-72", gap = "gap-5", interval = 3500 }) {
  const scrollerRef = useRef(null);
  const [paused, setPaused] = useState(false);
  const items = React.Children.toArray(children);

  useEffect(() => {
    if (items.length === 0 || paused) return;
    const id = setInterval(() => {
      const el = scrollerRef.current; if (!el) return;
      const maxScroll = el.scrollWidth - el.clientWidth;
      const step = el.clientWidth * 0.45;
      if (el.scrollLeft + step >= maxScroll - 2) {
        el.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        el.scrollBy({ left: step, behavior: "smooth" });
      }
    }, interval);
    return () => clearInterval(id);
  }, [interval, items.length, paused]);

  if (items.length === 0) return null;

  const step = (dir) => {
    const el = scrollerRef.current; if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.6, behavior: "smooth" });
  };

  return (
    <div
      className="relative px-0 sm:px-12"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
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
        className="hidden sm:flex absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-lg border items-center justify-center hover:bg-[var(--cream)] transition z-10"
        style={{ borderColor: "var(--line)", color: "var(--ink)" }}
      >
        <ChevronLeft size={18}/>
      </button>
      <button
        type="button"
        aria-label="Next"
        data-testid="carousel-next"
        onClick={() => step(1)}
        className="hidden sm:flex absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-lg border items-center justify-center hover:bg-[var(--cream)] transition z-10"
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
