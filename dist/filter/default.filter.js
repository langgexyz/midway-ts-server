"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultErrorFilter = void 0;
const tslib_1 = require("tslib");
const core_1 = require("@midwayjs/core");
let DefaultErrorFilter = class DefaultErrorFilter {
    async catch(err, ctx) {
        console.error('❌ 全局错误捕获:', err);
        // 返回错误信息
        ctx.status = 500;
        return {
            success: false,
            message: err.message || '服务器内部错误',
            data: null,
            timestamp: new Date().toISOString(),
            path: ctx.path
        };
    }
};
exports.DefaultErrorFilter = DefaultErrorFilter;
exports.DefaultErrorFilter = DefaultErrorFilter = tslib_1.__decorate([
    (0, core_1.Catch)()
], DefaultErrorFilter);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVmYXVsdC5maWx0ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvZmlsdGVyL2RlZmF1bHQuZmlsdGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7QUFBQSx5Q0FBdUM7QUFJaEMsSUFBTSxrQkFBa0IsR0FBeEIsTUFBTSxrQkFBa0I7SUFDN0IsS0FBSyxDQUFDLEtBQUssQ0FBQyxHQUFVLEVBQUUsR0FBWTtRQUNsQyxPQUFPLENBQUMsS0FBSyxDQUFDLFdBQVcsRUFBRSxHQUFHLENBQUMsQ0FBQztRQUVoQyxTQUFTO1FBQ1QsR0FBRyxDQUFDLE1BQU0sR0FBRyxHQUFHLENBQUM7UUFDakIsT0FBTztZQUNMLE9BQU8sRUFBRSxLQUFLO1lBQ2QsT0FBTyxFQUFFLEdBQUcsQ0FBQyxPQUFPLElBQUksU0FBUztZQUNqQyxJQUFJLEVBQUUsSUFBSTtZQUNWLFNBQVMsRUFBRSxJQUFJLElBQUksRUFBRSxDQUFDLFdBQVcsRUFBRTtZQUNuQyxJQUFJLEVBQUUsR0FBRyxDQUFDLElBQUk7U0FDZixDQUFDO0lBQ0osQ0FBQztDQUNGLENBQUE7QUFkWSxnREFBa0I7NkJBQWxCLGtCQUFrQjtJQUQ5QixJQUFBLFlBQUssR0FBRTtHQUNLLGtCQUFrQixDQWM5QiJ9