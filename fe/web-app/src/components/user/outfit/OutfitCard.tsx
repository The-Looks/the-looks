import type { ReactNode } from 'react';
import type { OutfitSuggestion } from '../../../interface/dto/types';
import { formatPercent } from '../../../services/shared/format';
import { Badge, Card, ItemTile } from '../../shared/ui/index';
import { occasionLabel } from '../../../services/user/outfit/occasions';

/** Một gợi ý phối đồ: các món, độ phù hợp và lý do AI chọn. */
export function OutfitCard({ suggestion, actions }: { suggestion: OutfitSuggestion; actions?: ReactNode }) {
  const label = occasionLabel(suggestion.occasion);
  return (
    <Card>
      <div className="spread">
        <div className="row">
          {label ? <Badge>{label}</Badge> : <Badge tone="pink">Quick Pick</Badge>}
          <span className="small muted">{suggestion.items.length} món</span>
        </div>
        <span className="small" aria-label="Độ phù hợp">
          <strong>{formatPercent(suggestion.score)}</strong> <span className="muted">phù hợp</span>
        </span>
      </div>
      <div className="grid-tiles">
        {suggestion.items.map((item) => (
          <ItemTile key={item.id} category={item.category} imageUrl={item.imageUrl} />
        ))}
      </div>
      <p className="small">{suggestion.reason}</p>
      {actions && <div className="row">{actions}</div>}
    </Card>
  );
}
