# 湖宝②-车控CHEK 项目文档

## 📋 目录

- [项目概述](#项目概述)
- [系统架构](#系统架构)
- [功能模块详解](#功能模块详解)
- [API文档](#api文档)
- [配置说明](#配置说明)
- [使用指南](#使用指南)
- [开发指南](#开发指南)
- [常见问题](#常见问题)

---

## 项目概述

### 项目简介

**湖宝②-车控CHEK** 是一个基于 Live2D 技术的智能虚拟角色交互系统，集成了语音识别、语音合成、AI对话和Live2D模型展示功能。主要用于车载场景的虚拟助手应用，提供报站、音乐播放、智能对话等交互功能。

### 核心特性

- 🎭 **Live2D模型展示** - 支持 Cubism SDK 2.1.0 和 SDK 4.0
- 🎤 **实时语音识别** - 基于讯飞IAT SDK的WebSocket实时识别
- 🔊 **语音合成** - 支持讯飞TTS和火山引擎TTS
- 💬 **AI智能对话** - 单轮和多轮对话模式
- 🎵 **AI音乐生成** - 根据文本生成音乐并播放
- 📢 **站点播报** - 自动播报站点信息
- 🎨 **丰富的交互** - 动作、表情、状态动画

### 技术栈

| 技术 | 版本/说明 |
|------|----------|
| Vue | 2.x |
| Element UI | 2.15.14 |
| PIXI.js | - |
| Live2D SDK | Cubism 2.1.0 / 4.0 |
| 讯飞IAT SDK | 实时语音识别 |
| 讯飞TTS SDK | 语音合成 |
| Axios | HTTP请求库 |
| MathJax | 数学公式渲染 |

---

## 系统架构

### 整体架构图

```
┌─────────────────────────────────────────────────┐
│              用户交互层 (index.html)              │
├─────────────────────────────────────────────────┤
│  Live2D渲染层  │  语音识别层  │  语音合成层  │
│  (live2d-cubism4.js) │ (iat-js) │ (tts-lat) │
├─────────────────────────────────────────────────┤
│           金华控制中心 (control.js)              │
│  ┌──────────┬──────────┬──────────┬──────────┐ │
│  │ 报站模块 │ 音乐模块 │ 单轮对话 │ 多轮对话 │ │
│  └──────────┴──────────┴──────────┴──────────┘ │
├─────────────────────────────────────────────────┤
│            API接口层 (control-api.js)            │
├─────────────────────────────────────────────────┤
│              后端服务 (avatar.chekkk.com)         │
└─────────────────────────────────────────────────┘
```

### 核心模块关系

```
control.js (核心控制)
    ├── control-api.js (后端接口)
    ├── control-api-stream.js (流式接口)
    ├── control-station.js (报站模块)
    ├── control-music.js (音乐模块)
    ├── control-singel-talk.js (单轮对话)
    ├── control-multi-talk.js (多轮对话)
    └── control-page.js (页面状态控制)
```

---

## 功能模块详解

### 1. 金华控制中心 (control.js)

**核心职责：** 统一管理所有工作模式的状态流转和模块调用

#### 工作模式

| 模式代码 | 模式名称 | 说明 | 触发条件 |
|---------|---------|------|---------|
| `BUS` | 报站模式 | 默认模式，自动播报站点信息 | 系统启动/退出其他模式 |
| `READY` | 唤醒模式 | 等待用户指令，开启语音识别 | 按Enter键 |
| `MUSIC` | 音乐模式 | AI生成音乐并播放 | 语音指令："音乐"、"唱歌"等 |
| `SINGEL` | 单轮模式 | 一次性问答对话 | 唤醒后说3个以上中文字 |
| `MULTI` | 多轮模式 | 连续对话模式 | 语音指令："小可"、"聊天"等 |

#### 模式切换流程

```
启动 → BUS模式
  ↓ (按Enter)
READY模式 → 开启语音识别
  ↓ (语音识别结果)
  ├─ 关键词匹配 → MUSIC/MULTI模式
  ├─ 3个以上中文字 → SINGEL模式
  └─ 无有效输入 → 60秒后自动返回BUS模式
```

#### 关键词映射表

```javascript
const keywordToMode = {
    // 退出关键词
    '坐下': 'BUS',
    '退出': 'BUS',
    '退下': 'BUS',
    '结束': 'BUS',
    
    // 音乐模式关键词
    '音乐': 'MUSIC',
    '唱歌': 'MUSIC',
    '播放': 'MUSIC',
    '唱首歌': 'MUSIC',
    '的歌': 'MUSIC',
    
    // 多轮对话关键词
    '小可': 'MULTI',
    '小客': 'MULTI',
    '肖克': 'MULTI',
    '即刻': 'MULTI',
    '极客': 'MULTI',
    '模式': 'MULTI',
    '聊天': 'MULTI',
    '聊聊': 'MULTI',
}
```

#### 核心函数

##### `enterMode(mode)`
进入指定模式

**参数：**
- `mode` (string): 模式代码 ('BUS' | 'READY' | 'MUSIC' | 'SINGEL' | 'MULTI')

**功能：**
- 更新全局模式状态
- 更新UI显示
- 调用对应模块的启动函数

##### `jugeMode()`
判断并切换模式（核心逻辑）

**触发条件：** 语音识别结果更新后，经过1.8秒防抖处理

**判断优先级：**
1. **优先级一：** 关键词匹配
   - 退出关键词 → 直接返回BUS模式
   - 功能关键词 → 从READY模式进入对应功能模式
2. **优先级二：** 多轮模式下的连续对话
   - 多轮模式下，1个以上中文字 → 继续多轮对话
3. **优先级三：** 单轮对话
   - READY模式下，3个以上中文字 → 进入单轮模式

##### `latConnectWebSocket()`
管理语音识别WebSocket连接

**功能：**
- READY模式：开启识别，60秒无操作自动退出
- MULTI模式：开启识别，60秒无操作自动退出
- 其他模式：关闭识别连接

---

### 2. Live2D模型控制 (live2d-cubism4.js)

**核心职责：** 管理Live2D模型的加载、动作和表情

#### 模型配置

```javascript
const jinhuaModel = '/model/jinhua_3/jinhua0823.model3.json'
```

#### 支持的动作

| 动作名称 | 说明 | 持续时间(ms) |
|---------|------|------------|
| `Idle` | 待机动作 | 5000 |
| `Wave` | 招手动作 | 6367 |
| `Talk` | 说话动作 | 2000 |
| `Think` | 思考动作 | 5000 |
| `Nod` | 点头动作 | 3533 |
| `Song` | 唱歌动作 | 6500 |

#### 支持的表情

| 表情名称 | 说明 |
|---------|------|
| `nomal` | 正常表情 |
| `sikao1` | 思考表情1 |
| `sikao2` | 思考表情2 |
| `gaoxing` | 高兴表情 |
| `yinyue1` | 音乐表情1 |
| `yinyue2` | 音乐表情2 |
| `talk` | 说话表情 |
| `empty` | 空表情 |

#### 核心函数

##### `live2dMain()`
初始化Live2D模型

**功能：**
- 创建PIXI应用
- 加载模型文件
- 设置模型位置和缩放
- 触发初始动作（Wave）

##### `triggerMotion(motion_name)`
触发单次动作

**参数：**
- `motion_name` (string): 动作名称

**示例：**
```javascript
triggerMotion('Wave')  // 招手一次
triggerMotion('Talk')  // 说话一次
```

##### `triggerRepeatMotion(motion_name)`
触发循环动作

**参数：**
- `motion_name` (string): 动作名称

**功能：**
- 根据动作持续时间设置循环间隔
- 自动匹配对应表情
- 持续循环播放直到被其他动作中断

**示例：**
```javascript
triggerRepeatMotion('Idle')   // 持续待机
triggerRepeatMotion('Talk')    // 持续说话
triggerRepeatMotion('Song')    // 持续唱歌
```

##### `triggerExpression(express_name)`
触发表情

**参数：**
- `express_name` (string): 表情名称

**示例：**
```javascript
triggerExpression('gaoxing')  // 高兴表情
triggerExpression('sikao1')   // 思考表情
```

---

### 3. 语音识别模块 (iat-js)

**核心职责：** 实时语音识别，将语音转换为文字

#### 工作流程

1. **连接建立：** WebSocket连接到讯飞服务器
2. **开始录音：** 使用浏览器MediaRecorder API
3. **实时识别：** 音频数据通过WebSocket发送
4. **结果回调：** 识别结果实时返回
5. **断句检测：** 1.8秒无新结果视为断句

#### 核心回调函数

##### `latResultOnChange({latResult, latStatus, latWS, lat_recorder})`
识别结果变化回调

**参数：**
- `latResult` (string): 当前识别结果文本
- `latStatus` (string): 识别状态
- `latWS` (WebSocket): WebSocket连接对象
- `lat_recorder` (MediaRecorder): 录音对象

**功能：**
- 更新识别结果
- 显示识别文字到UI
- 触发模式判断（防抖1.8秒）

##### `latWsOnOpened()`
WebSocket连接成功回调

##### `latWsOnClosed()`
WebSocket连接关闭回调

**功能：** 自动重连

##### `latWsOnError()`
WebSocket连接错误回调

**功能：** 返回BUS模式，显示错误提示

---

### 4. 语音合成模块 (tts-lat)

**核心职责：** 将文字转换为语音并播放

#### 工作流程

1. **连接建立：** WebSocket连接到讯飞TTS服务器
2. **发送文本：** 将需要合成的文本发送
3. **接收音频：** 实时接收音频数据流
4. **流式播放：** 使用AudioPlayer进行流式播放

#### AudioPlayer API

##### `constructor(processorPath)`
构造函数

**参数：**
- `processorPath` (string): processor.worker.js的路径

##### `start(options)`
开始播放准备

**参数：**
```javascript
{
    sampleRate: 16000,        // 采样率，默认16000
    autoPlay: true,           // 是否自动播放，默认true
    resumePlayDuration: 1000  // 续播延时，默认1000ms
}
```

##### `postMessage({type, data, isLastData})`
发送音频数据

**参数：**
- `type` (string): 数据类型 ('base64' | 'string' | 'Int16Array' | 'Float32Array')
- `data` (string/Int16Array/Float32Array): 音频数据
- `isLastData` (boolean): 是否为最后一段数据

##### `play()`
开始播放

##### `stop()`
停止播放（保留数据）

##### `reset()`
重置（清空数据，停止播放）

---

### 5. 报站模块 (control-station.js)

**核心职责：** 自动播报站点信息

#### 工作流程

1. **获取站点信息：** 调用 `/get_station_info` 接口
2. **播放站点音频：** 播放预录制的站点音频文件
3. **播放完成上报：** 调用 `/station_report_status` 接口
4. **循环播报：** 自动获取下一个站点信息

#### 音频文件位置

```
js/jinhua/bus-stop-audio/
├── 云蝶中心.mp3
├── 启明谷站.mp3
├── 国际交流中心站.mp3
├── 晴翠丘站.mp3
├── 望湖堤站.mp3
├── 湖心岛站.mp3
├── 理工学院站.mp3
├── 研学湾站.mp3
├── 秋枫港站.mp3
└── 金漪集站.mp3
```

---

### 6. 音乐模块 (control-music.js)

**核心职责：** AI生成音乐并播放

#### 工作流程

1. **提取关键词：** 从用户语音中提取音乐主题关键词
2. **生成音乐：** 调用 `/process_generate_music` 接口
3. **接收音频流：** 实时接收生成的音乐音频
4. **流式播放：** 使用AudioPlayer播放音乐
5. **显示进度：** 更新音乐播放进度条
6. **播放完成：** 调用回调返回BUS模式

#### 接口说明

**请求：**
```javascript
POST /process_generate_music
{
    "content": "关于金华的歌"  // 音乐主题描述
}
```

**响应：**
- 返回音乐音频数据流

---

### 7. 单轮对话模块 (control-singel-talk.js)

**核心职责：** 处理一次性问答对话

#### 工作流程

1. **接收问题：** 从语音识别结果获取用户问题
2. **流式请求：** 调用 `/process_dialogue` 接口（流式）
3. **实时显示：** 流式接收回答内容，实时显示
4. **语音合成：** 将回答内容发送到TTS模块
5. **流式播放：** 实时播放合成的语音
6. **完成回调：** 对话完成后返回BUS模式

#### 流式数据处理

```javascript
// 流式包格式
{
    "code": 200,
    "message": "成功",
    "data": {
        "content": "回答内容片段",
        "status": "streaming" | "done!"
    }
}
```

**状态说明：**
- `streaming`: 流式传输中
- `done!`: 流式传输完成

---

### 8. 多轮对话模块 (control-multi-talk.js)

**核心职责：** 处理连续对话，保持上下文

#### 工作流程

1. **接收问题：** 从语音识别结果获取用户问题
2. **流式请求：** 调用 `/process_continue_dialogue` 接口（流式）
3. **实时显示：** 流式接收回答内容，实时显示
4. **语音合成：** 将回答内容发送到TTS模块
5. **流式播放：** 实时播放合成的语音
6. **保持连接：** 对话完成后保持语音识别连接，等待下一轮对话
7. **超时退出：** 60秒无新对话自动返回BUS模式

#### 与单轮对话的区别

| 特性 | 单轮对话 | 多轮对话 |
|------|---------|---------|
| 接口 | `/process_dialogue` | `/process_continue_dialogue` |
| 上下文 | 无上下文 | 保持上下文 |
| 完成后 | 返回BUS模式 | 保持READY模式，等待下一轮 |
| 超时时间 | 无 | 60秒无操作自动退出 |

---

## API文档

### 后端接口基础配置

```javascript
const base_url = 'https://avatar.chekkk.com/ai'
const timeout = 3000  // 默认超时时间（毫秒）
```

### 1. 获取站点信息

**接口：** `POST /get_station_info`

**请求：**
```json
{}
```

**响应：**
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

**用途：** 获取当前需要播报的站点信息

---

### 2. 站点播报完成上报

**接口：** `POST /station_report_status`

**请求：**
```json
{
    "content": "云蝶中心"
}
```

**响应：**
```json
{
    "code": 200,
    "message": "成功",
    "data": {}
}
```

**用途：** 通知后端当前站点已播报完成

---

### 3. 生成音乐

**接口：** `POST /process_generate_music`

**请求：**
```json
{
    "content": "关于金华的歌"
}
```

**响应：**
- 返回音频数据流（二进制）

**超时时间：** 6秒

**用途：** AI生成音乐并返回音频流

---

### 4. 单轮对话

**接口：** `POST /process_dialogue`

**请求：**
```json
{
    "content": "用户问题",
    "sentiment": "中性"
}
```

**响应（流式）：**
```
{"code": 200,"message": "成功","data": {"content": "回答片段1","status": "streaming"}}
{"code": 200,"message": "成功","data": {"content": "回答片段2","status": "streaming"}}
...
{"code": 200,"message": "成功","data": {"content": "回答片段N","status": "done!"}}
```

**超时时间：** 15秒

**用途：** 一次性问答对话

---

### 5. 多轮对话

**接口：** `POST /process_continue_dialogue`

**请求：**
```json
{
    "content": "用户问题",
    "sentiment": "中性"
}
```

**响应（流式）：**
```
{"code": 200,"message": "成功","data": {"content": "回答片段1","status": "streaming"}}
{"code": 200,"message": "成功","data": {"content": "回答片段2","status": "streaming"}}
...
{"code": 200,"message": "成功","data": {"content": "回答片段N","status": "done!"}}
```

**超时时间：** 15秒

**用途：** 连续对话，保持上下文

---

### 6. 心跳上报

**接口：** `POST /web_status`

**请求：**
```json
{
    "status": "online" | "offline",
    "reason": "原因描述"
}
```

**响应：**
```json
{
    "code": 200,
    "message": "成功",
    "data": {}
}
```

**用途：** 上报系统状态（当前未使用）

---

## 配置说明

### Live2D模型配置

**文件：** `js/live2d-cubism4.js`

```javascript
// 模型文件路径（相对于index.html）
const jinhuaModel = '/model/jinhua_3/jinhua0823.model3.json'

// 动作文件路径
const jinhua_Idle = '/model/jinhua_3/motions/IDLE.motion3.json'
const jinhua_Wave = '/model/jinhua_3/motions/wave.motion3.json'
// ... 其他动作文件
```

### 语音识别配置

**文件：** `js/iat-js/example/iat/index.js`

```javascript
const APPID = "your_appid"
const API_SECRET = "your_api_secret"
const API_KEY = "your_api_key"
```

**断句时间：** `control_lat_time = 1800` (毫秒)

### 语音合成配置

**文件：** `js/tts-lat/example/tts/index.js`

```javascript
const APPID = "your_appid"
const API_SECRET = "your_api_secret"
const API_KEY = "your_api_key"
```

**processor路径：** 确保 `processor.worker.js` 可访问

### 后端接口配置

**文件：** `js/jinhua/control-api.js` 和 `control-api-stream.js`

```javascript
// 生产环境
const base_url = 'https://avatar.chekkk.com/ai'

// 测试环境（可选）
// const base_url = 'http://localhost:3000'
```

### 模式超时配置

**文件：** `js/jinhua/control.js`

```javascript
// READY模式超时时间（60秒）
let control_delay_time_READY = 60000

// MULTI模式超时时间（60秒）
let control_delay_time_MULTI = 60000
```

### 系统加载时间

**文件：** `index.html`

```javascript
const systemLoadingTime = 3000  // 3秒
```

---

## 使用指南

### 快速开始

1. **克隆项目**
```bash
git clone https://github.com/fguby/live2D.git
cd live2D
```

2. **配置API密钥**
   - 编辑 `js/iat-js/example/iat/index.js`，填入讯飞IAT的APPID、API_SECRET、API_KEY
   - 编辑 `js/tts-lat/example/tts/index.js`，填入讯飞TTS的APPID、API_SECRET、API_KEY

3. **启动本地服务器**
```bash
# 使用http-server
npm install -g http-server
http-server .

# 或使用Python
python -m http.server 8000
```

4. **访问应用**
   - 打开浏览器访问 `http://localhost:8000/index.html`

### 操作流程

1. **系统启动**
   - 页面加载后，系统自动进入报站模式（BUS）
   - Live2D模型显示并执行招手动作

2. **唤醒系统**
   - 按 `Enter` 键唤醒系统
   - 系统进入唤醒模式（READY）
   - 开始语音识别

3. **语音交互**
   - **音乐模式：** 说"音乐"、"唱歌"、"播放"等关键词
   - **多轮对话：** 说"小可"、"聊天"、"模式"等关键词
   - **单轮对话：** 直接说问题（3个以上中文字）

4. **退出交互**
   - 说"坐下"、"退出"、"退下"等关键词
   - 或等待60秒自动退出

### 状态指示

系统通过GIF动画显示当前状态：

| 状态 | GIF文件 | 说明 |
|------|---------|------|
| listening | `listening.gif` | 正在听 |
| thinking | `thinking.gif` | 正在思考 |
| talking | `talking.gif` | 正在说话 |
| start-listening | `start-listening.gif` | 开始听 |
| finish-listening | `finish-listening.gif` | 听完 |
| finish-talking | `finish-talking.gif` | 说完 |

---

## 开发指南

### 项目结构

```
live2D/
├── index.html                 # 主页面
├── js/
│   ├── live2d-cubism4.js      # Live2D主控制
│   ├── LAppDefine.js          # Live2D配置（旧版）
│   ├── jinhua/                # 金华控制中心
│   │   ├── control.js         # 核心控制逻辑
│   │   ├── control-api.js     # 后端接口
│   │   ├── control-api-stream.js  # 流式接口
│   │   ├── control-station.js # 报站模块
│   │   ├── control-music.js   # 音乐模块
│   │   ├── control-singel-talk.js  # 单轮对话
│   │   ├── control-multi-talk.js   # 多轮对话
│   │   ├── control-page.js    # 页面状态控制
│   │   └── bus-stop-audio/    # 站点音频文件
│   ├── iat-js/                # 讯飞语音识别SDK
│   │   └── example/iat/       # 识别示例
│   ├── tts-lat/               # 讯飞TTS SDK
│   │   └── example/tts/       # TTS示例
│   ├── utils/                 # 工具函数
│   │   ├── deounce.js        # 防抖、工具函数
│   │   ├── mathReplace.js    # 数学公式处理
│   │   └── typeWriter.js     # 打字机效果
│   └── cdn/                   # CDN资源
├── model/                     # Live2D模型文件
│   └── jinhua_3/             # 金华模型
│       ├── jinhua0823.model3.json
│       └── motions/          # 动作文件
├── css/                       # 样式文件
└── README.md                  # 项目说明
```

### 添加新功能模块

1. **创建模块文件**
```javascript
// js/jinhua/control-new-feature.js
import { onNewFeatureEnd } from './control.js'

export function newFeatureModuleStart(params) {
    // 功能实现
}

export function onNewFeatureEnd() {
    // 功能完成回调
    onNewFeatureEnd()
}
```

2. **在control.js中集成**
```javascript
// 导入模块
import { newFeatureModuleStart } from './control-new-feature.js'

// 在onModeChange中添加
function onModeChange(control_mode) {
    if(control_mode == 'NEW_FEATURE') {
        newFeatureModuleStart(params)
    }
    // ...
}
```

3. **添加模式映射**
```javascript
let control_modeMap = {
    // ...
    NEW_FEATURE: '新功能模式',
}
```

### 添加新的Live2D动作

1. **准备动作文件**
   - 将 `.motion3.json` 文件放入 `model/jinhua_3/motions/`

2. **在live2d-cubism4.js中配置**
```javascript
const jinhua_NewAction = '/model/jinhua_3/motions/newaction.motion3.json'
```

3. **添加动作触发函数**
```javascript
// 在motionMatchFace函数中添加
else if(motion_name == 'NewAction') {
    triggerExpression('对应表情')
}
```

4. **设置动作持续时间**
```javascript
const motion_duration = {
    // ...
    NewAction: 5000 + 40,  // 持续时间（毫秒）
}
```

### 调试技巧

1. **开启调试日志**
   - 在浏览器控制台查看日志
   - 关键函数都有 `console.log` 输出

2. **检查WebSocket连接**
```javascript
// 在控制台执行
console.log(control_lat_ws?.readyState)
// 0: CONNECTING, 1: OPEN, 2: CLOSING, 3: CLOSED
```

3. **检查当前模式**
```javascript
// 在控制台执行
console.log(control_mode)
```

4. **手动触发动作**
```javascript
// 在控制台执行
triggerMotion('Wave')
triggerExpression('gaoxing')
```

---

## 常见问题

### Q1: 语音识别无法连接

**可能原因：**
- API密钥配置错误
- 网络连接问题
- WebSocket服务器不可达

**解决方法：**
1. 检查 `js/iat-js/example/iat/index.js` 中的API配置
2. 检查浏览器控制台的错误信息
3. 确认网络连接正常

### Q2: Live2D模型不显示

**可能原因：**
- 模型文件路径错误
- 模型文件格式不支持
- PIXI.js加载失败

**解决方法：**
1. 检查 `js/live2d-cubism4.js` 中的模型路径
2. 确认模型文件是 `.model3.json` 格式（Cubism 4.0）
3. 检查浏览器控制台的加载错误

### Q3: 语音合成没有声音

**可能原因：**
- TTS API密钥错误
- processor.worker.js路径错误
- 浏览器音频权限被阻止

**解决方法：**
1. 检查TTS API配置
2. 确认 `processor.worker.js` 可以正常访问
3. 检查浏览器音频权限设置

### Q4: 模式切换不生效

**可能原因：**
- 关键词识别错误
- 防抖时间设置过长
- 模式判断逻辑问题

**解决方法：**
1. 检查语音识别结果是否正确
2. 调整 `control_lat_time` 防抖时间
3. 检查 `jugeMode()` 函数逻辑

### Q5: 流式接口超时

**可能原因：**
- 网络延迟过大
- 后端处理时间过长
- 超时时间设置过短

**解决方法：**
1. 增加 `timeout` 超时时间（默认15秒）
2. 检查网络连接质量
3. 优化后端处理逻辑

### Q6: 站点播报音频无法播放

**可能原因：**
- 音频文件路径错误
- 音频文件格式不支持
- 音频文件不存在

**解决方法：**
1. 检查 `js/jinhua/bus-stop-audio/` 目录下的音频文件
2. 确认音频文件格式为 `.mp3`
3. 检查后端返回的站点名称是否匹配音频文件名

---

## 更新日志

### 2024-XX-XX
- 初始版本发布
- 支持5种工作模式
- 集成讯飞语音识别和TTS
- 支持Live2D模型展示和交互

---

## 贡献指南

欢迎提交Issue和Pull Request！

### 提交Issue
- 描述清晰的问题
- 提供复现步骤
- 附上相关日志

### 提交PR
- 遵循现有代码风格
- 添加必要的注释
- 更新相关文档

---

## 许可证

本项目基于原项目 [fguby/live2D](https://github.com/fguby/live2D) 开发。

---

## 联系方式

如有问题或建议，请通过以下方式联系：
- GitHub Issues: [项目地址]
- Email: [联系邮箱]

---

**文档版本：** 1.0.0  
**最后更新：** 2024-XX-XX
