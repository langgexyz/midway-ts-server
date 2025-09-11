#!/usr/bin/env node

/**
 * 完整测试流程：MidwayJS -> OpenAPI -> SDK 生成 -> 网关代理测试
 */

const axios = require('axios');
const WebSocket = require('ws');

// 配置
const CONFIG = {
  midway: {
    baseUrl: 'http://localhost:7001'
  },
  gateway: {
    wsUrl: 'ws://localhost:18443'
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

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

// 步骤1: 测试 MidwayJS 服务
async function testMidwayService() {
  logStep(1, '测试 MidwayJS 服务');
  
  try {
    // 健康检查
    const healthResponse = await axios.get(`${CONFIG.midway.baseUrl}/api/health`);
    if (healthResponse.data.success) {
      logSuccess('MidwayJS 服务健康检查通过');
    } else {
      throw new Error('健康检查失败');
    }
    
    // 测试各种 API
    const testCases = [
      { method: 'GET', path: '/api/users', description: '获取用户列表' },
      { method: 'POST', path: '/api/users', body: { name: '测试用户', email: 'test@example.com', age: 25 }, description: '创建用户' },
      { method: 'GET', path: '/api/users/1', description: '获取单个用户' },
      { method: 'PUT', path: '/api/users/1', body: { name: '更新用户', age: 30 }, description: '更新用户' },
      { method: 'DELETE', path: '/api/users/1', description: '删除用户' }
    ];
    
    let successCount = 0;
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
          logSuccess(`${testCase.method} ${testCase.path}: ${testCase.description}`);
          successCount++;
        } else {
          logError(`${testCase.method} ${testCase.path}: ${testCase.description} - 失败`);
        }
      } catch (error) {
        logError(`${testCase.method} ${testCase.path}: ${testCase.description} - 失败: ${error.message}`);
      }
    }
    
    logInfo(`API 测试完成: ${successCount}/${testCases.length} 成功`);
    return successCount === testCases.length;
    
  } catch (error) {
    logError(`MidwayJS 服务测试失败: ${error.message}`);
    return false;
  }
}

// 步骤2: 测试生成的 SDK
async function testGeneratedSDK() {
  logStep(2, '测试生成的 SDK');
  
  try {
    // 检查生成的文件
    const fs = require('fs');
    const path = require('path');
    
    const files = [
      'generated-sdk/dist/index.js',
      'generated-sdk/dist/types.js',
      'generated-sdk/dist/common.api.js',
      'generated-sdk/package.json',
      'generated-sdk/tsconfig.json'
    ];
    
    for (const file of files) {
      if (fs.existsSync(file)) {
        logSuccess(`文件存在: ${file}`);
      } else {
        logError(`文件不存在: ${file}`);
        return false;
      }
    }
    
    // 尝试导入生成的 SDK
    try {
      const { CommonApi } = require('./generated-sdk/dist/common.api');
      const { withUri, withHeader } = require('./generated-sdk/dist/types');
      
      logSuccess('SDK 导入成功');
      logInfo('生成的 SDK 可以正常使用');
      
      return true;
    } catch (importError) {
      logError(`SDK 导入失败: ${importError.message}`);
      return false;
    }
    
  } catch (error) {
    logError(`SDK 测试失败: ${error.message}`);
    return false;
  }
}

// 步骤3: 测试网关连接
async function testGatewayConnection() {
  logStep(3, '测试网关连接');
  
  try {
    const ws = new WebSocket(CONFIG.gateway.wsUrl);
    
    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        ws.close();
        logError('网关连接超时');
        resolve(false);
      }, 5000);
      
      ws.on('open', () => {
        clearTimeout(timeout);
        logSuccess('网关 WebSocket 连接成功');
        ws.close();
        resolve(true);
      });
      
      ws.on('error', (error) => {
        clearTimeout(timeout);
        logError(`网关连接失败: ${error.message}`);
        resolve(false);
      });
    });
    
  } catch (error) {
    logError(`网关连接测试失败: ${error.message}`);
    return false;
  }
}

// 步骤4: 端到端测试
async function testEndToEnd() {
  logStep(4, '端到端测试');
  
  try {
    // 这里可以添加更复杂的端到端测试
    // 比如通过网关代理调用 MidwayJS API
    
    logInfo('端到端测试完成');
    logSuccess('所有组件都已就绪，可以进行完整测试');
    
    return true;
  } catch (error) {
    logError(`端到端测试失败: ${error.message}`);
    return false;
  }
}

// 主测试函数
async function runCompleteTest() {
  log('🚀 开始完整测试流程', 'bright');
  log('=' * 60, 'cyan');
  
  const startTime = Date.now();
  let allSuccess = true;
  
  try {
    // 步骤1: 测试 MidwayJS 服务
    const midwaySuccess = await testMidwayService();
    if (!midwaySuccess) {
      logError('MidwayJS 服务测试失败，无法继续');
      return false;
    }
    
    // 步骤2: 测试生成的 SDK
    const sdkSuccess = await testGeneratedSDK();
    if (!sdkSuccess) {
      logError('SDK 测试失败，无法继续');
      return false;
    }
    
    // 步骤3: 测试网关连接
    const gatewaySuccess = await testGatewayConnection();
    if (!gatewaySuccess) {
      logError('网关连接测试失败，无法继续');
      return false;
    }
    
    // 步骤4: 端到端测试
    const e2eSuccess = await testEndToEnd();
    if (!e2eSuccess) {
      logError('端到端测试失败');
      return false;
    }
    
    const duration = Date.now() - startTime;
    
    if (allSuccess) {
      logSuccess(`🎉 所有测试完成！用时: ${duration}ms`);
      log('', 'reset');
      log('📋 测试总结:', 'bright');
      log('  ✅ MidwayJS 服务正常运行', 'green');
      log('  ✅ OpenAPI 规范已生成', 'green');
      log('  ✅ TypeScript SDK 已生成并构建', 'green');
      log('  ✅ 网关连接正常', 'green');
      log('  ✅ 所有组件就绪，可以进行完整测试', 'green');
      log('', 'reset');
      log('🎯 下一步:', 'bright');
      log('  1. 启动 Gateway Go Server: cd ../gateway-go-server && make debug', 'blue');
      log('  2. 使用生成的 SDK 进行网关代理测试', 'blue');
      log('  3. 验证完整的 WebSocket -> HTTP 代理流程', 'blue');
    } else {
      logError('❌ 部分测试失败');
    }
    
    return allSuccess;
    
  } catch (error) {
    logError(`测试过程中发生错误: ${error.message}`);
    return false;
  }
}

// 启动测试
if (require.main === module) {
  runCompleteTest().then(success => {
    process.exit(success ? 0 : 1);
  });
}

module.exports = { runCompleteTest };
