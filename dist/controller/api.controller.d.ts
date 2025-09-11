import { Context } from '@midwayjs/koa';
export declare class ApiController {
    /**
     * GET /api/users - 获取用户列表
     */
    getUsers(ctx: Context): Promise<void>;
    /**
     * GET /api/users/:id - 获取单个用户
     */
    getUser(ctx: Context): Promise<void>;
    /**
     * POST /api/users - 创建用户
     */
    createUser(ctx: Context): Promise<void>;
    /**
     * PUT /api/users/:id - 更新用户
     */
    updateUser(ctx: Context): Promise<void>;
    /**
     * DELETE /api/users/:id - 删除用户
     */
    deleteUser(ctx: Context): Promise<void>;
    /**
     * PATCH /api/users/:id - 部分更新用户
     */
    patchUser(ctx: Context): Promise<void>;
    /**
     * GET /api/posts - 获取文章列表
     */
    getPosts(ctx: Context): Promise<void>;
    /**
     * POST /api/posts - 创建文章
     */
    createPost(ctx: Context): Promise<void>;
    /**
     * GET /api/health - 健康检查
     */
    health(ctx: Context): Promise<void>;
    /**
     * HEAD /api/status - 状态检查
     */
    status(ctx: Context): Promise<void>;
    /**
     * OPTIONS /api/users - 获取用户资源选项
     */
    userOptions(ctx: Context): Promise<void>;
    /**
     * GET /api/search - 搜索接口（复杂查询参数）
     */
    search(ctx: Context): Promise<void>;
}
