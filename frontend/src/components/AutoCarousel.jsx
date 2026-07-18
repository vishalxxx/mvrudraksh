import React from "react";

/**
 * AutoCarousel — continuous CSS-driven marquee. No arrows.
 * Only animates + duplicates children when the item count is large enough
 * to require scrolling. Otherwise renders the items statically centred so
 * a small featured set (e.g. 2-3 items) never appears as duplicates.
 */
export default function AutoCarousel({
  children,
  itemClass = "w-72",
  gap = "gap-5",
  speed = 40,
  // Below this count, we render statically (no duplication, no animation).
  minLoop = 6,
}) {
  const items = React.Children.toArray(children);
  if (items.length === 0) return null;

  const shouldLoop = items.length >= minLoop;

  if (!shouldLoop) {
    return (
      <div className="relative overflow-hidden" data-testid="auto-carousel">
        <div className={`flex ${gap} flex-wrap justify-center`}>
          {items.map((child, i) => (
            <div key={i} className={`shrink-0 ${itemClass}`}>{child}</div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden mv-carousel" data-testid="auto-carousel">
      <div
        className={`flex ${gap} mv-marquee-track`}
        style={{ animationDuration: `${speed}s` }}
      >
        {[...items, ...items].map((child, i) => (
          <div key={i} className={`shrink-0 ${itemClass}`} aria-hidden={i >= items.length ? "true" : undefined}>
            {child}
          </div>
        ))}
      </div>
      <style>{`
        @keyframes mvMarquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        .mv-marquee-track {
          width: max-content;
          animation-name: mvMarquee;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
          will-change: transform;
        }
        .mv-carousel:hover .mv-marquee-track { animation-play-state: paused; }
      `}</style>
    </div>
  );
}
