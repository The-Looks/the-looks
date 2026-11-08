import type { ReactNode } from 'react';
import { brand } from '../../../services/shared/brand';
import './home-banner.css';

export function HomeBanner({ children }: { children: ReactNode }) {
  return (
    <section className="home-banner">
      <div className="home-banner-copy">
        <h2>{brand.content.quickPickTitle}</h2>
        <p>{brand.content.quickPickDescription}</p>
        {children}
      </div>
      <img className="home-banner-art" src="/illustrations/lookbook.svg" alt="Sáu linh vật THE LOOKS trong trang phục theo sáu phong cách" width="960" height="570" />
    </section>
  );
}
