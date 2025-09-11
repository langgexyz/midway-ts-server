// 共享类型定义和基础 API 客户端

import { HttpBuilder, HttpMethod } from 'ts-sdk-client';

// API 配置接口
export interface ApiConfig {
  uri: string;           // 请求 URI（每个方法都有默认值，可通过 withUri 覆盖）
  headers: Record<string, string>;  // 请求 headers（默认包含 Content-Type）
}

// 函数式选项类型
export type ApiOption = (config: ApiConfig) => void;

// 选项构造函数
export const withUri = (uri: string): ApiOption => (config) => {
  config.uri = uri;
};

export const withHeaders = (headers: Record<string, string>): ApiOption => (config) => {
  config.headers = { ...config.headers, ...headers };
};

export const withHeader = (key: string, value: string): ApiOption => (config) => {
  config.headers = { ...config.headers, [key]: value };
};

// 组合选项
export const combineOptions = (...options: ApiOption[]): ApiOption => (config) => {
  options.forEach(option => option(config));
};

// 生成的类型定义
export interface UnknownRequest {
  name?: string;
  email?: string;
  age?: number;
}

export interface UnknownResponse {
  success?: boolean;
  message?: string;
  data?: unknown;
}

// 基础 API 客户端类
export abstract class APIClient {
  protected httpBuilder: HttpBuilder;

  constructor(httpBuilder: HttpBuilder) {
    this.httpBuilder = httpBuilder;
  }

  /**
   * 通用参数验证方法
   * @protected
   */
  protected validateRequest<T = unknown>(request: T): void {
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
  protected async executeRequest<TRequest = unknown, TResponse = unknown>(
    method: HttpMethod,
    path: string,
    request?: TRequest,
    options: ApiOption[] = []
  ): Promise<TResponse> {
    // 创建默认配置
    const config: ApiConfig = {
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
