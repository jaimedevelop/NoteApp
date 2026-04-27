import styled, { keyframes } from 'styled-components';

const roll = keyframes`
  0%,100% { transform: rotate(-3deg) translateY(0px); }
  50%      { transform: rotate(3deg)  translateY(-3px); }
`;
const wave1 = keyframes`
  0%   { d: path("M0,20 Q25,8 50,20 Q75,32 100,20 Q125,8 150,20 Q175,32 200,20 L200,40 L0,40Z"); }
  50%  { d: path("M0,20 Q25,32 50,20 Q75,8 100,20 Q125,32 150,20 Q175,8 200,20 L200,40 L0,40Z"); }
  100% { d: path("M0,20 Q25,8 50,20 Q75,32 100,20 Q125,8 150,20 Q175,32 200,20 L200,40 L0,40Z"); }
`;
const wave2 = keyframes`
  0%   { d: path("M0,24 Q30,12 60,24 Q90,36 120,24 Q150,12 180,24 L180,40 L0,40Z"); }
  50%  { d: path("M0,24 Q30,36 60,24 Q90,12 120,24 Q150,36 180,24 L180,40 L0,40Z"); }
  100% { d: path("M0,24 Q30,12 60,24 Q90,36 120,24 Q150,12 180,24 L180,40 L0,40Z"); }
`;
const sailBillow = keyframes`
  0%,100% { d: path("M8,0 Q22,18 8,36 L0,36 L0,0 Z"); }
  50%      { d: path("M8,0 Q28,18 8,36 L0,36 L0,0 Z"); }
`;
const sail2Billow = keyframes`
  0%,100% { d: path("M6,0 Q18,14 6,28 L0,28 L0,0 Z"); }
  50%      { d: path("M6,0 Q24,14 6,28 L0,28 L0,0 Z"); }
`;
const gull = keyframes`
  0%   { transform: translate(5px, 22px); }
  25%  { transform: translate(50px, 16px); }
  50%  { transform: translate(100px, 20px); }
  75%  { transform: translate(150px, 14px); }
  100% { transform: translate(5px, 22px); }
`;

const ShipGroup = styled.g`transform-origin: 100px 90px; animation: ${roll} 4s ease-in-out infinite;`;
const WavePath1 = styled.path`animation: ${wave1} 3s ease-in-out infinite;`;
const WavePath2 = styled.path`animation: ${wave2} 3.5s ease-in-out infinite;`;
const MainSail = styled.path`animation: ${sailBillow} 4s ease-in-out infinite;`;
const ForeSail = styled.path`animation: ${sail2Billow} 4s ease-in-out infinite reverse;`;
const GullGroup = styled.g`animation: ${gull} 9s ease-in-out infinite;`;

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

export default function Ship() {
    return (
        <Frame>
            <svg viewBox="0 0 200 160" width="100%" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block' }}>
                <defs>
                    <pattern id="sh-hatch" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                        <line x1="0" y1="0" x2="0" y2="4" stroke="#3a2e1a" strokeWidth="0.4" opacity="0.3" />
                    </pattern>
                </defs>

                <rect width="200" height="160" fill="#e8e0cc" />
                <rect width="200" height="160" fill="url(#sh-hatch)" />

                {/* sky lines */}
                <g stroke="#3a2e1a" strokeWidth="0.3" opacity="0.15">
                    {[15, 25, 35, 45, 55, 65, 75].map(y => <line key={y} x1="0" y1={y} x2="200" y2={y} />)}
                </g>

                {/* clouds */}
                <g fill="#1a1208" opacity="0.08">
                    <ellipse cx="30" cy="20" rx="22" ry="9" />
                    <ellipse cx="50" cy="16" rx="18" ry="7" />
                    <ellipse cx="140" cy="25" rx="25" ry="8" />
                    <ellipse cx="160" cy="20" rx="16" ry="6" />
                </g>

                {/* seagull */}
                <GullGroup>
                    <path d="M0,0 Q3,-3 6,0 Q9,-3 12,0" stroke="#1a1208" strokeWidth="1.2" fill="none" />
                </GullGroup>

                {/* sea base */}
                <rect x="0" y="100" width="200" height="60" fill="#1a1208" opacity="0.12" />

                {/* back wave */}
                <WavePath2
                    d="M0,24 Q30,12 60,24 Q90,36 120,24 Q150,12 180,24 L180,40 L0,40Z"
                    transform="translate(0,84)"
                    fill="#1a1208"
                    opacity="0.08"
                />

                <ShipGroup>
                    {/* hull */}
                    <path d="M40,100 L160,100 L150,118 L50,118 Z" fill="#1a1208" />
                    <line x1="50" y1="104" x2="150" y2="104" stroke="#e8e0cc" strokeWidth="0.8" opacity="0.4" />
                    <line x1="52" y1="109" x2="148" y2="109" stroke="#e8e0cc" strokeWidth="0.8" opacity="0.4" />
                    <path d="M40,100 L160,100" stroke="#3a2e1a" strokeWidth="1.5" />

                    {/* bowsprit */}
                    <line x1="40" y1="98" x2="18" y2="82" stroke="#1a1208" strokeWidth="2" />

                    {/* masts */}
                    <line x1="100" y1="98" x2="100" y2="42" stroke="#1a1208" strokeWidth="2.5" />
                    <line x1="70" y1="98" x2="70" y2="52" stroke="#1a1208" strokeWidth="2" />
                    <line x1="130" y1="98" x2="130" y2="62" stroke="#1a1208" strokeWidth="1.5" />

                    {/* yards */}
                    <line x1="76" y1="52" x2="124" y2="52" stroke="#1a1208" strokeWidth="1.5" />
                    <line x1="54" y1="60" x2="86" y2="60" stroke="#1a1208" strokeWidth="1.2" />

                    {/* main sail */}
                    <g transform="translate(76,52)">
                        <MainSail d="M8,0 Q22,18 8,36 L0,36 L0,0 Z" fill="#1a1208" opacity="0.75" />
                        <line x1="0" y1="12" x2="10" y2="12" stroke="#e8e0cc" strokeWidth="0.5" opacity="0.4" />
                        <line x1="0" y1="24" x2="8" y2="24" stroke="#e8e0cc" strokeWidth="0.5" opacity="0.4" />
                    </g>

                    {/* fore sail */}
                    <g transform="translate(54,60)">
                        <ForeSail d="M6,0 Q18,14 6,28 L0,28 L0,0 Z" fill="#1a1208" opacity="0.65" />
                    </g>

                    {/* rigging */}
                    <g stroke="#1a1208" strokeWidth="0.7" opacity="0.6">
                        <line x1="100" y1="42" x2="160" y2="100" />
                        <line x1="100" y1="42" x2="40" y2="100" />
                        <line x1="70" y1="52" x2="40" y2="100" />
                        <line x1="70" y1="52" x2="18" y2="82" />
                        <line x1="100" y1="42" x2="130" y2="62" />
                    </g>

                    {/* flag */}
                    <path d="M100,42 L114,46 L100,50 Z" fill="#1a1208" />
                </ShipGroup>

                {/* front wave (over hull waterline) */}
                <WavePath1
                    d="M0,20 Q25,8 50,20 Q75,32 100,20 Q125,8 150,20 Q175,32 200,20 L200,40 L0,40Z"
                    transform="translate(0,96)"
                    fill="#e8e0cc"
                    opacity="0.55"
                />

                {/* foam */}
                <g fill="#e8e0cc" opacity="0.7">
                    <ellipse cx="30" cy="118" rx="4" ry="1.5" />
                    <ellipse cx="80" cy="122" rx="3" ry="1.2" />
                    <ellipse cx="150" cy="116" rx="5" ry="1.5" />
                    <ellipse cx="180" cy="120" rx="3" ry="1" />
                </g>
            </svg>
        </Frame>
    );
}