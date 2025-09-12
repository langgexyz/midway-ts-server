/**
 * 覆盖率测试
 */

import { recordToMap, mapToRecord } from 'openapi-ts-sdk';

describe('Coverage Test', () => {
  it('should test header converter functions', () => {
    // 测试 recordToMap
    const record = { 'test': 'value' };
    const map = recordToMap(record);
    expect(map.get('test')).toBe('value');

    // 测试 mapToRecord
    const newMap = new Map([['test2', 'value2']]);
    const newRecord = mapToRecord(newMap);
    expect(newRecord['test2']).toBe('value2');
  });
});
