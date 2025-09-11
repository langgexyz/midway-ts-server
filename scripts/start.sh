#!/bin/bash

# Gateway MidwayJS 服务启动脚本
# 功能：规范化启动、日志管理、进程管理

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
LOG_DIR="$PROJECT_DIR/logs"
LOG_FILE="$LOG_DIR/midway-app.log"

# 创建日志目录
mkdir -p "$LOG_DIR"

echo -e "${BLUE}🚀 Gateway MidwayJS 服务启动脚本${NC}"
echo -e "📂 项目目录: $PROJECT_DIR"
echo -e "📝 日志目录: $LOG_DIR"

# 检查是否已运行
check_running() {
    if [[ -f "$PID_FILE" ]]; then
        PID=$(cat "$PID_FILE")
        if ps -p "$PID" > /dev/null 2>&1; then
            echo -e "${YELLOW}⚠️  服务已在运行 (PID: $PID)${NC}"
            echo -e "   使用 'npm run stop' 停止服务"
            exit 1
        else
            echo -e "${YELLOW}⚠️  发现残留PID文件，清理中...${NC}"
            rm -f "$PID_FILE"
        fi
    fi
}

# 构建项目
build_project() {
    echo -e "${BLUE}🔨 构建项目...${NC}"
    cd "$PROJECT_DIR"
    npm run build
    if [[ $? -ne 0 ]]; then
        echo -e "${RED}❌ 构建失败${NC}"
        exit 1
    fi
    echo -e "${GREEN}✅ 构建完成${NC}"
}

# 启动服务
start_service() {
    echo -e "${BLUE}🚀 启动 MidwayJS 服务...${NC}"
    cd "$PROJECT_DIR"
    
    # 使用 nohup 在后台启动，重定向所有输出到日志文件
    nohup node ./dist/bootstrap.js > "$LOG_FILE" 2>&1 &
    PID=$!
    echo $PID > "$PID_FILE"
    
    # 等待服务启动
    echo -e "${YELLOW}⏳ 等待服务启动...${NC}"
    sleep 3
    
    # 检查服务是否成功启动
    if ps -p "$PID" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ 服务启动成功 (PID: $PID)${NC}"
        echo -e "📊 服务地址: ${BLUE}http://localhost:7001${NC}"
        echo -e "📚 Swagger文档: ${BLUE}http://localhost:7001/swagger-ui/index.html${NC}"
        echo -e "📄 OpenAPI规范: ${BLUE}http://localhost:7001/swagger-ui/index.json${NC}"
        echo -e "📝 日志文件: $LOG_FILE"
        echo -e "${YELLOW}💡 使用 'tail -f $LOG_FILE' 查看实时日志${NC}"
    else
        echo -e "${RED}❌ 服务启动失败${NC}"
        echo -e "📝 检查日志: $LOG_FILE"
        rm -f "$PID_FILE"
        exit 1
    fi
}

# 主函数
main() {
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}  Gateway MidwayJS 启动脚本${NC}"
    echo -e "${BLUE}================================${NC}"
    
    check_running
    build_project
    start_service
    
    echo -e "${GREEN}🎉 服务启动完成！${NC}"
    echo -e "${BLUE}================================${NC}"
}

# 执行主函数
main "$@"
