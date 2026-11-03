import { useEffect, useRef, useState, type ReactNode } from 'react';

export function HomeStoryDivider() {
  return <div className="home-story-divider" aria-hidden="true"><span className="home-story-divider-image first" /><span className="home-story-divider-line" /><span className="home-story-divider-image second" /></div>;
}

export function ScrollReveal({ children, className = '' }: { children: ReactNode; className?: string }) {
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
    }, { threshold: 0.04, rootMargin: '0px 0px 80px 0px' });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!visible || !ref.current) return;
    const items = ref.current.querySelectorAll<HTMLElement>('.reveal-list > *:not(.is-in-view)');
    if (!('IntersectionObserver' in window)) {
      items.forEach((item) => item.classList.add('is-in-view'));
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in-view');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.04, rootMargin: '0px 0px 48px 0px' });
    items.forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, [visible, children]);

  return <div ref={ref} className={`scroll-reveal${className ? ` ${className}` : ''}${visible ? ' is-visible' : ''}`}>{children}</div>;
}

export function HomeStoryReveal({ children }: { children: ReactNode }) {
  return <ScrollReveal className="home-story-reveal">{children}</ScrollReveal>;
}
