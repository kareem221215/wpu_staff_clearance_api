import { UserRoleEnum } from '../enums/user-role.enum.js';
import { IRequestAction } from './request-action.interface.js';

export interface IRequest {
  readonly actions: IRequestAction[];
  readonly archived: boolean;
  readonly createdAt: Date;
  readonly departmentId: number;
  readonly departmentName: string;
  readonly employeeId: number;
  readonly employeeName: string;
  readonly nextActionRole: UserRoleEnum | null;
  readonly requestId: number;
  readonly updatedAt: Date;
}
