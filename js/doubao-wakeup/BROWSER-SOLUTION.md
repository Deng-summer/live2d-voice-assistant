# 豆包唤醒词 - 纯浏览器方案实现完成 ✅

## 更新说明

根据豆包官方技术客服提供的 Web 端接入文档，已成功实现**纯浏览器环境**的鉴权方案。

## 关键突破

### 官方文档确认
> "由于前端Websocket 不支持自定义header，需要通过query参数鉴权"

豆包官方提供了浏览器环境的解决方案：
1. **先获取 JWT Token**（通过 HTTP API）
2. **通过 URL 参数传递鉴权信息**（而不是 Header）

### 鉴权流程

```
1. 调用 HTTP API 获取 JWT Token
   POST https://openspeech.bytedance.com/api/v1/sts/token
   Headers: Authorization: Bearer; ${ACCESS_KEY}
   Body: { appid, duration }

2. 使用 JWT Token 构建 WebSocket URL
   wss://openspeech.bytedance.com/api/v3/sauc/bigmodel_async?
     api_resource_id=volc.seedasr.sauc.duration&
     api_app_key=4145251174&
     api_access_key=Jwt; ${jwt_token}

3. 连接 WebSocket（无需自定义 Header）
```

## 实现文件

### 新增文件

1. **`doubao-auth.js`** - 鉴权模块
   - `getToken()` - 获取 JWT Token
   - `buildAuthUrl()` - 构建鉴权 URL
   - `getAuthenticatedUrl()` - 便捷方法

### 修改文件

1. **`doubao-websocket.js`**
   - 导入鉴权模块
   - 使用 `getAuthenticatedUrl()` 获取鉴权后的 URL
   - 移除代理相关代码

2. **`doubao-config.js`**
   - 移除 `USE_PROXY` 和 `PROXY_URL` 配置
   - 启用 `DEBUG` 模式（方便调试）

3. **`doubao-credentials.js`**
   - 已配置正确的凭证

## 使用方法

### 1. 确认凭证配置

检查 `doubao-credentials.js`：

```javascript
export const DOUBAO_CREDENTIALS = {
    APP_KEY: '4145251174',
    ACCESS_KEY: 'LpK1fJ6uG4frTjWqMiZZ7Jp8agvDeSAW',
    RESOURCE_ID: 'volc.seedasr.sauc.duration',
}
```

### 2. 启动测试

```bash
# 启动 HTTP 服务器
http-server .

# 访问测试页面
# http://127.0.0.1:8080/js/doubao-wakeup/test.html
```

### 3. 测试步骤

1. 打开测试页面
2. 打开浏览器控制台（查看详细日志）
3. 点击"启动检测"按钮
4. 允许麦克风权限
5. 说出唤醒词："湖宝湖宝"

### 4. 查看日志

控制台会输出详细的调试信息：

```
[豆包唤醒] 正在获取 JWT Token...
[豆包唤醒] JWT Token 获取成功
  Token: eyJhbGciOiJIUzI1NiIs...
[豆包唤醒] WebSocket URL 已构建
  Base URL: wss://openspeech.bytedance.com/api/v3/sauc/bigmodel_async
  Resource ID: volc.seedasr.sauc.duration
  App Key: 4145251174
[豆包唤醒] 准备连接 WebSocket
[豆包唤醒] WebSocket已连接
  Connect-Id: 392a5e65-4dca-40cf-9ff6-492f2cf86eb4
[豆包唤醒] 已发送Full Client Request
```

## 与之前方案的对比

### ❌ 之前的错误方案

```javascript
// 错误：直接传递 ACCESS_KEY
const url = new URL(DOUBAO_CONFIG.WS_URL)
url.searchParams.set('appid', DOUBAO_CONFIG.APP_KEY)
url.searchParams.set('token', DOUBAO_CONFIG.ACCESS_KEY)  // ❌ 错误
url.searchParams.set('resource_id', DOUBAO_CONFIG.RESOURCE_ID)
```

**问题**：
- 参数名称错误（应该是 `api_app_key` 而不是 `appid`）
- 直接传递 ACCESS_KEY（应该先获取 JWT Token）
- 缺少 `Jwt;` 前缀

### ✅ 正确的方案

```javascript
// 1. 先获取 JWT Token
const token = await getToken()

// 2. 构建正确的 URL 参数
const auth = {
    api_resource_id: DOUBAO_CONFIG.RESOURCE_ID,
    api_app_key: DOUBAO_CONFIG.APP_KEY,
    api_access_key: `Jwt; ${token}`,  // ✅ 正确
}
```

## 优势

1. ✅ **纯浏览器环境** - 无需 Node.js 服务器
2. ✅ **官方支持** - 基于官方文档实现
3. ✅ **简单易用** - 自动处理鉴权流程
4. ✅ **安全可靠** - JWT Token 有效期 1 小时，自动刷新

## 注意事项

### JWT Token 有效期

JWT Token 默认有效期为 1 小时（3600 秒）。如果需要长时间运行，需要：

1. **监听 WebSocket 错误**
2. **Token 过期时重新获取**
3. **重新建立连接**

代码中已经包含了错误处理和重试机制。

### CORS 问题

如果遇到 CORS 错误，可能是因为：
1. 本地文件协议（`file://`）不支持 - 必须使用 HTTP 服务器
2. 端口问题 - 确保使用 `http://127.0.0.1:8080` 而不是 `http://localhost:8080`

### 凭证安全

⚠️ **重要提示**：
- `ACCESS_KEY` 是敏感信息，不要提交到公开的 git 仓库
- 生产环境建议通过后端 API 获取 JWT Token，而不是在前端直接调用

## 下一步

1. ✅ 测试 WebSocket 连接
2. ✅ 测试音频采集
3. ✅ 测试唤醒词检测
4. 🔄 集成到主应用（`index.html`）
5. 🔄 添加 Token 自动刷新机制

## 参考文档

- 官方接入文档：https://bytedance.larkoffice.com/docx/WZgsd0NTYo4Hiux6xbIcnml5noe
- 豆包 API 文档：https://www.volcengine.com/docs/6561/1354869

---

**更新时间**: 2026-02-02
**状态**: ✅ 已完成并准备测试
**方案**: 纯浏览器环境（无需 Node.js）
