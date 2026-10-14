import Engraving, { ink, paper, Lines } from './Engraving';
export default function NewEnglandStreet() {
 return <Engraving title='An industrial city with smoke blooming from brick chimneys' caption='FIG. III · THE CITY AWAKENS' landscape={true}>{id => <><Lines x={8} y={12} width={224} count={26} gap={5}/><circle cx="204" cy="29" r="12" fill={paper}/><path d="M210 19q-15 9-3 21"/>
<g opacity=".3">{[8,35,70,108,143,175,208].map((x,i)=><path key={x} d={`M${x} 155V${100-i%3*12}h23v70`} fill={`url(#${id}-hatch)`}/>)}</g>
{[[17,96,35],[58,72,39],[105,89,57],[176,104,43]].map(([x,y,w],i)=><g key={x}><path d={`M${x} 174V${y}h${w}v${174-y}z`} fill={paper}/><path d={`M${x} ${y}l${w/2} -15 ${w/2} 15M${x-2} ${y+2}h${w+4}`} fill={`url(#${id}-hatch)`}/><rect x={x} y={y+3} width={w} height={171-y} fill={`url(#${id}-hatch)`}/><path d={`M${x+w-12} ${y-8}v-15h7v18`} fill={ink}/>
{Array.from({length:3},(_,row)=>Array.from({length:i===2?3:2},(_,col)=><g key={`${row}-${col}`}><rect x={x+6+col*15} y={y+13+row*24} width="9" height="15" fill={paper}/><path d={`M${x+10+col*15} ${y+13+row*24}v15m-4-8h9`}/></g>))}
<path d={`M${x+w/2-5} 174v-17q5-7 10 0v17`} fill={ink}/>
{Array.from({length:4},(_,j)=><g key={j} transform={`translate(${x+w-8} ${y-24})`}><g className="smoke motion" style={{transformOrigin:'0px 0px',animationDelay:`${-j*2.25-i}s`}} fill={`url(#${id}-cross)`} strokeWidth=".3"><path d="M-4 0q-10-8-3-14q-12-6-5-13q2-10 13-6q14-4 16 7q11 9-2 15q7 12-9 11z"/></g></g>)}</g>)}
<path d="M0 175H240M0 180h240" strokeWidth="1.5"/><Lines x={7} y={183} width={226} count={2} gap={3}/></>}</Engraving>;
}
