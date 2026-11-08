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
      <img className="home-banner-art" src={brand.assets.quickPick} alt="Áo blazer tím phối cùng áo kem, chân váy xếp ly và phụ kiện" width="1672" height="941" />
    </section>
  );
}
