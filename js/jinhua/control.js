import { control_request } from './control-api.js'
import { loadPlayer } from './control-music.js'
import { lat_connectWebSocket } from '../iat-js/example/iat/index.js'
import { debounce, hasNChinese,formatNowTime,removeTrailingPeriod } from '../utils/deounce.js'
//金华  模式控制中心

let control_modeMap = {
    BUS:'报站模式',
    READY:'唤醒模式',
    MUSIC:'音乐模式',
    SINGEL:'单轮模式',
    MULTI:'多轮模式',
}
export let control_mode = "BUS" ;
let control_modeText = document.getElementById('mode_text')
document.addEventListener('keydown', wakeupDetect);

//一开始为报站模式
enterMode('BUS')

//唤醒检测
function wakeupDetect(event){
    if(event.key === 'Enter' && control_mode == 'BUS'){
        enterMode('READY')
        //开启识别
        lat_connectWebSocket()
    }
}




let control_lat_ws
let control_lat_result = ''
let control_lat_recorder 

//lat识别结果生成 回调
export function latResultOnChange({latResult,latStatus,latWS,lat_recorder}){
    let text = latResult
    let status = latStatus
    let lat_ws_state = latWS.readyState
    control_lat_ws = latWS
    control_lat_recorder = lat_recorder

    let remote_trail_text = removeTrailingPeriod(text)
    if(remote_trail_text !== control_lat_result){

        control_lat_result = latResult
        console.log(formatNowTime(new Date()),'接收到lat语音识别结果为',control_lat_result)
        jugeMode(text)
    }
    // console.log('接收lat状态',status)
    // console.log('接收latWs',latWS)
}


//判断进入 what 模式 control 核心
function jugeMode(tts_res) {
    const keywordToMode = {
        '退出': 'BUS',//报站
        '退下': 'BUS',//报站
        '结束': 'BUS',//报站
        '音乐': 'MUSIC',//音乐
        '唱歌': 'MUSIC',//音乐
        '播放':'MUSIC',//音乐
        '唱首歌': 'MUSIC',//音乐
        '的歌': 'MUSIC',//音乐
        '小可': 'MULTI',//多轮
        '小客': 'MULTI',//多轮
        '肖克': 'MULTI',//多轮
        '即刻': 'MULTI',//多轮
        '极客': 'MULTI',//多轮
        '模式': 'MULTI',//多轮
        '聊天': 'MULTI',//多轮
    };
    let incluesKeyWord = false
    
    //优先级高
    // 遍历映射对象，检查输入中是否包含关键词
    //只有唤醒模式能够进入 切换到其他模式
    if(control_mode == 'READY'){
        for (const keyword in keywordToMode) {
            if (tts_res.includes(keyword)) {
                incluesKeyWord = true
                if(keywordToMode[keyword] == 'BUS'){
                    //直接退出
                    enterMode(model)
                }
                else{
                    //防抖处理 音乐/多轮
                    debouncedEnterMode(keywordToMode[keyword]);
                }
                return; // 找到匹配的关键词后立即返回，避免继续检查
            }
        }
    }

    //优先级二 再次进入多轮问题
    if(!incluesKeyWord && control_mode == 'MULTI'  ){ //多轮
        
        if(hasNChinese(tts_res,3)){ //有效文字
            multiQustionChange()
        }
        return
    }

    //优先级二 
    if(!incluesKeyWord && control_mode == 'READY'){
        if(hasNChinese(tts_res,3)){ //单轮
            // 防抖处理 单轮
            debouncedEnterMode('SINGEL');     
        }
        return
    }
}

function multiQustionChange(){
    //清空当前的计时器 下面会重新计时
    clearTimeout(control_delay_timer_MULTI)
    control_delay_timer_MULTI = null
    debouncedToMultiMoudle()
}

const debouncedEnterMode = debounce((model) => {
    enterMode(model)
},2000);

const debouncedToMultiMoudle = debounce(() => {
    toMultiMoudle(model)
},2000);
    
//主动关闭语音识别 
function latClose(){
    control_lat_ws.close()
    control_lat_recorder.stop() //录音
}
//lat断开语音识别的 回调
export function latWsOnClosed(){
    keepLatConnectOrExit()
}

let control_delay_time_READY = 60000 //READY模式 保持lat连接的最大时间
let control_delay_timer_READY = null //READY模式 保持连接的定时器
let control_singel_answing = false //正在等待询问单轮的答案


let control_delay_time_MULTI = 60000 //MULTI模式 保持lat连接的最大时间
let control_delay_timer_MULTI = null //MULTI模式 保持连接的定时器

let control_multi_answing = false //正在等待询问多轮的答案



function keepLatConnectOrExit(){
    if(control_mode === 'READY'){ //唤醒模式
        //继续开启识别
        lat_connectWebSocket()

        // 60s 后 退出唤醒模式 到 静默状态   
        if(!control_delay_timer_READY){
            control_delay_timer_READY = setTimeout(()=>{
                latClose()
                clearTimeout(control_delay_timer_READY)
                control_delay_timer_READY = null

                enterMode('BUS')
            },control_delay_time_READY)
        }
    }
    if(control_mode === 'MULTI' && control_multi_answing == false){
        //继续开启识别
        lat_connectWebSocket()
        // 60s 后 退出多轮模式 到 静默状态   
        if(!control_delay_timer_MULTI){
            control_delay_timer_MULTI = setTimeout(()=>{
                latClose()
                clearTimeout(control_delay_timer_MULTI)
                control_delay_timer_MULTI = null

                enterMode('BUS')
            },control_delay_time_MULTI)
        }
    }
}


import { singelModuleStart } from './control-singel-talk.js'
import { multiModuleStart } from './control-multi-talk.js'
import { musicModuleStart } from './control-music.js'


function enterMode(mode){
    control_mode = mode
    control_modeText = document.getElementById("mode_text");
    control_modeText.innerText = `${control_modeMap[mode]}`;
    onModeChange(control_mode)
}

function onModeChange(control_mode){
    if(control_mode == 'BUS'){

    }else if(control_mode == 'SINGEL'){
        //关掉lat
        latClose()

        singelModuleStart(control_lat_result)
    }else if(control_mode == 'MULTI'){

        toMultiMoudle()
        
    }else if(control_mode == 'MUSIC'){
        musicModuleStart(control_lat_result)
    }
}

function toMultiMoudle(){

    control_multi_answing = true
    //关掉lat
    latClose()

    //进入多轮对话中
    multiModuleStart(control_lat_result)
}

//模块处理完成触发的回调函数

//音乐播放完成回调
export function onMusicModuleEnd(){
    console.log('onMusicEnd','音乐播放结束')
    //回到报站模式
    enterMode('BUS')
}
//单轮对话完成回调
export function onSingleModuleEnd(){
    //回到报站模式
    if(control_mode === 'SINGEL'){//保险起见
        enterMode('BUS')
    }
}
//多轮对话完成回调
export function onMultiModuleEnd(){
    //回到报站模式
    if(control_mode === 'MULTI'){//保险起见
        //回答结束
        control_multi_answing = false 
        //lat被主动关闭 lat主动开启
        keepLatConnectOrExit() //继续下一轮多轮
    }
}
        

