#!/bin/bash
# 使用以下命令来赋予脚本执行权限： chmod +x start_chrome_fullscreen.sh
# ./start_chrome_fullscreen.sh
# 关闭所有现有的 Chromium 实例

export GOOGLE_API_KEY="AIzaSyB0y-hr-byVeAvxE9gxBqp1pPWxdOTAqOA"
export GOOGLE_DEFAULT_CLIENT_ID="788243036499-1j5nqvnr4lj7gd0fhmrm0f94sqskn6uc.apps.googleusercontent.com"
export GOOGLE_DEFAULT_CLIENT_SECRET="xDHuELbrKd_Bu1OvetUlCXpZ"

pkill -f chromium

# 启动 Chromium 浏览器并全屏显示指定网页
chromium-browser --start-fullscreen "https://avatar.chekkk.com/live2d/0001/" --disable-notifications --disable-popup-blocking --disable-infobars &

# 等待 Chromium 启动完成
sleep 5

# 获取 Chromium 窗口的窗口ID
WINDOW_ID=$(wmctrl -l | grep "https://avatar.chekkk.com/live2d/0001/" | awk '{print $1}')

# 设置窗口为始终在最上面
wmctrl -i -r $WINDOW_ID -b add,above