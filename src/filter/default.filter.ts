import { Catch } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';

@Catch()
export class DefaultErrorFilter {
  async catch(err: Error, ctx: Context) {
    console.error('Global error caught:', err);
    console.error('Error stack:', err.stack);
    console.error('Request path:', ctx.path);
    console.error('Request method:', ctx.method);
    console.error('Request body:', ctx.request.body);
    console.error('Request headers:', ctx.headers);
    
    // 返回错误信息
    ctx.status = 500;
    return {
      success: false,
      message: err.message || '服务器内部错误',
      data: null,
      timestamp: new Date().toISOString(),
      path: ctx.path
    };
  }
}
