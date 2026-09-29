import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import type { Request } from 'express';
import { UserTypeEnum } from '../enums/user-type.enum.js';
import { Role } from '../decorators/role.decorator.js';
import { UserType } from '../decorators/user-type.decorator.js';
import { IHttpListResponse } from '../interfaces/http-list-response.interface.js';
import { IHttpResponse } from '../interfaces/http-response.interface.js';
import { IRequest } from '../interfaces/request.interface.js';
import { AuthorizationService } from '../services/authorization.service.js';
import { RequestsService } from '../services/requests.service.js';
import { RequestActionCreateDto } from '../dtos/request-action-create.dto.js';
import { RequestFetchQueryDto } from '../dtos/request-fetch-query.dto.js';

@ApiBearerAuth()
@Controller('requests')
export class RequestsController {
  constructor(
    private readonly authorizationService: AuthorizationService,
    private readonly requestsService: RequestsService,
  ) {}

  @UserType(UserTypeEnum.STAFF)
  @Post()
  async create(@Req() { user }: Request): Promise<void> {
    const {
      sub,
      meta: { departmentId },
    } = user!;

    await this.requestsService.create(departmentId!, sub);
  }

  @Role(...AuthorizationService.GLOBAL_ROLES)
  @UserType(UserTypeEnum.STAFF, UserTypeEnum.DOCTOR)
  @Get()
  async fetch(
    @Query() query: RequestFetchQueryDto,
    @Req() { user }: Request,
  ): Promise<IHttpListResponse<IRequest>> {
    const {
      meta: { departmentId },
      roles,
    } = user!;
    const departmentIds = this.authorizationService.getAccessableDepartmentIds(
      roles,
      departmentId!,
      query.departmentIds,
    );

    const [requestList, total] = await this.requestsService.fetch(
      query.archived,
      query.completed,
      departmentIds,
      query.employeeIds,
      query.skip,
      query.take,
    );

    return { data: requestList, total };
  }

  // @Role(...AuthorizationService.GLOBAL_ROLES)
  // @UserType(UserTypeEnum.STAFF, UserTypeEnum.DOCTOR)
  // @Get(':requestId')
  // async getById(
  //   @Param('requestId', ParseIntPipe) requestId: number,
  //   @Req() { user }: Request,
  // ): Promise<IHttpResponse<IRequest>> {
  //   const { sub, roles } = user!;
  //   const request = await this.requestsService.fetchOneByOrFail({ requestId });

  //   await this.authorizationService.validateCollegeAccess(
  //     sub,
  //     roles,
  //     request.collegeId,
  //   );

  //   return { data: request };
  // }

  // @Role(...AuthorizationService.GLOBAL_ROLES)
  // @UserType(UserTypeEnum.STAFF, UserTypeEnum.DOCTOR)
  // @Get('/one-by-student/:studentId')
  // async getByStudentId(
  //   @Param('studentId', ParseIntPipe) studentId: number,
  //   @Req() { user }: Request,
  // ): Promise<IHttpResponse<IRequest>> {
  //   const { sub, roles } = user!;
  //   const request = await this.requestsService.fetchOneByOrFail({ studentId });

  //   await this.authorizationService.validateCollegeAccess(
  //     sub,
  //     roles,
  //     request.collegeId,
  //   );

  //   return { data: request };
  // }

  @UserType(UserTypeEnum.STAFF, UserTypeEnum.DOCTOR)
  @Post(':requestId/actions')
  async takeAction(
    @Req() { user }: Request,
    @Param('requestId', ParseIntPipe) requestId: number,
    @Body() body: RequestActionCreateDto,
  ): Promise<void> {
    const {
      sub,
      roles,
      meta: { departmentId },
    } = user!;
    const request = await this.requestsService.fetchOneByOrFail({ requestId });

    await this.authorizationService.canTakeAction(
      request,
      departmentId!,
      roles,
      body.type,
    );

    await this.requestsService.takeAction(sub, roles, request, body);
  }
}
