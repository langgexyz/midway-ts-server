import { MidwayConfig } from '@midwayjs/core';

export default {
  // 本地开发配置
  testConfig: {
    // 启用详细日志
    enableVerboseLog: true,
    // 自动启动依赖服务
    autoStartServices: true,
    // 测试超时时间（毫秒）
    testTimeout: 30000,
    // 并发测试数量
    concurrentTests: 3
  }
} as MidwayConfig;
