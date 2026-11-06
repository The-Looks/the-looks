import type { components } from '../../../interface/dto/guest/auth/auth';

type PasswordPolicy = components['schemas']['PasswordPolicy'];

export function assessPasswordStrength(password: string, policy: PasswordPolicy) {
  const hasLowercase = /\p{Ll}/u.test(password);
  const hasUppercase = /\p{Lu}/u.test(password);
  const hasNumber = /\p{N}/u.test(password);
  const hasSpecial = /[\p{P}\p{S}]/u.test(password);
  const characterTypes = [hasLowercase, hasUppercase, hasNumber, hasSpecial].filter(Boolean).length;
  const meetsMinimum = password.length >= policy.minLength;
  const strong = password.length >= policy.strongLength
    && characterTypes >= policy.recommendedCharacterTypes
    && hasLowercase && hasUppercase && hasNumber && hasSpecial;
  const medium = meetsMinimum && characterTypes >= 2;

  if (!password) return { level: 'empty' as const, percent: 0, meetsMinimum, characterTypes };
  if (strong) return { level: 'strong' as const, percent: 100, meetsMinimum, characterTypes };
  if (medium) return { level: 'medium' as const, percent: 72, meetsMinimum, characterTypes };
  return {
    level: 'weak' as const,
    percent: meetsMinimum ? 38 : Math.min(32, Math.round(password.length / policy.minLength * 32)),
    meetsMinimum,
    characterTypes,
  };
}
