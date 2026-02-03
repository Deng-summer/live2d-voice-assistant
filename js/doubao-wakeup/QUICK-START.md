# 豆包唤醒词 - 快速启动指南

## CORS 问题解决方案

豆包的 Token API 不支持 CORS，无法在浏览器中直接调用。解决方案是使用一个**轻量级 Token 服务器**。

## 快速启动（3 步）

### 1. 安装依赖

```bash
cd js/doubao-wakeup
npm install
```

这将安装：
- `express` - Web 服务器
- `cors` - CORS 支持
- `ws` - WebSocket 库（备用）

### 2. 启动 Token 服务器

```bash
npm run token
```

您应该看到：

```
🚀 豆包 Token 服务器已启动
📡 监听地址: http://localhost:3000

💡 使用说明:
1. 浏览器访问: http://localhost:3000/token
2. 返回格式: { success: true, token: "..." }

📋 配置信息:
  APP_KEY: 4145251174
  ACCESS_KEY: LpK1fJ6uG...

按 Ctrl+C 停止服务器
```

### 3. 启动 HTTP 服务器并测试

在**另一个终端**中：

```bash
cd ../..  # 回到项目根目录
http-server .
```

然后访问：
```
http://127.0.0.1:8080/js/doubao-wakeup/test.html
```

## 工作原理

```
┌─────────────┐         ┌──────────────────┐         ┌─────────────┐
│   浏览器    │ ------> │  Token 服务器    │ ------> │  豆包 API   │
│             │  GET    │  (localhost:3000)│  POST   │             │
│  test.html  │  /token │  token-server.js │  /token │  火山引擎   │
└─────────────┘         └──────────────────┘         └─────────────┘
     ↓                           ↓
     |                    解决 CORS 问题
     |                    缓存 Token (1小时)
     ↓
使用 Token 连接 WebSocket
wss://openspeech.bytedance.com/api/v3/sauc/bigmodel_async?
  api_resource_id=...&
  api_app_key=...&
  api_access_key=Jwt; ${token}
```

## 测试步骤

1. ✅ **启动 Token 服务器**
   ```bash
   cd js/doubao-wakeup
   npm run token
   ```

2. ✅ **启动 HTTP 服务器**（新终端）
   ```bash
   http-server .
   ```

3. ✅ **打开测试页面**
   ```
   http://127.0.0.1:8080/js/doubao-wakeup/test.html
   ```

4. ✅ **打开浏览器控制台**（查看日志）

5. ✅ **点击"启动检测"按钮**

6. ✅ **允许麦克风权限**

7. ✅ **说出唤醒词**："湖宝湖宝"

## 预期日志输出

### Token 服务器日志

```
🔄 获取新的 Token...
✅ JWT Token 获取成功
  Token: eyJhbGciOiJIUzI1NiIs...
```

### 浏览器控制台日志

```
[豆包唤醒] 正在获取 JWT Token...
[豆包唤醒] JWT Token 获取成功
  Token: eyJhbGciOiJIUzI1NiIs...
  Cached: 否
[豆包唤醒] WebSocket URL 已构建
  Base URL: wss://openspeech.bytedance.com/api/v3/sauc/bigmodel_async
  Resource ID: volc.seedasr.sauc.duration
  App Key: 4145251174
[豆包唤醒] 准备连接 WebSocket
[豆包唤醒] WebSocket已连接
  Connect-Id: 392a5e65-4dca-40cf-9ff6-492f2cf86eb4
[豆包唤醒] 已发送Full Client Request
```

## Token 缓存机制

Token 服务器会自动缓存 Token（有效期 1 小时）：

- **首次请求**：从豆包 API 获取新 Token
- **后续请求**：返回缓存的 Token（提前 5 分钟刷新）
- **自动刷新**：Token 过期前自动获取新 Token

这样可以：
- ✅ 减少 API 调用次数
- ✅ 提高响应速度
- ✅ 降低成本

## 常见问题

### Q1: Token 服务器启动失败

**错误**: `Error: Cannot find module 'express'`

**解决**: 运行 `npm install` 安装依赖

---

### Q2: 浏览器连接 Token 服务器失败

**错误**: `Failed to fetch http://localhost:3000/token`

**检查**:
1. Token 服务器是否正在运行？
2. 端口 3000 是否被占用？
3. 浏览器控制台是否有其他错误？

---

### Q3: Token 获取成功但 WebSocket 连接失败

**检查**:
1. 凭证是否正确？
2. 网络是否正常？
3. 账户余额是否充足？
4. 查看浏览器控制台的详细错误信息

---

### Q4: 如何停止服务器？

按 `Ctrl+C` 停止 Token 服务器。

---

### Q5: 可以在生产环境使用吗？

**可以，但需要注意**：

1. **安全性**：
   - 不要将 ACCESS_KEY 暴露在前端代码中
   - Token 服务器应该有访问控制（如 API Key）
   - 建议使用 HTTPS

2. **可靠性**：
   - 使用 PM2 等进程管理工具
   - 添加日志记录和监控
   - 配置自动重启

3. **性能**：
   - Token 缓存机制已经优化
   - 可以考虑使用 Redis 等缓存服务

---

## 架构优势

### ✅ 优点

1. **轻量级**：只需要一个简单的 Express 服务器
2. **易部署**：可以部署到任何支持 Node.js 的环境
3. **低成本**：Token 缓存减少 API 调用
4. **易维护**：代码简单，易于理解和修改

### ⚠️ 注意事项

1. **需要服务器**：虽然轻量，但仍需要运行 Node.js 服务器
2. **单点故障**：Token 服务器挂了，整个系统就无法工作
3. **凭证安全**：ACCESS_KEY 存储在服务器端，需要妥善保管

---

## 下一步

1. ✅ 测试 Token 获取
2. ✅ 测试 WebSocket 连接
3. ✅ 测试音频采集
4. ✅ 测试唤醒词检测
5. 🔄 集成到主应用
6. 🔄 部署到生产环境

---

**更新时间**: 2026-02-02
**状态**: ✅ CORS 问题已解决
**方案**: Token 服务器 + 浏览器 WebSocket
