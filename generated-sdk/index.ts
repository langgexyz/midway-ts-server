// API 客户端主入口文件

export * from './types';

export { CommonApi } from './common.api';

// 统一客户端类（向后兼容）
import { HttpBuilder } from 'ts-sdk-client';
import { CommonApi } from './common.api';

export class UnifiedApiClient {
  private httpBuilder: HttpBuilder;
  public readonly common: CommonApi;

  constructor(httpBuilder: HttpBuilder) {
    this.httpBuilder = httpBuilder;
    this.common = new CommonApi(httpBuilder);
  }
}
