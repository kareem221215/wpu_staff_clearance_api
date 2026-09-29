import { Inject, Injectable } from '@nestjs/common';
import { lastValueFrom, map } from 'rxjs';
import { ICompactUser } from '../interfaces/compact-user.interface.js';
import { HttpClient } from '@nestjs/http-client';

@Injectable()
export class CompactUsersService {
  @Inject()
  private readonly httpClient!: HttpClient;

  getByIds(ids: number[]) {
    return this.httpClient
      .get<ICompactUser[]>('compact-users/by-ids', {
        params: { ids: ids.join(',') },
      })
      .then(({ data }) => data);
  }
}
