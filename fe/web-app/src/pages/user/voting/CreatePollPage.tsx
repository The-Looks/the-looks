import { useState, type FormEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import { errorMessage } from '../../../services/shared/api/client';
import { formatDate } from '../../../services/shared/format';
import { categoryLabel } from '../../../services/shared/labels';
import { Button, Card, Field, Notice, PageHeader, Spinner } from '../../../components/shared/ui/index';
import type { SavedOutfit, WardrobeItem } from '../../../interface/dto/types';
import { occasionLabel } from '../../../services/user/outfit/occasions';
import { useWardrobe } from '../../../hooks/user/wardrobe/api';
import { useCreatePoll, useOutfitChoices } from '../../../hooks/user/voting/api';

function outfitLabel(outfit: SavedOutfit, items: WardrobeItem[]) {
  const pieces = outfit.itemIds.map((id) => items.find((item) => item.id === id)?.category).filter(Boolean).map(categoryLabel);
  return `${occasionLabel(outfit.occasion) ?? 'Tự phối'} · ${pieces.length ? pieces.join(' + ') : `${outfit.itemIds.length} món`} · lưu ${formatDate(outfit.createdAt)}`;
}

function OutfitPreview({ outfit, items }: { outfit?: SavedOutfit; items: WardrobeItem[] }) {
  if (!outfit) return null;
  return (
    <div className="poll-outfit-preview">
      <div className="poll-outfit-images">
        {outfit.itemIds.map((id, index) => {
          const item = items.find((entry) => entry.id === id);
          return item?.imageUrl
            ? <img key={id} src={item.imageUrl} alt={`${categoryLabel(item.category)} trong outfit, món ${index + 1}`} />
            : <span key={id}>{categoryLabel(item?.category)}</span>;
        })}
      </div>
      <span>{outfitLabel(outfit, items)}</span>
    </div>
  );
}

export function CreatePollPage() {
  const [params] = useSearchParams();
  const outfits = useOutfitChoices();
  const wardrobe = useWardrobe();
  const create = useCreatePoll();
  const [a, setA] = useState(params.get('outfit') ?? '');
  const [b, setB] = useState('');
  const [question, setQuestion] = useState('');
  const [copied, setCopied] = useState(false);
  const [shareError, setShareError] = useState(false);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    create.mutate({ outfitAId: a, outfitBId: b, question: question || undefined, ttlHours: 24 });
  };

  const copy = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setShareError(false);
    } catch {
      setCopied(false);
      setShareError(true);
    }
  };

  const share = async (url: string) => {
    if (!navigator.share) return copy(url);
    try {
      await navigator.share({ title: 'Bình chọn outfit cùng mình', url });
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return;
      await copy(url);
    }
  };

  const items = wardrobe.data ?? [];
  const options = outfits.data?.map((o) => (
    <option key={o.id} value={o.id}>
      {outfitLabel(o, items)}
    </option>
  ));

  return (
    <div className="stack-lg">
      <PageHeader title="Tạo bình chọn" back={{ to: '/polls' }} />
      {outfits.isPending && <Spinner />}
      {create.data ? (
        <Card>
          <h2>Đã tạo bình chọn</h2>
          <p className="muted">Gửi link này vào nhóm Zalo, bạn bè bấm là chọn được ngay.</p>
          <input className="field" readOnly value={create.data.shareUrl} aria-label="Link bình chọn" onFocus={(e) => e.target.select()} style={{ padding: 12, borderRadius: 14, border: '1px solid var(--line)', font: 'inherit' }} />
          <div className="row">
            <Button onClick={() => void share(create.data.shareUrl)}>Chia sẻ</Button>
            <Button onClick={() => copy(create.data.shareUrl)}>{copied ? 'Đã sao chép' : 'Sao chép link'}</Button>
          </div>
          {shareError && <Notice tone="warn">Không thể sao chép tự động. Hãy chọn link ở ô phía trên để sao chép.</Notice>}
        </Card>
      ) : (
        <Card>
          <form className="stack" onSubmit={submit}>
            <Field id="poll-question" label="Câu hỏi (không bắt buộc)" maxLength={140} placeholder="Đi hẹn hò tối nay nên mặc bộ nào?" value={question} onChange={(e) => setQuestion(e.target.value)} />
            <div className="field">
              <label htmlFor="poll-a">Outfit A</label>
              <select id="poll-a" required value={a} onChange={(e) => setA(e.target.value)}>
                <option value="">Chọn outfit đã lưu</option>
                {options}
              </select>
              <OutfitPreview outfit={outfits.data?.find((o) => o.id === a)} items={items} />
            </div>
            <div className="field">
              <label htmlFor="poll-b">Outfit B</label>
              <select id="poll-b" required value={b} onChange={(e) => setB(e.target.value)}>
                <option value="">Chọn outfit đã lưu</option>
                {options}
              </select>
              <OutfitPreview outfit={outfits.data?.find((o) => o.id === b)} items={items} />
            </div>
            {a && a === b && <Notice tone="warn">Hãy chọn 2 outfit khác nhau.</Notice>}
            {create.isError && <Notice tone="error">{errorMessage(create.error)}</Notice>}
            <Button type="submit" disabled={create.isPending || !a || !b || a === b}>
              {create.isPending ? 'Đang tạo…' : 'Tạo link bình chọn'}
            </Button>
          </form>
        </Card>
      )}
    </div>
  );
}
