#!/bin/bash

# Chrome启动脚本 - 本地开发环境
# 禁用音频自动播放限制

# 本地开发URL
PROJECT_URL="http://127.0.0.1:8080/index.html"

# 启动Chrome
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome \
  --autoplay-policy=no-user-gesture-required \
  --user-data-dir="/tmp/chrome-dev-profile" \
  "$PROJECT_URL"
