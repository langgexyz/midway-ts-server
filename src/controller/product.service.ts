import { Controller, Get, Put, Del, Patch } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBody } from '@midwayjs/swagger';

/**
 * 产品服务 - 演示不以Controller结尾的类名
 * 包含多路径参数的复杂API结构
 */
@ApiTags('产品服务')
@Controller('/api/products')
export class ProductService {

  /**
   * GET /api/products - 获取产品列表
   */
  @ApiOperation({ summary: '获取产品列表', description: '支持分类筛选和排序的产品列表' })
  @ApiQuery({ 
    name: 'category', 
    required: false, 
    description: '产品分类', 
    schema: { enum: ['electronics', 'clothing', 'books', 'food'], type: 'string' },
    example: 'electronics' 
  })
  @ApiQuery({ 
    name: 'brand', 
    required: false, 
    description: '品牌筛选', 
    example: 'Apple' 
  })
  @ApiQuery({ 
    name: 'minPrice', 
    required: false, 
    description: '最低价格', 
    schema: { type: 'number', minimum: 0 },
    example: 100 
  })
  @ApiQuery({ 
    name: 'maxPrice', 
    required: false, 
    description: '最高价格', 
    schema: { type: 'number', minimum: 0 },
    example: 5000 
  })
  @ApiQuery({ 
    name: 'sort', 
    required: false, 
    description: '排序字段', 
    schema: { enum: ['price', 'name', 'rating', 'sales'], type: 'string' },
    example: 'price' 
  })
  @ApiQuery({ 
    name: 'order', 
    required: false, 
    description: '排序方向', 
    schema: { enum: ['asc', 'desc'], type: 'string' },
    example: 'asc' 
  })
  @ApiResponse({ status: 200, description: '产品列表获取成功' })
  @Get('/')
  async getProducts(ctx: Context) {
    const { category, brand, minPrice, maxPrice, sort = 'name', order = 'asc' } = ctx.query;
    
    // 模拟产品数据
    const products = [
      { id: 1, name: 'iPhone 15', category: 'electronics', brand: 'Apple', price: 6999, rating: 4.8, sales: 15000 },
      { id: 2, name: 'MacBook Pro', category: 'electronics', brand: 'Apple', price: 12999, rating: 4.9, sales: 8000 },
      { id: 3, name: 'Nike Air Max', category: 'clothing', brand: 'Nike', price: 899, rating: 4.5, sales: 25000 },
      { id: 4, name: 'TypeScript实战', category: 'books', brand: '人民邮电', price: 89, rating: 4.7, sales: 5000 }
    ];

    let filteredProducts = products;
    
    // 分类筛选
    if (category) {
      filteredProducts = filteredProducts.filter(p => p.category === category);
    }
    
    // 品牌筛选
    if (brand) {
      const brandStr = Array.isArray(brand) ? brand[0] : brand;
      filteredProducts = filteredProducts.filter(p => p.brand.includes(brandStr));
    }
    
    // 价格筛选
    if (minPrice) {
      filteredProducts = filteredProducts.filter(p => p.price >= Number(minPrice));
    }
    if (maxPrice) {
      filteredProducts = filteredProducts.filter(p => p.price <= Number(maxPrice));
    }

    ctx.body = {
      success: true,
      data: {
        products: filteredProducts,
        filters: { category, brand, minPrice, maxPrice },
        sorting: { sort, order },
        total: filteredProducts.length
      },
      timestamp: new Date().toISOString()
    };
  }

  /**
   * GET /api/products/{categoryId}/brands/{brandId}/items/{itemId} - 多层级路径参数
   */
  @ApiOperation({ 
    summary: '获取特定品牌分类下的产品详情', 
    description: '通过分类ID、品牌ID和产品ID获取详细信息' 
  })
  @ApiParam({ name: 'categoryId', description: '分类ID', example: 'electronics' })
  @ApiParam({ name: 'brandId', description: '品牌ID', example: 'apple' })
  @ApiParam({ name: 'itemId', description: '产品ID', example: '12345' })
  @ApiQuery({ 
    name: 'includeReviews', 
    required: false, 
    description: '是否包含评价信息',
    schema: { type: 'boolean' },
    example: true 
  })
  @ApiQuery({ 
    name: 'reviewLimit', 
    required: false, 
    description: '评价数量限制',
    schema: { type: 'number', minimum: 1, maximum: 50 },
    example: 10 
  })
  @ApiResponse({ status: 200, description: '产品详情获取成功' })
  @ApiResponse({ status: 404, description: '产品不存在' })
  @Get('/:categoryId/brands/:brandId/items/:itemId')
  async getProductDetail(ctx: Context) {
    const { categoryId, brandId, itemId } = ctx.params;
    const { includeReviews, reviewLimit = 5 } = ctx.query;

    // 模拟产品详情
    const productDetail = {
      id: itemId,
      name: 'iPhone 15 Pro Max',
      category: { id: categoryId, name: '电子产品' },
      brand: { id: brandId, name: 'Apple' },
      price: 9999,
      description: '最新款iPhone，搭载A17 Pro芯片',
      specifications: {
        screen: '6.7英寸',
        storage: '256GB',
        color: '深空黑',
        weight: '221g'
      },
      inventory: {
        inStock: true,
        quantity: 50,
        warehouse: '上海仓库'
      }
    };

    // 如果需要包含评价
    if (includeReviews === 'true') {
      productDetail['reviews'] = Array.from({ length: Number(reviewLimit) }, (_, i) => ({
        id: i + 1,
        user: `用户${i + 1}`,
        rating: 4 + Math.random(),
        comment: `这是第${i + 1}条评价，产品很不错！`,
        date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString()
      }));
    }

    ctx.body = {
      success: true,
      data: productDetail,
      meta: {
        categoryId,
        brandId,
        itemId,
        includeReviews: includeReviews === 'true',
        reviewCount: includeReviews === 'true' ? Number(reviewLimit) : 0
      },
      timestamp: new Date().toISOString()
    };
  }

  /**
   * PUT /api/products/{productId}/categories/{categoryId} - 更新产品分类
   */
  @ApiOperation({ 
    summary: '更新产品分类', 
    description: '将指定产品移动到新的分类下' 
  })
  @ApiParam({ name: 'productId', description: '产品ID', example: '12345' })
  @ApiParam({ name: 'categoryId', description: '新分类ID', example: 'electronics' })
  @ApiBody({
    description: '分类更新信息',
    schema: {
      type: 'object',
      properties: {
        reason: { type: 'string', description: '更改原因', example: '产品重新分类' },
        effective_date: { type: 'string', format: 'date', description: '生效日期', example: '2024-01-01' },
        notify_users: { type: 'boolean', description: '是否通知用户', example: true }
      },
      required: ['reason']
    }
  })
  @ApiResponse({ status: 200, description: '分类更新成功' })
  @ApiResponse({ status: 404, description: '产品或分类不存在' })
  @Put('/:productId/categories/:categoryId')
  async updateProductCategory(ctx: Context) {
    const { productId, categoryId } = ctx.params;
    const body = ctx.request.body as any;
    const { reason, effective_date, notify_users = false } = body;

    if (!reason) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        message: '更改原因不能为空',
        timestamp: new Date().toISOString()
      };
      return;
    }

    ctx.body = {
      success: true,
      data: {
        productId,
        oldCategory: 'clothing',
        newCategory: categoryId,
        reason,
        effectiveDate: effective_date || new Date().toISOString().split('T')[0],
        notifyUsers: notify_users,
        updatedAt: new Date().toISOString()
      },
      message: '产品分类更新成功',
      timestamp: new Date().toISOString()
    };
  }

  /**
   * DELETE /api/products/{productId}/reviews/{reviewId}/replies/{replyId} - 三层级删除
   */
  @ApiOperation({ 
    summary: '删除评价回复', 
    description: '删除指定产品评价下的特定回复' 
  })
  @ApiParam({ name: 'productId', description: '产品ID', example: '12345' })
  @ApiParam({ name: 'reviewId', description: '评价ID', example: '67890' })
  @ApiParam({ name: 'replyId', description: '回复ID', example: '11111' })
  @ApiQuery({ 
    name: 'reason', 
    required: false, 
    description: '删除原因',
    schema: { enum: ['spam', 'inappropriate', 'duplicate', 'other'], type: 'string' },
    example: 'spam' 
  })
  @ApiResponse({ status: 204, description: '回复删除成功' })
  @ApiResponse({ status: 404, description: '回复不存在' })
  @Del('/:productId/reviews/:reviewId/replies/:replyId')
  async deleteReviewReply(ctx: Context) {
    const { productId, reviewId, replyId } = ctx.params;
    const { reason = 'other' } = ctx.query;

    // 模拟删除操作
    console.log(`删除产品${productId}评价${reviewId}下的回复${replyId}，原因：${reason}`);

    ctx.status = 204; // No Content
  }

  /**
   * PATCH /api/products/{id}/inventory/{warehouseId}/adjust - 复杂PATCH操作
   */
  @ApiOperation({ 
    summary: '调整仓库库存', 
    description: '调整指定产品在特定仓库的库存数量' 
  })
  @ApiParam({ name: 'id', description: '产品ID', example: '12345' })
  @ApiParam({ name: 'warehouseId', description: '仓库ID', example: 'WH001' })
  @ApiBody({
    description: '库存调整信息',
    schema: {
      type: 'object',
      properties: {
        adjustment_type: { 
          type: 'string', 
          enum: ['increase', 'decrease', 'set'], 
          description: '调整类型',
          example: 'increase' 
        },
        quantity: { 
          type: 'number', 
          description: '调整数量（set类型时为目标数量）',
          example: 100 
        },
        reason: { 
          type: 'string', 
          description: '调整原因',
          example: '新货入库' 
        },
        operator: { 
          type: 'string', 
          description: '操作员',
          example: '张三' 
        }
      },
      required: ['adjustment_type', 'quantity', 'reason', 'operator']
    }
  })
  @ApiResponse({ status: 200, description: '库存调整成功' })
  @ApiResponse({ status: 400, description: '调整参数错误' })
  @Patch('/:id/inventory/:warehouseId/adjust')
  async adjustInventory(ctx: Context) {
    const { id, warehouseId } = ctx.params;
    const body = ctx.request.body as any;
    const { adjustment_type, quantity, reason, operator } = body;

    if (!adjustment_type || !quantity || !reason || !operator) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        message: '调整类型、数量、原因和操作员都是必填项',
        timestamp: new Date().toISOString()
      };
      return;
    }

    // 模拟当前库存
    const currentStock = 250;
    let newStock;

    switch (adjustment_type) {
      case 'increase':
        newStock = currentStock + Number(quantity);
        break;
      case 'decrease':
        newStock = Math.max(0, currentStock - Number(quantity));
        break;
      case 'set':
        newStock = Number(quantity);
        break;
      default:
        ctx.status = 400;
        ctx.body = {
          success: false,
          message: '无效的调整类型',
          timestamp: new Date().toISOString()
        };
        return;
    }

    ctx.body = {
      success: true,
      data: {
        productId: id,
        warehouseId,
        adjustmentType: adjustment_type,
        quantity: Number(quantity),
        previousStock: currentStock,
        newStock,
        reason,
        operator,
        adjustedAt: new Date().toISOString(),
        adjustmentId: `ADJ-${Date.now()}`
      },
      message: '库存调整成功',
      timestamp: new Date().toISOString()
    };
  }
}
