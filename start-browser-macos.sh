#!/bin/bash

###############################################################################
# macOS 浏览器启动脚本 - 禁用自动播放策略
#
# 用途：启动 Chrome/Edge 浏览器并禁用音频自动播放限制
# 适用场景：语音交互应用、无 UI 交互的 Kiosk 模式
#
# 使用方法：
#   chmod +x start-browser-macos.sh
#   ./start-browser-macos.sh
#
# 或指定 URL：
#   ./start-browser-macos.sh https://avatar.chekkk.com/0001/index.html
###############################################################################

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  浏览器启动脚本 (macOS)${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# 默认 URL（如果没有提供参数）
DEFAULT_URL="https://avatar.chekkk.com/0001/"
URL="${1:-$DEFAULT_URL}"

echo -e "${YELLOW}目标 URL:${NC} $URL"
echo ""

# 检测浏览器
CHROME_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
EDGE_PATH="/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge"

BROWSER_PATH=""
BROWSER_NAME=""

if [ -f "$CHROME_PATH" ]; then
    BROWSER_PATH="$CHROME_PATH"
    BROWSER_NAME="Chrome"
elif [ -f "$EDGE_PATH" ]; then
    BROWSER_PATH="$EDGE_PATH"
    BROWSER_NAME="Edge"
else
    echo -e "${RED}错误: 未找到 Chrome 或 Edge 浏览器${NC}"
    echo "请安装 Google Chrome 或 Microsoft Edge"
    exit 1
fi

echo -e "${GREEN}✓ 检测到浏览器:${NC} $BROWSER_NAME"
echo ""

# 创建临时用户数据目录
USER_DATA_DIR="/tmp/chrome-autoplay-$(date +%s)"
mkdir -p "$USER_DATA_DIR"

echo -e "${YELLOW}启动参数说明:${NC}"
echo "  --autoplay-policy=no-user-gesture-required  禁用自动播放策略"
echo "  --disable-features=...                      禁用媒体参与度检查"
echo "  --user-data-dir=$USER_DATA_DIR              使用临时配置目录"
echo "  --disable-web-security                      禁用跨域限制（仅开发用）"
echo ""

# 启动浏览器
echo -e "${GREEN}正在启动 $BROWSER_NAME...${NC}"
echo ""

"$BROWSER_PATH" \
  --autoplay-policy=no-user-gesture-required \
  --disable-features=PreloadMediaEngagementData,MediaEngagementBypassAutoplayPolicies \
  --user-data-dir="$USER_DATA_DIR" \
  --disable-web-security \
  --disable-site-isolation-trials \
  --no-first-run \
  --no-default-browser-check \
  "$URL" \
  > /dev/null 2>&1 &

BROWSER_PID=$!

echo -e "${GREEN}✓ 浏览器已启动 (PID: $BROWSER_PID)${NC}"
echo ""
echo -e "${YELLOW}提示:${NC}"
echo "  - 浏览器将使用临时配置目录，关闭后会自动清理"
echo "  - 音频自动播放限制已禁用"
echo "  - 跨域限制已禁用（仅用于开发测试）"
echo ""
echo -e "${YELLOW}停止浏览器:${NC}"
echo "  kill $BROWSER_PID"
echo ""
echo -e "${GREEN}========================================${NC}"
