import { Middleware, IMiddleware } from '@midwayjs/core';
import { NextFunction, Context } from '@midwayjs/koa';

@Middleware()
export class ReportMiddleware implements IMiddleware<Context, NextFunction> {

  resolve() {
    return async (ctx: Context, next: NextFunction) => {
      const startTime = Date.now();
      const method = ctx.method;
      const url = ctx.url;
      
      console.log(`📥 [${method}] ${url} - 开始处理`);
      
      await next();
      
      const cost = Date.now() - startTime;
      console.log(`📤 [${method}] ${url} - 处理完成 (${cost}ms) status: ${ctx.status}`);
    };
  }

  static getName(): string {
    return 'ReportMiddleware';
  }
}
