import Engraving, { ink, paper, Lines } from './Engraving';
export default function Lighthouse() {
 return <Engraving title='A lighthouse sweeping its beam over the restless sea' caption='FIG. VIII · THE KEEPER’S LIGHT' landscape={false}>{id => <><Lines x={8} y={15} width={224} count={37} gap={5}/><path d="M17 46q20-13 36-3q15-20 44-7M21 53h63" opacity=".4"/><path d="M194 27q-15 14 1 22q-25-1-15-20" fill={paper}/>
<g className="beam motion"><path d="M146 65L0 13V120Z" fill="#c5ae75" stroke="none"/><path d="M146 65L0 13M146 65L0 120" strokeWidth=".4"/></g>
<path d="M119 208l12-121h30l16 121z" fill={paper}/><path d="M146 89h15l16 119h-24z" fill={`url(#${id}-hatch)`}/><path d="M129 111h34M127 134h39M124 157h45M121 180h51" strokeWidth="3"/><Lines x={133} y={92} width={18} count={23} gap={5}/><path d="M136 207v-21q7-11 14 0v21" fill={ink}/><path d="M138 137v-9h8v9" fill={ink}/>
<path d="M124 82h44v7h-44zM127 53h38l-19-17z" fill={`url(#${id}-cross)`}/><path d="M130 54h32v28h-32z" fill={paper}/><path d="M138 54v28M154 54v28M130 68h32M146 36V29"/><circle cx="146" cy="28" r="2" fill={ink}/><ellipse cx="146" cy="67" rx="6" ry="9" fill={`url(#${id}-light)`}/><path d="M120 77h52v12h-52z"/>{[122,130,138,146,154,162,170].map(x=><path key={x} d={`M${x} 77v12`}/>)}
<path d="M75 221l19-19 17 6 12-10 25 12 21-7 22 18 20 9H63z" fill={`url(#${id}-cross)`}/><path d="M89 220l11-12 13 8M157 217l14-9 13 14"/>
<g className="waves motion">{Array.from({length:6},(_,i)=><path key={i} d={`M-40 ${225+i*3}q10-4 20 0t20 0t20 0t20 0t20 0t20 0t20 0t20 0t20 0t20 0t20 0t20 0t20 0t20 0`} strokeWidth={i%2?.5:1}/>)}</g></>}</Engraving>;
}
