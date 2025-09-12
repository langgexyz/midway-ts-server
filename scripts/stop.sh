#!/bin/bash

# Gateway MidwayJS 服务停止脚本

set -e

# 定义颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 项目根目录
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PID_FILE="$PROJECT_DIR/midway.pid"

echo -e "${BLUE}🛑 Gateway MidwayJS 服务停止脚本${NC}"

# 停止服务
stop_service() {
    if [[ -f "$PID_FILE" ]]; then
        PID=$(cat "$PID_FILE")
        if ps -p "$PID" > /dev/null 2>&1; then
            echo -e "${YELLOW}⏳ 正在停止服务 (PID: $PID)...${NC}"
            kill "$PID"
            
            # 等待进程结束
            local count=0
            while ps -p "$PID" > /dev/null 2>&1 && [[ $count -lt 10 ]]; do
                sleep 1
                ((count++))
            done
            
            if ps -p "$PID" > /dev/null 2>&1; then
                echo -e "${YELLOW}⚠️  强制停止服务...${NC}"
                kill -9 "$PID"
            fi
            
            rm -f "$PID_FILE"
            echo -e "${GREEN}✅ 服务已停止${NC}"
        else
            echo -e "${YELLOW}⚠️  服务未运行，清理PID文件${NC}"
            rm -f "$PID_FILE"
        fi
    else
        echo -e "${YELLOW}⚠️  未找到PID文件，服务可能未运行${NC}"
    fi
}

# 清理相关进程
cleanup_processes() {
    echo -e "${BLUE}🧹 清理相关进程...${NC}"
    # 查找并停止相关的 node 进程
    local pids=$(ps aux | grep "node.*bootstrap.js" | grep -v grep | awk '{print $2}')
    if [[ -n "$pids" ]]; then
        echo -e "${YELLOW}⚠️  发现残留进程，正在清理...${NC}"
        echo "$pids" | xargs kill -9 2>/dev/null || true
        echo -e "${GREEN}✅ 残留进程已清理${NC}"
    fi
}

# 主函数
main() {
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}  Gateway MidwayJS 停止脚本${NC}"
    echo -e "${BLUE}================================${NC}"
    
    stop_service
    cleanup_processes
    
    echo -e "${GREEN}🎉 服务停止完成！${NC}"
    echo -e "${BLUE}================================${NC}"
}

# 执行主函数
main "$@"

