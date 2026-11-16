import { useLayoutEffect, useRef, useState } from 'react';
import useMathPlayback from '../../hooks/useMathPlayback';
import { PlaybackControls } from './MatrixMovies';
import { MatrixGrid } from './MatrixGeometryMovies';
import { MatrixFlowMovie } from './MatrixFlowMovie';
import { MathText } from './StudyPrimitives';

import '../../assets/styles/ReviewedScenes.css';
const R = String.raw;
function LessonScene({
  id,
  title,
  description,
  steps,
  interval = 3000,
  children
}) {
  const {
    attach,
    ...playback
  } = useMathPlayback(steps, interval);
  return <section className={`math-explorer reviewed-scene scene-${id}`} ref={attach} data-scene={id} aria-label={title.replaceAll("$$", '')}>
    <div className="math-explorer-heading"><span>Phân tích từng bước</span><h3><MathText inline>{title}</MathText></h3><p><MathText inline>{description}</MathText></p></div>
    {children(playback.step, playback)}
    <PlaybackControls playback={playback} steps={steps} label={title} />
  </section>;
}
function Result({
  children
}) {
  return <div className="reviewed-result"><MathText>{children}</MathText></div>;
}
const cramerA = [[1, 2, 2], [2, 3, 3], [1, 3, -1]];
const cramerB = [-1, 0, 1];

const cramerNames = ['x', 'y', 'z'];
const replacement = column => cramerA.map((row, i) => row.map((v, j) => j === column ? cramerB[i] : v));
const determinantLines = [R`\begin{aligned}D_1&=(-1)(-12)\\&-2(-3)+2(-3)\\&=12\end{aligned}`,R`\begin{aligned}D_2&=1(-3)-(-1)(-5)\\&+2(2)\\&=-4\end{aligned}`,R`\begin{aligned}D_3&=1(3)-2(2)\\&+(-1)(3)\\&=-4\end{aligned}`];
function CramerMatrix({ matrix, replacedColumn = null, filled = true, label }) {
  return <div className="cramer-matrix" role="img" aria-label={label}>
    {matrix.map((row, i) => row.map((value, j) => {
      const isReplacementSlot = j === replacedColumn;
      const isEmpty = isReplacementSlot && !filled;
      const shown = isReplacementSlot ? cramerB[i] : value;
      return <span key={i + ":" + j} className={"cramer-matrix-cell" + (isReplacementSlot ? " is-replaced-column" : "") + (isEmpty ? " is-empty" : "")} data-cramer-slot={isEmpty ? String(replacedColumn) : undefined}>
        {isEmpty ? <span className="cramer-empty-slot" aria-label="Cột chờ thay bằng B" /> : <MathText inline>{"$" + shown + "$"}</MathText>}
      </span>;
    }))}
  </div>;
}

function CramerStage({ step, reduced }) {
  const root = useRef(null);
  const filled = step >= 2 || (step === 1 && reduced);

  useLayoutEffect(() => {
    if (step !== 1 || reduced) return undefined;
    const stage = root.current;
    const source = stage && stage.querySelector("[data-cramer-b]");
    if (!stage || !source || typeof source.animate !== "function") return undefined;
    const from = source.getBoundingClientRect();
    const bounds = stage.getBoundingClientRect();
    const flights = [];

    [0, 1, 2].forEach((column, index) => {
      const target = stage.querySelector('[data-cramer-slot="' + column + '"]');
      if (!target) return;
      const to = target.getBoundingClientRect();
      const clone = source.cloneNode(true);
      clone.removeAttribute("data-cramer-b");
      clone.setAttribute("aria-hidden", "true");
      clone.className = "cramer-column cramer-flight";
      Object.assign(clone.style, {
        left: (from.left - bounds.left) + "px",
        top: (from.top - bounds.top) + "px",
        width: from.width + "px"
      });
      stage.appendChild(clone);
      const dx = to.left - from.left;
      const dy = to.top - from.top;
      const animation = clone.animate([
        { transform: "translate(0px, 0px)", opacity: 1 },
        { transform: "translate(" + (dx * 0.52) + "px, " + (dy - 18) + "px)", opacity: 1, offset: 0.56 },
        { transform: "translate(" + dx + "px, " + dy + "px)", opacity: 1 }
      ], {
        duration: 780,
        delay: index * 100,
        easing: "cubic-bezier(.22,.72,.25,1)",
        fill: "forwards"
      });
      flights.push({ clone, animation });
    });

    return () => flights.forEach(({ clone, animation }) => {
      animation.cancel();
      clone.remove();
    });
  }, [step, reduced]);

  const showDeterminants = step >= 3;
  const showSolutions = step >= 4;
  const stepLabel = ["Điều kiện", "Thay cột", "Dựng ma trận", "Tính định thức", "Kết luận"][step] || "Cramer";
  const instruction = [
    "Kiểm tra định thức của ma trận hệ số",
    "Dùng riêng cột $B$ để lập ba ma trận thay cột",
    "Đặt cột B vào đúng vị trí trong từng ma trận",
    "Tính ba định thức thay cột",
    "Chia từng định thức cho $D$ của ma trận gốc"
  ][step] || "";

  return <div ref={root} className="cramer-stage" data-cramer-step={step} aria-live="polite">
    <div className="cramer-instruction">
      <span>{stepLabel}</span>
      <strong>{instruction}</strong>
    </div>

    <div className="cramer-source-row">
      <div className="cramer-source-card">
        <h4>Ma trận hệ số <MathText inline>{"$A$"}</MathText><small>giữ nguyên trong suốt phép dựng</small></h4>
        <CramerMatrix matrix={cramerA} label="Ma trận hệ số A cấp ba" />
      </div>
      <div className="cramer-equation"><MathText inline>{"$AX=B$"}</MathText></div>
      <div className="cramer-source-card cramer-vector-card">
        <h4>Cột vế phải <MathText inline>{"$B$"}</MathText><small>thứ tự từ trên xuống: <MathText inline>{"$(-1,0,1)^T$"}</MathText></small></h4>
        <div className="cramer-column" data-cramer-b aria-label="Cột B gồm âm một, không, một">
          {cramerB.map((value, index) => <span className="cramer-source-cell" key={index}><MathText inline>{"$" + value + "$"}</MathText></span>)}
        </div>
      </div>
    </div>

    <div className="cramer-row-heading">
      <strong>Ba ma trận thay cột, đều xuất phát từ A gốc</strong>
      <span>Chỉ cột mang tên ẩn đang xét nhận B</span>
    </div>
    <div className="cramer-replacements">
      {[0, 1, 2].map(column => <article className="cramer-replacement-card" key={column}>
        <h4><MathText inline>{"$A_{" + (column + 1) + "}$"}</MathText><small>thay cột {column + 1}, giữ hai cột còn lại</small></h4>
        <CramerMatrix matrix={replacement(column)} replacedColumn={column} filled={filled} label={"Ma trận A_" + (column + 1) + ", cột " + (column + 1) + " được thay bằng B"} />
      </article>)}
    </div>

    <div className="cramer-outcome-grid">
      <article className="cramer-outcome-card cramer-base-determinant">
        <span>Định thức gốc</span>
        <MathText inline>{"$D=|A|=4\\ne0$"}</MathText>
        <small>mẫu số chung của cả ba công thức</small>
      </article>
      {[0, 1, 2].map(column => <article className="cramer-outcome-card" key={column} data-revealed={showDeterminants}>
        <span><MathText inline>{"$D_{" + (column + 1) + "}$"}</MathText></span>
        {showDeterminants ? <MathText>{"$$" + determinantLines[column] + "$$"}</MathText> : <span className="cramer-result-placeholder">chưa tính</span>}
        {showSolutions && <strong><MathText inline>{"$" + cramerNames[column] + "=\\frac{" + [12, -4, -4][column] + "}{4}=" + [3, -1, -1][column] + "$"}</MathText></strong>}
      </article>)}
    </div>

    <div className="cramer-conclusion">
      {step === 0 && <Result>{"$D=|A|=4\\ne0$. Hệ có nghiệm duy nhất; điều kiện áp dụng Cramer đã được thỏa mãn."}</Result>}
      {step === 1 && <Result>{"Cùng một cột $B$ được đưa vào ba vị trí khác nhau. Ba phép dựng song song; ma trận $A$ ban đầu vẫn nguyên vẹn."}</Result>}
      {step === 2 && <Result>{"$A_1=[B,C_2,C_3],\\quad A_2=[C_1,B,C_3],\\quad A_3=[C_1,C_2,B]$. Mỗi $A_j$ chỉ khác $A$ ở cột $j$."}</Result>}
      {step === 3 && <Result>{"$D_1=12,\\quad D_2=-4,\\quad D_3=-4$. Mỗi định thức thay cột tương ứng với một ẩn; mẫu số vẫn là $D=|A|$."}</Result>}
      {step >= 4 && <Result>{"$$x=\\frac{D_1}{D}=3,\\qquad y=\\frac{D_2}{D}=-1,\\qquad z=\\frac{D_3}{D}=-1.$$ Thế $X=(3,-1,-1)^T$ vào hệ cho $AX=(-1,0,1)^T=B$."}</Result>}
    </div>
  </div>;
}

export function CramerLessonScene() {
  return <LessonScene id="cramer" title="Quy tắc Cramer cấp ba: thay cột và tìm nghiệm" description="Từ $AX=B$, dựng đồng thời ba ma trận thay cột. Theo dõi A gốc, cột B và các định thức để thấy vì sao mỗi ẩn có một công thức riêng." steps={5} interval={3200}>{(step, playback) => <CramerStage step={step} reduced={playback.reduced} />}</LessonScene>;
}
export function GaussSystemScene({ homogeneous = false }) {
  const a = homogeneous
    ? [[1, 2, 2, 0], [2, 3, 1, 0], [1, 1, -1, 0]]
    : [[1, 2, 2, -1], [2, 3, 3, 0], [1, 3, -1, 1]];
  const second = homogeneous ? [0, -1, -3, 0] : [0, -1, -1, 2];
  const third = homogeneous ? [0, -1, -3, 0] : [0, 1, -3, 2];
  const frames = [
    { matrix: a, nextRow: 1 },
    { matrix: [a[0], second, a[2]], operation: "d_2\\leftarrow d_2-2d_1", row: 1, nextRow: 2 },
    { matrix: [a[0], second, third], operation: "d_3\\leftarrow d_3-d_1", row: 2, nextRow: 2 },
    {
      matrix: [a[0], second, homogeneous ? [0, 0, 0, 0] : [0, 0, -4, 4]],
      operation: homogeneous ? "d_3\\leftarrow d_3-d_2" : "d_3\\leftarrow d_3+d_2",
      row: 2
    }
  ];
  return <MatrixFlowMovie
    frames={frames}
    divider={3}
    title={homogeneous ? "Hệ thuần nhất: cột vế phải bằng 0 ở mọi bước" : "Khử Gauss trên ma trận mở rộng cấp 3"}
    description={homogeneous
      ? "Phép khử tác động lên toàn bộ ma trận mở rộng; cột vế phải vẫn bằng 0 nên không thể xuất hiện dòng mâu thuẫn."
      : "Mỗi phép biến đổi dòng tác động đồng thời lên hệ số và vế phải. Dùng dòng mới ở bước sau để giữ tương đương với hệ ban đầu."}
    conclusion={homogeneous
      ? "$r(A)=r(\\bar A)=2<3$. Đặt z=t, được y=-3t, x=4t; vậy $X=(4t,-3t,t)^T$, $t\\in\\mathbb{R}$."
      : "Dòng cuối cho $-4z=4$, suy ra $z=-1$. Thế ngược được $y=-1$, $x=3$; kiểm tra $AX=(-1,0,1)^T=B$."}
    label={homogeneous ? "hệ thuần nhất" : "khử Gauss hệ ba ẩn"}
  />;
}

export function RankMinorsScene() {
  const a = [[1, 2, 1, 4], [0, -5, 4, 5], [0, 0, 0, 2], [0, 0, 0, 6]];
  const cols = [0, 1, 3];
  const result = [
    "A tam giác trên nên $|A|=1\\cdot(-5)\\cdot0\\cdot6=0$. Suy ra $r(A)\\le3$; đây mới là cận trên.",
    "Chọn các dòng 1, 2, 3 và cột 1, 2, 4. Giao của chúng tạo ma trận con $M$ cấp ba.",
    "$$|M=1\\cdot(-5)\\cdot2=-10\\ne0,$$ nên $r(A)\\ge3$.",
    "$$3\\le r(A)\\le3\\Longrightarrow r(A)=3.$$ Một định thức con khác 0 cho cận dưới; định thức toàn ma trận bằng 0 cho cận trên."
  ];
  return <LessonScene id="rank-minors" title="Chứng minh hạng bằng hai cận" description="Ma trận vuông suy biến chỉ cho cận trên. Ta chọn một định thức con thích hợp để chứng minh cận dưới." steps={4}>{step => <>
    <div className="reviewed-matrix-pair">
      <div>
        <h4><MathText inline>{"$A_{4\\times4}$"}</MathText></h4>
        <MatrixGrid matrix={a} highlight={(i, j) => step >= 1 && i < 3 && cols.includes(j) ? "geometry-retained" : step >= 1 ? "rank-not-selected" : ""} />
      </div>
      <div>
        <h4><MathText inline>{"$M$ từ dòng 1,2,3; cột 1,2,4"}</MathText></h4>
        <MatrixGrid matrix={a.slice(0, 3).map(row => cols.map(j => row[j]))} hidden={() => step < 2} highlight={(i, j) => i === j ? "geometry-picked" : ""} />
      </div>
    </div>
    <Result>{result[step]}</Result>
  </>}</LessonScene>;
}

export function RankParameterScene() {
  const [m, setM] = useState(3);
  const frames = [
    { matrix: [[1, 2, 0], [2, 5, 1], [1, m, 1]], nextRow: 1 },
    { matrix: [[1, 2, 0], [0, 1, 1], [1, m, 1]], operation: "d_2\\leftarrow d_2-2d_1", row: 1, nextRow: 2 },
    { matrix: [[1, 2, 0], [0, 1, 1], [0, m - 2, 1]], operation: "d_3\\leftarrow d_3-d_1", row: 2, nextRow: 2 },
    { matrix: [[1, 2, 0], [0, 1, 1], [0, 0, 3 - m]], operation: "d_3\\leftarrow d_3-(" + (m - 2) + ")d_2", row: 2 }
  ];
  return <div className="reviewed-parameter">
    <label>Giá trị m
      <select value={m} onChange={event => setM(Number(event.target.value))}>
        {[0, 2, 3, 4].map(value => <option key={value}>{value}</option>)}
      </select>
    </label>
    <MatrixFlowMovie
      key={m}
      frames={frames}
      title="Hai trụ hằng và một trụ phụ thuộc m"
      description="Không chia cho biểu thức phụ thuộc tham số. Phép cộng bội dòng vẫn hợp lệ cả khi hệ số của dòng nhận bằng 0."
      conclusion={m === 3
        ? "$3-m=0$. Dòng cuối bằng 0, còn hai trụ: $r(A)=2$."
        : "$3-m=" + (3 - m) + "$. Cả ba trụ đều khác 0: $r(A)=3$."}
      label="hạng theo tham số"
    />
  </div>;
}

export function AdjugateIdentitiesScene() {
  const a = [[1, 0, 6], [2, 1, 5], [3, 4, 1]];
  const pa = [[-19, 24, -6], [13, -17, 7], [5, -4, 1]];
  const product = [[11, 0, 0], [0, 11, 0], [0, 0, 11]];
  const explanations = [
    "$|A|=11$. $P_A$ là chuyển vị của ma trận các phần bù đại số.",
    "$$(AP_A)_{11}=1(-19)+0(13)+6(5)=11=|A|.$$",
    "$$(AP_A)_{12}=1(24)+0(-17)+6(-4)=0.$$ $AP_A$ ở ô này là định thức của ma trận có hai dòng trùng nhau.",
    "$$AP_A=11I_3=(|A|)I_3.$$ Các ô đường chéo bằng định thức; các ô ngoài đường chéo bằng 0.",
    "$$A^{-1}=\\frac{1}{11}P_A.$$ $P_A$ chia được cho định thức vì $|A|=11\\ne0$."
  ];
  return <LessonScene id="adjugate-identities" title="Tích ma trận phụ hợp" description="Một tích có cấu trúc: các ô đường chéo cho định thức, còn các ô ngoài đường chéo triệt tiêu." steps={5} interval={3000}>{step => <>
    <div className="reviewed-matrix-pair">
      <div>
        <h4><MathText inline>{"$A$"}</MathText></h4>
        <MatrixGrid matrix={a} highlight={(i) => step === 1 && i === 0 ? "geometry-retained" : ""} />
        <MathText inline>{"$|A|=11$"}</MathText>
      </div>
      <strong><MathText inline>{"$\\times$"}</MathText></strong>
      <div>
        <h4><MathText inline>{"$P_A$"}</MathText></h4>
        <MatrixGrid matrix={pa} highlight={(_, j) => step === 1 && j === 0 ? "geometry-picked" : ""} />
      </div>
      <strong>=</strong>
      <div>
        <h4><MathText inline>{"$AP_A$"}</MathText></h4>
        <MatrixGrid matrix={product} hidden={() => step < 3} highlight={(i, j) => i === j ? "geometry-retained" : ""} />
      </div>
    </div>
    <Result>{explanations[step]}</Result>
  </>}</LessonScene>;
}

export function MatrixEquationScene() {
  const [direction, setDirection] = useState('left');
  const a = [[2, 1], [1, 1]];
  const rightSide = direction === 'left' ? [[1, 2], [3, 4]] : [[2, 0], [1, 3]];
  const answer = direction === 'left' ? [[-2, -2], [5, 6]] : [[2, -2], [-2, 5]];
  const equation = direction === 'left' ? R`$AX=B$` : R`$YA=C$`;
  const isolated = direction === 'left' ? R`$X=A^{-1}B$` : R`$Y=CA^{-1}$`;
  const verification = direction === 'left' ? R`$AX=B$` : R`$YA=C$`;
  const explanations = direction === 'left'
    ? [R`Bài toán: $AX=B$. Giữ nguyên thứ tự các thừa số; mục tiêu là đưa $A$ sát với $A^{-1}$ ở bên trái.`, R`$|A|=1$, nên $A$ khả nghịch và $A^{-1}=\begin{pmatrix}1&-1\\-1&2\end{pmatrix}$.`, R`Nhân trái hai vế với $A^{-1}$: $A^{-1}AX=A^{-1}B$, do đó $X=A^{-1}B$.`, R`Tính tích theo quy tắc dòng nhân cột: $X=\begin{pmatrix}-2&-2\\5&6\end{pmatrix}$.`, R`Thế lại: $AX=\begin{pmatrix}1&2\\3&4\end{pmatrix}=B$.`]
    : [R`Bài toán: $YA=C$. Vì $A$ nằm bên phải ẩn số, phải khử nó từ bên phải.`, R`$|A|=1$, nên $A^{-1}=\begin{pmatrix}1&-1\\-1&2\end{pmatrix}$.`, R`Nhân phải hai vế với $A^{-1}$: $YAA^{-1}=CA^{-1}$, do đó $Y=CA^{-1}$.`, R`Tính tích theo quy tắc dòng nhân cột: $Y=\begin{pmatrix}2&-2\\-2&5\end{pmatrix}$.`, R`Thế lại: $YA=\begin{pmatrix}2&0\\1&3\end{pmatrix}=C$.`];
  return <LessonScene id="matrix-equations" title="Khử ma trận ở đúng phía" description="Cùng một ma trận khả nghịch, hai vị trí khác nhau của ẩn buộc ta nhân nghịch đảo từ hai phía khác nhau." steps={5} interval={3200}>{step => <>
    <div className="matrix-equation-switch" role="group" aria-label="Chọn vị trí ma trận cần khử">
      <button type="button" aria-pressed={direction === 'left'} onClick={() => setDirection('left')}><MathText inline>{R`$AX=B$`}</MathText></button>
      <button type="button" aria-pressed={direction === 'right'} onClick={() => setDirection('right')}><MathText inline>{R`$YA=C$`}</MathText></button>
    </div>
    <div className="matrix-equation-panels">
      <div className="matrix-equation-panel"><h4><MathText inline>{R`$A$ (khả nghịch)`}</MathText></h4><MatrixGrid matrix={a} highlight={() => step === 2 ? 'geometry-picked' : ''} /><MathText inline>{step >= 1 ? R`$A^{-1}=\begin{pmatrix}1&-1\\-1&2\end{pmatrix}$` : R`$|A|=1$`}</MathText></div>
      <div className="matrix-equation-operator"><MathText inline>{equation}</MathText><span>{step < 2 ? 'giữ thứ tự ban đầu' : <MathText inline>{isolated}</MathText>}</span></div>
      <div className="matrix-equation-panel"><h4><MathText inline>{direction === 'left' ? R`$B$ (vế phải)` : R`$C$ (vế phải)`}</MathText></h4><MatrixGrid matrix={rightSide} highlight={() => step === 2 ? 'geometry-retained' : ''} /><MathText inline>{direction === 'left' ? R`$B=\begin{pmatrix}1&2\\3&4\end{pmatrix}$` : R`$C=\begin{pmatrix}2&0\\1&3\end{pmatrix}$`}</MathText></div>
      <div className="matrix-equation-answer"><div><span>Ẩn số sau khi cô lập</span><MathText inline>{step >= 2 ? isolated : direction === 'left' ? R`$X$` : R`$Y$`}</MathText></div><div className={step >= 3 ? 'is-revealed' : ''}><h4>{direction === 'left' ? 'Nghiệm X' : 'Nghiệm Y'}</h4>{step >= 3 ? <MatrixGrid matrix={answer} /> : <div className="matrix-equation-placeholder" aria-label="Nghiệm chưa được tính">?</div>}</div></div>
    </div>
    <Result>{explanations[step]}</Result>
    {step >= 4 && <div className="matrix-equation-check"><span>Kiểm tra trực tiếp</span><MathText inline>{verification}</MathText><MatrixGrid matrix={rightSide} highlight={() => 'geometry-retained'} /></div>}
  </>}</LessonScene>;
}

export function IOCoefficientScene() {
  const [quantity, setQuantity] = useState(200);
  return <LessonScene id="io-coefficient" title="0,2 \u0111\u1EA7u v\xE0o cho 1 \u0111\u1EA7u ra: c\xF9ng nh\xE2n v\u1EDBi $X_{3}$" description="Ngành 1 cung, ngành 3 nhận. Theo dõi hai số trong một bảng tỷ lệ trước khi rút ra công thức." steps={5} interval={3200}>{step => {
      const scale = step < 2 ? 1 : quantity,
        actual = .2 * scale;
      return <>
      <label className="reviewed-quantity"><MathText inline>{"S\u1EA3n l\u01B0\u1EE3ng th\u1EF1c $X_{3}$"}</MathText><select value={quantity} onChange={e => setQuantity(+e.target.value)}>{[100, 200, 300].map(v => <option key={v}>{v}</option>)}</select></label>
      <div className="io-ratio-head"><div className="io-supplier-meaning"><small>Đầu vào từ</small><strong>Ngành 1</strong></div><div className="io-receiver-meaning"><small>Đầu ra của</small><strong>Ngành 3</strong></div></div>
      <div className="io-proportion"><div><span>Định mức cho 1 đơn vị</span><strong className="io-input-number">0,2</strong><strong className="io-output-number">1</strong></div><div className={step >= 1 ? 'io-scaling visible' : 'io-scaling'}><span>Cùng hệ số</span><strong><MathText inline>{"$\\times$"}</MathText>{quantity}</strong><strong><MathText inline>{"$\\times$"}</MathText>{quantity}</strong></div><div className="io-actual-row"><span>Giá trị thực</span><strong className="io-input-number" data-io-input>{step >= 2 ? actual.toFixed(0) : ''}</strong><strong className="io-output-number" data-io-output>{step >= 2 ? scale : ''}</strong></div></div>
      <div className="io-proportion-bars" aria-label={`Đầu vào chiếm 20 phần trăm sản lượng ngành 3`}><div><span>1 → 3</span><i style={{
              transform: `scaleX(${step >= 2 ? .2 : 0})`
            }} /><strong>{step >= 2 ? actual.toFixed(0) : ''}</strong></div><div><span>Sản lượng 3</span><i style={{
              transform: `scaleX(${step >= 2 ? 1 : 0})`
            }} /><strong>{step >= 2 ? quantity : ''}</strong></div></div>
      <Result>{[R`$a_{13}$=0,2: ngành 3 sản xuất 1 đơn vị cần 0,2 đầu vào từ ngành 1. Hai chỉ số giữ hai vai trò khác nhau.`, `Ngành 3 sản xuất ${quantity} đơn vị. Nhân cả hai vế của định mức với ${quantity}, không chỉ nhân đầu ra.`, `Ngành 1 cần cung ${(.2 * quantity).toFixed(0)} cho ngành 3. Tỷ lệ đầu vào/đầu ra vẫn là 0,2.`, `$x_{13}=a_{13}X_3=0.2\\cdot${quantity}=${(.2 * quantity).toFixed(0)}$. Công thức xuất phát từ bảng tỷ lệ.`, `Suy ngược: $a_{13}=x_{13}/X_3=${(.2 * quantity).toFixed(0)}/${quantity}=0.2$. Nếu biết hệ số và giao dịch thì $X_3=x_{13}/a_{13}$.`][step]}</Result>
    </>;
    }}</LessonScene>;
}
export function IOTransactionsScene() {
  const a = [[.1, .2, .2], [.3, .2, .1], [.2, .3, .3]];
  const x = [210, 180, 200];
  const transactions = [[21, 36, 40], [63, 36, 20], [42, 54, 60]];
  const formatCoefficient = value => String(value).replace('.', '{,}');
  const cdot = String.fromCharCode(92) + 'cdot';
  return <LessonScene id='io-table' title='Từ hệ số kỹ thuật đến bảng giao dịch thực' description='Mỗi cột A nhân sản lượng ngành nhận tương ứng. Mỗi ô ghi một giao dịch thực, cùng đơn vị giá trị với sản lượng; màu cam theo dòng cung, xanh theo cột nhận.' steps={7} interval={3000}>
    {step => {
      const row = Math.min(2, Math.max(0, step - 1));
      const rowCalculation = 'Dòng ' + (row + 1) + ': $' + a[row].map((v, j) => formatCoefficient(v) + cdot + x[j] + '=' + transactions[row][j]).join(', ') + '$. Mỗi ô dùng sản lượng ở đầu cột tương ứng.';
      const result = step === 0 ? 'Các giao dịch chưa có số. Với từng ô, tính $x_{ij}=a_{ij}X_j$; không nhân với $X_i$.' : step <= 3 ? rowCalculation : step === 4 ? 'Cộng theo dòng: $97$, $119$, $156$ là lượng bán trung gian của ba ngành.' : step === 5 ? 'Cộng theo cột: $126$, $126$, $120$ là lượng đầu vào trung gian mỗi ngành nhận.' : '$97+119+156=126+126+120=372$. Hai cách cộng cùng một bảng giao dịch; không cộng hai tổng ấy vào nhau.';
      return <>
        <div className='reviewed-matrix-pair'>
          <div><h4><MathText inline>{'$A$: hệ số kỹ thuật'}</MathText></h4><MatrixGrid matrix={a} highlight={i => step >= 1 && step <= 3 && i === row ? 'geometry-picked' : ''} /></div>
          <div className='io-given-output'><h4>Sản lượng ngành nhận</h4>{x.map((v, j) => <MathText key={j} inline>{'$X_{' + (j + 1) + '}=' + v + '$'}</MathText>)}</div>
        </div>
        <div className='io-table-wrap'><table className='course-io-table io-transactions'>
          <caption><MathText inline>{'Giao dịch thực $x_{ij}=a_{ij}X_j$'}</MathText></caption>
          <thead><tr><th>Cung ↓ / Nhận →</th>{x.map((v, j) => <th key={j}>Ngành {j + 1}<br /><MathText inline>{'$X_{' + (j + 1) + '}=' + v + '$'}</MathText></th>)}<th>Tổng cung trung gian</th></tr></thead>
          <tbody>
            {transactions.map((values, i) => <tr key={i}><th>Ngành {i + 1}</th>{values.map((value, j) => <td key={j} className={(step >= 1 && step <= 3 && i === row ? 'io-row ' : '') + (step === 5 && j === 2 ? 'io-col' : '')} data-transaction={i + ':' + j}>{step >= i + 1 ? value : ''}</td>)}<td className='io-total'>{step >= 4 ? values.reduce((sum, value) => sum + value, 0) : ''}</td></tr>)}
            <tr><th>Tổng nhận trung gian</th>{x.map((_, j) => <td key={j} className='io-total'>{step >= 5 ? transactions.reduce((sum, values) => sum + values[j], 0) : ''}</td>)}<td>{step >= 6 ? 372 : ''}</td></tr>
          </tbody>
        </table></div>
        <Result>{result}</Result>
      </>;
    }}
  </LessonScene>;
}
export function IOInverseFlowsScene() {
  return <LessonScene id="io-flows" title="Tìm ô thiếu từ tổng đầu vào, rồi đọc hai chiều giao dịch" description="B\u1ED9 s\u1ED1 li\u1EC7u ri\xEAng: c\u1ED9t 3 l\xE0 $(0,3;m;0,1), X_{3}=150$, t\u1ED5ng \u0111\u1EA7u v\xE0o 75. $X_{2}=200, a_{32}=0,2$ d\xF9ng cho chi\u1EC1u ng\u01B0\u1EE3c l\u1EA1i." steps={8} interval={3000}>{step => <>
    <div className="reviewed-matrix-pair"><div><h4><MathText inline>{"C\u1ED9t $3 \\cdot$ ng\xE0nh nh\u1EADn 3"}</MathText></h4><div className="cramer-column"><span>0,3</span><span className="io-unknown">{step >= 3 ? '0,1' : 'm'}</span><span>0,1</span></div></div><div><h4><MathText inline>{"Nh\xE2n $X_{3}=150$"}</MathText></h4><div className="cramer-column"><span>{step >= 1 ? '45' : ''}</span><span className="io-unknown">{step >= 4 ? '15' : step >= 1 ? '150m' : ''}</span><span>{step >= 1 ? '15' : ''}</span></div></div><div className="io-equation-total"><span>Tổng đầu vào ngành 3</span><strong>75</strong></div></div>
    <div className="reviewed-proof">{[R`Tổng theo cột: $x_{13}+x_{23}+x_{33}=75$.`, R`Nhân từng định mức với cùng $X_3$: $45+150m+15=75$.`, R`$150m=75-45-15=15$.`, R`$m=15/150=0.1$. Đây là $a_{23}$, định mức ngành 2 cung cho ngành 3.`, R`Chiều 2→3: $x_{23}=a_{23}X_3=0.1(150)=15$.`, R`Chiều 3→2: $x_{32}=a_{32}X_2=0.2(200)=40$. Đổi ngành nhận nên đổi sản lượng nhân.`, R`Tổng hai giao dịch: $x_{23}+x_{32}=15+40=55$.`, R`Kiểm tra cột 3: $45+15+15=75$. Không đưa $x_{32}$=40 vào cột 3, vì ô này thuộc cột 2.`].slice(0, step + 1).map((line, i) => <div key={i} className={i === step ? 'current' : ''}><MathText>{line}</MathText></div>)}</div>
  </>}</LessonScene>;
}