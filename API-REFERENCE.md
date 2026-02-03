# API 快速参考文档

## 📋 目录

- [后端API接口](#后端api接口)
- [Live2D控制API](#live2d控制api)
- [语音识别API](#语音识别api)
- [语音合成API](#语音合成api)
- [模块回调API](#模块回调api)

---

## 后端API接口

### 基础配置

```javascript
const base_url = 'https://avatar.chekkk.com/ai'
```

### 1. 获取站点信息

**接口地址：** `POST /get_station_info`

**超时时间：** 3秒

**请求参数：**
```javascript
{}
```

**响应示例：**
```json
{
    "code": 200,
    "message": "成功",
    "data": {
        "station_name": "云蝶中心",
        "station_audio": "云蝶中心.mp3"
    }
}
```

**调用示例：**
```javascript
import { control_request } from './control-api.js'

control_request.getStation()
    .then(data => {
        console.log('站点信息:', data)
    })
    .catch(err => {
        console.error('获取失败:', err)
    })
```

---

### 2. 站点播报完成上报

**接口地址：** `POST /station_report_status`

**超时时间：** 3秒

**请求参数：**
```javascript
{
    "content": "云蝶中心"  // 站点名称
}
```

**响应示例：**
```json
{
    "code": 200,
    "message": "成功",
    "data": {}
}
```

**调用示例：**
```javascript
control_request.finishCurStation("云蝶中心")
    .then(data => {
        console.log('上报成功')
    })
    .catch(err => {
        console.error('上报失败:', err)
    })
```

---

### 3. 生成音乐

**接口地址：** `POST /process_generate_music`

**超时时间：** 6秒

**请求参数：**
```javascript
{
    "content": "关于金华的歌"  // 音乐主题描述
}
```

**响应：** 音频数据流（二进制）

**调用示例：**
```javascript
control_request.getMusicUrl("关于金华的歌")
    .then(audioUrl => {
        // 返回音频URL或数据
        console.log('音乐URL:', audioUrl)
    })
    .catch(err => {
        console.error('生成失败:', err)
    })
```

---

### 4. 单轮对话（流式）

**接口地址：** `POST /process_dialogue`

**超时时间：** 15秒

**请求参数：**
```javascript
{
    "content": "用户问题",
    "sentiment": "中性"  // 情感：中性/高兴/悲伤等
}
```

**响应格式（流式）：**
```
{"code": 200,"message": "成功","data": {"content": "回答片段1","status": "streaming"}}
{"code": 200,"message": "成功","data": {"content": "回答片段2","status": "streaming"}}
...
{"code": 200,"message": "成功","data": {"content": "回答片段N","status": "done!"}}
```

**调用示例：**
```javascript
import { control_request_stream } from './control-api-stream.js'

control_request_stream.getDialogue("你好", "中性")
    .then(() => {
        console.log('流式传输完成')
    })
    .catch(err => {
        console.error('请求失败:', err)
    })
```

**流式数据处理：**
- 通过 `chunkSingelReceived(data)` 回调函数接收每个数据包
- `status: "streaming"` 表示流式传输中
- `status: "done!"` 表示流式传输完成

---

### 5. 多轮对话（流式）

**接口地址：** `POST /process_continue_dialogue`

**超时时间：** 15秒

**请求参数：**
```javascript
{
    "content": "用户问题",
    "sentiment": "中性"
}
```

**响应格式（流式）：**
```
{"code": 200,"message": "成功","data": {"content": "回答片段1","status": "streaming"}}
{"code": 200,"message": "成功","data": {"content": "回答片段2","status": "streaming"}}
...
{"code": 200,"message": "成功","data": {"content": "回答片段N","status": "done!"}}
```

**调用示例：**
```javascript
control_request_stream.getMultiDialogue("继续聊", "中性")
    .then(() => {
        console.log('流式传输完成')
    })
    .catch(err => {
        console.error('请求失败:', err)
    })
```

**流式数据处理：**
- 通过 `chunkMultiReceived(data)` 回调函数接收每个数据包
- 保持对话上下文

---

### 6. 心跳上报

**接口地址：** `POST /web_status`

**超时时间：** 3秒

**请求参数：**
```javascript
{
    "status": "online" | "offline",  // 状态
    "reason": "原因描述"              // 原因
}
```

**响应示例：**
```json
{
    "code": 200,
    "message": "成功",
    "data": {}
}
```

**调用示例：**
```javascript
control_request.heartBeat("online", "系统启动")
    .then(data => {
        console.log('心跳上报成功')
    })
    .catch(err => {
        console.error('上报失败:', err)
    })
```

---

## Live2D控制API

### 导入

```javascript
import { 
    live2dMain, 
    triggerMotion, 
    triggerRepeatMotion, 
    triggerExpression 
} from './live2d-cubism4.js'
```

### live2dMain()

初始化Live2D模型

**功能：**
- 创建PIXI应用
- 加载模型文件
- 设置模型位置和缩放
- 触发初始动作

**调用示例：**
```javascript
await live2dMain()
```

---

### triggerMotion(motion_name)

触发单次动作

**参数：**
- `motion_name` (string): 动作名称

**支持的动作：**
- `'Idle'` - 待机
- `'Wave'` - 招手
- `'Talk'` - 说话
- `'Think'` - 思考
- `'Nod'` - 点头
- `'Song'` - 唱歌

**调用示例：**
```javascript
triggerMotion('Wave')   // 招手一次
triggerMotion('Talk')    // 说话一次
```

**注意：** 会中断当前循环动作

---

### triggerRepeatMotion(motion_name)

触发循环动作

**参数：**
- `motion_name` (string): 动作名称

**支持的动作：** 同 `triggerMotion`

**调用示例：**
```javascript
triggerRepeatMotion('Idle')   // 持续待机
triggerRepeatMotion('Talk')    // 持续说话
triggerRepeatMotion('Song')   // 持续唱歌
```

**功能：**
- 根据动作持续时间自动循环
- 自动匹配对应表情
- 持续播放直到被其他动作中断

---

### triggerExpression(express_name)

触发表情

**参数：**
- `express_name` (string): 表情名称

**支持的表情：**
- `'nomal'` - 正常表情
- `'sikao1'` - 思考表情1
- `'sikao2'` - 思考表情2
- `'gaoxing'` - 高兴表情
- `'yinyue1'` - 音乐表情1
- `'yinyue2' - 音乐表情2
- `'talk'` - 说话表情
- `'empty'` - 空表情

**调用示例：**
```javascript
triggerExpression('gaoxing')  // 高兴表情
triggerExpression('sikao1')    // 思考表情
```

---

## 语音识别API

### 导入

```javascript
import { lat_connectWebSocket } from '../iat-js/example/iat/index.js'
```

### lat_connectWebSocket()

建立语音识别WebSocket连接

**功能：**
- 连接讯飞IAT服务器
- 开始录音
- 实时识别语音

**调用示例：**
```javascript
lat_connectWebSocket()
```

---

### 回调函数

需要在 `control.js` 中实现以下回调函数：

#### latOnload({latWS, lat_recorder})

识别模块加载完成回调

**参数：**
- `latWS` (WebSocket): WebSocket连接对象
- `lat_recorder` (MediaRecorder): 录音对象

**调用示例：**
```javascript
export function latOnload({latWS, lat_recorder}) {
    control_lat_ws = latWS
    control_lat_recorder = lat_recorder
}
```

---

#### latResultOnChange({latResult, latStatus, latWS, lat_recorder})

识别结果变化回调

**参数：**
- `latResult` (string): 当前识别结果文本
- `latStatus` (string): 识别状态
- `latWS` (WebSocket): WebSocket连接对象
- `lat_recorder` (MediaRecorder): 录音对象

**调用示例：**
```javascript
export function latResultOnChange({latResult, latStatus, latWS, lat_recorder}) {
    control_lat_result = latResult
    // 处理识别结果
    jugeMode()
}
```

---

#### latWsOnOpened()

WebSocket连接成功回调

**调用示例：**
```javascript
export function latWsOnOpened() {
    console.log('语音识别连接成功')
}
```

---

#### latWsOnClosed()

WebSocket连接关闭回调

**功能：** 通常用于自动重连

**调用示例：**
```javascript
export function latWsOnClosed() {
    console.log('语音识别连接关闭')
    latConnectWebSocket()  // 自动重连
}
```

---

#### latWsOnError()

WebSocket连接错误回调

**调用示例：**
```javascript
export function latWsOnError() {
    console.error('语音识别连接错误')
    enterMode('BUS')  // 返回报站模式
}
```

---

#### latRecorderOnstart()

录音开始回调

**调用示例：**
```javascript
export function latRecorderOnstart() {
    page_changeState('listening')  // 更新UI状态
}
```

---

## 语音合成API

### 导入

```javascript
import { tts_connectWebSocket } from '../tts-lat/example/tts/index.js'
```

### tts_connectWebSocket()

建立语音合成WebSocket连接

**功能：**
- 连接讯飞TTS服务器
- 准备接收音频数据

**调用示例：**
```javascript
tts_connectWebSocket()
```

---

### AudioPlayer API

#### constructor(processorPath)

构造函数

**参数：**
- `processorPath` (string): processor.worker.js的路径

**调用示例：**
```javascript
const audioPlayer = new AudioPlayer("../../dist")
```

---

#### start(options)

开始播放准备

**参数：**
```javascript
{
    sampleRate: 16000,        // 采样率，默认16000
    autoPlay: true,           // 是否自动播放，默认true
    resumePlayDuration: 1000  // 续播延时，默认1000ms
}
```

**调用示例：**
```javascript
audioPlayer.start({
    autoPlay: true,
    sampleRate: 16000,
})
```

---

#### postMessage({type, data, isLastData})

发送音频数据

**参数：**
- `type` (string): 数据类型
  - `'base64'` - Base64编码
  - `'string'` - 字符串
  - `'Int16Array'` - Int16Array数组
  - `'Float32Array'` - Float32Array数组
- `data` (string/Int16Array/Float32Array): 音频数据
- `isLastData` (boolean): 是否为最后一段数据

**调用示例：**
```javascript
audioPlayer.postMessage({
    type: "base64",
    data: audioData,
    isLastData: false
})
```

---

#### play()

开始播放

**调用示例：**
```javascript
audioPlayer.play()
```

---

#### stop()

停止播放（保留数据）

**调用示例：**
```javascript
audioPlayer.stop()
```

---

#### reset()

重置（清空数据，停止播放）

**调用示例：**
```javascript
audioPlayer.reset()
```

---

#### onPlay

开始播放回调事件

**调用示例：**
```javascript
audioPlayer.onPlay = () => {
    console.log("开始播放")
}
```

---

#### onStop

停止播放回调事件

**调用示例：**
```javascript
audioPlayer.onStop = (audioDatas) => {
    console.log("停止播放", audioDatas)
}
```

---

## 模块回调API

### 模式控制回调

#### enterMode(mode)

进入指定模式

**参数：**
- `mode` (string): 模式代码

**调用示例：**
```javascript
enterMode('BUS')      // 进入报站模式
enterMode('READY')    // 进入唤醒模式
enterMode('MUSIC')    // 进入音乐模式
enterMode('SINGEL')   // 进入单轮模式
enterMode('MULTI')    // 进入多轮模式
```

---

### 模块完成回调

#### onMusicModuleEnd()

音乐模块完成回调

**功能：** 音乐播放完成后调用，返回BUS模式

**调用示例：**
```javascript
export function onMusicModuleEnd() {
    enterMode('BUS')
}
```

---

#### onSingleModuleEnd()

单轮对话模块完成回调

**功能：** 单轮对话完成后调用，返回BUS模式

**调用示例：**
```javascript
export function onSingleModuleEnd() {
    enterMode('BUS')
}
```

---

#### onMultiModuleEnd()

多轮对话模块完成回调

**功能：** 多轮对话完成后调用，保持READY模式等待下一轮

**调用示例：**
```javascript
export function onMultiModuleEnd() {
    control_multi_answing = false
    latConnectWebSocket()  // 继续下一轮
}
```

---

### 页面状态控制

#### page_changeState(state)

更新页面状态显示

**参数：**
- `state` (string): 状态名称
  - `'listening'` - 正在听
  - `'thinking'` - 正在思考
  - `'talking'` - 正在说话
  - `''` - 清空状态

**调用示例：**
```javascript
import { page_changeState } from './control-page.js'

page_changeState('listening')
```

---

#### control_tts_show(text)

显示识别/问题文本

**参数：**
- `text` (string): 要显示的文本

**调用示例：**
```javascript
import { control_tts_show } from './control-page.js'

control_tts_show('用户说的话')
```

---

#### control_answer_show(text)

显示回答文本

**参数：**
- `text` (string): 要显示的文本

**调用示例：**
```javascript
import { control_answer_show } from './control-page.js'

control_answer_show('AI的回答')
```

---

## 工具函数API

### 导入

```javascript
import { 
    debounce, 
    hasNChinese, 
    formatNowTime, 
    removeTrailingPeriod,
    extractLastJSONObject 
} from '../utils/deounce.js'
```

### debounce(func, wait)

防抖函数

**参数：**
- `func` (function): 要防抖的函数
- `wait` (number): 等待时间（毫秒）

**调用示例：**
```javascript
const debouncedFunc = debounce(() => {
    console.log('防抖执行')
}, 1000)
```

---

### hasNChinese(str, n)

检查字符串是否包含至少N个中文字符

**参数：**
- `str` (string): 要检查的字符串
- `n` (number): 最少中文字符数

**返回：** `boolean`

**调用示例：**
```javascript
hasNChinese('你好世界', 3)  // true
hasNChinese('hello', 3)     // false
```

---

### formatNowTime(date)

格式化时间为字符串

**参数：**
- `date` (Date): 日期对象

**返回：** `string`

**调用示例：**
```javascript
formatNowTime(new Date())  // "2024-01-01 12:00:00"
```

---

### removeTrailingPeriod(str)

移除字符串末尾的句号

**参数：**
- `str` (string): 要处理的字符串

**返回：** `string`

**调用示例：**
```javascript
removeTrailingPeriod('你好。')  // "你好"
```

---

### extractLastJSONObject(str)

从字符串中提取最后一个有效的JSON对象

**参数：**
- `str` (string): 包含JSON的字符串

**返回：** `object | null`

**调用示例：**
```javascript
const jsonStr = '{"a":1}{"b":2}{"c":3}'
extractLastJSONObject(jsonStr)  // {c: 3}
```

---

## 数学公式处理

### 导入

```javascript
import { replacCircle, containsLatex } from '../utils/mathReplace.js'
```

### replacCircle(text)

替换文本中的数学公式标记

**参数：**
- `text` (string): 要处理的文本

**返回：** `string`

---

### containsLatex(text)

检查文本是否包含LaTeX公式

**参数：**
- `text` (string): 要检查的文本

**返回：** `boolean`

---

## 全局变量

### 模式相关

```javascript
export let control_mode = "BUS"  // 当前模式

let control_modeMap = {
    BUS: '报站模式',
    READY: '唤醒模式',
    MUSIC: '音乐模式',
    SINGEL: '单轮模式',
    MULTI: '多轮模式',
}
```

### Live2D相关

```javascript
export var model = {}                    // Live2D模型对象
export let live2d_motion_name = "Idle"   // 当前动作名称
export let live2d_express_name = 'normal' // 当前表情名称
```

### 识别相关

```javascript
let control_lat_ws              // WebSocket连接
let control_lat_result = ''     // 识别结果
let control_lat_recorder         // 录音对象
const control_lat_time = 1800   // 断句时间（毫秒）
```

---

**文档版本：** 1.0.0  
**最后更新：** 2024-XX-XX
