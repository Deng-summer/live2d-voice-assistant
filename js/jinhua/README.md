
# 文档

# 金华控制中心

1. control.js 控制中心
2. control-api 后端接口
3. control-music 音乐处理模块
4. control-station 站点播报模块
5. control-singel-talk 单轮对话模块
6. control-multi-talk 多轮对话模块
7. control-station 报站模块


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

## 后端接口
### control.js 核心控制模块 集中处理控制状态的流转 识别tts结果判断 调用开启各个模块间的开启

​```
function jugeMode() {
    let tts_res = control_lat_result
    //指令
    const keywordToMode = {
        '坐下': 'BUS',
        '退出': 'BUS',
        '退下': 'BUS',
        '结束': 'BUS',
        '音乐': 'MUSIC',
        '唱歌': 'MUSIC',
        '播放':'MUSIC',
        '唱首歌': 'MUSIC',
        '的歌': 'MUSIC',
        '小可': 'MULTI',
        '小客': 'MULTI',
        '肖克': 'MULTI',
        '即刻': 'MULTI',
        '极客': 'MULTI',
        '模式': 'MULTI',
        '聊天': 'MULTI',
    };
    let incluesKeyWord = false
    
    //优先级高
    // 遍历映射对象，检查输入中是否包含关键词
    for (const keyword in keywordToMode) {
        if (tts_res.includes(keyword)) {
            incluesKeyWord = true
            if(keywordToMode[keyword] == 'BUS'){
                //直接退出
                debouncedEnterMode(keywordToMode[keyword]);
                latClose()
                // enterMode(keywordToMode[keyword])
                showEleMessage('小可已退下','success')
                console.log('指令匹配退出')
                return; //退出当前函数
            }
            else{
                //只能从唤醒模式进入 多轮 或者 音乐
                if(keywordToMode[keyword] == 'MULTI' || keywordToMode[keyword] == 'MUSIC'){
                    if(control_mode == 'READY'){
                        //防抖处理 音乐/多轮
                        debouncedEnterMode(keywordToMode[keyword]);
                        console.log('指令匹配进入功能模式')
                        return; //退出当前函数
                    }
                }
            }
        }
    }

    //优先级二 再次进入多轮问题
    if(!incluesKeyWord && control_mode == 'MULTI'  ){ //多轮
        if(hasNChinese(tts_res,3)){ //有效文字 
            debouncedToMultiMoudle()
            console.log('多轮提问')
        }
        return
    }

    //优先级二 
    if(!incluesKeyWord && control_mode == 'READY'){
        if(hasNChinese(tts_res,3)){ //单轮
            // 防抖处理 单轮
            debouncedEnterMode('SINGEL');  
            console.log('单轮提问')
        }
        return
    }
}
​```