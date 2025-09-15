#!/usr/bin/env node

import { Bootstrap } from '@midwayjs/bootstrap';

// 启动应用
Bootstrap.run().then(() => {
  console.log('MidwayJS test service started successfully');
  console.log('Visit http://localhost:7001 to start system testing');
}).catch(err => {
  console.error('Application startup failed:', err);
  process.exit(1);
});
