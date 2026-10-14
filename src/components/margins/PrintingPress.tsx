import Engraving, { ink, paper, Lines, Gear } from './Engraving';
export default function PrintingPress() {
 return <Engraving title='A cast iron printing press slowly pulling the morning edition' caption='FIG. IV · THE MORNING EDITION' landscape={false}>{id => <><ellipse cx="121" cy="234" rx="91" ry="9" fill={`url(#${id}-hatch)`}/><path d="M39 225V76q0-12 12-12h135q12 0 12 12v149h-18V82H58v143z" fill={`url(#${id}-cross)`}/><path d="M33 226h174v8H33zM51 67h135v10H51z" fill={ink}/>
<path d="M111 36h16v43h-16z" fill={`url(#${id}-hatch)`}/><path d="M76 34h88" strokeWidth="5"/><circle cx="73" cy="34" r="6" fill={ink}/><circle cx="167" cy="34" r="6" fill={ink}/>
<Gear x={198} y={106}/><Gear x={215} y={131} r={11} reverse/>
<g className="press motion"><path d="M117 79v43" strokeWidth="7"/><path d="M65 120h110v12H65z" fill={`url(#${id}-shade)`}/><Lines x={70} y={123} width={100} count={2} gap={4}/></g>
<path d="M61 155h120v10H61zM63 166l-10 35h139l-12-35" fill={`url(#${id}-hatch)`}/><path d="M78 170h86l12 42H69z" fill={paper}/><text x="120" y="182" textAnchor="middle" fill={ink} stroke="none" fontSize="8" fontFamily="Georgia">THE DAILY</text><path d="M83 187h75"/><Lines x={80} y={191} width={33} count={4} gap={3}/><Lines x={122} y={191} width={34} count={4} gap={3}/><path d="M70 214h106M45 89v125M190 86v133"/></>}</Engraving>;
}
