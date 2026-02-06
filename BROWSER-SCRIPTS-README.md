# 浏览器启动脚本使用指南

## 📋 概述

这些脚本用于启动浏览器并**禁用音频自动播放限制**，适用于语音交互应用、无 UI 交互的 Kiosk 模式等场景。

## 🎯 解决的问题

- ✅ 禁用浏览器的音频自动播放策略
- ✅ 允许 TTS 语音在没有用户交互的情况下播放
- ✅ 适用于语音唤醒和语音交互的应用场景
- ✅ 支持 Kiosk 全屏模式（适合嵌入式设备）

## 📦 脚本列表

| 脚本文件 | 适用系统 | 说明 |
|---------|---------|------|
| `start-browser-macos.sh` | macOS | 支持 Chrome 和 Edge |
| `start-browser-linux.sh` | Linux | 支持 Chrome 和 Chromium，包含 Kiosk 模式 |
| `start-browser-windows.bat` | Windows | 支持 Chrome 和 Edge，包含 Kiosk 模式 |

## 🚀 使用方法

### macOS

```bash
# 1. 赋予执行权限
chmod +x start-browser-macos.sh

# 2. 启动浏览器（使用默认 URL）
./start-browser-macos.sh

# 3. 或指定 URL
./start-browser-macos.sh https://avatar.chekkk.com/0001/index.html

# 4. 或使用本地开发服务器
./start-browser-macos.sh http://localhost:5501/index.html
```

### Linux

```bash
# 1. 赋予执行权限
chmod +x start-browser-linux.sh

# 2. 启动浏览器（使用默认 URL）
./start-browser-linux.sh

# 3. 或指定 URL
./start-browser-linux.sh https://avatar.chekkk.com/0001/index.html

# 4. Kiosk 全屏模式（适合嵌入式设备）
./start-browser-linux.sh --kiosk https://avatar.chekkk.com/0001/index.html

# 5. 树莓派等设备（需要 root 权限）
sudo ./start-browser-linux.sh --kiosk https://avatar.chekkk.com/0001/index.html
```

### Windows

```batch
REM 方法1: 双击运行（使用默认 URL）
start-browser-windows.bat

REM 方法2: 命令行指定 URL
start-browser-windows.bat https://avatar.chekkk.com/0001/index.html

REM 方法3: Kiosk 全屏模式
start-browser-windows.bat --kiosk https://avatar.chekkk.com/0001/index.html
```

## ⚙️ 启动参数说明

所有脚本都会添加以下关键参数：

| 参数 | 作用 |
|------|------|
| `--autoplay-policy=no-user-gesture-required` | **禁用自动播放策略**（核心参数） |
| `--disable-features=PreloadMediaEngagementData,MediaEngagementBypassAutoplayPolicies` | 禁用媒体参与度检查 |
| `--user-data-dir=/tmp/...` | 使用临时配置目录（不影响正常浏览器） |
| `--disable-web-security` | 禁用跨域限制（仅开发测试用） |
| `--no-sandbox` | 禁用沙箱（Linux 某些环境需要） |
| `--kiosk` | 全屏 Kiosk 模式（可选） |

## 🎮 Kiosk 模式说明

Kiosk 模式适用于：
- 嵌入式设备（树莓派、工控机等）
- 展示屏、信息亭
- 无人值守的语音交互设备

**特点**：
- 全屏显示，隐藏地址栏和工具栏
- 禁用右键菜单
- 禁用快捷键（部分）
- 适合固定场景使用

**退出方式**：
- Linux/macOS: `Alt+F4` 或 `Ctrl+W`
- Windows: `Alt+F4`

## 📝 使用场景示例

### 场景 1：本地开发测试

```bash
# 启动本地开发服务器
http-server . -p 5501

# 在另一个终端启动浏览器
./start-browser-macos.sh http://localhost:5501/index.html
```

### 场景 2：生产环境部署

```bash
# Linux 服务器上，使用 Kiosk 模式
./start-browser-linux.sh --kiosk https://avatar.chekkk.com/0001/index.html
```

### 场景 3：树莓派语音交互设备

```bash
# 开机自动启动（添加到 /etc/rc.local）
sudo /path/to/start-browser-linux.sh --kiosk https://avatar.chekkk.com/0001/index.html &
```

### 场景 4：Windows 展示屏

```batch
REM 创建快捷方式，开机自动启动
REM 目标: C:\path\to\start-browser-windows.bat --kiosk https://avatar.chekkk.com/0001/index.html
REM 放到: C:\ProgramData\Microsoft\Windows\Start Menu\Programs\StartUp
```

## 🔧 故障排查

### 问题 1：浏览器未找到

**macOS/Linux**:
```bash
# 检查浏览器是否安装
which google-chrome
which chromium-browser

# 安装浏览器
# Ubuntu/Debian
sudo apt install chromium-browser

# macOS
brew install --cask google-chrome
```

**Windows**:
- 确保已安装 Chrome 或 Edge
- 检查安装路径是否正确

### 问题 2：权限不足（Linux）

```bash
# 赋予执行权限
chmod +x start-browser-linux.sh

# 某些环境需要 root 权限
sudo ./start-browser-linux.sh
```

### 问题 3：音频仍然无法播放

1. **检查浏览器是否使用了脚本启动**
   - 查看浏览器地址栏是否有"不安全"提示
   - 打开开发者工具，检查是否有 AudioContext 警告

2. **检查音频设备**
   ```bash
   # Linux 检查音频设备
   aplay -l

   # 测试音频
   speaker-test -t wav -c 2
   ```

3. **检查浏览器版本**
   - 建议使用最新版本的 Chrome/Chromium
   - 某些旧版本可能不支持部分参数

### 问题 4：Kiosk 模式无法退出

- **Linux/macOS**: 按 `Alt+F4` 或 `Ctrl+W`
- **Windows**: 按 `Alt+F4`
- **强制退出**:
  ```bash
  # Linux/macOS
  pkill -f chrome
  pkill -f chromium

  # Windows
  taskkill /F /IM chrome.exe
  ```

## 🔒 安全注意事项

⚠️ **重要提示**：

1. **仅用于开发和受控环境**
   - 这些脚本禁用了浏览器的安全特性（跨域限制、沙箱等）
   - **不要用于访问不受信任的网站**

2. **生产环境建议**
   - 使用独立的浏览器配置目录
   - 限制只访问特定的 URL
   - 定期更新浏览器版本

3. **网络安全**
   - 在受控的网络环境中使用
   - 不要在公共网络中使用这些配置

## 📚 参考资料

- [Chrome 启动参数列表](https://peter.sh/experiments/chromium-command-line-switches/)
- [Chrome 自动播放策略](https://developer.chrome.com/blog/autoplay/)
- [Kiosk 模式配置](https://www.chromium.org/developers/kiosk-mode/)

## 🆘 获取帮助

如果遇到问题：
1. 检查浏览器控制台是否有错误信息
2. 查看脚本输出的日志
3. 确认浏览器版本和系统版本
4. 参考上面的故障排查部分

## 📄 许可证

这些脚本可以自由使用和修改，用于开发和测试目的。
