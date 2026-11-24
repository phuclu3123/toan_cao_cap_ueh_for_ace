import { Body, Controller, Get, Param, Post, Req, Res, UseGuards } from '@nestjs/common';
import type { Request, Response } from 'express';
import { SessionGuard } from '../identity/session.guard.js';
import { ResourcesService, type CreateResourceInput, type ResourceActor } from './resources.service.js';

@Controller('api/resources')
export class ResourcesController {
  constructor(private readonly resources: ResourcesService) {}

  @Get()
  async list(@Res() response: Response) {
    const result = await this.resources.list();
    return response.status(result.statusCode).json(result.body);
  }

  @Post()
  @UseGuards(SessionGuard)
  async create(@Body() body: CreateResourceInput | undefined, @Req() request: Request & { authUser: ResourceActor }, @Res() response: Response) {
    const result = await this.resources.create(body, request.authUser);
    return response.status(result.statusCode).json(result.body);
  }

  @Post('view/:id')
  async incrementView(@Param('id') id: string, @Res() response: Response) {
    const result = await this.resources.incrementView(id);
    return response.status(result.statusCode).json(result.body);
  }
}
