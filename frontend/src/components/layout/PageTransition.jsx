import { useOutlet } from 'react-router-dom';

export default function PageTransition() {
  const outlet = useOutlet();

  return (
    <div className="route-stage">
      <div className="route-stage-content">{outlet}</div>
    </div>
  );
}
