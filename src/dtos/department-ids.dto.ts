import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsArray, IsInt, IsOptional } from 'class-validator';
import { strToIntArr } from '../helpers/str-to-int-arr.helper.js';

export class DepartmentIdsDto {
  @ApiPropertyOptional({ type: [Number] })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  @Transform(strToIntArr)
  readonly departmentIds?: number[];
}
