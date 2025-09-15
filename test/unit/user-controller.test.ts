/**
 * 用户Controller单元测试
 * 测试用户管理相关的所有API端点
 */

import { UserController } from '../../src/controller/user.controller';
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

describe('UserController Unit Tests', () => {
  let controller: UserController;
  let mockContext: Context;

  beforeEach(() => {
    controller = new UserController();
    mockContext = createMockContext();
  });

  describe('GET /api/users - 获取用户列表', () => {
    it('should return user list with default pagination', async () => {
      await controller.getUsers(mockContext);

      expect(mockContext.body).toHaveProperty('success', true);
      expect(mockContext.body).toHaveProperty('data');
      expect(mockContext.body.data).toHaveProperty('users');
      expect(mockContext.body.data).toHaveProperty('pagination');
      expect(mockContext.body.data.users).toHaveLength(3);
      expect(mockContext.body.data.pagination).toEqual({
        page: 1,
        limit: 10,
        total: 3,
        pages: 1
      });
    });

    it('should handle custom pagination parameters', async () => {
      mockContext.query = { page: '2', limit: '1' };
      await controller.getUsers(mockContext);

      expect(mockContext.body.data.pagination).toEqual({
        page: 2,
        limit: 1,
        total: 3,
        pages: 3
      });
      expect(mockContext.body.data.users).toHaveLength(1);
    });

    it('should handle invalid pagination parameters', async () => {
      mockContext.query = { page: 'invalid', limit: 'abc' };
      await controller.getUsers(mockContext);

      expect(mockContext.body.data.pagination).toEqual({
        page: 1,
        limit: 10,
        total: 3,
        pages: 1
      });
    });

    it('should include timestamp in response', async () => {
      await controller.getUsers(mockContext);

      expect(mockContext.body).toHaveProperty('timestamp');
      expect(new Date(mockContext.body.timestamp)).toBeInstanceOf(Date);
    });
  });

  describe('GET /api/users/:id - 获取单个用户', () => {
    it('should return user when found', async () => {
      mockContext.params = { id: '1' };
      await controller.getUser(mockContext);

      expect(mockContext.body).toHaveProperty('success', true);
      expect(mockContext.body.data).toEqual({
        id: 1,
        name: '张三',
        email: 'zhangsan@example.com',
        age: 25
      });
    });

    it('should return 404 when user not found', async () => {
      mockContext.params = { id: '999' };
      await controller.getUser(mockContext);

      expect(mockContext.status).toBe(404);
      expect(mockContext.body).toHaveProperty('success', false);
      expect(mockContext.body).toHaveProperty('message', '用户不存在');
      expect(mockContext.body.data).toBeNull();
    });

    it('should handle invalid user ID', async () => {
      mockContext.params = { id: 'invalid' };
      await controller.getUser(mockContext);

      expect(mockContext.status).toBe(404);
      expect(mockContext.body).toHaveProperty('success', false);
    });

    it('should handle all existing users', async () => {
      const userIds = ['1', '2', '3'];
      
      for (const id of userIds) {
        mockContext.params = { id };
        await controller.getUser(mockContext);
        
        expect(mockContext.body).toHaveProperty('success', true);
        expect(mockContext.body.data).toHaveProperty('id', Number(id));
      }
    });
  });

  describe('POST /api/users - 创建用户', () => {
    it('should create user with valid data', async () => {
      const userData = {
        name: '新用户',
        email: 'newuser@example.com',
        age: 25,
        tags: ['新用户'],
        permissions: ['read', 'write']
      };
      mockContext.request.body = userData;

      await controller.createUser(mockContext);

      expect(mockContext.status).toBe(201);
      expect(mockContext.body).toHaveProperty('success', true);
      expect(mockContext.body).toHaveProperty('message', '用户创建成功');
      expect(mockContext.body.data).toMatchObject({
        name: userData.name,
        email: userData.email,
        age: userData.age,
        tags: userData.tags,
        permissions: userData.permissions
      });
      expect(mockContext.body.data).toHaveProperty('id');
      expect(mockContext.body.data).toHaveProperty('createdAt');
    });

    it('should create user with minimal required data', async () => {
      const userData = {
        name: '最小用户',
        email: 'minimal@example.com'
      };
      mockContext.request.body = userData;

      await controller.createUser(mockContext);

      expect(mockContext.status).toBe(201);
      expect(mockContext.body.data).toMatchObject({
        name: userData.name,
        email: userData.email,
        age: 18, // 默认年龄
        tags: [], // 默认空数组
        permissions: ['read'] // 默认权限
      });
    });

    it('should return 400 when name is missing', async () => {
      const userData = {
        email: 'no-name@example.com'
      };
      mockContext.request.body = userData;

      await controller.createUser(mockContext);

      expect(mockContext.status).toBe(400);
      expect(mockContext.body).toHaveProperty('success', false);
      expect(mockContext.body).toHaveProperty('message', '姓名和邮箱为必填项');
    });

    it('should return 400 when email is missing', async () => {
      const userData = {
        name: '无邮箱用户'
      };
      mockContext.request.body = userData;

      await controller.createUser(mockContext);

      expect(mockContext.status).toBe(400);
      expect(mockContext.body).toHaveProperty('success', false);
      expect(mockContext.body).toHaveProperty('message', '姓名和邮箱为必填项');
    });

    it('should return 400 when both name and email are missing', async () => {
      mockContext.request.body = {};

      await controller.createUser(mockContext);

      expect(mockContext.status).toBe(400);
      expect(mockContext.body).toHaveProperty('success', false);
    });

    it('should handle empty request body', async () => {
      mockContext.request.body = {};

      await controller.createUser(mockContext);

      expect(mockContext.status).toBe(400);
      expect(mockContext.body).toHaveProperty('success', false);
    });

    it('should handle special characters in user data', async () => {
      const userData = {
        name: '用户@#$%^&*()',
        email: 'special+chars@example.com',
        age: 30,
        tags: ['标签1', '标签2', '标签3'],
        permissions: ['read', 'write', 'admin']
      };
      mockContext.request.body = userData;

      await controller.createUser(mockContext);

      expect(mockContext.status).toBe(201);
      expect(mockContext.body.data).toMatchObject(userData);
    });
  });

  describe('PUT /api/users/:id - 更新用户', () => {
    it('should update user with valid data', async () => {
      const userId = 123;
      const updateData = {
        name: '更新后的姓名',
        email: 'updated@example.com',
        age: 30,
        tags: ['更新用户'],
        permissions: ['read', 'write']
      };
      mockContext.params = { id: userId.toString() };
      mockContext.request.body = updateData;

      await controller.updateUser(mockContext);

      expect(mockContext.body).toHaveProperty('success', true);
      expect(mockContext.body).toHaveProperty('message', '用户更新成功');
      expect(mockContext.body.data).toMatchObject({
        id: userId,
        ...updateData
      });
      expect(mockContext.body.data).toHaveProperty('updatedAt');
    });

    it('should handle partial update data', async () => {
      const userId = 456;
      const updateData = {
        name: '只更新姓名'
      };
      mockContext.params = { id: userId.toString() };
      mockContext.request.body = updateData;

      await controller.updateUser(mockContext);

      expect(mockContext.body.data).toMatchObject({
        id: userId,
        name: updateData.name,
        email: undefined,
        age: undefined,
        tags: [],
        permissions: ['read']
      });
    });

    it('should handle empty update data', async () => {
      const userId = 789;
      mockContext.params = { id: userId.toString() };
      mockContext.request.body = {};

      await controller.updateUser(mockContext);

      expect(mockContext.body.data).toMatchObject({
        id: userId,
        name: undefined,
        email: undefined,
        age: undefined,
        tags: [],
        permissions: ['read']
      });
    });

    it('should handle different user IDs', async () => {
      const userIds = ['1', '999', '0', '1000'];
      
      for (const id of userIds) {
        mockContext.params = { id };
        mockContext.request.body = { name: `用户${id}` };
        
        await controller.updateUser(mockContext);
        
        expect(mockContext.body.data.id).toBe(Number(id));
        expect(mockContext.body.data.name).toBe(`用户${id}`);
      }
    });
  });

  describe('DELETE /api/users/:id - 删除用户', () => {
    it('should delete user successfully', async () => {
      const userId = 123;
      mockContext.params = { id: userId.toString() };

      await controller.deleteUser(mockContext);

      expect(mockContext.body).toHaveProperty('success', true);
      expect(mockContext.body).toHaveProperty('message', '用户删除成功');
      expect(mockContext.body.data).toMatchObject({
        id: userId
      });
      expect(mockContext.body.data).toHaveProperty('deletedAt');
    });

    it('should handle different user IDs for deletion', async () => {
      const userIds = ['1', '999', '0', '1000'];
      
      for (const id of userIds) {
        mockContext.params = { id };
        
        await controller.deleteUser(mockContext);
        
        expect(mockContext.body.data.id).toBe(Number(id));
        expect(mockContext.body.data).toHaveProperty('deletedAt');
      }
    });

    it('should handle invalid user ID format', async () => {
      mockContext.params = { id: 'invalid' };

      await controller.deleteUser(mockContext);

      expect(mockContext.body.data.id).toBeNaN();
      expect(mockContext.body.data).toHaveProperty('deletedAt');
    });
  });

  describe('PATCH /api/users/:id - 部分更新用户', () => {
    it('should patch user with valid data', async () => {
      const userId = 123;
      const patchData = {
        name: '新姓名',
        email: 'patched@example.com',
        age: 27,
        tags: ['部分更新'],
        permissions: ['admin']
      };
      mockContext.params = { id: userId.toString() };
      mockContext.request.body = patchData;

      await controller.patchUser(mockContext);

      expect(mockContext.body).toHaveProperty('success', true);
      expect(mockContext.body).toHaveProperty('message', '用户部分更新成功');
      expect(mockContext.body.data).toMatchObject({
        id: userId,
        ...patchData
      });
      expect(mockContext.body.data).toHaveProperty('updatedAt');
    });

    it('should handle partial patch data', async () => {
      const userId = 456;
      const patchData = {
        name: '只更新姓名'
      };
      mockContext.params = { id: userId.toString() };
      mockContext.request.body = patchData;

      await controller.patchUser(mockContext);

      expect(mockContext.body.data).toMatchObject({
        id: userId,
        name: patchData.name
      });
      expect(mockContext.body.data).not.toHaveProperty('email');
      expect(mockContext.body.data).not.toHaveProperty('age');
    });

    it('should handle empty patch data', async () => {
      const userId = 789;
      mockContext.params = { id: userId.toString() };
      mockContext.request.body = {};

      await controller.patchUser(mockContext);

      expect(mockContext.body.data).toMatchObject({
        id: userId
      });
      expect(mockContext.body.data).not.toHaveProperty('name');
      expect(mockContext.body.data).not.toHaveProperty('email');
    });

    it('should handle falsy values in patch data', async () => {
      const userId = 999;
      const patchData = {
        name: '',
        email: null,
        age: 0,
        tags: [],
        permissions: null
      };
      mockContext.params = { id: userId.toString() };
      mockContext.request.body = patchData;

      await controller.patchUser(mockContext);

      expect(mockContext.body.data).toMatchObject({
        id: userId,
        name: '',
        age: 0,
        tags: []
      });
      expect(mockContext.body.data).not.toHaveProperty('email');
      expect(mockContext.body.data).not.toHaveProperty('permissions');
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle very large user ID', async () => {
      const largeId = '999999999999999';
      mockContext.params = { id: largeId };

      await controller.getUser(mockContext);

      expect(mockContext.status).toBe(404);
      expect(mockContext.body).toHaveProperty('success', false);
    });

    it('should handle negative user ID', async () => {
      mockContext.params = { id: '-1' };

      await controller.getUser(mockContext);

      expect(mockContext.status).toBe(404);
      expect(mockContext.body).toHaveProperty('success', false);
    });

    it('should handle very large pagination values', async () => {
      mockContext.query = { page: '999999', limit: '999999' };
      await controller.getUsers(mockContext);

      expect(mockContext.body.data.users).toHaveLength(0);
      expect(mockContext.body.data.pagination.page).toBe(999999);
    });

    it('should handle zero pagination values', async () => {
      mockContext.query = { page: '0', limit: '0' };
      await controller.getUsers(mockContext);

      expect(mockContext.body.data.users).toHaveLength(0);
      expect(mockContext.body.data.pagination.page).toBe(0);
    });

    it('should handle null and undefined values in create user', async () => {
      const userData = {
        name: null,
        email: undefined,
        age: null,
        tags: null,
        permissions: undefined
      };
      mockContext.request.body = userData;

      await controller.createUser(mockContext);

      expect(mockContext.status).toBe(400);
      expect(mockContext.body).toHaveProperty('success', false);
    });
  });

  describe('Response Format Validation', () => {
    it('should have consistent response format for all endpoints', async () => {
      const endpoints = [
        () => controller.getUsers(mockContext),
        () => controller.getUser({ ...mockContext, params: { id: '1' } }),
        () => controller.createUser({ ...mockContext, request: { body: { name: 'Test', email: 'test@example.com' } } as any }),
        () => controller.updateUser({ ...mockContext, params: { id: '1' }, request: { body: { name: 'Updated' } } as any }),
        () => controller.deleteUser({ ...mockContext, params: { id: '1' } }),
        () => controller.patchUser({ ...mockContext, params: { id: '1' }, request: { body: { name: 'Patched' } } as any })
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
      await controller.getUsers(mockContext);
      expect(mockContext.status).toBe(200);

      await controller.createUser({ ...mockContext, request: { body: { name: 'Test', email: 'test@example.com' } } as any });
      expect(mockContext.status).toBe(201);

      // Error cases
      await controller.getUser({ ...mockContext, params: { id: '999' } });
      expect(mockContext.status).toBe(404);

      await controller.createUser({ ...mockContext, request: { body: {} } as any });
      expect(mockContext.status).toBe(400);
    });
  });
});
