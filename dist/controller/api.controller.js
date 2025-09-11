"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiController = void 0;
const tslib_1 = require("tslib");
const core_1 = require("@midwayjs/core");
const swagger_1 = require("@midwayjs/swagger");
let ApiController = class ApiController {
    /**
     * GET /api/users - 获取用户列表
     */
    async getUsers(ctx) {
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
    async getUser(ctx) {
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
        }
        else {
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
    async createUser(ctx) {
        const body = ctx.request.body;
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
    async updateUser(ctx) {
        const id = Number(ctx.params.id);
        const body = ctx.request.body;
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
        }
        else {
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
    async deleteUser(ctx) {
        const id = Number(ctx.params.id);
        if (id === 1) {
            ctx.body = {
                success: true,
                message: '用户删除成功',
                timestamp: new Date().toISOString()
            };
        }
        else {
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
    async patchUser(ctx) {
        const id = Number(ctx.params.id);
        const updates = ctx.request.body;
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
    async getPosts(ctx) {
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
    async createPost(ctx) {
        const body = ctx.request.body;
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
    async health(ctx) {
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
    async status(ctx) {
        ctx.status = 200;
        ctx.set('X-Status', 'OK');
        ctx.set('X-Timestamp', new Date().toISOString());
    }
    /**
     * OPTIONS /api/users - 获取用户资源选项
     */
    async userOptions(ctx) {
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
    async search(ctx) {
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
};
exports.ApiController = ApiController;
tslib_1.__decorate([
    (0, swagger_1.ApiOperation)({ summary: '获取用户列表', description: '返回所有用户信息' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, description: '页码', example: 1 }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, description: '每页数量', example: 10 }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '成功获取用户列表' }),
    (0, core_1.Get)('/users'),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", Promise)
], ApiController.prototype, "getUsers", null);
tslib_1.__decorate([
    (0, swagger_1.ApiOperation)({ summary: '获取单个用户', description: '根据ID获取用户信息' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: '用户ID', example: 1 }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '成功获取用户信息' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: '用户不存在' }),
    (0, core_1.Get)('/users/:id'),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", Promise)
], ApiController.prototype, "getUser", null);
tslib_1.__decorate([
    (0, swagger_1.ApiOperation)({ summary: '创建用户', description: '创建新用户' }),
    (0, swagger_1.ApiBody)({
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
    }),
    (0, swagger_1.ApiResponse)({ status: 201, description: '用户创建成功' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: '请求参数错误' }),
    (0, core_1.Post)('/users'),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", Promise)
], ApiController.prototype, "createUser", null);
tslib_1.__decorate([
    (0, swagger_1.ApiOperation)({ summary: '更新用户', description: '更新指定用户信息' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: '用户ID', example: 1 }),
    (0, swagger_1.ApiBody)({
        description: '更新的用户信息',
        schema: {
            type: 'object',
            properties: {
                name: { type: 'string', example: '更新后的姓名' },
                email: { type: 'string', example: 'updated@example.com' },
                age: { type: 'number', example: 26 }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '用户更新成功' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: '用户不存在' }),
    (0, core_1.Put)('/users/:id'),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", Promise)
], ApiController.prototype, "updateUser", null);
tslib_1.__decorate([
    (0, swagger_1.ApiOperation)({ summary: '删除用户', description: '删除指定用户' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: '用户ID', example: 1 }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '用户删除成功' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: '用户不存在' }),
    (0, core_1.Del)('/users/:id'),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", Promise)
], ApiController.prototype, "deleteUser", null);
tslib_1.__decorate([
    (0, swagger_1.ApiOperation)({ summary: '部分更新用户', description: '部分更新用户信息' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: '用户ID', example: 1 }),
    (0, swagger_1.ApiBody)({
        description: '部分更新的用户信息',
        schema: {
            type: 'object',
            properties: {
                name: { type: 'string', example: '新姓名' }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '用户部分更新成功' }),
    (0, core_1.Patch)('/users/:id'),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", Promise)
], ApiController.prototype, "patchUser", null);
tslib_1.__decorate([
    (0, swagger_1.ApiOperation)({ summary: '获取文章列表', description: '返回所有文章' }),
    (0, swagger_1.ApiQuery)({ name: 'category', required: false, description: '文章分类' }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false, description: '文章状态', enum: ['draft', 'published', 'archived'] }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '成功获取文章列表' }),
    (0, core_1.Get)('/posts'),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", Promise)
], ApiController.prototype, "getPosts", null);
tslib_1.__decorate([
    (0, swagger_1.ApiOperation)({ summary: '创建文章', description: '创建新文章' }),
    (0, swagger_1.ApiBody)({
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
    }),
    (0, swagger_1.ApiResponse)({ status: 201, description: '文章创建成功' }),
    (0, core_1.Post)('/posts'),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", Promise)
], ApiController.prototype, "createPost", null);
tslib_1.__decorate([
    (0, swagger_1.ApiOperation)({ summary: '健康检查', description: '检查服务健康状态' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '服务健康' }),
    (0, core_1.Get)('/health'),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", Promise)
], ApiController.prototype, "health", null);
tslib_1.__decorate([
    (0, swagger_1.ApiOperation)({ summary: '状态检查', description: 'HEAD方法状态检查' }),
    (0, core_1.Head)('/status'),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", Promise)
], ApiController.prototype, "status", null);
tslib_1.__decorate([
    (0, swagger_1.ApiOperation)({ summary: '获取用户资源选项', description: 'OPTIONS方法获取允许的HTTP方法' }),
    (0, core_1.Options)('/users'),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", Promise)
], ApiController.prototype, "userOptions", null);
tslib_1.__decorate([
    (0, swagger_1.ApiOperation)({ summary: '搜索', description: '复杂搜索接口，支持多种查询参数' }),
    (0, swagger_1.ApiQuery)({ name: 'q', required: true, description: '搜索关键词' }),
    (0, swagger_1.ApiQuery)({ name: 'type', required: false, description: '搜索类型', enum: ['user', 'post', 'all'] }),
    (0, swagger_1.ApiQuery)({ name: 'sort', required: false, description: '排序方式', enum: ['relevance', 'date', 'name'] }),
    (0, swagger_1.ApiQuery)({ name: 'order', required: false, description: '排序顺序', enum: ['asc', 'desc'] }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, description: '页码', example: 1 }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, description: '每页数量', example: 10 }),
    (0, swagger_1.ApiResponse)({ status: 200, description: '搜索成功' }),
    (0, core_1.Get)('/search'),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", Promise)
], ApiController.prototype, "search", null);
exports.ApiController = ApiController = tslib_1.__decorate([
    (0, swagger_1.ApiTags)('API'),
    (0, core_1.Controller)('/api')
], ApiController);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBpLmNvbnRyb2xsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvY29udHJvbGxlci9hcGkuY29udHJvbGxlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O0FBQUEseUNBQXVGO0FBRXZGLCtDQUFvRztBQUk3RixJQUFNLGFBQWEsR0FBbkIsTUFBTSxhQUFhO0lBRXhCOztPQUVHO0lBTUcsQUFBTixLQUFLLENBQUMsUUFBUSxDQUFDLEdBQVk7UUFDekIsTUFBTSxJQUFJLEdBQUcsTUFBTSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3pDLE1BQU0sS0FBSyxHQUFHLE1BQU0sQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUU1QyxNQUFNLEtBQUssR0FBRztZQUNaLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxzQkFBc0IsRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFO1lBQzdELEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxrQkFBa0IsRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFO1lBQ3pELEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxvQkFBb0IsRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFO1NBQzVELENBQUM7UUFFRixHQUFHLENBQUMsSUFBSSxHQUFHO1lBQ1QsT0FBTyxFQUFFLElBQUk7WUFDYixJQUFJLEVBQUU7Z0JBQ0osS0FBSyxFQUFFLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDLEdBQUcsS0FBSyxFQUFFLElBQUksR0FBRyxLQUFLLENBQUM7Z0JBQ3BELFVBQVUsRUFBRTtvQkFDVixJQUFJO29CQUNKLEtBQUs7b0JBQ0wsS0FBSyxFQUFFLEtBQUssQ0FBQyxNQUFNO29CQUNuQixLQUFLLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQztpQkFDdkM7YUFDRjtZQUNELFNBQVMsRUFBRSxJQUFJLElBQUksRUFBRSxDQUFDLFdBQVcsRUFBRTtTQUNwQyxDQUFDO0lBQ0osQ0FBQztJQUVEOztPQUVHO0lBTUcsQUFBTixLQUFLLENBQUMsT0FBTyxDQUFDLEdBQVk7UUFDeEIsTUFBTSxFQUFFLEdBQUcsTUFBTSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUM7UUFFakMsSUFBSSxFQUFFLEtBQUssQ0FBQyxFQUFFLENBQUM7WUFDYixHQUFHLENBQUMsSUFBSSxHQUFHO2dCQUNULE9BQU8sRUFBRSxJQUFJO2dCQUNiLElBQUksRUFBRTtvQkFDSixFQUFFO29CQUNGLElBQUksRUFBRSxJQUFJO29CQUNWLEtBQUssRUFBRSxzQkFBc0I7b0JBQzdCLEdBQUcsRUFBRSxFQUFFO29CQUNQLE9BQU8sRUFBRTt3QkFDUCxHQUFHLEVBQUUsT0FBTzt3QkFDWixRQUFRLEVBQUUsSUFBSTt3QkFDZCxPQUFPLEVBQUUsc0JBQXNCO3FCQUNoQztpQkFDRjtnQkFDRCxTQUFTLEVBQUUsSUFBSSxJQUFJLEVBQUUsQ0FBQyxXQUFXLEVBQUU7YUFDcEMsQ0FBQztRQUNKLENBQUM7YUFBTSxDQUFDO1lBQ04sR0FBRyxDQUFDLE1BQU0sR0FBRyxHQUFHLENBQUM7WUFDakIsR0FBRyxDQUFDLElBQUksR0FBRztnQkFDVCxPQUFPLEVBQUUsS0FBSztnQkFDZCxPQUFPLEVBQUUsT0FBTztnQkFDaEIsU0FBUyxFQUFFLElBQUksSUFBSSxFQUFFLENBQUMsV0FBVyxFQUFFO2FBQ3BDLENBQUM7UUFDSixDQUFDO0lBQ0gsQ0FBQztJQUVEOztPQUVHO0lBaUJHLEFBQU4sS0FBSyxDQUFDLFVBQVUsQ0FBQyxHQUFZO1FBQzNCLE1BQU0sSUFBSSxHQUFHLEdBQUcsQ0FBQyxPQUFPLENBQUMsSUFBVyxDQUFDO1FBQ3JDLE1BQU0sRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLEdBQUcsRUFBRSxHQUFHLElBQUksQ0FBQztRQUVsQyxJQUFJLENBQUMsSUFBSSxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7WUFDcEIsR0FBRyxDQUFDLE1BQU0sR0FBRyxHQUFHLENBQUM7WUFDakIsR0FBRyxDQUFDLElBQUksR0FBRztnQkFDVCxPQUFPLEVBQUUsS0FBSztnQkFDZCxPQUFPLEVBQUUsV0FBVztnQkFDcEIsU0FBUyxFQUFFLElBQUksSUFBSSxFQUFFLENBQUMsV0FBVyxFQUFFO2FBQ3BDLENBQUM7WUFDRixPQUFPO1FBQ1QsQ0FBQztRQUVELE1BQU0sT0FBTyxHQUFHO1lBQ2QsRUFBRSxFQUFFLElBQUksQ0FBQyxHQUFHLEVBQUU7WUFDZCxJQUFJO1lBQ0osS0FBSztZQUNMLEdBQUcsRUFBRSxHQUFHLElBQUksQ0FBQztZQUNiLFNBQVMsRUFBRSxJQUFJLElBQUksRUFBRSxDQUFDLFdBQVcsRUFBRTtTQUNwQyxDQUFDO1FBRUYsR0FBRyxDQUFDLE1BQU0sR0FBRyxHQUFHLENBQUM7UUFDakIsR0FBRyxDQUFDLElBQUksR0FBRztZQUNULE9BQU8sRUFBRSxJQUFJO1lBQ2IsSUFBSSxFQUFFLE9BQU87WUFDYixPQUFPLEVBQUUsUUFBUTtZQUNqQixTQUFTLEVBQUUsSUFBSSxJQUFJLEVBQUUsQ0FBQyxXQUFXLEVBQUU7U0FDcEMsQ0FBQztJQUNKLENBQUM7SUFFRDs7T0FFRztJQWlCRyxBQUFOLEtBQUssQ0FBQyxVQUFVLENBQUMsR0FBWTtRQUMzQixNQUFNLEVBQUUsR0FBRyxNQUFNLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNqQyxNQUFNLElBQUksR0FBRyxHQUFHLENBQUMsT0FBTyxDQUFDLElBQVcsQ0FBQztRQUNyQyxNQUFNLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxHQUFHLEVBQUUsR0FBRyxJQUFJLENBQUM7UUFFbEMsSUFBSSxFQUFFLEtBQUssQ0FBQyxFQUFFLENBQUM7WUFDYixHQUFHLENBQUMsSUFBSSxHQUFHO2dCQUNULE9BQU8sRUFBRSxJQUFJO2dCQUNiLElBQUksRUFBRTtvQkFDSixFQUFFO29CQUNGLElBQUksRUFBRSxJQUFJLElBQUksSUFBSTtvQkFDbEIsS0FBSyxFQUFFLEtBQUssSUFBSSxzQkFBc0I7b0JBQ3RDLEdBQUcsRUFBRSxHQUFHLElBQUksRUFBRTtvQkFDZCxTQUFTLEVBQUUsSUFBSSxJQUFJLEVBQUUsQ0FBQyxXQUFXLEVBQUU7aUJBQ3BDO2dCQUNELE9BQU8sRUFBRSxRQUFRO2dCQUNqQixTQUFTLEVBQUUsSUFBSSxJQUFJLEVBQUUsQ0FBQyxXQUFXLEVBQUU7YUFDcEMsQ0FBQztRQUNKLENBQUM7YUFBTSxDQUFDO1lBQ04sR0FBRyxDQUFDLE1BQU0sR0FBRyxHQUFHLENBQUM7WUFDakIsR0FBRyxDQUFDLElBQUksR0FBRztnQkFDVCxPQUFPLEVBQUUsS0FBSztnQkFDZCxPQUFPLEVBQUUsT0FBTztnQkFDaEIsU0FBUyxFQUFFLElBQUksSUFBSSxFQUFFLENBQUMsV0FBVyxFQUFFO2FBQ3BDLENBQUM7UUFDSixDQUFDO0lBQ0gsQ0FBQztJQUVEOztPQUVHO0lBTUcsQUFBTixLQUFLLENBQUMsVUFBVSxDQUFDLEdBQVk7UUFDM0IsTUFBTSxFQUFFLEdBQUcsTUFBTSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUM7UUFFakMsSUFBSSxFQUFFLEtBQUssQ0FBQyxFQUFFLENBQUM7WUFDYixHQUFHLENBQUMsSUFBSSxHQUFHO2dCQUNULE9BQU8sRUFBRSxJQUFJO2dCQUNiLE9BQU8sRUFBRSxRQUFRO2dCQUNqQixTQUFTLEVBQUUsSUFBSSxJQUFJLEVBQUUsQ0FBQyxXQUFXLEVBQUU7YUFDcEMsQ0FBQztRQUNKLENBQUM7YUFBTSxDQUFDO1lBQ04sR0FBRyxDQUFDLE1BQU0sR0FBRyxHQUFHLENBQUM7WUFDakIsR0FBRyxDQUFDLElBQUksR0FBRztnQkFDVCxPQUFPLEVBQUUsS0FBSztnQkFDZCxPQUFPLEVBQUUsT0FBTztnQkFDaEIsU0FBUyxFQUFFLElBQUksSUFBSSxFQUFFLENBQUMsV0FBVyxFQUFFO2FBQ3BDLENBQUM7UUFDSixDQUFDO0lBQ0gsQ0FBQztJQUVEOztPQUVHO0lBY0csQUFBTixLQUFLLENBQUMsU0FBUyxDQUFDLEdBQVk7UUFDMUIsTUFBTSxFQUFFLEdBQUcsTUFBTSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDakMsTUFBTSxPQUFPLEdBQUcsR0FBRyxDQUFDLE9BQU8sQ0FBQyxJQUFXLENBQUM7UUFFeEMsR0FBRyxDQUFDLElBQUksR0FBRztZQUNULE9BQU8sRUFBRSxJQUFJO1lBQ2IsSUFBSSxFQUFFO2dCQUNKLEVBQUU7Z0JBQ0YsR0FBRyxPQUFPO2dCQUNWLFNBQVMsRUFBRSxJQUFJLElBQUksRUFBRSxDQUFDLFdBQVcsRUFBRTthQUNwQztZQUNELE9BQU8sRUFBRSxVQUFVO1lBQ25CLFNBQVMsRUFBRSxJQUFJLElBQUksRUFBRSxDQUFDLFdBQVcsRUFBRTtTQUNwQyxDQUFDO0lBQ0osQ0FBQztJQUVEOztPQUVHO0lBTUcsQUFBTixLQUFLLENBQUMsUUFBUSxDQUFDLEdBQVk7UUFDekIsTUFBTSxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUUsR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDO1FBRXZDLE1BQU0sS0FBSyxHQUFHO1lBQ1osRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLFNBQVMsRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxXQUFXLEVBQUUsUUFBUSxFQUFFLENBQUMsRUFBRTtZQUMvRixFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsU0FBUyxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLE9BQU8sRUFBRSxRQUFRLEVBQUUsQ0FBQyxFQUFFO1lBQzNGLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxTQUFTLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsV0FBVyxFQUFFLFFBQVEsRUFBRSxDQUFDLEVBQUU7U0FDaEcsQ0FBQztRQUVGLElBQUksYUFBYSxHQUFHLEtBQUssQ0FBQztRQUMxQixJQUFJLFFBQVEsRUFBRSxDQUFDO1lBQ2IsYUFBYSxHQUFHLGFBQWEsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsUUFBUSxLQUFLLFFBQVEsQ0FBQyxDQUFDO1FBQzNFLENBQUM7UUFDRCxJQUFJLE1BQU0sRUFBRSxDQUFDO1lBQ1gsYUFBYSxHQUFHLGFBQWEsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsTUFBTSxLQUFLLE1BQU0sQ0FBQyxDQUFDO1FBQ3ZFLENBQUM7UUFFRCxHQUFHLENBQUMsSUFBSSxHQUFHO1lBQ1QsT0FBTyxFQUFFLElBQUk7WUFDYixJQUFJLEVBQUU7Z0JBQ0osS0FBSyxFQUFFLGFBQWE7Z0JBQ3BCLE9BQU8sRUFBRSxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUU7YUFDOUI7WUFDRCxTQUFTLEVBQUUsSUFBSSxJQUFJLEVBQUUsQ0FBQyxXQUFXLEVBQUU7U0FDcEMsQ0FBQztJQUNKLENBQUM7SUFFRDs7T0FFRztJQWlCRyxBQUFOLEtBQUssQ0FBQyxVQUFVLENBQUMsR0FBWTtRQUMzQixNQUFNLElBQUksR0FBRyxHQUFHLENBQUMsT0FBTyxDQUFDLElBQVcsQ0FBQztRQUNyQyxNQUFNLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLEdBQUcsSUFBSSxDQUFDO1FBRXBELElBQUksQ0FBQyxLQUFLLElBQUksQ0FBQyxPQUFPLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUNwQyxHQUFHLENBQUMsTUFBTSxHQUFHLEdBQUcsQ0FBQztZQUNqQixHQUFHLENBQUMsSUFBSSxHQUFHO2dCQUNULE9BQU8sRUFBRSxLQUFLO2dCQUNkLE9BQU8sRUFBRSxnQkFBZ0I7Z0JBQ3pCLFNBQVMsRUFBRSxJQUFJLElBQUksRUFBRSxDQUFDLFdBQVcsRUFBRTthQUNwQyxDQUFDO1lBQ0YsT0FBTztRQUNULENBQUM7UUFFRCxNQUFNLE9BQU8sR0FBRztZQUNkLEVBQUUsRUFBRSxJQUFJLENBQUMsR0FBRyxFQUFFO1lBQ2QsS0FBSztZQUNMLE9BQU87WUFDUCxRQUFRLEVBQUUsUUFBUSxJQUFJLFNBQVM7WUFDL0IsTUFBTSxFQUFFLE9BQU87WUFDZixRQUFRO1lBQ1IsU0FBUyxFQUFFLElBQUksSUFBSSxFQUFFLENBQUMsV0FBVyxFQUFFO1NBQ3BDLENBQUM7UUFFRixHQUFHLENBQUMsTUFBTSxHQUFHLEdBQUcsQ0FBQztRQUNqQixHQUFHLENBQUMsSUFBSSxHQUFHO1lBQ1QsT0FBTyxFQUFFLElBQUk7WUFDYixJQUFJLEVBQUUsT0FBTztZQUNiLE9BQU8sRUFBRSxRQUFRO1lBQ2pCLFNBQVMsRUFBRSxJQUFJLElBQUksRUFBRSxDQUFDLFdBQVcsRUFBRTtTQUNwQyxDQUFDO0lBQ0osQ0FBQztJQUVEOztPQUVHO0lBSUcsQUFBTixLQUFLLENBQUMsTUFBTSxDQUFDLEdBQVk7UUFDdkIsR0FBRyxDQUFDLElBQUksR0FBRztZQUNULE9BQU8sRUFBRSxJQUFJO1lBQ2IsSUFBSSxFQUFFO2dCQUNKLE1BQU0sRUFBRSxTQUFTO2dCQUNqQixNQUFNLEVBQUUsT0FBTyxDQUFDLE1BQU0sRUFBRTtnQkFDeEIsU0FBUyxFQUFFLElBQUksSUFBSSxFQUFFLENBQUMsV0FBVyxFQUFFO2dCQUNuQyxPQUFPLEVBQUUsT0FBTzthQUNqQjtTQUNGLENBQUM7SUFDSixDQUFDO0lBRUQ7O09BRUc7SUFHRyxBQUFOLEtBQUssQ0FBQyxNQUFNLENBQUMsR0FBWTtRQUN2QixHQUFHLENBQUMsTUFBTSxHQUFHLEdBQUcsQ0FBQztRQUNqQixHQUFHLENBQUMsR0FBRyxDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUMxQixHQUFHLENBQUMsR0FBRyxDQUFDLGFBQWEsRUFBRSxJQUFJLElBQUksRUFBRSxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUM7SUFDbkQsQ0FBQztJQUVEOztPQUVHO0lBR0csQUFBTixLQUFLLENBQUMsV0FBVyxDQUFDLEdBQVk7UUFDNUIsR0FBRyxDQUFDLE1BQU0sR0FBRyxHQUFHLENBQUM7UUFDakIsR0FBRyxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsOENBQThDLENBQUMsQ0FBQztRQUNqRSxHQUFHLENBQUMsR0FBRyxDQUFDLDhCQUE4QixFQUFFLDhDQUE4QyxDQUFDLENBQUM7UUFDeEYsR0FBRyxDQUFDLEdBQUcsQ0FBQyw4QkFBOEIsRUFBRSw2QkFBNkIsQ0FBQyxDQUFDO1FBQ3ZFLEdBQUcsQ0FBQyxJQUFJLEdBQUc7WUFDVCxPQUFPLEVBQUUsQ0FBQyxLQUFLLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUUsT0FBTyxFQUFFLE1BQU0sRUFBRSxTQUFTLENBQUM7WUFDckUsV0FBVyxFQUFFLFdBQVc7U0FDekIsQ0FBQztJQUNKLENBQUM7SUFFRDs7T0FFRztJQVVHLEFBQU4sS0FBSyxDQUFDLE1BQU0sQ0FBQyxHQUFZO1FBQ3ZCLE1BQU0sRUFBRSxDQUFDLEVBQUUsSUFBSSxHQUFHLEtBQUssRUFBRSxJQUFJLEdBQUcsV0FBVyxFQUFFLEtBQUssR0FBRyxNQUFNLEVBQUUsSUFBSSxHQUFHLENBQUMsRUFBRSxLQUFLLEdBQUcsRUFBRSxFQUFFLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQztRQUVoRyxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUM7WUFDUCxHQUFHLENBQUMsTUFBTSxHQUFHLEdBQUcsQ0FBQztZQUNqQixHQUFHLENBQUMsSUFBSSxHQUFHO2dCQUNULE9BQU8sRUFBRSxLQUFLO2dCQUNkLE9BQU8sRUFBRSxXQUFXO2dCQUNwQixTQUFTLEVBQUUsSUFBSSxJQUFJLEVBQUUsQ0FBQyxXQUFXLEVBQUU7YUFDcEMsQ0FBQztZQUNGLE9BQU87UUFDVCxDQUFDO1FBRUQsTUFBTSxPQUFPLEdBQUc7WUFDZCxLQUFLLEVBQUUsQ0FBQztZQUNSLElBQUk7WUFDSixJQUFJO1lBQ0osS0FBSztZQUNMLFVBQVUsRUFBRTtnQkFDVixJQUFJLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQztnQkFDbEIsS0FBSyxFQUFFLE1BQU0sQ0FBQyxLQUFLLENBQUM7Z0JBQ3BCLEtBQUssRUFBRSxFQUFFO2dCQUNULEtBQUssRUFBRSxDQUFDO2FBQ1Q7WUFDRCxPQUFPLEVBQUU7Z0JBQ1AsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxVQUFVLENBQUMsRUFBRSxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRTtnQkFDMUQsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxVQUFVLENBQUMsRUFBRSxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRTtnQkFDMUQsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxVQUFVLENBQUMsRUFBRSxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRTthQUMzRDtTQUNGLENBQUM7UUFFRixHQUFHLENBQUMsSUFBSSxHQUFHO1lBQ1QsT0FBTyxFQUFFLElBQUk7WUFDYixJQUFJLEVBQUUsT0FBTztZQUNiLFNBQVMsRUFBRSxJQUFJLElBQUksRUFBRSxDQUFDLFdBQVcsRUFBRTtTQUNwQyxDQUFDO0lBQ0osQ0FBQztDQUNGLENBQUE7QUF6Wlksc0NBQWE7QUFVbEI7SUFMTCxJQUFBLHNCQUFZLEVBQUMsRUFBRSxPQUFPLEVBQUUsUUFBUSxFQUFFLFdBQVcsRUFBRSxVQUFVLEVBQUUsQ0FBQztJQUM1RCxJQUFBLGtCQUFRLEVBQUMsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxLQUFLLEVBQUUsV0FBVyxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsQ0FBQyxFQUFFLENBQUM7SUFDMUUsSUFBQSxrQkFBUSxFQUFDLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFFLFdBQVcsRUFBRSxNQUFNLEVBQUUsT0FBTyxFQUFFLEVBQUUsRUFBRSxDQUFDO0lBQzlFLElBQUEscUJBQVcsRUFBQyxFQUFFLE1BQU0sRUFBRSxHQUFHLEVBQUUsV0FBVyxFQUFFLFVBQVUsRUFBRSxDQUFDO0lBQ3JELElBQUEsVUFBRyxFQUFDLFFBQVEsQ0FBQzs7Ozs2Q0F3QmI7QUFVSztJQUxMLElBQUEsc0JBQVksRUFBQyxFQUFFLE9BQU8sRUFBRSxRQUFRLEVBQUUsV0FBVyxFQUFFLFlBQVksRUFBRSxDQUFDO0lBQzlELElBQUEsa0JBQVEsRUFBQyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsV0FBVyxFQUFFLE1BQU0sRUFBRSxPQUFPLEVBQUUsQ0FBQyxFQUFFLENBQUM7SUFDekQsSUFBQSxxQkFBVyxFQUFDLEVBQUUsTUFBTSxFQUFFLEdBQUcsRUFBRSxXQUFXLEVBQUUsVUFBVSxFQUFFLENBQUM7SUFDckQsSUFBQSxxQkFBVyxFQUFDLEVBQUUsTUFBTSxFQUFFLEdBQUcsRUFBRSxXQUFXLEVBQUUsT0FBTyxFQUFFLENBQUM7SUFDbEQsSUFBQSxVQUFHLEVBQUMsWUFBWSxDQUFDOzs7OzRDQTRCakI7QUFxQks7SUFoQkwsSUFBQSxzQkFBWSxFQUFDLEVBQUUsT0FBTyxFQUFFLE1BQU0sRUFBRSxXQUFXLEVBQUUsT0FBTyxFQUFFLENBQUM7SUFDdkQsSUFBQSxpQkFBTyxFQUFDO1FBQ1AsV0FBVyxFQUFFLE1BQU07UUFDbkIsTUFBTSxFQUFFO1lBQ04sSUFBSSxFQUFFLFFBQVE7WUFDZCxVQUFVLEVBQUU7Z0JBQ1YsSUFBSSxFQUFFLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFO2dCQUN4QyxLQUFLLEVBQUUsRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLE9BQU8sRUFBRSxxQkFBcUIsRUFBRTtnQkFDekQsR0FBRyxFQUFFLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxPQUFPLEVBQUUsRUFBRSxFQUFFO2FBQ3JDO1lBQ0QsUUFBUSxFQUFFLENBQUMsTUFBTSxFQUFFLE9BQU8sQ0FBQztTQUM1QjtLQUNGLENBQUM7SUFDRCxJQUFBLHFCQUFXLEVBQUMsRUFBRSxNQUFNLEVBQUUsR0FBRyxFQUFFLFdBQVcsRUFBRSxRQUFRLEVBQUUsQ0FBQztJQUNuRCxJQUFBLHFCQUFXLEVBQUMsRUFBRSxNQUFNLEVBQUUsR0FBRyxFQUFFLFdBQVcsRUFBRSxRQUFRLEVBQUUsQ0FBQztJQUNuRCxJQUFBLFdBQUksRUFBQyxRQUFRLENBQUM7Ozs7K0NBOEJkO0FBcUJLO0lBaEJMLElBQUEsc0JBQVksRUFBQyxFQUFFLE9BQU8sRUFBRSxNQUFNLEVBQUUsV0FBVyxFQUFFLFVBQVUsRUFBRSxDQUFDO0lBQzFELElBQUEsa0JBQVEsRUFBQyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsV0FBVyxFQUFFLE1BQU0sRUFBRSxPQUFPLEVBQUUsQ0FBQyxFQUFFLENBQUM7SUFDekQsSUFBQSxpQkFBTyxFQUFDO1FBQ1AsV0FBVyxFQUFFLFNBQVM7UUFDdEIsTUFBTSxFQUFFO1lBQ04sSUFBSSxFQUFFLFFBQVE7WUFDZCxVQUFVLEVBQUU7Z0JBQ1YsSUFBSSxFQUFFLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxPQUFPLEVBQUUsUUFBUSxFQUFFO2dCQUMzQyxLQUFLLEVBQUUsRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLE9BQU8sRUFBRSxxQkFBcUIsRUFBRTtnQkFDekQsR0FBRyxFQUFFLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxPQUFPLEVBQUUsRUFBRSxFQUFFO2FBQ3JDO1NBQ0Y7S0FDRixDQUFDO0lBQ0QsSUFBQSxxQkFBVyxFQUFDLEVBQUUsTUFBTSxFQUFFLEdBQUcsRUFBRSxXQUFXLEVBQUUsUUFBUSxFQUFFLENBQUM7SUFDbkQsSUFBQSxxQkFBVyxFQUFDLEVBQUUsTUFBTSxFQUFFLEdBQUcsRUFBRSxXQUFXLEVBQUUsT0FBTyxFQUFFLENBQUM7SUFDbEQsSUFBQSxVQUFHLEVBQUMsWUFBWSxDQUFDOzs7OytDQTJCakI7QUFVSztJQUxMLElBQUEsc0JBQVksRUFBQyxFQUFFLE9BQU8sRUFBRSxNQUFNLEVBQUUsV0FBVyxFQUFFLFFBQVEsRUFBRSxDQUFDO0lBQ3hELElBQUEsa0JBQVEsRUFBQyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsV0FBVyxFQUFFLE1BQU0sRUFBRSxPQUFPLEVBQUUsQ0FBQyxFQUFFLENBQUM7SUFDekQsSUFBQSxxQkFBVyxFQUFDLEVBQUUsTUFBTSxFQUFFLEdBQUcsRUFBRSxXQUFXLEVBQUUsUUFBUSxFQUFFLENBQUM7SUFDbkQsSUFBQSxxQkFBVyxFQUFDLEVBQUUsTUFBTSxFQUFFLEdBQUcsRUFBRSxXQUFXLEVBQUUsT0FBTyxFQUFFLENBQUM7SUFDbEQsSUFBQSxVQUFHLEVBQUMsWUFBWSxDQUFDOzs7OytDQWtCakI7QUFrQks7SUFiTCxJQUFBLHNCQUFZLEVBQUMsRUFBRSxPQUFPLEVBQUUsUUFBUSxFQUFFLFdBQVcsRUFBRSxVQUFVLEVBQUUsQ0FBQztJQUM1RCxJQUFBLGtCQUFRLEVBQUMsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLFdBQVcsRUFBRSxNQUFNLEVBQUUsT0FBTyxFQUFFLENBQUMsRUFBRSxDQUFDO0lBQ3pELElBQUEsaUJBQU8sRUFBQztRQUNQLFdBQVcsRUFBRSxXQUFXO1FBQ3hCLE1BQU0sRUFBRTtZQUNOLElBQUksRUFBRSxRQUFRO1lBQ2QsVUFBVSxFQUFFO2dCQUNWLElBQUksRUFBRSxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRTthQUN6QztTQUNGO0tBQ0YsQ0FBQztJQUNELElBQUEscUJBQVcsRUFBQyxFQUFFLE1BQU0sRUFBRSxHQUFHLEVBQUUsV0FBVyxFQUFFLFVBQVUsRUFBRSxDQUFDO0lBQ3JELElBQUEsWUFBSyxFQUFDLFlBQVksQ0FBQzs7Ozs4Q0FlbkI7QUFVSztJQUxMLElBQUEsc0JBQVksRUFBQyxFQUFFLE9BQU8sRUFBRSxRQUFRLEVBQUUsV0FBVyxFQUFFLFFBQVEsRUFBRSxDQUFDO0lBQzFELElBQUEsa0JBQVEsRUFBQyxFQUFFLElBQUksRUFBRSxVQUFVLEVBQUUsUUFBUSxFQUFFLEtBQUssRUFBRSxXQUFXLEVBQUUsTUFBTSxFQUFFLENBQUM7SUFDcEUsSUFBQSxrQkFBUSxFQUFDLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFFLFdBQVcsRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLENBQUMsT0FBTyxFQUFFLFdBQVcsRUFBRSxVQUFVLENBQUMsRUFBRSxDQUFDO0lBQzVHLElBQUEscUJBQVcsRUFBQyxFQUFFLE1BQU0sRUFBRSxHQUFHLEVBQUUsV0FBVyxFQUFFLFVBQVUsRUFBRSxDQUFDO0lBQ3JELElBQUEsVUFBRyxFQUFDLFFBQVEsQ0FBQzs7Ozs2Q0EwQmI7QUFxQks7SUFoQkwsSUFBQSxzQkFBWSxFQUFDLEVBQUUsT0FBTyxFQUFFLE1BQU0sRUFBRSxXQUFXLEVBQUUsT0FBTyxFQUFFLENBQUM7SUFDdkQsSUFBQSxpQkFBTyxFQUFDO1FBQ1AsV0FBVyxFQUFFLE1BQU07UUFDbkIsTUFBTSxFQUFFO1lBQ04sSUFBSSxFQUFFLFFBQVE7WUFDZCxVQUFVLEVBQUU7Z0JBQ1YsS0FBSyxFQUFFLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFO2dCQUMzQyxPQUFPLEVBQUUsRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLE9BQU8sRUFBRSxNQUFNLEVBQUU7Z0JBQzVDLFFBQVEsRUFBRSxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsT0FBTyxFQUFFLE1BQU0sRUFBRTtnQkFDN0MsUUFBUSxFQUFFLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxPQUFPLEVBQUUsQ0FBQyxFQUFFO2FBQ3pDO1lBQ0QsUUFBUSxFQUFFLENBQUMsT0FBTyxFQUFFLFNBQVMsRUFBRSxVQUFVLENBQUM7U0FDM0M7S0FDRixDQUFDO0lBQ0QsSUFBQSxxQkFBVyxFQUFDLEVBQUUsTUFBTSxFQUFFLEdBQUcsRUFBRSxXQUFXLEVBQUUsUUFBUSxFQUFFLENBQUM7SUFDbkQsSUFBQSxXQUFJLEVBQUMsUUFBUSxDQUFDOzs7OytDQWdDZDtBQVFLO0lBSEwsSUFBQSxzQkFBWSxFQUFDLEVBQUUsT0FBTyxFQUFFLE1BQU0sRUFBRSxXQUFXLEVBQUUsVUFBVSxFQUFFLENBQUM7SUFDMUQsSUFBQSxxQkFBVyxFQUFDLEVBQUUsTUFBTSxFQUFFLEdBQUcsRUFBRSxXQUFXLEVBQUUsTUFBTSxFQUFFLENBQUM7SUFDakQsSUFBQSxVQUFHLEVBQUMsU0FBUyxDQUFDOzs7OzJDQVdkO0FBT0s7SUFGTCxJQUFBLHNCQUFZLEVBQUMsRUFBRSxPQUFPLEVBQUUsTUFBTSxFQUFFLFdBQVcsRUFBRSxZQUFZLEVBQUUsQ0FBQztJQUM1RCxJQUFBLFdBQUksRUFBQyxTQUFTLENBQUM7Ozs7MkNBS2Y7QUFPSztJQUZMLElBQUEsc0JBQVksRUFBQyxFQUFFLE9BQU8sRUFBRSxVQUFVLEVBQUUsV0FBVyxFQUFFLHNCQUFzQixFQUFFLENBQUM7SUFDMUUsSUFBQSxjQUFPLEVBQUMsUUFBUSxDQUFDOzs7O2dEQVVqQjtBQWNLO0lBVEwsSUFBQSxzQkFBWSxFQUFDLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxXQUFXLEVBQUUsaUJBQWlCLEVBQUUsQ0FBQztJQUMvRCxJQUFBLGtCQUFRLEVBQUMsRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsV0FBVyxFQUFFLE9BQU8sRUFBRSxDQUFDO0lBQzdELElBQUEsa0JBQVEsRUFBQyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLEtBQUssRUFBRSxXQUFXLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxDQUFDLE1BQU0sRUFBRSxNQUFNLEVBQUUsS0FBSyxDQUFDLEVBQUUsQ0FBQztJQUMvRixJQUFBLGtCQUFRLEVBQUMsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxLQUFLLEVBQUUsV0FBVyxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsQ0FBQyxXQUFXLEVBQUUsTUFBTSxFQUFFLE1BQU0sQ0FBQyxFQUFFLENBQUM7SUFDckcsSUFBQSxrQkFBUSxFQUFDLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFFLFdBQVcsRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLENBQUMsS0FBSyxFQUFFLE1BQU0sQ0FBQyxFQUFFLENBQUM7SUFDeEYsSUFBQSxrQkFBUSxFQUFDLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFFLFdBQVcsRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLENBQUMsRUFBRSxDQUFDO0lBQzFFLElBQUEsa0JBQVEsRUFBQyxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsUUFBUSxFQUFFLEtBQUssRUFBRSxXQUFXLEVBQUUsTUFBTSxFQUFFLE9BQU8sRUFBRSxFQUFFLEVBQUUsQ0FBQztJQUM5RSxJQUFBLHFCQUFXLEVBQUMsRUFBRSxNQUFNLEVBQUUsR0FBRyxFQUFFLFdBQVcsRUFBRSxNQUFNLEVBQUUsQ0FBQztJQUNqRCxJQUFBLFVBQUcsRUFBQyxTQUFTLENBQUM7Ozs7MkNBcUNkO3dCQXhaVSxhQUFhO0lBRnpCLElBQUEsaUJBQU8sRUFBQyxLQUFLLENBQUM7SUFDZCxJQUFBLGlCQUFVLEVBQUMsTUFBTSxDQUFDO0dBQ04sYUFBYSxDQXlaekIifQ==