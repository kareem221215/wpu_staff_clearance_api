import { Inject, Injectable } from '@nestjs/common';
import { Brackets, DataSource, In, IsNull, Not } from 'typeorm';
import { RequestEntity } from '../entities/request.entity.js';
import { RequestActionTypeEnum } from '../enums/request-action-type.enum.js';
import { UserRoleEnum } from '../enums/user-role.enum.js';

@Injectable()
export class RequestsRepo {
  @Inject()
  private readonly dataSource!: DataSource;

  async fetch(
    archived?: boolean,
    completed?: boolean,
    departmentIds?: number[],
    employeeIds?: number[],
    skip?: number,
    take?: number,
  ): Promise<[RequestEntity[], number]> {
    const qb = this.#getQb();

    if (departmentIds?.length) {
      qb.andWhere({ departmentId: In(departmentIds) });
    }

    if (employeeIds?.length) {
      qb.andWhere({ employeeId: In(employeeIds) });
    }

    if (completed !== undefined) {
      qb.andWhere({ nextActionRole: completed ? IsNull() : Not(IsNull()) });
    }

    if (archived !== undefined) {
      qb.andWhere({
        archived,
      });
    }

    if (skip) {
      qb.skip(skip);
    }

    if (take) {
      qb.take(take);
    }

    qb.leftJoinAndSelect('r.actions', 'ra');
    qb.orderBy('r.requestId', 'DESC');

    return qb.getManyAndCount();
  }

  async fetchOneBy(
    cond: Partial<RequestEntity>,
  ): Promise<RequestEntity | null> {
    return this.#getQb().where(cond).getOne();
  }

  async count(userRoles: UserRoleEnum[], collegeIds?: number[]) {
    const qb = this.#getQb();

    if (!userRoles.includes(UserRoleEnum.ADMIN)) {
      qb.where((subQb) => {
        subQb
          .where('ra.role IN (:roles)', { roles: userRoles })
          .orWhere({ nextActionRole: In(userRoles) });
      });
    }

    if (collegeIds?.length) {
      qb.andWhere({ collegeId: In(collegeIds) });
    }

    return qb.getCount();
  }

  async countArchived(collegeIds?: number[]) {
    const qb = this.#getQb();
    qb.where('ra.type = :type', { type: RequestActionTypeEnum.ARCHIVE });

    if (collegeIds?.length) {
      qb.andWhere({ collegeId: In(collegeIds) });
    }

    return qb.getCount();
  }

  async countCompleted(collegeIds?: number[]) {
    const qb = this.#getQb();
    qb.where({ nextActionRole: IsNull() });

    if (collegeIds?.length) {
      qb.andWhere({ collegeId: In(collegeIds) });
    }

    return qb.getCount();
  }

  async create(requests: Partial<RequestEntity>[]) {
    return this.#getQb()
      .insert()
      .values(requests)
      .execute()
      .then(({ generatedMaps }) => generatedMaps as RequestEntity[]);
  }

  async patch(requestId: number, request: Partial<RequestEntity>) {
    await this.#getQb().update().set(request).where({ requestId }).execute();
  }

  async delete(requestId: number) {
    await this.#getQb().delete().where({ requestId }).execute();
  }

  #getQb() {
    return this.dataSource
      .getRepository(RequestEntity)
      .createQueryBuilder('r')
      .leftJoinAndSelect('r.actions', 'ra');
  }
}
