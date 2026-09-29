import { ForbiddenException, Injectable } from '@nestjs/common';
import { RequestActionTypeEnum } from '../enums/request-action-type.enum.js';
import { UserRoleEnum } from '../enums/user-role.enum.js';
import { IRequest } from '../interfaces/request.interface.js';
import { DepartmentsService } from './departments.service.js';

@Injectable()
export class AuthorizationService {
  static GLOBAL_ROLES = new Set<UserRoleEnum>([
    UserRoleEnum.ACCOUNTING_MANAGER,
    UserRoleEnum.ACCOUNTING_STAFF_STAFF,
    UserRoleEnum.CENTRAL_LIBRARY_MANAGER,
    UserRoleEnum.HR_STAFF,
    UserRoleEnum.IT_MANAGER,
    UserRoleEnum.STOREKEEPER,
  ]);

  constructor(private readonly departmentsService: DepartmentsService) {}

  getAccessableDepartmentIds(
    userRoles: UserRoleEnum[],
    userDepartmentId: number,
    filter?: number[],
  ): number[] | undefined {
    if (this.#hasGlobalAccess(userRoles)) {
      return filter;
    }

    return [userDepartmentId];
  }

  async canTakeAction(
    request: IRequest,
    userDepartmentId: number,
    userRoles: UserRoleEnum[],
    actionType: RequestActionTypeEnum,
  ) {
    this.#validateNotArchived(request);

    this.#validateArchivability(actionType, userRoles, request.nextActionRole);

    if (!request.actions.length) {
      if (request.departmentId !== userDepartmentId) {
        throw new ForbiddenException();
      }
    } else if (!this.#hasGlobalAccess(userRoles)) {
      throw new ForbiddenException();
    }

    this.#validateLastAction(
      request,
      actionType as
        RequestActionTypeEnum.APPROVE | RequestActionTypeEnum.REJECT,
      userRoles,
    );

    this.#validateIfUserIsNext(request, userRoles);
  }

  #validateNotArchived(request: IRequest) {
    if (
      request.actions.some(({ type }) => type === RequestActionTypeEnum.ARCHIVE)
    ) {
      throw new ForbiddenException();
    }
  }

  #hasGlobalAccess(roles: UserRoleEnum[]) {
    return roles.some(
      (role) =>
        role === UserRoleEnum.ADMIN ||
        AuthorizationService.GLOBAL_ROLES.has(role),
    );
  }

  #validateArchivability(
    actionType: RequestActionTypeEnum,
    userRoles: UserRoleEnum[],
    nextActionRole: UserRoleEnum | null,
  ) {
    if (
      actionType === RequestActionTypeEnum.ARCHIVE &&
      (nextActionRole !== null || !userRoles.includes(UserRoleEnum.HR_STAFF))
    ) {
      throw new ForbiddenException();
    }
  }

  #validateLastAction(
    request: IRequest,
    actionType: RequestActionTypeEnum.APPROVE | RequestActionTypeEnum.REJECT,
    userRoles: UserRoleEnum[],
  ): void {
    const lastAction = request.actions.find(({ role }) =>
      userRoles.includes(role),
    );

    if (lastAction) {
      const { type } = lastAction;

      if (
        type === RequestActionTypeEnum.APPROVE ||
        actionType === RequestActionTypeEnum.REJECT
      ) {
        throw new ForbiddenException();
      }
    }
  }

  #validateIfUserIsNext(request: IRequest, userRoles: UserRoleEnum[]): void {
    if (
      !request.nextActionRole ||
      !userRoles.includes(request.nextActionRole)
    ) {
      throw new ForbiddenException();
    }
  }
}
