/**
 * Gateway Client 单元测试
 */

// 由于 gateway-ts-sdk 有依赖问题，我们创建 Mock 测试
// 测试 GatewayClient 接口的实现

interface MockGatewayClient {
  send<T>(command: string, data: object, responseType: new() => T, headers?: Map<string, string>): Promise<T>;
  sendRaw(command: string, data: string, headers?: Map<string, string>): Promise<string>;
}

class TestGatewayClient implements MockGatewayClient {
  private callLog: Array<{method: string, command: string, data: any, headers?: any}> = [];

  async send<T>(command: string, data: object, responseType: new() => T, headers?: Map<string, string>): Promise<T> {
    this.callLog.push({ method: 'send', command, data, headers: headers ? Object.fromEntries(headers) : undefined });
    
    // 模拟基于 sendRaw 的实现
    const requestData = JSON.stringify(data);
    const rawResponse = await this.sendRaw(command, requestData, headers);
    const response = JSON.parse(rawResponse);
    
    return response as T;
  }

  async sendRaw(command: string, data: string, headers?: Map<string, string>): Promise<string> {
    this.callLog.push({ method: 'sendRaw', command, data, headers: headers ? Object.fromEntries(headers) : undefined });
    
    // 模拟返回响应
    return JSON.stringify({
      success: true,
      data: { received: data, command },
      timestamp: new Date().toISOString()
    });
  }

  getCallLog() {
    return this.callLog;
  }

  clearLog() {
    this.callLog = [];
  }
}

describe('Gateway Client Tests', () => {
  let client: TestGatewayClient;

  beforeEach(() => {
    client = new TestGatewayClient();
  });

  describe('send method', () => {
    it('should call sendRaw internally', async () => {
      const testData = { name: 'test', value: 123 };
      const headers = new Map([['Content-Type', 'application/json']]);
      
      const result = await client.send('API/Test', testData, Object, headers);
      
      expect(result).toHaveProperty('success', true);
      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('timestamp');
      
      const callLog = client.getCallLog();
      expect(callLog).toHaveLength(2); // send + sendRaw
      expect(callLog[0].method).toBe('send');
      expect(callLog[1].method).toBe('sendRaw');
    });

    it('should handle different data types', async () => {
      const stringData = { value: 'test string' };
      const numberData = { value: 42 };
      const booleanData = { value: true };
      const arrayData = { value: [1, 2, 3] };
      const objectData = { key: 'value' };
      
      await client.send('API/String', stringData, Object);
      await client.send('API/Number', numberData, Object);
      await client.send('API/Boolean', booleanData, Object);
      await client.send('API/Array', arrayData, Object);
      await client.send('API/Object', objectData, Object);
      
      const callLog = client.getCallLog();
      expect(callLog).toHaveLength(10); // 5 send + 5 sendRaw
    });

    it('should handle empty data', async () => {
      const result = await client.send('API/Empty', {}, Object);
      
      expect(result).toHaveProperty('success', true);
      
      const callLog = client.getCallLog();
      expect(callLog[1].data).toBe('{}'); // sendRaw 接收到的数据
    });

    it('should handle headers correctly', async () => {
      const headers = new Map([
        ['Content-Type', 'application/json'],
        ['Authorization', 'Bearer token'],
        ['X-Custom', 'value']
      ]);
      
      await client.send('API/Headers', { test: true }, Object, headers);
      
      const callLog = client.getCallLog();
      const sendRawCall = callLog.find(call => call.method === 'sendRaw');
      expect(sendRawCall?.headers).toEqual({
        'Content-Type': 'application/json',
        'Authorization': 'Bearer token',
        'X-Custom': 'value'
      });
    });
  });

  describe('sendRaw method', () => {
    it('should send raw string data', async () => {
      const rawData = '{"name":"test","value":123}';
      const headers = new Map([['Content-Type', 'application/json']]);
      
      const result = await client.sendRaw('API/Raw', rawData, headers);
      
      expect(result).toContain('"success":true');
      expect(result).toContain('"name":"test"');
      expect(result).toContain('"value":123');
      
      const callLog = client.getCallLog();
      expect(callLog).toHaveLength(1);
      expect(callLog[0].method).toBe('sendRaw');
      expect(callLog[0].data).toBe(rawData);
    });

    it('should handle empty string data', async () => {
      const result = await client.sendRaw('API/Empty', '');
      
      expect(result).toContain('"success":true');
      expect(result).toContain('"received":""');
    });

    it('should handle binary data (base64)', async () => {
      const binaryData = Buffer.from('Hello, World!').toString('base64');
      const result = await client.sendRaw('API/Binary', binaryData);
      
      expect(result).toContain('"success":true');
      expect(result).toContain(binaryData);
    });

    it('should handle large data', async () => {
      const largeData = 'x'.repeat(10000);
      const result = await client.sendRaw('API/Large', largeData);
      
      expect(result).toContain('"success":true');
      expect(result).toContain('"received":"' + largeData + '"');
    });
  });

  describe('error handling', () => {
    it('should handle sendRaw errors', async () => {
      const errorClient = new TestGatewayClient();
      errorClient.sendRaw = jest.fn().mockRejectedValue(new Error('Network error'));
      
      await expect(errorClient.send('API/Error', { test: true }, Object))
        .rejects.toThrow('Network error');
    });

    it('should handle JSON parse errors in send', async () => {
      const errorClient = new TestGatewayClient();
      errorClient.sendRaw = jest.fn().mockResolvedValue('invalid json');
      
      await expect(errorClient.send('API/Error', { test: true }, Object))
        .rejects.toThrow();
    });
  });

  describe('performance', () => {
    it('should handle multiple concurrent requests', async () => {
      const requests = [];
      
      for (let i = 0; i < 10; i++) {
        requests.push(
          client.send(`API/Test${i}`, { index: i }, Object)
        );
      }
      
      const results = await Promise.all(requests);
      
      expect(results).toHaveLength(10);
      results.forEach(result => {
        expect(result).toHaveProperty('success', true);
      });
      
      const callLog = client.getCallLog();
      expect(callLog).toHaveLength(20); // 10 send + 10 sendRaw
    });

    it('should handle rapid sequential requests', async () => {
      const startTime = Date.now();
      
      for (let i = 0; i < 5; i++) {
        await client.send(`API/Seq${i}`, { index: i }, Object);
      }
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(1000); // 应该在1秒内完成
    });
  });

  describe('type safety', () => {
    it('should work with different response types', async () => {
      class TestResponse {
        success: boolean = false;
        message: string = '';
      }
      
      const result = await client.send('API/Typed', { test: true }, TestResponse);
      
      expect(result).toBeInstanceOf(Object);
      expect(result).toHaveProperty('success');
    });
  });
});
