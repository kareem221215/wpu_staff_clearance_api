import { Inject, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { RequestActionEntity } from '../entities/request-action.entity.js';

@Injectable()
export class RequestActionsRepo {
  @Inject()
  private readonly dataSource!: DataSource;

  async create(requestApproval: Partial<RequestActionEntity>) {
    return this.#getQb()
      .insert()
      .values(requestApproval)
      .execute()
      .then(({ generatedMaps }) => generatedMaps[0] as RequestActionEntity);
  }

  async patch(
    requestApprovalId: number,
    requestApproval: Partial<RequestActionEntity>,
  ) {
    await this.#getQb()
      .update()
      .set(requestApproval)
      .where({ requestApprovalId })
      .execute();
  }

  async delete(requestId: number) {
    await this.#getQb().delete().where({ requestId }).execute();
  }

  async getByRequestId(requestId: number) {
    return this.#getQb().where({ requestId }).getMany();
  }

  #getQb() {
    return this.dataSource
      .getRepository(RequestActionEntity)
      .createQueryBuilder('ra');
  }
}
