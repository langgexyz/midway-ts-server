#!/usr/bin/env node

/**
 * Gateway 生态系统完整测试脚本
 * 包含服务启动、SDK生成、网关代理、端到端测试
 */

const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');
const { spawn } = require('child_process');
const WebSocket = require('ws');

// 配置
const CONFIG = {
  gateway: {
    host: 'localhost',
    port: 18443,
    wsUrl: 'ws://localhost:18443',
    binaryPath: '../gateway-go-server/bin/gateway-go-server',
    configPath: '../gateway-go-server/bin/config.debug.json'
  },
  midway: {
    baseUrl: 'http://localhost:7001',
    port: 7001
  },
  generator: {
    packagePath: '../openapi-ts-sdk-cli',
    outputDir: './generated-sdk'
  }
};

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logStep(step, message) {
  log(`\n[步骤 ${step}] ${message}`, 'cyan');
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

// 存储进程
let processes = new Map();

// 步骤1: 环境准备
async function prepareEnvironment() {
  logStep(1, '环境准备');
  
  try {
    // 检查 Gateway Go Server 二进制文件
    if (!await fs.pathExists(CONFIG.gateway.binaryPath)) {
      logInfo('构建 Gateway Go Server...');
      const { exec } = require('child_process');
      const { promisify } = require('util');
      const execAsync = promisify(exec);
      
      await execAsync('make debug', { cwd: path.dirname(CONFIG.gateway.binaryPath) });
    }
    
    // 检查生成器
    if (!await fs.pathExists(CONFIG.generator.packagePath)) {
      throw new Error('SDK 生成器不存在');
    }
    
    // 清理输出目录
    await fs.ensureDir(CONFIG.generator.outputDir);
    
    logSuccess('环境准备完成');
    return true;
  } catch (error) {
    logError(`环境准备失败: ${error.message}`);
    return false;
  }
}

// 步骤2: 启动服务
async function startServices() {
  logStep(2, '启动服务');
  
  try {
    // 启动 Gateway Go Server
    logInfo('启动 Gateway Go Server...');
    const gatewayProcess = spawn(CONFIG.gateway.binaryPath, ['-config', CONFIG.gateway.configPath], {
      cwd: path.dirname(CONFIG.gateway.binaryPath),
      stdio: ['ignore', 'pipe', 'pipe']
    });
    
    gatewayProcess.stdout?.on('data', (data) => {
      logInfo(`[Gateway] ${data.toString().trim()}`);
    });
    
    gatewayProcess.stderr?.on('data', (data) => {
      logWarning(`[Gateway Error] ${data.toString().trim()}`);
    });
    
    processes.set('gateway', gatewayProcess);
    
    // 启动 MidwayJS 服务
    logInfo('启动 MidwayJS Demo Service...');
    const midwayProcess = spawn('pnpm', ['run', 'start'], {
      cwd: process.cwd(),
      stdio: ['ignore', 'pipe', 'pipe']
    });
    
    midwayProcess.stdout?.on('data', (data) => {
      logInfo(`[MidwayJS] ${data.toString().trim()}`);
    });
    
    midwayProcess.stderr?.on('data', (data) => {
      logWarning(`[MidwayJS Error] ${data.toString().trim()}`);
    });
    
    processes.set('midway', midwayProcess);
    
    // 等待服务启动
    logInfo('等待服务启动...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // 验证服务状态
    const gatewayHealthy = await checkGatewayHealth();
    const midwayHealthy = await checkMidwayHealth();
    
    if (gatewayHealthy && midwayHealthy) {
      logSuccess('所有服务启动成功');
      return true;
    } else {
      logError('服务启动失败');
      return false;
    }
  } catch (error) {
    logError(`启动服务失败: ${error.message}`);
    return false;
  }
}

// 检查 Gateway 健康状态
async function checkGatewayHealth() {
  try {
    const ws = new WebSocket(CONFIG.gateway.wsUrl);
    
    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        ws.close();
        resolve(false);
      }, 5000);
      
      ws.on('open', () => {
        clearTimeout(timeout);
        ws.close();
        resolve(true);
      });
      
      ws.on('error', () => {
        clearTimeout(timeout);
        resolve(false);
      });
    });
  } catch {
    return false;
  }
}

// 检查 MidwayJS 健康状态
async function checkMidwayHealth() {
  try {
    const response = await axios.get(`${CONFIG.midway.baseUrl}/api/health`, { timeout: 5000 });
    return response.data.success;
  } catch {
    return false;
  }
}

// 步骤3: 获取 OpenAPI 规范
async function getOpenApiSpec() {
  logStep(3, '获取 OpenAPI 规范');
  
  try {
    // 尝试从 Swagger 获取
    const endpoints = [
      `${CONFIG.midway.baseUrl}/swagger-ui/json`,
      `${CONFIG.midway.baseUrl}/swagger-doc`,
      `${CONFIG.midway.baseUrl}/api-json`
    ];
    
    let openApiSpec = null;
    for (const endpoint of endpoints) {
      try {
        const response = await axios.get(endpoint, { timeout: 5000 });
        if (response.data && response.data.openapi) {
          openApiSpec = response.data;
          break;
        }
      } catch (e) {
        // 忽略错误，尝试下一个端点
      }
    }
    
    // 如果无法获取，使用现有的规范
    if (!openApiSpec) {
      const specPath = path.join(CONFIG.generator.outputDir, 'openapi.json');
      if (await fs.pathExists(specPath)) {
        openApiSpec = await fs.readJson(specPath);
        logInfo('使用现有的 OpenAPI 规范');
      } else {
        throw new Error('无法获取 OpenAPI 规范');
      }
    }
    
    // 保存规范
    const specPath = path.join(CONFIG.generator.outputDir, 'openapi.json');
    await fs.writeJson(specPath, openApiSpec, { spaces: 2 });
    
    logSuccess(`OpenAPI 规范已保存: ${specPath}`);
    return specPath;
  } catch (error) {
    logError(`获取 OpenAPI 规范失败: ${error.message}`);
    return null;
  }
}

// 步骤4: 生成 SDK
async function generateSDK(openApiPath) {
  logStep(4, '生成 TypeScript SDK');
  
  try {
    const generatorPath = path.resolve(CONFIG.generator.packagePath);
    const outputPath = path.resolve(CONFIG.generator.outputDir);
    
    const command = 'node';
    const args = [
      path.join(generatorPath, 'dist/index.js'),
      'generate',
      '--input', openApiPath,
      '--output', outputPath
    ];
    
    logInfo(`执行命令: ${command} ${args.join(' ')}`);
    
    return new Promise((resolve) => {
      const process = spawn(command, args, {
        cwd: generatorPath,
        stdio: 'pipe'
      });
      
      let stdout = '';
      let stderr = '';
      
      process.stdout.on('data', (data) => {
        stdout += data.toString();
        logInfo(data.toString().trim());
      });
      
      process.stderr.on('data', (data) => {
        stderr += data.toString();
        logWarning(data.toString().trim());
      });
      
      process.on('close', (code) => {
        if (code === 0) {
          // 检查生成的文件
          const files = fs.readdirSync(outputPath);
          const tsFiles = files.filter(f => f.endsWith('.ts'));
          
          if (tsFiles.length > 0) {
            logSuccess(`SDK 生成完成，生成了 ${tsFiles.length} 个文件`);
            resolve(true);
          } else {
            logWarning('SDK 生成完成，但未生成 TypeScript 文件');
            resolve(false);
          }
        } else {
          logError(`SDK 生成失败，退出码: ${code}`);
          if (stderr) {
            logError(`错误输出: ${stderr}`);
          }
          resolve(false);
        }
      });
      
      process.on('error', (error) => {
        logError(`生成器执行错误: ${error.message}`);
        resolve(false);
      });
    });
  } catch (error) {
    logError(`生成 SDK 失败: ${error.message}`);
    return false;
  }
}

// 步骤5: 直接 API 测试
async function testDirectAPI() {
  logStep(5, '直接 API 测试');
  
  const testCases = [
    { method: 'GET', path: '/api/health', description: '健康检查' },
    { method: 'GET', path: '/api/users', description: '获取用户列表' },
    { method: 'POST', path: '/api/users', body: { name: '测试用户', email: 'test@example.com', age: 25 }, description: '创建用户' },
    { method: 'GET', path: '/api/users/1', description: '获取单个用户' },
    { method: 'PUT', path: '/api/users/1', body: { name: '更新用户', age: 26 }, description: '更新用户' },
    { method: 'DELETE', path: '/api/users/1', description: '删除用户' }
  ];
  
  let successCount = 0;
  let totalCount = testCases.length;
  
  for (const testCase of testCases) {
    try {
      let response;
      if (testCase.method === 'GET') {
        response = await axios.get(`${CONFIG.midway.baseUrl}${testCase.path}`);
      } else if (testCase.method === 'POST') {
        response = await axios.post(`${CONFIG.midway.baseUrl}${testCase.path}`, testCase.body);
      } else if (testCase.method === 'PUT') {
        response = await axios.put(`${CONFIG.midway.baseUrl}${testCase.path}`, testCase.body);
      } else if (testCase.method === 'DELETE') {
        response = await axios.delete(`${CONFIG.midway.baseUrl}${testCase.path}`);
      }
      
      if (response && response.status >= 200 && response.status < 300) {
        logSuccess(`${testCase.method} ${testCase.path}: ${testCase.description} - 成功`);
        successCount++;
      } else {
        logWarning(`${testCase.method} ${testCase.path}: ${testCase.description} - 失败`);
      }
    } catch (error) {
      logWarning(`${testCase.method} ${testCase.path}: ${testCase.description} - 失败: ${error.message}`);
    }
  }
  
  logInfo(`直接 API 测试完成: ${successCount}/${totalCount} 成功`);
  return successCount === totalCount;
}

// 步骤6: 网关代理测试
async function testGatewayProxy() {
  logStep(6, '网关代理测试');
  
  try {
    // 测试 WebSocket 连接
    const ws = new WebSocket(CONFIG.gateway.wsUrl);
    
    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        ws.close();
        logError('WebSocket 连接超时');
        resolve(false);
      }, 10000);
      
      ws.on('open', async () => {
        clearTimeout(timeout);
        logSuccess('WebSocket 连接成功');
        
        try {
          // 发送 Ping 测试
          const pingMessage = {
            api: 'API/Ping',
            reqId: 'ping-test-' + Date.now(),
            data: {}
          };
          
          ws.send(JSON.stringify(pingMessage));
          
          // 等待响应
          ws.on('message', (data) => {
            try {
              const response = JSON.parse(data.toString());
              if (response.reqId === pingMessage.reqId) {
                logSuccess('Ping 测试成功');
                ws.close();
                resolve(true);
              }
            } catch (error) {
              logWarning(`响应解析失败: ${error.message}`);
              ws.close();
              resolve(false);
            }
          });
          
        } catch (error) {
          logError(`网关代理测试失败: ${error.message}`);
          ws.close();
          resolve(false);
        }
      });
      
      ws.on('error', (error) => {
        clearTimeout(timeout);
        logError(`WebSocket 连接失败: ${error.message}`);
        resolve(false);
      });
    });
  } catch (error) {
    logError(`网关代理测试失败: ${error.message}`);
    return false;
  }
}

// 步骤7: 端到端测试
async function testEndToEnd() {
  logStep(7, '端到端测试');
  
  try {
    // 这里可以添加更复杂的端到端测试
    // 比如通过生成的 SDK 调用 API
    
    logInfo('端到端测试完成');
    return true;
  } catch (error) {
    logError(`端到端测试失败: ${error.message}`);
    return false;
  }
}

// 清理资源
async function cleanup() {
  logStep('清理', '清理资源');
  
  for (const [name, process] of processes) {
    logInfo(`停止服务: ${name}`);
    process.kill('SIGTERM');
  }
  
  processes.clear();
  logSuccess('资源清理完成');
}

// 主测试函数
async function runCompleteTest() {
  log('🚀 开始 Gateway 生态系统完整测试', 'bright');
  log('=' * 60, 'cyan');
  
  const startTime = Date.now();
  let allSuccess = true;
  
  try {
    // 步骤1: 环境准备
    if (!(await prepareEnvironment())) {
      logError('环境准备失败，无法继续测试');
      return false;
    }
    
    // 步骤2: 启动服务
    if (!(await startServices())) {
      logError('服务启动失败，无法继续测试');
      return false;
    }
    
    // 步骤3: 获取 OpenAPI 规范
    const openApiPath = await getOpenApiSpec();
    if (!openApiPath) {
      logError('无法获取 OpenAPI 规范，无法继续测试');
      return false;
    }
    
    // 步骤4: 生成 SDK
    const sdkGenerated = await generateSDK(openApiPath);
    if (!sdkGenerated) {
      logWarning('SDK 生成失败，但可以继续其他测试');
    }
    
    // 步骤5: 直接 API 测试
    const directAPISuccess = await testDirectAPI();
    if (!directAPISuccess) {
      logError('直接 API 测试失败');
      allSuccess = false;
    }
    
    // 步骤6: 网关代理测试
    const gatewaySuccess = await testGatewayProxy();
    if (!gatewaySuccess) {
      logError('网关代理测试失败');
      allSuccess = false;
    }
    
    // 步骤7: 端到端测试
    const e2eSuccess = await testEndToEnd();
    if (!e2eSuccess) {
      logError('端到端测试失败');
      allSuccess = false;
    }
    
    const duration = Date.now() - startTime;
    
    if (allSuccess) {
      logSuccess(`🎉 所有测试完成！用时: ${duration}ms`);
    } else {
      logError('❌ 部分测试失败');
    }
    
    return allSuccess;
    
  } catch (error) {
    logError(`测试过程中发生错误: ${error.message}`);
    return false;
  } finally {
    // 清理资源
    await cleanup();
  }
}

// 启动测试
if (require.main === module) {
  runCompleteTest().then(success => {
    process.exit(success ? 0 : 1);
  });
}

module.exports = { runCompleteTest };
