import { SetMetadata } from '@nestjs/common';

export enum UserRole {
  MANAGER = 'MANAGER',
  DEV = 'DEV',
  TESTER = 'TESTER',
  DESIGNER = 'DESIGNER',
  HR = 'HR',
  JR_HR = 'JR_HR',
  BDE = 'BDE',
}

export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
