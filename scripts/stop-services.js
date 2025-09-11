#!/usr/bin/env node

/**
 * 停止测试服务脚本
 */

const fs = require('fs');
const path = require('path');

async function stopServices() {
  console.log('🛑 停止测试服务...');
  
  try {
    // 停止 Gateway Go Server
    await stopGoServer();
    
    console.log('✅ 所有服务已停止');
  } catch (error) {
    console.error('❌ 停止服务失败:', error);
    process.exit(1);
  }
}

async function stopGoServer() {
  const pidFile = path.join(__dirname, '../.go-server.pid');
  
  if (fs.existsSync(pidFile)) {
    try {
      const pid = parseInt(fs.readFileSync(pidFile, 'utf8').trim());
      console.log(`🔧 停止 Gateway Go Server (PID: ${pid})...`);
      
      process.kill(pid, 'SIGTERM');
      
      // 等待进程停止
      await new Promise((resolve, reject) => {
        let retries = 10;
        const checkInterval = setInterval(() => {
          try {
            // 检查进程是否还存在
            process.kill(pid, 0);
            retries--;
            if (retries <= 0) {
              // 强制杀死进程
              console.log('⚠️ 强制停止进程...');
              process.kill(pid, 'SIGKILL');
              clearInterval(checkInterval);
              resolve();
            }
          } catch (error) {
            // 进程已停止
            clearInterval(checkInterval);
            resolve();
          }
        }, 1000);
      });
      
      // 删除 PID 文件
      fs.unlinkSync(pidFile);
      console.log('✅ Gateway Go Server 已停止');
    } catch (error) {
      if (error.code === 'ESRCH') {
        // 进程不存在，清理 PID 文件
        fs.unlinkSync(pidFile);
        console.log('✅ Gateway Go Server 进程不存在，已清理');
      } else {
        throw error;
      }
    }
  } else {
    console.log('ℹ️ Gateway Go Server 未在运行');
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  stopServices().catch(error => {
    console.error('停止服务失败:', error);
    process.exit(1);
  });
}

module.exports = {
  stopServices,
  stopGoServer
};
