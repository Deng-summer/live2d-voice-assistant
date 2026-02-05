# 豆包唤醒词 - 服务器部署指南

## 部署架构

```
┌─────────────────────────────────────────────────────────────┐
│  本地开发环境                                                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  浏览器 → Token服务器(localhost:3001) → 豆包API             │
│         → WebSocket(直连) → 豆包API                         │
│                                                             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  线上生产环境                                                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  浏览器 → Nginx(/api/doubao/token) → 豆包API                │
│         → Nginx(/api/doubao/ws) → 豆包API                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## 部署步骤

### 1. 上传代码到服务器

```bash
# 打包前端代码
npm run build

# 上传到服务器
scp -r dist/* root@101.126.81.196:/chekkk/code/live2d_jinhua_web/dist/
```

### 2. 配置 Nginx

#### 2.1 复制配置文件

```bash
# 将 nginx-doubao.conf 上传到服务器
scp nginx-doubao.conf root@101.126.81.196:/etc/nginx/sites-available/live2d_jinhua_web

# 创建软链接
ssh root@101.126.81.196
cd /etc/nginx/sites-enabled
ln -s /etc/nginx/sites-available/live2d_jinhua_web live2d_jinhua_web
```

#### 2.2 测试配置

```bash
# 测试 Nginx 配置
nginx -t

# 如果测试通过，重新加载配置
nginx -s reload
```

### 3. 验证部署

#### 3.1 访问前端页面

```
http://101.126.81.196:8801/
或
https://avatar.chekkk.com/0001/
```

#### 3.2 测试 Token API

```bash
# 测试 Token API 转发
curl -X GET http://101.126.81.196:8801/api/doubao/token

# 应该返回类似：
# {"success":true,"token":"eyJhbGciOiJIUzI1NiIs...","cached":false}
```

#### 3.3 测试唤醒词

1. 打开浏览器控制台
2. 允许麦克风权限
3. 说出唤醒词："湖宝湖宝"
4. 查看控制台日志

## Nginx 配置说明

### Token API 转发

```nginx
location /api/doubao/token {
    # 转发到豆包 Token API
    proxy_pass https://openspeech.bytedance.com/api/v1/sts/token;

    # 保留原始请求头（重要：豆包 API 需要 Authorization 头）
    proxy_pass_request_headers on;

    # CORS 配置（允许前端跨域访问）
    add_header 'Access-Control-Allow-Origin' '*' always;
    add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS' always;
    add_header 'Access-Control-Allow-Headers' 'Authorization, Content-Type' always;
}
```

### WebSocket API 转发

```nginx
location /api/doubao/ws {
    # 转发到豆包 WebSocket API
    proxy_pass https://openspeech.bytedance.com;

    # WebSocket 升级配置
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";

    # 长连接配置
    proxy_connect_timeout 60s;
    proxy_send_timeout 3600s;
    proxy_read_timeout 3600s;
    proxy_buffering off;
}
```

## 环境自动切换

前端代码会自动检测运行环境：

```javascript
// doubao-env.js
function isProduction() {
    const hostname = window.location.hostname
    const productionHosts = ['avatar.chekkk.com', '101.126.81.196']
    return productionHosts.includes(hostname)
}
```

### 本地开发环境

- Token API: `http://localhost:3001/token`
- WebSocket: `wss://openspeech.bytedance.com/api/v3/sauc/bigmodel_async`

### 线上生产环境

- Token API: `/api/doubao/token`（Nginx 转发）
- WebSocket: `/api/doubao/ws/api/v3/sauc/bigmodel_async`（Nginx 转发）

## 服务器端 Token 服务

### 方案 1：使用 Nginx 直接转发（推荐）

**优点**：
- ✅ 无需额外的 Node.js 进程
- ✅ Nginx 性能高，稳定可靠
- ✅ 配置简单

**缺点**：
- ❌ 无法缓存 Token（每次都调用豆包 API）
- ❌ 凭证需要在前端传递（不够安全）

### 方案 2：部署 Token 服务器

如果需要 Token 缓存和更好的安全性，可以在服务器上部署 Token 服务器：

```bash
# 1. 上传 token-server.js 到服务器
scp js/doubao-wakeup/token-server.js root@101.126.81.196:/chekkk/code/live2d_jinhua_web/

# 2. 安装依赖
ssh root@101.126.81.196
cd /chekkk/code/live2d_jinhua_web
npm install express cors

# 3. 使用 PM2 启动
pm2 start token-server.js --name doubao-token

# 4. 设置开机自启
pm2 startup
pm2 save
```

然后修改 Nginx 配置：

```nginx
location /api/doubao/token {
    # 转发到本地 Token 服务器
    proxy_pass http://localhost:3001/token;

    # 其他配置保持不变
    add_header 'Access-Control-Allow-Origin' '*' always;
}
```

## 安全建议

### 1. 保护凭证

**不要**将 `doubao-credentials.js` 提交到 git：

```bash
# .gitignore
js/doubao-wakeup/doubao-credentials.js
```

### 2. 限制访问

在 Nginx 中添加访问限制：

```nginx
location /api/doubao/ {
    # 只允许特定 IP 访问
    allow 101.126.81.196;
    deny all;

    # 或者添加 API Key 验证
    if ($http_x_api_key != "your-secret-key") {
        return 403;
    }
}
```

### 3. 使用 HTTPS

强制使用 HTTPS：

```nginx
server {
    listen 80;
    server_name avatar.chekkk.com;
    return 301 https://$server_name$request_uri;
}
```

## 监控和日志

### 查看 Nginx 日志

```bash
# Token API 日志
tail -f /var/log/nginx/doubao_token_access.log
tail -f /var/log/nginx/doubao_token_error.log

# WebSocket 日志
tail -f /var/log/nginx/doubao_ws_access.log
tail -f /var/log/nginx/doubao_ws_error.log
```

### 监控 Token 使用

在 Token 服务器中添加统计：

```javascript
let tokenRequestCount = 0
let tokenCacheHitCount = 0

app.get('/stats', (req, res) => {
    res.json({
        totalRequests: tokenRequestCount,
        cacheHits: tokenCacheHitCount,
        cacheHitRate: (tokenCacheHitCount / tokenRequestCount * 100).toFixed(2) + '%'
    })
})
```

## 故障排查

### 1. Token API 返回 502

**原因**：Nginx 无法连接到豆包 API

**检查**：
```bash
# 测试服务器是否能访问豆包 API
curl -v https://openspeech.bytedance.com/api/v1/sts/token
```

### 2. WebSocket 连接失败

**原因**：WebSocket 升级失败

**检查**：
```bash
# 查看 Nginx 错误日志
tail -f /var/log/nginx/error.log
```

### 3. CORS 错误

**原因**：CORS 头配置不正确

**解决**：确保 Nginx 配置中有：
```nginx
add_header 'Access-Control-Allow-Origin' '*' always;
```

## 性能优化

### 1. 启用 Gzip 压缩

```nginx
gzip on;
gzip_types text/plain text/css application/json application/javascript;
gzip_min_length 1000;
```

### 2. 启用缓存

```nginx
location ~* \.(js|css|png|jpg|jpeg|gif|ico)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### 3. 连接池优化

```nginx
upstream doubao_api {
    server openspeech.bytedance.com:443;
    keepalive 32;
}

location /api/doubao/token {
    proxy_pass https://doubao_api/api/v1/sts/token;
    proxy_http_version 1.1;
    proxy_set_header Connection "";
}
```

## 回滚方案

如果部署出现问题，可以快速回滚：

```bash
# 1. 恢复旧的 Nginx 配置
cp /etc/nginx/sites-available/live2d_jinhua_web.backup /etc/nginx/sites-available/live2d_jinhua_web

# 2. 重新加载 Nginx
nginx -s reload

# 3. 恢复旧的前端代码
cp -r /chekkk/code/live2d_jinhua_web/dist.backup/* /chekkk/code/live2d_jinhua_web/dist/
```

---

**更新时间**: 2026-02-02
**状态**: ✅ 配置完成，准备部署
**环境**: 支持本地开发和线上生产
