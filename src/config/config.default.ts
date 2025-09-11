import { MidwayConfig } from '@midwayjs/core';

export default {
  // use for cookie sign key, should change to your own and keep security
  keys: '1640995200_7110',
  
  // 服务器配置
  koa: {
    port: 7001,
    hostname: '0.0.0.0', // 允许外部访问
  },

  // 日志配置
  midwayLogger: {
    default: {
      level: 'info',
      consoleLevel: 'info',
      dir: './logs',
      maxFiles: '7d',
      maxSize: '10m'
    }
  },

  // Swagger配置 - 使用内置组件，真正基于注解生成
  swagger: {
    title: 'Gateway 测试 API',
    description: '完全基于@ApiOperation、@ApiQuery等注解自动生成的API文档',
    version: '1.0.0',
    contact: {
      name: 'Gateway Team',
      email: 'team@gateway.com'
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT'
    }
  },

  // 测试配置
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
