import { useEffect, useRef } from 'react';
import styled from 'styled-components';

const Frame = styled.div`
  border: 1px solid ${p => p.theme.colors.inkSecondary};
  background: ${p => p.theme.colors.pageBg};
  position: relative;
  overflow: hidden;
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

export default function PocketWatch() {
    const hourRef = useRef<SVGLineElement>(null);
    const minRef = useRef<SVGLineElement>(null);
    const secRef = useRef<SVGLineElement>(null);

    useEffect(() => {
        function tick() {
            const now = new Date();
            const s = now.getSeconds() + now.getMilliseconds() / 1000;
            const m = now.getMinutes() + s / 60;
            const h = (now.getHours() % 12) + m / 60;
            const sDeg = s / 60 * 360 - 90;
            const mDeg = m / 60 * 360 - 90;
            const hDeg = h / 12 * 360 - 90;
            if (secRef.current) secRef.current.setAttribute('transform', `rotate(${sDeg},  84, 96)`);
            if (minRef.current) minRef.current.setAttribute('transform', `rotate(${mDeg},  84, 96)`);
            if (hourRef.current) hourRef.current.setAttribute('transform', `rotate(${hDeg},  84, 96)`);
        }
        tick();
        const id = setInterval(tick, 250);
        return () => clearInterval(id);
    }, []);

    const cx = 84, cy = 96, r = 54;
    // hour markers
    const markers = Array.from({ length: 12 }, (_, i) => {
        const ang = (i / 12) * Math.PI * 2 - Math.PI / 2;
        const isMajor = i % 3 === 0;
        const r1 = isMajor ? r - 10 : r - 7;
        return {
            x1: cx + Math.cos(ang) * r1,
            y1: cy + Math.sin(ang) * r1,
            x2: cx + Math.cos(ang) * (r - 3),
            y2: cy + Math.sin(ang) * (r - 3),
            major: isMajor,
        };
    });

    return (
        <Frame>
            <svg viewBox="0 0 168 200" width="100%" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block' }}>
                <defs>
                    <pattern id="pw-hatch" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                        <line x1="0" y1="0" x2="0" y2="4" stroke="#3a2e1a" strokeWidth="0.4" opacity="0.3" />
                    </pattern>
                    <filter id="pw-grain">
                        <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
                        <feColorMatrix type="saturate" values="0" />
                        <feBlend in="SourceGraphic" mode="multiply" />
                    </filter>
                    <radialGradient id="pw-face" cx="45%" cy="40%" r="60%">
                        <stop offset="0%" stopColor="#f5f0e8" />
                        <stop offset="100%" stopColor="#ddd4bc" />
                    </radialGradient>
                </defs>

                <rect width="168" height="200" fill="#e8e0cc" />
                <rect width="168" height="200" fill="url(#pw-hatch)" />

                {/* chain */}
                {Array.from({ length: 10 }, (_, i) => (
                    <ellipse key={i} cx={cx + (i % 2 === 0 ? -2 : 2)} cy={cy - r - 8 - i * 6}
                        rx="4" ry="3" fill="none" stroke="#1a1208" strokeWidth="1.5" />
                ))}
                {/* crown / winder */}
                <rect x={cx - 5} y={cy - r - 16} width="10" height="8" rx="2" fill="#1a1208" />

                {/* outer case bezel */}
                <circle cx={cx} cy={cy} r={r + 8} fill="#1a1208" />
                <circle cx={cx} cy={cy} r={r + 5} fill="#2a1f0e" />
                {/* engraving ring */}
                <circle cx={cx} cy={cy} r={r + 4} fill="none" stroke="#3a2e1a" strokeWidth="1" strokeDasharray="3 3" />
                {/* inner case */}
                <circle cx={cx} cy={cy} r={r + 1} fill="#1a1208" />
                {/* dial face */}
                <circle cx={cx} cy={cy} r={r} fill="url(#pw-face)" />
                {/* chapter ring */}
                <circle cx={cx} cy={cy} r={r - 2} fill="none" stroke="#3a2e1a" strokeWidth="0.8" />

                {/* hour markers */}
                {markers.map((m, i) => (
                    <line key={i} x1={m.x1} y1={m.y1} x2={m.x2} y2={m.y2}
                        stroke="#1a1208" strokeWidth={m.major ? 1.8 : 0.9} />
                ))}

                {/* roman numerals at 12,3,6,9 */}
                {[
                    { label: 'XII', x: cx, y: cy - r + 14 },
                    { label: 'III', x: cx + r - 14, y: cy + 4 },
                    { label: 'VI', x: cx, y: cy + r - 8 },
                    { label: 'IX', x: cx - r + 12, y: cy + 4 },
                ].map(({ label, x, y }) => (
                    <text key={label} x={x} y={y} textAnchor="middle"
                        fontFamily="'Playfair Display', serif" fontSize="8"
                        fill="#1a1208" fontWeight="700">{label}</text>
                ))}

                {/* subsidiary seconds dial */}
                <circle cx={cx} cy={cy + 28} r="10" fill="#e8e0cc" stroke="#3a2e1a" strokeWidth="0.8" />
                {Array.from({ length: 12 }, (_, i) => {
                    const ang = (i / 12) * Math.PI * 2 - Math.PI / 2;
                    return <line key={i}
                        x1={cx + Math.cos(ang) * 7} y1={cy + 28 + Math.sin(ang) * 7}
                        x2={cx + Math.cos(ang) * 9} y2={cy + 28 + Math.sin(ang) * 9}
                        stroke="#1a1208" strokeWidth="0.7" />;
                })}

                {/* hands */}
                <line ref={hourRef} x1={cx} y1={cy} x2={cx + 28} y2={cy}
                    stroke="#1a1208" strokeWidth="3" strokeLinecap="round" />
                <line ref={minRef} x1={cx} y1={cy} x2={cx + 42} y2={cy}
                    stroke="#1a1208" strokeWidth="2" strokeLinecap="round" />
                <line ref={secRef} x1={cx} y1={cy} x2={cx + 46} y2={cy}
                    stroke="#8a1a0a" strokeWidth="1" strokeLinecap="round" />
                {/* seconds sub-hand */}
                <line ref={secRef}
                    x1={cx} y1={cy + 28} x2={cx + 8} y2={cy + 28}
                    stroke="#8a1a0a" strokeWidth="0.8" strokeLinecap="round" />

                {/* centre cap */}
                <circle cx={cx} cy={cy} r="3" fill="#1a1208" />

                {/* maker text */}
                <text x={cx} y={cy - 16} textAnchor="middle"
                    fontFamily="'Playfair Display', serif" fontSize="6" fill="#3a2e1a" fontStyle="italic">
                    Established 1847
                </text>

                <rect width="168" height="200" fill="transparent" filter="url(#pw-grain)" opacity="0.15" />
            </svg>
        </Frame>
    );
}