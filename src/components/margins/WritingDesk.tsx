import styled, { keyframes } from 'styled-components';

const dip = keyframes`
  0%,100% { transform: rotate(-8deg) translateY(0px); }
  40%      { transform: rotate(-14deg) translateY(2px); }
  60%      { transform: rotate(-6deg) translateY(-1px); }
`;
const inkRipple = keyframes`
  0%,100% { rx: 6px; ry: 3px; opacity: 0.7; }
  50%      { rx: 7px; ry: 3.5px; opacity: 1; }
`;
const steamRise = keyframes`
  0%   { transform: translateY(0px) translateX(0px); opacity: 0.5; }
  50%  { transform: translateY(-8px) translateX(2px); opacity: 0.3; }
  100% { transform: translateY(-14px) translateX(-1px); opacity: 0; }
`;
const steam2 = keyframes`
  0%   { transform: translateY(0px) translateX(0px); opacity: 0.4; }
  50%  { transform: translateY(-10px) translateX(-2px); opacity: 0.2; }
  100% { transform: translateY(-18px) translateX(1px); opacity: 0; }
`;

const Quill = styled.g`transform-origin: 90px 110px; animation: ${dip} 3s ease-in-out infinite;`;
const InkRipple = styled.ellipse`animation: ${inkRipple} 3s ease-in-out infinite;`;
const Steam1 = styled.path`animation: ${steamRise} 2.5s ease-in-out infinite;`;
const Steam2 = styled.path`animation: ${steam2}    2.5s ease-in-out 0.8s infinite;`;

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

export default function WritingDesk() {
    return (
        <Frame>
            <svg viewBox="0 0 168 190" width="100%" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block' }}>
                <defs>
                    <pattern id="wd-hatch" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                        <line x1="0" y1="0" x2="0" y2="4" stroke="#3a2e1a" strokeWidth="0.4" opacity="0.3" />
                    </pattern>
                    <filter id="wd-grain">
                        <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
                        <feColorMatrix type="saturate" values="0" />
                        <feBlend in="SourceGraphic" mode="multiply" />
                    </filter>
                </defs>

                <rect width="168" height="190" fill="#e8e0cc" />
                <rect width="168" height="190" fill="url(#wd-hatch)" />

                {/* desk surface */}
                <rect x="8" y="118" width="150" height="10" rx="2" fill="#1a1208" />
                <rect x="4" y="126" width="158" height="6" rx="1" fill="#2a1f0e" />
                {/* desk legs */}
                <rect x="18" y="132" width="10" height="50" fill="#1a1208" />
                <rect x="138" y="132" width="10" height="50" fill="#1a1208" />
                <rect x="14" y="176" width="18" height="6" rx="1" fill="#1a1208" />
                <rect x="134" y="176" width="18" height="6" rx="1" fill="#1a1208" />

                {/* scattered letters on desk */}
                <g transform="rotate(-6,50,110)">
                    <rect x="20" y="96" width="52" height="26" fill="#f5f0e8" stroke="#c8b89a" strokeWidth="0.8" />
                    {[101, 106, 111, 116].map(y => (
                        <line key={y} x1="24" y1={y} x2={y === 111 ? 46 : 68} y2={y}
                            stroke="#3a2e1a" strokeWidth="0.6" opacity="0.5" />
                    ))}
                </g>
                <g transform="rotate(4,110,108)">
                    <rect x="88" y="92" width="44" height="28" fill="#f5f0e8" stroke="#c8b89a" strokeWidth="0.8" />
                    {[98, 103, 108, 114].map(y => (
                        <line key={y} x1="92" y1={y} x2={y === 108 ? 112 : 128} y2={y}
                            stroke="#3a2e1a" strokeWidth="0.6" opacity="0.5" />
                    ))}
                </g>

                {/* inkwell */}
                <ellipse cx="50" cy="112" rx="12" ry="5" fill="#1a1208" />
                <path d="M38,108 Q38,95 50,95 Q62,95 62,108" fill="#1a1208" />
                <ellipse cx="50" cy="108" rx="10" ry="4" fill="#2a1f0e" />
                <InkRipple cx="50" cy="108" rx="6" ry="3" fill="#0a0805" opacity="0.7" />

                {/* quill pen */}
                <Quill>
                    {/* shaft */}
                    <line x1="60" y1="100" x2="108" y2="56" stroke="#c8a050" strokeWidth="1.5" />
                    {/* barbs left */}
                    {[0, 6, 12, 18, 24, 30].map(i => (
                        <line key={i}
                            x1={60 + i * 0.8} y1={100 - i * 0.73}
                            x2={60 + i * 0.8 - 7 - i * 0.2} y2={100 - i * 0.73 - 5}
                            stroke="#d4b060" strokeWidth="0.8" opacity="0.8" />
                    ))}
                    {/* barbs right */}
                    {[0, 6, 12, 18, 24, 30].map(i => (
                        <line key={i}
                            x1={60 + i * 0.8} y1={100 - i * 0.73}
                            x2={60 + i * 0.8 + 5 + i * 0.15} y2={100 - i * 0.73 - 4}
                            stroke="#d4b060" strokeWidth="0.8" opacity="0.7" />
                    ))}
                    {/* nib */}
                    <path d="M60,100 L56,106 L64,106 Z" fill="#1a1208" />
                </Quill>

                {/* teacup */}
                <g transform="translate(110,90)">
                    {/* saucer */}
                    <ellipse cx="18" cy="30" rx="20" ry="5" fill="#2a1f0e" />
                    <ellipse cx="18" cy="29" rx="18" ry="4" fill="#3a2e1a" />
                    {/* cup body */}
                    <path d="M6,14 Q4,26 8,28 Q18,32 28,28 Q32,26 30,14 Z" fill="#2a1f0e" />
                    <path d="M8,14 Q8,26 18,28 Q28,26 28,14 Z" fill="#3a2e1a" />
                    {/* tea surface */}
                    <ellipse cx="18" cy="14" rx="10" ry="4" fill="#4a3010" opacity="0.9" />
                    {/* handle */}
                    <path d="M28,18 Q38,18 38,22 Q38,26 28,24" fill="none" stroke="#2a1f0e" strokeWidth="2.5" />
                    {/* steam */}
                    <Steam1 d="M14,10 Q15,6 14,2" fill="none" stroke="#3a2e1a" strokeWidth="1.2" strokeLinecap="round" />
                    <Steam2 d="M20,10 Q21,5 19,1" fill="none" stroke="#3a2e1a" strokeWidth="1.2" strokeLinecap="round" />
                </g>

                {/* candle stub */}
                <rect x="130" y="98" width="10" height="18" rx="1" fill="#f5e8c0" />
                <rect x="132" y="95" width="6" height="4" rx="0.5" fill="#e8d090" />
                {/* flame */}
                <ellipse cx="135" cy="94" rx="2.5" ry="4" fill="#c8780a" opacity="0.9" />
                <ellipse cx="135" cy="93" rx="1.2" ry="2" fill="#f5e070" opacity="0.9" />
                {/* wax drip */}
                <path d="M130,106 Q128,112 130,116" fill="none" stroke="#f5e8c0" strokeWidth="2" strokeLinecap="round" />

                <rect width="168" height="190" fill="transparent" filter="url(#wd-grain)" opacity="0.15" />
            </svg>
        </Frame>
    );
}