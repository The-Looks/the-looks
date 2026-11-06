import { useEffect, useRef, useState } from 'react';
import { brand } from '../../../services/shared/brand';

/** Show the light still image first, then fade in the slow, silent loop when motion is allowed. */
export function AuthMotionBackground() {
  const [playVideo, setPlayVideo] = useState(false);
  const [ready, setReady] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const smallScreen = window.matchMedia('(max-width: 900px), (pointer: coarse)');
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
    const update = () => {
      const allowed = !reducedMotion.matches && !smallScreen.matches && !saveData;
      if (!allowed) setReady(false);
      setPlayVideo(allowed);
    };
    const start = window.setTimeout(update, 250);
    reducedMotion.addEventListener('change', update);
    smallScreen.addEventListener('change', update);
    return () => {
      window.clearTimeout(start);
      reducedMotion.removeEventListener('change', update);
      smallScreen.removeEventListener('change', update);
    };
  }, []);

  useEffect(() => {
    if (!playVideo) return;
    const video = videoRef.current;
    if (!video) return;
    const syncPlayback = () => {
      if (document.hidden) video.pause();
      else void video.play().catch(() => setPlayVideo(false));
    };
    document.addEventListener('visibilitychange', syncPlayback);
    syncPlayback();
    return () => document.removeEventListener('visibilitychange', syncPlayback);
  }, [playVideo]);

  return <div className="login-motion-wall" aria-hidden="true">
    <div className="auth-motion-pan-x">
      <div className="auth-motion-pan-y">
        <div className="auth-motion-still" />
        {playVideo && <video
          ref={videoRef}
          className={`auth-motion-video${ready ? ' is-ready' : ''}`}
          autoPlay muted loop playsInline preload="none" poster={brand.assets.authWall}
          onCanPlay={() => setReady(true)} onError={() => { setReady(false); setPlayVideo(false); }}
        >
          <source src={brand.assets.authMotion} type="video/mp4" />
        </video>}
      </div>
    </div>
  </div>;
}
