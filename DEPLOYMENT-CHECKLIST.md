# 线上部署检查清单

## 📋 部署前准备

### 1. 准备凭证文件

在服务器上创建凭证文件（**不要提交到 git**）：

```bash
# 在服务器上创建凭证文件
ssh root@101.126.81.196
cd /chekkk/code/live2d_jinhua_web
nano js/doubao-wakeup/doubao-credentials.js
```

凭证文件内容：
```javascript
export const DOUBAO_CREDENTIALS = {
    APP_KEY: 'your_app_key_here',
    ACCESS_KEY: 'your_access_key_here'
}
```

### 2. 上传代码到服务器

```bash
# 从本地上传代码（不包含 node_modules 和凭证文件）
scp -r * root@101.126.81.196:/chekkk/code/live2d_jinhua_web/
```

## 🚀 部署步骤

### 步骤 1：部署 Token 服务器

```bash
# SSH 到服务器
ssh root@101.126.81.196

# 进入项目目录
cd /chekkk/code/live2d_jinhua_web

# 安装依赖（如果还没安装）
npm install express cors

# 测试 Token 服务器
node js/doubao-wakeup/token-server.js

# 如果测试成功，使用 PM2 启动
pm2 start js/doubao-wakeup/token-server.js --name doubao-token

# 设置开机自启
pm2 startup
pm2 save

# 查看服务状态
pm2 status
pm2 logs doubao-token
```

### 步骤 2：配置 Nginx

```bash
# 上传 Nginx 配置
scp nginx-doubao.conf root@101.126.81.196:/etc/nginx/sites-available/live2d_jinhua_web

# SSH 到服务器
ssh root@101.126.81.196

# 创建软链接（如果还没创建）
cd /etc/nginx/sites-enabled
ln -sf /etc/nginx/sites-available/live2d_jinhua_web live2d_jinhua_web

# 测试 Nginx 配置
nginx -t

# 重新加载 Nginx
nginx -s reload
```

### 步骤 3：验证部署

#### 3.1 检查 Token 服务器

```bash
# 在服务器上测试
curl http://localhost:3001/token

# 应该返回：
# {"success":true,"token":"eyJhbGci...","cached":false}

# 检查健康状态
curl http://localhost:3001/health
```

#### 3.2 检查 Nginx 转发

```bash
# 测试 Token API 转发
curl http://101.126.81.196:8801/api/doubao/token

# 应该返回相同的 Token 响应
```

#### 3.3 浏览器测试

1. 访问：`http://101.126.81.196:8801/`
2. 打开浏览器控制台
3. 查看环境信息：
   ```
   === 豆包 API 环境配置 ===
   环境: 线上
   Token API: /api/doubao/token
   WebSocket API: ws://101.126.81.196:8801/api/doubao/ws/api/v3/sauc/bigmodel_async
   ```
4. 允许麦克风权限
5. 说出唤醒词："湖宝湖宝"
6. 检查控制台是否有错误

## ✅ 验证清单

- [ ] Token 服务器运行正常（`pm2 status` 显示 online）
- [ ] Token API 可以正常获取 Token（`curl http://localhost:3001/token`）
- [ ] Nginx 配置测试通过（`nginx -t`）
- [ ] Nginx 转发正常（`curl http://101.126.81.196:8801/api/doubao/token`）
- [ ] 浏览器可以访问页面（`http://101.126.81.196:8801/`）
- [ ] 浏览器控制台显示"线上"环境
- [ ] 麦克风权限已授予
- [ ] 唤醒词识别正常

## 🔍 故障排查

### Token 服务器无法启动

```bash
# 检查凭证文件是否存在
ls -la js/doubao-wakeup/doubao-credentials.js

# 检查凭证文件内容
cat js/doubao-wakeup/doubao-credentials.js

# 查看 PM2 日志
pm2 logs doubao-token --lines 50
```

### Nginx 返回 502 Bad Gateway

```bash
# 检查 Token 服务器是否运行
pm2 status

# 检查端口是否监听
netstat -tlnp | grep 3001

# 查看 Nginx 错误日志
tail -f /var/log/nginx/error.log
tail -f /var/log/nginx/doubao_token_error.log
```

### 浏览器无法获取 Token

1. 打开浏览器控制台 → Network 标签
2. 刷新页面
3. 查找 `/api/doubao/token` 请求
4. 检查：
   - 状态码（应该是 200）
   - 响应内容（应该包含 `success: true` 和 `token`）
   - 请求头和响应头

### WebSocket 连接失败

```bash
# 查看 WebSocket 日志
tail -f /var/log/nginx/doubao_ws_access.log
tail -f /var/log/nginx/doubao_ws_error.log

# 检查 Nginx WebSocket 配置
nginx -T | grep -A 20 "location /api/doubao/ws"
```

## 📊 监控命令

```bash
# 查看 Token 服务器状态
pm2 status doubao-token
pm2 monit doubao-token

# 查看 Token 服务器日志（实时）
pm2 logs doubao-token --lines 100

# 查看 Nginx 访问日志
tail -f /var/log/nginx/doubao_token_access.log
tail -f /var/log/nginx/doubao_ws_access.log

# 查看系统资源
htop
```

## 🔄 更新部署

当代码有更新时：

```bash
# 1. 上传新代码
scp -r * root@101.126.81.196:/chekkk/code/live2d_jinhua_web/

# 2. 重启 Token 服务器（如果 token-server.js 有更新）
ssh root@101.126.81.196
pm2 restart doubao-token

# 3. 重新加载 Nginx（如果配置有更新）
nginx -s reload

# 4. 清除浏览器缓存并刷新页面
```

## 🔐 安全建议

1. **保护凭证文件**
   ```bash
   # 设置文件权限（只有 root 可读）
   chmod 600 js/doubao-wakeup/doubao-credentials.js
   ```

2. **限制 Token API 访问**（可选）
   - 在 Nginx 中添加 IP 白名单
   - 或添加 API Key 验证

3. **使用 HTTPS**（推荐）
   - 配置 SSL 证书
   - 强制 HTTPS 访问

## 📝 环境对比

| 项目 | 本地开发 | 线上生产 |
|------|---------|---------|
| Token API | `http://localhost:3001/token` | `/api/doubao/token` → `http://localhost:3001/token` |
| WebSocket | `wss://openspeech.bytedance.com/...` | `/api/doubao/ws/...` → `wss://openspeech.bytedance.com/...` |
| 凭证位置 | 本地文件 | 服务器文件 |
| Token 缓存 | Token 服务器 | Token 服务器 |
| 环境检测 | `localhost` | `101.126.81.196` 或 `avatar.chekkk.com` |

---

**最后更新**: 2026-02-04
**状态**: ✅ 配置已优化，使用 Token 服务器方案
