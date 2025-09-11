"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContainerLifeCycle = void 0;
const tslib_1 = require("tslib");
const core_1 = require("@midwayjs/core");
const koa = tslib_1.__importStar(require("@midwayjs/koa"));
const validate = tslib_1.__importStar(require("@midwayjs/validate"));
const info = tslib_1.__importStar(require("@midwayjs/info"));
const swagger = tslib_1.__importStar(require("@midwayjs/swagger"));
const path_1 = require("path");
const default_filter_1 = require("./filter/default.filter");
const report_middleware_1 = require("./middleware/report.middleware");
let ContainerLifeCycle = class ContainerLifeCycle {
    async onReady() {
        // add middleware
        this.app.useMiddleware([report_middleware_1.ReportMiddleware]);
        // add filter
        this.app.useFilter([default_filter_1.DefaultErrorFilter]);
        console.log('🔧 MidwayJS 容器初始化完成');
        console.log('🧪 系统性测试服务已就绪');
    }
};
exports.ContainerLifeCycle = ContainerLifeCycle;
tslib_1.__decorate([
    (0, core_1.App)(),
    tslib_1.__metadata("design:type", Object)
], ContainerLifeCycle.prototype, "app", void 0);
exports.ContainerLifeCycle = ContainerLifeCycle = tslib_1.__decorate([
    (0, core_1.Configuration)({
        imports: [
            koa,
            validate,
            info,
            swagger
        ],
        importConfigs: [(0, path_1.join)(__dirname, './config')]
    })
], ContainerLifeCycle);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlndXJhdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9jb25maWd1cmF0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7QUFBQSx5Q0FBb0Q7QUFDcEQsMkRBQXFDO0FBQ3JDLHFFQUErQztBQUMvQyw2REFBdUM7QUFDdkMsbUVBQTZDO0FBQzdDLCtCQUE0QjtBQUM1Qiw0REFBNkQ7QUFDN0Qsc0VBQWtFO0FBVzNELElBQU0sa0JBQWtCLEdBQXhCLE1BQU0sa0JBQWtCO0lBSTdCLEtBQUssQ0FBQyxPQUFPO1FBQ1gsaUJBQWlCO1FBQ2pCLElBQUksQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFDLENBQUMsb0NBQWdCLENBQUMsQ0FBQyxDQUFDO1FBRTNDLGFBQWE7UUFDYixJQUFJLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDLG1DQUFrQixDQUFDLENBQUMsQ0FBQztRQUV6QyxPQUFPLENBQUMsR0FBRyxDQUFDLHFCQUFxQixDQUFDLENBQUM7UUFDbkMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxlQUFlLENBQUMsQ0FBQztJQUMvQixDQUFDO0NBQ0YsQ0FBQTtBQWRZLGdEQUFrQjtBQUU3QjtJQURDLElBQUEsVUFBRyxHQUFFOzsrQ0FDZ0I7NkJBRlgsa0JBQWtCO0lBVDlCLElBQUEsb0JBQWEsRUFBQztRQUNiLE9BQU8sRUFBRTtZQUNQLEdBQUc7WUFDSCxRQUFRO1lBQ1IsSUFBSTtZQUNKLE9BQU87U0FDUjtRQUNELGFBQWEsRUFBRSxDQUFDLElBQUEsV0FBSSxFQUFDLFNBQVMsRUFBRSxVQUFVLENBQUMsQ0FBQztLQUM3QyxDQUFDO0dBQ1csa0JBQWtCLENBYzlCIn0=