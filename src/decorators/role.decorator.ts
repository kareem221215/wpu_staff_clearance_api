import { SetMetadata } from '@nestjs/common';
import { ROLE_TOKEN } from '../tokens/role.token.js';

export const Role = (...possibleRoles: string[]) =>
  SetMetadata(ROLE_TOKEN, possibleRoles);
