import { Inject, Injectable } from '@nestjs/common';
import { lastValueFrom, map } from 'rxjs';
import { IDepartment } from '../interfaces/department.interface.js';
import { HttpClient } from '@nestjs/http-client';

@Injectable()
export class DepartmentsService {
  @Inject()
  private readonly httpClient!: HttpClient;

  getByIds(ids: number[]) {
    return this.httpClient
      .get<IDepartment[]>('departments/by-ids', {
        params: {
          ids: ids.join(','),
        },
      })
      .then(({ data }) => data);
  }
}
