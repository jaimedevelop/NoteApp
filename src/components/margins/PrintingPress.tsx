import styled, { keyframes } from 'styled-components';

const rollDown = keyframes`
  0%,100% { transform: translateY(0px); }
  50%      { transform: translateY(6px); }
`;
const rollUp = keyframes`
  0%,100% { transform: translateY(0px); }
  50%      { transform: translateY(-6px); }
`;
const spin = keyframes`
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
`;
const spinSlow = keyframes`
  from { transform: rotate(0deg); }
  to   { transform: rotate(-360deg); }
`;
const feedPaper = keyframes`
  0%   { transform: translateY(0px); }
  100% { transform: translateY(18px); }
`;
const inkPulse = keyframes`
  0%,100% { opacity: 0.7; }
  50%      { opacity: 1; }
`;

const Platen = styled.g`animation: ${rollDown} 1.8s ease-in-out infinite;`;
const RollerTop = styled.g`animation: ${rollUp}   1.8s ease-in-out infinite;`;
const Gear1 = styled.g`transform-origin: 134px 68px; animation: ${spin}     3.6s linear infinite;`;
const Gear2 = styled.g`transform-origin: 152px 76px; animation: ${spinSlow} 2.4s linear infinite;`;
const Paper = styled.g`animation: ${feedPaper} 1.8s ease-in-out infinite alternate;`;
const InkBlot = styled.ellipse`animation: ${inkPulse} 1.8s ease-in-out infinite;`;

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

export default function PrintingPress() {
    return (
        <Frame>
            <svg viewBox="0 0 168 200" width="100%" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block' }}>
                <defs>
                    <pattern id="pp-hatch" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                        <line x1="0" y1="0" x2="0" y2="4" stroke="#3a2e1a" strokeWidth="0.4" opacity="0.3" />
                    </pattern>
                    <filter id="pp-grain">
                        <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
                        <feColorMatrix type="saturate" values="0" />
                        <feBlend in="SourceGraphic" mode="multiply" />
                    </filter>
                </defs>

                <rect width="168" height="200" fill="#e8e0cc" />
                <rect width="168" height="200" fill="url(#pp-hatch)" />

                {/* floor */}
                <rect x="0" y="168" width="168" height="32" fill="#2a1f0e" opacity="0.5" />
                <line x1="0" y1="168" x2="168" y2="168" stroke="#1a1208" strokeWidth="1.5" />

                {/* press frame — main body */}
                <rect x="30" y="50" width="100" height="120" rx="2" fill="#2a1f0e" />
                <rect x="34" y="54" width="92" height="112" rx="1" fill="#3a2e1a" />

                {/* vertical side columns */}
                <rect x="30" y="40" width="14" height="130" fill="#1a1208" />
                <rect x="116" y="40" width="14" height="130" fill="#1a1208" />

                {/* top cross-beam */}
                <rect x="24" y="38" width="118" height="14" rx="2" fill="#1a1208" />
                <rect x="28" y="42" width="110" height="6" rx="1" fill="#2a1f0e" />

                {/* base / bed */}
                <rect x="22" y="158" width="122" height="12" rx="2" fill="#1a1208" />

                {/* screw shaft */}
                <rect x="78" y="14" width="10" height="36" fill="#1a1208" />
                {/* screw thread marks */}
                {[16, 20, 24, 28, 32, 36, 40, 44].map(y => (
                    <line key={y} x1="78" y1={y} x2="88" y2={y} stroke="#3a2e1a" strokeWidth="0.8" />
                ))}
                {/* handle cross-bar */}
                <rect x="54" y="12" width="58" height="6" rx="3" fill="#1a1208" />
                <circle cx="54" cy="15" r="5" fill="#2a1f0e" stroke="#1a1208" strokeWidth="1" />
                <circle cx="112" cy="15" r="5" fill="#2a1f0e" stroke="#1a1208" strokeWidth="1" />

                {/* platen (moving press plate) */}
                <Platen>
                    <rect x="44" y="80" width="78" height="18" rx="1" fill="#1a1208" />
                    <rect x="46" y="82" width="74" height="14" rx="1" fill="#2a1f0e" />
                    {/* ink surface */}
                    <InkBlot cx="83" cy="89" rx="30" ry="4" fill="#1a1208" opacity="0.7" />
                </Platen>

                {/* roller top */}
                <RollerTop>
                    <rect x="44" y="100" width="78" height="12" rx="6" fill="#1a1208" />
                    <rect x="46" y="102" width="74" height="8" rx="4" fill="#3a2e1a" />
                </RollerTop>

                {/* paper feed */}
                <Paper>
                    {/* blank paper sheet */}
                    <rect x="60" y="108" width="46" height="54" fill="#f5f0e8" stroke="#c8b89a" strokeWidth="0.8" />
                    {/* printed lines on paper */}
                    {[116, 121, 126, 131, 136, 141, 146, 151].map((y, i) => (
                        <line key={y} x1="64" y1={y} x2={i % 3 === 2 ? 90 : 102} y2={y}
                            stroke="#3a2e1a" strokeWidth="0.7" opacity="0.6" />
                    ))}
                </Paper>

                {/* gears top-right */}
                <Gear1>
                    <circle cx="134" cy="68" r="14" fill="none" stroke="#1a1208" strokeWidth="2.5" />
                    <circle cx="134" cy="68" r="9" fill="#2a1f0e" stroke="#1a1208" strokeWidth="1" />
                    {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map(deg => {
                        const r = deg * Math.PI / 180;
                        const x1 = 134 + Math.cos(r) * 11;
                        const y1 = 68 + Math.sin(r) * 11;
                        const x2 = 134 + Math.cos(r) * 15;
                        const y2 = 68 + Math.sin(r) * 15;
                        return <line key={deg} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#1a1208" strokeWidth="3" />;
                    })}
                    <circle cx="134" cy="68" r="3" fill="#1a1208" />
                </Gear1>
                <Gear2>
                    <circle cx="152" cy="76" r="10" fill="none" stroke="#1a1208" strokeWidth="2" />
                    <circle cx="152" cy="76" r="6" fill="#2a1f0e" stroke="#1a1208" strokeWidth="1" />
                    {[0, 45, 90, 135, 180, 225, 270, 315].map(deg => {
                        const r = deg * Math.PI / 180;
                        const x1 = 152 + Math.cos(r) * 7;
                        const y1 = 76 + Math.sin(r) * 7;
                        const x2 = 152 + Math.cos(r) * 11;
                        const y2 = 76 + Math.sin(r) * 11;
                        return <line key={deg} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#1a1208" strokeWidth="2.5" />;
                    })}
                    <circle cx="152" cy="76" r="2.5" fill="#1a1208" />
                </Gear2>

                <rect width="168" height="200" fill="transparent" filter="url(#pp-grain)" opacity="0.15" />
            </svg>
        </Frame>
    );
}