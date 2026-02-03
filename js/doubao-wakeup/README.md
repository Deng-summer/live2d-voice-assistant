# 豆包唤醒词检测模块

这是一个完整的豆包语音唤醒词检测模块，用于Live2D金华项目。

## 📁 文件结构

```
doubao-wakeup/
├── README.md                      # 本文件
├── doubao-config.js               # 配置文件
├── doubao-credentials.js          # API凭证（需填入真实凭证）
├── doubao-credentials.example.js  # 凭证模板
├── doubao-protocol.js             # 二进制协议处理
├── doubao-audio.js                # 音频采集
├── doubao-websocket.js            # WebSocket连接管理
├── doubao-stats.js                # 使用统计
├── doubao-schedule.js             # 定时控制
├── doubao-ui.js                   # 状态显示和控制
└── doubao-wakeup.js               # 主控制模块（对外接口）
```

## 🚀 快速开始

### 1. 配置API凭证

编辑 `doubao-credentials.js`，填入您的真实凭证：

```javascript
export const DOUBAO_CREDENTIALS = {
    APP_KEY: '您的APP_KEY',
    ACCESS_KEY: '您的ACCESS_KEY',
    RESOURCE_ID: 'volc.seedasr.sauc.concurrent',
}
```

### 2. 在control.js中使用

```javascript
import { startWakeupDetection, stopWakeupDetection } from '../doubao-wakeup/doubao-wakeup.js'

// 启动唤醒词检测
setTimeout(() => {
    startWakeupDetection(onWakeupDetected)
    showEleMessage('系统已就绪，请说"湖宝湖宝"唤醒', 'info', 3000)
}, systemLoadingTime)

// 唤醒回调
function onWakeupDetected() {
    showEleMessage('正在唤醒', 'success', 1500)
    enterMode('READY')
    latConnectWebSocket()
    stopWakeupDetection()  // 立即关闭豆包

    // 唤醒成功提示
    setTimeout(() => {
        showEleMessage('唤醒成功', 'success', 1500)
    }, 1500)
}
```

## 📖 API文档

### 主要接口

#### startWakeupDetection(callback)
启动唤醒词检测

```javascript
startWakeupDetection((wakeupWord) => {
    console.log('检测到唤醒词:', wakeupWord)
})
```

#### stopWakeupDetection()
停止唤醒词检测

```javascript
stopWakeupDetection()
```

#### pauseWakeupDetection()
暂停监听（保持连接）

```javascript
pauseWakeupDetection()
```

#### resumeWakeupDetection()
恢复监听

```javascript
resumeWakeupDetection()
```

#### getWakeupStatus()
获取当前状态

```javascript
const status = getWakeupStatus()
console.log('状态:', status.status)
console.log('统计:', status.stats)
```

## ⚙️ 配置说明

### 唤醒词配置

在 `doubao-config.js` 中修改：

```javascript
WAKEUP_WORD: '湖宝湖宝',
WAKEUP_KEYWORDS: ['湖宝湖宝', '湖宝', '胡宝胡宝'],
```

### 定时控制

```javascript
SCHEDULE_ENABLED: true,
SCHEDULE_STOP_TIME: '22:00',  // 停止时间
SCHEDULE_START_TIME: '08:00',  // 开始时间
```

### 成本控制

```javascript
STATS_ENABLED: true,
LIMIT_ENABLED: true,
DAILY_MAX_DURATION: 8 * 60 * 60 * 1000,  // 每日最大时长（8小时）
DAILY_MAX_WAKEUP_COUNT: 100,  // 每日最大唤醒次数
```

## 🔧 功能特性

- ✅ 语音唤醒词检测（"湖宝湖宝"）
- ✅ 模糊匹配支持
- ✅ 使用时长统计
- ✅ 每日调用上限
- ✅ 定时控制（夜间自动停止）
- ✅ 暂停/恢复功能
- ✅ 连接状态显示
- ✅ 自动重试机制
- ✅ 降级到键盘唤醒
- ✅ 完整的错误处理

## 🐛 调试

启用调试日志：

```javascript
// 在 doubao-config.js 中
DEBUG: true,
```

## ⚠️ 注意事项

1. **API凭证安全**
   - 不要将 `doubao-credentials.js` 提交到git
   - 已添加到 `.gitignore`

2. **浏览器要求**
   - 需要支持 WebSocket
   - 需要支持 Web Audio API
   - 需要麦克风权限（HTTPS或localhost）

3. **成本控制**
   - 使用并发版（`volc.seedasr.sauc.concurrent`）
   - 设置合理的每日上限
   - 启用定时控制

4. **连接管理**
   - 唤醒后立即关闭豆包连接
   - 不要让豆包和讯飞同时运行

## 📊 状态说明

- 🟢 **正常监听中** - 正在监听唤醒词
- 🟡 **连接中...** - 正在建立连接
- 🔴 **连接失败** - 连接失败，已降级到键盘唤醒
- ⏸️ **已暂停** - 用户手动暂停
- 🌙 **定时停止中** - 不在允许时间段内
- 🚫 **已达上限** - 达到每日使用上限

## 🧪 测试

1. 检查配置是否正确
2. 测试唤醒词识别
3. 测试暂停/恢复功能
4. 测试定时控制
5. 测试上限控制

## 📝 更新日志

### v1.0.0 (2026-02-02)
- 初始版本
- 完整的唤醒词检测功能
- 使用统计和成本控制
- 定时控制和暂停功能

## 📚 相关文档

- [豆包唤醒词集成方案.md](../../豆包唤醒词集成方案.md)
- [豆包API凭证配置说明.md](../../豆包API凭证配置说明.md)
- [豆包唤醒词需求确认.md](../../豆包唤醒词需求确认.md)

## 💡 技术支持

如有问题，请参考项目文档或联系开发团队。
