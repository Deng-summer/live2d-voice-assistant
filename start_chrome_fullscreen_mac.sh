#!/bin/bash
# 启动 Google Chrome 浏览器并全屏显示指定网页

# 启动 Google Chrome 并打开指定网页
open -a "Google Chrome" "http://101.126.81.196:8801/"

# 确保 Google Chrome 完全启动后执行全屏操作
sleep 5

# 使用 AppleScript 切换到全屏模式
osascript <<EOF
tell application "Google Chrome"
    activate
    tell application "System Events"
        keystroke "f" using {command down, control down}
    end tell
end tell
EOF