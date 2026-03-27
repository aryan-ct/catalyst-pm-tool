import { Role } from '@prisma/client';

export type User = {
  role: Role;
  email: string;
};
