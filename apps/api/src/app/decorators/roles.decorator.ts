import { SetMetadata } from '@nestjs/common';

export enum UserRole {
  MANAGER = 'manager',
  DEV = 'dev',
  TESTER = 'tester',
  DESIGNER = 'designer',
  HR = 'hr',
  BIZ_DEV = 'business_dev',
}

export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
