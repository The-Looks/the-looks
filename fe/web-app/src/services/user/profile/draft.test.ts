import { afterEach, expect, it } from 'vitest';
import { session } from '../../shared/session';
import { clearProfileDraft, readProfileDraft, writeProfileDraft } from './draft';

afterEach(() => localStorage.clear());

it('restores only the current account draft and removes it after saving', () => {
  expect(writeProfileDraft('user-1', 'An mới', 'Huế')).toBe(true);
  expect(readProfileDraft('user-1')).toMatchObject({ username: 'An mới', city: 'Huế' });
  expect(readProfileDraft('user-2')).toBeNull();
  clearProfileDraft('user-1');
  expect(readProfileDraft('user-1')).toBeNull();
});

it('ignores malformed drafts and clears browser drafts when the session ends', () => {
  localStorage.setItem('thelooks.draft.profile.v1.user-1', '{broken');
  expect(readProfileDraft('user-1')).toBeNull();
  writeProfileDraft('user-2', 'Bình', '');
  session.clear();
  expect(readProfileDraft('user-2')).toBeNull();
});
