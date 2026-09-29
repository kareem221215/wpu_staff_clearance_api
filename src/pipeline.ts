import { UserRoleEnum } from './enums/user-role.enum.js';

export const PIPELINE: Readonly<
  Partial<
    Record<
      UserRoleEnum,
      Readonly<{ readonly last: boolean; next: UserRoleEnum | null }>
    >
  >
> = Object.freeze({
  [UserRoleEnum.STOREKEEPER]: Object.freeze({
    last: false,
    next: UserRoleEnum.IT_MANAGER,
  }),
  [UserRoleEnum.IT_MANAGER]: Object.freeze({
    last: false,
    next: UserRoleEnum.ACCOUNTING_STAFF_STAFF,
  }),
  [UserRoleEnum.ACCOUNTING_STAFF_STAFF]: Object.freeze({
    last: false,
    next: UserRoleEnum.ACCOUNTING_MANAGER,
  }),
  [UserRoleEnum.ACCOUNTING_MANAGER]: Object.freeze({
    last: false,
    next: UserRoleEnum.CENTRAL_LIBRARY_MANAGER,
  }),
  [UserRoleEnum.CENTRAL_LIBRARY_MANAGER]: Object.freeze({
    last: false,
    next: UserRoleEnum.HR_STAFF,
  }),
  [UserRoleEnum.HR_STAFF]: Object.freeze({
    last: true,
    next: null,
  }),
  [UserRoleEnum.ADMIN]: Object.freeze({
    last: false,
    next: null,
  }),
});
