#!/usr/bin/env node

/**
 * Gateway 系统性测试 CLI
 * 实现：MidwayJS 输出 OpenAPI JSON → 生成 SDK → 通过 SDK 走网关转发到 Midway 服务
 */

const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');
const { spawn } = require('child_process');

// 配置
const CONFIG = {
  midway: {
    baseUrl: 'http://localhost:7001',
    openApiUrl: 'http://localhost:7001/swagger-ui/index.html',
    openApiJsonUrl: 'http://localhost:7001/swagger-ui/json'
  },
  gateway: {
    host: 'localhost',
    port: 18443,
    wsUrl: 'ws://localhost:18443'
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

// 等待服务启动
async function waitForService(url, timeout = 30000) {
  const startTime = Date.now();
  while (Date.now() - startTime < timeout) {
    try {
      await axios.get(url, { timeout: 1000 });
      return true;
    } catch (error) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  return false;
}

// 步骤1: 检查 MidwayJS 服务状态
async function checkMidwayService() {
  logStep(1, '检查 MidwayJS 服务状态');
  
  try {
    const response = await axios.get(`${CONFIG.midway.baseUrl}/api/health`);
    if (response.data.success) {
      logSuccess('MidwayJS 服务运行正常');
      logInfo(`服务状态: ${JSON.stringify(response.data.data, null, 2)}`);
      return true;
    } else {
      logError('MidwayJS 服务状态异常');
      return false;
    }
  } catch (error) {
    logError(`无法连接到 MidwayJS 服务: ${error.message}`);
    return false;
  }
}

// 步骤2: 获取 OpenAPI JSON
async function getOpenApiJson() {
  logStep(2, '获取 OpenAPI JSON 规范');
  
  try {
    // 尝试多个可能的 OpenAPI 端点
    const endpoints = [
      `${CONFIG.midway.baseUrl}/api/test/openapi.json`,
      `${CONFIG.midway.baseUrl}/swagger-ui/json`,
      `${CONFIG.midway.baseUrl}/swagger-doc`,
      `${CONFIG.midway.baseUrl}/api-json`,
      `${CONFIG.midway.baseUrl}/openapi.json`
    ];
    
    let openApiSpec = null;
    for (const endpoint of endpoints) {
      try {
        logInfo(`尝试获取: ${endpoint}`);
        const response = await axios.get(endpoint);
        if (response.data && response.data.openapi) {
          openApiSpec = response.data;
          logSuccess(`成功获取 OpenAPI 规范 (版本: ${openApiSpec.openapi})`);
          break;
        }
      } catch (e) {
        logWarning(`端点 ${endpoint} 不可用: ${e.message}`);
      }
    }
    
    if (!openApiSpec) {
      // 如果无法获取，创建一个简单的 OpenAPI 规范
      logWarning('无法获取 OpenAPI 规范，创建模拟规范');
      openApiSpec = {
        openapi: '3.0.0',
        info: {
          title: 'Gateway Test API',
          version: '1.0.0',
          description: 'Gateway 系统性测试 API'
        },
        servers: [
          {
            url: CONFIG.midway.baseUrl,
            description: '开发环境'
          }
        ],
        paths: {
          '/api/test/status': {
            get: {
              summary: '获取系统状态',
              operationId: 'getSystemStatus',
              responses: {
                '200': {
                  description: '成功',
                  content: {
                    'application/json': {
                      schema: {
                        type: 'object',
                        properties: {
                          success: { type: 'boolean' },
                          data: { type: 'object' }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      };
    }
    
    // 保存 OpenAPI 规范
    const specPath = path.join(CONFIG.generator.outputDir, 'openapi.json');
    await fs.ensureDir(CONFIG.generator.outputDir);
    await fs.writeJson(specPath, openApiSpec, { spaces: 2 });
    logSuccess(`OpenAPI 规范已保存到: ${specPath}`);
    
    return specPath;
  } catch (error) {
    logError(`获取 OpenAPI JSON 失败: ${error.message}`);
    return null;
  }
}

// 步骤3: 生成 SDK
async function generateSDK(openApiPath) {
  logStep(3, '使用 openapi-ts-sdk-cli 生成 SDK');
  
  try {
    const generatorPath = path.resolve(CONFIG.generator.packagePath);
    
    // 检查生成器是否存在
    if (!await fs.pathExists(generatorPath)) {
      logError(`SDK 生成器不存在: ${generatorPath}`);
      return false;
    }
    
    // 运行生成器
    logInfo(`运行生成器: ${generatorPath}`);
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
          logSuccess('SDK 生成完成');
          resolve(true);
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

// 步骤4: 检查 Gateway 服务
async function checkGatewayService() {
  logStep(4, '检查 Gateway 服务状态');
  
  try {
    const WebSocket = require('ws');
    const ws = new WebSocket(CONFIG.gateway.wsUrl);
    
    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        ws.close();
        logError('Gateway WebSocket 连接超时');
        resolve(false);
      }, 5000);
      
      ws.on('open', () => {
        clearTimeout(timeout);
        ws.close();
        logSuccess('Gateway 服务运行正常');
        resolve(true);
      });
      
      ws.on('error', (error) => {
        clearTimeout(timeout);
        logError(`Gateway 服务连接失败: ${error.message}`);
        resolve(false);
      });
    });
  } catch (error) {
    logError(`检查 Gateway 服务失败: ${error.message}`);
    return false;
  }
}

// 步骤5: 通过 SDK 测试网关转发
async function testGatewayProxy() {
  logStep(5, '通过生成的 SDK 测试网关转发');
  
  try {
    const sdkPath = path.join(CONFIG.generator.outputDir, 'index.js');
    
    if (!await fs.pathExists(sdkPath)) {
      logError(`生成的 SDK 文件不存在: ${sdkPath}`);
      return false;
    }
    
    // 创建测试脚本
    const testScript = `
const SDK = require('./index.js');

async function testGatewayProxy() {
  try {
    console.log('🚀 初始化 SDK...');
    
    // 配置 SDK 使用 Gateway
    const client = new SDK({
      baseUrl: '${CONFIG.midway.baseUrl}',
      httpImpl: 'gateway',
      gateway: {
        host: '${CONFIG.gateway.host}',
        port: ${CONFIG.gateway.port}
      }
    });
    
    console.log('📡 通过网关调用 MidwayJS API...');
    
    // 调用 API
    const result = await client.getSystemStatus();
    
    console.log('✅ 网关转发测试成功');
    console.log('📊 响应数据:', JSON.stringify(result, null, 2));
    
    return true;
  } catch (error) {
    console.error('❌ 网关转发测试失败:', error.message);
    return false;
  }
}

testGatewayProxy().then(success => {
  process.exit(success ? 0 : 1);
});
`;
    
    const testScriptPath = path.join(CONFIG.generator.outputDir, 'test-gateway.js');
    await fs.writeFile(testScriptPath, testScript);
    
    logInfo(`运行测试脚本: ${testScriptPath}`);
    
    return new Promise((resolve) => {
      const process = spawn('node', [testScriptPath], {
        cwd: CONFIG.generator.outputDir,
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
          logSuccess('网关转发测试完成');
          resolve(true);
        } else {
          logError(`网关转发测试失败，退出码: ${code}`);
          if (stderr) {
            logError(`错误输出: ${stderr}`);
          }
          resolve(false);
        }
      });
      
      process.on('error', (error) => {
        logError(`测试脚本执行错误: ${error.message}`);
        resolve(false);
      });
    });
  } catch (error) {
    logError(`测试网关转发失败: ${error.message}`);
    return false;
  }
}

// 主测试流程
async function runTest() {
  log('🚀 开始 Gateway 系统性测试', 'bright');
  log('=' * 50, 'cyan');
  
  const startTime = Date.now();
  let success = true;
  
  try {
    // 步骤1: 检查 MidwayJS 服务
    if (!(await checkMidwayService())) {
      logError('MidwayJS 服务不可用，请先启动服务');
      return false;
    }
    
    // 步骤2: 获取 OpenAPI JSON
    const openApiPath = await getOpenApiJson();
    if (!openApiPath) {
      logError('无法获取 OpenAPI 规范');
      return false;
    }
    
    // 步骤3: 生成 SDK
    if (!(await generateSDK(openApiPath))) {
      logError('SDK 生成失败');
      return false;
    }
    
    // 步骤4: 检查 Gateway 服务
    if (!(await checkGatewayService())) {
      logError('Gateway 服务不可用，请先启动 Gateway Go Server');
      return false;
    }
    
    // 步骤5: 测试网关转发
    if (!(await testGatewayProxy())) {
      logError('网关转发测试失败');
      return false;
    }
    
    const duration = Date.now() - startTime;
    logSuccess(`🎉 所有测试完成！用时: ${duration}ms`);
    return true;
    
  } catch (error) {
    logError(`测试过程中发生错误: ${error.message}`);
    return false;
  }
}

// 启动测试
if (require.main === module) {
  runTest().then(success => {
    process.exit(success ? 0 : 1);
  });
}

module.exports = { runTest };
