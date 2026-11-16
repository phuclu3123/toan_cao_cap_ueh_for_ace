import { useId, useState } from 'react';
import useMathPlayback from '../../hooks/useMathPlayback';
import { PlaybackControls } from './MatrixMovies';
import { MatrixGrid } from './MatrixGeometryMovies';
import { MatrixFlowMovie } from './MatrixFlowMovie';
import { MathText } from './StudyPrimitives';
import { solveLeontief } from '../../utils/mathExplorers';
import '../../assets/styles/CourseScenes.css';
const R = String.raw;
const fmt = (v, n = 2) => new Intl.NumberFormat('vi-VN', {
  maximumFractionDigits: n
}).format(v);
export function Scene({
  id,
  title,
  description,
  steps = 7,
  interval = 1800,
  children
}) {
  const {
    attach,
    ...playback
  } = useMathPlayback(steps, interval);
  return <section className={`math-explorer course-scene scene-${id}`} ref={attach} data-scene={id} aria-label={title.replace(/\$\$?/g, '')}>
  <div className="math-explorer-heading"><span>Quan sát · lý giải · đối chiếu</span><h3><MathText inline>{title}</MathText></h3><p><MathText inline>{description}</MathText></p></div>
  <div className="course-stage">{children(playback.step, playback.mode)}</div>
  <PlaybackControls playback={playback} steps={steps} label={title} />
 </section>;
}
function Formula({
  children,
  tone = 'violet'
}) {
  return <div className={`course-formula tone-${tone}`}><MathText>{children}</MathText></div>;
}
function Reading({
  label,
  value,
  tone = 'blue'
}) {
  return <div className={`course-reading tone-${tone}`}><span><MathText inline>{label}</MathText></span><strong><MathText inline>{value}</MathText></strong></div>;
}
function Plot({
  fn,
  xmin = 0,
  xmax = 5,
  ymin = 0,
  ymax = 25,
  point,
  tangent,
  secant,
  delta = false,
  area = false,
  children,
  xlabel = 'x',
  ylabel = 'y',
  label = 'Đồ thị minh họa'
}) {
  const clipId = useId();
  const px = x => 45 + 420 * (x - xmin) / (xmax - xmin),
    py = y => 270 - 230 * (y - ymin) / (ymax - ymin);
  const curve = Array.from({
    length: 151
  }, (_, i) => {
    const x = xmin + i * (xmax - xmin) / 150;
    return `${i ? 'L' : 'M'}${px(x)},${py(fn(x))}`;
  }).join(' ');
  const [x, y] = point || [xmin, fn(xmin)];
  const [bx, by] = secant || [x, y];
  return <svg className="course-plot" viewBox="0 0 510 315" role="img" aria-label={label}>
  <defs><clipPath id={clipId}><rect x="45" y="30" width="420" height="240" /></clipPath></defs>
  {[0, 1, 2, 3, 4].map(i => <g key={i}><line x1="45" x2="465" y1={40 + i * 57.5} y2={40 + i * 57.5} className="course-grid" /><text x="35" y={44 + i * 57.5} textAnchor="end">{fmt(ymax - i * (ymax - ymin) / 4, 1)}</text><text x={45 + i * 105} y="292" textAnchor="middle">{fmt(xmin + i * (xmax - xmin) / 4, 1)}</text></g>)}
  <path d={`M45 ${py(Math.max(ymin, Math.min(ymax, 0)))}H480M${px(Math.max(xmin, Math.min(xmax, 0)))} 25V270`} className="course-axis" />
  <g clipPath={`url(#${clipId})`}>
  {area && <path className="course-area" d={`${curve} L465,270H45Z`} />}
  <path d={curve} className="course-curve" />
  {Number.isFinite(tangent) && <line className="course-tangent" x1={px(xmin)} x2={px(xmax)} y1={py(y + tangent * (xmin - x))} y2={py(y + tangent * (xmax - x))} />}
  {secant && <><line className="course-secant" x1={px(x)} y1={py(y)} x2={px(bx)} y2={py(by)} /><circle className="course-point secondary" cx={px(bx)} cy={py(by)} r="6" />{delta && <><path className="course-delta-x" d={`M${px(x)} ${py(y)}H${px(bx)}`} /><path className="course-delta-y" d={`M${px(bx)} ${py(y)}V${py(by)}`} /><foreignObject className="course-label-x" x={(px(x) + px(bx)) / 2 - 24} y={py(y) + 8} width="48" height="24"><div xmlns="http://www.w3.org/1999/xhtml"><MathText inline>{"$\\Delta x$"}</MathText></div></foreignObject><foreignObject className="course-label-y" x={px(bx) + 4} y={(py(y) + py(by)) / 2 - 12} width="48" height="24"><div xmlns="http://www.w3.org/1999/xhtml"><MathText inline>{"$\\Delta y$"}</MathText></div></foreignObject></>}</>}
  {point && <circle className="course-point" cx={px(x)} cy={py(y)} r="6" />}
  {children}</g><text x="484" y="290">{xlabel}</text><text x="23" y="23">{ylabel}</text>
 </svg>;
}
export function DimensionsScene() {
  const [rows, setRows] = useState(3),
    [cols, setCols] = useState(4);
  return <Scene id="dimensions" title="m dòng, n cột: địa chỉ của một phần tử" description="\u0110\u1EBFm c\u1EA5u tr\xFAc tr\u01B0\u1EDBc khi th\u1EF1c hi\u1EC7n ph\xE9p to\xE1n. Cam x\xE1c \u0111\u1ECBnh d\xF2ng i; xanh d\u01B0\u01A1ng x\xE1c \u0111\u1ECBnh c\u1ED9t j; giao \u0111i\u1EC3m l\xE0 $a_{ij}$." steps={rows * cols}>
  {step => {
      const i = Math.floor(step / cols) % rows,
        j = step % cols;
      return <>
   <div className="course-selects"><label>Số dòng m<select value={rows} onChange={e => setRows(+e.target.value)}>{[2, 3, 4].map(n => <option key={n}>{n}</option>)}</select></label><label>Số cột n<select value={cols} onChange={e => setCols(+e.target.value)}>{[2, 3, 4, 5].map(n => <option key={n}>{n}</option>)}</select></label></div>
   <div className="dimension-map"><div className="dimension-top"><MathText inline>{"$n=" + cols + "$"}</MathText> cột</div><div className="dimension-side"><MathText inline>{"$m=" + rows + "$"}</MathText> dòng</div><div className="dimension-grid" style={{
            gridTemplateColumns: `repeat(${cols},var(--course-cell))`
          }}>{Array.from({
              length: rows * cols
            }, (_, k) => {
              const r = Math.floor(k / cols),
                c = k % cols;
              return <span className={`${r === i ? 'dimension-row' : ''} ${c === j ? 'dimension-column' : ''} ${r === i && c === j ? 'dimension-intersection' : ''}`} key={k}><MathText inline>{"$a_{" + (r + 1) + (c + 1) + "}$"}</MathText></span>;
            })}</div></div>
   <div className="course-readings"><Reading label="Dòng $i$" value={"$" + (i + 1) + "$"} tone="orange" /><Reading label="Cột $j$" value={"$" + (j + 1) + "$"} /><Reading label="Phần tử đang xét" value={"$a_{" + (i + 1) + (j + 1) + "}$"} tone="violet" /></div><Formula>{`$A\\in\\mathbb R^{${rows}\\times${cols}}$: có ${rows * cols} phần tử. $a_{${i + 1}${j + 1}}$ nằm tại giao dòng ${i + 1}, cột ${j + 1}.`}</Formula>
  </>;
    }}
 </Scene>;
}
export function ScalarScene() {
  const [k, setK] = useState(-2);
  const a = [[1, -2, 0], [3, 4, -1]];
  return <Scene id="scalar" title="Một hệ số tác động lên toàn bộ ma trận" description="Giữ địa chỉ mỗi phần tử. Chỉ điền kết quả sau khi cặp hệ số và phần tử đã xuất hiện trong phép tính." steps={19} interval={900}>{step => {
      const cell = Math.min(5, Math.floor(step / 3)),
        phase = step % 3,
        i = Math.floor(cell / 3),
        j = cell % 3,
        done = Math.floor(step / 3) + (phase === 2 ? 1 : 0);
      return <>
  <label className="course-inline-control">Hệ số k<select value={k} onChange={e => setK(+e.target.value)}>{[-3, -2, -1, 0, 2, 3].map(n => <option key={n}>{n}</option>)}</select></label>
  <div className="course-matrices"><div><h4><MathText inline>{"$A$, kích thước $2\\times3$"}</MathText></h4><MatrixGrid matrix={a} highlight={(r, c) => r === i && c === j ? 'geometry-picked' : ''} /></div><strong><MathText inline>{"$k=" + k + "$"}</MathText></strong><div><h4><MathText inline>{"$kA$, kích thước $2\\times3$"}</MathText></h4><MatrixGrid matrix={a.map((row, r) => row.map((v, c) => r * 3 + c < done ? k * v : ''))} highlight={(r, c) => r === i && c === j ? 'geometry-retained' : ''} /></div></div>
  <div className="operand-calculation" key={`${cell}:${phase}:${k}`}><span className="operand orange"><MathText inline>{"$" + k + "$"}</MathText></span><span><MathText inline>{"$\\times$"}</MathText></span><span className="operand blue"><MathText inline>{"$" + a[i][j] + "$"}</MathText></span><span><MathText inline>{"$=$"}</MathText></span><strong className={phase === 2 ? 'operand violet' : 'operand hidden-result'}><MathText inline>{"$" + k * a[i][j] + "$"}</MathText></strong></div>
  <Formula>{`$(kA)_{${i + 1}${j + 1}}=${k}\\cdot(${a[i][j]})=${k * a[i][j]}$. Kích thước giữ nguyên; không chỉ nhân một dòng.`}</Formula>
 </>;
    }}</Scene>;
}
export function SystemMatrixScene({
  homogeneous = false
}) {
  const a = homogeneous ? [[1, 1, 1], [2, 2, 2]] : [[1, 1, -1], [2, 1, 0], [1, 0, -1]],
    b = homogeneous ? [0, 0] : [10, 5, 6];
  return <Scene id={homogeneous ? 'homogeneous' : 'system-matrix'} title={homogeneous ? "$B = 0$: t\u1EADp nghi\u1EC7m \u0111i qua g\u1ED1c" : 'Tách hệ phương trình thành A, X và B'} description="Hệ số màu cam, ẩn màu xanh dương và vế phải màu tím giữ nguyên vai trò khi đổi cách viết." steps={5}>{step => <>
  <div className="system-equations"><MathText>{homogeneous ? R`$$\begin{cases}x+y+z=0\\2x+2y+2z=0\end{cases}$$` : `$$\\begin{cases}x+y-z=${b[0]}\\\\2x+y=${b[1]}\\\\x-z=${b[2]}\\end{cases}$$`}</MathText><span className="course-equivalence"><MathText inline>{"$\\Longleftrightarrow$"}</MathText></span><div className="system-blocks"><div className={`system-block tone-orange ${step >= 1 ? 'revealed' : ''}`}><h4><MathText inline>{"$A \\cdot$ h\u1EC7 s\u1ED1"}</MathText></h4><MatrixGrid matrix={a} /></div><div className={`system-block tone-blue ${step >= 2 ? 'revealed' : ''}`}><h4><MathText inline>{"$X \\cdot$ \u1EA9n"}</MathText></h4><MatrixGrid matrix={[['x'], ['y'], ['z']]} /></div><span>=</span><div className={`system-block tone-violet ${step >= 3 ? 'revealed' : ''}`}><h4><MathText inline>{"$B \\cdot$ v\u1EBF ph\u1EA3i"}</MathText></h4><MatrixGrid matrix={b.map(v => [v])} /></div></div></div>
  <Formula>{homogeneous ? R`$r(A)=1$, có 3−1=2 ẩn tự do. $X=(-s-t,s,t)^T$. Với s=t=0 thu được nghiệm tầm thường; mọi s,t khác tạo các nghiệm trên mặt phẳng qua gốc.` : R`$A_{3\times3}X_{3\times1}=B_{3\times1}$. Hệ số của z ở phương trình 2 và y ở phương trình 3 là 0, phải giữ đúng ô.`}</Formula>
  {step === 4 && <div className="course-reveal"><h4>Ghép thêm cột B</h4><MatrixGrid matrix={a.map((row, i) => [...row, b[i]])} divider={3} /><p>[A | B] có {a.length} dòng, 4 cột. Khi khử dòng phải biến đổi cả cột B.</p></div>}
 </>}</Scene>;
}
export function RankScene() {
  const frames = [{
    matrix: [[1, 2, 1, 4], [2, -1, 6, 13], [0, 0, 0, 2], [0, 0, 0, 6]],
    nextRow: 1
  }, {
    matrix: [[1, 2, 1, 4], [0, -5, 4, 5], [0, 0, 0, 2], [0, 0, 0, 6]],
    operation: R`d_2\leftarrow d_2-2d_1`,
    row: 1,
    nextRow: 3
  }, {
    matrix: [[1, 2, 1, 4], [0, -5, 4, 5], [0, 0, 0, 2], [0, 0, 0, 0]],
    operation: R`d_4\leftarrow d_4-3d_3`,
    row: 3
  }];
  return <MatrixFlowMovie frames={frames} title="Đếm pivot sau khi đưa về bậc thang" description="Ma trận bậc thang cuối có hạng 3 dù chỉ hai ô đường chéo khác 0: pivot thứ ba nằm ở cột 4." conclusion={R`Sau khử có ba dòng khác 0, nên $r(A)=3$. Các cột trụ là 1,2,4. Không đếm đường chéo của ma trận chưa ở dạng bậc thang để kết luận hạng.`} label="tìm hạng" />;
}
export function RankCasesScene() {
  return <Scene id="rank-cases" title="Ba loại nghiệm được phân biệt bởi hai hạng" description="Đọc dòng cuối của ma trận mở rộng sau khử. Cột vế phải có thể tạo pivot mâu thuẫn." steps={3} interval={3200}>{step => {
      const last = [[0, 0, 1, 2], [0, 0, 0, 0], [0, 0, 0, 1]][step];
      return <><div className="course-case-tabs">{['Duy nhất', 'Vô số', 'Vô nghiệm'].map((v, i) => <span className={i === step ? 'active' : ''} key={v}>{v}</span>)}</div><div className="course-matrices"><MatrixGrid matrix={[[1, 1, 1, 3], [0, 1, -1, 0], last]} divider={3} highlight={i => i === 2 ? 'geometry-picked' : ''} /><div className="course-readings"><Reading label="r(A)" value={step === 0 ? 3 : 2} tone="orange" /><Reading label="r([A | B])" value={step === 1 ? 2 : 3} tone="violet" /></div></div><Formula>{[R`$r(A)=r([A|B])=3=n$. Không có ẩn tự do: z=2,y=2,x=−1.`, R`$r(A)=r([A|B])=2<3$. Đặt z=t, được y=t,x=3−2t.`, R`$r(A)=2<3=r([A|B])$. Dòng cuối $0=1$ không thể thỏa.`][step]}</Formula></>;
    }}</Scene>;
}
const ioA = [[.1, .2, .2], [.3, .2, .1], [.2, .3, .3]],
  ioX = [210, 180, 200],
  ioD = [113, 61, 44];
const ioTechA = [['0{,}1', '0{,}2', '0{,}2'], ['0{,}3', '0{,}2', '0{,}1'], ['0{,}2', '0{,}3', '0{,}3']],
  ioTechAprime = [['0{,}1', '0{,}2', '0{,}2'], ['0{,}2', '0{,}2', '0{,}1'], ['0{,}2', '0{,}3', '0{,}3']],
  ioTechImA = [['0{,}9', '-0{,}2', '-0{,}2'], ['-0{,}2', '0{,}8', '-0{,}1'], ['-0{,}2', '-0{,}3', '0{,}7']];
function IOTechnologyScene() {
  const matrixCard = (label, matrix, highlight) => <div className="io-tech-card"><h4><MathText inline>{label}</MathText></h4><MatrixGrid matrix={matrix} highlight={highlight} /></div>;
  return <Scene id="io-technology" title="Cải tiến kỹ thuật: đổi hệ số rồi giải lại cân đối" description="Lần theo hệ số ngành 2 cung cấp cho ngành 1: xác định ô thay đổi, lập ma trận mới, giải và kiểm tra sản lượng cân bằng." steps={6} interval={2800}>{step => <>
    {step <= 1 && <div className="io-tech-layout">
      {matrixCard('$A$: ma trận hệ số ban đầu', ioTechA, step === 1 ? (i, j) => i === 1 && j === 0 ? 'io-tech-changed' : '' : undefined)}
      <div className="io-tech-note"><MathText inline>{step === 0 ? 'Dữ liệu trước cải tiến: $D=(113,61,44)^T$' : 'Ngành $2$ cung cho ngành $1$: vị trí $(2,1)$ là $a_{21}=0{,}3$'}</MathText></div>
    </div>}
    {step === 0 && <div className="course-readings"><Reading label="$X$ trước cải tiến" value="$(210,180,200)^T$" tone="blue" /><Reading label="$D$ giữ cố định" value="$(113,61,44)^T$" tone="violet" /></div>}
    {step === 1 && <Formula>{'“Ngành $1$ tiết kiệm đầu vào từ ngành $2$” chỉ đến ô $a_{21}$: hàng là ngành cung cấp, cột là ngành nhận.'}</Formula>}
    {step === 2 && <><div className="io-tech-layout">{matrixCard('$A$: trước cải tiến', ioTechA)}<div className="io-tech-arrow">⟶</div>{matrixCard("$A'$: sau cải tiến", ioTechAprime, (i, j) => i === 1 && j === 0 ? 'io-tech-changed' : '')}</div><Formula>{'$a^{\\prime}_{21}=\\left(1-\\frac{1}{3}\\right)0{,}3=0{,}2$. Chỉ hệ số này thay đổi; $D$ và các ô còn lại được giữ nguyên theo giả thiết.'}</Formula></>}
    {(step === 3 || step === 4) && <><div className="io-tech-layout">{matrixCard("$I-A'$", ioTechImA)}<div className="io-tech-arrow">×</div><div className="io-tech-vector"><Reading label="$X'$" value={step === 3 ? '$(199{,}5262,149{,}1022,183{,}7656)^T$' : 'sản lượng cần tìm'} tone="violet" /><span>=</span><Reading label="$D$" value="$(113,61,44)^T$" tone="orange" /></div></div>
      {step === 3 ? <Formula>{"Giải hệ mới $(I-A')X'=D$ để tìm đồng thời cả ba thành phần của $X'$. Không thể suy ra $X'_2=\\frac{2}{3}X_2$."}</Formula> : <div className="io-tech-checks"><p><MathText inline>{"Ngành $1$: $0{,}1X^{\\prime}_1+0{,}2X^{\\prime}_2+0{,}2X^{\\prime}_3+113\\approx X^{\\prime}_1$"}</MathText></p><p><MathText inline>{"Ngành $2$: $0{,}2X^{\\prime}_1+0{,}2X^{\\prime}_2+0{,}1X^{\\prime}_3+61\\approx X^{\\prime}_2$"}</MathText></p><p><MathText inline>{"Ngành $3$: $0{,}2X^{\\prime}_1+0{,}3X^{\\prime}_2+0{,}3X^{\\prime}_3+44\\approx X^{\\prime}_3$"}</MathText></p></div>}</>}
    {step === 5 && <><div className="course-readings"><Reading label="Sản lượng ban đầu $X$" value="$(210,180,200)^T$" tone="blue" /><Reading label="Sản lượng mới $X'$" value="$(199{,}53,149{,}10,183{,}77)^T$" tone="violet" /><Reading label="Mức giảm $X-X'$" value="$(10{,}47,30{,}90,16{,}23)^T$" tone="orange" /></div><Formula>{'Nhu cầu cuối vẫn là $D=(113,61,44)^T$. Kết luận về sản lượng được rút ra sau khi giải và kiểm tra hệ số mới, không suy trực tiếp từ tỷ lệ tiết kiệm $\\frac{1}{3}$.'}</Formula></>}
  </>}</Scene>;
}
export function IOScene({
  kind = 'table'
}) {
  if (kind === 'technology') return <IOTechnologyScene />;
  const titles = {
    table: 'Bảng ba ngành: dòng cung, cột nhận',
    flows: 'Theo dõi giao dịch từ hệ số đến giá trị thực',
    balance: 'Tổng đầu ra bằng trung gian cộng nhu cầu cuối',
    demand: 'Công nghệ cố định, nhu cầu cuối thay đổi',
    technology: "S\u1EEDa $a_{21}$ r\u1ED3i gi\u1EA3i l\u1EA1i to\xE0n b\u1ED9 s\u1EA3n l\u01B0\u1EE3ng"
  };
  const steps = kind === 'table' ? 9 : kind === 'flows' ? 6 : 4;
  return <Scene id={`io-${kind}`} title={titles[kind]} description="Số liệu cùng đơn vị giá trị. Cam chỉ ngành cung cấp; xanh dương chỉ ngành nhận; tím chỉ giá trị giao dịch hoặc kết quả cân đối." steps={steps} interval={2600}>{step => {
      const changed = kind === 'technology' && step >= 1;
      const a = ioA.map(row => [...row]);
      if (changed) a[1][0] = .2;
      const d = kind === 'demand' && step >= 1 ? [123, 56, 49] : ioD;
      const output = changed || kind === 'demand' ? solveLeontief(a, d).output : ioX;
      const i = kind === 'table' ? Math.floor(step / 3) : kind === 'balance' ? Math.min(step, 2) : 1,
        j = kind === 'table' ? step % 3 : kind === 'flows' ? step % 3 : 0;
      const transactions = a.map(row => row.map((v, c) => v * output[c]));
      return <>
  <div className="io-table-wrap"><table className={`course-io-table ${kind === 'table' ? 'io-technical' : 'io-transactions'}`}><caption><MathText inline>{kind === 'table' ? "H\u1EC7 s\u1ED1 k\u1EF9 thu\u1EADt $a_{ij}$ tr\xEAn m\u1ED9t \u0111\u01A1n v\u1ECB ng\xE0nh nh\u1EADn" : "Giao d\u1ECBch th\u1EF1c $x_{ij} = a_{ij}X_{j}$"}</MathText></caption><thead><tr><th scope="col">Cung ↓ / Nhận →</th>{[1, 2, 3].map(n => <th scope="col" key={n} className={j === n - 1 ? 'io-receiver' : ''}>Ngành {n}</th>)}{kind !== 'table' && <><th scope="col"><MathText inline>{"$D_{i}$"}</MathText></th><th scope="col"><MathText inline>{"$X_{i}$"}</MathText></th></>}</tr></thead><tbody>{a.map((row, r) => <tr key={r}><th scope="row" className={r === i ? 'io-supplier' : ''}>Ngành {r + 1}</th>{row.map((v, c) => <td key={c} className={`${r === i ? 'io-row' : ''} ${c === j ? 'io-col' : ''} ${r === i && c === j ? 'io-picked' : ''} ${changed && r === 1 && c === 0 ? 'io-changed' : ''}`}>{fmt(kind === 'table' ? v : transactions[r][c])}</td>)}{kind !== 'table' && <><td>{d[r]}</td><td className="io-total">{fmt(output[r])}</td></>}</tr>)}</tbody></table></div>
{kind === 'table' ? <><div className="course-readings"><Reading label={"Ngành $" + (i + 1) + "$ cung cấp"} value={"$a_{" + (i + 1) + (j + 1) + "}=" + fmt(a[i][j]) + "$"} tone="orange" /><Reading label={"Sản lượng ngành nhận $" + (j + 1) + "$"} value={"$X_{" + (j + 1) + "}=" + output[j] + "$"} /><Reading label="Giao dịch thực" value={fmt(transactions[i][j])} tone="violet" /></div><Formula>{`$x_{${i + 1}${j + 1}}=${a[i][j]}\\cdot${output[j]}=${transactions[i][j]}$. Hệ số không phải lượng giao dịch thực.`}</Formula></> : kind === 'flows' ? <Formula>{step < 3 ? `Ngành 2 cung cho ngành ${j + 1}: $x_{2${j + 1}}=${a[1][j]}\\cdot${output[j]}=${transactions[1][j]}$.` : step === 3 ? R`Ngành 2 cung cả ba: $.3(210)+.2(180)+.1(200)=119$.` : step === 4 ? R`Cả ba cung ngành 3: $(.2+.1+.3)200=120$.` : R`Biết $x_{13}=40$: $X_3=40/.2=200$, rồi $x_{23}=.1(200)=20$.`}</Formula> : kind === 'balance' ? <Formula>{step < 3 ? `Ngành ${i + 1}: $${transactions[i].map(v => v.toFixed(0)).join('+')}+${ioD[i]}=${ioX[i]}$.` : R`Gộp ba dòng: $X=AX+D\iff(I-A)X=D$. Mọi ngành đều thỏa cân đối, không phải chỉ một dòng.`}</Formula> : kind === 'demand' ? <><Formula>{R`$\Delta D=(10,-5,5)^T$, $\Delta X=(I-A)^{-1}\Delta D$. A giữ nguyên.`}</Formula><div className="course-readings">{output.map((v, c) => <Reading key={c} label={`$\\Delta X_{${c + 1}}$`} value={`${v - ioX[c] >= 0 ? '+' : ''}${fmt(v - ioX[c])}`} tone={['orange', 'blue', 'violet'][c]} />)}</div><p>Biến động đầu ra phản ánh cả nhu cầu trực tiếp lẫn liên kết trung gian.</p></> : <><Formula>{step === 0 ? R`Ban đầu: $a_{21}=.3$, $X=(210,180,200)^T$.` : R`Ngành 1 tiết kiệm 1/3 đầu vào từ 2: $a'_{21}=.2$. Giữ $D=(113,61,44)^T$, giải $(I-A')X'=D$.`}</Formula><p>Ô đổi có viền tím. Các sản lượng được giải lại đồng thời; nhu cầu cuối vẫn là 113, 61, 44.</p></>}
 </>;
    }}</Scene>;
}
export function RateScene({
  kind = 'secant'
}) {
  const configs = {
    secant: ['Cát tuyến tiến tới tiếp tuyến', "$f(x)=x^{2}, x_{0}=2$. Cam l\xE0 $\\Delta x$; xanh l\xE0 $\\Delta y$; c\xE1t tuy\u1EBFn t\xEDm ti\u1EBFn v\u1EC1 ti\u1EBFp tuy\u1EBFn."],
    differential: ['Mức tăng thực và phần tuyến tính', "$f(x)=x^{2}, x_{0}=2$. Tr\xEAn c\xF9ng b\u01B0\u1EDBc ngang, \u0111\u1ED1i chi\u1EBFu \u0111\u01B0\u1EDDng cong v\u1EDBi ti\u1EBFp tuy\u1EBFn."],
    marginal: ["Biên và thay đổi hữu hạn tại x = 5","$y=4x^{2}+4x+3$. Với $\\Delta x$ nhỏ, mức tăng thực gần $dy=44\\Delta x$ tại $x=5$."],
    elasticity: ["Co giãn tại trạng thái x = 30","$y=\\frac{x}{\\sqrt{x+30}}$, $x_{0}=30$. Hệ số co giãn tại điểm này là $\\varepsilon_{y,x}=\\frac34$."],
    'average-marginal': ["Độ dốc tiếp tuyến khác độ dốc từ gốc","$y=x^{2}+4$. Cam biểu diễn độ dốc tiếp tuyến $2x$; tím biểu diễn độ dốc từ gốc $\\frac{f(x)}{x}$."],
  };
  const [title, description] = configs[kind];
  return <Scene id={kind} title={title} description={description} steps={8} interval={2400}>{step => {
      const average = kind === 'average-marginal',
        elastic = kind === 'elasticity',
        marginal = kind === 'marginal';
      const x = marginal ? 5 : average ? [1, 1.5, 1.8, 2, 2.2, 2.5, 3, 3.5][step] : elastic ? 30 : 2;
      const h = elastic ? [3, 2, 1, 0.5, 0.3, 0.15, 0.06, 0.03][step] : marginal ? [3, 2, 1, .5, .2, .1, .05, .02][step] : [2, 1.5, 1, .7, .4, .2, .1, .05][step];
      const f = marginal ? t => 4 * t * t + 4 * t + 3 : elastic ? t => t / Math.sqrt(t + 30) : t => t * t + (average ? 4 : 0),
        y = f(x),
        slope = marginal ? 8 * x + 4 : elastic ? (x + 60) / (2 * Math.pow(x + 30, 1.5)) : 2 * x,
        dy = slope * h,
        actual = f(x + h) - y;
      const ymax = marginal ? 320 : elastic ? 5 : 30,
        xmax = marginal ? 9 : elastic ? 60 : 5;
      return <><Plot fn={f} xmax={xmax} ymax={ymax} point={[x, y]} tangent={slope} secant={average ? [0, 0] : [x + h, f(x + h)]} delta={!average} label={`${title}, x=${fmt(x)}, bước h=${fmt(h)}`} />
  <div className="course-readings">{average ? <><Reading label="Bi\xEAn $f'(x)$" value={fmt(slope)} tone="orange" /><Reading label="B\xECnh qu\xE2n $\\frac{f(x)}{x}$" value={fmt(y / x)} tone="violet" /></> : elastic ? <><Reading label="$\\frac{\\Delta x}{x}$" value={`${fmt(100 * h / x)}%`} tone="orange" /><Reading label="$\\frac{\\Delta y}{y}$ th\u1EF1c t\u1EBF" value={`${fmt(100 * actual / y)}%`} /><Reading label="$\\varepsilon \\cdot \\frac{\\Delta x}{x}$ x\u1EA5p x\u1EC9" value={`${fmt(100 * x * slope / y * h / x)}%`} tone="violet" /></> : <><Reading label="$\\Delta x$" value={fmt(h)} tone="orange" /><Reading label="$\\Delta y$ th\u1EF1c" value={fmt(actual)} /><Reading label={kind === 'secant' ? "$\\frac{\\Delta y}{\\Delta x}$" : "$dy = f'\\cdot \\Delta x$"} value={fmt(kind === 'secant' ? actual / h : dy)} tone="violet" /></>}</div>
  <Formula>{average ? `Tại $x=${x}$: biên bằng ${fmt(slope)}, bình quân bằng ${fmt(y / x)}. ${x === 2 ? 'Hai độ dốc cùng bằng 4; bình quân đạt cực tiểu.' : x < 2 ? 'Biên thấp hơn bình quân: bình quân đang giảm.' : 'Biên cao hơn bình quân: bình quân đang tăng.'}` : elastic ? R`$\varepsilon_{y,x}(30)=\frac{30+60}{2(30+30)}=\frac34$. Khi $x$ tăng $1\%$, $y$ tăng xấp xỉ $0{,}75\%$. Sai khác giữa thay đổi thực và xấp xỉ giảm khi bước nhỏ lại.` : marginal ? R`$f(5)=123$, $f'(5)=44$. $\Delta y=44h+4h^2$, $dy=44h$. Sai lệch $4h^2$ thu hẹp khi h giảm.` : kind === 'secant' ? `$\\frac{(2+h)^2-4}{h}=4+h=${4 + h}\\longrightarrow4=f'(2)$.` : R`$\Delta y=4h+h^2$, $dy=4h$. Cùng bước h nhưng hai độ cao khác nhau; sai lệch là $h^2$.`}</Formula>
 </>;
    }}</Scene>;
}
export function ChainScene({
  multiple = false
}) {
  return <Scene id={multiple ? 'multichain' : 'chain'} title={multiple ? 'Cộng đóng góp của từng đường phụ thuộc' : 'Đạo hàm ngoài nhân đạo hàm trong'} description={multiple ? "$z=u^{2}+uv$, $u=t^{2}$, $v=3t$. Tại $t=1$, theo dõi từng đường phụ thuộc." : "$x$ đi qua $u=4x+5$ rồi đến $y=u^{3}$. Hệ số 4 xuất hiện do đạo hàm của biến trung gian."} steps={5} interval={2200}>{step => <>
  <div className="course-dependency"><div className="dependency-node tone-orange"><MathText inline>{multiple ? "$t=1$" : "$x$"}</MathText><small>đầu vào</small></div><div className="dependency-lanes"><div className={`dependency-node tone-blue ${step >= 1 ? 'dependency-ready' : ''}`}><MathText inline>{multiple ? "$u=t^{2}=1$" : "$u=4x+5$"}</MathText><small><MathText inline>{multiple ? "$\\frac{du}{dt}=2$" : "$\\frac{du}{dx}=4$"}</MathText></small></div>{multiple && <div className={`dependency-node tone-coral ${step >= 2 ? 'dependency-ready' : ''}`}><MathText inline>{"$v=3t=3$"}</MathText><small><MathText inline>{"$\\frac{dv}{dt}=3$"}</MathText></small></div>}</div><div className={`dependency-node tone-violet ${step >= 3 ? 'dependency-ready' : ''}`}><MathText inline>{multiple ? "$z=u^{2}+uv$" : "$y=u^{3}$"}</MathText><small><MathText inline>{multiple ? "$f_u=5,\\quad f_v=1$" : "$\\frac{dy}{du}=3u^{2}$"}</MathText></small></div></div>
  <div className="course-contributions">{(multiple ? [{
          label: 'Qua u',
          value: "$5 \\times  2 = 10$",
          tone: 'blue'
        }, {
          label: 'Qua v',
          value: "$1 \\times  3 = 3$",
          tone: 'coral'
        }] : [{
          label: 'Ngoài',
          value: "$3u^{2}$",
          tone: 'violet'
        }, {
          label: 'Trong',
          value: '4',
          tone: 'blue'
        }]).map((item, i) => <div className={`course-reveal ${step >= i + 1 ? '' : 'unrevealed'}`} key={item.label}><Reading {...item} /></div>)}</div>
  <Formula>{step >= 4 ? multiple ? R`$\frac{dz}{dt}=f_u\frac{du}{dt}+f_v\frac{dv}{dt}=5\cdot2+1\cdot3=13$. Kiểm tra bằng $z=t^4+3t^3$.` : R`$\frac{dy}{dx}=\frac{dy}{du}\frac{du}{dx}=3u^2\cdot4=12(4x+5)^2$.` : multiple ? 'Mỗi đường đóng góp một tích. Chưa cộng kết quả khi còn thiếu một đường.' : 'Nhận diện hai tầng trước khi nhân các đạo hàm.'}</Formula>
 </>}</Scene>;
}
export function ImplicitScene() {
  const F = (x, y) => 4 * x * x + x * y ** 3 - 5 * x + 3 * y + 4 * y * Math.exp(x) - 7;
  const branch = x => {
    let y = 1;
    for (let i = 0; i < 12; i += 1) {
      const Fy = 3 * x * y * y + 3 + 4 * Math.exp(x);
      if (!Number.isFinite(Fy) || Math.abs(Fy) < 1e-8) return NaN;
      const next = y - F(x, y) / Fy;
      if (!Number.isFinite(next)) return NaN;
      if (Math.abs(next - y) < 1e-10) return next;
      y = next;
    }
    return y;
  };
  const stages = [
    R`Xét $F(x,y)=4x^2+xy^3-5x+3y+4ye^x-7=0$. Bài toán yêu cầu tìm $y(0)$ rồi mới tính đạo hàm tại điểm tương ứng.`,
    R`Thay $x=0$ vào phương trình gốc: $3y+4y-7=0$.`,
    R`Giải phương trình theo $y$: $7y-7=0$, nên $y(0)=1$ và điểm cần xét là $(0,1)$.`,
    R`Lấy đạo hàm hai vế theo $x$, xem $y=y(x)$: $8x+y^3+3xy^2y'-5+3y'+4ye^x+4ye^xy'=0$.`,
    R`Thu các hạng chứa $y'$: $(3xy^2+3+4e^x)y'=-(8x+y^3-5+4ye^x)$.`,
    R`Tại $(0,1)$, $F_x=1-5+4=0$ và $F_y=3+4=7$. Điều kiện $F_y\ne0$ được thỏa.`,
    R`Do đó $y'(0)=-\frac{F_x(0,1)}{F_y(0,1)}=-\frac{0}{7}=0$.`,
    R`Tiếp tuyến tại $(0,1)$ là $y-1=0$. Ta đã xác định độ dốc cục bộ mà không cần giải tường minh $y$ theo $x$.`
  ];
  return <Scene id="implicit" title="Tìm điểm trên đường ẩn rồi tính độ dốc" description="Xác định $y(0)$ từ phương trình, sau đó tính đạo hàm tại điểm nghiệm tương ứng." steps={8} interval={2600}>{step => <><Plot fn={branch} xmin={-0.6} xmax={0.6} ymin={0} ymax={1.8} point={step >= 2 ? [0, 1] : undefined} tangent={step >= 7 ? 0 : undefined} label="Nhánh cục bộ F(x,y)=0 qua điểm (0,1)" /><div className="course-readings"><Reading label="$x_0$" value="0" tone="orange" />{step >= 2 && <Reading label="$y_0$" value="1" tone="blue" />}{step >= 5 && <><Reading label="$F_x(0,1)$" value="0" tone="violet" /><Reading label="$F_y(0,1)$" value="7" tone="blue" /></>}{step >= 6 && <Reading label="$y'(0)$" value="0" tone="orange" />}</div><Formula>{stages[step]}</Formula></>}</Scene>;
}
export function PartialScene({ kind = 'partial' }) {
  const [variable, setVariable] = useState('x');

  if (kind === 'total-differential') return <Scene id={kind} title="Vi phân toàn phần: cộng các tác động nhỏ" description="Giữ đạo hàm tại điểm ban đầu, tính riêng từng đóng góp rồi cộng lại." steps={4}>{step => <>
    <div className="differential-contributions">
      <div className={'contribution-bar tone-orange ' + (step >= 1 ? 'shown' : '')}><span>Δx = +0,1</span><strong>fₓΔx = +0,2</strong></div>
      <div className={'contribution-bar tone-blue ' + (step >= 2 ? 'shown' : '')}><span>Δy = −0,2</span><strong>fᵧΔy = +0,6</strong></div>
      <div className={'contribution-bar tone-violet ' + (step >= 3 ? 'shown' : '')}><span>Tổng vi phân</span><strong>df = +0,8</strong></div>
    </div>
    <Formula>{step === 3 ? 'f(10,1; 4,8) ≈ 1000,8. Đây là ước lượng bậc nhất tại điểm ban đầu.' : 'df = fₓΔx + fᵧΔy. Tính từng đóng góp tại cùng điểm gốc rồi cộng.'}</Formula>
  </>}</Scene>;

  if (kind === 'partial') return <Scene id={kind} title="Đạo hàm riêng: thay một biến, giữ hai biến cố định" description={'Mô hình giá nhà P = 8 + 0,25x − 0,4y + 0,6z + 0,02xy. Chọn biến cần thay đổi; giữ hai yếu tố còn lại cố định.'} steps={8}>{step => {
    const t = 1 + step * 0.5;
    const changingX = variable === 'x';
    const curve = changingX ? value => 8.2 + 0.33 * value : value => 11.55 - 0.26 * value;
    const slope = changingX ? 0.33 : -0.26;
    const heldValue = changingX ? 4 : 7;
    return <>
      <div className="course-case-tabs">{['x', 'y'].map(v => <button aria-pressed={variable === v} onClick={() => setVariable(v)} key={v}><MathText inline>{v === 'x' ? 'Thay x, giữ y = 4 và z = 3' : 'Thay y, giữ x = 7 và z = 3'}</MathText></button>)}</div>
      <Plot fn={curve} xmin={0} xmax={5} ymin={0} ymax={13} point={[t, curve(t)]} tangent={slope} xlabel={variable} ylabel="P" label={'Giá dự báo theo ' + variable + ', độ dốc ' + fmt(slope)} />
      <div className="course-readings"><Reading label={variable + ' đang thay đổi'} value={fmt(t)} tone="orange" /><Reading label={changingX ? 'y cố định' : 'x cố định'} value={heldValue} /><Reading label="z cố định" value="3" /><Reading label={changingX ? '$P_x$' : '$P_y$'} value={fmt(slope)} tone="violet" /></div>
      <Formula>{changingX ? 'Pₓ = 0,25 + 0,02(4) = 0,33 khi y = 4; z = 3 được giữ nguyên. Độ dốc mặt cắt là đạo hàm riêng theo x.' : 'Pᵧ = −0,4 + 0,02(7) = −0,26 khi x = 7; z = 3 được giữ nguyên. Độ dốc âm cho biết giá dự báo giảm khi khoảng cách tăng.'}</Formula>
    </>;
  }}</Scene>;

  return <Scene id={kind} title="Cobb–Douglas: sản phẩm biên và co giãn" description="Với Q = 10√(KL), giữ vốn K = 4 cố định rồi theo dõi sản lượng theo lao động L." steps={8}>{step => {
    const labor = 1 + step * 0.5;
    const output = 20 * Math.sqrt(labor);
    const derivative = 10 / Math.sqrt(labor);
    return <>
      <Plot fn={v => 20 * Math.sqrt(v)} xmin={0} xmax={5} ymin={0} ymax={50} point={[labor, output]} tangent={derivative} xlabel="L" ylabel="Q" label={'Sản lượng theo lao động, L=' + fmt(labor) + ', Q=' + fmt(output)} />
      <div className="course-readings"><Reading label="K cố định" value="4" /><Reading label="L đang thay đổi" value={fmt(labor)} tone="orange" /><Reading label="Q" value={fmt(output)} /><Reading label="Q_L" value={fmt(derivative)} tone="violet" /></div>
      <Formula>{'$Q=20\\sqrt{L}$, $Q_L=10/\\sqrt{L}$, còn hệ số co giãn theo $L$ luôn bằng $1/2$.'}</Formula>
    </>;
  }}</Scene>;
}
export function SignChartScene() {
  return <Scene id="sign-chart" title="Đường đi của hàm và bảng dấu đạo hàm" description="$f=x^{3}-3x$. M\xE0u cam \u0111\xE1nh d\u1EA5u v\xF9ng gi\u1EA3m; xanh d\u01B0\u01A1ng \u0111\xE1nh d\u1EA5u v\xF9ng t\u0103ng. C\xE1c \u0111i\u1EC3m d\u1EEBng c\u1EA7n ki\u1EC3m tra \u0111\u1ED5i d\u1EA5u." steps={9}>{step => {
      const x = -2 + step * .5;
      return <><Plot fn={v => v ** 3 - 3 * v} xmin={-2} xmax={2} ymin={-3} ymax={3} point={[x, x ** 3 - 3 * x]} tangent={3 * x * x - 3} label={`Hàm bậc ba, x=${x}, đạo hàm=${3 * x * x - 3}`} /><table className="course-sign-table"><tbody><tr><th>x</th><td><MathText inline>{"\u2212$\\infty$"}</MathText></td><td>−1</td><td></td><td>1</td><td><MathText inline>{"+$\\infty$"}</MathText></td></tr><tr><th><MathText inline>{"$f'$"}</MathText></th><td className="sign-positive">+</td><td>0</td><td className="sign-negative">−</td><td>0</td><td className="sign-positive">+</td></tr><tr><th>f</th><td>↗</td><td>Cực đại 2</td><td>↘</td><td>Cực tiểu −2</td><td>↗</td></tr></tbody></table><Formula>{`Tại $x=${x}$, $f'(x)=${3 * x * x - 3}$. ${Math.abs(x) === 1 ? 'Đạo hàm bằng 0 tại điểm dừng; dấu hai phía quyết định loại cực trị.' : Math.abs(x) > 1 ? 'Đạo hàm dương: hàm đang tăng.' : 'Đạo hàm âm: hàm đang giảm.'}`}</Formula></>;
    }}</Scene>;
}
export function K51ExtremaScene() {
  const points = [
    { x: 1, y: 2, determinant: 8, fxx: 2, kind: 'minimum', label: 'Cực tiểu địa phương' },
    { x: 1, y: -2, determinant: -8, fxx: 2, kind: 'saddle', label: 'Điểm yên ngựa' },
    { x: -1, y: 2, determinant: -8, fxx: -2, kind: 'saddle', label: 'Điểm yên ngựa' },
    { x: -1, y: -2, determinant: 8, fxx: -2, kind: 'maximum', label: 'Cực đại địa phương' },
  ];
  return <Scene id="k51-extrema" title="Bài K51: phân loại đủ bốn điểm dừng" description="Giải hệ điều kiện dừng, rồi dùng dấu của định thức Hessian và đạo hàm bậc hai để phân loại từng điểm." steps={4}>{step => {
    const shown = points.slice(0, step + 1);
    const active = points[Math.min(step, points.length - 1)];
    const cx = x => 260 + 76 * x;
    const cy = y => 150 - 42 * y;
    return <>
      <Formula>{R`$\nabla f=(x^2-1,y^2-4)=(0,0),\quad H=\begin{pmatrix}2x&0\\0&2y\end{pmatrix},\quad D=4xy.$`}</Formula>
      <div className="k51-classification-layout">
        <svg className="k51-point-map" viewBox="0 0 520 300" role="img" aria-label="Bốn điểm dừng được đặt theo tọa độ x và y">
          {[0, 1, 2, 3, 4].map(i => <g key={i}><line x1={108 + i * 76} y1="35" x2={108 + i * 76} y2="265" className="k51-grid-line" /><line x1="90" y1={45 + i * 52} x2="430" y2={45 + i * 52} className="k51-grid-line" /></g>)}
          <line x1="92" y1="150" x2="430" y2="150" className="k51-axis" /><line x1="260" y1="35" x2="260" y2="265" className="k51-axis" />
          <text x="438" y="155">x</text><text x="266" y="30">y</text>
          <text x="178" y="169">−1</text><text x="334" y="169">1</text><text x="266" y="74">2</text><text x="266" y="242">−2</text>
          {points.map((point, index) => <g key={`${point.x}-${point.y}`} className={`k51-map-point k51-${point.kind} ${index <= step ? 'is-revealed' : ''}`} aria-hidden={index > step}>
            <circle cx={cx(point.x)} cy={cy(point.y)} r="8" /><text x={cx(point.x) + (point.x > 0 ? 11 : -49)} y={cy(point.y) - 12}>{`(${point.x}, ${point.y})`}</text>
          </g>)}
        </svg>
        <div className="k51-results">
          <div className="k51-result-cards">{shown.map((point, index) => <article key={`${point.x}-${point.y}`} className={`k51-result-card k51-${point.kind} ${index === step ? 'is-current' : ''}`}>
            <header><MathText inline>{`$(${point.x},${point.y})$`}</MathText><span>{point.label}</span></header>
            <dl><div><dt><MathText inline>{'$D=4xy$'}</MathText></dt><dd><MathText inline>{`$${point.determinant}$`}</MathText></dd></div><div><dt><MathText inline>{'$f_{xx}=2x$'}</MathText></dt><dd><MathText inline>{`$${point.fxx}$`}</MathText></dd></div></dl>
          </article>)}</div>
          <p className="k51-current-proof" aria-live="polite"><MathText inline>{`$D=${active.determinant},\\quad f_{xx}=${active.fxx}$.`}</MathText> {active.label}.</p>
        </div>
      </div>
    </>;
  }}</Scene>;
}
function Surface({
  a = 1,
  b = 1,
  phase = 0
}) {
  const project = (x, y) => [255 + 45 * (x - y), 125 + 17 * (x + y) - 18 * (a * x * x + b * y * y)];
  const path = (axis, t) => Array.from({
    length: 41
  }, (_, i) => {
    const u = -2 + i * .1,
      p = axis === 'x' ? project(u, t) : project(t, u);
    return `${i ? 'L' : 'M'}${p[0]},${p[1]}`;
  }).join(' ');
  const t = -1.5 + phase * .5,
    p = project(t, 0),
    q = project(0, t);
  return <svg viewBox="0 0 510 300" className="course-surface" role="img" aria-label={`Mặt z=${a}$x^2$+${b}$y^2$ với hai hướng mặt cắt`}><g>{[-2, -1.5, -1, -.5, 0, .5, 1, 1.5, 2].map(v => <g key={v}><path d={path('x', v)} className="surface-mesh" /><path d={path('y', v)} className="surface-mesh" /></g>)}</g><path d={path('x', 0)} className="surface-x" /><path d={path('y', 0)} className="surface-y" /><circle cx={p[0]} cy={p[1]} r="6" className="surface-dot-x" /><circle cx={q[0]} cy={q[1]} r="6" className="surface-dot-y" /><text x="380" y="250">hướng màu cam</text><text x="40" y="250">hướng màu xanh</text></svg>;
}
export function ExtremaScene({
  kind = 'hessian'
}) {
  const [shape, setShape] = useState('saddle');
  const variants = {
    min: [1, 1],
    max: [-1, -1],
    saddle: [1, -1]
  };
  if (kind === 'global-optimum') return <Scene id={kind} title="Từ độ cong đến tối ưu toàn cục" description="$\\pi =20q_{1}+16q_{2}-q_{1}^{2}-q_{2}^{2}-q_{1}q_{2}$. T\xE2m (8,4) l\xE0 \u0111i\u1EC3m d\u1EEBng; x\xE9t sai l\u1EC7ch $u=q_{1}-8, v=q_{2}-4$." steps={7}>{step => {
      const u = step - 3,
        v = step % 3 - 1,
        loss = u * u + u * v + v * v;
      return <><div className="course-readings"><Reading label="$q_{1}$" value={8 + u} tone="orange" /><Reading label="$q_{2}$" value={4 + v} /><Reading label="$\\pi (q_{1},q_{2})$" value={112 - loss} tone="violet" /></div><Formula>{R`$\pi=112-(u^2+uv+v^2)$, với $u^2+uv+v^2=(u+v/2)^2+3v^2/4\ge0$.`}</Formula><div className="global-loss"><span style={{
            width: `${Math.max(3, 100 - loss * 5)}%`
          }}><MathText inline>{"$\\pi$ = "}</MathText>{112 - loss}</span></div><p><MathText inline>{"Ch\u1EC9 $u=v=0$ cho gi\xE1 tr\u1ECB 112. B\u1EA5t \u0111\u1EB3ng th\u1EE9c \u0111\xFAng tr\xEAn to\xE0n mi\u1EC1n, n\xEAn x\xE1c nh\u1EADn t\u1ED1i \u0111a to\xE0n c\u1EE5c, kh\xF4ng ch\u1EC9 \u0111\u1ECBa ph\u01B0\u01A1ng."}</MathText></p></>;
    }}</Scene>;
  return <Scene id={kind} title={kind === 'stationary' ? 'Điểm dừng chưa chắc là cực trị' : 'Hai hướng cong phân biệt min, max và yên ngựa'} description="Ba mô hình có cùng gradient bằng 0 tại gốc. Quan sát hai mặt cắt vuông góc trước khi đọc dấu Hessian." steps={7}>{step => {
      const [a, b] = variants[shape],
        d = 4 * a * b;
      return <><div className="course-case-tabs">{Object.entries({
            min: 'Cực tiểu',
            max: 'Cực đại',
            saddle: 'Yên ngựa'
          }).map(([key, v]) => <button aria-pressed={shape === key} onClick={() => setShape(key)} key={key}>{v}</button>)}</div><Surface a={a} b={b} phase={step} /><Formula><MathText inline>{`$\\nabla f(0,0)=0$, $H=\\begin{pmatrix}${2 * a}&0\\\\0&${2 * b}\\end{pmatrix}$, $D=${d}$. ${d < 0 ? "$D<0$: m\u1ED9t h\u01B0\u1EDBng t\u0103ng, m\u1ED9t h\u01B0\u1EDBng gi\u1EA3m \u2014 y\xEAn ng\u1EF1a." : a > 0 ? "$D>0$ v\xE0 $f_{xx}>0$: c\u1EF1c ti\u1EC3u ch\u1EB7t." : "$D>0$ v\xE0 $f_{xx}<0$: c\u1EF1c \u0111\u1EA1i ch\u1EB7t."}`}</MathText></Formula><p><MathText inline>{"C\xF9ng m\u1ED9t \u0111i\u1EC3m d\u1EEBng, ba c\u1EA5u tr\xFAc kh\xE1c nhau. N\u1EBFu $D=0$ th\xEC ti\xEAu chu\u1EA9n kh\xF4ng k\u1EBFt lu\u1EADn; c\u1EA7n x\xE9t tr\u1EF1c ti\u1EBFp."}</MathText></p></>;
    }}</Scene>;
}
export function LagrangeScene({
  kind = 'lagrange'
}) {
  if (kind === 'cost-optimum') {
    const bs = String.fromCharCode(92);
    const formula = '$' + bs + 'phi(x)=2x+' + bs + 'frac{10^6}{27x^2}$. Đồ thị đạt giá trị nhỏ nhất tại $x=y=' + bs + 'frac{100}{3}$, với $C_{' + bs + 'min}=100$.';
    const description = '$Q=3x^{2/3}y^{1/3}=100$, đơn giá $p_x=2$ và $p_y=1$. Ràng buộc sản lượng cho $y=' + bs + 'frac{10^6}{27x^2}$; đồ thị theo dõi chi phí dọc đường khả thi.';
    return <Scene id={kind} title='Giữ sản lượng, tìm phối hợp chi phí thấp nhất' description={description} steps={9}>{step => {
      const x = step === 4 ? 100 / 3 : 15 + 5 * step,
        y = 1000000 / (27 * x * x),
        c = 2 * x + y;
      return <><Plot fn={u => 2 * u + 1000000 / (27 * u * u)} xlabel='x' ylabel='C' xmin={14} xmax={61} ymin={95} ymax={205} point={[x, c]} tangent={2 - 2000000 / (27 * x ** 3)} label={'Chi phí trên ràng buộc sản lượng: x=' + fmt(x) + ', y=' + fmt(y) + ', C=' + fmt(c)} /><div className='course-readings'><Reading label='x' value={fmt(x)} tone='orange' /><Reading label={'$y=' + bs + 'frac{10^6}{27x^2}$'} value={fmt(y)} /><Reading label='$C=2x+y$' value={fmt(c)} tone='violet' /></div><Formula>{formula}</Formula></>;
    }}</Scene>;
  }
  const bordered = kind === 'bordered-hessian';
  return <Scene id={kind} title={bordered ? 'Một Hessian biên kiểm tra độ cong tiếp xúc' : 'Chỉ di chuyển trên đường ràng buộc'} description={'$f=xy, c-g=10-x-y=0, x,y\\geq 0$. Đường khả thi biến bài toán thành $f=x(10-x)$.'} steps={7}>{step => {
      const x = 2 + step,
        y = 10 - x;
      return <><Plot fn={t => t * (10 - t)} xmax={10} ymax={30} point={[x, x * y]} tangent={10 - 2 * x} label={`Giá trị trên ràng buộc: x=${x},y=${y},f=${x * y}`} />{bordered ? <><div className="course-matrices"><div><h4><MathText inline>{"Hessian bi\xEAn $H_2$"}</MathText></h4><MatrixGrid matrix={[[0, 1, -1], [1, 0, -1], [-1, -1, 0]]} highlight={(i, j) => i === Math.floor(step / 3) || j === Math.floor(step / 3) ? 'geometry-retained' : ''} /></div><div><Reading label="$\\det  H_2$" value="$2 > 0$" tone="violet" /><Reading label="$Q$" value="$-2 < 0$" tone="orange" /></div></div><Formula>{R`$t=(1,-1)^{\mathsf T}$ là một vectơ tiếp tuyến. $Q=g_y^2L_{xx}-2g_xg_yL_{xy}+g_x^2L_{yy}=-2$, do đó $\det H_2=-Q=2$. Độ cong trên đường âm, cho cực đại địa phương; $25-(x-5)^2\le25$ xác nhận toàn cục.`}</Formula></> : <><div className="course-readings"><Reading label="x" value={x} tone="orange" /><Reading label="$y=10-x$" value={y} /><Reading label="$f=xy$" value={x * y} tone="violet" /></div><Formula>{R`$L=xy+\lambda(10-x-y)$. Hệ dừng: $y-\lambda=0, x-\lambda=0, 10-x-y=0\implies x=y=\lambda=5$. Không bỏ phương trình ràng buộc.`}</Formula></>}</>;
    }}</Scene>;
}
const odeStories = {
  'ode-definition': {
    title: 'Một hàm phải thỏa cả phương trình và điều kiện đầu',
    description: "Ki\u1EC3m tra $y=x-1/2+2e^{-2x}$ tr\xEAn to\xE0n $\\mathbb R$, kh\xF4ng ch\u1EC9 m\u1ED9t \u0111i\u1EC3m.",
    frames: [R`$y=x-1/2+2e^{-2x}$.`, R`$y'=1-4e^{-2x}$.`, R`$y'+2y=1-4e^{-2x}+2x-1+4e^{-2x}=2x$.`, R`$y(0)=-1/2+2=3/2$. Phương trình và điều kiện đầu đều thỏa.`]
  },
  'integrating-factor': {
    title: "Nh\xE2n $x^{2}$ \u0111\u1EC3 nh\u1EADn ra \u0111\u1EA1o h\xE0m c\u1EE7a m\u1ED9t t\xEDch",
    description: "$y'+(2/x)y=x^{3}$ tr\xEAn $x>0, y(1)=1$. C\xE1c h\u1EA1ng c\xF9ng m\xE0u \u0111\u01B0\u1EE3c gh\xE9p theo quy t\u1EAFc \u0111\u1EA1o h\xE0m t\xEDch.",
    frames: [R`$y'+\color{#a85518}{\frac2x}y=x^3$. Hệ số $p(x)=2/x$ trên miền $x>0$.`, R`$\mu(x)=e^{\int(2/x)\,dx}=x^2$.`, R`$\color{#315fd2}{x^2}y'+\color{#a85518}{2x}y=x^5$. Vì $(x^2)'=2x$, vế trái là $(x^2y)'$.`, R`$x^2y=\int x^5\,dx=x^6/6+C$.`, R`$y=x^4/6+C/x^2$. Từ $y(1)=1$ suy ra $C=5/6$. Miền $x>0$ giữ nguyên miền của phương trình gốc.`]
  },
  separable: {
    title: "T\xE1ch bi\u1EBFn v\xE0 gi\u1EEF nghi\u1EC7m $y=0$",
    description: "$y'+2xy/(1+x^{2})=0, y(2)=10$. C\xF9ng b\xE0i to\xE1n v\u1EDBi v\xED d\u1EE5: sau khi t\xECm h\u1EB1ng s\u1ED1, t\xEDnh \u0111\u01B0\u1EE3c $y(3)=5$.",
    frames: [R`Xét $y=0$ trước: đây là nghiệm của phương trình, nhưng không thỏa $y(2)=10$.`, R`Với $y\ne0$, tách biến: $\frac{dy}{y}=-\frac{2x}{1+x^2}\,dx$.`, R`$\ln|y|=-\ln(1+x^2)+C$. Vì $1+x^2>0$, biểu thức logarit xác định trên toàn trục số.`, R`$y=\frac{C}{1+x^2}$. Họ nghiệm này chứa cả nghiệm $y=0$ khi $C=0$.`, R`Từ $y(2)=10$ suy ra $C=50$. Do đó $y(3)=50/10=5$.`]
  },
  'integration-parts': {
    title: 'Từng phần: chuyển một đạo hàm sang thừa số đơn giản hơn',
    description: String.raw`Tính $\int 2xe^{2x}\,dx$ trong phương trình tuyến tính. Giữ dấu trừ và hệ số $1/2$.`,
    frames: [R`$u=\color{#c26421}{x},\quad dv=\color{#315fd2}{2e^{2x}dx}$.`, R`$du=\color{#c26421}{dx},\quad v=\color{#315fd2}{e^{2x}}$.`, R`$\int2xe^{2x}dx=xe^{2x}-\int e^{2x}dx$.`, R`$=e^{2x}(x-1/2)+C$.`, R`Kiểm tra: $\big[e^{2x}(x-1/2)\big]'=2xe^{2x}$.`]
  }
};
export function ODEProcessScene({
  kind
}) {
  const story = odeStories[kind];
  return <Scene id={kind} title={story.title} description={story.description} steps={story.frames.length} interval={2600}>{step => <div className="ode-story">{story.frames.map((frame, i) => <div key={i} className={`ode-line ${i <= step ? 'revealed' : ''} ${i === step ? 'current' : ''}`} aria-hidden={i > step}><span>{i + 1}</span><MathText>{i <= step ? frame : ''}</MathText></div>)}</div>}</Scene>;
}
export function IntegralScene() {
  return <Scene id="integral" title="Nguyên hàm liên hệ diện tích tích lũy" description={"$f(x)=x^{2}\\ge 0$ và $F(b)=\\int_{0}^{b}x^{2}\\,dx=\\frac{b^{3}}{3}$. Khi $b$ tăng, diện tích tích lũy tăng."} steps={9}>{step => {
      const b = step * .5;
      const path = Array.from({
        length: 81
      }, (_, i) => {
        const x = b * i / 80;
        return `${i ? 'L' : 'M'}${45 + 84 * x},${270 - 9.2 * x * x}`;
      }).join(' ');
      return <><Plot fn={x => x * x} xmax={5} ymax={25} point={[b, b * b]} label={`Diện tích từ 0 đến ${b} bằng ${fmt(b ** 3 / 3)}`}><path className="course-area" d={`${path}L${45 + 84 * b},270H45Z`} /></Plot><Formula>{`$F(${b})=\\int_0^{${b}}x^2dx=\\frac{${b}^3}{3}\\approx${(b ** 3 / 3).toFixed(3)}$. $F'(b)=b^2$ là tốc độ diện tích tích lũy.`}</Formula></>;
    }}</Scene>;
}
export function DynamicsScene({
  kind = 'growth'
}) {
  const config = {
    growth: ['Tăng trưởng mũ: tỉ lệ với chính quy mô', "$N'=kN, N_{0}=500$, g\u1EA5p \u0111\xF4i sau 10 th\xE1ng.", t => 500 * 2 ** (t / 10), 3000, 24],
    'bounded-growth': ['Tăng trưởng giới hạn: tỉ lệ với phần còn thiếu', "$N'=k(4-N), N_{0}=1, N(10)=2$; quy m\xF4 \u0111o theo $N_{0}$.", t => 4 - 3 * Math.exp(-Math.log(1.5) * t / 10), 4.5, 40],
    exchange: ['Tỷ giá điều chỉnh theo tỷ giá cân bằng', "$s^{e}(t)=10+0{,}2t$, $\\gamma=0{,}5$, $s(0)=12$.", t => 10 + .2 * t + 2.4 * Math.exp(-.5 * t) - .4, 16, 20],
    solow: ['Vốn bình quân tiến về trạng thái dừng', "$k'=s\\sqrt k-(n+\\delta )k; s=0,4$ v\xE0 $n+\\delta =0,1$. \u0110\u1EB7t $v=\\sqrt k$ th\xEC $v'=0,2-0,05v$.", t => (4 - 3 * Math.exp(-.05 * t)) ** 2, 18, 80]
  }[kind];
  const [title, description, fn, ymax, xmax] = config;
  return <Scene id={kind} title={title} description={description} steps={9} interval={1700}>{step => {
      const t = step * xmax / 8,
        value = fn(t);
      return <><Plot fn={fn} xlabel="t" ylabel={kind === 'solow' ? 'k' : kind === 'exchange' ? 's' : 'N'} xmax={xmax} ymax={ymax} point={[t, value]} label={`${title}, t=${fmt(t)}, giá trị ${fmt(value)}`} /><div className="course-readings"><Reading label="Thời gian t" value={fmt(t)} tone="orange" /><Reading label={kind === 'solow' ? 'Vốn bình quân k(t)' : kind === 'exchange' ? 'Tỷ giá s(t)' : 'Quy mô N(t)'} value={fmt(value)} tone="violet" />{kind === 'exchange' && <Reading label="Sai lệch $s-s_e$" value={fmt(2.4 * Math.exp(-.5 * t) - .4, 4)} />}</div><Formula>{kind === 'growth' ? R`$N(t)=500\\cdot2^{t/10}$. Tại t=24: $N\approx2639$. Giả thiết tốc độ tỉ lệ không đổi trong toàn khoảng dự báo.` : kind === 'bounded-growth' ? R`$N=4-3e^{-kt}$, $k=\ln(3/2)/10$. N tăng chậm dần tới 4; không đạt 4 trong thời gian hữu hạn.` : kind === 'exchange' ? R`$E(t)=2{,}4e^{-0{,}5t}-0{,}4\\to-0{,}4$. Tỷ giá $s(t)=s^{e}(t)+E(t)$; chênh lệch dài hạn phản ánh xu hướng của tỷ giá cân bằng.` : R`$k(t)=[4-3e^{-.05t}]^2	o16$. Với $k>0$, $k<16$ cho $k'>0$, $k>16$ cho $k'<0$; $k=0$ cũng là nghiệm cân bằng.`}</Formula></>;
    }}</Scene>;
}
export function LectureParameterMovie() {
  const [m, setM] = useState(1);
  const frames = [{
    matrix: [[1, 3, 2, -1], [2, 4, m, 2], [1, m, -1, 3]],
    nextRow: 1
  }, {
    matrix: [[1, 3, 2, -1], [0, -2, m - 4, 4], [1, m, -1, 3]],
    operation: R`d_2\leftarrow d_2-2d_1`,
    row: 1,
    nextRow: 2
  }, {
    matrix: [[1, 3, 2, -1], [0, -2, m - 4, 4], [0, m - 3, -3, 4]],
    operation: R`d_3\leftarrow d_3-d_1`,
    row: 2,
    nextRow: 2
  }, {
    matrix: [[1, 3, 2, -1], [0, -2, m - 4, 4], [0, 0, (m - 1) * (m - 6), 4 * (m - 1)]],
    operation: R`d_3\leftarrow2d_3+(m-3)d_2`,
    row: 2
  }];
  const result = m === 1
    ? '$m=1$: dòng cuối là $0=0$; $r(A)=r(\\bar A)=2$. Đặt $z=t$. Khi đó $y=-2-\\frac{3}{2}t$ và từ phương trình đầu suy ra $x=5+\\frac{5}{2}t$, với $t\\in\\mathbb R$.'
    : m === 6
      ? '$m=6$: dòng cuối thành $0=20$, nên $r(A)=2<r(\\bar A)=3$ và hệ vô nghiệm.'
      : '$m=' + m + '$: ba trụ đều khác $0$, nên hệ có nghiệm duy nhất; $y=z=\\frac{4}{' + (m - 6) + '}$ và $x=-\\frac{' + (m + 14) + '}{' + (m - 6) + '}.';
  return <div>
    <label className="course-inline-control">Tham số <MathText inline>{'$m$'}</MathText>
      <select value={m} onChange={event => setM(Number(event.target.value))}>
        {[0, 1, 2, 3, 6].map(value => <option key={value} value={value}>{value}</option>)}
      </select>
    </label>
    <MatrixFlowMovie
      key={m}
      frames={frames}
      divider={3}
      title="Biện luận hạng của hệ có tham số"
      description="Khử trên ma trận mở rộng kích thước $3\\times4$. Không chia cho biểu thức phụ thuộc vào $m$ trước khi xét các giá trị làm trụ cuối bằng $0$."
      conclusion={result}
      label="biện luận hệ có tham số"
    />
  </div>;
}
