import { Controller, Get, Post, Put } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBody } from '@midwayjs/swagger';

@ApiTags('订单管理')
@Controller('/api/orders')
export class OrderController {
  
  /**
   * GET /api/orders - 获取订单列表
   */
  @ApiOperation({ summary: '获取订单列表', description: '返回用户的所有订单信息' })
  @ApiQuery({ name: 'page', required: false, description: '页码', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: '每页数量', example: 10 })
  @ApiQuery({ name: 'status', required: false, description: '订单状态', schema: { enum: ['pending', 'paid', 'shipped', 'delivered', 'cancelled'] } })
  @ApiQuery({ name: 'userId', required: false, description: '用户ID', example: 1 })
  @ApiResponse({ status: 200, description: '成功获取订单列表' })
  @Get('/')
  async getOrders(ctx: Context) {
    const page = Number(ctx.query.page) || 1;
    const limit = Number(ctx.query.limit) || 10;
    const status = ctx.query.status;
    const userId = ctx.query.userId ? Number(ctx.query.userId) : null;
    
    const orders = [
      { 
        id: 1001, 
        userId: 1, 
        productName: 'MacBook Pro', 
        amount: 12999.00, 
        status: 'paid', 
        createdAt: '2025-09-10T10:00:00Z' 
      },
      { 
        id: 1002, 
        userId: 2, 
        productName: 'iPhone 15', 
        amount: 8999.00, 
        status: 'shipped', 
        createdAt: '2025-09-09T15:30:00Z' 
      },
      { 
        id: 1003, 
        userId: 1, 
        productName: 'iPad Air', 
        amount: 4599.00, 
        status: 'pending', 
        createdAt: '2025-09-11T09:15:00Z' 
      }
    ];
    
    let filteredOrders = orders;
    
    // 过滤条件
    if (status) {
      filteredOrders = filteredOrders.filter(order => order.status === status);
    }
    if (userId) {
      filteredOrders = filteredOrders.filter(order => order.userId === userId);
    }
    
    ctx.body = {
      success: true,
      data: {
        orders: filteredOrders.slice((page - 1) * limit, page * limit),
        pagination: {
          page,
          limit,
          total: filteredOrders.length,
          pages: Math.ceil(filteredOrders.length / limit)
        },
        filters: { status, userId }
      },
      timestamp: new Date().toISOString()
    };
  }

  /**
   * GET /api/orders/:id - 获取单个订单
   */
  @ApiOperation({ summary: '获取订单详情', description: '根据订单ID获取详细信息' })
  @ApiParam({ name: 'id', description: '订单ID', example: 1001 })
  @ApiResponse({ status: 200, description: '成功获取订单详情' })
  @ApiResponse({ status: 404, description: '订单不存在' })
  @Get('/:id')
  async getOrder(ctx: Context) {
    const id = Number(ctx.params.id);
    
    const orders = [
      { 
        id: 1001, 
        userId: 1, 
        productName: 'MacBook Pro', 
        amount: 12999.00, 
        status: 'paid', 
        createdAt: '2025-09-10T10:00:00Z',
        shippingAddress: '北京市朝阳区xxx街道',
        paymentMethod: 'credit_card'
      }
    ];
    
    const order = orders.find(o => o.id === id);
    
    if (!order) {
      ctx.status = 404;
      ctx.body = {
        success: false,
        message: '订单不存在',
        data: null,
        timestamp: new Date().toISOString()
      };
      return;
    }
    
    ctx.body = {
      success: true,
      data: order,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * POST /api/orders - 创建订单
   */
  @ApiOperation({ summary: '创建订单', description: '创建新的订单' })
  @ApiBody({
    description: '订单信息',
    required: true,
    schema: {
      type: 'object',
      properties: {
        userId: { type: 'number', example: 1, description: '用户ID' },
        productName: { type: 'string', example: 'iPhone 15', description: '商品名称' },
        amount: { type: 'number', example: 8999.00, description: '订单金额' },
        quantity: { type: 'number', example: 1, description: '商品数量' },
        shippingAddress: { type: 'string', example: '上海市浦东新区xxx路', description: '配送地址' }
      },
      required: ['userId', 'productName', 'amount', 'shippingAddress']
    }
  })
  @ApiResponse({ status: 201, description: '订单创建成功' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  @Post('/')
  async createOrder(ctx: Context) {
    const body = ctx.request.body as any;
    const { userId, productName, amount, quantity = 1, shippingAddress } = body;
    
    if (!userId || !productName || !amount || !shippingAddress) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        message: '用户ID、商品名称、金额和配送地址为必填项',
        data: null,
        timestamp: new Date().toISOString()
      };
      return;
    }
    
    const newOrder = {
      id: Date.now(),
      userId,
      productName,
      amount,
      quantity,
      shippingAddress,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    
    ctx.status = 201;
    ctx.body = {
      success: true,
      message: '订单创建成功',
      data: newOrder,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * PUT /api/orders/:id/status - 更新订单状态
   */
  @ApiOperation({ summary: '更新订单状态', description: '更新指定订单的状态' })
  @ApiParam({ name: 'id', description: '订单ID', example: 1001 })
  @ApiBody({
    description: '新的订单状态',
    required: true,
    schema: {
      type: 'object',
      properties: {
        status: { 
          type: 'string', 
          enum: ['pending', 'paid', 'shipped', 'delivered', 'cancelled'],
          example: 'paid',
          description: '订单状态'
        },
        note: { type: 'string', example: '支付完成', description: '状态更新备注' }
      },
      required: ['status']
    }
  })
  @ApiResponse({ status: 200, description: '订单状态更新成功' })
  @ApiResponse({ status: 404, description: '订单不存在' })
  @ApiResponse({ status: 400, description: '状态值无效' })
  @Put('/:id/status')
  async updateOrderStatus(ctx: Context) {
    const id = Number(ctx.params.id);
    const body = ctx.request.body as any;
    const { status, note } = body;
    
    const validStatuses = ['pending', 'paid', 'shipped', 'delivered', 'cancelled'];
    
    if (!validStatuses.includes(status)) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        message: '无效的订单状态',
        data: { validStatuses },
        timestamp: new Date().toISOString()
      };
      return;
    }
    
    ctx.body = {
      success: true,
      message: '订单状态更新成功',
      data: { 
        id, 
        status, 
        note,
        updatedAt: new Date().toISOString() 
      },
      timestamp: new Date().toISOString()
    };
  }

  /**
   * GET /api/orders/stats - 获取订单统计
   */
  @ApiOperation({ summary: '订单统计', description: '获取订单状态统计信息' })
  @ApiQuery({ name: 'startDate', required: false, description: '开始日期', example: '2025-09-01' })
  @ApiQuery({ name: 'endDate', required: false, description: '结束日期', example: '2025-09-30' })
  @ApiResponse({ status: 200, description: '成功获取订单统计' })
  @Get('/stats')
  async getOrderStats(ctx: Context) {
    const { startDate, endDate } = ctx.query;
    
    const stats = {
      total: 156,
      pending: 23,
      paid: 89,
      shipped: 31,
      delivered: 12,
      cancelled: 1,
      totalRevenue: 234567.89,
      averageOrderValue: 1503.69,
      period: { startDate: startDate || '2025-09-01', endDate: endDate || '2025-09-30' }
    };
    
    ctx.body = {
      success: true,
      data: stats,
      timestamp: new Date().toISOString()
    };
  }
}
