import React from "react";

/**
 * AutoCarousel — infinite marquee-style horizontal scroll.
 * Duplicates children so the loop is seamless. Pause on hover.
 */
export default function AutoCarousel({ children, speed = 40, itemClass = "w-72", gap = "gap-5" }) {
  const items = React.Children.toArray(children);
  if (items.length === 0) return null;
  const duration = `${speed}s`;
  return (
    <div className="relative overflow-hidden group" data-testid="auto-carousel">
      <div
        className={`flex ${gap} auto-marquee`}
        style={{ animationDuration: duration }}
      >
        {[...items, ...items].map((child, i) => (
          <div key={i} className={`shrink-0 ${itemClass}`}>{child}</div>
        ))}
      </div>
      <style>{`
        @keyframes mvMarquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .auto-marquee {
          width: max-content;
          animation-name: mvMarquee;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }
        .group:hover .auto-marquee { animation-play-state: paused; }
      `}</style>
    </div>
  );
}
