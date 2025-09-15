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
                echo -e "${YELLOW}Warning: Force stopping service...${NC}"
                kill -9 "$PID"
            fi
            
            rm -f "$PID_FILE"
            echo -e "${GREEN}Service stopped${NC}"
        else
            echo -e "${YELLOW}Warning: Service not running, cleaning PID file${NC}"
            rm -f "$PID_FILE"
        fi
    else
        echo -e "${YELLOW}Warning: PID file not found, service may not be running${NC}"
    fi
}

# 清理相关进程
cleanup_processes() {
    echo -e "${BLUE}🧹 清理相关进程...${NC}"
    # 查找并停止相关的 node 进程
    local pids=$(ps aux | grep "node.*bootstrap.js" | grep -v grep | awk '{print $2}')
    if [[ -n "$pids" ]]; then
        echo -e "${YELLOW}Warning: Found residual processes, cleaning up...${NC}"
        echo "$pids" | xargs kill -9 2>/dev/null || true
        echo -e "${GREEN}Residual processes cleaned${NC}"
    fi
}

# 主函数
main() {
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}  Gateway MidwayJS 停止脚本${NC}"
    echo -e "${BLUE}================================${NC}"
    
    stop_service
    cleanup_processes
    
    echo -e "${GREEN}Service stop completed!${NC}"
    echo -e "${BLUE}================================${NC}"
}

# 执行主函数
main "$@"

