import Engraving, { ink, paper, Lines } from './Engraving';
export default function Ship() {
 return <Engraving title='An old sailing ship rocking on engraved waves' caption='FIG. II · THE WESTWARD PASSAGE' landscape={true}>{id => <><Lines x={8} y={18} width={222} count={19} gap={4}/><path d="M12 40q15-16 34-9q12-19 33-3M158 29q17-13 35 0q17-7 33 4" opacity=".4"/>
<g className="float motion"><path d="M40 140q78 12 166-4l-20 26q-66 15-129-3z" fill={`url(#${id}-hatch)`}/><path d="M46 144q75 13 151-3M54 151q65 13 138-3M60 158q61 9 125-4"/>
<path d="M47 140L17 117M86 139V48M132 141V29M173 138V64" strokeWidth="2"/>
{[[86,53,29],[132,40,35],[173,70,23]].map(([x,y,w])=><g key={x}><path d={`M${x-w} ${y}h${w*2}`} strokeWidth="1.6"/><path d={`M${x-w+2} ${y+2}q${w} 10 ${w*2-4} 0l-4 39q${-w+2} -10 ${-w*2+12} 0z`} fill={paper}/><path d={`M${x-w+7} ${y+8}q${w/2} 13 4 29M${x+5} ${y+7}q10 13 2 25`} opacity=".5"/><path d={`M${x-w+3} ${y+4}l${w*2-10} 30`} opacity=".2"/></g>)}
<path d="M132 29L20 118l28 21M132 29l73 108M86 48l-39 92M173 64l30 72M73 141l13-87 16 89M119 142l13-110 17 111" strokeWidth=".6"/>
<path d="M132 29q10-7 23 0l-23 6" fill={ink}/><path d="M52 139h143" strokeWidth="2"/>
{Array.from({length:10},(_,i)=><circle key={i} cx={64+i*12} cy={151} r="1.5" fill={ink}/>)}</g>
<g className="waves motion">{Array.from({length:7},(_,i)=><path key={i} d={`M-40 ${161+i*4}q10-5 20 0t20 0t20 0t20 0t20 0t20 0t20 0t20 0t20 0t20 0t20 0t20 0t20 0t20 0`} strokeWidth={i%2?'.5':'1'}/>)}</g><path d="M172 19q4-5 8 0q4-5 8 0"/></>}</Engraving>;
}
