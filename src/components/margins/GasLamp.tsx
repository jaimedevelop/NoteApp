import Engraving, { ink, paper, Lines } from './Engraving';
export default function GasLamp() {
 return <Engraving title='The evening gaslight, flickering above a cobbled street' caption='FIG. I · THE EVENING LIGHT' landscape={false}>{id => <><Lines x={15} y={25} width={210} count={38} gap={5}/>
<g opacity=".25"><path d="M5 186V105l29-16 29 16v81M185 190V120l25-18 25 18v70"/><Lines x={10} y={130} width={48} count={11}/><Lines x={191} y={138} width={42} count={10}/></g>
<path d="M0 213Q120 182 240 213V248H0Z" fill={`url(#${id}-hatch)`}/>
{Array.from({length:6},(_,i)=><path key={i} d={`M0 ${211+i*6}Q120 ${197+i*8} 240 ${211+i*6}`}/>)}
<ellipse cx="120" cy="209" rx="51" ry="10" fill={`url(#${id}-light)`} stroke="none"/>
<path d="M109 216h22l-4-10h-14zM115 205l2-94h6l2 94" fill={`url(#${id}-shade)`}/><path d="M112 129h16M114 193h12M119 132v57"/>
<path d="M124 125q37 0 35-24q-1-11-10-7q-8 4-2 9q5 2 5-3" strokeWidth="2"/>
<circle cx="120" cy="79" r="45" fill={`url(#${id}-light)`} stroke="none"/>
<path d="M99 61h42l-5 43h-32z" fill={paper}/><path d="M99 61h42l-21-18zM103 105h34v5h-34z" fill={`url(#${id}-cross)`}/>
<path d="M120 43V35M116 37h8M99 63h42M103 98h34M120 62v39M108 62l3 38M132 62l-3 38"/>
<g className="flame motion" stroke="none"><path d="M120 88q-9-5 0-21q-1 9 5 12q4 9-5 9" fill="#ad874c"/><path d="M120 86q-4-3 0-9q4 6 0 9" fill="#f7eed7"/></g><path d="M115 90h10v4h-10z" fill={ink}/></>}</Engraving>;
}
