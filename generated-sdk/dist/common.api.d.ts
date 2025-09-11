import { APIClient, ApiOption, UnknownRequest, UnknownResponse } from './types';
export declare class CommonApi extends APIClient {
    /**
     * 健康检查
     *
     * @description 执行 健康检查 操作
     * @method GET
     * @path /api/health
     *
     * @param {...ApiOption} options - 函数式选项参数
     * @returns {Promise<UnknownResponse>} 返回 API 响应结果
     *
     * @example
     * // 基本调用
     * const result = await api.getApiHealth();
     *
     * @example
     * // 使用选项
     * const result = await api.getApiHealth(
     *   withUri('/custom/path'),
     *   withHeader('X-Request-ID', 'unique-id'),
     *   withHeaders({ 'X-Custom': 'value' })
     * );
     *
     * @throws {Error} 当请求失败或参数验证失败时抛出错误
     */
    getApiHealth(...options: ApiOption[]): Promise<UnknownResponse>;
    /**
     * 获取用户列表
     *
     * @description 执行 获取用户列表 操作
     * @method GET
     * @path /api/users
     *
     * @param {...ApiOption} options - 函数式选项参数
     * @returns {Promise<UnknownResponse>} 返回 API 响应结果
     *
     * @example
     * // 基本调用
     * const result = await api.getApiUsers();
     *
     * @example
     * // 使用选项
     * const result = await api.getApiUsers(
     *   withUri('/custom/path'),
     *   withHeader('X-Request-ID', 'unique-id'),
     *   withHeaders({ 'X-Custom': 'value' })
     * );
     *
     * @throws {Error} 当请求失败或参数验证失败时抛出错误
     */
    getApiUsers(...options: ApiOption[]): Promise<UnknownResponse>;
    /**
     * 创建用户
     *
     * @description 执行 创建用户 操作
     * @method POST
     * @path /api/users
     * @param {UnknownRequest} request - 请求参数对象
     * @param {...ApiOption} options - 函数式选项参数
     * @returns {Promise<unknown>} 返回 API 响应结果
     *
     * @example
     * // 基本调用
     * const result = await api.postApiUsers(request);
     *
     * @example
     * // 使用选项
     * const result = await api.postApiUsers(request,
     *   withUri('/custom/path'),
     *   withHeader('X-Request-ID', 'unique-id'),
     *   withHeaders({ 'X-Custom': 'value' })
     * );
     *
     * @throws {Error} 当请求失败或参数验证失败时抛出错误
     */
    postApiUsers(request: UnknownRequest, ...options: ApiOption[]): Promise<unknown>;
    /**
     * 获取单个用户
     *
     * @description 执行 获取单个用户 操作
     * @method GET
     * @path /api/users/{id}
     *
     * @param {...ApiOption} options - 函数式选项参数
     * @returns {Promise<UnknownResponse>} 返回 API 响应结果
     *
     * @example
     * // 基本调用
     * const result = await api.getApiUsers();
     *
     * @example
     * // 使用选项
     * const result = await api.getApiUsers(
     *   withUri('/custom/path'),
     *   withHeader('X-Request-ID', 'unique-id'),
     *   withHeaders({ 'X-Custom': 'value' })
     * );
     *
     * @throws {Error} 当请求失败或参数验证失败时抛出错误
     */
    getApiUsersById(...options: ApiOption[]): Promise<UnknownResponse>;
    /**
     * 更新用户
     *
     * @description 执行 更新用户 操作
     * @method PUT
     * @path /api/users/{id}
     * @param {UnknownRequest} request - 请求参数对象
     * @param {...ApiOption} options - 函数式选项参数
     * @returns {Promise<UnknownResponse>} 返回 API 响应结果
     *
     * @example
     * // 基本调用
     * const result = await api.putApiUsers(request);
     *
     * @example
     * // 使用选项
     * const result = await api.putApiUsers(request,
     *   withUri('/custom/path'),
     *   withHeader('X-Request-ID', 'unique-id'),
     *   withHeaders({ 'X-Custom': 'value' })
     * );
     *
     * @throws {Error} 当请求失败或参数验证失败时抛出错误
     */
    putApiUsers(request: UnknownRequest, ...options: ApiOption[]): Promise<UnknownResponse>;
    /**
     * 删除用户
     *
     * @description 执行 删除用户 操作
     * @method DELETE
     * @path /api/users/{id}
     *
     * @param {...ApiOption} options - 函数式选项参数
     * @returns {Promise<UnknownResponse>} 返回 API 响应结果
     *
     * @example
     * // 基本调用
     * const result = await api.deleteApiUsers();
     *
     * @example
     * // 使用选项
     * const result = await api.deleteApiUsers(
     *   withUri('/custom/path'),
     *   withHeader('X-Request-ID', 'unique-id'),
     *   withHeaders({ 'X-Custom': 'value' })
     * );
     *
     * @throws {Error} 当请求失败或参数验证失败时抛出错误
     */
    deleteApiUsers(...options: ApiOption[]): Promise<UnknownResponse>;
}
