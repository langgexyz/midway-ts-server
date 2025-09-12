/**
 * HTTP Builder 单元测试
 */

import { FetchHttpBuilder, GatewayHttpBuilder, HttpMethod } from 'openapi-ts-sdk';

// Mock fetch
global.fetch = jest.fn();

describe('HTTP Builder Tests', () => {
  beforeEach(() => {
    (global.fetch as jest.Mock).mockClear();
  });

  describe('FetchHttpBuilder', () => {
    let builder: FetchHttpBuilder;

    beforeEach(() => {
      builder = new FetchHttpBuilder('http://localhost:3000');
    });

    it('should build HTTP instance correctly', () => {
      const http = builder.build();
      
      expect(http).toHaveProperty('send');
      expect(typeof http.send).toBe('function');
    });

    it('should handle GET request with query parameters', async () => {
      const mockResponse = {
        ok: true,
        text: () => Promise.resolve('{"success": true}')
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      builder
        .setMethod(HttpMethod.GET)
        .setUri('/api/test')
        .setContent('{"page": 1, "limit": 10}');

      const http = builder.build();
      const [result, error] = await http.send();

      expect(error).toBeNull();
      expect(result).toBe('{"success": true}');
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/test?page=1&limit=10',
        expect.objectContaining({
          method: 'GET',
          headers: expect.any(Object)
        })
      );
    });

    it('should handle POST request with body', async () => {
      const mockResponse = {
        ok: true,
        text: () => Promise.resolve('{"success": true}')
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      builder
        .setMethod(HttpMethod.POST)
        .setUri('/api/test')
        .setContent('{"name": "test"}');

      const http = builder.build();
      const [result, error] = await http.send();

      expect(error).toBeNull();
      expect(result).toBe('{"success": true}');
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/test',
        expect.objectContaining({
          method: 'POST',
          body: '{"name": "test"}',
          headers: expect.any(Object)
        })
      );
    });

    it('should handle HTTP errors', async () => {
      const mockResponse = {
        ok: false,
        status: 404,
        statusText: 'Not Found'
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      builder
        .setMethod(HttpMethod.GET)
        .setUri('/api/notfound');

      const http = builder.build();
      const [result, error] = await http.send();

      expect(result).toBe('');
      expect(error).toBeInstanceOf(Error);
      expect(error?.message).toBe('HTTP 404: Not Found');
    });

    it('should handle network errors', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      builder
        .setMethod(HttpMethod.GET)
        .setUri('/api/test');

      const http = builder.build();
      const [result, error] = await http.send();

      expect(result).toBe('');
      expect(error).toBeInstanceOf(Error);
      expect(error?.message).toBe('Network error');
    });

    it('should handle pusher callback', async () => {
      const mockResponse = {
        ok: true,
        text: () => Promise.resolve('{"success": true}')
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const pusher = jest.fn();
      builder
        .setMethod(HttpMethod.GET)
        .setUri('/api/test')
        .setPusher(pusher);

      const http = builder.build();
      await http.send();

      expect(pusher).toHaveBeenCalledWith('{"success": true}');
    });
  });

  describe('GatewayHttpBuilder', () => {
    let mockClient: any;
    let mockHeaderBuilder: any;
    let builder: GatewayHttpBuilder;

    beforeEach(() => {
      mockClient = {
        sendRaw: jest.fn()
      };
      mockHeaderBuilder = jest.fn().mockImplementation(() => ({
        setProxy: jest.fn().mockReturnThis(),
        build: jest.fn().mockReturnValue(new Map([
          ['x-proxy-url', 'http://localhost:3000/api/test'],
          ['x-proxy-method', 'GET']
        ]))
      }));
      builder = new GatewayHttpBuilder('http://localhost:3000', mockClient, mockHeaderBuilder);
    });

    it('should build HTTP instance correctly', () => {
      const http = builder.build();
      
      expect(http).toHaveProperty('send');
      expect(typeof http.send).toBe('function');
    });

    it('should handle successful proxy request', async () => {
      mockClient.sendRaw.mockResolvedValue('{"success": true}');

      builder
        .setMethod(HttpMethod.GET)
        .setUri('/api/test')
        .setContent('{"name": "test"}');

      const http = builder.build();
      const [result, error] = await http.send();

      expect(error).toBeNull();
      expect(result).toBe('{"success": true}');
      expect(mockClient.sendRaw).toHaveBeenCalledWith(
        'API/Proxy',
        '{"name": "test"}',
        expect.any(Map)
      );
    });

    it('should handle empty content', async () => {
      mockClient.sendRaw.mockResolvedValue('{"success": true}');

      builder
        .setMethod(HttpMethod.GET)
        .setUri('/api/test');

      const http = builder.build();
      const [result, error] = await http.send();

      expect(error).toBeNull();
      expect(result).toBe('{"success": true}');
      expect(mockClient.sendRaw).toHaveBeenCalledWith(
        'API/Proxy',
        '',
        expect.any(Map)
      );
    });

    it('should handle proxy errors', async () => {
      mockClient.sendRaw.mockRejectedValue(new Error('Proxy error'));

      builder
        .setMethod(HttpMethod.GET)
        .setUri('/api/test');

      const http = builder.build();
      const [result, error] = await http.send();

      expect(result).toBe('');
      expect(error).toBeInstanceOf(Error);
      expect(error?.message).toBe('Proxy error');
    });

    it('should merge custom headers', async () => {
      mockClient.sendRaw.mockResolvedValue('{"success": true}');

      builder
        .setMethod(HttpMethod.GET)
        .setUri('/api/test')
        .addHeader('X-Custom', 'value');

      const http = builder.build();
      await http.send();

      expect(mockClient.sendRaw).toHaveBeenCalledWith(
        'API/Proxy',
        '',
        expect.any(Map)
      );
    });

    it('should handle pusher callback', async () => {
      mockClient.sendRaw.mockResolvedValue('{"success": true}');

      const pusher = jest.fn();
      builder
        .setMethod(HttpMethod.GET)
        .setUri('/api/test')
        .setPusher(pusher);

      const http = builder.build();
      await http.send();

      expect(pusher).toHaveBeenCalledWith('{"success": true}');
    });
  });
});
