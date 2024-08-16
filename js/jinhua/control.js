import { control_request } from './control-api.js'
import './control-music.js'
import './control-station.js'
// import './control-heart.js' //暂时不用
import { page_changeState } from './control-page.js'
import { lat_connectWebSocket } from '../iat-js/example/iat/index.js'
import { debounce, hasNChinese,formatNowTime,removeTrailingPeriod } from '../utils/deounce.js'
import { control_tts_show, control_answer_show } from './control-page.js'

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
        showEleMessage('正在唤醒','success',1500)
        enterMode('READY')
        //开启识别
        latConnectWebSocket()
    }
}


let control_lat_ws  // latws 连接
let control_lat_result = '' //lat 识别结果
let control_lat_recorder  // lat 录音起
const control_lat_time = 1800 // lat 断整句时间

export function latOnload({latWS,lat_recorder}){
    control_lat_ws = latWS
    control_lat_recorder = lat_recorder
}
//lat识别结果生成 回调
export function latResultOnChange({latResult,latStatus,latWS,lat_recorder}){
    let text = latResult
    let status = latStatus
    // let lat_ws_state = latWS.readyState
    // control_lat_ws = latWS
    // control_lat_recorder = lat_recorder

    let remote_trail_text = removeTrailingPeriod(text)
    if(remote_trail_text !== control_lat_result){
        control_lat_result = latResult
        // console.log(formatNowTime(new Date()),'接收到lat语音识别结果为',control_lat_result)
        //指令有可能少于3个字
        debouncedjugeModeMode()
        control_tts_show(latResult)
        control_answer_show('')
    }
    // console.log('接收lat状态',status)
    // console.log('接收latWs',latWS)
}

//断句判断处理
const debouncedjugeModeMode = debounce(() => {
    jugeMode()
},control_lat_time);


//判断进入 what 模式 control 核心
function jugeMode() {
    let tts_res = control_lat_result
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
            if(keywordToMode[keyword] == 'BUS'){
                incluesKeyWord = true
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
                        //符合条件的指令
                        incluesKeyWord = true
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
        if(hasNChinese(tts_res,1)){ //有效文字 
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

//统一放到debouncedjugeModeMode中处理了
const debouncedEnterMode = debounce((model) => {
    enterMode(model)
},0);

const debouncedToMultiMoudle = debounce(() => {
    toMultiMoudle(model)
},0);
    
//主动关闭语音识别 集成清除定时器功能
function latClose(){
    control_lat_ws.close()
    control_lat_recorder.stop() //停止录音

    //清除 唤醒计时器时会重新计时
    if(control_delay_timer_READY){
        clearTimeout(control_delay_timer_READY)
        control_delay_timer_READY = null
    }
    //清空当前多轮的计时器 连接时会重新计时
    if(control_delay_timer_MULTI){
        clearTimeout(control_delay_timer_MULTI)
        control_delay_timer_MULTI = null
    }
}


//lat断开语音识别的 回调
export function latWsOnClosed(){
    latConnectWebSocket()
}

//lat连接成功 回调
export function latWsOnOpened(){
    page_changeState('listening')
}

//lat连接错误 回调
export function latWsOnError(){
    page_changeState('')
    enterMode('BUS')
    showEleMessage('lat 连接断开','error')
}


let control_delay_time_READY = 60000 //READY模式 保持lat连接的最大时间
let control_delay_timer_READY = null //READY模式 保持连接的定时器
let control_singel_answing = false //正在等待询问单轮的答案


let control_delay_time_MULTI = 60000 //MULTI模式 保持lat连接的最大时间
let control_delay_timer_MULTI = null //MULTI模式 保持连接的定时器
let control_multi_answing = false //正在等待询问多轮的答案



function latConnectWebSocket(){

    if(control_mode === 'READY'){ //唤醒模式
        //继续开启识别
        lat_connectWebSocket()

        // 60s 后 退出唤醒模式 到 静默状态   
        if(!control_delay_timer_READY){
            control_delay_timer_READY = setTimeout(()=>{

                latClose()

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

                enterMode('BUS')

            },control_delay_time_MULTI)
        }
    }

    // SINGEL/BUS/MUSIC模式下 
    // 不需要定时器功能
    if(control_mode == 'SINGEL' || control_mode == 'BUS' || control_mode == 'MUSIC'){
        checkClearTimer()
    }

}

function checkClearTimer(){
    // SINGEL/BUS/MUSIC模式下 
    // 不需要定时器功能
    if(control_mode == 'SINGEL' || control_mode == 'BUS' || control_mode == 'MUSIC'){
        if(control_delay_timer_READY){
            clearTimeout(control_delay_timer_READY)
            control_delay_timer_READY = null
        }
        if(control_delay_timer_MULTI){
            clearTimeout(control_delay_timer_MULTI)
            control_delay_timer_MULTI = null
        }
    }
}


import { singelModuleStart } from './control-singel-talk.js'
import { multiModuleStart } from './control-multi-talk.js'
import { musicModuleStart } from './control-music.js'
import { stationModuleStart } from './control-station.js'


function enterMode(mode){
    control_mode = mode
    control_modeText = document.getElementById("mode_text");
    control_modeText.innerText = `${control_modeMap[mode]}`;

    if(mode === 'BUS'){
        page_changeState('')
    }else if( mode === 'MUSIC' || mode === 'MULTI' || mode === 'SINGEL'){
        page_changeState('thinking')
    }

    onModeChange(control_mode)
}

function onModeChange(control_mode){

    if(control_mode == 'BUS'){
        stationModuleStart()
        //清空对话框
        control_tts_show('')
        control_answer_show('')

    }else if(control_mode == 'SINGEL'){
        //关掉lat
        latClose()
        singelModuleStart(control_lat_result)

    }else if(control_mode == 'MULTI'){

        toMultiMoudle()
        
    }else if(control_mode == 'MUSIC'){
        //关掉lat
        latClose()

        musicModuleStart(control_lat_result)
        
    }

}

function toMultiMoudle(){

    control_multi_answing = true
    //关掉lat
    latClose()
    page_changeState('thinking')

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

        control_tts_show('')

        //回答结束
        control_multi_answing = false 
        //lat被主动关闭 lat主动开启
        latConnectWebSocket() //继续下一轮多轮
    }
}
        

