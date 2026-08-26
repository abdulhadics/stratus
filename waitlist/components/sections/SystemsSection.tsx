'use client';

import { useState } from 'react';
import { Container } from '@/components/layout/Container';
import { StratusLogo } from '@/components/ui/StratusLogo';
import { useTranslation } from '@/lib/i18n';

const SYSTEMS = [
  {
    num: '01',
    titleKey: 'systems.01.title',
    descKey: 'systems.01.desc',
    // Right
    cx: 473.2,
    cy: 260,
  },
  {
    num: '02',
    titleKey: 'systems.02.title',
    descKey: 'systems.02.desc',
    // Bottom-Right
    cx: 386.6,
    cy: 410,
  },
  {
    num: '03',
    titleKey: 'systems.03.title',
    descKey: 'systems.03.desc',
    // Bottom-Left
    cx: 213.4,
    cy: 410,
  },
  {
    num: '04',
    titleKey: 'systems.04.title',
    descKey: 'systems.04.desc',
    // Left
    cx: 126.8,
    cy: 260,
  },
  {
    num: '05',
    titleKey: 'systems.05.title',
    descKey: 'systems.05.desc',
    // Top-Left
    cx: 213.4,
    cy: 110,
  },
  {
    num: '06',
    titleKey: 'systems.06.title',
    descKey: 'systems.06.desc',
    // Top-Right
    cx: 386.6,
    cy: 110,
  },
] as const;

// Pointy-topped hexagon path centered at (cx, cy) with radius R=98
function getHexPath(cx: number, cy: number, r: number = 98) {
  const w = Math.sqrt(3) * r;
  const h2 = r / 2;
  const w2 = w / 2;
  return `M ${cx} ${cy - r} L ${cx + w2} ${cy - h2} L ${cx + w2} ${cy + h2} L ${cx} ${cy + r} L ${cx - w2} ${cy + h2} L ${cx - w2} ${cy - h2} Z`;
}

export function SystemsSection() {
  const { t } = useTranslation();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <section className="py-12 sm:py-16">
      <Container>
        {/* Honeycomb Diagram Container */}
        <div className="relative max-w-[650px] mx-auto">
          <svg
            viewBox="0 0 600 520"
            className="w-full h-auto drop-shadow-2xl select-none"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Outer 6 Hexagons */}
            {SYSTEMS.map((sys, i) => {
              const isHovered = hoveredIndex === i;
              return (
                <g
                  key={sys.num}
                  className="cursor-pointer transition-all duration-300"
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  onFocus={() => setHoveredIndex(i)}
                  onBlur={() => setHoveredIndex(null)}
                  tabIndex={0}
                  role="button"
                  aria-label={`System ${sys.num}: ${t(sys.titleKey as any)}`}
                >
                  {/* Hexagon Background Tile */}
                  <path
                    d={getHexPath(sys.cx, sys.cy, 98)}
                    className={`transition-all duration-300 ${
                      isHovered
                        ? 'fill-accent/15 stroke-accent'
                        : 'fill-bg-elevated/70 stroke-border hover:stroke-accent/60'
                    }`}
                    strokeWidth={isHovered ? '2' : '1'}
                  />

                  {/* Content inside Hexagon using foreignObject for text rendering */}
                  <foreignObject
                    x={sys.cx - 78}
                    y={sys.cy - 70}
                    width="156"
                    height="140"
                    className="pointer-events-none"
                  >
                    <div className="w-full h-full flex flex-col items-center justify-center text-center px-2">
                      <span className={`text-mono text-[11px] font-semibold mb-1 transition-colors ${
                        isHovered ? 'text-accent' : 'text-accent/80'
                      }`}>
                        {sys.num}
                      </span>
                      <span className="text-[12px] font-semibold text-text-primary leading-tight mb-1">
                        {t(sys.titleKey as any)}
                      </span>
                      <span className="text-[10px] text-text-secondary leading-snug">
                        {t(sys.descKey as any)}
                      </span>
                    </div>
                  </foreignObject>
                </g>
              );
            })}

            {/* Center Hexagon (Blue Outline + Emblem) */}
            <g>
              <path
                d={getHexPath(300, 260, 98)}
                className="fill-accent/10 stroke-accent"
                strokeWidth="2.5"
              />
              {/* Light Mode Center Emblem (Native SVG image scales in lockstep on mobile) */}
              <image
                href="/logolight.png"
                x="260"
                y="220"
                width="80"
                height="80"
                className="logo-light-img pointer-events-none"
              />
              {/* Dark Mode Center Emblem */}
              <image
                href="/icon.png"
                x="260"
                y="220"
                width="80"
                height="80"
                className="logo-dark-img pointer-events-none"
              />
            </g>
          </svg>
        </div>
      </Container>
    </section>
  );
}
