import { Injectable, NotFoundException } from '@nestjs/common';
import { RequestActionCreateDto } from '../dtos/request-action-create.dto.js';
import { RequestEntity } from '../entities/request.entity.js';
import { RequestActionTypeEnum } from '../enums/request-action-type.enum.js';
import { UserRoleEnum } from '../enums/user-role.enum.js';
import { ICompactUser } from '../interfaces/compact-user.interface.js';
import { IDepartment } from '../interfaces/department.interface.js';
import { IRequest } from '../interfaces/request.interface.js';
import { PIPELINE } from '../pipeline.js';
import { RequestActionsRepo } from '../repositories/request-actions.repo.js';
import { RequestsRepo } from '../repositories/requests.repo.js';
import { CompactUsersService } from './compact-users.service.js';
import { DepartmentsService } from './departments.service.js';

@Injectable()
export class RequestsService {
  constructor(
    private readonly compactUsersService: CompactUsersService,
    private readonly departmentsService: DepartmentsService,
    private readonly requestActionsRepo: RequestActionsRepo,
    private readonly requestsRepo: RequestsRepo,
  ) {}

  async create(departmentId: number, employeeId: number) {
    const [department] = await this.departmentsService.getByIds([departmentId]);

    await this.requestsRepo.create([
      {
        archived: false,
        departmentId,
        employeeId,
        nextActionRole: department.managerRoleAlias,
      },
    ]);
  }

  async fetchOneByOrFail(cond: Partial<RequestEntity>): Promise<IRequest> {
    return this.requestsRepo
      .fetchOneBy(cond)
      .then((request) => {
        if (!request) {
          throw new NotFoundException();
        }

        return request;
      })
      .then((request) =>
        this.#getRelatedEntities([request]).then(({ departments, users }) =>
          this.#mapRequests([request], departments, users),
        ),
      )
      .then(([req]) => req);
  }

  async takeAction(
    staffId: number,
    userRoles: UserRoleEnum[],
    request: IRequest,
    { note, type }: RequestActionCreateDto,
  ) {
    let currentPhase = PIPELINE[request.nextActionRole!];

    const isArchive = type === RequestActionTypeEnum.ARCHIVE;
    const isNext = userRoles.includes(request.nextActionRole!);

    let role: UserRoleEnum;

    if (isArchive) {
      await this.requestsRepo.patch(request.requestId, {
        archived: true,
      });

      role = UserRoleEnum.HR_STAFF;
    } else if (isNext) {
      await this.requestsRepo.patch(request.requestId, {
        nextActionRole: currentPhase!.next,
      });

      role = request.nextActionRole!;
    } else {
      role = request.actions.find(
        ({ role: aRole, type }) =>
          type === RequestActionTypeEnum.REJECT && userRoles.includes(aRole!),
      )!.role;
    }

    await this.requestActionsRepo.create({
      note,
      requestId: request.requestId,
      role,
      takenById: staffId,
      type,
    });
  }

  async fetch(
    archived?: boolean,
    completed?: boolean,
    departmentIds?: number[],
    employeeIds: number[] = [],
    skip?: number,
    take?: number,
  ): Promise<[IRequest[], number]> {
    if (!departmentIds?.length) {
      return [[], 0];
    }

    const [requests, count] = await this.requestsRepo.fetch(
      archived,
      completed,
      departmentIds,
      employeeIds,
      skip,
      take,
    );

    if (!count) {
      return [[], 0];
    }

    const { departments, users } = await this.#getRelatedEntities(requests);

    const requestList = this.#mapRequests(requests, departments, users);

    return [requestList, count];
  }

  async #getRelatedEntities(requests: RequestEntity[]) {
    const [departments, users] = await Promise.all([
      this.#getDepartments(requests),
      this.#getUsers(requests),
    ]);

    return { departments, users };
  }

  #getUsers(requests: RequestEntity[]) {
    const userIds = this.#extractUniqueIds(requests, (req) => {
      const takenByIds = req.actions!.map((action) => action.takenById);

      takenByIds.push(req.employeeId);

      return takenByIds;
    });

    return this.compactUsersService.getByIds(userIds);
  }

  #getDepartments(requests: RequestEntity[]) {
    const departmentIds = this.#extractUniqueIds(
      requests,
      (req) => req.departmentId,
    );

    return this.departmentsService.getByIds(departmentIds);
  }

  #extractUniqueIds<T, K>(items: T[], selector: (item: T) => K | K[]): K[] {
    const ids = items.flatMap((item) => selector(item));

    return Array.from(new Set(ids));
  }

  #mapRequests(
    requests: RequestEntity[],
    departments: IDepartment[],
    users: ICompactUser[],
  ) {
    return requests.map(({ actions, ...request }) => {
      const departmentMap = new Map(
        departments.map((c) => [c.departmentId, c.name]),
      );
      const userMap = new Map(users.map((u) => [u.userId, u.name]));

      return {
        ...request,
        employeeName: userMap.get(request.employeeId)!,
        departmentName: departmentMap.get(request.departmentId)!,
        actions: actions!.map((action) => ({
          ...action,
          takenByName: userMap.get(action.takenById)!,
        })),
      };
    });
  }
}
