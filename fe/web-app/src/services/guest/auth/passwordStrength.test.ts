import { describe, expect, it } from 'vitest';
import { assessPasswordStrength } from './passwordStrength';

describe('password strength follows backend policy', () => {
  const policy = { minLength: 10, strongLength: 14, recommendedCharacterTypes: 3 };

  it('does not treat a password shorter than the server minimum as valid', () => {
    expect(assessPasswordStrength('Abc123!xy', policy).meetsMinimum).toBe(false);
  });

  it('keeps a long password without a special character below full strength', () => {
    const strength = assessPasswordStrength('Truongphat6789', policy);
    expect(strength.level).toBe('medium');
    expect(strength.percent).toBeLessThan(100);
    expect(assessPasswordStrength('Truongphat678', { ...policy, strongLength: 12 }).level).toBe('medium');
  });

  it('fills the meter only when all four character types are present', () => {
    expect(assessPasswordStrength('Truongphat678!', policy)).toMatchObject({ level: 'strong', percent: 100 });
  });
});
