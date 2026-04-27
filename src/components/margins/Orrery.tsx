import styled, { keyframes } from 'styled-components';

const orbit1 = keyframes`from { transform: rotate(0deg); } to { transform: rotate(360deg); }`;
const orbit2 = keyframes`from { transform: rotate(0deg); } to { transform: rotate(-360deg); }`;
const orbit3 = keyframes`from { transform: rotate(0deg); } to { transform: rotate(360deg); }`;
const orbit4 = keyframes`from { transform: rotate(0deg); } to { transform: rotate(-360deg); }`;
const sunPulse = keyframes`
  0%,100% { opacity: 0.9; r: 10px; }
  50%      { opacity: 1;   r: 11px; }
`;

const Ring1 = styled.g`transform-origin: 84px 100px; animation: ${orbit1} 8s  linear infinite;`;
const Ring2 = styled.g`transform-origin: 84px 100px; animation: ${orbit2} 14s linear infinite;`;
const Ring3 = styled.g`transform-origin: 84px 100px; animation: ${orbit3} 22s linear infinite;`;
const Ring4 = styled.g`transform-origin: 84px 100px; animation: ${orbit4} 36s linear infinite;`;
const SunGlow = styled.circle`animation: ${sunPulse} 3s ease-in-out infinite;`;

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

export default function Orrery() {
    const cx = 84, cy = 100;
    return (
        <Frame>
            <svg viewBox="0 0 168 210" width="100%" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block' }}>
                <defs>
                    <pattern id="or-hatch" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                        <line x1="0" y1="0" x2="0" y2="4" stroke="#3a2e1a" strokeWidth="0.4" opacity="0.3" />
                    </pattern>
                    <filter id="or-grain">
                        <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
                        <feColorMatrix type="saturate" values="0" />
                        <feBlend in="SourceGraphic" mode="multiply" />
                    </filter>
                    <radialGradient id="or-sun" cx="40%" cy="35%" r="60%">
                        <stop offset="0%" stopColor="#f5d070" />
                        <stop offset="100%" stopColor="#c8780a" />
                    </radialGradient>
                </defs>

                <rect width="168" height="210" fill="#e8e0cc" />
                <rect width="168" height="210" fill="url(#or-hatch)" />

                {/* base stand */}
                <rect x="70" y="178" width="26" height="24" rx="2" fill="#1a1208" />
                <rect x="60" y="196" width="46" height="8" rx="2" fill="#1a1208" />
                <rect x="54" y="202" width="58" height="6" rx="1" fill="#2a1f0e" />
                {/* central column */}
                <rect x="81" y="110" width="4" height="70" fill="#1a1208" />

                {/* orbit rings (static ellipses, tilted for 3/4 perspective) */}
                <ellipse cx={cx} cy={cy} rx="22" ry="10" fill="none" stroke="#3a2e1a" strokeWidth="0.8" opacity="0.5" transform="rotate(-15,84,100)" />
                <ellipse cx={cx} cy={cy} rx="38" ry="17" fill="none" stroke="#3a2e1a" strokeWidth="0.8" opacity="0.4" transform="rotate(-15,84,100)" />
                <ellipse cx={cx} cy={cy} rx="54" ry="24" fill="none" stroke="#3a2e1a" strokeWidth="0.7" opacity="0.35" transform="rotate(-15,84,100)" />
                <ellipse cx={cx} cy={cy} rx="70" ry="31" fill="none" stroke="#3a2e1a" strokeWidth="0.7" opacity="0.3" transform="rotate(-15,84,100)" />

                {/* brass armature spokes */}
                {[0, 90, 180, 270].map(deg => {
                    const r = deg * Math.PI / 180;
                    return <line key={deg}
                        x1={cx} y1={cy}
                        x2={cx + Math.cos(r) * 70} y2={cy + Math.sin(r) * 22}
                        stroke="#1a1208" strokeWidth="1" opacity="0.3" />;
                })}

                {/* sun */}
                <SunGlow cx={cx} cy={cy} r={10} fill="url(#or-sun)" />
                <circle cx={cx} cy={cy} r={7} fill="#c8780a" opacity="0.6" />
                {/* sun rays */}
                {[0, 45, 90, 135, 180, 225, 270, 315].map(deg => {
                    const r = deg * Math.PI / 180;
                    return <line key={deg}
                        x1={cx + Math.cos(r) * 11} y1={cy + Math.sin(r) * 11}
                        x2={cx + Math.cos(r) * 15} y2={cy + Math.sin(r) * 15}
                        stroke="#c8780a" strokeWidth="1.2" opacity="0.5" />;
                })}

                {/* planet 1 — innermost, small, fast */}
                <Ring1>
                    <line x1={cx} y1={cy} x2={cx + 22} y2={cy - 8} stroke="#1a1208" strokeWidth="1.2" opacity="0.5" />
                    <circle cx={cx + 22} cy={cy - 8} r="4" fill="#2a1f0e" stroke="#1a1208" strokeWidth="1" />
                    <circle cx={cx + 22} cy={cy - 8} r="2" fill="#3a2e1a" />
                </Ring1>

                {/* planet 2 — medium */}
                <Ring2>
                    <line x1={cx} y1={cy} x2={cx + 38} y2={cy - 14} stroke="#1a1208" strokeWidth="1.2" opacity="0.4" />
                    <circle cx={cx + 38} cy={cy - 14} r="5.5" fill="#2a1f0e" stroke="#1a1208" strokeWidth="1" />
                    <circle cx={cx + 38} cy={cy - 14} r="3" fill="#3a2e1a" />
                    {/* small moon ring */}
                    <ellipse cx={cx + 38} cy={cy - 14} rx="9" ry="3" fill="none" stroke="#3a2e1a" strokeWidth="0.7" transform={`rotate(30,${cx + 38},${cy - 14})`} />
                </Ring2>

                {/* planet 3 */}
                <Ring3>
                    <line x1={cx} y1={cy} x2={cx + 54} y2={cy - 20} stroke="#1a1208" strokeWidth="1" opacity="0.35" />
                    <circle cx={cx + 54} cy={cy - 20} r="4.5" fill="#2a1f0e" stroke="#1a1208" strokeWidth="1" />
                    <circle cx={cx + 54} cy={cy - 20} r="2.5" fill="#3a2e1a" />
                </Ring3>

                {/* planet 4 — outermost, slowest */}
                <Ring4>
                    <line x1={cx} y1={cy} x2={cx + 70} y2={cy - 26} stroke="#1a1208" strokeWidth="1" opacity="0.3" />
                    <circle cx={cx + 70} cy={cy - 26} r="6" fill="#2a1f0e" stroke="#1a1208" strokeWidth="1" />
                    <circle cx={cx + 70} cy={cy - 26} r="3.5" fill="#3a2e1a" />
                </Ring4>

                {/* central hub cap */}
                <circle cx={cx} cy={cy} r="5" fill="#1a1208" />
                <circle cx={cx} cy={cy} r="3" fill="#2a1f0e" />

                <rect width="168" height="210" fill="transparent" filter="url(#or-grain)" opacity="0.15" />
            </svg>
        </Frame>
    );
}