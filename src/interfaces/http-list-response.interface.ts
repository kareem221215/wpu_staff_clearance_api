import { IHttpResponse } from './http-response.interface.js';

export interface IHttpListResponse<T> extends IHttpResponse<T[]> {
  readonly total: number;
}
