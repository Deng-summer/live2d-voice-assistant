#!/bin/bash

# 豆包 API 线上部署脚本
# 用途：快速部署 Token 服务器和更新 Nginx 配置
# 使用方法：bash deploy-production.sh

set -e  # 遇到错误立即退出

echo "=========================================="
echo "  豆包 API 线上部署脚本"
echo "=========================================="
echo ""

# 配置变量
SERVER_USER="root"
SERVER_HOST="101.126.81.196"
SERVER_PATH="/chekkk/code/live2d"
NGINX_CONF_PATH="/etc/nginx/conf.d/live2d_jinhua.conf"

# 颜色输出
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 检查本地文件
echo "📋 步骤 1/6: 检查本地文件..."
if [ ! -f "jinua-live2d.conf" ]; then
    echo -e "${RED}❌ 错误: jinua-live2d.conf 文件不存在${NC}"
    exit 1
fi

if [ ! -f "js/doubao-wakeup/token-server.js" ]; then
    echo -e "${RED}❌ 错误: token-server.js 文件不存在${NC}"
    exit 1
fi

echo -e "${GREEN}✅ 本地文件检查通过${NC}"
echo ""

# 上传代码到服务器
echo "📤 步骤 2/6: 上传代码到服务器..."
echo "正在上传 js/doubao-wakeup/ 目录..."
scp -r js/doubao-wakeup/ ${SERVER_USER}@${SERVER_HOST}:${SERVER_PATH}/js/

echo -e "${GREEN}✅ 代码上传完成${NC}"
echo ""

# 检查凭证文件
echo "🔐 步骤 3/6: 检查凭证文件..."
ssh ${SERVER_USER}@${SERVER_HOST} << 'EOF'
if [ ! -f /chekkk/code/live2d/js/doubao-wakeup/doubao-credentials.js ]; then
    echo "⚠️  警告: 凭证文件不存在"
    echo "请手动创建凭证文件："
    echo "  nano /chekkk/code/live2d/js/doubao-wakeup/doubao-credentials.js"
    echo ""
    echo "文件内容："
    echo "export const DOUBAO_CREDENTIALS = {"
    echo "    APP_KEY: 'your_app_key_here',"
    echo "    ACCESS_KEY: 'your_access_key_here'"
    echo "}"
    exit 1
else
    echo "✅ 凭证文件已存在"
fi
EOF

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ 凭证文件检查失败，请先创建凭证文件${NC}"
    exit 1
fi

echo -e "${GREEN}✅ 凭证文件检查通过${NC}"
echo ""

# 部署 Token 服务器
echo "🚀 步骤 4/6: 部署 Token 服务器..."
ssh ${SERVER_USER}@${SERVER_HOST} << 'EOF'
cd /chekkk/code/live2d

# 检查并安装依赖
if ! npm list express cors &> /dev/null; then
    echo "📦 安装依赖..."
    npm install express cors
fi

# 检查 PM2 是否已安装
if ! command -v pm2 &> /dev/null; then
    echo "📦 安装 PM2..."
    npm install -g pm2
fi

# 停止旧的服务（如果存在）
if pm2 list | grep -q "doubao-token"; then
    echo "🔄 停止旧的 Token 服务器..."
    pm2 stop doubao-token
    pm2 delete doubao-token
fi

# 启动新的服务
echo "🚀 启动 Token 服务器..."
pm2 start js/doubao-wakeup/token-server.js --name doubao-token

# 保存 PM2 配置
pm2 save

# 查看服务状态
pm2 status doubao-token

# 测试 Token API
echo ""
echo "🧪 测试 Token API..."
sleep 2
curl -s http://localhost:3001/health | head -n 5
EOF

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Token 服务器部署失败${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Token 服务器部署成功${NC}"
echo ""

# 备份并更新 Nginx 配置
echo "⚙️  步骤 5/6: 更新 Nginx 配置..."

# 备份现有配置
BACKUP_NAME="live2d_jinhua.conf.backup.$(date +%Y%m%d_%H%M%S)"
echo "📦 备份现有配置到: ${BACKUP_NAME}"
ssh ${SERVER_USER}@${SERVER_HOST} "cp ${NGINX_CONF_PATH} ${NGINX_CONF_PATH}.backup.$(date +%Y%m%d_%H%M%S)"

# 上传新配置
echo "📤 上传新配置..."
scp jinua-live2d.conf ${SERVER_USER}@${SERVER_HOST}:${NGINX_CONF_PATH}

# 测试并重新加载 Nginx
ssh ${SERVER_USER}@${SERVER_HOST} << 'EOF'
echo "🧪 测试 Nginx 配置..."
nginx -t

if [ $? -eq 0 ]; then
    echo "🔄 重新加载 Nginx..."
    nginx -s reload
    echo "✅ Nginx 配置更新成功"
else
    echo "❌ Nginx 配置测试失败"
    exit 1
fi
EOF

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Nginx 配置更新失败${NC}"
    echo "正在回滚配置..."
    ssh ${SERVER_USER}@${SERVER_HOST} "cp ${NGINX_CONF_PATH}.backup.* ${NGINX_CONF_PATH} && nginx -s reload"
    exit 1
fi

echo -e "${GREEN}✅ Nginx 配置更新成功${NC}"
echo ""

# 验证部署
echo "✅ 步骤 6/6: 验证部署..."
echo ""
echo "🧪 测试 Token API（HTTPS）..."
curl -s https://avatar.chekkk.com/api/doubao/token | head -n 5

echo ""
echo "🧪 测试健康检查..."
curl -s https://avatar.chekkk.com/health

echo ""
echo ""
echo "=========================================="
echo -e "${GREEN}✅ 部署完成！${NC}"
echo "=========================================="
echo ""
echo "📊 后续步骤："
echo "1. 访问 https://avatar.chekkk.com/0001/ 或 https://avatar.chekkk.com/jinhua/"
echo "2. 打开浏览器控制台，查看环境信息"
echo "3. 允许麦克风权限"
echo "4. 说出唤醒词：'湖宝湖宝'"
echo ""
echo "📝 监控命令："
echo "  pm2 logs doubao-token          # 查看 Token 服务器日志"
echo "  pm2 status                     # 查看服务状态"
echo "  tail -f /var/log/nginx/doubao_token_error.log  # 查看 Nginx 日志"
echo ""
echo "🔄 如需回滚："
echo "  ssh ${SERVER_USER}@${SERVER_HOST}"
echo "  pm2 stop doubao-token && pm2 delete doubao-token"
echo "  cp ${NGINX_CONF_PATH}.backup.* ${NGINX_CONF_PATH}"
echo "  nginx -s reload"
echo ""
