"use strict";
// 共享类型定义和基础 API 客户端
Object.defineProperty(exports, "__esModule", { value: true });
exports.APIClient = exports.combineOptions = exports.withHeader = exports.withHeaders = exports.withUri = void 0;
// 选项构造函数
const withUri = (uri) => (config) => {
    config.uri = uri;
};
exports.withUri = withUri;
const withHeaders = (headers) => (config) => {
    config.headers = { ...config.headers, ...headers };
};
exports.withHeaders = withHeaders;
const withHeader = (key, value) => (config) => {
    config.headers = { ...config.headers, [key]: value };
};
exports.withHeader = withHeader;
// 组合选项
const combineOptions = (...options) => (config) => {
    options.forEach(option => option(config));
};
exports.combineOptions = combineOptions;
// 基础 API 客户端类
class APIClient {
    constructor(httpBuilder) {
        this.httpBuilder = httpBuilder;
    }
    /**
     * 通用参数验证方法
     * @protected
     */
    validateRequest(request) {
        if (!request) {
            throw new Error('参数 request 是必需的');
        }
        if (typeof request !== 'object') {
            throw new Error('参数 request 必须是对象类型');
        }
    }
    /**
     * 通用请求处理方法
     * @protected
     */
    async executeRequest(method, path, request, options = []) {
        // 创建默认配置
        const config = {
            uri: path,
            headers: {
                'Content-Type': 'application/json'
            }
        };
        // 应用所有选项
        options.forEach(option => option(config));
        // 构建 HTTP 请求
        const httpBuilder = this.httpBuilder
            .setUri(config.uri)
            .setMethod(method);
        // 添加 headers
        Object.entries(config.headers).forEach(([key, value]) => {
            httpBuilder.addHeader(key, value);
        });
        // 添加请求体（如果有）
        if (request) {
            httpBuilder.setContent(JSON.stringify(request));
        }
        const http = httpBuilder.build();
        const [response, error] = await http.send();
        if (error) {
            throw error;
        }
        return JSON.parse(response);
    }
}
exports.APIClient = APIClient;
