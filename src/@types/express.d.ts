import { IAccessTokenPayload } from '../interfaces/access-token.payload.ts';

declare global {
  namespace Express {
    export interface Request {
      user?: IAccessTokenPayload;
    }
  }
}
