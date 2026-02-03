# CLAUDE.md

本文件为 Claude Code (claude.ai/code) 在此代码库中工作时提供指导。

## 项目概述

这是一个集成了语音识别、语音合成和 AI 对话功能的 Live2D 交互角色系统。项目整合了 Live2D 模型（支持 SDK 2.x 和 Cubism 4.x）与讯飞语音服务，创建了一个名为"金华"的交互式虚拟助手。

## 开发命令

### 运行应用

这是一个静态 Web 应用，本地运行方式：

```bash
# 全局安装 http-server（如果尚未安装）
npm install -g http-server

# 从项目根目录启动服务器
http-server .

# 访问主应用：
# http://127.0.0.1:8080/index.html
```

### 测试语音识别（IAT）

```bash
# 访问 IAT 示例页面
# http://127.0.0.1:8080/js/iat-js/example/iat/index.html

# 测试前需要更新凭证信息：
# js/iat-js/example/iat/index.js
# 设置 APPID、API_SECRET 和 API_KEY
```

### 测试语音合成（TTS）

```bash
# 访问 TTS 示例页面
# http://127.0.0.1:8080/js/tts-lat/example/tts/index.html

# 测试前需要更新凭证信息：
# js/tts-lat/example/tts/index.js
# 设置 APPID、API_SECRET 和 API_KEY
```

## 架构设计

### 核心系统组件

应用使用由 `js/jinhua/control.js` 管理的**模式化控制系统**：

- **BUS 模式**（报站模式）：默认的站点播报模式
- **READY 模式**（唤醒模式）：按 Enter 键激活，启用语音识别
- **MUSIC 模式**（音乐模式）：音乐播放模式
- **SINGEL 模式**（单轮模式）：单轮对话
- **MULTI 模式**（多轮模式）：带上下文的多轮对话

模式切换由以下方式触发：
1. 键盘事件（Enter 键唤醒）
2. 语音识别检测到的语音指令
3. 对语音输入结果的防抖处理

### Live2D 集成

项目支持**两个 Live2D SDK 版本**：

1. **Live2D SDK 2.x**（`js/live2d.min.js`）：`model/` 目录中的旧版模型
   - 通过 `js/LAppDefine.js` 配置
   - 在 `MODELS` 数组中定义模型
   - 支持材质切换、动作组和音频播放

2. **Live2D Cubism 4.x**（`js/live2d-cubism4.js`）：现代模型（`.model3.json`）
   - 使用 PIXI.js 进行渲染
   - 主要模型：`model/jinhua_3/jinhua0823.model3.json`
   - 动作系统：`triggerMotion()` 用于动作（Wave、Talk、Nod、Song、Think、Idle）
   - 表情系统：`triggerExpression()` 用于面部表情

### 语音服务架构

**语音识别（IAT）**：`js/iat-js/`
- 基于 WebSocket 连接到讯飞 IAT 服务
- `RecorderManager` 处理浏览器音频录制
- 基于帧的音频处理，支持可配置采样率
- 结果流：`latResultOnChange()` → `control.js` → 模式决策

**语音合成（TTS）**：`js/tts-lat/`
- 基于 WebSocket 连接到讯飞 TTS 服务
- `AudioPlayer` 通过 Web Audio API 管理音频播放
- 支持 base64/ArrayBuffer 格式的流式音频
- 支持连续播放的自动恢复功能

### 控制模块结构

位于 `js/jinhua/`：

- `control.js`：中央状态机、模式转换、语音指令解析
- `control-api.js` / `control-api-stream.js`：后端 API 通信
- `control-music.js`：音乐播放处理
- `control-station.js`：站点播报系统
- `control-singel-talk.js`：单轮对话逻辑
- `control-multi-talk.js`：带上下文的多轮对话
- `control-page.js`：UI 状态管理和元素更新

### 关键集成点

**语音识别 → 控制流程**：
```
用户说话 → IAT WebSocket → latResultOnChange() →
control.js:jugeMode() → 模式转换 → 模块激活
```

**模式决策逻辑**（`control.js:jugeMode()`）：
1. 检查退出指令（坐下、退出、退下、结束）→ BUS 模式
2. 检查模式进入关键词（音乐、唱歌、小可、聊天）→ MUSIC/MULTI 模式
3. 如果在 MULTI 模式且有有效文本 → 继续多轮对话
4. 如果在 READY 模式且有有效文本 → 进入 SINGEL 模式

**Live2D 动画触发**：
- 根据对话状态触发表情和动作
- `triggerExpression()` 改变面部表情
- `triggerMotion()` / `triggerRepeatMotion()` 播放角色动画
- 与 TTS 播放同步以实现口型同步效果

## 文件结构

```
/
├── index.html              # 主应用入口
├── js/
│   ├── LAppDefine.js       # Live2D SDK 2.x 配置
│   ├── live2d-cubism4.js   # Live2D Cubism 4.x 集成
│   ├── iat-js/             # 讯飞语音识别模块
│   ├── tts-lat/            # 讯飞语音合成模块
│   ├── jinhua/             # 控制系统模块
│   │   ├── control.js      # 中央模式控制器
│   │   ├── control-api*.js # API 通信
│   │   ├── control-*.js    # 功能特定控制器
│   ├── utils/              # 工具函数（防抖、打字机效果等）
│   ├── cdn/                # 第三方库（PIXI.js、MathJax 等）
│   └── websocket.js        # WebSocket 消息处理
├── model/                  # Live2D 模型文件
│   ├── jinhua_3/           # 主要 Cubism 4.x 模型
│   ├── haru/, xiaomai/     # SDK 2.x 模型
│   └── ...                 # 其他角色模型
├── css/                    # 样式表
└── ai/                     # 附加模型资源
```

## 配置说明

### Live2D 模型配置

**SDK 2.x**（`js/LAppDefine.js`）：
- `CANVAS_ID`：Canvas 元素 ID
- `MODELS`：模型路径数组（支持双模型）
- `SCALE`：初始模型大小
- `IS_PLAY_AUDIO`：启用/禁用音频播放
- `MOTION_GROUP_*`：与 model.json 匹配的动作组名称

**Cubism 4.x**（`js/live2d-cubism4.js`）：
- 修改 `useModelJson` 常量以切换模型
- 动作路径在文件顶部定义
- 表情映射在 `triggerExpression()` 中

### 语音服务凭证

在以下位置更新 API 凭证：
- `js/iat-js/example/iat/index.js`（语音识别）
- `js/tts-lat/example/tts/index.js`（语音合成）

需要从讯飞控制台获取：`APPID`、`API_SECRET`、`API_KEY`

## 重要注意事项

### 模型加载
- Live2D 模型使用相对于 HTML 文件位置的相对路径
- Cubism 4.x 模型需要 `.model3.json` 格式
- SDK 2.x 模型使用 `.model.json` 格式
- 确保模型资源（材质、动作、表情）在正确目录中

### WebSocket 连接
- IAT 和 TTS 使用独立的 WebSocket 连接
- 连接状态通过 `readyState` 跟踪（0=连接中、1=已打开、2=关闭中、3=已关闭）
- 切换模式时需使用 `latClose()` 进行适当清理

### 音频播放
- 浏览器音频需要用户交互（点击/按键）后才能播放
- 音频元素 ID 必须与 `LAppDefine.AUDIO_ID` 匹配
- TTS 音频使用 Web Audio API 进行低延迟流式传输

### 模式转换
- 使用防抖函数防止快速模式切换
- `control_lat_time`（1800ms）定义断句检测时间
- 退出 READY/SINGEL/MULTI 模式时务必关闭 IAT 连接

### 表情和动作时序
- 应在触发动作前设置表情
- 使用 `triggerRepeatMotion()` 进行循环动画（如说话）
- 对话结束后重置为空闲状态

## 浏览器要求

- 支持 WebSocket 的现代浏览器
- 麦克风访问权限（localhost、127.0.0.1 或 HTTPS）
- 支持 Web Audio API 以进行 TTS 播放
- 支持 WebGL 以进行 Live2D Cubism 4.x 渲染
