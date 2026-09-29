import { Transform } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsString, ValidateIf } from 'class-validator';
import { RequestActionTypeEnum } from '../enums/request-action-type.enum.js';

export class RequestActionCreateDto {
  @IsEnum(RequestActionTypeEnum)
  @IsNotEmpty()
  readonly type!: RequestActionTypeEnum;

  @IsString()
  @IsNotEmpty()
  @ValidateIf((obj) => obj?.type === RequestActionTypeEnum.REJECT)
  @Transform(({ value }) => {
    return (value as string)?.trim() || null;
  })
  readonly note!: string | null;
}
