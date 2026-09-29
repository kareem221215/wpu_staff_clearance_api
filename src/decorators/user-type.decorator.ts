import { SetMetadata } from '@nestjs/common';
import { UserTypeEnum } from '../enums/user-type.enum.js';
import { USER_TYPE_TOKEN } from '../tokens/user-type.token.js';

export const UserType = (...possibleTypes: UserTypeEnum[]) =>
  SetMetadata(USER_TYPE_TOKEN, possibleTypes);
