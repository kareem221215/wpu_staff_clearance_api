import { ApiPropertyOptional, IntersectionType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsOptional,
  IsPositive,
} from 'class-validator';
import { strToIntArr } from '../helpers/str-to-int-arr.helper.js';
import { DepartmentIdsDto } from './department-ids.dto.js';
import { FetchQueryDto } from './fetch-query.dto.js';

export class RequestFetchQueryDto extends IntersectionType(
  FetchQueryDto,
  DepartmentIdsDto,
) {
  @ApiPropertyOptional({ type: [Number] })
  @IsPositive({ each: true })
  @IsInt({ each: true })
  @IsArray()
  @IsOptional()
  @Transform(strToIntArr)
  readonly employeeIds?: number[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) =>
    value === undefined ? undefined : value === 'true',
  )
  readonly completed?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) =>
    value === undefined ? undefined : value === 'true',
  )
  readonly archived?: boolean;
}
