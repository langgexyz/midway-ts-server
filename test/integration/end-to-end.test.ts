/**
 * 端到端测试
 * 测试完整的 Gateway 代理流程
 */

import { GatewayHttpBuilder, HttpMethod } from 'openapi-ts-sdk';

// Mock Gateway Client for end-to-end testing
class MockGatewayClient {
  async send<T>(command: string, data: object, responseType: new() => T, headers?: Map<string, string>): Promise<T> {
    console.log(`[E2E] send called: ${command}`);
    return { success: true, command, data } as T;
  }

  async sendRaw(command: string, data: string, headers?: Map<string, string>): Promise<string> {
    console.log(`[E2E] sendRaw called: ${command}, data length: ${data.length}`);
    
    // 模拟真实的 Gateway 响应
    return JSON.stringify({
      success: true,
      data: {
        received: data,
        command,
        headers: headers ? Object.fromEntries(headers) : {},
        timestamp: new Date().toISOString()
      },
      status: 200,
      message: 'OK'
    });
  }
}

// Mock Header Builder
class MockHeaderBuilder {
  private headers = new Map<string, string>();

  setProxy(url: string, method: string) {
    this.headers.set('x-proxy-url', url);
    this.headers.set('x-proxy-method', method);
    return this;
  }

  setHook(url: string, method: string) {
    this.headers.set('x-hook-url', url);
    this.headers.set('x-hook-method', method);
    return this;
  }

  setReqId(reqId: string) {
    this.headers.set('X-Req-Id', reqId);
    return this;
  }

  setHeader(key: string, value: string) {
    this.headers.set(key, value);
    return this;
  }

  build() {
    return this.headers;
  }
}

describe('End-to-End Tests', () => {
  let gatewayClient: MockGatewayClient;
  let gatewayBuilder: GatewayHttpBuilder;
  // let fetchBuilder: FetchHttpBuilder; // 暂时不使用

  beforeEach(() => {
    gatewayClient = new MockGatewayClient();
    gatewayBuilder = new GatewayHttpBuilder('http://localhost:7001', gatewayClient, MockHeaderBuilder);
    // fetchBuilder = new FetchHttpBuilder('http://localhost:3000');
  });

  describe('Gateway Proxy Flow', () => {
    it('should handle complete GET request flow', async () => {
      // 设置请求
      gatewayBuilder
        .setMethod(HttpMethod.GET)
        .setUri('/api/users')
        .addHeader('Accept', 'application/json')
        .addHeader('X-Client-Version', '1.0.0');

      // 执行请求
      const http = gatewayBuilder.build();
      const [result, error] = await http.send();

      // 验证结果
      expect(error).toBeNull();
      expect(result).toContain('"success":true');
      expect(result).toContain('"command":"API/Proxy"');
      expect(result).toContain('"x-proxy-url":"http://localhost:7001/api/users"');
      expect(result).toContain('"x-proxy-method":"GET"');
    });

    it('should handle complete POST request flow with JSON data', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        age: 30
      };

      // 设置请求
      gatewayBuilder
        .setMethod(HttpMethod.POST)
        .setUri('/api/users')
        .setContent(JSON.stringify(userData))
        .addHeader('Content-Type', 'application/json')
        .addHeader('Authorization', 'Bearer token123');

      // 执行请求
      const http = gatewayBuilder.build();
      const [result, error] = await http.send();

      // 验证结果
      expect(error).toBeNull();
      expect(result).toContain('"success":true');
      expect(result).toContain('"command":"API/Proxy"');
      expect(result).toContain('"x-proxy-url":"http://localhost:7001/api/users"');
      expect(result).toContain('"x-proxy-method":"POST"');
      expect(result).toContain(JSON.stringify(userData));
    });

    it('should handle PUT request with data update', async () => {
      const updateData = {
        name: 'Jane Doe',
        email: 'jane@example.com'
      };

      gatewayBuilder
        .setMethod(HttpMethod.PUT)
        .setUri('/api/users/123')
        .setContent(JSON.stringify(updateData))
        .addHeader('Content-Type', 'application/json')
        .addHeader('If-Match', 'etag123');

      const http = gatewayBuilder.build();
      const [result, error] = await http.send();

      expect(error).toBeNull();
      expect(result).toContain('"success":true');
      expect(result).toContain('"x-proxy-method":"PUT"');
      expect(result).toContain(JSON.stringify(updateData));
    });

    it('should handle DELETE request', async () => {
      gatewayBuilder
        .setMethod(HttpMethod.DELETE)
        .setUri('/api/users/123')
        .addHeader('Authorization', 'Bearer token123');

      const http = gatewayBuilder.build();
      const [result, error] = await http.send();

      expect(error).toBeNull();
      expect(result).toContain('"success":true');
      expect(result).toContain('"x-proxy-method":"DELETE"');
    });
  });

  describe('Data Flow Validation', () => {
    it('should preserve all headers through the flow', async () => {
      const customHeaders = {
        'X-Custom-1': 'value1',
        'X-Custom-2': 'value2',
        'Authorization': 'Bearer custom-token',
        'Content-Type': 'application/json'
      };

      gatewayBuilder
        .setMethod(HttpMethod.POST)
        .setUri('/api/test')
        .setContent('{"test": true}');

      // 添加自定义头部
      Object.entries(customHeaders).forEach(([key, value]) => {
        gatewayBuilder.addHeader(key, value);
      });

      const http = gatewayBuilder.build();
      const [result, error] = await http.send();

      expect(error).toBeNull();
      
      // 验证所有头部都被保留
      Object.entries(customHeaders).forEach(([key, value]) => {
        expect(result).toContain(`"${key}":"${value}"`);
      });
    });

    it('should handle binary data correctly', async () => {
      const binaryData = Buffer.from('Hello, World! 你好世界!').toString('base64');
      
      gatewayBuilder
        .setMethod(HttpMethod.POST)
        .setUri('/api/upload')
        .setContent(binaryData)
        .addHeader('Content-Type', 'application/octet-stream');

      const http = gatewayBuilder.build();
      const [result, error] = await http.send();

      expect(error).toBeNull();
      expect(result).toContain('"success":true');
      expect(result).toContain(binaryData);
    });

    it('should handle large data payloads', async () => {
      const largeData = {
        items: Array.from({ length: 10 }, (_, i) => ({
          id: i,
          name: `Item ${i}`,
          description: `Description for item ${i}`
        }))
      };

      gatewayBuilder
        .setMethod(HttpMethod.POST)
        .setUri('/api/bulk')
        .setContent(JSON.stringify(largeData))
        .addHeader('Content-Type', 'application/json');

      const http = gatewayBuilder.build();
      const [result, error] = await http.send();

      expect(error).toBeNull();
      expect(result).toContain('"success":true');
      expect(result).toContain('"id":0');
    });
  });

  describe('Error Handling Flow', () => {
    it('should handle gateway connection errors', async () => {
      const errorClient = new MockGatewayClient();
      errorClient.sendRaw = jest.fn().mockRejectedValue(new Error('Gateway connection failed'));

      const errorBuilder = new GatewayHttpBuilder('http://localhost:7001', errorClient, MockHeaderBuilder);
      errorBuilder
        .setMethod(HttpMethod.GET)
        .setUri('/api/test');

      const http = errorBuilder.build();
      const [result, error] = await http.send();

      expect(result).toBe('');
      expect(error).toBeInstanceOf(Error);
      expect(error?.message).toBe('Gateway connection failed');
    });

    it('should handle malformed JSON responses', async () => {
      const errorClient = new MockGatewayClient();
      errorClient.sendRaw = jest.fn().mockResolvedValue('invalid json response');

      const errorBuilder = new GatewayHttpBuilder('http://localhost:7001', errorClient, MockHeaderBuilder);
      errorBuilder
        .setMethod(HttpMethod.GET)
        .setUri('/api/test');

      const http = errorBuilder.build();
      const [result, error] = await http.send();

      expect(result).toBe('invalid json response');
      expect(error).toBeNull();
    });
  });

  describe('Performance and Concurrency', () => {
    it('should handle multiple concurrent requests', async () => {
      const requests = [];
      const startTime = Date.now();

      for (let i = 0; i < 20; i++) {
        const builder = new GatewayHttpBuilder('http://localhost:7001', gatewayClient, MockHeaderBuilder);
        builder
          .setMethod(HttpMethod.GET)
          .setUri(`/api/test/${i}`)
          .setContent(JSON.stringify({ index: i }));

        const http = builder.build();
        requests.push(http.send());
      }

      const results = await Promise.all(requests);
      const endTime = Date.now();

      // 验证所有请求都成功
      results.forEach(([result, error]) => {
        expect(error).toBeNull();
        expect(result).toContain('"success":true');
      });

      // 验证性能
      expect(endTime - startTime).toBeLessThan(5000); // 应该在5秒内完成
    });

    it('should handle rapid sequential requests', async () => {
      const startTime = Date.now();

      for (let i = 0; i < 10; i++) {
        const builder = new GatewayHttpBuilder('http://localhost:7001', gatewayClient, MockHeaderBuilder);
        builder
          .setMethod(HttpMethod.POST)
          .setUri('/api/test')
          .setContent(JSON.stringify({ index: i }));

        const http = builder.build();
        const [result, error] = await http.send();
        
        expect(error).toBeNull();
        expect(result).toContain('"success":true');
      }

      const endTime = Date.now();
      expect(endTime - startTime).toBeLessThan(2000); // 应该在2秒内完成
    });
  });

  describe('Callback Integration', () => {
    it('should handle pusher callbacks correctly', async () => {
      const pusher = jest.fn();
      
      gatewayBuilder
        .setMethod(HttpMethod.GET)
        .setUri('/api/test')
        .setPusher(pusher);

      const http = gatewayBuilder.build();
      await http.send();

      expect(pusher).toHaveBeenCalledTimes(1);
      expect(pusher).toHaveBeenCalledWith(expect.stringContaining('"success":true'));
    });

    it('should handle multiple pusher callbacks', async () => {
      const pushers = [jest.fn(), jest.fn(), jest.fn()];
      
      for (let i = 0; i < pushers.length; i++) {
        const builder = new GatewayHttpBuilder('http://localhost:7001', gatewayClient, MockHeaderBuilder);
        builder
          .setMethod(HttpMethod.GET)
          .setUri(`/api/test/${i}`)
          .setPusher(pushers[i]);

        const http = builder.build();
        await http.send();
      }

      pushers.forEach(pusher => {
        expect(pusher).toHaveBeenCalledTimes(1);
        expect(pusher).toHaveBeenCalledWith(expect.stringContaining('"success":true'));
      });
    });
  });
});
