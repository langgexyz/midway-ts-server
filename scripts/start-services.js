#!/usr/bin/env node

/**
 * 启动测试所需的外部服务脚本
 */

const { spawn, exec } = require('child_process');
const { promisify } = require('util');
const path = require('path');
const fs = require('fs');

const execAsync = promisify(exec);

async function startServices() {
  console.log('Starting test services...');
  
  try {
    // 启动 Gateway Go Server
    await startGoServer();
    
    console.log('All services started successfully');
  } catch (error) {
    console.error('Failed to start services:', error);
    process.exit(1);
  }
}

async function startGoServer() {
  const goServerPath = path.resolve('../gateway-go-server');
  const binaryPath = path.join(goServerPath, 'bin', 'gateway-go-server');
  const configPath = path.join(goServerPath, 'bin', 'config.debug.json');
  
  console.log('🔧 检查 Gateway Go Server...');
  
  // 检查二进制文件是否存在
  if (!fs.existsSync(binaryPath)) {
    console.log('Building Gateway Go Server...');
    const { stdout, stderr } = await execAsync('make build', { cwd: goServerPath });
    if (stderr) {
      console.warn('构建警告:', stderr);
    }
    console.log('Gateway Go Server build completed');
  }
  
  // 检查配置文件是否存在
  if (!fs.existsSync(configPath)) {
    console.log('Creating configuration file...');
    const defaultConfigPath = path.join(goServerPath, 'bin', 'config.json.default');
    if (fs.existsSync(defaultConfigPath)) {
      fs.copyFileSync(defaultConfigPath, configPath);
    } else {
      // 创建一个基本的配置文件
      const basicConfig = {
        server: {
          host: "0.0.0.0",
          port: 18443,
          readTimeout: 30,
          writeTimeout: 30
        },
        websocket: {
          maxConnections: 10000,
          bufferSize: 1024,
          enableCompression: true
        },
        log: {
          level: "debug",
          output: "stdout"
        }
      };
      fs.writeFileSync(configPath, JSON.stringify(basicConfig, null, 2));
    }
    console.log('Configuration file created successfully');
  }
  
  // 启动服务
  console.log('Starting Gateway Go Server...');
  const goProcess = spawn(binaryPath, ['-config', configPath], {
    cwd: path.dirname(binaryPath),
    detached: true,
    stdio: ['ignore', 'pipe', 'pipe']
  });
  
  goProcess.stdout.on('data', (data) => {
    console.log(`[Go Server] ${data}`);
  });
  
  goProcess.stderr.on('data', (data) => {
    console.error(`[Go Server Error] ${data}`);
  });
  
  goProcess.on('error', (error) => {
    console.error('Go Server 启动失败:', error);
  });
  
  // 保存进程 PID
  const pidFile = path.join(__dirname, '../.go-server.pid');
  fs.writeFileSync(pidFile, goProcess.pid.toString());
  
  // 等待服务启动
  await waitForGoServer();
  
  console.log('Gateway Go Server started successfully');
}

async function waitForGoServer() {
  const maxRetries = 10;
  const retryInterval = 1000;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      const WebSocket = require('ws');
      const ws = new WebSocket('ws://localhost:18443');
      
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          ws.close();
          reject(new Error('连接超时'));
        }, 3000);
        
        ws.on('open', () => {
          clearTimeout(timeout);
          ws.close();
          resolve();
        });
        
        ws.on('error', (error) => {
          clearTimeout(timeout);
          reject(error);
        });
      });
      
      return; // 连接成功
    } catch (error) {
      if (i === maxRetries - 1) {
        throw new Error('Gateway Go Server 启动超时');
      }
      console.log(`⏳ 等待 Gateway Go Server 启动... (${i + 1}/${maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, retryInterval));
    }
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  startServices().catch(error => {
    console.error('启动服务失败:', error);
    process.exit(1);
  });
}

module.exports = {
  startServices,
  startGoServer
};
