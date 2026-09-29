import { UserRoleEnum } from '../enums/user-role.enum.js';

export interface IDepartment {
  readonly alias: string;
  readonly departmentId: number;
  readonly managerId: number;
  readonly managerRoleAlias: UserRoleEnum;
  readonly name: string;
}
