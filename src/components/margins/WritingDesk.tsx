import Engraving, { ink, paper, Lines } from './Engraving';
export default function WritingDesk() {
 return <Engraving title='A feather quill and flickering candle on a writer’s desk' caption='FIG. VI · BY CANDLELIGHT' landscape={false}>{id => <><path d="M17 18h98v135H17z"/><path d="M21 22h90v127H21zM66 22v127M21 87h90"/><Lines x={25} y={29} width={35} count={10} gap={5}/><path d="M78 37q13-20 25 0q-17 3-25 0" opacity=".3"/>
<path d="M6 180l221-13 8 14-223 16zM15 199v40h11l5-41M209 188v51h12v-52" fill={`url(#${id}-hatch)`}/><path d="M25 198h176v15H25z" fill={`url(#${id}-cross)`}/><circle cx="113" cy="205" r="2"/>
<path d="M83 159l65-7 18 26-65 7z" fill={paper}/><Lines x={102} y={165} width={43} count={4} gap={3}/><path d="M119 180q7-5 11-1t12-1"/>
<ellipse cx="71" cy="180" rx="19" ry="5"/><path d="M56 176v-18q15-9 30 0v18q-15 8-30 0" fill={`url(#${id}-shade)`}/><ellipse cx="71" cy="157" rx="15" ry="5" fill={ink}/><path d="M62 162v10" stroke={paper}/>
<g className="quill motion"><path d="M72 156Q96 108 122 64Q139 108 88 139" fill={paper}/><path d="M72 156L122 64"/>{Array.from({length:13},(_,i)=><path key={i} d={`M${84+i*2.5} ${133-i*5}l${9-i*.3} ${-2-i*.4}m${-9+i*.3} ${2+i*.4}l-5 -8`}/>)}</g>
<circle cx="183" cy="108" r="48" fill={`url(#${id}-light)`} stroke="none"/><path d="M176 154v-44h14v44" fill={paper}/><path d="M176 113q4-5 5 7t5 2v-9M183 110v-6"/>
<g transform="translate(63 16)"><g className="flame motion"><path d="M120 88q-9-6 0-23q10 17 0 23" fill="#b28d50"/><path d="M120 85q-4-3 0-9q4 6 0 9" fill={paper}/></g></g>
<path d="M183 156v12M169 169q14-8 28 0v4h-28z" fill={`url(#${id}-shade)`}/><path d="M170 153q13 5 26 0"/><path d="M28 178l15-2 4 7-16 2z" fill={ink}/></>}</Engraving>;
}
