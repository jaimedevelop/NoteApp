import styled, { keyframes } from 'styled-components';

const sweep = keyframes`
  0%   { transform: rotate(-40deg); opacity: 0; }
  10%  { opacity: 0.35; }
  50%  { transform: rotate(40deg);  opacity: 0.35; }
  60%  { opacity: 0; }
  100% { transform: rotate(-40deg); opacity: 0; }
`;
const beamFade = keyframes`
  0%,100% { opacity: 0; }
  15%,45% { opacity: 0.18; }
`;
const waveShift = keyframes`
  0%   { transform: translateX(0); }
  100% { transform: translateX(-40px); }
`;
const rockSway = keyframes`
  0%,100% { transform: translateY(0); }
  50%      { transform: translateY(-1px); }
`;

const Beam = styled.g`transform-origin: 84px 42px; animation: ${sweep}    4s ease-in-out infinite;`;
const BeamGlow = styled.ellipse`animation: ${beamFade} 4s ease-in-out infinite;`;
const Waves = styled.g`animation: ${waveShift} 3s linear infinite;`;
const Rocks = styled.g`animation: ${rockSway}  5s ease-in-out infinite;`;

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

export default function Lighthouse() {
    return (
        <Frame>
            <svg viewBox="0 0 168 220" width="100%" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block' }}>
                <defs>
                    <pattern id="lh-hatch" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                        <line x1="0" y1="0" x2="0" y2="4" stroke="#3a2e1a" strokeWidth="0.4" opacity="0.3" />
                    </pattern>
                    <filter id="lh-grain">
                        <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
                        <feColorMatrix type="saturate" values="0" />
                        <feBlend in="SourceGraphic" mode="multiply" />
                    </filter>
                    <radialGradient id="lh-beam-grad" cx="0%" cy="50%" r="100%">
                        <stop offset="0%" stopColor="#f5d070" stopOpacity="0.6" />
                        <stop offset="100%" stopColor="#f5d070" stopOpacity="0" />
                    </radialGradient>
                    <clipPath id="lh-clip">
                        <rect width="168" height="220" />
                    </clipPath>
                </defs>

                <rect width="168" height="220" fill="#e8e0cc" />
                <rect width="168" height="220" fill="url(#lh-hatch)" />

                {/* night sky horizontal lines */}
                <g stroke="#3a2e1a" strokeWidth="0.25" opacity="0.12">
                    {[15, 25, 35, 45, 55, 65, 75, 85, 95, 105].map(y => (
                        <line key={y} x1="0" y1={y} x2="168" y2={y} />
                    ))}
                </g>

                {/* stars */}
                {[
                    [20, 18], [40, 30], [130, 12], [150, 28], [110, 40], [30, 55], [155, 50], [12, 44],
                    [145, 70], [60, 14], [90, 22], [70, 48]
                ].map(([x, y], i) => (
                    <circle key={i} cx={x} cy={y} r="0.8" fill="#3a2e1a" opacity="0.6" />
                ))}

                {/* sweeping beam — clipped to canvas */}
                <g clipPath="url(#lh-clip)">
                    <Beam>
                        <path d="M84,42 L168,0 L168,84 Z" fill="url(#lh-beam-grad)" />
                    </Beam>
                    <BeamGlow cx="120" cy="42" rx="50" ry="20" fill="#f5d070" opacity="0.08" />
                </g>

                {/* tower body — tapers slightly */}
                <path d="M70,160 L76,42 L92,42 L98,160 Z" fill="#1a1208" />
                {/* horizontal band markings */}
                {[70, 86, 102, 118, 134, 150].map(y => (
                    <rect key={y} x="70" y={y} width="28" height="5"
                        fill="#f5f0e8" opacity="0.12" />
                ))}
                {/* door */}
                <path d="M79,156 L79,142 Q84,136 89,142 L89,156 Z" fill="#2a1f0e" />

                {/* gallery / walkway platform */}
                <rect x="68" y="56" width="32" height="5" rx="1" fill="#1a1208" />
                {/* railing */}
                <rect x="66" y="50" width="36" height="8" rx="1" fill="none" stroke="#1a1208" strokeWidth="1.5" />
                {[70, 74, 78, 82, 86, 90, 94, 98].map(x => (
                    <line key={x} x1={x} y1="50" x2={x} y2="58" stroke="#1a1208" strokeWidth="0.8" />
                ))}

                {/* lantern room */}
                <rect x="74" y="32" width="20" height="20" fill="#2a1f0e" stroke="#1a1208" strokeWidth="1.2" />
                {/* lantern glass panels */}
                <rect x="76" y="34" width="7" height="16" fill="#d4a020" fillOpacity="0.2" />
                <rect x="85" y="34" width="7" height="16" fill="#d4a020" fillOpacity="0.15" />
                <line x1="84" y1="34" x2="84" y2="50" stroke="#1a1208" strokeWidth="1" />
                <line x1="74" y1="42" x2="94" y2="42" stroke="#1a1208" strokeWidth="1" />
                {/* lantern cap */}
                <polygon points="84,20 72,34 96,34" fill="#1a1208" />
                {/* finial */}
                <line x1="84" y1="20" x2="84" y2="14" stroke="#1a1208" strokeWidth="2" />
                <circle cx="84" cy="13" r="3" fill="#1a1208" />

                {/* rocks */}
                <Rocks>
                    <path d="M50,170 Q56,158 70,160 L70,178 L40,178 Z" fill="#2a1f0e" />
                    <path d="M90,162 Q102,155 112,162 L110,178 L88,178 Z" fill="#1a1208" />
                    <path d="M108,168 Q118,160 130,165 L128,178 L106,178 Z" fill="#2a1f0e" />
                    <path d="M30,172 Q40,165 52,170 L52,178 L28,178 Z" fill="#1a1208" />
                </Rocks>

                {/* sea */}
                <rect x="-40" y="172" width="248" height="48" fill="#1a1208" opacity="0.4" />
                <Waves>
                    {/* tiled wave pattern — extra wide so loop is seamless */}
                    {[-40, -20, 0, 20, 40, 60, 80, 100, 120, 140, 160].map(x => (
                        <path key={x}
                            d={`M${x},178 Q${x + 10},172 ${x + 20},178`}
                            fill="none" stroke="#e8e0cc" strokeWidth="1" opacity="0.3" />
                    ))}
                    {[-30, -10, 10, 30, 50, 70, 90, 110, 130, 150, 170].map(x => (
                        <path key={x}
                            d={`M${x},186 Q${x + 10},181 ${x + 20},186`}
                            fill="none" stroke="#e8e0cc" strokeWidth="0.8" opacity="0.2" />
                    ))}
                </Waves>
                <rect x="0" y="200" width="168" height="20" fill="#1a1208" opacity="0.5" />

                <rect width="168" height="220" fill="transparent" filter="url(#lh-grain)" opacity="0.15" />
            </svg>
        </Frame>
    );
}