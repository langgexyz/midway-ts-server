/**
 * 性能测试
 * 测试API端点的性能表现和并发处理能力
 */

import { UserController } from '../../src/controller/user.controller';
import { OrderController } from '../../src/controller/order.controller';
import { Context } from '@midwayjs/koa';

// Mock Context
const createMockContext = (overrides: Partial<Context> = {}): Context => {
  return {
    query: {},
    params: {},
    request: { body: {} } as any,
    body: {},
    status: 200,
    ...overrides
  } as Context;
};

describe('Performance Tests', () => {
  let userController: UserController;
  let orderController: OrderController;

  beforeEach(() => {
    userController = new UserController();
    orderController = new OrderController();
  });

  describe('Single Operation Performance', () => {
    it('should handle user creation within acceptable time', async () => {
      const userData = {
        name: '性能测试用户',
        email: 'performance@example.com',
        age: 25
      };
      const context = createMockContext({
        request: { body: userData } as any
      });

      const startTime = Date.now();
      await userController.createUser(context);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(100); // 应该在100ms内完成
      expect(context.status).toBe(201);
    });

    it('should handle order creation within acceptable time', async () => {
      const orderData = {
        userId: 1,
        productName: '性能测试商品',
        amount: 999.99,
        shippingAddress: '性能测试地址'
      };
      const context = createMockContext({
        request: { body: orderData } as any
      });

      const startTime = Date.now();
      await orderController.createOrder(context);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(100); // 应该在100ms内完成
      expect(context.status).toBe(201);
    });

    it('should handle user list retrieval within acceptable time', async () => {
      const context = createMockContext();

      const startTime = Date.now();
      await userController.getUsers(context);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(50); // 应该在50ms内完成
      expect(context.status).toBe(200);
    });

    it('should handle order list retrieval within acceptable time', async () => {
      const context = createMockContext();

      const startTime = Date.now();
      await orderController.getOrders(context);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(50); // 应该在50ms内完成
      expect(context.status).toBe(200);
    });
  });

  describe('Concurrent Operations Performance', () => {
    it('should handle concurrent user creation', async () => {
      const concurrentCount = 20;
      const operations = [];

      const startTime = Date.now();

      for (let i = 0; i < concurrentCount; i++) {
        const context = createMockContext({
          request: { 
            body: { 
              name: `并发用户${i}`, 
              email: `concurrent${i}@example.com`,
              age: 20 + i
            } 
          }
        });
        operations.push(userController.createUser(context));
      }

      await Promise.all(operations);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(1000); // 应该在1秒内完成
    });

    it('should handle concurrent order creation', async () => {
      const concurrentCount = 20;
      const operations = [];

      const startTime = Date.now();

      for (let i = 0; i < concurrentCount; i++) {
        const context = createMockContext({
          request: { 
            body: { 
              userId: 1, 
              productName: `并发商品${i}`, 
              amount: 100 + i,
              shippingAddress: `并发地址${i}`
            } 
          }
        });
        operations.push(orderController.createOrder(context));
      }

      await Promise.all(operations);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(1000); // 应该在1秒内完成
    });

    it('should handle mixed concurrent operations', async () => {
      const operations = [];
      const startTime = Date.now();

      // 混合操作：用户创建、订单创建、用户查询、订单查询
      for (let i = 0; i < 10; i++) {
        // 创建用户
        const userContext = createMockContext({
          request: { 
            body: { 
              name: `混合用户${i}`, 
              email: `mixed${i}@example.com` 
            } 
          }
        });
        operations.push(userController.createUser(userContext));

        // 创建订单
        const orderContext = createMockContext({
          request: { 
            body: { 
              userId: 1, 
              productName: `混合商品${i}`, 
              amount: 200 + i,
              shippingAddress: `混合地址${i}`
            } 
          }
        });
        operations.push(orderController.createOrder(orderContext));

        // 查询用户
        const getUserContext = createMockContext({
          params: { id: '1' }
        });
        operations.push(userController.getUser(getUserContext));

        // 查询订单
        const getOrderContext = createMockContext({
          params: { id: '1001' }
        });
        operations.push(orderController.getOrder(getOrderContext));
      }

      await Promise.all(operations);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(2000); // 应该在2秒内完成
    });
  });

  describe('Large Data Handling Performance', () => {
    it('should handle large user data efficiently', async () => {
      const largeUserData = {
        name: 'A'.repeat(1000), // 长用户名
        email: 'large@example.com',
        age: 25,
        tags: Array.from({ length: 100 }, (_, i) => `标签${i}`), // 大量标签
        permissions: Array.from({ length: 50 }, (_, i) => `权限${i}`) // 大量权限
      };
      const context = createMockContext({
        request: { body: largeUserData }
      });

      const startTime = Date.now();
      await userController.createUser(context);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(200); // 应该在200ms内完成
      expect(context.status).toBe(201);
    });

    it('should handle large order data efficiently', async () => {
      const largeOrderData = {
        userId: 1,
        productName: 'A'.repeat(1000), // 长商品名
        amount: 999999.99,
        quantity: 1000,
        shippingAddress: 'A'.repeat(2000) // 长地址
      };
      const context = createMockContext({
        request: { body: largeOrderData }
      });

      const startTime = Date.now();
      await orderController.createOrder(context);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(200); // 应该在200ms内完成
      expect(context.status).toBe(201);
    });

    it('should handle pagination with large datasets efficiently', async () => {
      const context = createMockContext({
        query: { page: '1', limit: '1000' } // 大分页
      });

      const startTime = Date.now();
      await userController.getUsers(context);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(100); // 应该在100ms内完成
      expect(context.status).toBe(200);
    });
  });

  describe('Memory Usage Performance', () => {
    it('should handle multiple operations without memory leaks', async () => {
      const operationCount = 100;
      const startTime = Date.now();

      for (let i = 0; i < operationCount; i++) {
        // 创建用户
        const userContext = createMockContext({
          request: { 
            body: { 
              name: `内存测试用户${i}`, 
              email: `memory${i}@example.com` 
            } 
          }
        });
        await userController.createUser(userContext);

        // 创建订单
        const orderContext = createMockContext({
          request: { 
            body: { 
              userId: 1, 
              productName: `内存测试商品${i}`, 
              amount: 100 + i,
              shippingAddress: `内存测试地址${i}`
            } 
          }
        });
        await orderController.createOrder(orderContext);

        // 查询操作
        const getUserContext = createMockContext({
          params: { id: '1' }
        });
        await userController.getUser(getUserContext);

        const getOrderContext = createMockContext({
          params: { id: '1001' }
        });
        await orderController.getOrder(getOrderContext);
      }

      const endTime = Date.now();
      expect(endTime - startTime).toBeLessThan(5000); // 应该在5秒内完成
    });
  });

  describe('Stress Testing', () => {
    it('should handle high-frequency requests', async () => {
      const requestCount = 50;
      const requests = [];
      const startTime = Date.now();

      for (let i = 0; i < requestCount; i++) {
        const context = createMockContext({
          params: { id: '1' }
        });
        requests.push(userController.getUser(context));
      }

      await Promise.all(requests);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(1000); // 应该在1秒内完成
    });

    it('should handle rapid sequential operations', async () => {
      const operationCount = 30;
      const startTime = Date.now();

      for (let i = 0; i < operationCount; i++) {
        // 快速连续操作
        const userContext = createMockContext({
          request: { 
            body: { 
              name: `压力测试用户${i}`, 
              email: `stress${i}@example.com` 
            } 
          }
        });
        await userController.createUser(userContext);

        const orderContext = createMockContext({
          request: { 
            body: { 
              userId: 1, 
              productName: `压力测试商品${i}`, 
              amount: 100 + i,
              shippingAddress: `压力测试地址${i}`
            } 
          }
        });
        await orderController.createOrder(orderContext);
      }

      const endTime = Date.now();
      expect(endTime - startTime).toBeLessThan(3000); // 应该在3秒内完成
    });

    it('should handle burst traffic', async () => {
      const burstSize = 25;
      const bursts = 4;
      const startTime = Date.now();

      for (let burst = 0; burst < bursts; burst++) {
        const operations = [];

        // 突发请求
        for (let i = 0; i < burstSize; i++) {
          const context = createMockContext({
            request: { 
              body: { 
                name: `突发用户${burst}-${i}`, 
                email: `burst${burst}-${i}@example.com` 
              } 
            }
          });
          operations.push(userController.createUser(context));
        }

        await Promise.all(operations);

        // 短暂休息
        await new Promise(resolve => setTimeout(resolve, 10));
      }

      const endTime = Date.now();
      expect(endTime - startTime).toBeLessThan(2000); // 应该在2秒内完成
    });
  });

  describe('Response Time Consistency', () => {
    it('should maintain consistent response times for similar operations', async () => {
      const responseTimes = [];
      const operationCount = 10;

      for (let i = 0; i < operationCount; i++) {
        const context = createMockContext({
          params: { id: '1' }
        });

        const startTime = Date.now();
        await userController.getUser(context);
        const endTime = Date.now();

        responseTimes.push(endTime - startTime);
      }

      // 计算响应时间的标准差
      const avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
      const variance = responseTimes.reduce((sum, time) => sum + Math.pow(time - avgResponseTime, 2), 0) / responseTimes.length;
      const standardDeviation = Math.sqrt(variance);

      // 响应时间应该相对稳定（标准差小于平均值的50%）
      expect(standardDeviation).toBeLessThan(avgResponseTime * 0.5);
      expect(avgResponseTime).toBeLessThan(100); // 平均响应时间应该小于100ms
    });

    it('should handle varying load gracefully', async () => {
      const loads = [1, 5, 10, 20];
      const responseTimes = [];

      for (const load of loads) {
        const operations = [];
        const startTime = Date.now();

        for (let i = 0; i < load; i++) {
          const context = createMockContext({
            params: { id: '1' }
          });
          operations.push(userController.getUser(context));
        }

        await Promise.all(operations);
        const endTime = Date.now();

        responseTimes.push(endTime - startTime);
      }

      // 响应时间应该随负载增长，但不应呈指数增长
      for (let i = 1; i < responseTimes.length; i++) {
        const timeIncrease = responseTimes[i] - responseTimes[i - 1];
        const loadIncrease = loads[i] - loads[i - 1];
        const timePerRequest = timeIncrease / loadIncrease;

        // 每个请求的平均时间增长应该合理
        expect(timePerRequest).toBeLessThan(50); // 每个额外请求不应超过50ms
      }
    });
  });

  describe('Error Handling Performance', () => {
    it('should handle errors efficiently', async () => {
      const errorOperations = [];
      const startTime = Date.now();

      // 大量错误请求
      for (let i = 0; i < 20; i++) {
        const context = createMockContext({
          params: { id: '999' } // 不存在的用户
        });
        errorOperations.push(userController.getUser(context));
      }

      await Promise.all(errorOperations);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(500); // 错误处理应该在500ms内完成
    });

    it('should handle validation errors efficiently', async () => {
      const validationOperations = [];
      const startTime = Date.now();

      // 大量验证错误请求
      for (let i = 0; i < 20; i++) {
        const context = createMockContext({
          request: { body: {} } as any // 空请求体
        });
        validationOperations.push(userController.createUser(context));
      }

      await Promise.all(validationOperations);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(500); // 验证错误处理应该在500ms内完成
    });
  });
});
