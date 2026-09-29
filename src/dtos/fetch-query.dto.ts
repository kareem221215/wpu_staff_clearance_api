import { ApiPropertyOptional, ApiSchema } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Min,
} from 'class-validator';

@ApiSchema({ name: 'GetListQuery' })
export class FetchQueryDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  readonly searchTxt?: string;

  @ApiPropertyOptional()
  @Min(0)
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  readonly skip?: number;

  @ApiPropertyOptional()
  @IsPositive()
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  readonly take?: number;
}
