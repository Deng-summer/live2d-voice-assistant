# 线上生产环境部署指南

## 📋 配置文件说明

### jinua-live2d.conf

这是融合后的生产环境 Nginx 配置文件，包含：

**原有功能（保持不变）**：
- ✅ HTTPS 配置（443 端口，avatar.chekkk.com）
- ✅ SSL 证书配置
- ✅ 静态文件服务：/0001, /jinhua, /0002, /0003
- ✅ 静态资源别名：/js, /css, /model
- ✅ AI API 代理：/ai/, /ai_0001/, /ai_0003/, /AI/

**新增功能（豆包 API 转发）**：
- ✨ `/api/doubao/token` - Token API 转发到本地 Token 服务器
- ✨ `/api/doubao/ws` - WebSocket API 转发到豆包语音识别服务
- ✨ `/health` - 健康检查端点

## 🚀 部署步骤

### 步骤 1：准备凭证文件

在服务器上创建豆包凭证文件（**重要：不要提交到 git**）：

```bash
# SSH 到服务器
ssh root@101.126.81.196

# 进入项目目录
cd /chekkk/code/live2d

# 创建凭证文件
nano js/doubao-wakeup/doubao-credentials.js
```

凭证文件内容：

```javascript
export const DOUBAO_CREDENTIALS = {
    APP_KEY: 'your_app_key_here',
    ACCESS_KEY: 'your_access_key_here'
}
```

保存后设置文件权限：

```bash
chmod 600 js/doubao-wakeup/doubao-credentials.js
```

### 步骤 2：部署 Token 服务器

```bash
# 确保在项目目录
cd /chekkk/code/live2d

# 安装依赖（如果还没安装）
npm install express cors

# 测试 Token 服务器
node js/doubao-wakeup/token-server.js

# 看到以下输出表示成功：
# 🚀 豆包 Token 服务器已启动
# 📡 监听地址: http://localhost:3001

# 按 Ctrl+C 停止测试

# 使用 PM2 启动服务
pm2 start js/doubao-wakeup/token-server.js --name doubao-token

# 设置开机自启
pm2 startup
pm2 save

# 查看服务状态
pm2 status
```

### 步骤 3：备份现有 Nginx 配置

```bash
# 备份当前配置
cp /etc/nginx/conf.d/live2d_jinhua.conf /etc/nginx/conf.d/live2d_jinhua.conf.backup.$(date +%Y%m%d_%H%M%S)

# 或者如果在 sites-available 目录
cp /etc/nginx/sites-available/live2d_jinhua /etc/nginx/sites-available/live2d_jinhua.backup.$(date +%Y%m%d_%H%M%S)
```

### 步骤 4：上传新配置文件

从本地上传融合后的配置文件：

```bash
# 从本地执行（在项目根目录）
scp jinua-live2d.conf root@101.126.81.196:/etc/nginx/conf.d/live2d_jinhua.conf

# 或者上传到 sites-available
scp jinua-live2d.conf root@101.126.81.196:/etc/nginx/sites-available/live2d_jinhua
```

### 步骤 5：测试并重新加载 Nginx

```bash
# SSH 到服务器
ssh root@101.126.81.196

# 测试 Nginx 配置语法
nginx -t

# 如果测试通过，输出应该是：
# nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
# nginx: configuration file /etc/nginx/nginx.conf test is successful

# 重新加载 Nginx
nginx -s reload

# 或者使用 systemctl
systemctl reload nginx
```

## ✅ 验证部署

### 1. 检查 Token 服务器

```bash
# 在服务器上测试
curl http://localhost:3001/token

# 应该返回：
# {"success":true,"token":"eyJhbGci...","cached":false}

# 检查健康状态
curl http://localhost:3001/health

# 应该返回：
# {"status":"ok","appKey":"your_app_key","tokenCached":true}
```

### 2. 检查 Nginx 转发

```bash
# 测试 Token API（HTTPS）
curl https://avatar.chekkk.com/api/doubao/token

# 应该返回相同的 Token 响应

# 测试健康检查
curl https://avatar.chekkk.com/health

# 应该返回：
# healthy
```

### 3. 浏览器测试

1. 访问：`https://avatar.chekkk.com/0001/` 或 `https://avatar.chekkk.com/jinhua/`

2. 打开浏览器控制台（F12）

3. 查看环境信息（应该显示）：
   ```
   === 豆包 API 环境配置 ===
   环境: 线上
   Token API: /api/doubao/token
   WebSocket API: wss://avatar.chekkk.com/api/doubao/ws/api/v3/sauc/bigmodel_async
   ```

4. 允许麦克风权限

5. 说出唤醒词："湖宝湖宝"

6. 检查控制台是否有以下日志：
   - ✅ JWT Token 获取成功
   - ✅ WebSocket 连接成功
   - ✅ 唤醒词识别成功

### 4. 验证原有功能

确保原有功能没有受到影响：

```bash
# 测试静态文件访问
curl -I https://avatar.chekkk.com/0001/
curl -I https://avatar.chekkk.com/jinhua/

# 测试 AI API 代理
curl https://avatar.chekkk.com/ai/
curl https://avatar.chekkk.com/AI/
```

## 📊 监控和日志

### 查看服务状态

```bash
# Token 服务器状态
pm2 status doubao-token
pm2 logs doubao-token --lines 50

# Nginx 状态
systemctl status nginx
```

### 查看日志

```bash
# Token API 日志
tail -f /var/log/nginx/doubao_token_access.log
tail -f /var/log/nginx/doubao_token_error.log

# WebSocket 日志
tail -f /var/log/nginx/doubao_ws_access.log
tail -f /var/log/nginx/doubao_ws_error.log

# Nginx 主日志
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

## 🔍 故障排查

### Token 服务器无法启动

**症状**：`pm2 status` 显示 errored 或 stopped

**排查步骤**：

```bash
# 查看 PM2 日志
pm2 logs doubao-token --lines 100

# 常见问题：
# 1. 凭证文件不存在或格式错误
ls -la js/doubao-wakeup/doubao-credentials.js
cat js/doubao-wakeup/doubao-credentials.js

# 2. 端口 3001 被占用
netstat -tlnp | grep 3001
lsof -i :3001

# 3. 依赖未安装
npm list express cors
```

### Nginx 返回 502 Bad Gateway

**症状**：访问 `/api/doubao/token` 返回 502

**排查步骤**：

```bash
# 1. 检查 Token 服务器是否运行
pm2 status doubao-token
curl http://localhost:3001/token

# 2. 查看 Nginx 错误日志
tail -f /var/log/nginx/error.log
tail -f /var/log/nginx/doubao_token_error.log

# 3. 检查 Nginx 配置
nginx -T | grep -A 30 "location /api/doubao/token"
```

### WebSocket 连接失败

**症状**：浏览器控制台显示 WebSocket 连接错误

**排查步骤**：

```bash
# 1. 查看 WebSocket 日志
tail -f /var/log/nginx/doubao_ws_error.log

# 2. 检查 Nginx WebSocket 配置
nginx -T | grep -A 30 "location /api/doubao/ws"

# 3. 测试豆包 API 连通性
curl -v https://openspeech.bytedance.com
```

### 原有功能受影响

**症状**：/0001, /jinhua 等路径无法访问

**排查步骤**：

```bash
# 1. 检查配置文件语法
nginx -t

# 2. 查看 Nginx 错误日志
tail -f /var/log/nginx/error.log

# 3. 如果问题严重，回滚配置
cp /etc/nginx/conf.d/live2d_jinhua.conf.backup.* /etc/nginx/conf.d/live2d_jinhua.conf
nginx -s reload
```

## 🔄 回滚方案

如果部署出现严重问题，可以快速回滚：

```bash
# 1. 停止 Token 服务器
pm2 stop doubao-token
pm2 delete doubao-token

# 2. 恢复旧的 Nginx 配置
cp /etc/nginx/conf.d/live2d_jinhua.conf.backup.* /etc/nginx/conf.d/live2d_jinhua.conf

# 3. 测试配置
nginx -t

# 4. 重新加载 Nginx
nginx -s reload

# 5. 验证原有功能
curl -I https://avatar.chekkk.com/0001/
```

## 🔐 安全建议

### 1. 保护凭证文件

```bash
# 设置严格的文件权限
chmod 600 js/doubao-wakeup/doubao-credentials.js
chown root:root js/doubao-wakeup/doubao-credentials.js

# 确保不在 git 中
echo "js/doubao-wakeup/doubao-credentials.js" >> .gitignore
```

### 2. 限制 Token API 访问（可选）

如果需要更严格的安全控制，可以在 Nginx 中添加 IP 白名单：

```nginx
location /api/doubao/token {
    # 只允许本地访问
    allow 127.0.0.1;
    allow ::1;
    deny all;

    proxy_pass http://localhost:3001/token;
    # ... 其他配置
}
```

### 3. 监控异常访问

```bash
# 定期检查访问日志
tail -f /var/log/nginx/doubao_token_access.log | grep -v "200"

# 设置日志告警（可选）
# 使用 fail2ban 或其他监控工具
```

## 📝 配置对比

| 配置项 | 原有配置 | 新增配置 |
|--------|---------|---------|
| HTTPS 端口 | 443 | 443（不变） |
| 域名 | avatar.chekkk.com | avatar.chekkk.com（不变） |
| SSL 证书 | /etc/nginx/ssl_key/Nginx/ | /etc/nginx/ssl_key/Nginx/（不变） |
| 静态文件 | /0001, /jinhua, /0002, /0003 | 保持不变 |
| AI 代理 | /ai/, /ai_0001/, /ai_0003/, /AI/ | 保持不变 |
| Token API | - | `/api/doubao/token` → `localhost:3001` |
| WebSocket | - | `/api/doubao/ws` → `openspeech.bytedance.com` |
| 健康检查 | - | `/health` |

## 📞 联系支持

如果遇到问题，请检查：

1. Token 服务器日志：`pm2 logs doubao-token`
2. Nginx 错误日志：`/var/log/nginx/error.log`
3. 豆包 API 日志：`/var/log/nginx/doubao_*_error.log`

---

**最后更新**: 2026-02-04
**配置文件**: jinua-live2d.conf
**状态**: ✅ 已融合豆包 API 转发功能，保持原有功能不变
