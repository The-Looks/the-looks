import { describe, expect, it } from 'vitest';
import { assessPasswordStrength } from './passwordStrength';

describe('password strength follows backend policy', () => {
  const policy = { minLength: 10, strongLength: 14, recommendedCharacterTypes: 3 };

  it('does not treat a password shorter than the server minimum as valid', () => {
    expect(assessPasswordStrength('Abc123!xy', policy).meetsMinimum).toBe(false);
  });

  it('rates a long password with three character types as strong', () => {
    expect(assessPasswordStrength('LongPassword123', policy).level).toBe('strong');
  });
});
