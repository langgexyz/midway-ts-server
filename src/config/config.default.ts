import { MidwayConfig } from '@midwayjs/core';

export default {
  // use for cookie sign key, should change to your own and keep security
  keys: '1640995200_7110',
  koa: {
    port: 7001,
  },
  swagger: {
    title: 'Gateway 测试 API',
    description: '用于测试 SDK 生成和网关转发的 RESTful API',
    version: '1.0.0',
    contact: {
      name: 'Gateway Team',
      email: 'team@gateway.com'
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT'
    },
    servers: [
      {
        url: 'http://localhost:7001',
        description: '开发环境'
      }
    ],
    tags: [
      {
        name: 'API',
        description: 'RESTful API 测试接口'
      }
    ],
    // 启用 Swagger
    enable: true,
    // 指定 JSON 端点路径
    swaggerJsonPath: '/swagger-ui/json'
  }
} as MidwayConfig;
