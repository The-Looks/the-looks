import { useState } from 'react';
import { Button } from '../../shared/ui/index';
import { isModular, MASCOTS } from '../../../services/user/onboarding/mascots';
import { ACCESSORIES, CLOTHING, randomLook, type Look, type Slot } from '../../../services/user/onboarding/look';
import { MascotAvatar } from './MascotAvatar';
import './mascot-editor.css';

type Tab = 'mascot' | Slot;
const TABS: { id: Tab; label: string }[] = [
  { id: 'mascot', label: 'Linh vật' },
  { id: 'top', label: 'Áo' },
  { id: 'bottom', label: 'Quần' },
  { id: 'shoes', label: 'Giày' },
  { id: 'hat', label: 'Mũ' },
  { id: 'glasses', label: 'Kính' },
  { id: 'neck', label: 'Cổ' },
  { id: 'background', label: 'Nền' },
];

/** Tạo linh vật kiểu nhân vật game: chọn con vật rồi phối mũ, kính, phụ kiện cổ và màu nền. */
export function MascotEditor({ value, onChange }: { value: Look; onChange: (look: Look) => void }) {
  const [tab, setTab] = useState<Tab>('mascot');
  const clothes = tab !== 'mascot' && CLOTHING.includes(tab);
  const fixedOutfit = clothes && !isModular(value.mascot);
  const set = (slot: Slot, id?: string) => {
    const next = { ...value };
    if (id) next[slot] = id; else delete next[slot];
    onChange(next);
  };
  const option = (key: string, label: string, preview: Look, selected: boolean, pick: () => void) => (
    <button key={key} type="button" className="mascot-option" aria-pressed={selected} onClick={pick}>
      <span className="mascot-option-art"><MascotAvatar look={preview} portrait={!clothes} title="" /></span>
      <span>{label}</span>
    </button>
  );

  return (
    <div className="mascot-editor">
      <div className="mascot-stage">
        <div className="mascot-stage-art"><MascotAvatar look={value} /></div>
        <Button kind="outline" small onClick={() => onChange(randomLook())}>🎲 Ngẫu nhiên</Button>
      </div>
      <div className="mascot-panel">
        <div className="mascot-tabs" role="tablist" aria-label="Phần tuỳ chỉnh">
          {TABS.map((t) => (
            <button key={t.id} type="button" role="tab" aria-selected={tab === t.id} onClick={() => setTab(t.id)}>{t.label}</button>
          ))}
        </div>
        <div className="mascot-options" role="tabpanel" aria-label={TABS.find((t) => t.id === tab)!.label}>
          {tab === 'mascot'
            ? MASCOTS.map((m) => option(m.id, `${m.name} · ${m.style}`, { ...value, mascot: m.id }, value.mascot === m.id,
                () => onChange({ ...value, mascot: m.id })))
            : fixedOutfit
            ? <p className="muted mascot-note">{MASCOTS.find((m) => m.id === value.mascot)?.name} đã có trang phục riêng.
              Chọn một linh vật "Tự phối" ở tab Linh vật để thay áo, quần, giày.</p>
            : <>
              {option('none', 'Không', { ...value, [tab]: undefined }, !value[tab], () => set(tab))}
              {ACCESSORIES[tab].map((a) => option(a.id, a.name, { ...value, [tab]: a.id }, value[tab] === a.id, () => set(tab, a.id)))}
            </>}
        </div>
      </div>
    </div>
  );
}
