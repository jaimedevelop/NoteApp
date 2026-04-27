import styled, { keyframes } from 'styled-components';

const flicker = keyframes`
  0%,100% { opacity: 1;   transform: scaleX(1)    scaleY(1); }
  20%      { opacity: .85; transform: scaleX(.92)  scaleY(1.06); }
  40%      { opacity: .95; transform: scaleX(1.05) scaleY(.97); }
  60%      { opacity: .80; transform: scaleX(.96)  scaleY(1.08); }
  80%      { opacity: .90; transform: scaleX(1.03) scaleY(.95); }
`;

const flickerInner = keyframes`
  0%,100% { opacity: 1;   transform: scaleX(1)    scaleY(1); }
  20%      { opacity: .95; transform: scaleX(1.05) scaleY(.97); }
  40%      { opacity: .85; transform: scaleX(.92)  scaleY(1.06); }
  60%      { opacity: .90; transform: scaleX(1.03) scaleY(.95); }
  80%      { opacity: .80; transform: scaleX(.96)  scaleY(1.08); }
`;

const bloom = keyframes`
  0%,100% { opacity: .18; r: 22px; }
  30%     { opacity: .30; r: 28px; }
  60%     { opacity: .14; r: 20px; }
`;

const glowRing = keyframes`
  0%,100% { opacity: .10; }
  50%     { opacity: .22; }
`;

const Frame = styled.div`
  border: 1px solid ${p => p.theme.colors.inkSecondary};
  background: ${p => p.theme.colors.pageBg};
  position: relative;
  overflow: hidden;
  box-shadow: inset 0 0 12px rgba(0,0,0,0.08);
  padding: 8px;

  &::before {
    content: '';
    position: absolute;
    inset: 3px;
    border: 1px solid ${p => p.theme.colors.borderLight};
    pointer-events: none;
    z-index: 10;
  }
`;

const Flame = styled.g`
  transform-origin: 50% 90%;
  animation: ${flicker} 2.3s ease-in-out infinite;
`;

const FlameInner = styled.g`
  transform-origin: 50% 90%;
  animation: ${flickerInner} 1.7s ease-in-out infinite;
`;

const Bloom = styled.circle`
  animation: ${bloom} 2.3s ease-in-out infinite;
`;

const GlowRing = styled.circle`
  animation: ${glowRing} 2.3s ease-in-out infinite;
`;

export default function GasLamp() {
    return (
        <Frame>
            <svg viewBox="0 0 168 220" width="100%" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block' }}>
                <defs>
                    <filter id="gl-grain">
                        <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
                        <feColorMatrix type="saturate" values="0" />
                        <feBlend in="SourceGraphic" mode="multiply" />
                    </filter>
                    <radialGradient id="gl-bloom" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#f5d070" stopOpacity="0.9" />
                        <stop offset="100%" stopColor="#f5d070" stopOpacity="0" />
                    </radialGradient>
                    <pattern id="gl-hatch" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                        <line x1="0" y1="0" x2="0" y2="4" stroke="#3a2e1a" strokeWidth="0.4" opacity="0.3" />
                    </pattern>
                </defs>

                <rect width="168" height="220" fill="#e8e0cc" />
                <rect width="168" height="220" fill="url(#gl-hatch)" />

                {/* ground */}
                <rect x="0" y="190" width="168" height="30" fill="#2a1f0e" />
                <line x1="0" y1="192" x2="168" y2="192" stroke="#1a1208" strokeWidth="1" />
                <g stroke="#3a2e1a" strokeWidth="0.5" opacity="0.7">
                    <line x1="20" y1="195" x2="60" y2="195" />
                    <line x1="70" y1="200" x2="110" y2="200" />
                    <line x1="5" y1="205" x2="55" y2="205" />
                    <line x1="65" y1="210" x2="130" y2="210" />
                    <line x1="0" y1="215" x2="45" y2="215" />
                    <line x1="115" y1="205" x2="168" y2="205" />
                    <line x1="140" y1="196" x2="168" y2="196" />
                </g>

                {/* post */}
                <rect x="80" y="80" width="8" height="112" fill="#1a1208" />
                <rect x="74" y="185" width="20" height="6" rx="2" fill="#1a1208" />
                <rect x="70" y="189" width="28" height="4" rx="1" fill="#1a1208" />

                {/* arm */}
                <path d="M84,90 Q110,88 112,75" stroke="#1a1208" strokeWidth="3" fill="none" />
                <rect x="109" y="70" width="4" height="8" fill="#1a1208" />

                {/* bloom */}
                <Bloom cx="84" cy="62" r={22} fill="url(#gl-bloom)" opacity="0.18" />
                <GlowRing cx="84" cy="62" r={38} fill="url(#gl-bloom)" opacity="0.08" />

                {/* lantern */}
                <g transform="translate(68,45)">
                    <polygon points="16,0 0,10 32,10" fill="#1a1208" />
                    <line x1="16" y1="0" x2="16" y2="-6" stroke="#1a1208" strokeWidth="2" />
                    <circle cx="16" cy="-8" r="3" fill="#1a1208" />

                    <rect x="2" y="10" width="28" height="32" rx="1" fill="#d4a020" fillOpacity="0.15" stroke="#1a1208" strokeWidth="1.2" />
                    <line x1="16" y1="10" x2="16" y2="42" stroke="#1a1208" strokeWidth="1" />
                    <line x1="2" y1="26" x2="30" y2="26" stroke="#1a1208" strokeWidth="1" />

                    {/* flame — centered in lower half of glass, contained within panel */}
                    <Flame transform="translate(10,26)">
                        <ellipse cx="6" cy="8" rx="4" ry="6" fill="#c8780a" opacity="0.9" />
                        <path d="M6,2 Q9,5 7,11 Q6,13 5,11 Q3,5 6,2Z" fill="#e8a020" />
                    </Flame>
                    <FlameInner transform="translate(12,29)">
                        <path d="M2,0 Q4,3 3,7 Q2,9 1,7 Q0,3 2,0Z" fill="#f5e070" opacity="0.95" />
                    </FlameInner>

                    <rect x="0" y="42" width="32" height="5" rx="1" fill="#1a1208" />
                </g>

                {/* ground glow */}
                <ellipse cx="84" cy="192" rx="30" ry="4" fill="#c8780a" opacity="0.12" />

                <rect width="168" height="220" fill="transparent" filter="url(#gl-grain)" opacity="0.18" />
            </svg>
        </Frame>
    );
}