import type { components } from '../../shared/api/schema/auth';

type PasswordPolicy = components['schemas']['PasswordPolicy'];

export function assessPasswordStrength(password: string, policy: PasswordPolicy) {
  const characterTypes = [
    /\p{Ll}/u.test(password),
    /\p{Lu}/u.test(password),
    /\p{N}/u.test(password),
    /[\p{P}\p{S}]/u.test(password),
  ].filter(Boolean).length;
  const meetsMinimum = password.length >= policy.minLength;
  const strong = password.length >= policy.strongLength
    && characterTypes >= policy.recommendedCharacterTypes;
  const medium = meetsMinimum && characterTypes >= 2;

  if (!password) return { level: 'empty' as const, percent: 0, meetsMinimum, characterTypes };
  if (strong) return { level: 'strong' as const, percent: 100, meetsMinimum, characterTypes };
  if (medium) return { level: 'medium' as const, percent: 66, meetsMinimum, characterTypes };
  return {
    level: 'weak' as const,
    percent: meetsMinimum ? 38 : Math.min(32, Math.round(password.length / policy.minLength * 32)),
    meetsMinimum,
    characterTypes,
  };
}
