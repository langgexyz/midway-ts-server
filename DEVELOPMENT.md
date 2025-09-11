# 开发注意事项

## ⚠️ Swagger 文档系统

### 问题说明

MidwayJS 3.20.13 的内置 `@midwayjs/swagger` 组件与 `swagger-ui-dist` 包存在路径冲突：

1. **路径冲突**: 内置组件尝试访问不存在的文件路径
   - `/node_modules/swagger-ui-dist/json` (实际不存在)
   - `/node_modules/swagger-ui-dist/swagger-ui` (实际不存在)

2. **版本兼容性问题**: swagger-ui-dist 4.x+ 版本与 MidwayJS 3.20.13 的期望路径结构不匹配

3. **注解失效**: 内置组件无法正确解析 `@ApiOperation`、`@ApiQuery`、`@ApiParam` 等装饰器注解

### 解决方案

**❌ 错误做法 - 使用内置组件**:
```typescript
// 这会导致路径冲突和404错误
@Configuration({
  imports: [swagger]
})
```

**✅ 正确做法 - 使用自定义实现**:
```typescript
// 禁用内置swagger组件
@Configuration({
  imports: [koa, validate, info]
  // swagger 组件已禁用，使用自定义swagger控制器
})
```

### 自定义Swagger实现特点

- ✅ 完全基于 `@ApiOperation({ summary: '接口描述' })` 注解
- ✅ 支持 `@ApiQuery({ name: 'param' })` 参数注解
- ✅ 支持 `@ApiParam({ name: 'id' })` 路径参数注解
- ✅ 支持 `@ApiResponse({ status: 200 })` 响应注解
- ✅ 使用CDN资源，避免本地依赖冲突
- ✅ 支持完整的OpenAPI 3.0规范
- ✅ 提供交互式Swagger UI界面

### 访问地址

- **Swagger UI**: http://localhost:7001/swagger-ui
- **OpenAPI JSON**: http://localhost:7001/swagger-ui/json

## 🚀 启动和日志管理

### 推荐启动方式

```bash
# 使用管理脚本启动
npm run start:dev

# 查看实时日志
tail -f logs/midway-app.log

# 停止服务
npm run stop
```

### 日志文件位置

- **应用日志**: `logs/midway-app.log`
- **错误日志**: `logs/common-error.log`
- **核心日志**: `logs/midway-core.log`

### 手动启动方式

```bash
# 构建项目
npm run build

# 启动服务
node ./dist/bootstrap.js

# 后台启动
nohup node ./dist/bootstrap.js > logs/app.log 2>&1 &
```

## 🛠️ 开发工具

### 有用的调试命令

```bash
# 检查服务状态
curl http://localhost:7001/api/health

# 检查Swagger文档
curl http://localhost:7001/swagger-ui/json | jq '.'

# 检查端口占用
lsof -i :7001

# 查看进程状态
ps aux | grep node
```

## 📝 代码规范

### Swagger注解使用

```typescript
@ApiTags('用户管理')
@Controller('/api/users')
export class UserController {
  
  @ApiOperation({ 
    summary: '获取用户列表', 
    description: '返回分页的用户信息' 
  })
  @ApiQuery({ 
    name: 'page', 
    required: false, 
    description: '页码',
    example: 1 
  })
  @ApiQuery({ 
    name: 'limit', 
    required: false, 
    description: '每页数量',
    example: 10 
  })
  @ApiResponse({ status: 200, description: '成功获取用户列表' })
  @Get('/users')
  async getUsers(ctx: Context) {
    // 实现代码
  }
}
```

### 配置文件结构

```typescript
// src/config/config.default.ts
export default {
  keys: 'your-secret-key',
  koa: {
    port: 7001,
    hostname: '0.0.0.0'
  },
  midwayLogger: {
    default: {
      level: 'info',
      dir: './logs'
    }
  }
} as MidwayConfig;
```

## 🔧 故障排除

### 常见问题

1. **Swagger返回404**
   - ✅ 确认已禁用内置swagger组件
   - ✅ 检查自定义SwaggerController是否正确注册
   - ✅ 验证路由路径是否正确

2. **服务启动失败**
   - ✅ 检查端口7001是否被占用
   - ✅ 确认TypeScript编译无错误
   - ✅ 检查配置文件格式

3. **日志文件过大**
   - ✅ 配置了日志轮转 (maxFiles: '7d', maxSize: '10m')
   - ✅ 定期清理旧日志文件

### 重置环境

```bash
# 停止服务
npm run stop

# 清理构建
npm run clean

# 重新安装依赖
rm -rf node_modules
npm install

# 重新构建启动
npm run build
npm run start:dev
```

---

**记住**: 在开发过程中遇到Swagger相关问题时，首先检查是否正确禁用了内置swagger组件，并确认自定义实现是否正常工作。
