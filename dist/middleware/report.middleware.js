"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportMiddleware = void 0;
const tslib_1 = require("tslib");
const core_1 = require("@midwayjs/core");
let ReportMiddleware = class ReportMiddleware {
    resolve() {
        return async (ctx, next) => {
            const startTime = Date.now();
            const method = ctx.method;
            const url = ctx.url;
            console.log(`📥 [${method}] ${url} - 开始处理`);
            await next();
            const cost = Date.now() - startTime;
            console.log(`📤 [${method}] ${url} - 处理完成 (${cost}ms) status: ${ctx.status}`);
        };
    }
    static getName() {
        return 'ReportMiddleware';
    }
};
exports.ReportMiddleware = ReportMiddleware;
exports.ReportMiddleware = ReportMiddleware = tslib_1.__decorate([
    (0, core_1.Middleware)()
], ReportMiddleware);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVwb3J0Lm1pZGRsZXdhcmUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvbWlkZGxld2FyZS9yZXBvcnQubWlkZGxld2FyZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O0FBQUEseUNBQXlEO0FBSWxELElBQU0sZ0JBQWdCLEdBQXRCLE1BQU0sZ0JBQWdCO0lBRTNCLE9BQU87UUFDTCxPQUFPLEtBQUssRUFBRSxHQUFZLEVBQUUsSUFBa0IsRUFBRSxFQUFFO1lBQ2hELE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQztZQUM3QixNQUFNLE1BQU0sR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDO1lBQzFCLE1BQU0sR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUM7WUFFcEIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxPQUFPLE1BQU0sS0FBSyxHQUFHLFNBQVMsQ0FBQyxDQUFDO1lBRTVDLE1BQU0sSUFBSSxFQUFFLENBQUM7WUFFYixNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsU0FBUyxDQUFDO1lBQ3BDLE9BQU8sQ0FBQyxHQUFHLENBQUMsT0FBTyxNQUFNLEtBQUssR0FBRyxZQUFZLElBQUksZUFBZSxHQUFHLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQztRQUNoRixDQUFDLENBQUM7SUFDSixDQUFDO0lBRUQsTUFBTSxDQUFDLE9BQU87UUFDWixPQUFPLGtCQUFrQixDQUFDO0lBQzVCLENBQUM7Q0FDRixDQUFBO0FBcEJZLDRDQUFnQjsyQkFBaEIsZ0JBQWdCO0lBRDVCLElBQUEsaUJBQVUsR0FBRTtHQUNBLGdCQUFnQixDQW9CNUIifQ==