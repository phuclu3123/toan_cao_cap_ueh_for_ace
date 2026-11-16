import { useState } from 'react';
import useMathPlayback from '../../hooks/useMathPlayback';
import { adjugate, cofactorMatrix, determinant, minorMatrix } from '../../utils/matrixMath';
import { PlaybackControls } from './MatrixMovies';
import { MathText } from './StudyPrimitives';
import '../../assets/styles/MatrixGeometryMovies.css';
export function MatrixGrid({ matrix, columns, highlight, hidden, className = '', divider }) {
  return <div className={'geometry-matrix ' + className} style={{ gridTemplateColumns: 'repeat(' + (columns || matrix[0].length) + ',var(--geometry-cell,40px))' }}>
    {matrix.flatMap((row, i) => row.map((value, j) => {
      const hiddenCell = hidden?.(i, j);
      const formula = Number.isInteger(value) ? String(value) : value === .5 ? '\\frac12' : value === -.5 ? '-\\frac12' : String(value);
      const classes = [highlight?.(i, j), j === divider && 'geometry-divider', hiddenCell && 'geometry-unfilled'].filter(Boolean).join(' ');
      return <span key={i + '-' + j} className={classes}>{hiddenCell ? '' : <MathText inline>{'$' + formula + '$'}</MathText>}</span>;
    }))}
  </div>;
}
export function TriangleGallery() {
  const types = [{
    name: 'Tam giác trên',
    matrix: [[1, -1, 3], [0, 3, 4], [0, 0, 5]],
    condition: '$a_{ij}=0$ khi $i>j$',
    calculation: '$1\\cdot3\\cdot5=15$'
  }, {
    name: 'Tam giác dưới',
    matrix: [[2, 0, 0], [1, 1, 0], [3, 5, 6]],
    condition: '$a_{ij}=0$ khi $i<j$',
    calculation: '$2\\cdot1\\cdot6=12$'
  }, {
    name: 'Đường chéo',
    matrix: [[1, 0, 0], [0, 4, 0], [0, 0, 5]],
    condition: '$a_{ij}=0$ khi $i\\ne j$',
    calculation: '$1\\cdot4\\cdot5=20$'
  }];
  return <section className="math-explorer triangle-gallery" aria-label="Ba dạng ma trận tam giác"><div className="math-explorer-heading"><span>Nhận diện cùng lúc</span><h3>Cấu trúc khác nhau, cùng quy tắc đường chéo</h3><p>Ví dụ theo trang 5–6 ghi chép Buổi 1. Định thức mỗi ma trận bằng tích các phần tử nổi bật trên đường chéo chính.</p></div><div className="triangle-gallery-row">{types.map(type => <div className="triangle-gallery-item" key={type.name}><h4>{type.name}</h4><MatrixGrid matrix={type.matrix} highlight={(i, j) => i === j ? 'geometry-diagonal' : type.matrix[i][j] === 0 ? 'geometry-zero' : ''} /><MathText>{type.condition}</MathText><div className="triangle-determinant"><span>Định thức</span><MathText>{type.calculation}</MathText></div></div>)}</div><p className="math-explorer-conclusion">Ma trận đường chéo đồng thời là tam giác trên và tam giác dưới. Một phần tử đường chéo bằng 0 làm định thức bằng 0.</p></section>;
}
const sarrusA = [[1, 2, 3], [0, -1, 4], [2, 1, 5]];
const diagonalSets = [[0, 6, 12], [1, 7, 13], [2, 8, 14], [10, 6, 2], [11, 7, 3], [12, 8, 4]];
export function SarrusMovie() {
  const { attach, ...playback } = useMathPlayback(7, 2100);
  const extended = sarrusA.map(row => [...row, ...row.slice(0, 2)]).flat();
  const active = Math.min(5, playback.step);
  const selected = diagonalSets[active];
  const activePoints = selected.map(index => ({ row: Math.floor(index / 5), column: index % 5 })).sort((left, right) => left.row - right.row);
  const products = diagonalSets.map(indices => indices.reduce((product, index) => product * extended[index], 1));

  return (
    <section className="math-explorer sarrus-movie" ref={attach} aria-label="Quy tắc Sarrus">
      <div className="math-explorer-heading">
        <span><MathText inline>{"Ghi chép Buổi 1 · trang 3"}</MathText></span>
        <h3>Sáu tích đường chéo tạo nên định thức cấp ba</h3>
        <p><MathText inline>{"Chép hai cột đầu sang phải để dựng sáu đường chéo. Mỗi bước làm nổi bật một tích; nhóm đi xuống được cộng, nhóm đi lên được trừ."}</MathText></p>
      </div>
      <svg
        viewBox="0 0 430 260"
        className="sarrus-diagram"
        role="img"
        aria-label={"Sarrus, đường chéo thứ " + (active + 1) + ", tích bằng " + products[active]}
      >
        <text x="330" y="24" textAnchor="middle">Hai cột đầu được chép sang phải</text>
        {[1, 2, 3, 1, 2].map((columnLabel, columnIndex) => (
          <text
            key={columnIndex}
            x={61 + columnIndex * 70}
            y="40"
            textAnchor="middle"
            className={
              columnIndex === 3
                ? "sarrus-col-label sarrus-copy-label-one"
                : columnIndex === 4
                  ? "sarrus-col-label sarrus-copy-label-two"
                  : "sarrus-col-label"
            }
          >
            {columnIndex > 2 ? columnLabel + "′" : columnLabel}
          </text>
        ))}
        {extended.map((_, index) => {
          const row = Math.floor(index / 5);
          const column = index % 5;
          const isActive = selected.includes(index);
          const classes = [
            column === 3 && "sarrus-repeated sarrus-copy-one",
            column === 4 && "sarrus-repeated sarrus-copy-two",
            isActive && (active < 3 ? "sarrus-positive" : "sarrus-negative"),
          ].filter(Boolean).join(" ");

          return (
            <rect
              key={index}
              x={35 + column * 70}
              y={45 + row * 64}
              width="52"
              height="48"
              rx="7"
              className={classes}
            />
          );
        })}
        {activePoints.slice(0, -1).map((point, index) => {
          const next = activePoints[index + 1];
          const start = { x: 61 + point.column * 70, y: 69 + point.row * 64 };
          const finish = { x: 61 + next.column * 70, y: 69 + next.row * 64 };
          const dx = finish.x - start.x;
          const dy = finish.y - start.y;
          const length = Math.hypot(dx, dy);
          const ux = dx / length;
          const uy = dy / length;
          const inset = Math.min(26 / Math.abs(ux), 24 / Math.abs(uy)) - 2;

          return (
            <line
              key={index}
              x1={start.x + ux * inset}
              y1={start.y + uy * inset}
              x2={finish.x - ux * inset}
              y2={finish.y - uy * inset}
              className={active < 3 ? "sarrus-path-positive" : "sarrus-path-negative"}
            />
          );
        })}
        {extended.map((value, index) => {
          const row = Math.floor(index / 5);
          const column = index % 5;

          return (
            <text
              key={index}
              x={61 + column * 70}
              y={69 + row * 64}
              textAnchor="middle"
              dominantBaseline="middle"
            >
              {value < 0 ? "−" + Math.abs(value) : value}
            </text>
          );
        })}
        <text x="210" y="250" textAnchor="middle">
          {active < 3 ? "Nhóm cộng · đi xuống" : "Nhóm trừ · đi lên"}
        </text>
      </svg>
      <div className="sarrus-column-key" aria-label="Chú giải hai cột được chép sang phải">
        <span><i className="sarrus-key-swatch sarrus-key-copy-one" aria-hidden="true" />Cột 1 được chép sang phải</span>
        <span><i className="sarrus-key-swatch sarrus-key-copy-two" aria-hidden="true" />Cột 2 được chép sang phải</span>
      </div>
      <div className="sarrus-sums">
        <div>
          <strong>Ba tích cộng</strong>
          {products.slice(0, 3).map((value, index) => (
            <span key={index}>
              {playback.step >= index ? <MathText inline>{"$" + value + "$"}</MathText> : "…"}
            </span>
          ))}
        </div>
        <div>
          <strong>Ba tích trừ</strong>
          {products.slice(3).map((value, index) => (
            <span key={index}>
              {playback.step >= index + 3 ? <MathText inline>{"$" + value + "$"}</MathText> : "…"}
            </span>
          ))}
        </div>
      </div>
      <div className="geometry-calculation">
        <MathText>
          {"$" + selected.map(index => "(" + extended[index] + ")").join("\\cdot") + "=" + products[active] + "$"}
        </MathText>
        {playback.step === 6 && (
          <MathText>{"$|A|=(-5+16+0)-(-6+4+0)=13$"}</MathText>
        )}
      </div>
      <PlaybackControls playback={playback} steps={7} label="Sarrus" />
    </section>
  );
}
export function LaplaceMovie() {
  const [axis, setAxis] = useState('column');
  const [chosen, setChosen] = useState(1);
  const a = [[2, 1, -1], [1, 0, 6], [5, 0, 3]];
  const {
    attach,
    ...playback
  } = useMathPlayback(4, 2300);
  const active = Math.min(2, playback.step);
  const i = axis === 'row' ? chosen : active,
    j = axis === 'column' ? chosen : active;
  const minor = minorMatrix(a, i, j),
    cofactor = (-1) ** (i + j) * determinant(minor);
  const terms = Array.from({
    length: 3
  }, (_, index) => {
    const row = axis === 'row' ? chosen : index,
      column = axis === 'column' ? chosen : index;
    return a[row][column] * (-1) ** (row + column) * determinant(minorMatrix(a, row, column));
  });
  return <section className="math-explorer laplace-movie" ref={attach} aria-label="Khai triển định thức theo dòng hoặc cột"><div className="math-explorer-heading"><span><MathText inline>{"Ghi chép Buổi 1 · trang 5"}</MathText></span><h3>Chọn một dòng hoặc cột, cộng các phần bù có dấu</h3><p><MathText inline>{"Ô viền cam là $a_{ij}$. Bỏ dòng i và cột j để lấy ma trận con; chỉ bốn ô giữ lại được đưa vào định thức con."}</MathText></p></div><div className="explorer-controls"><label>Khai triển theo<select value={axis} onChange={event => {
          setAxis(event.target.value);
          playback.setStep(0);
        }}><option value="column">Cột</option><option value="row">Dòng</option></select></label><label>Chỉ số<select value={chosen} onChange={event => {
          setChosen(Number(event.target.value));
          playback.setStep(0);
        }}>{[0, 1, 2].map(value => <option key={value} value={value}>{value + 1}</option>)}</select></label></div><div className="minor-construction"><MatrixGrid matrix={a} highlight={(row, column) => row === i && column === j ? 'geometry-picked' : row === i || column === j ? 'geometry-removed' : 'geometry-retained'} /><div className="minor-relation"><MathText>{`$C_{${i + 1}${j + 1}}=(-1)^{${i + 1}+${j + 1}}|M_{${i + 1}${j + 1}}|$`}</MathText><MatrixGrid matrix={minor} highlight={() => 'geometry-retained'} /></div></div><div className="geometry-calculation"><MathText>{`$a_{${i + 1}${j + 1}}C_{${i + 1}${j + 1}}=(${a[i][j]})\\cdot(${cofactor})=${a[i][j] * cofactor}$.`}</MathText><MathText>{`$|A|=${terms.slice(0, Math.min(3, playback.step + 1)).map(value => `(${value})`).join('+')}${playback.step === 3 ? '=27' : '+\\cdots'}$.`}</MathText></div><PlaybackControls playback={playback} steps={4} label="khai triển Laplace" /><p className="math-explorer-conclusion"><MathText inline>{"Mọi dòng/cột cho cùng kết quả 27. Cột 2 chỉ có một phần tử khác 0 nên nhanh nhất. Dấu $(-1)^{i+j}$ bắt buộc được giữ."}</MathText></p></section>;
}
export function CofactorMovie() {
  const a = [[1, 0, 6], [2, 1, 5], [3, 4, 1]];
  const {
    attach,
    ...playback
  } = useMathPlayback(20, 1250);
  const index = Math.min(8, Math.floor(playback.step / 2)),
    i = Math.floor(index / 3),
    j = index % 3;
  const minors = minorMatrix(a, i, j),
    c = cofactorMatrix(a),
    pa = adjugate(a);
  const computed = Math.min(9, Math.floor((playback.step + 1) / 2));
  const transposed = playback.step >= 18;
  return <section className="math-explorer cofactor-movie" ref={attach} aria-label="Lập phần bù đại số và ma trận phụ hợp PA"><div className="math-explorer-heading"><span><MathText inline>{"Ghi chép Buổi 1 · trang 6–7"}</MathText></span><h3><MathText inline>{"Từ phần bù $C_{ij}$ đến ma trận phụ hợp $P_A$"}</MathText></h3><p><MathText inline>{"Với vị trí $(i,j)$, định thức con là $|M_{ij}|$ và phần bù đại số là $C_{ij}=(-1)^{i+j}|M_{ij}|$. Sau khi tính đủ ma trận $C=(C_{ij})$, chuyển vị để thu được ma trận phụ hợp $P_A=C^T$."}</MathText></p></div><div className="cofactor-source"><div><span><MathText inline>{"Ma trận $A$ cấp $3\\times3$"}</MathText></span><MatrixGrid matrix={a} highlight={(row, column) => row === i && column === j ? 'geometry-picked' : row === i || column === j ? 'geometry-removed' : 'geometry-retained'} /></div><div><span>Ma trận con đang xét</span><MatrixGrid matrix={minors} highlight={() => 'geometry-retained'} /><MathText>{`$C_{${i + 1}${j + 1}}=(-1)^{${i + 1}+${j + 1}}(${determinant(minors)})=${c[i][j]}$.`}</MathText></div></div><div className="cofactor-result"><span>{transposed ? 'Ma trận phụ hợp' : 'Ma trận phần bù đại số'}</span><MathText>{transposed ? '$P_A=(C_{ij})^T$' : '$C=(C_{ij})$'}</MathText><MatrixGrid matrix={transposed ? pa : c} hidden={(row, column) => !transposed && row * 3 + column >= computed} highlight={(row, column) => !transposed && row === i && column === j ? 'geometry-picked' : 'geometry-retained'} /></div><PlaybackControls playback={playback} steps={20} label="ma trận phụ hợp" /><div className="math-explorer-conclusion"><MathText>{'$|A|=11\\ne0$, nên $A^{-1}=\\frac1{11}P_A$. Phải chuyển vị ma trận phần bù trước khi chia cho định thức.'}</MathText></div></section>;
}
