import { ApiProperty } from '@midwayjs/swagger';

// 基础用户信息类
export class UserInfo {
  @ApiProperty({ description: '用户ID', example: 1 })
  id: number;

  @ApiProperty({ description: '用户姓名', example: '张三' })
  name: string;

  @ApiProperty({ description: '用户邮箱', example: 'zhangsan@example.com' })
  email: string;

  @ApiProperty({ description: '用户年龄', example: 25, required: false })
  age?: number;

  @ApiProperty({ description: '用户标签数组', type: [String], example: ['VIP', '活跃用户'] })
  tags: string[];

  @ApiProperty({ description: '用户权限列表', type: [String], example: ['read', 'write'] })
  permissions: string[];

  @ApiProperty({ description: '创建时间', example: '2024-01-01T00:00:00.000Z', required: false })
  createdAt?: string;
}

// 用户地址信息
export class UserAddress {
  @ApiProperty({ description: '地址ID', example: 1 })
  id: number;

  @ApiProperty({ description: '街道地址', example: '北京市朝阳区xxx街道' })
  street: string;

  @ApiProperty({ description: '城市', example: '北京' })
  city: string;

  @ApiProperty({ description: '国家', example: '中国' })
  country: string;

  @ApiProperty({ description: '是否默认地址', example: true })
  isDefault: boolean;
}

// 扩展的用户信息（包含复杂数组）
export class ExtendedUserInfo extends UserInfo {
  @ApiProperty({
    description: '用户地址列表',
    type: [UserAddress],
    example: [
      { id: 1, street: '北京市朝阳区xxx街道', city: '北京', country: '中国', isDefault: true }
    ]
  })
  addresses: UserAddress[];

  @ApiProperty({
    description: '用户好友列表',
    type: [UserInfo],
    example: [
      { id: 2, name: '李四', email: 'lisi@example.com', tags: ['朋友'], permissions: ['read'] }
    ]
  })
  friends: UserInfo[];

  @ApiProperty({ description: '用户偏好设置', example: { theme: 'dark', language: 'zh-CN' } })
  preferences: Record<string, any>;
}

// 创建用户请求 DTO
export class CreateUserRequest {
  @ApiProperty({ description: '用户姓名', example: '新用户' })
  name: string;

  @ApiProperty({ description: '用户邮箱', example: 'newuser@example.com' })
  email: string;

  @ApiProperty({ description: '用户年龄', example: 25, required: false })
  age?: number;

  @ApiProperty({ description: '用户标签', type: [String], example: ['新用户'], required: false })
  tags?: string[];

  @ApiProperty({ description: '初始权限', type: [String], example: ['read'], required: false })
  permissions?: string[];

  @ApiProperty({
    description: '初始地址列表',
    type: [UserAddress],
    required: false,
    example: [
      { id: 1, street: '上海市浦东新区xxx路', city: '上海', country: '中国', isDefault: true }
    ]
  })
  addresses?: UserAddress[];
}

// 更新用户请求 DTO
export class UpdateUserRequest {
  @ApiProperty({ description: '用户姓名', example: '更新后的姓名', required: false })
  name?: string;

  @ApiProperty({ description: '用户邮箱', example: 'updated@example.com', required: false })
  email?: string;

  @ApiProperty({ description: '用户年龄', example: 26, required: false })
  age?: number;

  @ApiProperty({ description: '用户标签', type: [String], example: ['更新用户'], required: false })
  tags?: string[];

  @ApiProperty({ description: '用户权限', type: [String], example: ['read', 'write'], required: false })
  permissions?: string[];
}

// 部分更新用户请求 DTO
export class PatchUserRequest {
  @ApiProperty({ description: '用户姓名', example: '新姓名', required: false })
  name?: string;

  @ApiProperty({ description: '用户邮箱', example: 'patched@example.com', required: false })
  email?: string;

  @ApiProperty({ description: '用户年龄', example: 27, required: false })
  age?: number;

  @ApiProperty({ description: '用户标签', type: [String], example: ['部分更新'], required: false })
  tags?: string[];

  @ApiProperty({ description: '用户权限', type: [String], example: ['admin'], required: false })
  permissions?: string[];
}

// 批量操作请求 DTO
export class BatchUserRequest {
  @ApiProperty({ description: '用户ID列表', type: [Number], example: [1, 2, 3] })
  userIds: number[];

  @ApiProperty({ description: '操作类型', example: 'activate' })
  action: string;

  @ApiProperty({ description: '操作参数', required: false })
  params?: Record<string, any>;
}

export class PaginationInfo {
  @ApiProperty({ description: '当前页码', example: 1 })
  page: number;

  @ApiProperty({ description: '每页数量', example: 10 })
  limit: number;

  @ApiProperty({ description: '总记录数', example: 100 })
  total: number;

  @ApiProperty({ description: '总页数', example: 10 })
  pages: number;
}

export class UserListData {
  @ApiProperty({ description: '用户列表', type: [ExtendedUserInfo] })
  users: ExtendedUserInfo[];

  @ApiProperty({ description: '分页信息', type: () => PaginationInfo })
  pagination: PaginationInfo;

  @ApiProperty({ description: '统计信息', required: false })
  stats?: {
    totalActive: number;
    totalInactive: number;
    averageAge: number;
  };
}

// 用户列表响应 DTO
export class UserListResponse {
  @ApiProperty({ description: '操作是否成功', example: true })
  success: boolean;

  @ApiProperty({ description: '响应消息', example: '获取用户列表成功' })
  message: string;

  @ApiProperty({
    description: '用户数据',
    type: () => UserListData
  })
  data: UserListData;

  @ApiProperty({ description: '响应时间戳', example: '2024-01-01T00:00:00.000Z' })
  timestamp: string;
}

// 用户搜索请求 DTO
export class UserSearchRequest {
  @ApiProperty({ description: '搜索关键词', example: '张三', required: false })
  keyword?: string;

  @ApiProperty({ description: '标签筛选', type: [String], example: ['VIP'], required: false })
  tags?: string[];

  @ApiProperty({ description: '权限筛选', type: [String], example: ['admin'], required: false })
  permissions?: string[];

  @ApiProperty({ description: '城市筛选', type: [String], example: ['北京', '上海'], required: false })
  cities?: string[];

  @ApiProperty({ description: '年龄范围', example: { min: 18, max: 65 }, required: false })
  ageRange?: {
    min?: number;
    max?: number;
  };

  @ApiProperty({ description: '分页信息', required: false })
  pagination?: {
    page?: number;
    limit?: number;
  };
}