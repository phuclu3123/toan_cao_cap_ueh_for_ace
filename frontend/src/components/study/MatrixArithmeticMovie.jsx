import { useCallback, useEffect, useRef, useState } from 'react';
import useMathPlayback from '../../hooks/useMathPlayback';
import { PlaybackControls } from './MatrixMovies';
import { MathText } from './StudyPrimitives';

function Matrix({ values, name, focus, operation, resultColumns, reveal, term }) {
  const columns = values[0].length;
  const isMultiplication = operation === 'multiply';
  return <div className="movie-small-matrix">
    <div className="movie-matrix-name"><MathText inline>{'$' + name + '$'}</MathText><small><MathText inline>{'$' + values.length + '\\times' + columns + '$'}</MathText></small></div>
    <div className="movie-matrix-grid" style={{ gridTemplateColumns: 'repeat(' + columns + ',var(--movie-cell,44px))' }} role="group" aria-label={'Ma trận ' + name + ', ' + values.length + ' dòng ' + columns + ' cột'}>
      {values.flatMap((row, i) => row.map((value, j) => {
        const active = name === 'A'
          ? isMultiplication ? i === Math.floor(focus / resultColumns) : i * columns + j === focus
          : name === 'B'
            ? isMultiplication ? j === focus % resultColumns : i * columns + j === focus
            : i * columns + j === focus;
        const shown = !reveal || reveal(i * columns + j);
        const paired = isMultiplication && term >= 0 && (name === 'A' ? active && j === term : name === 'B' ? active && i === term : false);
        const classes = [active && 'movie-focus-' + name.toLowerCase(), paired && 'movie-paired-operand', !shown && 'movie-unfilled'].filter(Boolean).join(' ');
        return <span data-matrix={name} data-math-value={shown ? String(value) : ''} data-row={i} data-col={j} key={i + '-' + j} className={classes} aria-label={name + ' dòng ' + (i + 1) + ' cột ' + (j + 1) + ': ' + (shown ? value : 'chưa tính')}>
          {shown ? <MathText inline>{'$' + value + '$'}</MathText> : <span className="movie-empty-slot" aria-hidden="true" />}
        </span>;
      }))}
    </div>
  </div>;
}

const signed = value => value < 0 ? '(' + value + ')' : String(value);

export default function MatrixArithmeticMovie({ initialOperation = 'multiply', allowedOperations = ['add', 'subtract', 'multiply'] }) {
  const stageRef = useRef(null);
  const [operation, setOperation] = useState(initialOperation);
  const multiplication = operation === 'multiply';
  const a = [[1, 2, 3], [4, 5, 6]];
  const b = multiplication ? [[2, 0], [1, 3], [-1, 2]] : [[2, 0, 1], [1, 3, -2]];
  const columns = b[0].length;
  const phases = multiplication ? 5 : 3;
  const count = a.length * columns;
  const { attach, ...playback } = useMathPlayback(count * phases + 1, 1450);
  const setStage = useCallback(element => {
    attach(element);
    stageRef.current = element;
  }, [attach]);
  const focus = Math.min(count - 1, Math.floor(playback.step / phases));
  const phase = playback.step === count * phases ? phases - 1 : playback.step % phases;
  const row = Math.floor(focus / columns);
  const column = focus % columns;
  const result = a.map((values, i) => Array.from({ length: columns }, (_, j) =>
    operation === 'add' ? values[j] + b[i][j]
      : operation === 'subtract' ? values[j] - b[i][j]
        : values.reduce((sum, value, k) => sum + value * b[k][j], 0)));
  const completed = playback.step === count * phases ? count : Math.floor(playback.step / phases) + (phase === phases - 1 ? 1 : 0);
  const visibleTerms = multiplication ? Math.min(3, phase) : 0;

  useEffect(() => {
    if (playback.reduced || !stageRef.current) return;
    const root = stageRef.current;
    const term = multiplication ? Math.min(2, phase - 1) : 0;
    if (term < 0 || phase === phases - 1) return;
    const flights = [];
    for (const name of ['A', 'B']) {
      if (!multiplication && name === 'B' && phase < 1) continue;
      const r = name === 'A' ? row : multiplication ? term : row;
      const c = name === 'A' ? multiplication ? term : column : column;
      const source = root.querySelector('[data-matrix="' + name + '"][data-row="' + r + '"][data-col="' + c + '"]');
      const target = root.querySelector('[data-operand="' + name + '-' + term + '"]');
      if (!source || !target) continue;
      const start = source.getBoundingClientRect();
      const end = target.getBoundingClientRect();
      const token = document.createElement('span');
      token.className = 'math-operand-flight flight-' + name.toLowerCase();
      token.textContent = source.dataset.mathValue || '';
      token.setAttribute('aria-hidden', 'true');
      Object.assign(token.style, { left: end.left + 'px', top: end.top + 'px', width: end.width + 'px', height: end.height + 'px' });
      document.body.append(token);
      const animation = token.animate([
        { transform: 'translate(' + (start.left - end.left) + 'px,' + (start.top - end.top) + 'px) scale(1.15)', opacity: 1 },
        { transform: 'translate(0,0) scale(1)', opacity: 1 }
      ], { duration: 850, easing: 'cubic-bezier(.25,.7,.25,1)' });
      animation.onfinish = () => token.remove();
      flights.push({ token, animation });
    }
    return () => flights.forEach(({ token, animation }) => {
      animation.cancel();
      token.remove();
    });
  }, [phase, row, column, multiplication, phases, playback.reduced, operation]);

  const symbol = multiplication ? '\\times' : operation === 'add' ? '+' : '-';
  return <section className="math-explorer matrix-arithmetic" ref={setStage} aria-label="Minh họa phép toán ma trận">
    <div className="math-explorer-heading">
      <span>Thực hiện tuần tự</span>
      <h3><MathText inline>{multiplication ? '$2\\times3$ nhân $3\\times2$: dòng gặp cột' : 'Cộng và trừ đúng cặp cùng vị trí'}</MathText></h3>
      <p><MathText inline>{multiplication ? 'Ba cột của $A$ khớp ba dòng của $B$. Mỗi ô kết quả cần ba tích; chỉ điền ô đó sau khi cộng xong.' : 'Hai ma trận cùng kích thước $2\\times3$. Ô kết quả còn trống cho tới khi phép tính của ô đó hoàn tất.'}</MathText></p>
    </div>
    <div className="matrix-operation-picker" role="group" aria-label="Chọn phép toán">
      {allowedOperations.includes('add') && <button aria-pressed={operation === 'add'} onClick={() => { setOperation('add'); playback.setStep(0); }}>Cộng</button>}
      {allowedOperations.includes('subtract') && <button aria-pressed={operation === 'subtract'} onClick={() => { setOperation('subtract'); playback.setStep(0); }}>Trừ</button>}
      {allowedOperations.length > 1 && allowedOperations.includes('multiply') && <button aria-pressed={multiplication} onClick={() => { setOperation('multiply'); playback.setStep(0); }}>Nhân</button>}
    </div>
    <div className="movie-arithmetic-stage">
      <div className="movie-source-pair">
        <Matrix values={a} name="A" focus={focus} operation={operation} resultColumns={columns} term={Math.min(2, phase - 1)} />
        <strong className="movie-operation-symbol"><MathText inline>{'$' + symbol + '$'}</MathText></strong>
        <Matrix values={b} name="B" focus={focus} operation={operation} resultColumns={columns} term={Math.min(2, phase - 1)} />
      </div>
      <div className="movie-result-pair"><strong className="movie-operation-symbol"><MathText inline>{'$=$'}</MathText></strong><Matrix values={result} name="C" focus={focus} operation={operation} resultColumns={columns} reveal={index => index < completed} /></div>
    </div>
    <div className="movie-calculation" aria-live={playback.mode === 'manual' ? 'polite' : 'off'}>
      <span className="movie-cell-index"><MathText inline>{'$c_{' + (row + 1) + (column + 1) + '}$'}</MathText></span><MathText inline>{'$=$'}</MathText>
      {multiplication
        ? visibleTerms === 0
          ? <span className="movie-next-instruction">Chọn dòng {row + 1} của <MathText inline>{'$A$'}</MathText> và cột {column + 1} của <MathText inline>{'$B$'}</MathText></span>
          : Array.from({ length: visibleTerms }, (_, k) => <span className="movie-term" key={k}>
            {k > 0 && <span className="movie-plus"><MathText inline>{'$+$'}</MathText></span>}
            <em data-operand={'A-' + k}><MathText inline>{'$' + signed(a[row][k]) + '$'}</MathText></em>
            <MathText inline>{'$\\times$'}</MathText>
            <b data-operand={'B-' + k}><MathText inline>{'$' + signed(b[k][column]) + '$'}</MathText></b>
          </span>)
        : <>
          <em data-operand="A-0"><MathText inline>{'$' + signed(a[row][column]) + '$'}</MathText></em>
          {phase >= 1 && <><MathText inline>{'$' + symbol + '$'}</MathText><b data-operand="B-0"><MathText inline>{'$' + signed(b[row][column]) + '$'}</MathText></b></>}
        </>}
      {phase === phases - 1 && <><MathText inline>{'$=$'}</MathText><strong className="movie-cell-result"><MathText inline>{'$' + result[row][column] + '$'}</MathText></strong></>}
    </div>
    <div className="movie-color-key"><span><i className="key-a" />{multiplication ? 'Dòng của A' : 'Phần tử của A'}</span><span><i className="key-b" />{multiplication ? 'Cột của B' : 'Phần tử của B'}</span><span><i className="key-c" />Kết quả đã tính xong</span></div>
    <PlaybackControls playback={playback} steps={count * phases + 1} label="phép toán ma trận" />
    <div className="math-explorer-conclusion"><p>{completed} / {count} ô đã được điền. <MathText inline>{multiplication ? 'Kích thước kết quả: $2$ dòng của $A$ nhân $2$ cột của $B$. Không nhân theo từng cặp cùng vị trí.' : 'Kích thước kết quả giữ nguyên: $2\\times3$.'}</MathText></p></div>
  </section>;
}
