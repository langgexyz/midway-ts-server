import { ApiProperty } from '@midwayjs/swagger';

// 订单商品项
export class OrderItem {
  @ApiProperty({ description: '商品ID', example: 'PROD001' })
  productId: string;

  @ApiProperty({ description: '商品名称', example: 'iPhone 15' })
  productName: string;

  @ApiProperty({ description: '商品数量', example: 2 })
  quantity: number;

  @ApiProperty({ description: '单价', example: 8999.00 })
  unitPrice: number;

  @ApiProperty({ description: '总价', example: 17998.00 })
  totalPrice: number;

  @ApiProperty({ description: '商品规格', type: [String], example: ['256GB', '深空灰色'] })
  specifications: string[];

  @ApiProperty({ description: '商品标签', type: [String], example: ['热销', '新品'] })
  tags: string[];
}

// 配送地址
export class ShippingAddress {
  @ApiProperty({ description: '收件人姓名', example: '张三' })
  receiverName: string;

  @ApiProperty({ description: '收件人电话', example: '13800138000' })
  receiverPhone: string;

  @ApiProperty({ description: '详细地址', example: '北京市朝阳区xxx街道xxx号' })
  address: string;

  @ApiProperty({ description: '邮编', example: '100000' })
  zipCode: string;
}

// 订单信息
export class OrderInfo {
  @ApiProperty({ description: '订单ID', example: 'ORDER001' })
  id: string;

  @ApiProperty({ description: '用户ID', example: 'USER001' })
  userId: string;

  @ApiProperty({ description: '订单状态', example: 'pending' })
  status: string;

  @ApiProperty({ description: '订单商品列表', type: [OrderItem] })
  items: OrderItem[];

  @ApiProperty({ description: '订单总金额', example: 17998.00 })
  totalAmount: number;

  @ApiProperty({ description: '配送地址', type: () => ShippingAddress })
  shippingAddress: ShippingAddress;

  @ApiProperty({ description: '订单标签', type: [String], example: ['急单', '优先配送'] })
  orderTags: string[];

  @ApiProperty({ description: '支付方式列表', type: [String], example: ['支付宝', '微信支付'] })
  paymentMethods: string[];

  @ApiProperty({ description: '创建时间', example: '2024-01-01T00:00:00.000Z' })
  createdAt: string;

  @ApiProperty({ description: '更新时间', example: '2024-01-01T00:00:00.000Z' })
  updatedAt: string;
}

// 创建订单请求
export class CreateOrderRequest {
  @ApiProperty({ description: '用户ID', example: 'USER001' })
  userId: string;

  @ApiProperty({ description: '订单商品列表', type: [OrderItem] })
  items: OrderItem[];

  @ApiProperty({ description: '配送地址', type: () => ShippingAddress })
  shippingAddress: ShippingAddress;

  @ApiProperty({ description: '订单备注', example: '请尽快发货', required: false })
  note?: string;

  @ApiProperty({ description: '优惠券代码列表', type: [String], example: ['COUPON001'], required: false })
  couponCodes?: string[];

  @ApiProperty({ description: '支付方式', type: [String], example: ['支付宝'] })
  paymentMethods: string[];
}

// 批量订单操作请求
export class BatchOrderRequest {
  @ApiProperty({ description: '订单ID列表', type: [String], example: ['ORDER001', 'ORDER002'] })
  orderIds: string[];

  @ApiProperty({ description: '操作类型', example: 'cancel' })
  action: string;

  @ApiProperty({ description: '操作原因', example: '用户申请退款' })
  reason: string;

  @ApiProperty({ description: '通知用户列表', type: [String], example: ['USER001', 'USER002'], required: false })
  notifyUsers?: string[];
}

// 订单统计信息
export class OrderStats {
  @ApiProperty({ description: '总订单数', example: 1000 })
  totalOrders: number;

  @ApiProperty({ description: '各状态订单数量', example: { pending: 100, paid: 200, shipped: 300 } })
  statusCounts: Record<string, number>;

  @ApiProperty({ description: '热销商品ID列表', type: [String], example: ['PROD001', 'PROD002'] })
  hotProducts: string[];

  @ApiProperty({ description: '活跃用户ID列表', type: [String], example: ['USER001', 'USER002'] })
  activeUsers: string[];

  @ApiProperty({ description: '每日订单量', type: [Number], example: [10, 15, 20, 25, 30] })
  dailyOrderCounts: number[];

  @ApiProperty({ description: '销售额统计', type: [Number], example: [1000, 1500, 2000] })
  revenueStats: number[];
}

// 订单列表响应
export class OrderListResponse {
  @ApiProperty({ description: '操作是否成功', example: true })
  success: boolean;

  @ApiProperty({ description: '响应消息', example: '获取订单列表成功' })
  message: string;

  @ApiProperty({ description: '订单数据', type: () => OrderListData })
  data: OrderListData;

  @ApiProperty({ description: '响应时间戳', example: '2024-01-01T00:00:00.000Z' })
  timestamp: string;
}

export class OrderListData {
  @ApiProperty({ description: '订单列表', type: [OrderInfo] })
  orders: OrderInfo[];

  @ApiProperty({ description: '分页信息' })
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };

  @ApiProperty({ description: '统计信息', type: () => OrderStats })
  stats: OrderStats;
}

// 订单搜索请求
export class OrderSearchRequest {
  @ApiProperty({ description: '订单ID列表', type: [String], example: ['ORDER001'], required: false })
  orderIds?: string[];

  @ApiProperty({ description: '用户ID列表', type: [String], example: ['USER001'], required: false })
  userIds?: string[];

  @ApiProperty({ description: '订单状态列表', type: [String], example: ['pending', 'paid'], required: false })
  statusList?: string[];

  @ApiProperty({ description: '商品ID列表', type: [String], example: ['PROD001'], required: false })
  productIds?: string[];

  @ApiProperty({ description: '订单标签筛选', type: [String], example: ['急单'], required: false })
  orderTags?: string[];

  @ApiProperty({ description: '金额范围', example: { min: 100, max: 1000 }, required: false })
  amountRange?: {
    min?: number;
    max?: number;
  };

  @ApiProperty({ description: '时间范围', required: false })
  dateRange?: {
    startDate?: string;
    endDate?: string;
  };
}