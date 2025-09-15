import { Controller, Get, Post, Put, Del, Patch } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBody } from '@midwayjs/swagger';
import { CreateUserRequest, UpdateUserRequest, PatchUserRequest, UserInfo } from '../dto/user.dto';

@ApiTags('用户管理')
@Controller('/api/users')
export class UserController {
  
  /**
   * GET /api/users - 获取用户列表
   */
  @ApiOperation({ summary: '获取用户列表', description: '返回所有用户信息' })
  @ApiQuery({ name: 'page', required: false, description: '页码', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: '每页数量', example: 10 })
  @ApiResponse({ status: 200, description: '成功获取用户列表' })
  @Get('/')
  async getUsers(ctx: Context) {
    const page = Number(ctx.query.page) || 1;
    const limit = Number(ctx.query.limit) || 10;
    
    const users = [
      { id: 1, name: '张三', email: 'zhangsan@example.com', age: 25 },
      { id: 2, name: '李四', email: 'lisi@example.com', age: 30 },
      { id: 3, name: '王五', email: 'wangwu@example.com', age: 28 }
    ];
    
    ctx.body = {
      success: true,
      data: {
        users: users.slice((page - 1) * limit, page * limit),
        pagination: {
          page,
          limit,
          total: users.length,
          pages: Math.ceil(users.length / limit)
        }
      },
      timestamp: new Date().toISOString()
    };
  }

  /**
   * GET /api/users/:id - 获取单个用户
   */
  @ApiOperation({ summary: '获取单个用户', description: '根据ID获取用户信息' })
  @ApiParam({ name: 'id', description: '用户ID', example: 1 })
  @ApiResponse({ status: 200, description: '成功获取用户信息' })
  @ApiResponse({ status: 404, description: '用户不存在' })
  @Get('/:id')
  async getUser(ctx: Context) {
    const id = Number(ctx.params.id);
    
    const users = [
      { id: 1, name: '张三', email: 'zhangsan@example.com', age: 25 },
      { id: 2, name: '李四', email: 'lisi@example.com', age: 30 },
      { id: 3, name: '王五', email: 'wangwu@example.com', age: 28 }
    ];
    
    const user = users.find(u => u.id === id);
    
    if (!user) {
      ctx.status = 404;
      ctx.body = {
        success: false,
        message: '用户不存在',
        data: null,
        timestamp: new Date().toISOString()
      };
      return;
    }
    
    ctx.body = {
      success: true,
      data: user,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * POST /api/users - 创建用户
   */
  @ApiOperation({ summary: '创建用户', description: '创建新用户' })
  @ApiBody({ type: CreateUserRequest })
  @ApiResponse({ status: 201, description: '用户创建成功' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  @Post('/')
  async createUser(ctx: Context) {
    const body = ctx.request.body as CreateUserRequest;
    const { name, email, age, tags, permissions } = body;
    
    if (!name || !email) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        message: '姓名和邮箱为必填项',
        data: null,
        timestamp: new Date().toISOString()
      };
      return;
    }
    
    const newUser: UserInfo = {
      id: Date.now(),
      name,
      email,
      age: age || 18,
      tags: tags || [],
      permissions: permissions || ['read'],
      createdAt: new Date().toISOString()
    };
    
    ctx.status = 201;
    ctx.body = {
      success: true,
      message: '用户创建成功',
      data: newUser,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * PUT /api/users/:id - 更新用户
   */
  @ApiOperation({ summary: '更新用户', description: '更新指定用户信息' })
  @ApiParam({ name: 'id', description: '用户ID', example: 1 })
  @ApiBody({ type: UpdateUserRequest })
  @ApiResponse({ status: 200, description: '用户更新成功' })
  @ApiResponse({ status: 404, description: '用户不存在' })
  @Put('/:id')
  async updateUser(ctx: Context) {
    const id = Number(ctx.params.id);
    const body = ctx.request.body as UpdateUserRequest;
    const { name, email, age, tags, permissions } = body;
    
    ctx.body = {
      success: true,
      message: '用户更新成功',
      data: { 
        id, 
        name, 
        email, 
        age, 
        tags: tags || [], 
        permissions: permissions || ['read'],
        updatedAt: new Date().toISOString() 
      },
      timestamp: new Date().toISOString()
    };
  }

  /**
   * DELETE /api/users/:id - 删除用户
   */
  @ApiOperation({ summary: '删除用户', description: '删除指定用户' })
  @ApiParam({ name: 'id', description: '用户ID', example: 1 })
  @ApiResponse({ status: 200, description: '用户删除成功' })
  @ApiResponse({ status: 404, description: '用户不存在' })
  @Del('/:id')
  async deleteUser(ctx: Context) {
    const id = Number(ctx.params.id);
    
    ctx.body = {
      success: true,
      message: '用户删除成功',
      data: { id, deletedAt: new Date().toISOString() },
      timestamp: new Date().toISOString()
    };
  }

  /**
   * PATCH /api/users/:id - 部分更新用户
   */
  @ApiOperation({ summary: '部分更新用户', description: '部分更新用户信息' })
  @ApiParam({ name: 'id', description: '用户ID', example: 1 })
  @ApiBody({ type: PatchUserRequest })
  @ApiResponse({ status: 200, description: '用户部分更新成功' })
  @Patch('/:id')
  async patchUser(ctx: Context) {
    const id = Number(ctx.params.id);
    const updates = ctx.request.body as PatchUserRequest;
    const { name, email, age, tags, permissions } = updates;
    
    ctx.body = {
      success: true,
      message: '用户部分更新成功',
      data: { 
        id, 
        ...(name && { name }),
        ...(email && { email }),
        ...(age && { age }),
        ...(tags && { tags }),
        ...(permissions && { permissions }),
        updatedAt: new Date().toISOString() 
      },
      timestamp: new Date().toISOString()
    };
  }
}
