import * as bcrypt from 'bcrypt';

const saltRounds = 10;

const generatePasswordHash = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(saltRounds);
  const hash = await bcrypt.hash(password, salt);
  return hash;
};

const verifyPassword = async (
  password: string,
  hash: string,
): Promise<boolean> => {
  return await bcrypt.compare(password, hash);
};

export const bcryptHashing = {
  verifyPassword,
  generatePasswordHash,
};
