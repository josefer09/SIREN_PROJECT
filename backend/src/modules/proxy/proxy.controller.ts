import { Controller, Get, Query, Res } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';

import { Auth } from '@auth/decorators';
import { ProxyService } from './proxy.service';

@ApiTags('Proxy')
@Controller('proxy')
export class ProxyController {
  constructor(private readonly proxyService: ProxyService) {}

  @Get('site')
  @Auth()
  @ApiOperation({ summary: 'Proxy a target site for the element inspector' })
  @ApiQuery({ name: 'target', description: 'Base URL of the target site' })
  @ApiQuery({ name: 'path', required: false, description: 'Path on the target site' })
  @ApiQuery({ name: 'token', required: false, description: 'JWT token for iframe auth' })
  async proxySite(
    @Query('target') target: string,
    @Query('path') path: string,
    @Query('token') token: string,
    @Res() res: Response,
  ) {
    return this.proxyService.proxySite(target, path || '/', res, token);
  }

  @Get('resource')
  @Auth()
  @ApiOperation({ summary: 'Proxy a resource (CSS, JS, images) from target site' })
  @ApiQuery({ name: 'url', description: 'Full URL of the resource' })
  @ApiQuery({ name: 'token', required: false, description: 'JWT token for iframe auth' })
  async proxyResource(
    @Query('url') url: string,
    @Query('token') token: string,
    @Res() res: Response,
  ) {
    return this.proxyService.proxyResource(url, res, token);
  }
}
