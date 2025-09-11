/**
 * Jest 测试设置文件
 */

// 设置测试超时时间
jest.setTimeout(10000);

// 全局测试配置
beforeAll(() => {
  console.log('🧪 开始测试套件');
});

afterAll(() => {
  console.log('✅ 测试套件完成');
});

// 模拟 console.log 以避免测试输出干扰
const originalConsoleLog = console.log;
beforeEach(() => {
  console.log = jest.fn();
});

afterEach(() => {
  console.log = originalConsoleLog;
});

// 全局测试工具函数
global.testUtils = {
  // 创建测试数据
  createTestData: () => ({
    name: 'test',
    value: 123,
    nested: { key: 'value' }
  }),
  
  // 创建测试 Headers
  createTestHeaders: () => new Map([
    ['Content-Type', 'application/json'],
    ['Authorization', 'Bearer test-token']
  ]),
  
  // 等待异步操作
  wait: (ms: number) => new Promise(resolve => setTimeout(resolve, ms)),
  
  // 创建 Mock Gateway Client
  createMockGatewayClient: () => ({
    send: jest.fn(),
    sendRaw: jest.fn()
  })
};
