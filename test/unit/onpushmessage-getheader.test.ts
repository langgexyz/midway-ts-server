/**
 * OnPushMessage.getHeader() 方法测试
 * 验证 getHeader() 方法能正确返回 Map<string, string> 格式的头部信息
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

// OnPushMessage 类
class OnPushMessage {
  cmd: string = "";
  data: string = "";
  header: { [key: string]: string } = {};
  
  /**
   * 获取头部信息为 Map 格式
   * 提供上层接口兼容性，方便使用 Map 的方法
   * @returns Map<string, string> 格式的头部信息
   */
  getHeader(): Map<string, string> {
    const headerMap = new Map<string, string>();
    for (const [key, value] of Object.entries(this.header)) {
      headerMap.set(key, value);
    }
    return headerMap;
  }
}

describe('OnPushMessage.getHeader() 方法测试', () => {
  let json: Json;

  beforeEach(() => {
    json = new Json();
  });

  describe('基本功能测试', () => {
    test('应该返回 Map<string, string> 类型的头部信息', () => {
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

      const headerMap = pushMessage.getHeader();
      expect(headerMap).toBeInstanceOf(Map);
      expect(headerMap.size).toBe(3);
      expect(headerMap.get('X-Req-Id')).toBe('req-123');
      expect(headerMap.get('Content-Type')).toBe('application/json');
      expect(headerMap.get('Authorization')).toBe('Bearer token');
    });

    test('应该处理空的头部信息', () => {
      const serverData = {
        "cmd": "test-command",
        "data": "test-data",
        "header": {}
      };

      const jsonString = json.toJson(serverData);
      const [pushMessage, err] = json.fromJson(jsonString, OnPushMessage);

      expect(err).toBeNull();
      expect(pushMessage).toBeDefined();

      const headerMap = pushMessage.getHeader();
      expect(headerMap).toBeInstanceOf(Map);
      expect(headerMap.size).toBe(0);
    });

    test('应该处理多个头部字段', () => {
      const serverData = {
        "cmd": "test-command",
        "data": "test-data",
        "header": {
          "X-Req-Id": "req-456",
          "Content-Type": "application/json",
          "Authorization": "Bearer token",
          "X-Custom-1": "value1",
          "X-Custom-2": "value2",
          "X-Custom-3": "value3",
          "X-Custom-4": "value4",
          "X-Custom-5": "value5"
        }
      };

      const jsonString = json.toJson(serverData);
      const [pushMessage, err] = json.fromJson(jsonString, OnPushMessage);

      expect(err).toBeNull();
      expect(pushMessage).toBeDefined();

      const headerMap = pushMessage.getHeader();
      expect(headerMap).toBeInstanceOf(Map);
      expect(headerMap.size).toBe(8);
      
      // 验证所有字段
      expect(headerMap.get('X-Req-Id')).toBe('req-456');
      expect(headerMap.get('Content-Type')).toBe('application/json');
      expect(headerMap.get('Authorization')).toBe('Bearer token');
      expect(headerMap.get('X-Custom-1')).toBe('value1');
      expect(headerMap.get('X-Custom-2')).toBe('value2');
      expect(headerMap.get('X-Custom-3')).toBe('value3');
      expect(headerMap.get('X-Custom-4')).toBe('value4');
      expect(headerMap.get('X-Custom-5')).toBe('value5');
    });
  });

  describe('Map 方法测试', () => {
    test('应该支持 Map 的所有方法', () => {
      const serverData = {
        "cmd": "test-command",
        "data": "test-data",
        "header": {
          "X-Req-Id": "req-789",
          "Content-Type": "application/json",
          "Authorization": "Bearer token"
        }
      };

      const jsonString = json.toJson(serverData);
      const [pushMessage, err] = json.fromJson(jsonString, OnPushMessage);

      expect(err).toBeNull();
      expect(pushMessage).toBeDefined();

      const headerMap = pushMessage.getHeader();
      
      // 测试 has 方法
      expect(headerMap.has('X-Req-Id')).toBe(true);
      expect(headerMap.has('NonExistent')).toBe(false);
      
      // 测试 get 方法
      expect(headerMap.get('X-Req-Id')).toBe('req-789');
      expect(headerMap.get('NonExistent')).toBeUndefined();
      
      // 测试 forEach 方法
      const entries: [string, string][] = [];
      headerMap.forEach((value, key) => {
        entries.push([key, value]);
      });
      expect(entries).toHaveLength(3);
      expect(entries).toContainEqual(['X-Req-Id', 'req-789']);
      expect(entries).toContainEqual(['Content-Type', 'application/json']);
      expect(entries).toContainEqual(['Authorization', 'Bearer token']);
      
      // 测试 entries 方法
      const iterator = headerMap.entries();
      const firstEntry = iterator.next().value;
      expect(firstEntry).toHaveLength(2);
      expect(typeof firstEntry[0]).toBe('string');
      expect(typeof firstEntry[1]).toBe('string');
    });
  });

  describe('边界情况测试', () => {
    test('应该处理特殊字符的头部值', () => {
      const serverData = {
        "cmd": "test-command",
        "data": "test-data",
        "header": {
          "X-Req-Id": "req-with-special-chars-123",
          "Content-Type": "application/json; charset=utf-8",
          "Authorization": "Bearer token.with.special-chars",
          "X-Custom": "value with spaces and \"quotes\""
        }
      };

      const jsonString = json.toJson(serverData);
      const [pushMessage, err] = json.fromJson(jsonString, OnPushMessage);

      expect(err).toBeNull();
      expect(pushMessage).toBeDefined();

      const headerMap = pushMessage.getHeader();
      expect(headerMap.get('X-Req-Id')).toBe('req-with-special-chars-123');
      expect(headerMap.get('Content-Type')).toBe('application/json; charset=utf-8');
      expect(headerMap.get('Authorization')).toBe('Bearer token.with.special-chars');
      expect(headerMap.get('X-Custom')).toBe('value with spaces and "quotes"');
    });

    test('应该处理空字符串的头部值', () => {
      const serverData = {
        "cmd": "test-command",
        "data": "test-data",
        "header": {
          "X-Req-Id": "",
          "Content-Type": "application/json",
          "Empty-Value": ""
        }
      };

      const jsonString = json.toJson(serverData);
      const [pushMessage, err] = json.fromJson(jsonString, OnPushMessage);

      expect(err).toBeNull();
      expect(pushMessage).toBeDefined();

      const headerMap = pushMessage.getHeader();
      expect(headerMap.get('X-Req-Id')).toBe('');
      expect(headerMap.get('Content-Type')).toBe('application/json');
      expect(headerMap.get('Empty-Value')).toBe('');
      expect(headerMap.size).toBe(3);
    });
  });

  describe('性能测试', () => {
    test('应该高效处理大量头部字段', () => {
      const serverData = {
        "cmd": "test-command",
        "data": "test-data",
        "header": {}
      };

      // 生成大量头部字段
      for (let i = 0; i < 1000; i++) {
        serverData.header[`X-Field-${i}`] = `value-${i}`;
      }

      const jsonString = json.toJson(serverData);
      const [pushMessage, err] = json.fromJson(jsonString, OnPushMessage);

      expect(err).toBeNull();
      expect(pushMessage).toBeDefined();

      const startTime = Date.now();
      const headerMap = pushMessage.getHeader();
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(50); // 应该在 50ms 内完成
      expect(headerMap.size).toBe(1000);
      expect(headerMap.get('X-Field-0')).toBe('value-0');
      expect(headerMap.get('X-Field-999')).toBe('value-999');
    });
  });
});
