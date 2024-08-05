
# 文档

# 金华控制中心

1. control.js 控制中心
2. control-api 后端接口
3. control-music 音乐处理模块
4. control-station 站点播报模块
5. control-singel-talk 单轮对话模块
5. control-multi-talk 多轮对话模块


# 讯飞语音识别模块 lat-js
# 讯飞语音合成模块 tts-lat
# 火山语音合成模块 tts-byte (需要起nodejs服务调用火山接口 并传输过来 暂时先用讯飞)

## latWS 状态标志位

    1. CONNECTING (0): 连接尚未建立，WebSocket 实例正在尝试连接到服务器。
    2. OPEN (1): WebSocket 连接已经建立并且可以通信。
    3. CLOSING (2): WebSocket 连接正在关闭。
    4. CLOSED (3): WebSocket 连接已经关闭或无法打开。


## 处理语音结果 

​```
control_modeMap = {
    BUS:'报站模式',
    READY:'唤醒模式',
    MUSIC:'音乐模式',
    SINGEL:'单轮模式',
    MULTI:'多轮模式',
}

​```

## 