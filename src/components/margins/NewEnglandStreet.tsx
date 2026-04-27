import { useRef, useEffect, useState } from 'react';
import styled from 'styled-components';
import SmokeCanvas from './SmokeCanvas';

const Frame = styled.div`
  border: 1px solid ${p => p.theme.colors.inkSecondary};
  background: ${p => p.theme.colors.pageBg};
  position: relative;
  overflow: hidden;          /* smoke clipped at frame edge */
  box-shadow: inset 0 0 12px rgba(0,0,0,0.08);

  &::before {
    content: '';
    position: absolute;
    inset: 3px;
    border: 1px solid ${p => p.theme.colors.borderLight};
    pointer-events: none;
    z-index: 10;
  }
`;

const SvgWrap = styled.div`position: relative;`;

/* Each chimney's smoke column is positioned absolutely over the SVG */
interface ChimneyDef {
    /* SVG-space coords of the chimney top-centre */
    svgX: number;
    svgY: number;
    rate: number;
    drift: number;
    w: number;
    h: number;
}

const CHIMNEYS: ChimneyDef[] = [
    { svgX: 63, svgY: 47, rate: 0.35, drift: 0.5, w: 20, h: 44 }, // townhouse
    { svgX: 103, svgY: 47, rate: 0.45, drift: 0.4, w: 20, h: 52 }, // wide building chimney B
    { svgX: 123, svgY: 51, rate: 0.30, drift: 0.6, w: 20, h: 48 }, // wide building chimney C
    { svgX: 161, svgY: 52, rate: 0.25, drift: 0.3, w: 16, h: 42 }, // narrow building
];

const SVG_W = 200, SVG_H = 170;

export default function NewEnglandStreet() {
    const wrapRef = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(1);

    /* Track rendered SVG scale so smoke canvases land on chimney tops */
    useEffect(() => {
        const el = wrapRef.current;
        if (!el) return;
        const obs = new ResizeObserver(([entry]) => {
            setScale(entry.contentRect.width / SVG_W);
        });
        obs.observe(el);
        return () => obs.disconnect();
    }, []);

    return (
        <Frame>
            <SvgWrap ref={wrapRef}>
                <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} width="100%" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block' }}>
                    <defs>
                        <pattern id="ne-hatch" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                            <line x1="0" y1="0" x2="0" y2="4" stroke="#3a2e1a" strokeWidth="0.4" opacity="0.3" />
                        </pattern>
                        <filter id="ne-grain">
                            <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
                            <feColorMatrix type="saturate" values="0" />
                            <feBlend in="SourceGraphic" mode="multiply" />
                        </filter>
                    </defs>

                    <rect width={SVG_W} height={SVG_H} fill="#e8e0cc" />
                    <rect width={SVG_W} height={SVG_H} fill="url(#ne-hatch)" />

                    {/* sky lines */}
                    <g stroke="#3a2e1a" strokeWidth="0.25" opacity="0.12">
                        {[20, 30, 40, 50].map(y => <line key={y} x1="0" y1={y} x2={SVG_W} y2={y} />)}
                    </g>

                    {/* moon */}
                    <circle cx="168" cy="22" r="10" fill="#e8e0cc" stroke="#1a1208" strokeWidth="1" />
                    <circle cx="172" cy="20" r="8" fill="#e8e0cc" opacity="0.85" />

                    {/* ── CHURCH (left) ── */}
                    <g transform="translate(8,55)">
                        <rect x="0" y="50" width="36" height="60" fill="#1a1208" />
                        <rect x="5" y="58" width="10" height="14" rx="5" fill="#e8e0cc" fillOpacity="0.15" />
                        <rect x="21" y="58" width="10" height="14" rx="5" fill="#e8e0cc" fillOpacity="0.15" />
                        <rect x="5" y="80" width="10" height="14" rx="5" fill="#e8e0cc" fillOpacity="0.15" />
                        <rect x="21" y="80" width="10" height="14" rx="5" fill="#e8e0cc" fillOpacity="0.15" />
                        <path d="M10,110 L10,97 Q18,89 26,97 L26,110 Z" fill="#e8e0cc" fillOpacity="0.2" />
                        <rect x="10" y="28" width="16" height="24" fill="#1a1208" />
                        <rect x="12" y="32" width="12" height="16" rx="6" fill="#e8e0cc" fillOpacity="0.12" />
                        <polygon points="18,0 8,30 28,30" fill="#1a1208" />
                        <line x1="18" y1="-8" x2="18" y2="4" stroke="#1a1208" strokeWidth="1.5" />
                        <line x1="14" y1="-4" x2="22" y2="-4" stroke="#1a1208" strokeWidth="1.5" />
                    </g>

                    {/* ── TALL TOWNHOUSE (mid-left) ── */}
                    <g transform="translate(52,55)">
                        <rect x="0" y="0" width="32" height="100" fill="#2a1f0e" />
                        <rect x="0" y="0" width="32" height="100" fill="url(#ne-hatch)" opacity="0.5" />
                        <polygon points="0,0 16,-14 32,0" fill="#1a1208" />
                        {/* chimney A — svgX=63 svgY=33 in absolute coords => local x=11,y=-22 */}
                        <rect x="8" y="-22" width="6" height="12" fill="#1a1208" />
                        <g fill="#e8e0cc" fillOpacity="0.18">
                            <rect x="4" y="10" width="10" height="13" rx="1" />
                            <rect x="18" y="10" width="10" height="13" rx="1" />
                            <rect x="4" y="32" width="10" height="13" rx="1" />
                            <rect x="18" y="32" width="10" height="13" rx="1" />
                            <rect x="4" y="54" width="10" height="13" rx="1" />
                            <rect x="18" y="54" width="10" height="13" rx="1" />
                        </g>
                        <rect x="9" y="78" width="14" height="22" rx="1" fill="#e8e0cc" fillOpacity="0.2" />
                    </g>

                    {/* ── WIDE BUILDING (centre) ── */}
                    <g transform="translate(90,65)">
                        <rect x="0" y="0" width="50" height="90" fill="#1a1208" opacity="0.85" />
                        <rect x="0" y="0" width="50" height="90" fill="url(#ne-hatch)" opacity="0.3" />
                        <rect x="-2" y="-4" width="54" height="6" fill="#1a1208" />
                        {/* chimney B => local x=10,y=-18 => abs 100,47 */}
                        <rect x="10" y="-18" width="7" height="16" fill="#1a1208" />
                        {/* chimney C => local x=30,y=-14 => abs 120,51 */}
                        <rect x="30" y="-14" width="6" height="13" fill="#1a1208" />
                        <g fill="#e8e0cc" fillOpacity="0.15">
                            <rect x="5" y="8" width="12" height="16" rx="1" />
                            <rect x="23" y="8" width="12" height="16" rx="1" />
                            <rect x="37" y="8" width="9" height="16" rx="1" />
                            <rect x="5" y="32" width="12" height="16" rx="1" />
                            <rect x="23" y="32" width="12" height="16" rx="1" />
                            <rect x="37" y="32" width="9" height="16" rx="1" />
                            <rect x="5" y="56" width="12" height="16" rx="1" />
                            <rect x="23" y="56" width="12" height="16" rx="1" />
                            <rect x="37" y="56" width="9" height="16" rx="1" />
                        </g>
                        <rect x="17" y="68" width="16" height="22" rx="1" fill="#e8e0cc" fillOpacity="0.2" />
                    </g>

                    {/* ── NARROW BUILDING (right) ── */}
                    <g transform="translate(148,72)">
                        <rect x="0" y="0" width="26" height="83" fill="#2a1f0e" />
                        <polygon points="0,0 13,-10 26,0" fill="#1a1208" />
                        {/* chimney D => local x=16,y=-20 => abs 164,52 */}
                        <rect x="14" y="-20" width="5" height="13" fill="#1a1208" />
                        <g fill="#e8e0cc" fillOpacity="0.15">
                            <rect x="4" y="8" width="8" height="12" rx="1" />
                            <rect x="15" y="8" width="8" height="12" rx="1" />
                            <rect x="4" y="28" width="8" height="12" rx="1" />
                            <rect x="15" y="28" width="8" height="12" rx="1" />
                            <rect x="4" y="48" width="8" height="12" rx="1" />
                            <rect x="15" y="48" width="8" height="12" rx="1" />
                        </g>
                        <rect x="6" y="62" width="14" height="21" rx="1" fill="#e8e0cc" fillOpacity="0.2" />
                    </g>

                    {/* street */}
                    <rect x="0" y="155" width={SVG_W} height="15" fill="#1a1208" opacity="0.5" />
                    <line x1="0" y1="155" x2={SVG_W} y2="155" stroke="#1a1208" strokeWidth="1.5" />
                    <g stroke="#1a1208" strokeWidth="0.4" opacity="0.4">
                        <line x1="25" y1="160" x2="60" y2="160" />
                        <line x1="80" y1="163" x2="130" y2="163" />
                        <line x1="145" y1="159" x2="190" y2="159" />
                    </g>

                    <rect width={SVG_W} height={SVG_H} fill="transparent" filter="url(#ne-grain)" opacity="0.15" />
                </svg>

                {/* Smoke canvases — positioned in SVG-scaled space */}
                {CHIMNEYS.map((c, i) => (
                    <SmokeCanvas
                        key={i}
                        width={c.w}
                        height={c.h}
                        rate={c.rate}
                        drift={c.drift}
                        style={{
                            position: 'absolute',
                            left: c.svgX * scale - c.w / 2,
                            top: c.svgY * scale - c.h,
                            zIndex: 5,
                        }}
                    />
                ))}
            </SvgWrap>
        </Frame>
    );
}