import { useEffect, useState } from 'react';
import { brand } from '../../../services/shared/brand';

/** Show the light still image first, then fade in the slow, silent loop when motion is allowed. */
export function AuthMotionBackground() {
  const [playVideo, setPlayVideo] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
    if (!reducedMotion && !saveData) setPlayVideo(true);
  }, []);

  return <div className={`login-motion-wall${playVideo ? ' has-video' : ''}`} aria-hidden="true">
    {playVideo && <video
      className={`auth-motion-video${ready ? ' is-ready' : ''}`}
      autoPlay muted loop playsInline preload="none" poster={brand.assets.authWall}
      onCanPlay={() => setReady(true)} onError={() => setPlayVideo(false)}
    >
      <source src={brand.assets.authMotion} type="video/mp4" />
    </video>}
  </div>;
}
