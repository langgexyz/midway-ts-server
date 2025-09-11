#!/usr/bin/env node

import { Bootstrap } from '@midwayjs/bootstrap';

// 启动应用
Bootstrap.run().then(() => {
  console.log('🚀 MidwayJS 测试服务启动成功');
  console.log('📊 访问 http://localhost:7001 开始系统测试');
}).catch(err => {
  console.error('❌ 应用启动失败:', err);
  process.exit(1);
});
