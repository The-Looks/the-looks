import type { OutfitSuggestion } from '../../../shared/api/types';
import { errorMessage } from '../../../shared/api/client';
import { Button, ButtonLink } from '../../../shared/ui';
import { useSaveOutfit } from '../api';

export function SaveButton({ suggestion }: { suggestion: OutfitSuggestion }) {
  const save = useSaveOutfit();
  if (save.isSuccess) {
    return (
      <ButtonLink to={`/outfits/${save.data.id}`} kind="ghost" small>
        Đã lưu · Xem outfit
      </ButtonLink>
    );
  }
  return (
    <>
      <Button small onClick={() => save.mutate(suggestion)} disabled={save.isPending}>
        {save.isPending ? 'Đang lưu…' : 'Lưu outfit'}
      </Button>
      {save.isError && <span className="small" role="alert">{errorMessage(save.error)}</span>}
    </>
  );
}
