"use client";

import { useMemo } from "react";

type Stop = { slug: string; name: string; region?: string; image?: string };

type Props = {
  stops: Stop[];
  onRemove?: (slug: string) => void;
  compact?: boolean;
};

export default function GoldenTrail({ stops, onRemove, compact = false }: Props) {
  const unique = useMemo(() => {
    const seen = new Set<string>();
    return stops.filter((stop) => {
      if (seen.has(stop.slug)) return false;
      seen.add(stop.slug);
      return true;
    });
  }, [stops]);

  if (!unique.length) return null;

  return (
    <div className={`golden-trail ${compact ? "golden-trail-compact" : ""}`} aria-label="Your journey route">
      <div className="golden-trail-line" aria-hidden="true" />
      {unique.map((stop, index) => (
        <div key={stop.slug} className="golden-trail-stop">
          <div className="golden-trail-marker">
            <span>{String(index + 1).padStart(2, "0")}</span>
          </div>
          <div className="golden-trail-card luxury-glass">
            {stop.image && <img src={stop.image} alt="" loading="lazy" decoding="async" />}
            <div className="golden-trail-copy">
              <p className="luxury-kicker">STOP {index + 1}</p>
              <h3>{stop.name}</h3>
              {stop.region && <p>{stop.region}</p>}
            </div>
            {onRemove && (
              <button type="button" onClick={() => onRemove(stop.slug)} className="golden-trail-remove" aria-label={`Remove ${stop.name}`}>
                ×
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
