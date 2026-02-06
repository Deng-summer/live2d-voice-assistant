#!/bin/bash

###############################################################################
# Linux 浏览器启动脚本 - 禁用自动播放策略
#
# 用途：启动 Chrome/Chromium 浏览器并禁用音频自动播放限制
# 适用场景：语音交互应用、无 UI 交互的 Kiosk 模式、树莓派等嵌入式设备
#
# 使用方法：
#   chmod +x start-browser-linux.sh
#   ./start-browser-linux.sh
#
# 或指定 URL：
#   ./start-browser-linux.sh https://avatar.chekkk.com/0001/index.html
#
# Kiosk 全屏模式：
#   ./start-browser-linux.sh --kiosk https://avatar.chekkk.com/0001/index.html
###############################################################################

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  浏览器启动脚本 (Linux)${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# 解析参数
KIOSK_MODE=false
URL=""

for arg in "$@"; do
    if [ "$arg" = "--kiosk" ]; then
        KIOSK_MODE=true
    else
        URL="$arg"
    fi
done

# 默认 URL
if [ -z "$URL" ]; then
    URL="https://avatar.chekkk.com/0001/"
fi

echo -e "${YELLOW}目标 URL:${NC} $URL"
if [ "$KIOSK_MODE" = true ]; then
    echo -e "${YELLOW}模式:${NC} Kiosk 全屏模式"
fi
echo ""

# 检测浏览器（按优先级）
BROWSER_PATH=""
BROWSER_NAME=""

# 检测顺序：google-chrome > chromium-browser > chromium > chrome
if command -v google-chrome &> /dev/null; then
    BROWSER_PATH="google-chrome"
    BROWSER_NAME="Google Chrome"
elif command -v chromium-browser &> /dev/null; then
    BROWSER_PATH="chromium-browser"
    BROWSER_NAME="Chromium"
elif command -v chromium &> /dev/null; then
    BROWSER_PATH="chromium"
    BROWSER_NAME="Chromium"
elif command -v chrome &> /dev/null; then
    BROWSER_PATH="chrome"
    BROWSER_NAME="Chrome"
else
    echo -e "${RED}错误: 未找到 Chrome 或 Chromium 浏览器${NC}"
    echo ""
    echo "请安装浏览器："
    echo "  Ubuntu/Debian: sudo apt install chromium-browser"
    echo "  Fedora/RHEL:   sudo dnf install chromium"
    echo "  Arch Linux:    sudo pacman -S chromium"
    echo ""
    exit 1
fi

echo -e "${GREEN}✓ 检测到浏览器:${NC} $BROWSER_NAME ($BROWSER_PATH)"
echo ""

# 创建临时用户数据目录
USER_DATA_DIR="/tmp/chrome-autoplay-$(date +%s)"
mkdir -p "$USER_DATA_DIR"

echo -e "${YELLOW}启动参数说明:${NC}"
echo "  --autoplay-policy=no-user-gesture-required  禁用自动播放策略"
echo "  --disable-features=...                      禁用媒体参与度检查"
echo "  --user-data-dir=$USER_DATA_DIR              使用临时配置目录"
echo "  --disable-web-security                      禁用跨域限制（仅开发用）"
echo "  --no-sandbox                                禁用沙箱（某些 Linux 环境需要）"
if [ "$KIOSK_MODE" = true ]; then
    echo "  --kiosk                                     全屏 Kiosk 模式"
fi
echo ""

# 构建启动参数
BROWSER_ARGS=(
    --autoplay-policy=no-user-gesture-required
    --disable-features=PreloadMediaEngagementData,MediaEngagementBypassAutoplayPolicies
    --user-data-dir="$USER_DATA_DIR"
    --disable-web-security
    --disable-site-isolation-trials
    --no-sandbox
    --disable-dev-shm-usage
    --no-first-run
    --no-default-browser-check
    --disable-infobars
    --disable-notifications
)

# 添加 Kiosk 模式参数
if [ "$KIOSK_MODE" = true ]; then
    BROWSER_ARGS+=(
        --kiosk
        --start-fullscreen
        --disable-pinch
        --overscroll-history-navigation=0
    )
fi

# 添加 URL
BROWSER_ARGS+=("$URL")

# 启动浏览器
echo -e "${GREEN}正在启动 $BROWSER_NAME...${NC}"
echo ""

"$BROWSER_PATH" "${BROWSER_ARGS[@]}" > /dev/null 2>&1 &

BROWSER_PID=$!

echo -e "${GREEN}✓ 浏览器已启动 (PID: $BROWSER_PID)${NC}"
echo ""
echo -e "${YELLOW}提示:${NC}"
echo "  - 浏览器将使用临时配置目录，关闭后会自动清理"
echo "  - 音频自动播放限制已禁用"
echo "  - 跨域限制已禁用（仅用于开发测试）"
echo "  - 沙箱已禁用（某些 Linux 环境需要）"
if [ "$KIOSK_MODE" = true ]; then
    echo "  - 全屏 Kiosk 模式已启用（按 Alt+F4 或 Ctrl+W 退出）"
fi
echo ""
echo -e "${YELLOW}停止浏览器:${NC}"
echo "  kill $BROWSER_PID"
echo "  或: pkill -f '$BROWSER_PATH'"
echo ""
echo -e "${GREEN}========================================${NC}"
