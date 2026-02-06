#!/bin/bash

# Chrome启动脚本 - 禁用音频自动播放限制
# 适用于macOS系统

# 项目URL（根据需要修改）
PROJECT_URL="https://avatar.chekkk.com/0001/"

# 启动Chrome，禁用自动播放限制
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome \
  --autoplay-policy=no-user-gesture-required \
  --user-data-dir="/tmp/chrome-dev-profile" \
  "$PROJECT_URL"

# 参数说明：
# --autoplay-policy=no-user-gesture-required : 允许无需用户手势即可自动播放
# --user-data-dir : 使用独立的配置文件目录，避免影响正常的Chrome配置
