import * as Bcrypt from 'bcryptjs';

export function hashPassword(password: string): string {
  const saltRounds = 12;
  return Bcrypt.hashSync(password, saltRounds);
}

export function comparePassword(password: string, hash: string): boolean {
  return Bcrypt.compareSync(password, hash);
}

/**
 * @description:: Calculate fee from amount
 * @param amount
 * @returns fee: Number
 */
export function calculateFeeFromAmount(amount: number): number {
  // we charge 20%
  const percentageFee = 0.2;
  return amount * percentageFee;
}

export function toBoolean(input: string): boolean | undefined {
  try {
    return JSON.parse(input);
  } catch (e) {
    return undefined;
  }
}
