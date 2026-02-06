# 🎉 线上部署配置完成总结

## ✅ 已完成的工作

### 1. 融合 Nginx 配置

**文件**: `jinua-live2d.conf`

已将豆包 API 转发功能成功融合到现有的线上 Nginx 配置中：

- ✅ **保留所有原有功能**：
  - HTTPS 配置（443 端口，avatar.chekkk.com）
  - SSL 证书配置
  - 静态文件服务：/0001, /jinhua, /0002, /0003
  - 静态资源别名：/js, /css, /model
  - AI API 代理：/ai/, /ai_0001/, /ai_0003/, /AI/

- ✨ **新增豆包 API 功能**：
  - `/api/doubao/token` - Token API 转发（行 119-148）
  - `/api/doubao/ws` - WebSocket API 转发（行 151-180）
  - `/health` - 健康检查端点（行 183-187）

### 2. 创建部署文档

**文件**: `DEPLOYMENT-PRODUCTION.md`

详细的生产环境部署指南，包含：
- 📋 完整的部署步骤（6 个步骤）
- ✅ 验证清单
- 🔍 故障排查指南
- 🔄 回滚方案
- 🔐 安全建议
- 📊 监控命令

### 3. 创建自动化部署脚本

**文件**: `deploy-production.sh`

一键部署脚本，自动完成：
- 📤 上传代码到服务器
- 🔐 检查凭证文件
- 🚀 部署 Token 服务器（PM2）
- ⚙️ 更新 Nginx 配置（自动备份）
- ✅ 验证部署结果

## 🚀 快速部署指南

### 方式 1：使用自动化脚本（推荐）

```bash
# 1. 确保在项目根目录
cd /Users/dengsummer/Downloads/workCode/live2D/live2D

# 2. 运行部署脚本
bash deploy-production.sh
```

脚本会自动完成所有部署步骤，包括：
- 上传代码
- 检查凭证
- 部署 Token 服务器
- 更新 Nginx 配置
- 验证部署

### 方式 2：手动部署

如果需要手动控制每个步骤，请参考 `DEPLOYMENT-PRODUCTION.md` 文档。

## ⚠️ 部署前必须完成

### 在服务器上创建凭证文件

**这是最重要的步骤！** 必须先创建凭证文件，否则 Token 服务器无法启动。

```bash
# SSH 到服务器
ssh root@101.126.81.196

# 创建凭证文件
cd /chekkk/code/live2d
nano js/doubao-wakeup/doubao-credentials.js
```

凭证文件内容：

```javascript
export const DOUBAO_CREDENTIALS = {
    APP_KEY: 'your_app_key_here',
    ACCESS_KEY: 'your_access_key_here'
}
```

保存后设置权限：

```bash
chmod 600 js/doubao-wakeup/doubao-credentials.js
```

## 📊 部署架构

```
浏览器（HTTPS）
  ↓
Nginx (avatar.chekkk.com:443)
  ├─ /0001, /jinhua, /0002, /0003  → 静态文件（原有功能）
  ├─ /js, /css, /model             → 静态资源（原有功能）
  ├─ /ai/, /ai_0001/, /AI/         → AI API 代理（原有功能）
  ├─ /api/doubao/token             → Token 服务器（新增）
  │   ↓
  │   Token 服务器 (localhost:3001, PM2)
  │   ↓
  │   豆包 API (openspeech.bytedance.com)
  │
  └─ /api/doubao/ws                → WebSocket 转发（新增）
      ↓
      豆包 API (openspeech.bytedance.com)
```

## ✅ 验证清单

部署完成后，请验证以下项目：

### 服务器端验证

```bash
# 1. Token 服务器运行正常
pm2 status doubao-token
# 状态应该是 "online"

# 2. Token API 可以获取 Token
curl http://localhost:3001/token
# 应该返回 {"success":true,"token":"..."}

# 3. Nginx 配置正确
nginx -t
# 应该返回 "syntax is ok"

# 4. Token API 转发正常
curl https://avatar.chekkk.com/api/doubao/token
# 应该返回 Token 响应
```

### 浏览器端验证

1. 访问：`https://avatar.chekkk.com/0001/` 或 `https://avatar.chekkk.com/jinhua/`

2. 打开浏览器控制台（F12），应该看到：
   ```
   === 豆包 API 环境配置 ===
   环境: 线上
   Token API: /api/doubao/token
   WebSocket API: wss://avatar.chekkk.com/api/doubao/ws/...
   ```

3. 允许麦克风权限

4. 说出唤醒词："湖宝湖宝"

5. 检查控制台日志：
   - ✅ JWT Token 获取成功
   - ✅ WebSocket 连接成功
   - ✅ 唤醒词识别成功

### 原有功能验证

确保原有功能没有受到影响：

```bash
# 测试静态文件访问
curl -I https://avatar.chekkk.com/0001/
curl -I https://avatar.chekkk.com/jinhua/

# 测试 AI API 代理
curl https://avatar.chekkk.com/ai/
curl https://avatar.chekkk.com/AI/
```

## 📝 重要文件清单

| 文件 | 说明 | 用途 |
|------|------|------|
| `jinua-live2d.conf` | 融合后的 Nginx 配置 | 上传到服务器 `/etc/nginx/conf.d/` |
| `DEPLOYMENT-PRODUCTION.md` | 详细部署文档 | 参考手册 |
| `deploy-production.sh` | 自动化部署脚本 | 一键部署 |
| `DEPLOYMENT-CHECKLIST.md` | 部署检查清单 | 通用部署参考 |
| `nginx-doubao.conf` | 原始豆包配置 | 参考文件 |

## 🔍 故障排查

### Token 服务器无法启动

```bash
# 查看日志
pm2 logs doubao-token --lines 100

# 常见原因：
# 1. 凭证文件不存在或格式错误
# 2. 端口 3001 被占用
# 3. 依赖未安装
```

### Nginx 返回 502

```bash
# 检查 Token 服务器
pm2 status doubao-token
curl http://localhost:3001/token

# 查看 Nginx 日志
tail -f /var/log/nginx/doubao_token_error.log
```

### WebSocket 连接失败

```bash
# 查看 WebSocket 日志
tail -f /var/log/nginx/doubao_ws_error.log

# 检查豆包 API 连通性
curl -v https://openspeech.bytedance.com
```

## 🔄 回滚方案

如果部署出现问题，可以快速回滚：

```bash
# SSH 到服务器
ssh root@101.126.81.196

# 停止 Token 服务器
pm2 stop doubao-token
pm2 delete doubao-token

# 恢复旧配置
cp /etc/nginx/conf.d/live2d_jinhua.conf.backup.* /etc/nginx/conf.d/live2d_jinhua.conf

# 重新加载 Nginx
nginx -s reload
```

## 📞 监控命令

```bash
# Token 服务器
pm2 status doubao-token
pm2 logs doubao-token
pm2 monit

# Nginx 日志
tail -f /var/log/nginx/doubao_token_access.log
tail -f /var/log/nginx/doubao_ws_access.log
tail -f /var/log/nginx/error.log
```

## 🎯 下一步

1. **立即部署**：
   ```bash
   bash deploy-production.sh
   ```

2. **验证功能**：
   - 访问 https://avatar.chekkk.com/0001/
   - 测试唤醒词功能
   - 检查原有功能

3. **监控运行**：
   - 查看 Token 服务器日志
   - 监控 Nginx 访问日志
   - 关注错误日志

## 📚 相关文档

- `DEPLOYMENT-PRODUCTION.md` - 详细的生产环境部署指南
- `DEPLOYMENT-CHECKLIST.md` - 通用部署检查清单
- `DEPLOYMENT.md` - 原始部署文档
- `nginx-doubao.conf` - 原始豆包配置参考

---

**配置完成时间**: 2026-02-04
**配置状态**: ✅ 已完成，等待部署
**配置文件**: jinua-live2d.conf
**部署脚本**: deploy-production.sh

**重要提醒**: 部署前必须先在服务器上创建 `doubao-credentials.js` 凭证文件！
