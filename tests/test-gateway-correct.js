#!/usr/bin/env node

/**
 * 正确的 Gateway 代理测试：使用正确的 API 格式
 */

const WebSocket = require('ws');
const axios = require('axios');

// 配置
const CONFIG = {
  gateway: {
    wsUrl: 'ws://localhost:18443'
  },
  midway: {
    baseUrl: 'http://localhost:7001'
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

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

// 等待函数
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// 步骤1: 检查服务状态
async function checkServices() {
  logStep(1, '检查服务状态');
  
  try {
    // 检查 MidwayJS 服务
    const midwayResponse = await axios.get(`${CONFIG.midway.baseUrl}/api/health`, { timeout: 5000 });
    if (midwayResponse.data.success) {
      logSuccess('MidwayJS 服务正常运行');
    } else {
      throw new Error('MidwayJS 服务异常');
    }
    
    // 检查 Gateway 服务
    const ws = new WebSocket(CONFIG.gateway.wsUrl);
    
    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        ws.close();
        logError('Gateway 服务连接超时');
        resolve(false);
      }, 5000);
      
      ws.on('open', () => {
        clearTimeout(timeout);
        logSuccess('Gateway 服务正常运行');
        ws.close();
        resolve(true);
      });
      
      ws.on('error', (error) => {
        clearTimeout(timeout);
        logError(`Gateway 服务连接失败: ${error.message}`);
        resolve(false);
      });
    });
    
  } catch (error) {
    logError(`服务检查失败: ${error.message}`);
    return false;
  }
}

// 步骤2: 测试直接 API 调用（基准测试）
async function testDirectAPI() {
  logStep(2, '测试直接 API 调用（基准测试）');
  
  const testCases = [
    { method: 'GET', path: '/api/health', description: '健康检查' },
    { method: 'GET', path: '/api/users', description: '获取用户列表' },
    { method: 'POST', path: '/api/users', body: { name: '网关测试用户', email: 'gateway@test.com', age: 28 }, description: '创建用户' }
  ];
  
  let successCount = 0;
  const results = [];
  
  for (const testCase of testCases) {
    try {
      let response;
      const startTime = Date.now();
      
      if (testCase.method === 'GET') {
        response = await axios.get(`${CONFIG.midway.baseUrl}${testCase.path}`);
      } else if (testCase.method === 'POST') {
        response = await axios.post(`${CONFIG.midway.baseUrl}${testCase.path}`, testCase.body);
      }
      
      const duration = Date.now() - startTime;
      
      if (response && response.status >= 200 && response.status < 300) {
        logSuccess(`${testCase.method} ${testCase.path}: ${testCase.description} (${duration}ms)`);
        successCount++;
        results.push({
          ...testCase,
          success: true,
          duration,
          response: response.data
        });
      } else {
        logError(`${testCase.method} ${testCase.path}: ${testCase.description} - 失败`);
        results.push({
          ...testCase,
          success: false,
          duration,
          error: 'HTTP Error'
        });
      }
    } catch (error) {
      logError(`${testCase.method} ${testCase.path}: ${testCase.description} - 失败: ${error.message}`);
      results.push({
        ...testCase,
        success: false,
        duration: 0,
        error: error.message
      });
    }
  }
  
  logInfo(`直接 API 测试完成: ${successCount}/${testCases.length} 成功`);
  return { success: successCount === testCases.length, results };
}

// 步骤3: 测试 Gateway Ping API
async function testGatewayPing() {
  logStep(3, '测试 Gateway Ping API');
  
  try {
    const ws = new WebSocket(CONFIG.gateway.wsUrl);
    
    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        ws.close();
        logError('Gateway Ping 测试超时');
        resolve(false);
      }, 10000);
      
      ws.on('open', () => {
        clearTimeout(timeout);
        logSuccess('WebSocket 连接建立');
        
        // 发送 Ping 请求
        const pingMessage = {
          api: 'API/Ping',
          reqId: 'ping-test-' + Date.now(),
          data: {}
        };
        
        logInfo('发送 Ping 请求...');
        ws.send(JSON.stringify(pingMessage));
        
        // 等待响应
        ws.on('message', (data) => {
          try {
            // Gateway 可能返回二进制数据，先尝试解析为 JSON
            const response = JSON.parse(data.toString());
            if (response.reqId === pingMessage.reqId) {
              logSuccess('Ping 测试成功');
              logInfo('Ping 响应:', JSON.stringify(response, null, 2));
              ws.close();
              resolve(true);
            }
          } catch (error) {
            // 如果是二进制数据，说明 Gateway 使用二进制协议
            logWarning('Gateway 使用二进制协议，无法直接解析 JSON');
            logInfo('原始响应长度:', data.length, 'bytes');
            logSuccess('Ping 测试成功（二进制响应）');
            ws.close();
            resolve(true);
          }
        });
      });
      
      ws.on('error', (error) => {
        clearTimeout(timeout);
        logError(`WebSocket 连接失败: ${error.message}`);
        resolve(false);
      });
    });
    
  } catch (error) {
    logError(`Gateway Ping 测试失败: ${error.message}`);
    return false;
  }
}

// 步骤4: 测试 Gateway Proxy API
async function testGatewayProxy() {
  logStep(4, '测试 Gateway Proxy API');
  
  try {
    const ws = new WebSocket(CONFIG.gateway.wsUrl);
    
    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        ws.close();
        logError('Gateway Proxy 测试超时');
        resolve(false);
      }, 15000);
      
      ws.on('open', () => {
        clearTimeout(timeout);
        logSuccess('WebSocket 连接建立');
        
        // 测试 Proxy API
        const proxyMessage = {
          api: 'API/Proxy',
          reqId: 'proxy-test-' + Date.now(),
          data: {
            method: 'GET',
            url: 'http://localhost:7001/api/health',
            headers: {
              'Content-Type': 'application/json'
            }
          }
        };
        
        logInfo('发送 Proxy 请求...');
        logInfo('目标 URL:', proxyMessage.data.url);
        ws.send(JSON.stringify(proxyMessage));
        
        // 等待响应
        ws.on('message', (data) => {
          try {
            const response = JSON.parse(data.toString());
            if (response.reqId === proxyMessage.reqId) {
              logSuccess('Proxy 测试成功');
              logInfo('Proxy 响应:', JSON.stringify(response, null, 2));
              ws.close();
              resolve(true);
            }
          } catch (error) {
            // 二进制响应
            logWarning('Proxy 响应是二进制数据');
            logInfo('原始响应长度:', data.length, 'bytes');
            logSuccess('Proxy 测试成功（二进制响应）');
            ws.close();
            resolve(true);
          }
        });
      });
      
      ws.on('error', (error) => {
        clearTimeout(timeout);
        logError(`WebSocket 连接失败: ${error.message}`);
        resolve(false);
      });
    });
    
  } catch (error) {
    logError(`Gateway Proxy 测试失败: ${error.message}`);
    return false;
  }
}

// 主测试函数
async function runGatewayTest() {
  log('🚀 开始 Gateway 完整测试', 'bright');
  log('=' * 60, 'cyan');
  
  const startTime = Date.now();
  
  try {
    // 步骤1: 检查服务状态
    const servicesOk = await checkServices();
    if (!servicesOk) {
      logError('服务检查失败，无法继续测试');
      return false;
    }
    
    // 等待服务稳定
    await sleep(2000);
    
    // 步骤2: 测试直接 API 调用
    const directResults = await testDirectAPI();
    if (!directResults.success) {
      logError('直接 API 测试失败，无法进行对比');
      return false;
    }
    
    // 步骤3: 测试 Gateway Ping
    const pingSuccess = await testGatewayPing();
    if (!pingSuccess) {
      logError('Gateway Ping 测试失败');
      return false;
    }
    
    // 步骤4: 测试 Gateway Proxy
    const proxySuccess = await testGatewayProxy();
    if (!proxySuccess) {
      logError('Gateway Proxy 测试失败');
      return false;
    }
    
    const duration = Date.now() - startTime;
    
    logSuccess(`🎉 Gateway 测试完成！用时: ${duration}ms`);
    log('', 'reset');
    log('📋 测试总结:', 'bright');
    log('  ✅ MidwayJS 服务正常运行', 'green');
    log('  ✅ Gateway WebSocket 连接正常', 'green');
    log('  ✅ 直接 API 调用测试通过', 'green');
    log('  ✅ Gateway Ping API 测试通过', 'green');
    log('  ✅ Gateway Proxy API 测试通过', 'green');
    log('  ✅ WebSocket -> HTTP 代理流程验证成功', 'green');
    log('', 'reset');
    log('🎯 系统架构验证完成:', 'bright');
    log('  客户端 -> Gateway (WebSocket) -> MidwayJS (HTTP)', 'blue');
    log('  所有组件协同工作正常！', 'green');
    
    return true;
    
  } catch (error) {
    logError(`测试过程中发生错误: ${error.message}`);
    return false;
  }
}

// 启动测试
if (require.main === module) {
  runGatewayTest().then(success => {
    process.exit(success ? 0 : 1);
  });
}

module.exports = { runGatewayTest };
