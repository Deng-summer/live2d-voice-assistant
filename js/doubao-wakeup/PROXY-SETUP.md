# 豆包唤醒词 WebSocket 代理服务器使用说明

## 问题背景

豆包 API 要求在 WebSocket 建连时通过 HTTP Header 传递鉴权信息：
- `X-Api-App-Key`
- `X-Api-Access-Key`
- `X-Api-Resource-Id`
- `X-Api-Connect-Id`

但是，**浏览器的 WebSocket API 不支持自定义 HTTP Header**。这是浏览器的安全限制，无法通过 JavaScript 绕过。

## 解决方案

使用 **Node.js 代理服务器**：
1. 浏览器连接到本地代理服务器（`ws://localhost:8081`）
2. 代理服务器连接到豆包 API（添加鉴权 Header）
3. 代理服务器转发双向消息

```
浏览器 <---> 本地代理服务器 <---> 豆包 API
         (无Header限制)      (添加Header)
```

## 安装步骤

### 1. 安装 Node.js

如果尚未安装 Node.js，请访问 https://nodejs.org/ 下载并安装。

验证安装：
```bash
node --version
npm --version
```

### 2. 安装依赖

在 `js/doubao-wakeup/` 目录下运行：

```bash
cd js/doubao-wakeup
npm install
```

这将安装 `ws` 包（WebSocket 库）。

### 3. 配置凭证

确保 `doubao-credentials.js` 文件已正确配置：

```javascript
export const DOUBAO_CREDENTIALS = {
    APP_KEY: '4145251174',
    ACCESS_KEY: 'LpK1fJ6uG4frTjWqMiZZ7Jp8agvDeSAW',
    RESOURCE_ID: 'volc.seedasr.sauc.duration',
}
```

### 4. 启用代理模式

在 `doubao-config.js` 中设置：

```javascript
export const DOUBAO_CONFIG = {
    USE_PROXY: true,  // 启用代理模式
    PROXY_URL: 'ws://localhost:8081',
    // ...
}
```

## 使用方法

### 启动代理服务器

在 `js/doubao-wakeup/` 目录下运行：

```bash
npm start
```

或者：

```bash
node proxy-server.js
```

您应该看到类似的输出：

```
🚀 豆包 WebSocket 代理服务器启动中...
📋 配置信息:
  APP_KEY: 4145251174
  ACCESS_KEY: LpK1fJ6uG...
  RESOURCE_ID: volc.seedasr.sauc.duration
  目标地址: wss://openspeech.bytedance.com/api/v3/sauc/bigmodel_async

✅ 代理服务器已启动
📡 监听地址: ws://localhost:8081

💡 使用说明:
1. 修改 doubao-config.js 中的 WS_URL 为: ws://localhost:8081
2. 在浏览器中打开测试页面
3. 点击"启动检测"按钮

按 Ctrl+C 停止服务器
```

### 测试连接

1. **保持代理服务器运行**
2. 在另一个终端启动 HTTP 服务器：
   ```bash
   cd ../..  # 回到项目根目录
   http-server .
   ```
3. 访问测试页面：
   ```
   http://127.0.0.1:8080/js/doubao-wakeup/test.html
   ```
4. 点击"启动检测"按钮

### 查看日志

代理服务器会输出详细的日志：

```
✅ 浏览器客户端已连接
  Connect-Id: 392a5e65-4dca-40cf-9ff6-492f2cf86eb4
✅ 已连接到豆包 API
📤 转发消息: 浏览器 -> 豆包 (256 bytes)
📥 转发消息: 豆包 -> 浏览器 (512 bytes)
```

## 常见问题

### Q1: 代理服务器启动失败

**错误**: `Error: Cannot find module 'ws'`

**解决**: 运行 `npm install` 安装依赖

---

**错误**: `Error: listen EADDRINUSE: address already in use :::8081`

**解决**: 端口 8081 已被占用，修改 `proxy-server.js` 中的 `PORT` 变量

---

### Q2: 浏览器连接失败

**检查**:
1. 代理服务器是否正在运行？
2. `doubao-config.js` 中 `USE_PROXY` 是否为 `true`？
3. `PROXY_URL` 是否为 `ws://localhost:8081`？
4. 浏览器控制台是否有错误信息？

---

### Q3: 连接到豆包 API 失败

**检查**:
1. 凭证是否正确？
2. 网络是否正常？
3. 账户余额是否充足？
4. 查看代理服务器的错误日志

---

### Q4: 如何停止代理服务器？

按 `Ctrl+C` 停止服务器。

---

### Q5: 可以在生产环境使用吗？

**不建议**。这个代理服务器仅用于开发和测试。

生产环境建议：
1. 使用专业的反向代理（如 Nginx）
2. 添加 HTTPS 支持
3. 添加访问控制和日志记录
4. 使用 PM2 等进程管理工具

---

### Q6: 为什么不能直接在浏览器中使用？

浏览器的 WebSocket API 不支持自定义 HTTP Header，这是浏览器的安全限制。

其他语音服务（如讯飞）通过 URL 参数传递鉴权信息，但豆包 API 要求在 Header 中传递，因此必须使用代理。

---

## 开发模式

如果您需要修改代理服务器代码，可以使用开发模式（自动重启）：

```bash
npm run dev
```

这将使用 Node.js 的 `--watch` 模式，文件修改后自动重启。

---

## 架构图

```
┌─────────────┐         ┌──────────────────┐         ┌─────────────┐
│   浏览器    │ <-----> │  代理服务器      │ <-----> │  豆包 API   │
│             │  WebSocket  │  (Node.js)       │  WebSocket  │             │
│  test.html  │  无Header   │  proxy-server.js │  有Header   │  火山引擎   │
└─────────────┘         └──────────────────┘         └─────────────┘
                              ↓
                        添加鉴权 Header:
                        - X-Api-App-Key
                        - X-Api-Access-Key
                        - X-Api-Resource-Id
                        - X-Api-Connect-Id
```

---

## 文件说明

- `proxy-server.js` - 代理服务器主文件
- `package.json` - Node.js 项目配置
- `doubao-config.js` - 配置文件（包含 USE_PROXY 选项）
- `doubao-credentials.js` - API 凭证（不提交到 git）
- `doubao-websocket.js` - WebSocket 客户端（支持代理模式）

---

## 下一步

1. ✅ 启动代理服务器
2. ✅ 测试连接
3. ✅ 验证唤醒词检测
4. 🔄 集成到主应用（`index.html`）

---

**更新时间**: 2026-02-02
**状态**: ✅ 已完成并测试
