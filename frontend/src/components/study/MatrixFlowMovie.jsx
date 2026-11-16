import { useState } from 'react';
import useMathPlayback from '../../hooks/useMathPlayback';
import { determinant } from '../../utils/matrixMath';
import { PlaybackControls } from './MatrixMovies';
import { MatrixGrid } from './MatrixGeometryMovies';
import { MathText } from './StudyPrimitives';
import '../../assets/styles/MatrixFlowMovie.css';
export function MatrixFlowMovie({
  frames,
  title,
  description,
  conclusion,
  divider,
  label = 'biến đổi dòng'
}) {
  const operations = frames.length - 1;
  const single = operations === 1;
  const steps = single ? 2 : operations * 3 + 1;
  const {
    attach,
    ...playback
  } = useMathPlayback(steps, 1100, {
    loop: !single
  });
  const complete = playback.step === steps - 1;
  const index = Math.min(operations - 1, Math.floor(playback.step / 3));
  const phase = single ? playback.step : complete ? 2 : playback.step % 3;
  const before = frames[index],
    after = frames[index + 1];
  const caption = complete ? single ? 'Đã hoàn thành phép biến đổi. Giữ hai ma trận để đối chiếu.' : 'Đã hoàn thành chuỗi biến đổi.' : phase === 0 ? 'Xác định dòng nguồn, dòng nhận và hệ số.' : phase === 1 ? 'Tính dòng mới; các dòng khác giữ nguyên.' : 'Dùng ma trận mới làm đầu vào cho bước tiếp theo.';
  return <section className="math-explorer matrix-flow-movie" ref={attach} aria-label={title.replaceAll('$', '')}><div className="math-explorer-heading"><span>Biến đổi có theo dõi</span><h3><MathText inline>{title}</MathText></h3><p><MathText inline>{description}</MathText></p></div><div className={`matrix-flow-stage phase-${phase} ${complete ? 'flow-complete' : ''} ${single ? 'flow-single' : 'flow-sequence'}`}><div className="matrix-flow-source"><span>Ma trận hiện tại</span><MatrixGrid matrix={before.matrix} divider={divider} highlight={i => before.nextRow === i ? 'geometry-picked' : ''} /></div><div className="matrix-flow-operation"><MathText>{`$$${after.operation}$$`}</MathText></div><div className="matrix-flow-target"><span>{complete ? 'Kết quả cuối' : 'Sau biến đổi'}</span><MatrixGrid matrix={after.matrix} divider={divider} highlight={i => after.row === i ? 'geometry-retained' : ''} /></div></div><div className="matrix-flow-caption"><span>Phép {index + 1} / {operations}</span><p>{caption}</p></div><PlaybackControls playback={playback} steps={steps} label={label} />{complete && <div className="math-explorer-conclusion"><MathText>{conclusion}</MathText></div>}</section>;
}
const inverseFrames = [{
  matrix: [[1, 1, 0, 1, 0, 0], [0, 1, 1, 0, 1, 0], [1, 0, 1, 0, 0, 1]],
  nextRow: 2
}, {
  matrix: [[1, 1, 0, 1, 0, 0], [0, 1, 1, 0, 1, 0], [0, -1, 1, -1, 0, 1]],
  operation: String.raw`d_3\leftarrow d_3-d_1`,
  row: 2,
  nextRow: 2
}, {
  matrix: [[1, 1, 0, 1, 0, 0], [0, 1, 1, 0, 1, 0], [0, 0, 2, -1, 1, 1]],
  operation: String.raw`d_3\leftarrow d_3+d_2`,
  row: 2,
  nextRow: 2
}, {
  matrix: [[1, 1, 0, 1, 0, 0], [0, 1, 1, 0, 1, 0], [0, 0, 1, -.5, .5, .5]],
  operation: String.raw`d_3\leftarrow \frac12d_3`,
  row: 2,
  nextRow: 1
}, {
  matrix: [[1, 1, 0, 1, 0, 0], [0, 1, 0, .5, .5, -.5], [0, 0, 1, -.5, .5, .5]],
  operation: String.raw`d_2\leftarrow d_2-d_3`,
  row: 1,
  nextRow: 0
}, {
  matrix: [[1, 0, 0, .5, -.5, .5], [0, 1, 0, .5, .5, -.5], [0, 0, 1, -.5, .5, .5]],
  operation: String.raw`d_1\leftarrow d_1-d_2`,
  row: 0
}];
export function InverseThreeMovie() {
  return <MatrixFlowMovie frames={inverseFrames} divider={3} title="Nghịch đảo cấp ba bằng Gauss–Jordan" description={'Khử đồng thời hai khối của ma trận ghép: $[A\\mid I_3]\\longrightarrow[I_3\\mid A^{-1}]$. Mỗi phép dòng tác động lên cả sáu cột.'} conclusion={'$A^{-1}=\\frac12\\begin{pmatrix}1&-1&1\\\\1&1&-1\\\\-1&1&1\\end{pmatrix}$. Kiểm tra cả $AA^{-1}=I_3$.'} label="nghịch đảo cấp ba" />;
}
export function RowOperationsMovie() {
  const [kind, setKind] = useState('add');
  const a = [[1, 2, 0], [2, 5, 1], [0, 1, 3]];
  const cases = {
    swap: {
      name: 'Đổi chỗ',
      operation: String.raw`d_1\leftrightarrow d_2`,
      matrix: [a[1], a[0], a[2]],
      row: 0,
      factor: -1,
      rule: '|A_{\\mathrm{moi}}|=-|A|'
    },
    add: {
      name: 'Cộng bội dòng',
      operation: String.raw`d_2\leftarrow d_2-2d_1`,
      matrix: [a[0], [0, 1, 1], a[2]],
      row: 1,
      factor: 1,
      rule: '|A_{\\mathrm{moi}}|=|A|'
    },
    scale: {
      name: 'Nhân một dòng',
      operation: String.raw`d_2\leftarrow3d_2`,
      matrix: [a[0], [6, 15, 3], a[2]],
      row: 1,
      factor: 3,
      rule: '|A_{\\mathrm{moi}}|=3|A|'
    },
    combine: {
      name: 'Tổ hợp hai dòng',
      operation: String.raw`d_2\leftarrow2d_2-3d_1`,
      matrix: [a[0], [1, 4, 2], a[2]],
      row: 1,
      factor: 2,
      rule: '|A_{\\mathrm{moi}}|=2|A|'
    }
  };
  const selected = cases[kind];
  return <div className="row-operations-movies"><div className="row-operation-kinds" role="group" aria-label="Bốn dạng biến đổi dòng">{Object.entries(cases).map(([id, item]) => <button key={id} aria-pressed={kind === id} onClick={() => setKind(id)}>{item.name}</button>)}</div><MatrixFlowMovie key={kind} frames={[{
      matrix: a,
      nextRow: selected.row
    }, {
      ...selected
    }]} title={selected.name} description="So sánh các phần tử trước và sau thao tác; theo dõi riêng ảnh hưởng lên định thức." conclusion={`$${selected.rule}=${determinant(selected.matrix)}$. Định thức ban đầu bằng 2. Với $d_i\\leftarrow ad_i+bd_j$, $i\\ne j$, định thức nhân a; cần $a\\ne0$ để phép biến đổi khả nghịch và bảo toàn hạng.`} label="phép biến đổi sơ cấp" /></div>;
}
export function ParameterSystemMovie() {
  const [m, setM] = useState(1),
    [b, setB] = useState(3);
  const frames = [{
    matrix: [[1, 1, 1, 3], [2, 3, 1, 6], [1, 2, m, b]],
    nextRow: 1
  }, {
    matrix: [[1, 1, 1, 3], [0, 1, -1, 0], [1, 2, m, b]],
    operation: String.raw`d_2\leftarrow d_2-2d_1`,
    row: 1,
    nextRow: 2
  }, {
    matrix: [[1, 1, 1, 3], [0, 1, -1, 0], [0, 1, m - 1, b - 3]],
    operation: String.raw`d_3\leftarrow d_3-d_1`,
    row: 2,
    nextRow: 2
  }, {
    matrix: [[1, 1, 1, 3], [0, 1, -1, 0], [0, 0, m, b - 3]],
    operation: String.raw`d_3\leftarrow d_3-d_2`,
    row: 2
  }];
  const conclusion = m !== 0
    ? '$m=' + m + '\\ne 0$: $r(A)=r(\\bar A)=3$, nên nghiệm là duy nhất; $z=y=\\frac{' + (b - 3) + '}{' + m + '}=' + ((b - 3) / m) + '$ và $x=3-2z$.'
    : b === 3
      ? '$m=0,\\ b=3$: $r(A)=r(\\bar A)=2<3$. Đặt $z=t$; khi đó $y=t$, $x=3-2t$, với $t\\in\\mathbb R$.'
      : '$m=0,\\ b=4$: phép khử cho dòng $0=1$, tức $r(A)=2<r(\\bar A)=3$; hệ vô nghiệm.';
  return <div>
    <div className="parameter-system-controls">
      <label>Tham số <MathText inline>{'$m$'}</MathText>
        <select value={m} onChange={event => setM(Number(event.target.value))}>
          {[-1, 0, 1, 2, 3].map(value => <option value={value} key={value}>{value}</option>)}
        </select>
      </label>
      <label>Tình huống vế phải
        <select value={b} onChange={event => setB(Number(event.target.value))}>
          <option value={3}>Trường hợp tương thích</option>
          <option value={4}>Trường hợp mâu thuẫn</option>
        </select>
      </label>
      <output aria-live="polite">Đang xét <MathText inline>{'$b=' + b + '$'}</MathText></output>
    </div>
    <MatrixFlowMovie
      key={m + ':' + b}
      frames={frames}
      divider={3}
      title="Hệ ba ẩn với ma trận mở rộng"
      description="Khử trên toàn ma trận mở rộng. Không chia cho biểu thức chứa m; trường hợp $m=0$ được giữ lại để xét tính tương thích."
      conclusion={conclusion}
      label="hệ có tham số"
    />
  </div>;
}
