import { Configuration, App } from '@midwayjs/core';
import * as koa from '@midwayjs/koa';
import * as validate from '@midwayjs/validate';
import * as info from '@midwayjs/info';
import * as swagger from '@midwayjs/swagger';
import { join } from 'path';
import { DefaultErrorFilter } from './filter/default.filter';
import { ReportMiddleware } from './middleware/report.middleware';

@Configuration({
  imports: [
    koa,
    validate,
    info,
    swagger
  ],
  importConfigs: [join(__dirname, './config')]
})
export class ContainerLifeCycle {
  @App()
  app!: koa.Application;

  async onReady() {
    // add middleware
    this.app.useMiddleware([ReportMiddleware]);
    
    // add filter
    this.app.useFilter([DefaultErrorFilter]);
    
    console.log('MidwayJS container initialization completed');
    console.log('System testing service is ready');
    console.log('Swagger documentation address (auto-generated from annotations):');
    console.log('   JSON Specification: http://localhost:7001/swagger-ui/index.json');
    console.log('   UI Interface: http://localhost:7001/swagger-ui/index.html');
  }
}
