/**
 * 订单Controller单元测试
 * 测试订单管理相关的所有API端点
 */

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

describe('OrderController Unit Tests', () => {
  let controller: OrderController;
  let mockContext: Context;

  beforeEach(() => {
    controller = new OrderController();
    mockContext = createMockContext();
  });

  describe('GET /api/orders - 获取订单列表', () => {
    it('should return order list with default pagination', async () => {
      await controller.getOrders(mockContext);

      expect(mockContext.body).toHaveProperty('success', true);
      expect(mockContext.body).toHaveProperty('data');
      expect(mockContext.body.data).toHaveProperty('orders');
      expect(mockContext.body.data).toHaveProperty('pagination');
      expect(mockContext.body.data).toHaveProperty('filters');
      expect(mockContext.body.data.orders).toHaveLength(3);
      expect(mockContext.body.data.pagination).toEqual({
        page: 1,
        limit: 10,
        total: 3,
        pages: 1
      });
    });

    it('should handle custom pagination parameters', async () => {
      mockContext.query = { page: '2', limit: '1' };
      await controller.getOrders(mockContext);

      expect(mockContext.body.data.pagination).toEqual({
        page: 2,
        limit: 1,
        total: 3,
        pages: 3
      });
      expect(mockContext.body.data.orders).toHaveLength(1);
    });

    it('should filter orders by status', async () => {
      mockContext.query = { status: 'paid' };
      await controller.getOrders(mockContext);

      expect(mockContext.body.data.filters.status).toBe('paid');
      expect(mockContext.body.data.orders).toHaveLength(1);
      expect(mockContext.body.data.orders[0].status).toBe('paid');
    });

    it('should filter orders by userId', async () => {
      mockContext.query = { userId: '1' };
      await controller.getOrders(mockContext);

      expect(mockContext.body.data.filters.userId).toBe(1);
      expect(mockContext.body.data.orders).toHaveLength(2);
      expect(mockContext.body.data.orders.every(order => order.userId === 1)).toBe(true);
    });

    it('should filter orders by both status and userId', async () => {
      mockContext.query = { status: 'pending', userId: '1' };
      await controller.getOrders(mockContext);

      expect(mockContext.body.data.filters).toEqual({ status: 'pending', userId: 1 });
      expect(mockContext.body.data.orders).toHaveLength(1);
      expect(mockContext.body.data.orders[0]).toMatchObject({
        status: 'pending',
        userId: 1
      });
    });

    it('should handle invalid filter values', async () => {
      mockContext.query = { status: 'invalid_status', userId: 'invalid_id' };
      await controller.getOrders(mockContext);

      expect(mockContext.body.data.filters).toEqual({ status: 'invalid_status', userId: null });
      expect(mockContext.body.data.orders).toHaveLength(3); // 没有过滤，返回所有订单
    });

    it('should handle all valid status values', async () => {
      const validStatuses = ['pending', 'paid', 'shipped', 'delivered', 'cancelled'];
      
      for (const status of validStatuses) {
        mockContext.query = { status };
        await controller.getOrders(mockContext);
        
        expect(mockContext.body.data.filters.status).toBe(status);
        // 注意：只有 'paid', 'shipped', 'pending' 在测试数据中存在
        if (['paid', 'shipped', 'pending'].includes(status)) {
          expect(mockContext.body.data.orders.length).toBeGreaterThan(0);
        }
      }
    });
  });

  describe('GET /api/orders/:id - 获取单个订单', () => {
    it('should return order when found', async () => {
      mockContext.params = { id: '1001' };
      await controller.getOrder(mockContext);

      expect(mockContext.body).toHaveProperty('success', true);
      expect(mockContext.body.data).toEqual({
        id: 1001,
        userId: 1,
        productName: 'MacBook Pro',
        amount: 12999.00,
        status: 'paid',
        createdAt: '2025-09-10T10:00:00Z',
        shippingAddress: '北京市朝阳区xxx街道',
        paymentMethod: 'credit_card'
      });
    });

    it('should return 404 when order not found', async () => {
      mockContext.params = { id: '9999' };
      await controller.getOrder(mockContext);

      expect(mockContext.status).toBe(404);
      expect(mockContext.body).toHaveProperty('success', false);
      expect(mockContext.body).toHaveProperty('message', '订单不存在');
      expect(mockContext.body.data).toBeNull();
    });

    it('should handle invalid order ID', async () => {
      mockContext.params = { id: 'invalid' };
      await controller.getOrder(mockContext);

      expect(mockContext.status).toBe(404);
      expect(mockContext.body).toHaveProperty('success', false);
    });

    it('should handle negative order ID', async () => {
      mockContext.params = { id: '-1' };
      await controller.getOrder(mockContext);

      expect(mockContext.status).toBe(404);
      expect(mockContext.body).toHaveProperty('success', false);
    });
  });

  describe('POST /api/orders - 创建订单', () => {
    it('should create order with valid data', async () => {
      const orderData = {
        userId: 1,
        productName: 'iPhone 15 Pro',
        amount: 9999.00,
        quantity: 1,
        shippingAddress: '上海市浦东新区xxx路123号'
      };
      mockContext.request.body = orderData;

      await controller.createOrder(mockContext);

      expect(mockContext.status).toBe(201);
      expect(mockContext.body).toHaveProperty('success', true);
      expect(mockContext.body).toHaveProperty('message', '订单创建成功');
      expect(mockContext.body.data).toMatchObject({
        userId: orderData.userId,
        productName: orderData.productName,
        amount: orderData.amount,
        quantity: orderData.quantity,
        shippingAddress: orderData.shippingAddress,
        status: 'pending'
      });
      expect(mockContext.body.data).toHaveProperty('id');
      expect(mockContext.body.data).toHaveProperty('createdAt');
    });

    it('should create order with default quantity', async () => {
      const orderData = {
        userId: 2,
        productName: 'iPad Air',
        amount: 4599.00,
        shippingAddress: '北京市朝阳区xxx街道456号'
      };
      mockContext.request.body = orderData;

      await controller.createOrder(mockContext);

      expect(mockContext.status).toBe(201);
      expect(mockContext.body.data).toMatchObject({
        userId: orderData.userId,
        productName: orderData.productName,
        amount: orderData.amount,
        quantity: 1, // 默认数量
        shippingAddress: orderData.shippingAddress,
        status: 'pending'
      });
    });

    it('should return 400 when userId is missing', async () => {
      const orderData = {
        productName: 'MacBook Pro',
        amount: 12999.00,
        shippingAddress: '深圳市南山区xxx路789号'
      };
      mockContext.request.body = orderData;

      await controller.createOrder(mockContext);

      expect(mockContext.status).toBe(400);
      expect(mockContext.body).toHaveProperty('success', false);
      expect(mockContext.body).toHaveProperty('message', '用户ID、商品名称、金额和配送地址为必填项');
    });

    it('should return 400 when productName is missing', async () => {
      const orderData = {
        userId: 1,
        amount: 12999.00,
        shippingAddress: '广州市天河区xxx路101号'
      };
      mockContext.request.body = orderData;

      await controller.createOrder(mockContext);

      expect(mockContext.status).toBe(400);
      expect(mockContext.body).toHaveProperty('success', false);
    });

    it('should return 400 when amount is missing', async () => {
      const orderData = {
        userId: 1,
        productName: 'MacBook Pro',
        shippingAddress: '杭州市西湖区xxx路202号'
      };
      mockContext.request.body = orderData;

      await controller.createOrder(mockContext);

      expect(mockContext.status).toBe(400);
      expect(mockContext.body).toHaveProperty('success', false);
    });

    it('should return 400 when shippingAddress is missing', async () => {
      const orderData = {
        userId: 1,
        productName: 'MacBook Pro',
        amount: 12999.00
      };
      mockContext.request.body = orderData;

      await controller.createOrder(mockContext);

      expect(mockContext.status).toBe(400);
      expect(mockContext.body).toHaveProperty('success', false);
    });

    it('should handle empty request body', async () => {
      mockContext.request.body = {};

      await controller.createOrder(mockContext);

      expect(mockContext.status).toBe(400);
      expect(mockContext.body).toHaveProperty('success', false);
    });

    it('should handle special characters in order data', async () => {
      const orderData = {
        userId: 1,
        productName: 'MacBook Pro 16" M3 Max',
        amount: 15999.00,
        quantity: 2,
        shippingAddress: '上海市浦东新区张江高科技园区xxx路@#$%^&*()号'
      };
      mockContext.request.body = orderData;

      await controller.createOrder(mockContext);

      expect(mockContext.status).toBe(201);
      expect(mockContext.body.data).toMatchObject(orderData);
    });

    it('should handle large amounts', async () => {
      const orderData = {
        userId: 1,
        productName: 'Enterprise Server',
        amount: 999999.99,
        shippingAddress: '北京市朝阳区xxx路'
      };
      mockContext.request.body = orderData;

      await controller.createOrder(mockContext);

      expect(mockContext.status).toBe(201);
      expect(mockContext.body.data.amount).toBe(999999.99);
    });

    it('should handle large quantities', async () => {
      const orderData = {
        userId: 1,
        productName: 'Bulk Items',
        amount: 100.00,
        quantity: 1000,
        shippingAddress: '上海市浦东新区xxx路'
      };
      mockContext.request.body = orderData;

      await controller.createOrder(mockContext);

      expect(mockContext.status).toBe(201);
      expect(mockContext.body.data.quantity).toBe(1000);
    });
  });

  describe('PUT /api/orders/:id/status - 更新订单状态', () => {
    it('should update order status with valid status', async () => {
      const orderId = 1001;
      const statusData = {
        status: 'shipped',
        note: '订单已发货'
      };
      mockContext.params = { id: orderId.toString() };
      mockContext.request.body = statusData;

      await controller.updateOrderStatus(mockContext);

      expect(mockContext.body).toHaveProperty('success', true);
      expect(mockContext.body).toHaveProperty('message', '订单状态更新成功');
      expect(mockContext.body.data).toMatchObject({
        id: orderId,
        status: statusData.status,
        note: statusData.note
      });
      expect(mockContext.body.data).toHaveProperty('updatedAt');
    });

    it('should update order status without note', async () => {
      const orderId = 1002;
      const statusData = {
        status: 'delivered'
      };
      mockContext.params = { id: orderId.toString() };
      mockContext.request.body = statusData;

      await controller.updateOrderStatus(mockContext);

      expect(mockContext.body.data).toMatchObject({
        id: orderId,
        status: statusData.status,
        note: undefined
      });
    });

    it('should handle all valid status values', async () => {
      const validStatuses = ['pending', 'paid', 'shipped', 'delivered', 'cancelled'];
      const orderId = 1003;
      
      for (const status of validStatuses) {
        mockContext.params = { id: orderId.toString() };
        mockContext.request.body = { status };
        
        await controller.updateOrderStatus(mockContext);
        
        expect(mockContext.body.data.status).toBe(status);
        expect(mockContext.body.data.id).toBe(orderId);
      }
    });

    it('should return 400 for invalid status', async () => {
      const orderId = 1001;
      const statusData = {
        status: 'invalid_status',
        note: '无效状态'
      };
      mockContext.params = { id: orderId.toString() };
      mockContext.request.body = statusData;

      await controller.updateOrderStatus(mockContext);

      expect(mockContext.status).toBe(400);
      expect(mockContext.body).toHaveProperty('success', false);
      expect(mockContext.body).toHaveProperty('message', '无效的订单状态');
      expect(mockContext.body.data).toHaveProperty('validStatuses');
      expect(mockContext.body.data.validStatuses).toEqual(['pending', 'paid', 'shipped', 'delivered', 'cancelled']);
    });

    it('should return 400 when status is missing', async () => {
      const orderId = 1001;
      mockContext.params = { id: orderId.toString() };
      mockContext.request.body = { note: '没有状态' };

      await controller.updateOrderStatus(mockContext);

      expect(mockContext.status).toBe(400);
      expect(mockContext.body).toHaveProperty('success', false);
    });

    it('should handle empty request body', async () => {
      const orderId = 1001;
      mockContext.params = { id: orderId.toString() };
      mockContext.request.body = {};

      await controller.updateOrderStatus(mockContext);

      expect(mockContext.status).toBe(400);
      expect(mockContext.body).toHaveProperty('success', false);
    });

    it('should handle different order IDs', async () => {
      const orderIds = ['1001', '9999', '0', '10000'];
      
      for (const id of orderIds) {
        mockContext.params = { id };
        mockContext.request.body = { status: 'paid' };
        
        await controller.updateOrderStatus(mockContext);
        
        expect(mockContext.body.data.id).toBe(Number(id));
        expect(mockContext.body.data.status).toBe('paid');
      }
    });
  });

  describe('GET /api/orders/stats - 获取订单统计', () => {
    it('should return order statistics without date filters', async () => {
      await controller.getOrderStats(mockContext);

      expect(mockContext.body).toHaveProperty('success', true);
      expect(mockContext.body.data).toMatchObject({
        total: 156,
        pending: 23,
        paid: 89,
        shipped: 31,
        delivered: 12,
        cancelled: 1,
        totalRevenue: 234567.89,
        averageOrderValue: 1503.69,
        period: { startDate: '2025-09-01', endDate: '2025-09-30' }
      });
    });

    it('should return order statistics with custom date filters', async () => {
      mockContext.query = { 
        startDate: '2025-08-01', 
        endDate: '2025-08-31' 
      };
      await controller.getOrderStats(mockContext);

      expect(mockContext.body.data.period).toEqual({
        startDate: '2025-08-01',
        endDate: '2025-08-31'
      });
    });

    it('should handle partial date filters', async () => {
      mockContext.query = { startDate: '2025-07-01' };
      await controller.getOrderStats(mockContext);

      expect(mockContext.body.data.period).toEqual({
        startDate: '2025-07-01',
        endDate: '2025-09-30'
      });
    });

    it('should handle invalid date formats', async () => {
      mockContext.query = { 
        startDate: 'invalid-date', 
        endDate: 'also-invalid' 
      };
      await controller.getOrderStats(mockContext);

      expect(mockContext.body.data.period).toEqual({
        startDate: 'invalid-date',
        endDate: 'also-invalid'
      });
    });

    it('should include timestamp in response', async () => {
      await controller.getOrderStats(mockContext);

      expect(mockContext.body).toHaveProperty('timestamp');
      expect(new Date(mockContext.body.timestamp)).toBeInstanceOf(Date);
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle very large order ID', async () => {
      const largeId = '999999999999999';
      mockContext.params = { id: largeId };

      await controller.getOrder(mockContext);

      expect(mockContext.status).toBe(404);
      expect(mockContext.body).toHaveProperty('success', false);
    });

    it('should handle very large pagination values', async () => {
      mockContext.query = { page: '999999', limit: '999999' };
      await controller.getOrders(mockContext);

      expect(mockContext.body.data.orders).toHaveLength(0);
      expect(mockContext.body.data.pagination.page).toBe(999999);
    });

    it('should handle zero pagination values', async () => {
      mockContext.query = { page: '0', limit: '0' };
      await controller.getOrders(mockContext);

      expect(mockContext.body.data.orders).toHaveLength(0);
      expect(mockContext.body.data.pagination.page).toBe(0);
    });

    it('should handle null and undefined values in create order', async () => {
      const orderData = {
        userId: null,
        productName: undefined,
        amount: null,
        shippingAddress: undefined
      };
      mockContext.request.body = orderData;

      await controller.createOrder(mockContext);

      expect(mockContext.status).toBe(400);
      expect(mockContext.body).toHaveProperty('success', false);
    });

    it('should handle negative amounts', async () => {
      const orderData = {
        userId: 1,
        productName: 'Refund Item',
        amount: -100.00,
        shippingAddress: 'Test Address'
      };
      mockContext.request.body = orderData;

      await controller.createOrder(mockContext);

      expect(mockContext.status).toBe(201);
      expect(mockContext.body.data.amount).toBe(-100.00);
    });

    it('should handle zero amounts', async () => {
      const orderData = {
        userId: 1,
        productName: 'Free Item',
        amount: 0,
        shippingAddress: 'Test Address'
      };
      mockContext.request.body = orderData;

      await controller.createOrder(mockContext);

      expect(mockContext.status).toBe(201);
      expect(mockContext.body.data.amount).toBe(0);
    });

    it('should handle very long product names', async () => {
      const longProductName = 'A'.repeat(1000);
      const orderData = {
        userId: 1,
        productName: longProductName,
        amount: 100.00,
        shippingAddress: 'Test Address'
      };
      mockContext.request.body = orderData;

      await controller.createOrder(mockContext);

      expect(mockContext.status).toBe(201);
      expect(mockContext.body.data.productName).toBe(longProductName);
    });

    it('should handle very long shipping addresses', async () => {
      const longAddress = 'A'.repeat(2000);
      const orderData = {
        userId: 1,
        productName: 'Test Product',
        amount: 100.00,
        shippingAddress: longAddress
      };
      mockContext.request.body = orderData;

      await controller.createOrder(mockContext);

      expect(mockContext.status).toBe(201);
      expect(mockContext.body.data.shippingAddress).toBe(longAddress);
    });
  });

  describe('Response Format Validation', () => {
    it('should have consistent response format for all endpoints', async () => {
      const endpoints = [
        () => controller.getOrders(mockContext),
        () => controller.getOrder({ ...mockContext, params: { id: '1001' } }),
        () => controller.createOrder({ ...mockContext, request: { body: { userId: 1, productName: 'Test', amount: 100, shippingAddress: 'Test Address' } } }),
        () => controller.updateOrderStatus({ ...mockContext, params: { id: '1001' }, request: { body: { status: 'paid' } } }),
        () => controller.getOrderStats(mockContext)
      ];

      for (const endpoint of endpoints) {
        await endpoint();
        
        expect(mockContext.body).toHaveProperty('success');
        expect(mockContext.body).toHaveProperty('timestamp');
        expect(typeof mockContext.body.success).toBe('boolean');
        expect(new Date(mockContext.body.timestamp)).toBeInstanceOf(Date);
      }
    });

    it('should include appropriate status codes', async () => {
      // Success cases
      await controller.getOrders(mockContext);
      expect(mockContext.status).toBe(200);

      await controller.createOrder({ ...mockContext, request: { body: { userId: 1, productName: 'Test', amount: 100, shippingAddress: 'Test Address' } } });
      expect(mockContext.status).toBe(201);

      // Error cases
      await controller.getOrder({ ...mockContext, params: { id: '9999' } });
      expect(mockContext.status).toBe(404);

      await controller.createOrder({ ...mockContext, request: { body: {} } });
      expect(mockContext.status).toBe(400);
    });
  });
});
