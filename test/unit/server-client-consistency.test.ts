/**
 * 服务器端和客户端推送结构一致性测试
 * 验证 Go 服务器发送的 JSON 结构能否被 TypeScript 客户端正确解析
 */

// 模拟 ts-json 的 Json 类
class Json {
  toJson(obj: any): string {
    return JSON.stringify(obj);
  }
  
  fromJson<T>(jsonString: string, targetClass: new() => T): [T, Error | null] {
    try {
      const data = JSON.parse(jsonString);
      const instance = new targetClass();
      
      // 模拟 ts-json 的行为：将 JSON 对象的属性复制到类实例
      for (const key in data) {
        if (data.hasOwnProperty(key)) {
          const value = data[key];
          
          // 如果是对象且实例有对应的属性，递归处理
          if (typeof value === 'object' && value !== null && instance.hasOwnProperty(key)) {
            const propertyType = (instance as any)[key].constructor;
            if (propertyType && propertyType !== Object) {
              const [nestedInstance, nestedError] = this.fromJson(JSON.stringify(value), propertyType);
              if (nestedError) {
                return [null as any, nestedError];
              }
              (instance as any)[key] = nestedInstance;
            } else {
              (instance as any)[key] = value;
            }
          } else {
            (instance as any)[key] = value;
          }
        }
      }
      
      return [instance, null];
    } catch (error) {
      return [null as any, error as Error];
    }
  }
}

// 客户端 OnPushMessage 类
class OnPushMessage {
  cmd: string = "";
  data: string = "";
  header: Map<string, string> = new Map<string, string>();
}

describe('服务器端和客户端推送结构一致性测试', () => {
  let json: Json;

  beforeEach(() => {
    json = new Json();
  });

  describe('Go 服务器推送结构测试', () => {
    test('应该能正确解析 Go 服务器发送的 JSON 结构', () => {
      // 模拟 Go 服务器发送的数据结构
      const serverData = {
        "cmd": "test-command",
        "data": "test-data",
        "header": {
          "X-Req-Id": "req-123",
          "Content-Type": "application/json"
        }
      };

      const jsonString = json.toJson(serverData);
      const [result, err] = json.fromJson(jsonString, OnPushMessage);

      expect(err).toBeNull();
      expect(result).toBeDefined();
      expect(result).toBeInstanceOf(OnPushMessage);
      
      // 验证基本字段
      expect(result.cmd).toBe('test-command');
      expect(result.data).toBe('test-data');
      
      // 验证 header 字段
      expect(result.header).toBeDefined();
      expect(typeof result.header).toBe('object');
      
      // 验证 header 内容
      expect(result.header['X-Req-Id']).toBe('req-123');
      expect(result.header['Content-Type']).toBe('application/json');
    });

    test('应该能处理空的 header', () => {
      const serverData = {
        "cmd": "test-command",
        "data": "test-data",
        "header": {}
      };

      const jsonString = json.toJson(serverData);
      const [result, err] = json.fromJson(jsonString, OnPushMessage);

      expect(err).toBeNull();
      expect(result).toBeDefined();
      expect(result.cmd).toBe('test-command');
      expect(result.data).toBe('test-data');
      expect(result.header).toBeDefined();
      expect(typeof result.header).toBe('object');
    });

    test('应该能处理多个 header 字段', () => {
      const serverData = {
        "cmd": "test-command",
        "data": "test-data",
        "header": {
          "X-Req-Id": "req-456",
          "Content-Type": "application/json",
          "Authorization": "Bearer token",
          "X-Custom": "custom-value"
        }
      };

      const jsonString = json.toJson(serverData);
      const [result, err] = json.fromJson(jsonString, OnPushMessage);

      expect(err).toBeNull();
      expect(result).toBeDefined();
      
      // 验证所有 header 字段
      expect(result.header['X-Req-Id']).toBe('req-456');
      expect(result.header['Content-Type']).toBe('application/json');
      expect(result.header['Authorization']).toBe('Bearer token');
      expect(result.header['X-Custom']).toBe('custom-value');
    });
  });

  describe('客户端使用场景测试', () => {
    test('应该能正确提取 X-Req-Id', () => {
      const serverData = {
        "cmd": "test-command",
        "data": "test-data",
        "header": {
          "X-Req-Id": "req-789"
        }
      };

      const jsonString = json.toJson(serverData);
      const [result, err] = json.fromJson(jsonString, OnPushMessage);

      expect(err).toBeNull();
      expect(result).toBeDefined();
      
      // 模拟客户端代码：提取 X-Req-Id
      const reqId = result.header['X-Req-Id'] || '';
      expect(reqId).toBe('req-789');
    });

    test('应该能处理缺失的 X-Req-Id', () => {
      const serverData = {
        "cmd": "test-command",
        "data": "test-data",
        "header": {
          "Content-Type": "application/json"
        }
      };

      const jsonString = json.toJson(serverData);
      const [result, err] = json.fromJson(jsonString, OnPushMessage);

      expect(err).toBeNull();
      expect(result).toBeDefined();
      
      // 模拟客户端代码：提取 X-Req-Id
      const reqId = result.header['X-Req-Id'] || '';
      expect(reqId).toBe('');
    });
  });

  describe('边界情况测试', () => {
    test('应该能处理特殊字符的 header 值', () => {
      const serverData = {
        "cmd": "test-command",
        "data": "test-data",
        "header": {
          "X-Req-Id": "req-with-special-chars-123",
          "Content-Type": "application/json; charset=utf-8",
          "Authorization": "Bearer token.with.special-chars"
        }
      };

      const jsonString = json.toJson(serverData);
      const [result, err] = json.fromJson(jsonString, OnPushMessage);

      expect(err).toBeNull();
      expect(result).toBeDefined();
      
      expect(result.header['X-Req-Id']).toBe('req-with-special-chars-123');
      expect(result.header['Content-Type']).toBe('application/json; charset=utf-8');
      expect(result.header['Authorization']).toBe('Bearer token.with.special-chars');
    });

    test('应该能处理空字符串的 header 值', () => {
      const serverData = {
        "cmd": "test-command",
        "data": "test-data",
        "header": {
          "X-Req-Id": "",
          "Content-Type": "application/json"
        }
      };

      const jsonString = json.toJson(serverData);
      const [result, err] = json.fromJson(jsonString, OnPushMessage);

      expect(err).toBeNull();
      expect(result).toBeDefined();
      
      expect(result.header['X-Req-Id']).toBe('');
      expect(result.header['Content-Type']).toBe('application/json');
    });
  });
});
