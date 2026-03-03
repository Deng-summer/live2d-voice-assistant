import { control_request } from './control-api.js'
import './control-music.js'
import './control-station.js'
import { interruptStationPlay } from './control-station.js'
// import './control-heart.js' //暂时不用
import { page_changeState } from './control-page.js'
import { lat_connectWebSocket } from '../iat-js/example/iat/index.js'
import { debounce, hasNChinese,formatNowTime,removeTrailingPeriod } from '../utils/deounce.js'
import { control_tts_show, control_answer_show, page_toggleDialogVisibility } from './control-page.js'
import { triggerExpression, triggerRepeatMotion,triggerMotion} from '../live2d-cubism4.js'
// 导入豆包唤醒词模块
import { startWakeupDetection, stopWakeupDetection } from '../doubao-wakeup/doubao-wakeup.js'
// 导入状态提示系统
import {
    showStatusTip,
    showWakeupSuccess,
    showTempMessage,
    autoShowTipForMode
} from './control-tips.js'
// 导入配置
import { WAKEUP_CONFIG, getStatusMessage } from './control-config.js'
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

// 记录进入 MUSIC 模式前的模式（用于音乐播放完成后返回）
let previousModeBeforeMusic = null

// 豆包唤醒词检测状态
let doubaoWakeupActive = false

// 获取按钮元素和提示元素
let doubaoWakeupBtn = null
let wakeupHint = null

// 显示唤醒提示
function showWakeupHint() {
    // 根据配置决定是否显示
    if (!WAKEUP_CONFIG.SHOW_WAKEUP_HINT) {
        return
    }

    if (!wakeupHint) {
        wakeupHint = document.getElementById('wakeup-hint')
    }
    if (wakeupHint) {
        wakeupHint.classList.remove('hide')
        wakeupHint.classList.add('show')
    }
}

// 隐藏唤醒提示
function hideWakeupHint() {
    // 根据配置决定是否需要隐藏（如果本来就不显示，就不需要隐藏）
    if (!WAKEUP_CONFIG.SHOW_WAKEUP_HINT) {
        return
    }

    if (!wakeupHint) {
        wakeupHint = document.getElementById('wakeup-hint')
    }
    if (wakeupHint) {
        wakeupHint.classList.remove('show')
        wakeupHint.classList.add('hide')
        setTimeout(() => {
            wakeupHint.style.display = 'none'
        }, 500)
    }
}

// 更新状态文字
function updateStatusText() {
    const message = getStatusMessage(control_mode, doubaoWakeupActive)
    control_tts_show(message.question)
    control_answer_show(message.answer)
}

// 注释掉原来的按键唤醒
// document.addEventListener('keydown', wakeupDetect);

// 改为手动启动（像 test.html 一样）
// 添加按键监听：按 'D' 键启动/停止豆包唤醒词检测（根据配置决定是否启用）
if (WAKEUP_CONFIG.ENABLE_KEY_D_SHORTCUT) {
    document.addEventListener('keydown', (event) => {
        if (event.key === 'd' || event.key === 'D') {
            toggleDoubaoWakeup()
        }
    })
    console.log('✓ 按键 D 快捷键已启用')
}

// 添加全局 Enter 键监听：在 MUSIC 模式下打断音乐播放并进入连续对话
document.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        // 在 MUSIC 模式下，打断音乐播放并进入连续对话
        if (control_mode === 'MUSIC') {
            console.log('检测到 Enter 键，打断音乐播放')

            // 停止音乐播放
            stopMusicPlayback()

            // 清空语音识别结果，避免自动发起对话请求
            control_lat_result = ''

            // 直接进入连续对话模式
            enterMode('MULTI')

            showEleMessage('已切换到连续对话模式', 'success', 1500)
        }
        // 在 BUS 模式下，保留原来的唤醒逻辑
        else if (control_mode === 'BUS') {
            wakeupDetect(event)
        }
    }
})

// 切换豆包唤醒词检测状态
function toggleDoubaoWakeup() {
    if (!doubaoWakeupActive) {
        console.log('启动豆包唤醒词检测')
        startDoubaoWakeup()
    } else {
        console.log('停止豆包唤醒词检测')
        stopDoubaoWakeup()
    }
}

// 更新按钮状态
function updateWakeupButton() {
    if (!doubaoWakeupBtn) {
        doubaoWakeupBtn = document.getElementById('doubao-wakeup-btn')
    }

    if (doubaoWakeupBtn) {
        if (doubaoWakeupActive) {
            doubaoWakeupBtn.textContent = '⏸️ 停止唤醒词检测'
            doubaoWakeupBtn.style.background = '#f44336'
        } else {
            doubaoWakeupBtn.textContent = '🎤 启动唤醒词检测'
            doubaoWakeupBtn.style.background = '#4CAF50'
        }
    }
}

setTimeout(()=>{
    //系统加载时间3000
    //一开始为报站模式
    enterMode('BUS')
    // 注释掉自动启动，改为手动启动
    // startDoubaoWakeup()

    // 根据配置决定是否显示按钮
    const buttonContainer = document.getElementById('doubao-control-div')
    if (buttonContainer && WAKEUP_CONFIG.SHOW_WAKEUP_BUTTON) {
        buttonContainer.style.display = 'block'
        console.log('✓ 唤醒词控制按钮已显示')
    }

    // 绑定按钮点击事件
    doubaoWakeupBtn = document.getElementById('doubao-wakeup-btn')
    if (doubaoWakeupBtn) {
        doubaoWakeupBtn.addEventListener('click', toggleDoubaoWakeup)
        console.log('✓ 唤醒词控制按钮已绑定')
    }

    // 根据配置决定是否自动启动唤醒检测
    if (WAKEUP_CONFIG.AUTO_START_ON_LOAD) {
        console.log(`⏰ 将在 ${WAKEUP_CONFIG.AUTO_START_DELAY / 1000} 秒后自动启动唤醒检测`)
        setTimeout(() => {
            // 只在 BUS 模式下自动启动
            if (control_mode === 'BUS' && !doubaoWakeupActive) {
                console.log('🚀 自动启动唤醒词检测')
                startDoubaoWakeup()
            }
        }, WAKEUP_CONFIG.AUTO_START_DELAY)
    }

    // 显示提示信息
    const keyHint = WAKEUP_CONFIG.ENABLE_KEY_D_SHORTCUT ? '或按 D 键' : ''
    const buttonHint = WAKEUP_CONFIG.SHOW_WAKEUP_BUTTON ? `点击右下角按钮${keyHint}启动唤醒词检测` : '唤醒词检测将自动启动'
    showTempMessage(buttonHint, 5000)
},systemLoadingTime)


// 启动豆包唤醒词检测
async function startDoubaoWakeup() {
    if (doubaoWakeupActive) {
        console.log('豆包唤醒词检测已在运行')
        return
    }

    try {
        console.log('正在启动豆包唤醒词检测...')
        showTempMessage('正在启动唤醒词检测...', 2000)

        await startWakeupDetection((wakeupWord) => {
            console.log('✓ 检测到唤醒词:', wakeupWord)
            onDoubaoWakeup()
        })

        doubaoWakeupActive = true
        console.log('✓ 豆包唤醒词检测已启动')

        // 更新按钮状态
        updateWakeupButton()

        // 显示唤醒提示（根据配置）
        showWakeupHint()

        // 更新状态文字
        updateStatusText()

        // 显示初始提示
        if (control_mode === 'BUS') {
            autoShowTipForMode('BUS')
            // 触发睡觉表情和 Idle 动作
            triggerExpression('shuijiao')
            triggerRepeatMotion('Idle')
        }
    } catch (error) {
        console.error('❌ 豆包唤醒词启动失败:', error)
        showTempMessage('唤醒词检测启动失败，请检查配置或手动重启', 3000)
        // 不再自动降级到按键唤醒，完全交给现有的开关控制
    }
}

// 停止豆包唤醒词检测
function stopDoubaoWakeup() {
    if (!doubaoWakeupActive) {
        return
    }

    try {
        stopWakeupDetection()
        doubaoWakeupActive = false
        console.log('✓ 豆包唤醒词检测已停止')

        // 更新按钮状态
        updateWakeupButton()

        // 更新状态文字
        updateStatusText()

        showTempMessage('唤醒词检测已停止', 2000)
    } catch (error) {
        console.error('❌ 停止豆包唤醒词失败:', error)
    }
}

// 豆包唤醒词检测到唤醒时的回调
function onDoubaoWakeup() {
    if (control_mode === 'BUS') {
        // 隐藏唤醒提示
        hideWakeupHint()

        // 立即停止豆包唤醒词检测（节省成本）
        stopDoubaoWakeup()
        console.log('✓ 唤醒成功，已停止豆包检测')

        // 显示唤醒成功提示
        showWakeupSuccess()
        showEleMessage('正在唤醒','success',1500)

        // 触发挥手动作
        triggerMotion('Wave')

        // 修改：唤醒后直接进入连续对话模式（MULTI）
        // 注意：这里只设置模式，不调用 enterMode，避免触发 toMultiMoudle()
        control_mode = 'MULTI'
        control_modeText = document.getElementById("mode_text");
        control_modeText.innerText = `${control_modeMap['MULTI']}`;

        // 显示对话框（因为没有调用 enterMode，需要手动显示）
        page_toggleDialogVisibility(true)

        // 显示对应模式的状态提示
        autoShowTipForMode('MULTI')
        page_changeState('listening')

        //开启讯飞识别（这样用户可以直接说话）
        latConnectWebSocket()

        //关闭Station播报 - 暂时屏蔽报站功能
        // interruptStationPlay()
    }
}

// 保留原来的按键唤醒函数（作为降级方案）
//唤醒检测
function wakeupDetect(event){
    if(event.key === 'Enter' && control_mode == 'BUS'){
        showWakeupSuccess()
        showEleMessage('正在唤醒','success',1500)
        // triggerMotion('Wave')
        enterMode('READY')
        //开启识别
        latConnectWebSocket()
        //关闭Station播报 - 暂时屏蔽报站功能
        // interruptStationPlay()
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
    //判断是有变化
    if(remote_trail_text !== control_lat_result){
        control_lat_result = remote_trail_text
        // console.log(formatNowTime(new Date()),'接收到lat语音识别结果为',control_lat_result)
        //指令有可能少于3个字
        debouncedjugeModeMode()
        control_tts_show(control_lat_result)
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
        '退一下': 'BUS',
        '结束': 'BUS',
        '再见': 'BUS',
        '拜拜': 'BUS',
        'bye': 'BUS',
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
        '聊聊': 'MULTI',
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
                showEleMessage('湖宝：下次再见👋','success')
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
                    // 允许从 MULTI 模式切换到 MUSIC 模式
                    if(control_mode == 'MULTI' && keywordToMode[keyword] == 'MUSIC'){
                        incluesKeyWord = true
                        // 记录当前是从 MULTI 模式进入 MUSIC
                        previousModeBeforeMusic = 'MULTI'
                        //防抖处理 音乐
                        debouncedEnterMode('MUSIC');
                        console.log('从多轮模式切换到音乐模式')
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
    toMultiMoudle()
},0);
    
//主动关闭语音识别 集成清除定时器功能
function latClose(){
    // 添加空值检查，防止在未初始化时调用
    if (control_lat_ws && typeof control_lat_ws.close === 'function') {
        control_lat_ws.close()
    }

    if (control_lat_recorder && typeof control_lat_recorder.stop === 'function') {
        control_lat_recorder.stop() //停止录音
    }

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
    console.log('latWsOnClosed 断开语音识别')
    latConnectWebSocket()
}

//lat连接成功 回调
export function latWsOnOpened(){
    // page_changeState('listening')
}

//lat连接错误 回调
export function latWsOnError(){
    page_changeState('')
    enterMode('BUS')
    showEleMessage('lat 连接断开','error')
}

//lat Recorder连接成功 回调
export function latRecorderOnstart(){
    page_changeState('listening')
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
import { musicModuleStart, stopMusicPlayback } from './control-music.js'
import { stationModuleStart } from './control-station.js'



function enterMode(mode){
    // 记录上一个模式
    const previousMode = control_mode

    // 如果要进入 MUSIC 模式，记录前一个模式（用于音乐结束后返回）
    if(mode === 'MUSIC' && previousMode === 'MULTI'){
        previousModeBeforeMusic = 'MULTI'
    } else if(mode === 'MUSIC'){
        // 从其他模式进入 MUSIC，清空记录（返回 BUS）
        previousModeBeforeMusic = null
    }

    control_mode = mode
    control_modeText = document.getElementById("mode_text");
    control_modeText.innerText = `${control_modeMap[mode]}`;

    // 显示对应模式的状态提示
    autoShowTipForMode(mode)

    // 控制对话框显示/隐藏
    if(mode === 'BUS'){
        page_toggleDialogVisibility(false) // 隐藏对话框
    } else {
        page_toggleDialogVisibility(true) // 显示对话框
    }

    if(mode === 'BUS'){
        page_changeState('')

        // 如果是从 MULTI 模式退出，且配置了自动重启，则重新启动唤醒检测
        if (previousMode === 'MULTI' && WAKEUP_CONFIG.AUTO_RESTART_AFTER_MULTI && !doubaoWakeupActive) {
            console.log('🔄 从多轮对话退出，自动重启唤醒词检测')
            setTimeout(() => {
                startDoubaoWakeup()
            }, 1000) // 延迟1秒，让用户看到退出提示
        }

        // 注释掉自动重启逻辑，避免重复连接
        // 返回 BUS 模式时，不自动重新启动豆包唤醒词检测
        // 用户需要手动按 D 键启动
        // if (!doubaoWakeupActive) {
        //     console.log('返回 BUS 模式，重新启动豆包唤醒词检测')
        //     startDoubaoWakeup()
        // }
    }else if( mode === 'MUSIC' || mode === 'MULTI' || mode === 'SINGEL'){
        page_changeState('thinking')
    }

    onModeChange(control_mode)
}

function onModeChange(control_mode){

    if(control_mode == 'BUS'){
        // 暂时屏蔽报站功能
        // stationModuleStart()

        // 更新状态文字
        updateStatusText()

        // 如果唤醒词检测已启动，显示睡觉状态
        if (doubaoWakeupActive) {
            showWakeupHint()
            triggerExpression('shuijiao')
            triggerRepeatMotion('Idle')
        }

    }else if(control_mode == 'SINGEL'){
        //关掉lat
        latClose()
        singelModuleStart(control_lat_result)

        // 更新状态文字
        updateStatusText()

    }else if(control_mode == 'MULTI'){

        toMultiMoudle()

        // 更新状态文字
        updateStatusText()

    }else if(control_mode == 'MUSIC'){
        //关掉lat
        latClose()

        musicModuleStart(control_lat_result)

        // 更新状态文字
        updateStatusText()

    }

}

function toMultiMoudle(){

    control_multi_answing = true
    //关掉lat
    latClose()

    //进入多轮对话中
    multiModuleStart(control_lat_result)
    page_changeState('thinking')

}

//模块处理完成触发的回调函数

//音乐播放完成回调
export function onMusicModuleEnd(){
    console.log('onMusicEnd','音乐播放结束')

    // 如果是从 MULTI 模式进入的音乐模式，返回 MULTI 模式
    if(previousModeBeforeMusic === 'MULTI'){
        console.log('音乐播放结束，返回多轮对话模式')
        previousModeBeforeMusic = null // 清空记录

        // 清空语音识别结果，避免自动发起对话请求
        control_lat_result = ''

        enterMode('MULTI')
    } else {
        // 否则回到报站模式
        enterMode('BUS')
    }
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
        console.log('onMultiModuleEnd 多轮对话结束')

        // 显示等待用户提问的状态
        autoShowTipForMode('MULTI_ASKING')

        //lat被主动关闭 lat主动开启
        latConnectWebSocket() //继续下一轮多轮
    }
}
        

