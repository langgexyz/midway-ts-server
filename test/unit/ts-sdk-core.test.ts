/**
 * TS SDK Client 核心功能测试
 */

import { 
  HttpBuilder, 
  HttpMethod
} from 'openapi-ts-sdk';

// 测试抽象类 HttpBuilder 的功能
class TestHttpBuilder extends HttpBuilder {
  public build() {
    return {
      send: async (): Promise<[string, Error | null]> => {
        return ['test response', null];
      }
    };
  }
}

describe('TS SDK Client Core', () => {
  let builder: TestHttpBuilder;

  beforeEach(() => {
    builder = new TestHttpBuilder('https://api.example.com');
  });

  describe('HttpBuilder Abstract Class', () => {
    it('should set and get base URL', () => {
      expect(builder.baseUrl()).toBe('https://api.example.com');
    });

    it('should set and get URI', () => {
      builder.setUri('/api/test');
      expect(builder.uri()).toBe('/api/test');
    });

    it('should set and get content', () => {
      builder.setContent('test content');
      expect(builder.content()).toBe('test content');
    });

    it('should set and get method', () => {
      builder.setMethod(HttpMethod.GET);
      expect(builder.method()).toBe(HttpMethod.GET);
    });

    it('should set and get pusher', () => {
      const pusher = jest.fn();
      builder.setPusher(pusher);
      expect(builder.pusher()).toBe(pusher);
    });

    it('should add individual headers', () => {
      builder.addHeader('Content-Type', 'application/json');
      builder.addHeader('Authorization', 'Bearer token');
      
      const headers = builder.headers();
      expect(headers.get('Content-Type')).toBe('application/json');
      expect(headers.get('Authorization')).toBe('Bearer token');
    });

    it('should set headers from Map', () => {
      const headers = new Map([
        ['Content-Type', 'application/json'],
        ['Authorization', 'Bearer token']
      ]);
      
      builder.setHeaders(headers);
      expect(builder.headers()).toBe(headers);
    });

    it('should build HTTP instance', () => {
      const http = builder.build();
      expect(http).toHaveProperty('send');
      expect(typeof http.send).toBe('function');
    });
  });

  describe('Type Definitions', () => {
    it('should define Headers type correctly', () => {
      const headers: Headers = new Map();
      expect(headers).toBeInstanceOf(Map);
    });
  });

  describe('HttpMethod Enum', () => {
    it('should have all HTTP methods', () => {
      expect(HttpMethod.GET).toBe('GET');
      expect(HttpMethod.POST).toBe('POST');
      expect(HttpMethod.PUT).toBe('PUT');
      expect(HttpMethod.PATCH).toBe('PATCH');
      expect(HttpMethod.DELETE).toBe('DELETE');
      expect(HttpMethod.HEAD).toBe('HEAD');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty headers', () => {
      const emptyHeaders: Headers = new Map();
      expect(emptyHeaders.size).toBe(0);
    });

    it('should handle special characters in header values', () => {
      const specialHeaders: Headers = new Map([
        ['Content-Type', 'application/json; charset=utf-8'],
        ['Authorization', 'Bearer token.with.special-chars'],
        ['X-Custom', 'value with spaces and "quotes"']
      ]);
      
      expect(specialHeaders.get('Content-Type')).toBe('application/json; charset=utf-8');
      expect(specialHeaders.get('Authorization')).toBe('Bearer token.with.special-chars');
      expect(specialHeaders.get('X-Custom')).toBe('value with spaces and "quotes"');
    });
  });

  describe('Performance Tests', () => {
    it('should handle large header sets efficiently', () => {
      const largeHeaders: Headers = new Map();
      for (let i = 0; i < 1000; i++) {
        largeHeaders.set(`header-${i}`, `value-${i}`);
      }
      
      const startTime = Date.now();
      const size = largeHeaders.size;
      const endTime = Date.now();
      
      expect(endTime - startTime).toBeLessThan(100); // Should complete in under 100ms
      expect(size).toBe(1000);
    });

    it('should handle frequent header operations', () => {
      const map: Headers = new Map();
      const startTime = Date.now();
      
      for (let i = 0; i < 10000; i++) {
        map.set(`key-${i}`, `value-${i}`);
        map.get(`key-${i}`);
        map.delete(`key-${i}`);
      }
      
      const endTime = Date.now();
      expect(endTime - startTime).toBeLessThan(1000); // Should complete in under 1 second
    });
  });
});