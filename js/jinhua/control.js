import { control_request } from './control-api.js'
import { loadPlayer } from './control-music.js'
import { lat_connectWebSocket } from '../iat-js/example/iat/index.js'
//金华  模式控制中心

let control_modeMap = {
    0:'报站模式',
    1:'唤醒模式',
    2:'音乐模式',
    3:'对话模式',
}
let control_mode = 0 ;
let control_modeText = document.getElementById('mode_text')
document.addEventListener('keydown', wakeupDetect);

//一开始为报站模式
enterMode(0)

//唤醒检测
function wakeupDetect(event){
    if(event.key === 'Enter' ){
        enterMode(1)
        //开启识别
        lat_connectWebSocket()
    }
}

function enterMode(cur_mode_num){
    control_mode = cur_mode_num
    control_modeText = document.getElementById("mode_text");
    control_modeText.innerText = `${control_modeMap[cur_mode_num]}`;
}
// latWS
    // CONNECTING (0): 连接尚未建立，WebSocket 实例正在尝试连接到服务器。
    // OPEN (1): WebSocket 连接已经建立并且可以通信。
    // CLOSING (2): WebSocket 连接正在关闭。
    // CLOSED (3): WebSocket 连接已经关闭或无法打开。
    // 处理语音结果 控制中心

let control_delay_time = 60000 //保持lat连接的最大时间
let control_delay_timer = null //保持连接的定时器
let control_lat_ws


export function sendTextControl({latResult,latStatus,latWS}){
    let text = latResult
    let status = latStatus
    let lat_ws_state = latWS.readyState
    control_lat_ws = latWS
    if(latResult.indexOf('进入对话') !== -1  ){
        enterMode(3)
    }else if(latResult.indexOf('退出对话') !== -1  ){
        enterMode(0)
    }else if(latResult.indexOf('播发音乐') !== -1 ){
        enterMode(2)
    }

    console.log('接收到lat语音识别结果为',text)
    console.log('接收lat状态',status)
    console.log('接收latWs',latWS)
}


export function latWsOnClosed(){
    keepLatConnect()
}

function keepLatConnect(){

    if(control_mode === 1){ //唤醒模式
        //继续开启识别
        lat_connectWebSocket()
    }
    
    // }
    if(!control_delay_timer){
        control_delay_timer = setTimeout(()=>{
            control_lat_ws.close()
            clearTimeout(control_delay_timer)
            control_delay_timer = null

            enterMode(0)
        },control_delay_time)
    }
}

export function onMusicEnd(){
    console.log('onMusicEnd','音乐播放结束')
    //回到报站模式
    enterMode(0)
}

