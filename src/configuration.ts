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
    
    console.log('🔧 MidwayJS 容器初始化完成');
    console.log('🧪 系统性测试服务已就绪');
    console.log('📚 Swagger 文档地址 (注解自动生成):');
    console.log('   📄 JSON 规范: http://localhost:7001/swagger-ui/index.json');
    console.log('   🌐 UI 界面: http://localhost:7001/swagger-ui/index.html');
  }
}
