import useMathPlayback from '../../hooks/useMathPlayback';
import { PlaybackControls } from './MatrixMovies';
import { MathText } from './StudyPrimitives';
const values = [1, 2, 3, 4, 5, 6];
export default function TransposeMatrixMovie() {
  const {
    attach,
    ...playback
  } = useMathPlayback(6, 1900);
  const active = playback.step >= 3 ? 4 : 1;
  const row = Math.floor(active / 3),
    column = active % 3;
  return <section className="math-explorer transpose-movie" ref={attach} aria-label="Trình diễn chuyển vị ma trận"><div className="math-explorer-heading"><span>Trình diễn toán học</span><h3>Đưa cả hàng sang, rồi xếp thành cột</h3><p>Mỗi hàng được chuyển sang phía phải như một nhóm. Sau đó hai phần tử sau hạ xuống để hàng ngang trở thành một cột dọc.</p></div><div className={`math-cinema-stage ${playback.step === 0 ? 'is-resetting' : ''}`} data-manual={playback.mode === 'manual'}><div className="math-cinema-status"><span><MathText inline>{"Chuy\u1EC3n v\u1ECB \xB7 $2 \\times  3 \\to  3 \\times  2$"}</MathText></span><span>{['Chuẩn bị', 'Đưa hàng 1 sang phải', 'Xếp hàng 1 thành cột 1', 'Đưa hàng 2 sang phải', 'Xếp hàng 2 thành cột 2', 'Hoàn tất'][playback.step]}</span></div><svg viewBox="0 0 700 305" className="transpose-transfer-svg" role="img" aria-label={`Chuyển vị ma trận, bước ${playback.step + 1} trong 6 bước`}>
      <foreignObject x="108" y="16" width="70" height="32"><div xmlns="http://www.w3.org/1999/xhtml" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}><MathText inline>{"$A$"}</MathText></div></foreignObject><foreignObject x="431" y="16" width="70" height="32"><div xmlns="http://www.w3.org/1999/xhtml" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}><MathText inline>{"$A^T$"}</MathText></div></foreignObject><path className="cinema-bracket" d="M45 70 H35 V248 H45 M245 70 H255 V248 H245 M395 70 H385 V248 H395 M535 70 H545 V248 H535" />
      <path className="cinema-transfer-guide" d={`M250,${125 + row * 64} Q325,50 ${435 + row * 64},95`} opacity={playback.step === 1 || playback.step === 3 ? 1 : 0} />
      {values.map((value, index) => {
          const i = Math.floor(index / 3),
            j = index % 3,
            moving = i === row && playback.step > 0 && playback.step < 5;
          return <g key={`source-${value}`} className={moving ? 'cinema-source-active' : ''}><rect className="cinema-source-cell" x={51 + j * 64} y={101 + i * 64} width="48" height="48" rx="8" /><foreignObject x={51 + j * 64} y={101 + i * 64} width="48" height="48"><div xmlns="http://www.w3.org/1999/xhtml" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%' }}><MathText inline>{"$" + value + "$"}</MathText></div></foreignObject></g>;
        })}
      {values.map((value, index) => {
          const i = Math.floor(index / 3),
            j = index % 3;
          return <rect key={`target-${value}`} className={`cinema-target-cell ${index === active ? 'target-active' : ''}`} x={411 + i * 64} y={71 + j * 64} width="48" height="48" rx="8" />;
        })}
      {[0, 1].map(i => {
          const lifted = playback.step >= (i === 0 ? 1 : 3),
            folded = playback.step >= (i === 0 ? 2 : 4);
          return <g className="cinema-row-traveler" key={i} style={{
            transform: `translate(${lifted ? 435 + i * 64 : 75}px,${lifted ? 95 : 125 + i * 64}px)`,
            opacity: lifted ? 1 : 0
          }}>{[0, 1, 2].map(j => <g className="cinema-row-cell" key={j} style={{
              transform: `translate(${folded ? 0 : j * 64}px,${folded ? j * 64 : 0}px)`,
              transitionDelay: `${j * 55}ms`
            }}><rect x="-24" y="-24" width="48" height="48" rx="8" className={i === 0 ? 'cinema-traveler-first' : 'cinema-traveler-second'} /><foreignObject x="-24" y="-24" width="48" height="48"><div xmlns="http://www.w3.org/1999/xhtml" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%' }}><MathText inline>{"$" + values[i * 3 + j] + "$"}</MathText></div></foreignObject></g>)}</g>;
        })}
      <foreignObject x="78" y="265" width="130" height="28"><div xmlns="http://www.w3.org/1999/xhtml" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%' }}><MathText inline>{"$2$ dòng · $3$ cột"}</MathText></div></foreignObject><foreignObject x="401" y="265" width="130" height="28"><div xmlns="http://www.w3.org/1999/xhtml" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%' }}><MathText inline>{"$3$ dòng · $2$ cột"}</MathText></div></foreignObject>
    </svg><div className="cinema-equation"><span className="cinema-source-chip">Hàng <MathText inline>{"$" + (row + 1) + "$"}</MathText> của <MathText inline>{"$A$"}</MathText></span><span className="cinema-equation-arrow">→</span><span className="cinema-target-chip">Cột <MathText inline>{"$" + (row + 1) + "$"}</MathText> của <MathText inline>{"$A^T$"}</MathText></span></div></div><PlaybackControls playback={playback} steps={6} label="chuyển vị" /><div className="math-explorer-conclusion"><MathText>{`Chỉ số dòng $${row + 1}$ và chỉ số cột $${column + 1}$ đổi chỗ. Giá trị $${values[active]}$ giữ nguyên. Tổng quát: $(A^T)_{ji}=a_{ij}$ và $(A^T)^T=A$.`}</MathText></div></section>;
}
