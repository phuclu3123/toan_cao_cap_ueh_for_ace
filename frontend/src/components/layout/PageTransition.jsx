import { useLocation, useOutlet } from 'react-router-dom';

export default function PageTransition() {
  const location = useLocation();
  const outlet = useOutlet();

  return (
    <div
      className="route-stage"
      data-route={location.pathname}
      key={location.pathname}
    >
      <div className="route-stage-curtain" aria-hidden="true" />
      <div className="route-stage-content">{outlet}</div>
    </div>
  );
}
