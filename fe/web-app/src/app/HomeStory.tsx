import { useEffect, useRef, useState, type ReactNode } from 'react';

export function HomeStoryDivider() {
  return <div className="home-story-divider" aria-hidden="true"><span className="home-story-divider-image first" /><span className="home-story-divider-line" /><span className="home-story-divider-image second" /></div>;
}

export function HomeStoryReveal({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || !('IntersectionObserver' in window)) {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) {
        setVisible(true);
        observer.disconnect();
      }
    }, { threshold: 0.15 });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return <div ref={ref} className={`home-story-reveal${visible ? ' is-visible' : ''}`}>{children}</div>;
}
