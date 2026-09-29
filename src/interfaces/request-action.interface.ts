import { RequestActionTypeEnum } from '../enums/request-action-type.enum.js';
import { UserRoleEnum } from '../enums/user-role.enum.js';

export interface IRequestAction {
  readonly note: string | null;
  readonly requestActionId: number;
  readonly requestId: number;
  readonly role: UserRoleEnum;
  readonly takenAt: Date;
  readonly takenById: number;
  readonly takenByName: string;
  readonly type: RequestActionTypeEnum;
}
