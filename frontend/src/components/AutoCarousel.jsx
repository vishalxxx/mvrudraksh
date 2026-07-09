import React from "react";

/**
 * AutoCarousel — continuous CSS-driven marquee. No arrows.
 * Duplicates children for a seamless loop. Pauses on hover.
 */
export default function AutoCarousel({ children, itemClass = "w-72", gap = "gap-5", speed = 40 }) {
  const items = React.Children.toArray(children);
  if (items.length === 0) return null;

  return (
    <div className="relative overflow-hidden mv-carousel" data-testid="auto-carousel">
      <div
        className={`flex ${gap} mv-marquee-track`}
        style={{ animationDuration: `${speed}s` }}
      >
        {[...items, ...items].map((child, i) => (
          <div key={i} className={`shrink-0 ${itemClass}`}>{child}</div>
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
