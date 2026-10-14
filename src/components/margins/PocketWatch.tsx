import Engraving, { ink, paper } from './Engraving';
export default function PocketWatch() {
 return <Engraving title='An engraved pocket watch with ticking hands' caption='FIG. V · A MATTER OF TIME' landscape={false}>{id => <><path d="M121 5q-21 9-3 19q19 7 2 15" strokeWidth="2"/><ellipse cx="120" cy="44" rx="12" ry="9"/><path d="M114 49h12v13h-12z" fill={`url(#${id}-hatch)`}/>
<circle cx="120" cy="126" r="85" fill={`url(#${id}-shade)`}/><circle cx="120" cy="126" r="80" fill={`url(#${id}-hatch)`}/><circle cx="120" cy="126" r="73" fill={paper}/><circle cx="120" cy="126" r="69"/>
{Array.from({length:60},(_,i)=><path key={i} transform={`rotate(${i*6} 120 126)`} d={`M120 59v${i%5===0?6:2}`} strokeWidth={i%5===0?1.4:.5}/>)}
{['XII','I','II','III','IV','V','VI','VII','VIII','IX','X','XI'].map((n,i)=><text key={n} x={120+Math.sin(i*Math.PI/6)*57} y={130-Math.cos(i*Math.PI/6)*57} fill={ink} stroke="none" textAnchor="middle" fontSize="11" fontFamily="Georgia">{n}</text>)}
<text x="120" y="104" textAnchor="middle" fontSize="6" fontFamily="Georgia" fill={ink} stroke="none" letterSpacing="1">CHRONOMÈTRE</text><circle cx="120" cy="162" r="16"/>{Array.from({length:12},(_,i)=><path key={i} transform={`rotate(${i*30} 120 162)`} d="M120 148v2"/>)}<path d="M120 162v-10"/>
<path d="M120 126l-24-32 8 29z" fill={ink}/><g className="minute motion"><path d="M120 126l-48 17 43-23z" fill={ink}/></g><g className="second motion"><path d="M120 137V65" stroke="#8c5e3b" strokeWidth=".8"/><circle cx="120" cy="139" r="3"/></g><circle cx="120" cy="126" r="4" fill={ink}/><path d="M64 189q53 40 111 0"/></>}</Engraving>;
}
