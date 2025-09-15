/**
 * Gateway 集成测试
 */

import { HttpMethod } from 'openapi-ts-sdk';
import { GatewayHttpBuilder } from 'openapi-ts-sdk-gateway';

// Mock Gateway Client
class MockGatewayClient {
  async send<T>(command: string, data: object, responseType: new() => T, headers?: Map<string, string>): Promise<T> {
    console.log(`Mock send called: ${command}`);
    
    // 模拟返回响应
    const response = {
      success: true,
      data: { received: JSON.stringify(data), command },
      timestamp: new Date().toISOString()
    };
    
    return response as T;
  }

  async sendRaw(command: string, data: string, headers: Map<string, string>): Promise<string> {
    console.log(`Mock sendRaw called: ${command}, data: ${data.substring(0, 50)}...`);
    
    // 模拟返回响应
    return JSON.stringify({
      success: true,
      data: { received: data, command },
      timestamp: new Date().toISOString()
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

  build() {
    return this.headers;
  }
}

describe('Gateway Integration Tests', () => {
  let mockClient: MockGatewayClient;
  let builder: GatewayHttpBuilder;

  beforeEach(() => {
    mockClient = new MockGatewayClient();
    builder = new GatewayHttpBuilder('http://localhost:7001', mockClient, MockHeaderBuilder);
  });


  describe('Gateway HTTP Builder Integration', () => {
    it('should handle GET request through gateway', async () => {
      builder
        .setMethod(HttpMethod.GET)
        .setUri('/api/users')
        .addHeader('X-Custom', 'test-value');

      const http = builder.build();
      const [result, error] = await http.send();

      expect(error).toBeNull();
      expect(result).toContain('"success":true');
      expect(result).toContain('"command":"API/Proxy"');
    });

    it('should handle POST request with JSON data', async () => {
      const testData = { name: 'test', value: 123 };
      
      builder
        .setMethod(HttpMethod.POST)
        .setUri('/api/users')
        .setContent(JSON.stringify(testData))
        .addHeader('Content-Type', 'application/json');

      const http = builder.build();
      const [result, error] = await http.send();

      expect(error).toBeNull();
      expect(result).toContain('"success":true');
      expect(result).toContain('name');
      expect(result).toContain('test');
    });

    it('should handle empty content', async () => {
      builder
        .setMethod(HttpMethod.GET)
        .setUri('/api/health');

      const http = builder.build();
      const [result, error] = await http.send();

      expect(error).toBeNull();
      expect(result).toContain('"success":true');
    });

    it('should handle pusher callback', async () => {
      const pusher = jest.fn();
      
      builder
        .setMethod(HttpMethod.GET)
        .setUri('/api/test')
        .setPusher(pusher);

      const http = builder.build();
      await http.send();

      expect(pusher).toHaveBeenCalledWith(expect.stringContaining('"success":true'));
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle gateway errors', async () => {
      // 创建会抛出错误的 Mock Client
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
  });

  describe('Performance Integration', () => {
    it('should handle multiple concurrent requests', async () => {
      const requests = [];
      
      for (let i = 0; i < 10; i++) {
        const testBuilder = new GatewayHttpBuilder('http://localhost:7001', mockClient, MockHeaderBuilder);
        testBuilder
          .setMethod(HttpMethod.GET)
          .setUri(`/api/test/${i}`)
          .setContent(JSON.stringify({ index: i }));

        const http = testBuilder.build();
        requests.push(http.send());
      }

      const results = await Promise.all(requests);
      
      expect(results).toHaveLength(10);
      results.forEach(([result, error]) => {
        expect(error).toBeNull();
        expect(result).toContain('"success":true');
      });
    });
  });
});
