# 豆包API配置字段说明

## 📋 字段对应关系

根据豆包API文档和火山引擎控制台，正确的字段对应关系如下：

| 代码中的字段 | API文档字段 | 控制台字段 | 说明 |
|------------|-----------|-----------|------|
| `APP_KEY` | X-Api-App-Key | **APP ID** | 应用标识 |
| `ACCESS_KEY` | X-Api-Access-Key | **Access Token** | 访问令牌（⚠️不是Secret Key） |
| `RESOURCE_ID` | X-Api-Resource-Id | 固定值 | 资源ID（⚠️不是实例ID） |

## ⚠️ 常见错误

### 错误1：ACCESS_KEY 填错了
- ❌ **错误**：填入 Secret Key
- ✅ **正确**：填入 Access Token

### 错误2：RESOURCE_ID 填错了
- ❌ **错误**：填入实例ID（如 `Doubao_Seed_ASR_Streaming_2.02000000059230375513B`）
- ✅ **正确**：填入固定的资源ID字符串（如 `volc.seedasr.sauc.duration`）

## 📝 您的配置

根据您的截图，正确的配置应该是：

```javascript
export const DOUBAO_CREDENTIALS = {
    // APP ID（从控制台复制）
    APP_KEY: '4145251174',

    // Access Token（从控制台复制，不是Secret Key！）
    ACCESS_KEY: 'LpK1fJ6uG4frTjWqMiZZ7Jp8agvDeSAW',

    // 资源ID（固定值，不是实例ID）
    // 您开通的是豆包2.0小时版，所以使用：
    RESOURCE_ID: 'volc.seedasr.sauc.duration',
}
```

## 🔄 如何切换模型

### 从时长版切换到并发版

只需修改 `RESOURCE_ID`：

```javascript
// 时长版（当前）
RESOURCE_ID: 'volc.seedasr.sauc.duration',

// 改为并发版
RESOURCE_ID: 'volc.seedasr.sauc.concurrent',
```

### 所有可用的资源ID

| 模型版本 | 计费方式 | RESOURCE_ID |
|---------|---------|-------------|
| 豆包2.0 | 小时版 | `volc.seedasr.sauc.duration` ✅ 您当前使用 |
| 豆包2.0 | 并发版 | `volc.seedasr.sauc.concurrent` |
| 豆包1.0 | 小时版 | `volc.bigasr.sauc.duration` |
| 豆包1.0 | 并发版 | `volc.bigasr.sauc.concurrent` |

## 🔍 如何在控制台查看

### 1. APP ID
位置：控制台 → 服务接口凭证 → APP ID
- 您的值：`4145251174`

### 2. Access Token
位置：控制台 → 服务接口凭证 → Access Token
- 显示为：`***********`（隐藏）
- 点击"显示"或"复制"获取完整值
- 您的值：`LpK1fJ6uG4frTjWqMiZZ7Jp8agvDeSAW`

### 3. Secret Key
位置：控制台 → 服务接口凭证 → Secret Key
- ⚠️ **注意**：这个字段**不需要**用于WebSocket API
- Secret Key 用于其他类型的API鉴权

## 📖 API文档参考

根据豆包API文档（第29-61行）：

```
鉴权
在 websocket 建连的 HTTP 请求头（Header 中）添加以下信息

X-Api-App-Key
使用火山引擎控制台获取的APP ID

X-Api-Access-Key
使用火山引擎控制台获取的Access Token  ← 注意：是Access Token

X-Api-Resource-Id
表示调用服务的资源信息 ID
豆包流式语音识别模型2.0
  小时版：volc.seedasr.sauc.duration
  并发版：volc.seedasr.sauc.concurrent
```

## ✅ 配置验证

您可以通过测试页面验证配置是否正确：

```bash
# 启动服务器
http-server .

# 访问测试页面
http://127.0.0.1:8080/js/doubao-wakeup/test.html
```

如果配置正确：
- ✅ 能够成功连接
- ✅ 能够识别语音
- ✅ 能够检测到唤醒词

如果配置错误：
- ❌ 连接失败
- ❌ 控制台显示鉴权错误
- ❌ 返回401或403错误

## 💡 提示

1. **Access Token 和 Secret Key 的区别**
   - Access Token：用于WebSocket API鉴权
   - Secret Key：用于其他类型的API鉴权（如REST API）

2. **实例ID 和 资源ID 的区别**
   - 实例ID：控制台显示的具体实例标识（如 `Doubao_Seed_ASR_Streaming_2.02000000059230375513B`）
   - 资源ID：API调用时使用的固定字符串（如 `volc.seedasr.sauc.duration`）

3. **切换模型**
   - 只需修改 `RESOURCE_ID`
   - 不需要修改 `APP_KEY` 和 `ACCESS_KEY`
   - 确保在控制台开通了对应的服务

---

**更新时间**：2026-02-02
**状态**：✅ 已更新为时长版配置
