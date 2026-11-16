import { useState } from 'react';
import { Scene } from './CourseScenes';
import { MathText } from './StudyPrimitives';
import '../../assets/styles/CalculusReviewScenes.css';
const R = String.raw;
const fmt = n => new Intl.NumberFormat('vi-VN', {
  maximumFractionDigits: 3
}).format(n);
function Formula({
  children
}) {
  return <div className="course-formula tone-violet"><MathText>{children}</MathText></div>;
}
export function ImplicitElasticityScene() {
  return <Scene id="implicit-elasticity" title="Chọn nhánh hợp lệ rồi tính co giãn"
    description="Quan hệ tiết kiệm ẩn: chọn nghiệm theo điều kiện $S\\le0{,}3I$, sau đó so sánh độ nhạy tuyệt đối và tương đối."
    steps={6} interval={3000}>{step => {
      const px = i => 40 + (i - 8) * 24,
        py = s => 260 - s * 12;
      const curve = sign => Array.from({ length: 101 }, (_, j) => {
        const i = 8 + j * 0.16,
          s = i / 2 + sign * Math.sqrt(i);
        return (j ? 'L' : 'M') + px(i) + ',' + py(s);
      }).join(' ');
      const stages = [
        R`Hoàn thành bình phương: $\left(S-\frac I2\right)^2=I$, nên $S=\frac I2\pm\sqrt I$ với $I>0$.`,
        R`Tại $I=16$, hai nghiệm là $S=\frac{16}{2}\pm\sqrt{16}=8\pm4$, tức $S=4$ hoặc $S=12$.`,
        R`Điều kiện $S\le0{,}3I=4{,}8$ chọn điểm $(16,4)$; nhánh qua $(16,12)$ không thuộc miền mô hình.`,
        R`Với $F(I,S)=S^2+\frac{I^2}{4}-SI-I$, tại $(16,4)$ có $F_I=3$ và $F_S=-8$. Do đó $S'=-\frac{F_I}{F_S}=\frac38$.`,
        R`Chuẩn hóa thay đổi: $\varepsilon_{S,I}=\frac I S S'=\frac{16}{4}\cdot\frac38=\frac32$. Đây là hệ số co giãn, còn $S'=\frac38$ là đạo hàm.`,
        R`Nếu $I$ tăng $1\%$, thì $\Delta I\approx0{,}16$ và $\Delta S\approx\frac38(0{,}16)=0{,}06$. Tỉ lệ $\frac{0{,}06}{4}=1{,}5\%$ khớp với dự báo co giãn.`
      ];
      return <><svg viewBox="0 0 490 300" className="analysis-plot" role="img" aria-label="Hai nhánh nghiệm S bằng I chia hai cộng hoặc trừ căn I; tại thu nhập 16, điều kiện tiết kiệm chọn S bằng 4.">
        <path d="M40 20V260H455" className="analysis-axis" /><text x="450" y="285">I</text><text x="20" y="22">S</text>
        {[8, 12, 16, 20, 24].map(i => <text key={i} x={px(i)} y="280" textAnchor="middle">{i}</text>)}
        <path d={curve(-1)} className="analysis-curve blue" />
        <path d={curve(1)} className={'analysis-curve orange' + (step >= 2 ? ' excluded-branch' : '')} />
        <line x1={px(8)} y1={py(2.4)} x2={px(24)} y2={py(7.2)} className="analysis-boundary" />
        <text x={px(20)} y={py(6) - 10}>S = 0,3I</text>
        {step >= 1 && <><line x1={px(16)} x2={px(16)} y1="260" y2={py(12)} className="analysis-projection" /><circle cx={px(16)} cy={py(4)} r="7" className="analysis-dot blue" /><circle cx={px(16)} cy={py(12)} r="7" className="analysis-dot orange" /><text x={px(16) + 13} y={py(4) + 5}>(16; 4)</text><text x={px(16) + 13} y={py(12) + 5}>(16; 12)</text></>}
        {step >= 3 && <line x1={px(10)} y1={py(4 + (10 - 16) * 0.375)} x2={px(22)} y2={py(4 + (22 - 16) * 0.375)} className="analysis-tangent" />}
      </svg><div className="analysis-step-proof">{stages.slice(0, step + 1).map((s, i) => <div key={i} className={i === step ? 'current' : ''}><MathText>{s}</MathText></div>)}</div></>;
    }}</Scene>;
  }
export function PartialElasticityScene() {
  return <Scene id="partial-elasticity" title="Từng thay đổi đầu vào tạo một đóng góp riêng" description="$R=36x^{2/3}y^{1/3}$ tại $(8,125)$, $R_0=720$. Màu cam là tác động của $x$, màu xanh là tác động của $y$; ở bước cuối, cộng hai đóng góp tương đối." steps={6} interval={2800}>{step => <>
    <div className="analysis-inputs"><div className="tone-orange"><span>x: 8 → 8,48</span><strong>+6%</strong></div><div className="tone-blue"><span>y: 125 → 121,25</span><strong>−3%</strong></div></div>
    <div className="elasticity-contributions" aria-label="Đóng góp thay đổi tương đối"><div className="elasticity-scale"><span>−2%</span><span>0</span><span>+5%</span></div>
      <div className="elasticity-track"><span>Qua x</span>{step >= 1 && <div className="elasticity-bar positive"><b><MathText inline>{"$\\frac23\\times6\\%=4\\%$"}</MathText></b></div>}</div>
      <div className="elasticity-track"><span>Qua y</span>{step >= 2 && <div className="elasticity-bar negative"><b><MathText inline>{"$\\frac13\\times(-3\\%)=-1\\%$"}</MathText></b></div>}</div>
      <div className="elasticity-track"><span>Tổng</span>{step >= 3 && <div className="elasticity-bar combined"><b>+3%</b></div>}</div>
    </div>
    <Formula>{step < 1 ? R`$\varepsilon_{R,x}=\frac{2}{3}$, $\varepsilon_{R,y}=\frac{1}{3}$. Chưa cộng hai phần trăm khi chưa tính trọng số.` : step < 3 ? R`$\frac{\Delta R}{R}\approx\frac{2}{3}(0{,}06)+\frac{1}{3}(-0{,}03)$. Hai đóng góp có dấu trái nhau.` : step === 3 ? R`$\frac{\Delta R}{R}\approx0{,}04-0{,}01=0{,}03$.` : step === 4 ? R`$\Delta R\approx720(0{,}03)=21{,}6$, $R_{\mathrm{mới}}\approx741{,}6$.` : R`Chính xác: $R_{\mathrm{mới}}=720(1{,}06)^{2/3}(0{,}97)^{1/3}\approx740{,}96$. Chênh lệch với 741,6 là sai số xấp xỉ, không phải sai số làm tròn.`}</Formula>
  </>}</Scene>;
}
export function DegenerateExtremaScene() {
  const [kind, setKind] = useState('min');
  const labels = {
    min: "$x^{4} + y^{4}$",
    max: "\u2212$x^{4} - y^{4}$",
    saddle: "$x^{4} - y^{4}$"
  };
  const a = kind === 'max' ? -1 : 1,
    b = kind === 'min' ? 1 : -1;
  return <Scene id="degenerate-extrema" title="$D=0$: quay l\u1EA1i d\u1EA5u c\u1EE7a ch\xEDnh h\xE0m" description="Cùng Hessian 0 tại gốc, kết luận vẫn có thể khác nhau. Hai mặt cắt cho thấy một phép bác bỏ cực trị, còn chứng minh cực trị cần bất đẳng thức trên toàn lân cận." steps={7}>{step => {
      const t = (step - 3) / 3,
        px = x => 245 + x * 150,
        py = z => 150 - z * 100;
      const path = sign => Array.from({
        length: 81
      }, (_, j) => {
        const x = -1 + j / 40;
        return `${j ? 'L' : 'M'}${px(x)},${py(sign * x ** 4)}`;
      }).join(' ');
      return <><div className="course-case-tabs">{Object.entries(labels).map(([id, label]) => <button key={id} aria-pressed={id === kind} onClick={() => setKind(id)}>{label}</button>)}</div>
      <svg viewBox="0 0 490 300" className="analysis-plot" role="img" aria-label={`Hai mặt cắt f(t,0)=${a}$t^4$ và f(0,t)=${b}$t^4$, cùng Hessian bằng 0 tại gốc`}><path d="M45 150H450M245 25V275" className="analysis-axis" /><path d={path(a)} className="analysis-curve orange" /><path d={path(b)} className="analysis-curve blue dashed" /><circle cx={px(t)} cy={py(a * t ** 4)} r="7" className="analysis-dot orange" /><circle cx={px(t)} cy={py(b * t ** 4)} r="5" className="analysis-dot blue" /><text x="40" y="22">Đường cam: biến thứ nhất thay đổi · nét đứt xanh: biến thứ hai thay đổi</text><text x="453" y="168">t</text><text x="253" y="147">0</text></svg>
      <div className="analysis-inputs"><div className="tone-orange"><span><MathText inline>{"$f(t,0) \\cdot  t$="}</MathText>{fmt(t)}</span><strong>{fmt(a * t ** 4)}</strong></div><div className="tone-blue"><span>f(0,t)</span><strong>{fmt(b * t ** 4)}</strong></div></div>
      <Formula>{kind === 'saddle' ? R`$f(t,0)=t^4>0$, $f(0,t)=-t^4<0$ khi $t\ne0$: có cả hai dấu sát gốc, nên yên ngựa.` : kind === 'min' ? R`Chứng minh trên mọi điểm: $x^4+y^4\ge0$, dấu bằng chỉ tại gốc. Vì vậy gốc là cực tiểu chặt, đồng thời là tối thiểu toàn cục.` : R`Chứng minh trên mọi điểm: $-x^4-y^4\le0$, dấu bằng chỉ tại gốc. Vì vậy gốc là cực đại chặt, đồng thời là tối đa toàn cục.`}</Formula>
    </>;
    }}</Scene>;
}
export function BudgetConstraintScene() {
  const [equality, setEquality] = useState(true);
  return <Scene id="budget-constraint" title="Dùng hết ngân sách khác với không được vượt ngân sách" description="$\\pi =120x+240y-x^{2}-2xy-3y^{2}, x,y\\ge 0$. So s\xE1nh \u0111\u01B0\u1EDDng $x+2y=120$ v\u1EDBi mi\u1EC1n $x+2y\\le 120$." steps={5} interval={3000}>{step => {
      const px = x => 45 + x * 3.15,
        py = y => 255 - y * 3.15;
      const curve = r => Array.from({
        length: 101
      }, (_, i) => {
        const angle = 2 * Math.PI * i / 100,
          v = r * Math.sin(angle) / Math.sqrt(2),
          u = r * Math.cos(angle) - v;
        return `${i ? 'L' : 'M'}${px(30 + u)},${py(30 + v)}`;
      }).join(' ') + 'Z';
      const y = equality ? [10, 25, 35, 40, 40][step] : [10, 20, 25, 30, 30][step],
        x = equality ? 120 - 2 * y : y,
        profit = 120 * x + 240 * y - x * x - 2 * x * y - 3 * y * y;
      return <><div className="course-case-tabs"><button aria-pressed={equality} onClick={() => setEquality(true)}><MathText inline>{"Dùng hết: $x+2y=120$"}</MathText></button><button aria-pressed={!equality} onClick={() => setEquality(false)}><MathText inline>{"Không vượt: $x+2y\\le120$"}</MathText></button></div>
      <svg viewBox="0 0 490 300" className="analysis-plot" role="img" aria-label={`Miền khả thi ${equality ? 'là đường' : 'là tam giác'}, ứng viên hiện tại (${x},${y}), lợi nhuận ${profit}`}>
        <defs><clipPath id="budget-region"><rect x="45" y="20" width="410" height="235" /></clipPath></defs>
        {!equality && <path d={`M${px(0)} ${py(0)}L${px(120)} ${py(0)}L${px(0)} ${py(60)}Z`} className="analysis-feasible" />}
        <path d="M45 20V255H455" className="analysis-axis" />
        <g clipPath="url(#budget-region)">{[20, 40, 60].map(r => <path d={curve(r)} key={r} className="analysis-contour" />)}</g>
        <line x1={px(0)} y1={py(60)} x2={px(120)} y2={py(0)} className="analysis-boundary" />
        <circle cx={px(x)} cy={py(y)} r="7" className="analysis-dot orange" /><text x={px(x) + 11} y={py(y) - 12}>({x}; {y})</text>
        <circle cx={px(30)} cy={py(30)} r="3" className="analysis-dot blue" />
        <text x="46" y="285">0</text><text x={px(120)} y="278">120</text><text x="16" y={py(60)}>60</text><text x="460" y="270">x</text><text x="20" y="20">y</text>
      </svg><div className="analysis-inputs"><div className="tone-blue"><span><MathText inline>{"Chi ng\xE2n s\xE1ch $x+2y$"}</MathText></span><strong>{x + 2 * y} / 120</strong></div><div className="tone-violet"><span><MathText inline>{"$\\pi$ t\u1EA1i \u0111i\u1EC3m hi\u1EC7n t\u1EA1i"}</MathText></span><strong>{profit}</strong></div></div>
      <Formula>{step < 4 ? equality ? R`Trên đường: $x=120-2y$, $\pi=4800-3(y-40)^2$. Điểm chạy luôn dùng đúng 120.` : R`Trong miền: điểm dừng tự do (30,30) chỉ chi 90. Không buộc điểm chạy lên đường ngân sách.` : equality ? R`Đường ràng buộc cho tối đa $\pi=4800$ tại (40,40). Điểm (30,30) không thỏa đẳng thức nên bị loại.` : R`Miền bất đẳng thức chứa (30,30), $\pi=5400$. Vì $\pi=5400-(x+y-60)^2-2(y-30)^2\le5400$, đây là tối đa toàn cục.`}</Formula>
    </>;
    }}</Scene>;
}
