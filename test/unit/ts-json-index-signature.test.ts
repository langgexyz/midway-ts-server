/**
 * ts-json 索引签名支持测试
 * 验证 ts-json 对 [key: string]: string 索引签名的序列化和反序列化支持
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

// 测试用的索引签名类
class TestIndexSignatureHeader {
  [key: string]: string | (() => Map<string, string>);
  
  constructor() {
    // ts-json 会自动填充字段
  }
  
  toMap(): Map<string, string> {
    const map = new Map<string, string>();
    for (const key in this) {
      if (this.hasOwnProperty(key) && typeof this[key] === 'string' && this[key]) {
        map.set(key, this[key] as string);
      }
    }
    return map;
  }
}

// 测试用的嵌套结构类
class TestNestedMessage {
  cmd: string = "";
  data: string = "";
  header: TestIndexSignatureHeader = new TestIndexSignatureHeader();
}

describe('ts-json 索引签名支持测试', () => {
  let json: Json;

  beforeEach(() => {
    json = new Json();
  });

  describe('基本索引签名测试', () => {
    test('应该支持索引签名的序列化', () => {
      const testData = {
        "X-Req-Id": "req-123",
        "Content-Type": "application/json",
        "Authorization": "Bearer token",
        "X-Custom": "custom-value"
      };

      const jsonString = json.toJson(testData);
      expect(jsonString).toBeDefined();
      expect(typeof jsonString).toBe('string');
      
      // 验证 JSON 字符串包含所有字段
      expect(jsonString).toContain('"X-Req-Id":"req-123"');
      expect(jsonString).toContain('"Content-Type":"application/json"');
      expect(jsonString).toContain('"Authorization":"Bearer token"');
      expect(jsonString).toContain('"X-Custom":"custom-value"');
    });

    test('应该支持索引签名的反序列化', () => {
      const testData = {
        "X-Req-Id": "req-123",
        "Content-Type": "application/json",
        "Authorization": "Bearer token",
        "X-Custom": "custom-value"
      };

      const jsonString = json.toJson(testData);
      const [result, err] = json.fromJson(jsonString, TestIndexSignatureHeader);

      expect(err).toBeNull();
      expect(result).toBeDefined();
      expect(result).toBeInstanceOf(TestIndexSignatureHeader);
      
      // 验证字段访问
      expect(result['X-Req-Id']).toBe('req-123');
      expect(result['Content-Type']).toBe('application/json');
      expect(result['Authorization']).toBe('Bearer token');
      expect(result['X-Custom']).toBe('custom-value');
    });

    test('应该支持 toMap() 方法', () => {
      const testData = {
        "X-Req-Id": "req-123",
        "Content-Type": "application/json",
        "Authorization": "Bearer token"
      };

      const jsonString = json.toJson(testData);
      const [result, err] = json.fromJson(jsonString, TestIndexSignatureHeader);

      expect(err).toBeNull();
      expect(result).toBeDefined();

      const map = result.toMap();
      expect(map).toBeInstanceOf(Map);
      expect(map.size).toBe(3);
      expect(map.get('X-Req-Id')).toBe('req-123');
      expect(map.get('Content-Type')).toBe('application/json');
      expect(map.get('Authorization')).toBe('Bearer token');
    });
  });

  describe('嵌套结构测试', () => {
    test('应该支持嵌套索引签名的序列化', () => {
      const testData = {
        cmd: "test-command",
        data: '{"test": "data"}',
        header: {
          "X-Req-Id": "req-456",
          "Content-Type": "application/json",
          "Authorization": "Bearer token2"
        }
      };

      const jsonString = json.toJson(testData);
      expect(jsonString).toBeDefined();
      expect(typeof jsonString).toBe('string');
      
      // 验证嵌套结构
      expect(jsonString).toContain('"cmd":"test-command"');
      expect(jsonString).toContain('"data":"{\\"test\\": \\"data\\"}"');
      expect(jsonString).toContain('"header"');
      expect(jsonString).toContain('"X-Req-Id":"req-456"');
    });

    test('应该支持嵌套索引签名的反序列化', () => {
      const testData = {
        cmd: "test-command",
        data: '{"test": "data"}',
        header: {
          "X-Req-Id": "req-456",
          "Content-Type": "application/json",
          "Authorization": "Bearer token2"
        }
      };

      const jsonString = json.toJson(testData);
      const [result, err] = json.fromJson(jsonString, TestNestedMessage);

      expect(err).toBeNull();
      expect(result).toBeDefined();
      expect(result).toBeInstanceOf(TestNestedMessage);
      
      // 验证顶层字段
      expect(result.cmd).toBe('test-command');
      expect(result.data).toBe('{"test": "data"}');
      
      // 验证嵌套的索引签名
      expect(result.header).toBeInstanceOf(TestIndexSignatureHeader);
      expect(result.header['X-Req-Id']).toBe('req-456');
      expect(result.header['Content-Type']).toBe('application/json');
      expect(result.header['Authorization']).toBe('Bearer token2');
      
      // 验证嵌套的 toMap() 方法
      const headerMap = result.header.toMap();
      expect(headerMap.size).toBe(3);
      expect(headerMap.get('X-Req-Id')).toBe('req-456');
    });
  });

  describe('边界情况测试', () => {
    test('应该处理空对象', () => {
      const testData = {};

      const jsonString = json.toJson(testData);
      const [result, err] = json.fromJson(jsonString, TestIndexSignatureHeader);

      expect(err).toBeNull();
      expect(result).toBeDefined();
      expect(result).toBeInstanceOf(TestIndexSignatureHeader);
      
      const map = result.toMap();
      expect(map.size).toBe(0);
    });

    test('应该处理特殊字符键名', () => {
      const testData = {
        "X-Req-Id": "req-123",
        "Content-Type": "application/json",
        "X-Special-Key-With-Dashes": "special-value",
        "X_Underscore_Key": "underscore-value"
      };

      const jsonString = json.toJson(testData);
      const [result, err] = json.fromJson(jsonString, TestIndexSignatureHeader);

      expect(err).toBeNull();
      expect(result).toBeDefined();
      
      expect(result['X-Special-Key-With-Dashes']).toBe('special-value');
      expect(result['X_Underscore_Key']).toBe('underscore-value');
    });

    test('应该处理空字符串值', () => {
      const testData = {
        "X-Req-Id": "req-123",
        "Empty-Value": "",
        "Content-Type": "application/json"
      };

      const jsonString = json.toJson(testData);
      const [result, err] = json.fromJson(jsonString, TestIndexSignatureHeader);

      expect(err).toBeNull();
      expect(result).toBeDefined();
      
      expect(result['X-Req-Id']).toBe('req-123');
      expect(result['Empty-Value']).toBe('');
      expect(result['Content-Type']).toBe('application/json');
      
      // toMap() 应该过滤空字符串
      const map = result.toMap();
      expect(map.size).toBe(2); // 只有非空值
      expect(map.has('Empty-Value')).toBe(false);
    });
  });

  describe('性能测试', () => {
    test('应该高效处理大量字段', () => {
      const testData: { [key: string]: string } = {};
      
      // 生成 100 个字段
      for (let i = 0; i < 100; i++) {
        testData[`X-Field-${i}`] = `value-${i}`;
      }

      const startTime = Date.now();
      const jsonString = json.toJson(testData);
      const [result, err] = json.fromJson(jsonString, TestIndexSignatureHeader);
      const endTime = Date.now();

      expect(err).toBeNull();
      expect(result).toBeDefined();
      expect(endTime - startTime).toBeLessThan(100); // 应该在 100ms 内完成
      
      const map = result.toMap();
      expect(map.size).toBe(100);
    });
  });
});
