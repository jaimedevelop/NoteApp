import { useId, type ReactNode } from 'react';
import styled from 'styled-components';

const Frame = styled.figure`
  margin: 0;
  padding: 5px;
  border: 1px solid ${p => p.theme.colors.inkSecondary};
  background: ${p => p.theme.colors.pageBg};
  box-shadow: inset 0 0 18px #392a1712;
  svg { display: block; width: 100%; overflow: hidden; }
  .motion { transform-box: view-box; }
  .flame { transform-origin: 120px 88px; animation: engraving-flame 2.7s ease-in-out infinite; }
  .float { transform-origin: 120px 120px; animation: engraving-float 7s ease-in-out infinite; }
  .waves { animation: engraving-waves 8s linear infinite; }
  .smoke { animation: engraving-smoke 9s linear infinite; }
  .press { animation: engraving-press 6s ease-in-out infinite; }
  .quill { transform-origin: 90px 151px; animation: engraving-quill 8s ease-in-out infinite; }
  .second { transform-origin: 120px 126px; animation: engraving-turn 60s steps(60) infinite; }
  .minute { transform-origin: 120px 126px; animation: engraving-turn 3600s linear infinite; }
  .beam { transform-origin: 146px 65px; animation: engraving-beam 12s ease-in-out infinite; }
  .gear { animation: engraving-turn 12s linear infinite; }
  @keyframes engraving-flame { 0%,100% { transform: scale(1); opacity: .85; } 35% { transform: scale(.92,1.12); opacity: 1; } 70% { transform: scale(1.06,.94); opacity: .7; } }
  @keyframes engraving-float { 0%,100% { transform: translateY(1px) rotate(-1.5deg); } 50% { transform: translateY(-3px) rotate(1.5deg); } }
  @keyframes engraving-waves { to { transform: translateX(-40px); } }
  @keyframes engraving-smoke { 0% { transform: translate(0,0) scale(.45); opacity: 0; } 15% { opacity: .4; } 65% { opacity: .22; } 100% { transform: translate(19px,-65px) scale(1.8); opacity: 0; } }
  @keyframes engraving-press { 0%,15%,85%,100% { transform: translateY(0); } 40%,60% { transform: translateY(19px); } }
  @keyframes engraving-quill { 0%,100% { transform: rotate(-2deg); } 45% { transform: rotate(3deg); } 65% { transform: rotate(0); } }
  @keyframes engraving-turn { to { transform: rotate(360deg); } }
  @keyframes engraving-beam { 0%,100% { transform: rotate(-18deg); opacity: .08; } 50% { transform: rotate(18deg); opacity: .32; } }
  @media (prefers-reduced-motion: reduce) { *, .motion { animation: none !important; } .smoke { opacity: .25; } }
`;

export const ink = '#352e24';
export const paper = '#e9e0ca';
export function Lines({ x, y, width, count = 8, gap = 4 }: { x: number; y: number; width: number; count?: number; gap?: number }) {
  return <g stroke={ink} strokeWidth=".55" opacity=".55">{Array.from({ length: count }, (_, i) => <path key={i} d={`M${x} ${y+i*gap}h${width-(i%3)*3}`} />)}</g>;
}
export function Gear({ x, y, r = 15, reverse = false }: { x: number; y: number; r?: number; reverse?: boolean }) {
  return <g transform={`translate(${x} ${y})`}><g className="gear motion" style={{ transformOrigin: '0px 0px', animationDirection: reverse ? 'reverse' : 'normal' }}>
    <circle r={r} fill={paper} stroke={ink} strokeWidth="2" />
    {Array.from({ length: 12 }, (_, i) => <path key={i} transform={`rotate(${i*30})`} d={`M0 ${-r-2}v5 M0 -4v${-r+7}`} stroke={ink} strokeWidth="2" />)}
    <circle r="4" fill={ink} />
  </g></g>;
}
export default function Engraving({ title, caption, children, landscape = false }: { title: string; caption: string; children: (id: string) => ReactNode; landscape?: boolean }) {
  const id = useId().replace(/:/g, '');
  const h = landscape ? 210 : 270;
  return <Frame><svg viewBox={`0 0 240 ${h}`} role="img" aria-labelledby={`${id}-title`} xmlns="http://www.w3.org/2000/svg">
    <title id={`${id}-title`}>{title}</title>
    <defs>
      <pattern id={`${id}-hatch`} width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(35)"><path d="M0 0V4" stroke={ink} strokeWidth=".65" opacity=".55" /></pattern>
      <pattern id={`${id}-cross`} width="6" height="6" patternUnits="userSpaceOnUse"><path d="M0 0L6 6M6 0L0 6" stroke={ink} strokeWidth=".4" opacity=".45" /></pattern>
      <radialGradient id={`${id}-shade`} cx="30%" cy="25%"><stop stopColor={paper}/><stop offset="1" stopColor="#78664b"/></radialGradient>
      <radialGradient id={`${id}-light`}><stop stopColor="#d6b876" stopOpacity=".65"/><stop offset="1" stopColor="#d6b876" stopOpacity="0"/></radialGradient>
      <filter id={`${id}-grain`}><feTurbulence type="fractalNoise" baseFrequency=".8" numOctaves="3" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter>
    </defs>
    <rect width="240" height={h} fill={paper}/>
    <g fill="none" stroke={ink} strokeWidth=".8" strokeLinejoin="round" strokeLinecap="round">{children(id)}</g>
    <rect x="3" y="3" width="234" height={h-6} fill="none" stroke={ink} strokeWidth=".6"/>
    <rect x="0" y="0" width="240" height={h} filter={`url(#${id}-grain)`} opacity=".045" pointerEvents="none"/>
    <rect x="20" y={h-23} width="200" height="19" fill={paper}/>
    <path d={`M24 ${h-23}H216`} stroke={ink} strokeWidth=".5"/>
    <text x="120" y={h-11} textAnchor="middle" fill={ink} fontFamily="Georgia, serif" fontSize="7" letterSpacing="1.5">{caption}</text>
  </svg></Frame>;
}
