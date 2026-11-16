import { ChevronLeft, ChevronRight, Pause, Play, RotateCcw } from 'lucide-react';
import '../../assets/styles/MatrixMovies.css';
export function PlaybackControls({
  playback,
  steps,
  label = 'minh họa'
}) {
  return <div className="math-playback"><div className="math-playback-modes" role="group" aria-label={`Chế độ ${label}`}><button type="button" aria-pressed={playback.mode === 'auto'} onClick={() => {
        playback.setMode('auto');
        playback.setPlaying(true);
      }}>Tự động</button><button type="button" aria-pressed={playback.mode === 'manual'} onClick={() => playback.setMode('manual')}>Từng bước</button></div><div className="math-playback-transport">{playback.mode === 'auto' ? <button className="study-icon" type="button" onClick={() => playback.setPlaying(value => !value)} aria-label={playback.playing ? `Tạm dừng ${label}` : `Phát ${label}`}>{playback.playing ? <Pause size={16} /> : <Play size={16} />}</button> : <><button className="study-icon" type="button" disabled={playback.step === 0} onClick={() => playback.seek(playback.step - 1)} aria-label={`Bước trước ${label}`}><ChevronLeft size={16} /></button><button className="study-icon" type="button" disabled={playback.step === steps - 1} onClick={() => playback.seek(playback.step + 1)} aria-label={`Bước tiếp ${label}`}><ChevronRight size={16} /></button></>}<button className="study-icon" type="button" onClick={() => playback.setStep(0)} aria-label={`Xem lại từ đầu ${label}`}><RotateCcw size={15} /></button><span>{playback.step + 1} / {steps}</span></div>{playback.reduced && playback.mode === 'auto' && <p className="math-playback-motion-note">Trình duyệt đang bật giảm chuyển động. Chọn “Từng bước” để xem các trạng thái tĩnh.</p>}</div>;
}
