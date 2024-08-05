import { control_request } from './control-api.js'
import { loadPlayer } from './control-music.js'
import { lat_connectWebSocket } from '../iat-js/example/iat/index.js'
import { debounce, hasNChinese,formatNowTime,removeTrailingPeriod } from '../utils/deounce.js'
import { tts_connectWebSocket } from '../tts-lat/example/tts/index.js'
//金华  模式控制中心

let control_modeMap = {
    BUS:'报站模式',
    READY:'唤醒模式',
    MUSIC:'音乐模式',
    SINGAL:'单轮模式',
    MUTIL:'多轮模式',
}
let control_mode = 0 ;
let control_modeText = document.getElementById('mode_text')
document.addEventListener('keydown', wakeupDetect);

//一开始为报站模式
enterMode('BUS')

//唤醒检测
function wakeupDetect(event){
    if(event.key === 'Enter' ){
        enterMode('READY')
        //开启识别
        lat_connectWebSocket()
    }
}

function enterMode(cur_mode_num){
    control_mode = cur_mode_num
    control_modeText = document.getElementById("mode_text");
    control_modeText.innerText = `${control_modeMap[cur_mode_num]}`;
    
    onModeChange(control_mode)
}


let control_delay_time = 60000 //保持lat连接的最大时间
let control_delay_timer = null //保持连接的定时器
let control_lat_ws
let control_lat_result = ''

//lat识别结果生成 回调
export function latResultOnChange({latResult,latStatus,latWS}){
    let text = latResult
    let status = latStatus
    let lat_ws_state = latWS.readyState
    control_lat_ws = latWS

    let remote_trail_text = removeTrailingPeriod(text)
    if(remote_trail_text !== control_lat_result){
        control_lat_result = latResult
        jugeMode(text)
        console.log(formatNowTime(new Date()),'接收到lat语音识别结果为',text)
    }
    // console.log('接收lat状态',status)
    // console.log('接收latWs',latWS)
}


//判断进入 what 模式
function jugeMode(tts_res) {
    control_lat_result = tts_res
    const keywordToMode = {
        '退出': 'BUS',//静默
        '退下': 'BUS',//静默
        '音乐': 'MUSIC',//音乐
        '我聊聊天吧': 'MUTIL',//多轮
        '跟我聊聊天吧': 'MUTIL',//多轮
        '和我聊聊天吧': 'MUTIL',//多轮
    };
    let incluesKeyWord = false
    // 遍历映射对象，检查输入中是否包含关键词
    for (const keyword in keywordToMode) {
        if (tts_res.includes(keyword)) {
            incluesKeyWord = false
            // enterMode(keywordToMode[keyword]);
            return; // 找到匹配的关键词后立即返回，避免继续检查
        }
    }
    if(!incluesKeyWord){
        if(hasNChinese(tts_res,3)){ //单轮
            // 调用防抖函数
            debouncedEnterMode('SINGAL');     
        }
    }
}

const debouncedEnterMode = debounce((model) => {
    enterMode(model)
},2000);

//lat断开语音识别的 回调
export function latWsOnClosed(){
    keepLatConnectOrExit()
}

function keepLatConnectOrExit(){
    if(control_mode === 'READY'){ //唤醒模式
        //继续开启识别
        lat_connectWebSocket()
    }
    
    // }
    if(!control_delay_timer){
        control_delay_timer = setTimeout(()=>{
            control_lat_ws.close()
            clearTimeout(control_delay_timer)
            control_delay_timer = null

            enterMode('BUS')
        },control_delay_time)
    }
}

export function onMusicEnd(){
    console.log('onMusicEnd','音乐播放结束')
    //回到报站模式
    enterMode('BUS')
}

export function onSingleDialogEnd(){

}

function onModeChange(control_mode){
    if(control_mode === 'BUS'){
        // control_request.receiveGps()
    }else if(control_mode === 'SINGAL'){
        control_request.getDialogue(control_lat_result).then((data)=>{
            const { text } = data
            tts_connectWebSocket(text)
        })
    }
    // control_request
}
        

