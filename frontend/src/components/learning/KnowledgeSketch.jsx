// Midpoint Riemann sums for the continuous positive function f(x) = .5 + .3x² on [0,2].
function RiemannSketch({ step }) {
  const f = x => .5 + .3*x*x;
  const curve = Array.from({length:81},(_,i)=>{const x=i/40;return `${i?'L':'M'}${52+100*x},${175-70*f(x)}`;}).join(' ');
  return <g data-riemann-function="0.5+0.3*x*x" data-riemann-interval="0,2">
    {[70,105,140].map(y=><path key={y} d={`M44 ${y}H268`} stroke="currentColor" opacity=".07"/>)}
    <path d="M39 175H272m-6-4 6 4-6 4M52 183V28m-4 6 4-6 4 6" stroke="currentColor" opacity=".45"/>
    {[4,8,16].map((n,index)=><g key={n} data-riemann-level={n} opacity={index===step%3?1:0}>
      {Array.from({length:n},(_,i)=>{const dx=2/n, sample=(i+.5)*dx, height=70*f(sample);return <rect key={i} className="concept-riemann-rectangle" data-sample={sample} x={52+i*100*dx} y={175-height} width={100*dx} height={height} fill="currentColor" fillOpacity=".12" stroke="currentColor" strokeOpacity=".45" strokeWidth=".8"/>;})}
      <path d={`M${52+100*2/n} 184v5h${100*2/n}v-5`} stroke="currentColor" opacity=".65"/>
      <text x={52+150*2/n} y="202" textAnchor="middle" fill="currentColor" fontSize="10">Δx</text>
    </g>)}
    <path d={curve} stroke="currentColor" strokeWidth="2.4"/>
    <text x="40" y="191" fill="currentColor" fontSize="11">a</text><text x="250" y="191" fill="currentColor" fontSize="11">b</text>
    <text x="228" y="43" fill="currentColor" fontSize="12">f(x)</text><text className="concept-riemann-count" x="77" y="45" fill="currentColor" fontSize="11">n = {[4,8,16][step%3]}</text>
    <text x="154" y="224" textAnchor="middle" fill="currentColor" fontSize="11">Sₙ → ∫ₐᵇ f(x) dx</text>
  </g>;
}

// Original, code-native illustrations. Every plotted curve uses the displayed parameters.
export default function KnowledgeSketch({ kind = 'curve', step = 0 }) {
  const a = [0.45, 0.8, 1.2][step % 3];
  const curve = Array.from({ length: 81 }, (_, i) => {
    const x = (i - 40) / 20;
    return `${i ? 'L' : 'M'}${150 + x * 57},${175 - a * x * x * 35}`;
  }).join(' ');
  const values = [[1, 2, 0, 1], [2, 0, 1, 1], [1, -1, 2, 1]][step % 3];
  return <svg viewBox="0 0 300 230" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" data-sketch-kind={kind}>
    {kind === 'matrix' ? <>
      <path d="M65 55H52V172H65M145 55H158V172H145M210 80H198V146H210M252 80H264V146H252" stroke="currentColor" strokeWidth="2" />
      {values.map((v, i) => <text key={i} x={80 + i % 2 * 50} y={96 + Math.floor(i / 2) * 50} fill="currentColor" textAnchor="middle" fontSize="26">{v}</text>)}
      <text x="173" y="122" fill="currentColor" fontSize="20">×</text><text x="230" y="108" fill="currentColor" fontSize="24">x</text><text x="230" y="139" fill="currentColor" fontSize="24">y</text>
      <rect className="concept-cell" x="65" y="69" width="30" height="36" fill="currentColor" opacity=".12" rx="3" /><path d="M45 200H255" stroke="currentColor" opacity=".2" /><text x="150" y="220" textAnchor="middle" fill="currentColor" fontSize="12">Ax = b</text>
    </> : kind === 'sql' ? <>
      {[30, 170].map((x, i) => <g key={x}><rect x={x} y="42" width="100" height="135" rx="5" stroke="currentColor" opacity=".65" /><path d={`M${x} 78H${x+100}M${x} 111H${x+100}M${x} 144H${x+100}M${x+36} 78V177`} stroke="currentColor" opacity=".25" />
        <rect x={x+1} y={79+step%3*33} width="98" height="31" fill="currentColor" opacity=".13" /><text x={x+50} y="65" textAnchor="middle" fill="currentColor" fontSize="12">{i ? 'courses' : 'learners'}</text>
        {[1, 2, 3].map((v,j) => <text key={v} x={x+18} y={100+j*33} textAnchor="middle" fill="currentColor" fontSize="12">{v}</text>)}</g>)}
      <path className="concept-flow-path" d={`M131 ${94+step%3*33}C150 85 150 165 169 ${94+step%3*33}`} stroke="currentColor" strokeWidth="2" /><circle className="concept-runner" cx="131" cy="94" r="4" fill="currentColor" /><text x="150" y="213" fill="currentColor" textAnchor="middle" fontSize="12">SELECT · JOIN · EXPLORE</text>
    </> : kind === 'vector' ? <>
      <path d="M48 183H265M65 200V30" stroke="currentColor" opacity=".35" />
      <path d={`M65 183L${170+step*20} ${94-step*15}M${170+step*20-15} ${94-step*15+3}L${170+step*20} ${94-step*15}L${170+step*20-4} ${94-step*15+15}`} stroke="currentColor" strokeWidth="3" strokeLinejoin="round" />
      <path d={`M65 ${94-step*15}H${170+step*20}V183`} stroke="currentColor" strokeDasharray="4 5" opacity=".4" /><circle className="concept-runner" cx={170+step*20} cy={94-step*15} r="6" fill="currentColor" /><text x="150" y="219" fill="currentColor" textAnchor="middle" fontSize="12">v = ({step+2}, {step+1})</text>
    </> : kind === 'optimize' ? <>
      {[1, 2, 3, 4].map(v => <ellipse key={v} cx="150" cy="119" rx={v*27} ry={v*18} transform="rotate(-25 150 119)" stroke="currentColor" opacity={v===step+1 ? .85 : .2} />)}
      <path className="concept-tangent" d="M45 183L250 53" stroke="currentColor" strokeWidth="2" /><circle className="concept-runner" cx="167" cy="105" r="6" fill="currentColor" /><text x="150" y="218" textAnchor="middle" fill="currentColor" fontSize="12">∇f = λ∇g</text>
    </> : kind === 'integral' ? <RiemannSketch step={step}/> : <>
      {[65, 110, 155, 200, 245].map(x => <path key={x} d={`M${x} 26V190`} stroke="currentColor" opacity=".07" />)}
      {[45, 90, 135, 180].map(y => <path key={y} d={`M30 ${y}H275`} stroke="currentColor" opacity=".07" />)}
      <path d="M30 175H275M150 195V22" stroke="currentColor" opacity=".4" />
      <path d={curve} stroke="currentColor" strokeWidth="2.5" />
      <path className="concept-tangent" d={`M166 ${175-a*35+2*a*35*.72}L245 ${175-a*35-2*a*35*.67}`} stroke="currentColor" strokeWidth="1.5" strokeDasharray="5 4" />
      <circle className="concept-runner" cx="207" cy={175-a*35} r="5" fill="currentColor" />
      <text x="150" y="218" textAnchor="middle" fill="currentColor" fontSize="12">{`f(x) = ${a}x²`}</text>
    </>}
  </svg>;
}
