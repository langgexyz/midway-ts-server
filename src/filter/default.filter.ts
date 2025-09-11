import { Catch } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';

@Catch()
export class DefaultErrorFilter {
  async catch(err: Error, ctx: Context) {
    console.error('❌ 全局错误捕获:', err);
    
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
