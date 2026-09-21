import { useState } from 'react';
// @ts-ignore - package ships broken d.ts reference, skipLibCheck handles it
import indiaMap from '@svg-maps/india';
import { cityData } from '../data';

interface Location {
  id: string;
  name: string;
  path: string;
}

const locations: Location[] = (indiaMap as { locations: Location[] }).locations.filter(
  (l) => l.id !== 'an' && l.id !== 'ld' // exclude far islands for a clean mainland view
);

// States with visitor activity → subtle heat shading (opacity of foreground tint)
const stateHeat: Record<string, number> = {
  br: 0.32, // Bihar (HQ)
  dl: 0.18, // Delhi
  jh: 0.16, // Jharkhand
  up: 0.12, // Uttar Pradesh
  wb: 0.12, // West Bengal
  ka: 0.08, // Karnataka
};

export function IndiaMap({
  activeCity,
  onCityClick,
}: {
  activeCity: string | null;
  onCityClick: (city: string) => void;
}) {
  const [hovered, setHovered] = useState<string | null>(null);

  const hoveredCity = cityData.find((c) => c.name === hovered);

  return (
    <div className="relative w-full">
      <svg viewBox="55 15 520 645" className="w-full h-auto" role="img" aria-label="India visitor demand map">
        <defs>
          <filter id="dotGlow" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Real state paths */}
        <g>
          {locations.map((loc) => {
            const heat = stateHeat[loc.id] ?? 0;
            const isActiveState = cityData.some(
              (c) => c.stateId === loc.id && (c.name === activeCity || c.name === hovered)
            );
            return (
              <path
                key={loc.id}
                d={loc.path}
                className="transition-opacity duration-200"
                fill="var(--color-foreground)"
                fillOpacity={isActiveState ? Math.max(heat + 0.14, 0.22) : heat > 0 ? heat * 0.5 + 0.04 : 0.045}
                stroke="var(--color-background)"
                strokeWidth={1.1}
              />
            );
          })}
        </g>

        {/* City hotspots */}
        {cityData.map((city) => {
          const isActive = activeCity === city.name;
          const r = city.isHQ ? 7 : 5;
          return (
            <g
              key={city.name}
              className="cursor-pointer"
              onClick={() => onCityClick(city.name)}
              onMouseEnter={() => setHovered(city.name)}
              onMouseLeave={() => setHovered(null)}
            >
              {/* invisible larger hit area */}
              <circle cx={city.x} cy={city.y} r={18} fill="transparent" />
              {/* pulse ring */}
              <circle
                cx={city.x}
                cy={city.y}
                r={r + 5}
                fill={city.isHQ ? 'var(--color-whatsapp)' : 'var(--color-foreground)'}
                opacity="0.25"
                className="animate-pulse-ring"
              />
              {/* halo */}
              <circle
                cx={city.x}
                cy={city.y}
                r={r + 3.5}
                fill={city.isHQ ? 'var(--color-whatsapp)' : 'var(--color-foreground)'}
                opacity={isActive || hovered === city.name ? 0.28 : 0.14}
                className="transition-opacity duration-200"
              />
              {/* dot */}
              <circle
                cx={city.x}
                cy={city.y}
                r={r}
                fill={city.isHQ ? 'var(--color-whatsapp)' : 'var(--color-foreground)'}
                stroke="var(--color-background)"
                strokeWidth={1.75}
                filter="url(#dotGlow)"
              />
              {/* active ring */}
              {isActive && (
                <circle
                  cx={city.x}
                  cy={city.y}
                  r={r + 7}
                  fill="none"
                  stroke={city.isHQ ? 'var(--color-whatsapp)' : 'var(--color-foreground)'}
                  strokeWidth={1.5}
                  strokeDasharray="3 3"
                />
              )}
            </g>
          );
        })}
      </svg>

      {/* Hover tooltip (HTML, positioned over SVG) */}
      {hoveredCity && (
        <div
          className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-lg border border-border bg-popover px-3 py-2 shadow-lg animate-fade-in"
          style={{
            left: `${((hoveredCity.x - 55) / 520) * 100}%`,
            top: `${((hoveredCity.y - 15) / 645) * 100 - 3}%`,
          }}
        >
          <div className="flex items-center gap-1.5 whitespace-nowrap">
            <span
              className={`h-2 w-2 rounded-full ${hoveredCity.isHQ ? 'bg-whatsapp' : 'bg-foreground'}`}
            />
            <span className="text-xs font-semibold">{hoveredCity.name}</span>
            {hoveredCity.isHQ && (
              <span className="rounded bg-whatsapp/15 px-1 py-px text-[9px] font-semibold text-whatsapp">
                STUDIO HQ
              </span>
            )}
          </div>
          <div className="mt-1 flex items-center gap-3 whitespace-nowrap font-mono text-[10px] text-muted-foreground">
            <span>{hoveredCity.visits.toLocaleString()} visits</span>
            <span>·</span>
            <span>{hoveredCity.leads} leads</span>
          </div>
          <p className="mt-0.5 text-[9px] text-muted-foreground">Click to filter enquiries</p>
        </div>
      )}

      {/* Legend */}
      <div className="mt-1 flex items-center justify-between px-1">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-whatsapp" />
            <span className="text-[10px] text-muted-foreground">Studio HQ</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-foreground" />
            <span className="text-[10px] text-muted-foreground">Visitor city</span>
          </div>
        </div>
        <span className="font-mono text-[10px] text-muted-foreground">Umami GeoIP · 30 days</span>
      </div>
    </div>
  );
}