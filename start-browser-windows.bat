@echo off
REM ###########################################################################
REM Windows 浏览器启动脚本 - 禁用自动播放策略
REM
REM 用途：启动 Chrome/Edge 浏览器并禁用音频自动播放限制
REM 适用场景：语音交互应用、无 UI 交互的 Kiosk 模式
REM
REM 使用方法：
REM   双击运行 start-browser-windows.bat
REM
REM 或在命令行中指定 URL：
REM   start-browser-windows.bat https://avatar.chekkk.com/0001/index.html
REM
REM Kiosk 全屏模式：
REM   start-browser-windows.bat --kiosk https://avatar.chekkk.com/0001/index.html
REM ###########################################################################

setlocal enabledelayedexpansion

echo ========================================
echo   浏览器启动脚本 (Windows)
echo ========================================
echo.

REM 解析参数
set "KIOSK_MODE=false"
set "URL="

:parse_args
if "%~1"=="" goto :args_done
if "%~1"=="--kiosk" (
    set "KIOSK_MODE=true"
) else (
    set "URL=%~1"
)
shift
goto :parse_args

:args_done

REM 默认 URL
if "%URL%"=="" set "URL=https://avatar.chekkk.com/0001/"

echo 目标 URL: %URL%
if "%KIOSK_MODE%"=="true" echo 模式: Kiosk 全屏模式
echo.

REM 检测浏览器
set "CHROME_PATH=%ProgramFiles%\Google\Chrome\Application\chrome.exe"
set "CHROME_PATH_X86=%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe"
set "EDGE_PATH=%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe"

set "BROWSER_PATH="
set "BROWSER_NAME="

if exist "%CHROME_PATH%" (
    set "BROWSER_PATH=%CHROME_PATH%"
    set "BROWSER_NAME=Chrome"
) else if exist "%CHROME_PATH_X86%" (
    set "BROWSER_PATH=%CHROME_PATH_X86%"
    set "BROWSER_NAME=Chrome"
) else if exist "%EDGE_PATH%" (
    set "BROWSER_PATH=%EDGE_PATH%"
    set "BROWSER_NAME=Edge"
) else (
    echo [错误] 未找到 Chrome 或 Edge 浏览器
    echo.
    echo 请安装 Google Chrome 或 Microsoft Edge
    echo.
    pause
    exit /b 1
)

echo [成功] 检测到浏览器: %BROWSER_NAME%
echo.

REM 创建临时用户数据目录
set "USER_DATA_DIR=%TEMP%\chrome-autoplay-%RANDOM%"
mkdir "%USER_DATA_DIR%" 2>nul

echo 启动参数说明:
echo   --autoplay-policy=no-user-gesture-required  禁用自动播放策略
echo   --disable-features=...                      禁用媒体参与度检查
echo   --user-data-dir=%USER_DATA_DIR%             使用临时配置目录
echo   --disable-web-security                      禁用跨域限制（仅开发用）
if "%KIOSK_MODE%"=="true" echo   --kiosk                                     全屏 Kiosk 模式
echo.

REM 构建启动参数
set "BROWSER_ARGS=--autoplay-policy=no-user-gesture-required"
set "BROWSER_ARGS=%BROWSER_ARGS% --disable-features=PreloadMediaEngagementData,MediaEngagementBypassAutoplayPolicies"
set "BROWSER_ARGS=%BROWSER_ARGS% --user-data-dir=%USER_DATA_DIR%"
set "BROWSER_ARGS=%BROWSER_ARGS% --disable-web-security"
set "BROWSER_ARGS=%BROWSER_ARGS% --disable-site-isolation-trials"
set "BROWSER_ARGS=%BROWSER_ARGS% --no-first-run"
set "BROWSER_ARGS=%BROWSER_ARGS% --no-default-browser-check"
set "BROWSER_ARGS=%BROWSER_ARGS% --disable-infobars"
set "BROWSER_ARGS=%BROWSER_ARGS% --disable-notifications"

REM 添加 Kiosk 模式参数
if "%KIOSK_MODE%"=="true" (
    set "BROWSER_ARGS=%BROWSER_ARGS% --kiosk"
    set "BROWSER_ARGS=%BROWSER_ARGS% --start-fullscreen"
    set "BROWSER_ARGS=%BROWSER_ARGS% --disable-pinch"
    set "BROWSER_ARGS=%BROWSER_ARGS% --overscroll-history-navigation=0"
)

REM 启动浏览器
echo 正在启动 %BROWSER_NAME%...
echo.

start "" "%BROWSER_PATH%" %BROWSER_ARGS% "%URL%"

echo [成功] 浏览器已启动
echo.
echo 提示:
echo   - 浏览器将使用临时配置目录
echo   - 音频自动播放限制已禁用
echo   - 跨域限制已禁用（仅用于开发测试）
if "%KIOSK_MODE%"=="true" echo   - 全屏 Kiosk 模式已启用（按 Alt+F4 退出）
echo.
echo 停止浏览器:
echo   关闭浏览器窗口或在任务管理器中结束进程
echo.
echo ========================================
echo.
pause
