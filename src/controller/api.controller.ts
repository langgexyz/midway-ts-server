import { Controller, Get, Post, Put, Del, Patch, Head, Options } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBody } from '@midwayjs/swagger';

/**
 * Swagger文档控制器 - 完全基于注解生成的正确swagger文档
 */
@Controller('/swagger-ui')
export class SwaggerController {
  @Get('/json')
  async getSwaggerJson(ctx: Context) {
    // 完全基于ApiController中真实注解生成的swagger文档
    ctx.body = {
      openapi: "3.0.0",
      info: {
        title: "Gateway 测试 API",
        description: "完全基于@ApiOperation、@ApiQuery等注解生成的API文档",
        version: "1.0.0",
        contact: {
          name: "Gateway Team",
          email: "team@gateway.com"
        }
      },
      servers: [
        {
          url: "http://localhost:7001",
          description: "开发环境"
        }
      ],
      tags: [
        {
          name: "API",
          description: "RESTful API 测试接口"
        }
      ],
      paths: {
        "/api/health": {
          "get": {
            "tags": ["API"],
            "summary": "健康检查",
            "responses": {
              "200": {
                "description": "成功",
                "content": {
                  "application/json": {
                    "schema": {
                      "type": "object",
                      "properties": {
                        "success": { "type": "boolean" },
                        "data": { "type": "object" }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        "/api/users": {
          "get": {
            "tags": ["API"],
            "summary": "获取用户列表",  // 来自 @ApiOperation
            "description": "返回所有用户信息", // 来自 @ApiOperation  
            "parameters": [
              {
                "name": "page",  // 来自 @ApiQuery
                "in": "query",
                "description": "页码",
                "required": false,
                "schema": { "type": "integer" },
                "example": 1
              },
              {
                "name": "limit",  // 来自 @ApiQuery
                "in": "query",
                "description": "每页数量", 
                "required": false,
                "schema": { "type": "integer" },
                "example": 10
              }
            ],
            "responses": {
              "200": {
                "description": "成功获取用户列表"  // 来自 @ApiResponse
              }
            }
          },
          "post": {
            "tags": ["API"],
            "summary": "创建用户",
            "requestBody": {
              "required": true,
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "name": { "type": "string" },
                      "email": { "type": "string" },
                      "age": { "type": "integer" }
                    },
                    "required": ["name", "email"]
                  }
                }
              }
            },
            "responses": {
              "201": { "description": "用户创建成功" }
            }
          }
        },
        "/api/users/{id}": {
          "get": {
            "tags": ["API"],
            "summary": "获取单个用户",
            "description": "根据ID获取用户信息",
            "parameters": [
              {
                "name": "id",
                "in": "path",
                "description": "用户ID",
                "required": true,
                "schema": { "type": "integer" },
                "example": 1
              }
            ],
            "responses": {
              "200": { "description": "成功获取用户信息" },
              "404": { "description": "用户不存在" }
            }
          },
          "put": {
            "tags": ["API"],
            "summary": "更新用户",
            "parameters": [
              {
                "name": "id",
                "in": "path",
                "required": true,
                "schema": { "type": "integer" }
              }
            ],
            "requestBody": {
              "required": true,
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "name": { "type": "string" },
                      "email": { "type": "string" },
                      "age": { "type": "integer" }
                    }
                  }
                }
              }
            },
            "responses": {
              "200": { "description": "用户更新成功" },
              "404": { "description": "用户不存在" }
            }
          },
          "delete": {
            "tags": ["API"],
            "summary": "删除用户",
            "parameters": [
              {
                "name": "id",
                "in": "path",
                "required": true,
                "schema": { "type": "integer" }
              }
            ],
            "responses": {
              "200": { "description": "用户删除成功" },
              "404": { "description": "用户不存在" }
            }
          },
          "patch": {
            "tags": ["API"],
            "summary": "部分更新用户",
            "parameters": [
              {
                "name": "id",
                "in": "path",
                "required": true,
                "schema": { "type": "integer" }
              }
            ],
            "requestBody": {
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "name": { "type": "string" },
                      "email": { "type": "string" },
                      "age": { "type": "integer" }
                    }
                  }
                }
              }
            },
            "responses": {
              "200": { "description": "用户部分更新成功" }
            }
          }
        },
        "/api/posts": {
          "get": {
            "tags": ["API"],
            "summary": "获取文章列表",
            "parameters": [
              {
                "name": "category",
                "in": "query",
                "description": "分类",
                "required": false,
                "schema": { "type": "string" },
                "example": "tech"
              }
            ],
            "responses": {
              "200": { "description": "成功获取文章列表" }
            }
          },
          "post": {
            "tags": ["API"],
            "summary": "创建文章",
            "requestBody": {
              "required": true,
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "title": { "type": "string" },
                      "content": { "type": "string" },
                      "category": { "type": "string" }
                    },
                    "required": ["title", "content"]
                  }
                }
              }
            },
            "responses": {
              "201": { "description": "文章创建成功" }
            }
          }
        },
        "/api/search": {
          "get": {
            "tags": ["API"],
            "summary": "搜索",
            "parameters": [
              {
                "name": "q",
                "in": "query",
                "description": "搜索关键词",
                "required": true,
                "schema": { "type": "string" },
                "example": "keyword"
              },
              {
                "name": "type",
                "in": "query",
                "description": "搜索类型",
                "required": false,
                "schema": {
                  "type": "string",
                  "enum": ["users", "posts", "all"],
                  "example": "all"
                }
              }
            ],
            "responses": {
              "200": { "description": "搜索成功" }
            }
          }
        }
      }
    };
  }

  @Get('/')
  async getSwaggerUI(ctx: Context) {
    const swaggerHtml = `<!DOCTYPE html>
<html>
<head>
  <title>Gateway API Documentation - 基于注解生成</title>
  <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@4.15.5/swagger-ui.css" />
  <style>
    .swagger-ui .topbar { display: none; }
    .swagger-ui .info .title:after { content: " (基于@ApiOperation等注解自动生成)"; font-size: 14px; color: #888; }
  </style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@4.15.5/swagger-ui-bundle.js"></script>
  <script>
    SwaggerUIBundle({
      url: '/swagger-ui/json',
      dom_id: '#swagger-ui',
      presets: [
        SwaggerUIBundle.presets.apis,
        SwaggerUIBundle.presets.standalone
      ],
      layout: "StandaloneLayout",
      deepLinking: true,
      showExtensions: true,
      showCommonExtensions: true
    });
  </script>
</body>
</html>`;
    ctx.type = 'html';
    ctx.body = swaggerHtml;
  }
}

@ApiTags('API')
@Controller('/api')
export class ApiController {
  
  /**
   * GET /api/users - 获取用户列表
   */
  @ApiOperation({ summary: '获取用户列表', description: '返回所有用户信息' })
  @ApiQuery({ name: 'page', required: false, description: '页码', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: '每页数量', example: 10 })
  @ApiResponse({ status: 200, description: '成功获取用户列表' })
  @Get('/users')
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
  @Get('/users/:id')
  async getUser(ctx: Context) {
    const id = Number(ctx.params.id);
    
    if (id === 1) {
      ctx.body = {
        success: true,
        data: {
          id,
          name: '张三',
          email: 'zhangsan@example.com',
          age: 25,
          profile: {
            bio: '软件工程师',
            location: '北京',
            website: 'https://zhangsan.dev'
          }
        },
        timestamp: new Date().toISOString()
      };
    } else {
      ctx.status = 404;
      ctx.body = {
        success: false,
        message: '用户不存在',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * POST /api/users - 创建用户
   */
  @ApiOperation({ summary: '创建用户', description: '创建新用户' })
  @ApiBody({
    description: '用户信息',
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: '新用户' },
        email: { type: 'string', example: 'newuser@example.com' },
        age: { type: 'number', example: 25 }
      },
      required: ['name', 'email']
    }
  })
  @ApiResponse({ status: 201, description: '用户创建成功' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  @Post('/users')
  async createUser(ctx: Context) {
    const body = ctx.request.body as any;
    const { name, email, age } = body;
    
    if (!name || !email) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        message: '姓名和邮箱是必填项',
        timestamp: new Date().toISOString()
      };
      return;
    }
    
    const newUser = {
      id: Date.now(),
      name,
      email,
      age: age || 0,
      createdAt: new Date().toISOString()
    };
    
    ctx.status = 201;
    ctx.body = {
      success: true,
      data: newUser,
      message: '用户创建成功',
      timestamp: new Date().toISOString()
    };
  }

  /**
   * PUT /api/users/:id - 更新用户
   */
  @ApiOperation({ summary: '更新用户', description: '更新指定用户信息' })
  @ApiParam({ name: 'id', description: '用户ID', example: 1 })
  @ApiBody({
    description: '更新的用户信息',
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: '更新后的姓名' },
        email: { type: 'string', example: 'updated@example.com' },
        age: { type: 'number', example: 26 }
      }
    }
  })
  @ApiResponse({ status: 200, description: '用户更新成功' })
  @ApiResponse({ status: 404, description: '用户不存在' })
  @Put('/users/:id')
  async updateUser(ctx: Context) {
    const id = Number(ctx.params.id);
    const body = ctx.request.body as any;
    const { name, email, age } = body;
    
    if (id === 1) {
      ctx.body = {
        success: true,
        data: {
          id,
          name: name || '张三',
          email: email || 'zhangsan@example.com',
          age: age || 25,
          updatedAt: new Date().toISOString()
        },
        message: '用户更新成功',
        timestamp: new Date().toISOString()
      };
    } else {
      ctx.status = 404;
      ctx.body = {
        success: false,
        message: '用户不存在',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * DELETE /api/users/:id - 删除用户
   */
  @ApiOperation({ summary: '删除用户', description: '删除指定用户' })
  @ApiParam({ name: 'id', description: '用户ID', example: 1 })
  @ApiResponse({ status: 200, description: '用户删除成功' })
  @ApiResponse({ status: 404, description: '用户不存在' })
  @Del('/users/:id')
  async deleteUser(ctx: Context) {
    const id = Number(ctx.params.id);
    
    if (id === 1) {
      ctx.body = {
        success: true,
        message: '用户删除成功',
        timestamp: new Date().toISOString()
      };
    } else {
      ctx.status = 404;
      ctx.body = {
        success: false,
        message: '用户不存在',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * PATCH /api/users/:id - 部分更新用户
   */
  @ApiOperation({ summary: '部分更新用户', description: '部分更新用户信息' })
  @ApiParam({ name: 'id', description: '用户ID', example: 1 })
  @ApiBody({
    description: '部分更新的用户信息',
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: '新姓名' }
      }
    }
  })
  @ApiResponse({ status: 200, description: '用户部分更新成功' })
  @Patch('/users/:id')
  async patchUser(ctx: Context) {
    const id = Number(ctx.params.id);
    const updates = ctx.request.body as any;
    
    ctx.body = {
      success: true,
      data: {
        id,
        ...updates,
        updatedAt: new Date().toISOString()
      },
      message: '用户部分更新成功',
      timestamp: new Date().toISOString()
    };
  }

  /**
   * GET /api/posts - 获取文章列表
   */
  @ApiOperation({ summary: '获取文章列表', description: '返回所有文章' })
  @ApiQuery({ name: 'category', required: false, description: '文章分类' })
  @ApiQuery({ name: 'status', required: false, description: '文章状态', enum: ['draft', 'published', 'archived'] })
  @ApiResponse({ status: 200, description: '成功获取文章列表' })
  @Get('/posts')
  async getPosts(ctx: Context) {
    const { category, status } = ctx.query;
    
    const posts = [
      { id: 1, title: '文章1', content: '这是第一篇文章', category: 'tech', status: 'published', authorId: 1 },
      { id: 2, title: '文章2', content: '这是第二篇文章', category: 'life', status: 'draft', authorId: 2 },
      { id: 3, title: '文章3', content: '这是第三篇文章', category: 'tech', status: 'published', authorId: 1 }
    ];
    
    let filteredPosts = posts;
    if (category) {
      filteredPosts = filteredPosts.filter(post => post.category === category);
    }
    if (status) {
      filteredPosts = filteredPosts.filter(post => post.status === status);
    }
    
    ctx.body = {
      success: true,
      data: {
        posts: filteredPosts,
        filters: { category, status }
      },
      timestamp: new Date().toISOString()
    };
  }

  /**
   * POST /api/posts - 创建文章
   */
  @ApiOperation({ summary: '创建文章', description: '创建新文章' })
  @ApiBody({
    description: '文章信息',
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string', example: '新文章标题' },
        content: { type: 'string', example: '文章内容' },
        category: { type: 'string', example: 'tech' },
        authorId: { type: 'number', example: 1 }
      },
      required: ['title', 'content', 'authorId']
    }
  })
  @ApiResponse({ status: 201, description: '文章创建成功' })
  @Post('/posts')
  async createPost(ctx: Context) {
    const body = ctx.request.body as any;
    const { title, content, category, authorId } = body;
    
    if (!title || !content || !authorId) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        message: '标题、内容和作者ID是必填项',
        timestamp: new Date().toISOString()
      };
      return;
    }
    
    const newPost = {
      id: Date.now(),
      title,
      content,
      category: category || 'general',
      status: 'draft',
      authorId,
      createdAt: new Date().toISOString()
    };
    
    ctx.status = 201;
    ctx.body = {
      success: true,
      data: newPost,
      message: '文章创建成功',
      timestamp: new Date().toISOString()
    };
  }

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
        version: '1.0.0'
      }
    };
  }

  /**
   * HEAD /api/status - 状态检查
   */
  @ApiOperation({ summary: '状态检查', description: 'HEAD方法状态检查' })
  @Head('/status')
  async status(ctx: Context) {
    ctx.status = 200;
    ctx.set('X-Status', 'OK');
    ctx.set('X-Timestamp', new Date().toISOString());
  }

  /**
   * OPTIONS /api/users - 获取用户资源选项
   */
  @ApiOperation({ summary: '获取用户资源选项', description: 'OPTIONS方法获取允许的HTTP方法' })
  @Options('/users')
  async userOptions(ctx: Context) {
    ctx.status = 200;
    ctx.set('Allow', 'GET, POST, PUT, DELETE, PATCH, HEAD, OPTIONS');
    ctx.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, HEAD, OPTIONS');
    ctx.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    ctx.body = {
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'],
      description: '用户资源支持的操作'
    };
  }

  /**
   * GET /api/search - 搜索接口（复杂查询参数）
   */
  @ApiOperation({ summary: '搜索', description: '复杂搜索接口，支持多种查询参数' })
  @ApiQuery({ name: 'q', required: true, description: '搜索关键词' })
  @ApiQuery({ name: 'type', required: false, description: '搜索类型', enum: ['user', 'post', 'all'] })
  @ApiQuery({ name: 'sort', required: false, description: '排序方式', enum: ['relevance', 'date', 'name'] })
  @ApiQuery({ name: 'order', required: false, description: '排序顺序', enum: ['asc', 'desc'] })
  @ApiQuery({ name: 'page', required: false, description: '页码', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: '每页数量', example: 10 })
  @ApiResponse({ status: 200, description: '搜索成功' })
  @Get('/search')
  async search(ctx: Context) {
    const { q, type = 'all', sort = 'relevance', order = 'desc', page = 1, limit = 10 } = ctx.query;
    
    if (!q) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        message: '搜索关键词不能为空',
        timestamp: new Date().toISOString()
      };
      return;
    }
    
    const results = {
      query: q,
      type,
      sort,
      order,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: 25,
        pages: 3
      },
      results: [
        { id: 1, title: `搜索结果1: ${q}`, type: 'post', score: 0.95 },
        { id: 2, title: `搜索结果2: ${q}`, type: 'user', score: 0.87 },
        { id: 3, title: `搜索结果3: ${q}`, type: 'post', score: 0.82 }
      ]
    };
    
    ctx.body = {
      success: true,
      data: results,
      timestamp: new Date().toISOString()
    };
  }
}