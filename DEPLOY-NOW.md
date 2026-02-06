# 立即部署 - 3 步完成

## 第 1 步：打开终端

在 Mac 上打开终端（Terminal.app）

## 第 2 步：执行部署脚本

复制并运行以下命令：

```bash
cd /Users/dengsummer/Downloads/workCode/live2D/live2D

# 给脚本添加执行权限
chmod +x deploy-doubao-nginx.sh

# 确保 SSH 密钥权限正确
chmod 400 /Users/dengsummer/Downloads/live2d-jinhua-web.pem

# 运行部署脚本
./deploy-doubao-nginx.sh
```

## 第 3 步：按提示输入服务器路径

当脚本询问服务器项目路径时，输入：

```
/chekkk/code/live2d/0001
```

---

## 脚本会自动完成以下任务：

1. ✅ 检查本地文件
2. ✅ 测试 SSH 连接
3. ✅ 备份服务器文件
4. ✅ 上传 Nginx 配置
5. ✅ 上传 doubao-auth.js
6. ✅ 重启 Nginx
7. ✅ 测试 Token API

---

## 预期输出

如果成功，你会看到：

```
========================================
🎉 部署成功！
========================================

📋 下一步操作：

1️⃣  测试 Token API（公网）：
   curl https://avatar.chekkk.com/api/doubao/token

2️⃣  在浏览器中测试：
   https://avatar.chekkk.com/0001/index.html
```

---

## 如果遇到问题

### 问题 1：Permission denied (publickey)

**解决方法：**
```bash
# 确保密钥权限正确
chmod 400 /Users/dengsummer/Downloads/live2d-jinhua-web.pem

# 测试 SSH 连接
ssh -i /Users/dengsummer/Downloads/live2d-jinhua-web.pem root@101.126.81.196
```

### 问题 2：服务器路径不存在

**解决方法：**
```bash
# 手动连接服务器确认路径
ssh -i /Users/dengsummer/Downloads/live2d-jinhua-web.pem root@101.126.81.196

# 在服务器上查看路径
ls -la /chekkk/code/live2d/
ls -la /chekkk/code/live2d/0001/
```

---

## 快速启动（一键复制）

```bash
cd /Users/dengsummer/Downloads/workCode/live2D/live2D && chmod +x deploy-doubao-nginx.sh && chmod 400 /Users/dengsummer/Downloads/live2d-jinhua-web.pem && ./deploy-doubao-nginx.sh
```

**准备好了就运行这条命令，输入服务器路径后一切自动完成！** 🚀
