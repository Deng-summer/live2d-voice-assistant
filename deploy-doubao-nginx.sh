#!/bin/bash
# ==============================================================================
# 豆包 Token 服务迁移到 Nginx - 自动化部署脚本
# ==============================================================================

set -e  # 遇到错误立即退出

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 配置变量
SSH_KEY="/Users/dengsummer/Downloads/live2d-jinhua-web.pem"
SERVER_USER="root"
SERVER_IP="101.126.81.196"
SERVER_HOST="${SERVER_USER}@${SERVER_IP}"

# 本地文件路径
LOCAL_PROJECT_DIR="/Users/dengsummer/Downloads/workCode/live2D/live2D"
LOCAL_NGINX_CONF="${LOCAL_PROJECT_DIR}/jinua-live2d.conf"
LOCAL_DOUBAO_AUTH="${LOCAL_PROJECT_DIR}/js/doubao-wakeup/doubao-auth.js"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}豆包 Token 服务迁移到 Nginx${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# 步骤 1: 检查本地文件
echo -e "${YELLOW}[1/6] 检查本地文件...${NC}"
if [ ! -f "$SSH_KEY" ]; then
    echo -e "${RED}❌ SSH 密钥不存在: $SSH_KEY${NC}"
    exit 1
fi

if [ ! -f "$LOCAL_NGINX_CONF" ]; then
    echo -e "${RED}❌ Nginx 配置文件不存在: $LOCAL_NGINX_CONF${NC}"
    exit 1
fi

if [ ! -f "$LOCAL_DOUBAO_AUTH" ]; then
    echo -e "${RED}❌ doubao-auth.js 不存在: $LOCAL_DOUBAO_AUTH${NC}"
    exit 1
fi

echo -e "${GREEN}✅ 本地文件检查完成${NC}"
echo ""

# 步骤 2: 测试 SSH 连接
echo -e "${YELLOW}[2/6] 测试 SSH 连接...${NC}"
if ! ssh -i "$SSH_KEY" -o ConnectTimeout=5 "$SERVER_HOST" "echo '连接成功'" > /dev/null 2>&1; then
    echo -e "${RED}❌ SSH 连接失败，请检查：${NC}"
    echo -e "${RED}   - SSH 密钥权限: chmod 400 $SSH_KEY${NC}"
    echo -e "${RED}   - 服务器 IP: $SERVER_IP${NC}"
    echo -e "${RED}   - 用户名: $SERVER_USER${NC}"
    exit 1
fi
echo -e "${GREEN}✅ SSH 连接成功${NC}"
echo ""

# 步骤 3: 询问服务器项目路径
echo -e "${YELLOW}[3/6] 确认服务器项目路径...${NC}"
echo -e "请输入服务器上的项目路径（例如：/chekkk/code/live2d/0001）"
echo -e "留空使用默认路径：${BLUE}/chekkk/code/live2d${NC}"
read -p "服务器项目路径: " SERVER_PROJECT_DIR

if [ -z "$SERVER_PROJECT_DIR" ]; then
    SERVER_PROJECT_DIR="/chekkk/code/live2d"
fi

echo -e "${BLUE}使用路径: $SERVER_PROJECT_DIR${NC}"

# 验证服务器路径是否存在
echo -e "验证服务器路径..."
if ! ssh -i "$SSH_KEY" "$SERVER_HOST" "test -d '$SERVER_PROJECT_DIR'"; then
    echo -e "${RED}❌ 服务器路径不存在: $SERVER_PROJECT_DIR${NC}"
    echo -e "${YELLOW}提示：请检查路径是否正确${NC}"
    exit 1
fi
echo -e "${GREEN}✅ 服务器路径验证成功${NC}"
echo ""

# 步骤 4: 备份服务器文件
echo -e "${YELLOW}[4/6] 备份服务器文件...${NC}"
BACKUP_DATE=$(date +%Y%m%d_%H%M%S)
ssh -i "$SSH_KEY" "$SERVER_HOST" << EOF
    # 备份 Nginx 配置
    if [ -f /etc/nginx/jinua-live2d.conf ]; then
        sudo cp /etc/nginx/jinua-live2d.conf /etc/nginx/jinua-live2d.conf.backup_${BACKUP_DATE}
        echo "✅ 已备份 Nginx 配置"
    fi

    # 备份 doubao-auth.js
    if [ -f ${SERVER_PROJECT_DIR}/js/doubao-wakeup/doubao-auth.js ]; then
        cp ${SERVER_PROJECT_DIR}/js/doubao-wakeup/doubao-auth.js ${SERVER_PROJECT_DIR}/js/doubao-wakeup/doubao-auth.js.backup_${BACKUP_DATE}
        echo "✅ 已备份 doubao-auth.js"
    fi
EOF
echo -e "${GREEN}✅ 备份完成（备份标识：${BACKUP_DATE}）${NC}"
echo ""

# 步骤 5: 上传文件
echo -e "${YELLOW}[5/6] 上传文件到服务器...${NC}"

# 上传 Nginx 配置
echo -e "上传 Nginx 配置..."
scp -i "$SSH_KEY" "$LOCAL_NGINX_CONF" "${SERVER_HOST}:/tmp/jinua-live2d.conf"
ssh -i "$SSH_KEY" "$SERVER_HOST" "sudo mv /tmp/jinua-live2d.conf /etc/nginx/jinua-live2d.conf"
echo -e "${GREEN}✅ Nginx 配置已上传${NC}"

# 上传 doubao-auth.js
echo -e "上传 doubao-auth.js..."
scp -i "$SSH_KEY" "$LOCAL_DOUBAO_AUTH" "${SERVER_HOST}:${SERVER_PROJECT_DIR}/js/doubao-wakeup/doubao-auth.js"
echo -e "${GREEN}✅ doubao-auth.js 已上传${NC}"
echo ""

# 步骤 6: 重启 Nginx 并测试
echo -e "${YELLOW}[6/6] 重启 Nginx 并测试...${NC}"
ssh -i "$SSH_KEY" "$SERVER_HOST" << 'EOF'
    # 测试 Nginx 配置
    echo "测试 Nginx 配置..."
    if ! sudo nginx -t 2>&1; then
        echo "❌ Nginx 配置测试失败"
        exit 1
    fi
    echo "✅ Nginx 配置测试通过"

    # 重启 Nginx
    echo "重启 Nginx..."
    sudo nginx -s reload
    echo "✅ Nginx 已重启"

    # 等待 1 秒让 Nginx 完全启动
    sleep 1

    # 测试 Token API
    echo ""
    echo "测试 Token API..."
    RESPONSE=$(curl -s http://localhost/api/doubao/token)

    if echo "$RESPONSE" | grep -q "jwt_token"; then
        echo "✅ Token API 测试成功"
        echo "响应: $(echo $RESPONSE | head -c 100)..."
    else
        echo "❌ Token API 测试失败"
        echo "响应: $RESPONSE"
        exit 1
    fi
EOF

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Nginx 重启并测试成功${NC}"
else
    echo -e "${RED}❌ Nginx 重启或测试失败${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}🎉 部署成功！${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${BLUE}📋 下一步操作：${NC}"
echo ""
echo -e "1️⃣  测试 Token API（公网）："
echo -e "   ${BLUE}curl https://avatar.chekkk.com/api/doubao/token${NC}"
echo ""
echo -e "2️⃣  在浏览器中测试："
echo -e "   ${BLUE}https://avatar.chekkk.com/0001/index.html${NC}"
echo -e "   打开开发者工具（F12），查看控制台应该看到："
echo -e "   ${GREEN}[豆包唤醒] JWT Token 获取成功${NC}"
echo ""
echo -e "3️⃣  确认功能正常后，停止 Node.js token-server："
echo -e "   ${BLUE}ssh -i $SSH_KEY $SERVER_HOST${NC}"
echo -e "   ${BLUE}pm2 list${NC}"
echo -e "   ${BLUE}pm2 stop token-server${NC}"
echo -e "   ${BLUE}pm2 delete token-server${NC}"
echo ""
echo -e "${YELLOW}💡 回滚方法（如需要）：${NC}"
echo -e "   服务器上已创建备份文件（后缀: .backup_${BACKUP_DATE}）"
echo -e "   执行以下命令恢复："
echo -e "   ${BLUE}ssh -i $SSH_KEY $SERVER_HOST${NC}"
echo -e "   ${BLUE}sudo cp /etc/nginx/jinua-live2d.conf.backup_${BACKUP_DATE} /etc/nginx/jinua-live2d.conf${NC}"
echo -e "   ${BLUE}sudo nginx -s reload${NC}"
echo ""
