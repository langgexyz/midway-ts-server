import { Controller, Get, Head } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@midwayjs/swagger';

@ApiTags('系统API')
@Controller('/api')
export class ApiController {
  
  /**
   * GET /api/health - 健康检查
   */
  @ApiOperation({ summary: '健康检查', description: '检查服务健康状态' })
  @ApiResponse({ status: 200, description: '服务健康' })
  @Get('/health')
  async health(ctx: Context) {
    ctx.body = {
      success: true,
      data: {
        status: 'healthy',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        services: {
          database: 'connected',
          cache: 'connected',
          gateway: 'available'
        }
      }
    };
  }

  /**
   * HEAD /api/status - 状态检查
   */
  @ApiOperation({ summary: '状态检查', description: 'HEAD方法状态检查' })
  @ApiResponse({ status: 200, description: 'OK' })
  @Head('/status')
  async status(ctx: Context) {
    ctx.status = 200;
    ctx.set('X-Status', 'OK');
    ctx.set('X-Timestamp', new Date().toISOString());
  }

  /**
   * GET /api/search - 全局搜索
   */
  @ApiOperation({ summary: '全局搜索', description: '跨模块搜索用户、订单、文章等' })
  @ApiQuery({ name: 'q', required: true, description: '搜索关键词', example: 'iPhone' })
  @ApiQuery({ 
    name: 'type', 
    required: false, 
    description: '搜索类型',
    schema: {
      enum: ['user', 'order', 'post', 'all'],
      type: 'string'
    },
    example: 'all'
  })
  @ApiQuery({ 
    name: 'sort', 
    required: false, 
    description: '排序方式',
    schema: {
      enum: ['relevance', 'date', 'name', 'amount'],
      type: 'string'
    },
    example: 'relevance'
  })
  @ApiQuery({ 
    name: 'order', 
    required: false, 
    description: '排序顺序',
    schema: {
      enum: ['asc', 'desc'],
      type: 'string'
    },
    example: 'desc'
  })
  @ApiQuery({ name: 'page', required: false, description: '页码', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: '每页数量', example: 10 })
  @ApiResponse({ status: 200, description: '搜索成功' })
  @ApiResponse({ status: 400, description: '搜索关键词不能为空' })
  @Get('/search')
  async search(ctx: Context) {
    const { q, type = 'all', sort = 'relevance', order = 'desc', page = 1, limit = 10 } = ctx.query;
    
    if (!q) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        message: '搜索关键词不能为空',
        data: null,
        timestamp: new Date().toISOString()
      };
      return;
    }
    
    // 模拟跨模块搜索结果
    const searchResults = {
      users: [
        { id: 1, name: '张三', email: 'zhangsan@example.com', relevance: 0.95 },
        { id: 2, name: '李四', email: 'lisi@example.com', relevance: 0.78 }
      ],
      orders: [
        { id: 1001, productName: 'MacBook Pro', amount: 12999.00, relevance: 0.89 },
        { id: 1002, productName: 'iPhone 15', amount: 8999.00, relevance: 0.92 }
      ],
      posts: [
        { id: 1, title: 'Gateway架构设计', category: 'tech', relevance: 0.84 },
        { id: 2, title: 'MidwayJS实践', category: 'tech', relevance: 0.76 }
      ]
    };
    
    let results;
    if (type === 'user') {
      results = searchResults.users.map(u => ({ ...u, type: 'user' }));
    } else if (type === 'order') {
      results = searchResults.orders.map(o => ({ ...o, type: 'order' }));
    } else if (type === 'post') {
      results = searchResults.posts.map(p => ({ ...p, type: 'post' }));
    } else {
      results = [
        ...searchResults.users.map(u => ({ ...u, type: 'user' })),
        ...searchResults.orders.map(o => ({ ...o, type: 'order' })),
        ...searchResults.posts.map(p => ({ ...p, type: 'post' }))
      ];
    }
    
    // 简单排序
    if (sort === 'relevance') {
      results.sort((a, b) => order === 'desc' ? b.relevance - a.relevance : a.relevance - b.relevance);
    }
    
    ctx.body = {
      success: true,
      data: {
        query: q,
        type,
        sort,
        order,
        results: results.slice((Number(page) - 1) * Number(limit), Number(page) * Number(limit)),
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: results.length,
          pages: Math.ceil(results.length / Number(limit))
        }
      },
      timestamp: new Date().toISOString()
    };
  }
}