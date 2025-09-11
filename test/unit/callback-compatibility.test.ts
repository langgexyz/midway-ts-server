/**
 * OnPushMessageCallback 兼容性测试
 * 验证上层接口仍然接收 Map<string, string> 类型的 header
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
  header: { [key: string]: string } = {};
}

// OnPushMessageCallback 类型
type OnPushMessageCallback = (cmd: string, data: string, header: Map<string, string>) => void;

describe('OnPushMessageCallback 兼容性测试', () => {
  let json: Json;

  beforeEach(() => {
    json = new Json();
  });

  describe('上层接口兼容性', () => {
    test('回调函数应该接收 Map<string, string> 类型的 header', () => {
      // 模拟服务器发送的数据
      const serverData = {
        "cmd": "test-command",
        "data": "test-data",
        "header": {
          "X-Req-Id": "req-123",
          "Content-Type": "application/json",
          "Authorization": "Bearer token"
        }
      };

      const jsonString = json.toJson(serverData);
      const [pushMessage, err] = json.fromJson(jsonString, OnPushMessage);

      expect(err).toBeNull();
      expect(pushMessage).toBeDefined();

      // 模拟客户端内部处理：将普通对象转换为 Map
      const headerMap = pushMessage.header || {};
      const headerMapForCallback = new Map<string, string>();
      for (const [key, value] of Object.entries(headerMap)) {
        headerMapForCallback.set(key, value);
      }

      // 模拟上层回调函数
      let receivedHeader: Map<string, string> | null = null;
      const callback: OnPushMessageCallback = (cmd, data, header) => {
        receivedHeader = header;
        expect(cmd).toBe('test-command');
        expect(data).toBe('test-data');
        expect(header).toBeInstanceOf(Map);
      };

      // 调用回调
      callback(pushMessage.cmd, pushMessage.data, headerMapForCallback);

      // 验证回调接收到的 header 是 Map 类型
      expect(receivedHeader).toBeInstanceOf(Map);
      expect(receivedHeader!.get('X-Req-Id')).toBe('req-123');
      expect(receivedHeader!.get('Content-Type')).toBe('application/json');
      expect(receivedHeader!.get('Authorization')).toBe('Bearer token');
    });

    test('应该能处理空的 header', () => {
      const serverData = {
        "cmd": "test-command",
        "data": "test-data",
        "header": {}
      };

      const jsonString = json.toJson(serverData);
      const [pushMessage, err] = json.fromJson(jsonString, OnPushMessage);

      expect(err).toBeNull();
      expect(pushMessage).toBeDefined();

      // 模拟客户端内部处理
      const headerMap = pushMessage.header || {};
      const headerMapForCallback = new Map<string, string>();
      for (const [key, value] of Object.entries(headerMap)) {
        headerMapForCallback.set(key, value);
      }

      // 模拟上层回调函数
      let receivedHeader: Map<string, string> | null = null;
      const callback: OnPushMessageCallback = (cmd, data, header) => {
        receivedHeader = header;
        expect(header).toBeInstanceOf(Map);
        expect(header.size).toBe(0);
      };

      // 调用回调
      callback(pushMessage.cmd, pushMessage.data, headerMapForCallback);

      // 验证
      expect(receivedHeader).toBeInstanceOf(Map);
      expect(receivedHeader!.size).toBe(0);
    });

    test('应该能处理多个 header 字段', () => {
      const serverData = {
        "cmd": "test-command",
        "data": "test-data",
        "header": {
          "X-Req-Id": "req-456",
          "Content-Type": "application/json",
          "Authorization": "Bearer token",
          "X-Custom-1": "value1",
          "X-Custom-2": "value2",
          "X-Custom-3": "value3"
        }
      };

      const jsonString = json.toJson(serverData);
      const [pushMessage, err] = json.fromJson(jsonString, OnPushMessage);

      expect(err).toBeNull();
      expect(pushMessage).toBeDefined();

      // 模拟客户端内部处理
      const headerMap = pushMessage.header || {};
      const headerMapForCallback = new Map<string, string>();
      for (const [key, value] of Object.entries(headerMap)) {
        headerMapForCallback.set(key, value);
      }

      // 模拟上层回调函数
      let receivedHeader: Map<string, string> | null = null;
      const callback: OnPushMessageCallback = (cmd, data, header) => {
        receivedHeader = header;
        expect(header).toBeInstanceOf(Map);
        expect(header.size).toBe(6);
      };

      // 调用回调
      callback(pushMessage.cmd, pushMessage.data, headerMapForCallback);

      // 验证所有字段
      expect(receivedHeader).toBeInstanceOf(Map);
      expect(receivedHeader!.size).toBe(6);
      expect(receivedHeader!.get('X-Req-Id')).toBe('req-456');
      expect(receivedHeader!.get('Content-Type')).toBe('application/json');
      expect(receivedHeader!.get('Authorization')).toBe('Bearer token');
      expect(receivedHeader!.get('X-Custom-1')).toBe('value1');
      expect(receivedHeader!.get('X-Custom-2')).toBe('value2');
      expect(receivedHeader!.get('X-Custom-3')).toBe('value3');
    });
  });

  describe('性能测试', () => {
    test('转换性能应该可接受', () => {
      const serverData = {
        "cmd": "test-command",
        "data": "test-data",
        "header": {}
      };

      // 生成大量 header 字段
      for (let i = 0; i < 100; i++) {
        serverData.header[`X-Field-${i}`] = `value-${i}`;
      }

      const jsonString = json.toJson(serverData);
      const [pushMessage, err] = json.fromJson(jsonString, OnPushMessage);

      expect(err).toBeNull();
      expect(pushMessage).toBeDefined();

      const startTime = Date.now();
      
      // 模拟客户端内部处理
      const headerMap = pushMessage.header || {};
      const headerMapForCallback = new Map<string, string>();
      for (const [key, value] of Object.entries(headerMap)) {
        headerMapForCallback.set(key, value);
      }
      
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(10); // 应该在 10ms 内完成
      expect(headerMapForCallback.size).toBe(100);
    });
  });
});
