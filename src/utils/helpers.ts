import * as Bcrypt from 'bcryptjs';

export function hashPassword(password: string): string {
  const saltRounds = 12;
  return Bcrypt.hashSync(password, saltRounds);
}

export function comparePassword(password: string, hash: string): boolean {
  return Bcrypt.compareSync(password, hash);
}
