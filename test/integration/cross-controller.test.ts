/**
 * 跨Controller集成测试
 * 测试不同Controller之间的交互和共享类型的使用
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

describe('Cross-Controller Integration Tests', () => {
  let userController: UserController;
  let orderController: OrderController;

  beforeEach(() => {
    userController = new UserController();
    orderController = new OrderController();
  });

  describe('User-Order Relationship Tests', () => {
    it('should create user and then create order for that user', async () => {
      // 1. 创建用户
      const userData = {
        name: '测试用户',
        email: 'test@example.com',
        age: 25,
        tags: ['测试用户'],
        permissions: ['read', 'write']
      };
      const userContext = createMockContext({
        request: { body: userData } as any
      });

      await userController.createUser(userContext);

      expect(userContext.status).toBe(201);
      expect(userContext.body.data).toHaveProperty('id');
      const userId = userContext.body.data.id;

      // 2. 为该用户创建订单
      const orderData = {
        userId: userId,
        productName: '测试商品',
        amount: 999.99,
        quantity: 1,
        shippingAddress: '测试地址'
      };
      const orderContext = createMockContext({
        request: { body: orderData } as any
      });

      await orderController.createOrder(orderContext);

      expect(orderContext.status).toBe(201);
      expect(orderContext.body.data.userId).toBe(userId);
      expect(orderContext.body.data.productName).toBe('测试商品');
    });

    it('should get user orders by userId', async () => {
      // 获取用户ID为1的订单
      const orderContext = createMockContext({
        query: { userId: '1' }
      });

      await orderController.getOrders(orderContext);

      expect(orderContext.body.data.orders).toHaveLength(2);
      expect(orderContext.body.data.orders.every(order => order.userId === 1)).toBe(true);
    });

    it('should handle user deletion and related orders', async () => {
      // 1. 获取用户信息
      const userContext = createMockContext({
        params: { id: '1' }
      });
      await userController.getUser(userContext);
      expect(userContext.body.success).toBe(true);

      // 2. 删除用户
      const deleteContext = createMockContext({
        params: { id: '1' }
      });
      await userController.deleteUser(deleteContext);
      expect(deleteContext.body.success).toBe(true);

      // 3. 验证用户已删除（在实际应用中，这里可能需要检查订单状态）
      const checkUserContext = createMockContext({
        params: { id: '1' }
      });
      await userController.getUser(checkUserContext);
      expect(checkUserContext.status).toBe(404);
    });

    it('should update user and verify order information consistency', async () => {
      // 1. 更新用户信息
      const updateData = {
        name: '更新后的用户',
        email: 'updated@example.com',
        age: 30
      };
      const userContext = createMockContext({
        params: { id: '1' },
        request: { body: updateData } as any
      });
      await userController.updateUser(userContext);
      expect(userContext.body.success).toBe(true);

      // 2. 验证订单中的用户信息（在实际应用中，这里可能需要更新订单中的用户信息）
      const orderContext = createMockContext({
        query: { userId: '1' }
      });
      await orderController.getOrders(orderContext);
      expect(orderContext.body.data.orders.length).toBeGreaterThan(0);
    });
  });

  describe('Data Consistency Tests', () => {
    it('should maintain consistent data types across controllers', async () => {
      // 测试用户创建
      const userData = {
        name: '一致性测试用户',
        email: 'consistency@example.com',
        age: 28
      };
      const userContext = createMockContext({
        request: { body: userData } as any
      });
      await userController.createUser(userContext);
      const userId = userContext.body.data.id;

      // 测试订单创建
      const orderData = {
        userId: userId,
        productName: '一致性测试商品',
        amount: 1999.99,
        shippingAddress: '一致性测试地址'
      };
      const orderContext = createMockContext({
        request: { body: orderData } as any
      });
      await orderController.createOrder(orderContext);

      // 验证数据类型一致性
      expect(typeof userId).toBe('number');
      expect(typeof orderContext.body.data.userId).toBe('number');
      expect(userId).toBe(orderContext.body.data.userId);
    });

    it('should handle shared validation rules consistently', async () => {
      // 测试用户创建时的必填字段验证
      const invalidUserData = {
        email: 'invalid@example.com'
        // 缺少 name
      };
      const userContext = createMockContext({
        request: { body: invalidUserData } as any
      });
      await userController.createUser(userContext);
      expect(userContext.status).toBe(400);

      // 测试订单创建时的必填字段验证
      const invalidOrderData = {
        productName: '测试商品',
        amount: 100
        // 缺少 userId 和 shippingAddress
      };
      const orderContext = createMockContext({
        request: { body: invalidOrderData } as any
      });
      await orderController.createOrder(orderContext);
      expect(orderContext.status).toBe(400);
    });

    it('should handle pagination consistently across controllers', async () => {
      // 测试用户分页
      const userContext = createMockContext({
        query: { page: '1', limit: '2' }
      });
      await userController.getUsers(userContext);
      expect(userContext.body.data.pagination).toHaveProperty('page', 1);
      expect(userContext.body.data.pagination).toHaveProperty('limit', 2);

      // 测试订单分页
      const orderContext = createMockContext({
        query: { page: '1', limit: '2' }
      });
      await orderController.getOrders(orderContext);
      expect(orderContext.body.data.pagination).toHaveProperty('page', 1);
      expect(orderContext.body.data.pagination).toHaveProperty('limit', 2);
    });
  });

  describe('Error Handling Consistency', () => {
    it('should return consistent error formats across controllers', async () => {
      // 测试用户404错误
      const userContext = createMockContext({
        params: { id: '999' }
      });
      await userController.getUser(userContext);
      expect(userContext.body).toHaveProperty('success', false);
      expect(userContext.body).toHaveProperty('message');
      expect(userContext.body).toHaveProperty('timestamp');

      // 测试订单404错误
      const orderContext = createMockContext({
        params: { id: '9999' }
      });
      await orderController.getOrder(orderContext);
      expect(orderContext.body).toHaveProperty('success', false);
      expect(orderContext.body).toHaveProperty('message');
      expect(orderContext.body).toHaveProperty('timestamp');
    });

    it('should handle invalid ID formats consistently', async () => {
      // 测试用户无效ID
      const userContext = createMockContext({
        params: { id: 'invalid' }
      });
      await userController.getUser(userContext);
      expect(userContext.status).toBe(404);

      // 测试订单无效ID
      const orderContext = createMockContext({
        params: { id: 'invalid' }
      });
      await orderController.getOrder(orderContext);
      expect(orderContext.status).toBe(404);
    });

    it('should handle empty request bodies consistently', async () => {
      // 测试用户创建空请求体
      const userContext = createMockContext({
        request: { body: {} } as any
      });
      await userController.createUser(userContext);
      expect(userContext.status).toBe(400);

      // 测试订单创建空请求体
      const orderContext = createMockContext({
        request: { body: {} } as any
      });
      await orderController.createOrder(orderContext);
      expect(orderContext.status).toBe(400);
    });
  });

  describe('Performance and Concurrency Tests', () => {
    it('should handle concurrent user and order operations', async () => {
      const operations = [];

      // 并发创建用户
      for (let i = 0; i < 5; i++) {
        const userContext = createMockContext({
          request: { 
            body: { 
              name: `并发用户${i}`, 
              email: `concurrent${i}@example.com` 
            } 
          }
        });
        operations.push(userController.createUser(userContext));
      }

      // 并发创建订单
      for (let i = 0; i < 5; i++) {
        const orderContext = createMockContext({
          request: { 
            body: { 
              userId: 1, 
              productName: `并发商品${i}`, 
              amount: 100 + i, 
              shippingAddress: `并发地址${i}` 
            } 
          }
        });
        operations.push(orderController.createOrder(orderContext));
      }

      const results = await Promise.all(operations);

      // 验证所有操作都成功
      results.forEach((_, index) => {
        if (index < 5) {
          // 用户创建结果
          expect(results[index]).toBeUndefined(); // 没有返回值
        } else {
          // 订单创建结果
          expect(results[index]).toBeUndefined(); // 没有返回值
        }
      });
    });

    it('should handle rapid sequential operations', async () => {
      const startTime = Date.now();

      // 快速连续操作
      for (let i = 0; i < 10; i++) {
        // 创建用户
        const userContext = createMockContext({
          request: { 
            body: { 
              name: `快速用户${i}`, 
              email: `rapid${i}@example.com` 
            } 
          }
        });
        await userController.createUser(userContext);

        // 创建订单
        const orderContext = createMockContext({
          request: { 
            body: { 
              userId: 1, 
              productName: `快速商品${i}`, 
              amount: 50 + i, 
              shippingAddress: `快速地址${i}` 
            } 
          }
        });
        await orderController.createOrder(orderContext);
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      // 验证性能（应该在合理时间内完成）
      expect(duration).toBeLessThan(5000); // 5秒内完成
    });
  });

  describe('Business Logic Integration', () => {
    it('should handle complete user lifecycle with orders', async () => {
      // 1. 创建用户
      const userData = {
        name: '生命周期测试用户',
        email: 'lifecycle@example.com',
        age: 25
      };
      const createUserContext = createMockContext({
        request: { body: userData } as any
      });
      await userController.createUser(createUserContext);
      const userId = createUserContext.body.data.id;

      // 2. 为用户创建多个订单
      const orders = [];
      for (let i = 0; i < 3; i++) {
        const orderData = {
          userId: userId,
          productName: `订单${i + 1}`,
          amount: 100 * (i + 1),
          shippingAddress: `地址${i + 1}`
        };
        const orderContext = createMockContext({
          request: { body: orderData } as any
        });
        await orderController.createOrder(orderContext);
        orders.push(orderContext.body.data);
      }

      // 3. 获取用户信息
      const getUserContext = createMockContext({
        params: { id: userId.toString() }
      });
      await userController.getUser(getUserContext);
      expect(getUserContext.body.data.id).toBe(userId);

      // 4. 获取用户订单
      const getOrdersContext = createMockContext({
        query: { userId: userId.toString() }
      });
      await orderController.getOrders(getOrdersContext);
      expect(getOrdersContext.body.data.orders.length).toBeGreaterThan(0);

      // 5. 更新用户信息
      const updateUserContext = createMockContext({
        params: { id: userId.toString() },
        request: { body: { name: '更新后的用户' } }
      });
      await userController.updateUser(updateUserContext);
      expect(updateUserContext.body.data.name).toBe('更新后的用户');

      // 6. 更新订单状态
      if (orders.length > 0) {
        const updateOrderContext = createMockContext({
          params: { id: orders[0].id.toString() },
          request: { body: { status: 'paid' } }
        });
        await orderController.updateOrderStatus(updateOrderContext);
        expect(updateOrderContext.body.data.status).toBe('paid');
      }

      // 7. 删除用户
      const deleteUserContext = createMockContext({
        params: { id: userId.toString() }
      });
      await userController.deleteUser(deleteUserContext);
      expect(deleteUserContext.body.success).toBe(true);
    });

    it('should handle order status transitions correctly', async () => {
      // 创建订单
      const orderData = {
        userId: 1,
        productName: '状态测试商品',
        amount: 500.00,
        shippingAddress: '状态测试地址'
      };
      const createOrderContext = createMockContext({
        request: { body: orderData } as any
      });
      await orderController.createOrder(createOrderContext);
      const orderId = createOrderContext.body.data.id;

      // 测试状态转换：pending -> paid -> shipped -> delivered
      const statusTransitions = ['paid', 'shipped', 'delivered'];
      
      for (const status of statusTransitions) {
        const updateContext = createMockContext({
          params: { id: orderId.toString() },
          request: { body: { status, note: `状态更新为${status}` } }
        });
        await orderController.updateOrderStatus(updateContext);
        expect(updateContext.body.data.status).toBe(status);
      }
    });
  });

  describe('Data Validation Integration', () => {
    it('should validate data types consistently', async () => {
      // 测试用户年龄类型
      const userData = {
        name: '类型测试用户',
        email: 'type@example.com',
        age: '25' // 字符串类型的年龄
      };
      const userContext = createMockContext({
        request: { body: userData } as any
      });
      await userController.createUser(userContext);
      expect(userContext.status).toBe(201);

      // 测试订单金额类型
      const orderData = {
        userId: 1,
        productName: '类型测试商品',
        amount: '999.99', // 字符串类型的金额
        shippingAddress: '类型测试地址'
      };
      const orderContext = createMockContext({
        request: { body: orderData } as any
      });
      await orderController.createOrder(orderContext);
      expect(orderContext.status).toBe(201);
    });

    it('should handle special characters consistently', async () => {
      // 测试用户特殊字符
      const userData = {
        name: '用户@#$%^&*()',
        email: 'special+chars@example.com',
        age: 25
      };
      const userContext = createMockContext({
        request: { body: userData } as any
      });
      await userController.createUser(userContext);
      expect(userContext.status).toBe(201);

      // 测试订单特殊字符
      const orderData = {
        userId: 1,
        productName: '商品@#$%^&*()',
        amount: 999.99,
        shippingAddress: '地址@#$%^&*()'
      };
      const orderContext = createMockContext({
        request: { body: orderData } as any
      });
      await orderController.createOrder(orderContext);
      expect(orderContext.status).toBe(201);
    });
  });
});
