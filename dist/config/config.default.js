"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    // use for cookie sign key, should change to your own and keep security
    keys: '1640995200_7110',
    koa: {
        port: 7001,
    },
    swagger: {
        title: 'Gateway 测试 API',
        description: '用于测试 SDK 生成和网关转发的 RESTful API',
        version: '1.0.0',
        contact: {
            name: 'Gateway Team',
            email: 'team@gateway.com'
        },
        license: {
            name: 'MIT',
            url: 'https://opensource.org/licenses/MIT'
        },
        servers: [
            {
                url: 'http://localhost:7001',
                description: '开发环境'
            }
        ],
        tags: [
            {
                name: 'API',
                description: 'RESTful API 测试接口'
            }
        ],
        // 启用 Swagger
        enable: true,
        // 指定 JSON 端点路径
        swaggerJsonPath: '/swagger-ui/json'
    }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlnLmRlZmF1bHQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvY29uZmlnL2NvbmZpZy5kZWZhdWx0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBRUEsa0JBQWU7SUFDYix1RUFBdUU7SUFDdkUsSUFBSSxFQUFFLGlCQUFpQjtJQUN2QixHQUFHLEVBQUU7UUFDSCxJQUFJLEVBQUUsSUFBSTtLQUNYO0lBQ0QsT0FBTyxFQUFFO1FBQ1AsS0FBSyxFQUFFLGdCQUFnQjtRQUN2QixXQUFXLEVBQUUsK0JBQStCO1FBQzVDLE9BQU8sRUFBRSxPQUFPO1FBQ2hCLE9BQU8sRUFBRTtZQUNQLElBQUksRUFBRSxjQUFjO1lBQ3BCLEtBQUssRUFBRSxrQkFBa0I7U0FDMUI7UUFDRCxPQUFPLEVBQUU7WUFDUCxJQUFJLEVBQUUsS0FBSztZQUNYLEdBQUcsRUFBRSxxQ0FBcUM7U0FDM0M7UUFDRCxPQUFPLEVBQUU7WUFDUDtnQkFDRSxHQUFHLEVBQUUsdUJBQXVCO2dCQUM1QixXQUFXLEVBQUUsTUFBTTthQUNwQjtTQUNGO1FBQ0QsSUFBSSxFQUFFO1lBQ0o7Z0JBQ0UsSUFBSSxFQUFFLEtBQUs7Z0JBQ1gsV0FBVyxFQUFFLGtCQUFrQjthQUNoQztTQUNGO1FBQ0QsYUFBYTtRQUNiLE1BQU0sRUFBRSxJQUFJO1FBQ1osZUFBZTtRQUNmLGVBQWUsRUFBRSxrQkFBa0I7S0FDcEM7Q0FDYyxDQUFDIn0=