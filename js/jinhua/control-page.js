import { typeWriter_formatAnswer,changeQuestionText } from '../utils/typeWriter.js'
import { debounce } from '../utils/deounce.js'
import { control_mode } from './control.js';
import { triggerExpression, triggerRepeatMotion,triggerMotion, live2d_motion_name , live2d_express_name} from '../live2d-cubism4.js'


function throttle(func, limit) {
    let lastFunc;
    let lastRan;
    return function(...args) {
        const context = this;
        if (!lastRan) {
            func.apply(context, args);
            lastRan = Date.now();
        } else {
            if (lastFunc) clearTimeout(lastFunc);
            lastFunc = setTimeout(function() {
                if ((Date.now() - lastRan) >= limit) {
                    func.apply(context, args);
                    lastRan = Date.now();
                }
            }, limit - (Date.now() - lastRan));
        }
    };
}
let jinhuaStateImg = document.getElementById("jinhua_state_git");
let jinhuaStateDiv = document.getElementById("jinhua-state-div");

let listening_text = document.getElementById("listening-text");
let dialog_body = document.querySelector(".dialog-body")

const handleScrollToEnd = throttle(
    () => {
        if (dialog_body) {
            // console.log(dialog_body.scrollTop,dialog_body.scrollHeight)
            dialog_body.scrollTop = dialog_body.scrollHeight;
        }
    },
    300
);

export function control_tts_show(text){
    changeQuestionText(text)
}


let page_observe_flag = false
const dialog_answer = document.querySelector(".dialog-answer");
let dialog_answer_lastHeight = dialog_answer.offsetHeight;

export function control_answer_show(text){
    typeWriter_formatAnswer(text)

    //ResizeObserver 监听元素变化
    if(!page_observe_flag){

        page_observe_flag = true
        const resizeObserver = new ResizeObserver(entries => {
            for (let entry of entries) {
                const currentHeight = entry.contentRect.height;
                if (currentHeight !== dialog_answer_lastHeight) {
                    dialog_answer_lastHeight = currentHeight;
                    // console.log('Height changed:', currentHeight);
                    handleScrollToEnd();
                }
            }
        });
        
        if (dialog_answer) {
            resizeObserver.observe(dialog_answer);
        }
    }
}


function controlStateGif(state){
    console.log('controlStateGif',state)
    let stateImg
    switch (state) {
        case 'start-listening':
                stateImg = './js/jinhua/state-gif/start-listening.gif'
            break;
        case 'listening':
                stateImg = './js/jinhua/state-gif/listening.gif'
            break;
        case 'finish-listening':
                stateImg = './js/jinhua/state-gif/finish-listening.gif'
            break;
        case 'start-thinking':
                stateImg = './js/jinhua/state-gif/start-thinking.gif'
            break;
        case 'thinking':
                stateImg = './js/jinhua/state-gif/thinking.gif'
            break;
        case 'thinking-to-talking':
                stateImg = './js/jinhua/state-gif/thinking-to-talking.gif'
            break;
        case 'talking':
                stateImg = './js/jinhua/state-gif/talking.gif'
            break;
        case 'finish-talking':
                stateImg = './js/jinhua/state-gif/finish-talking.gif'
            break;
        default:
            // stateImg = './js/jinhua/state-gif/start-listening.gif'
            // stateImg = './js/jinhua/state-gif/listening.gif'
            // stateImg = './js/jinhua/state-gif/start-thinking.gif'

            stateImg = '/css/transparent.png';
            break;
    }
    //动画过渡 fixed闪烁
    // Fade out the image
    jinhuaStateImg.classList.add('fade-out');
            
    // // Handle image loading
    const newImg = new Image();
    newImg.src = stateImg;
    
    newImg.onload = function() {
     // Update the image source and remove the fade-out class to fade in the new image
    
        // thinking 类图 
        if(stateImg.includes('thinking.gif')){
            jinhuaStateImg.style.width = '126px';
            jinhuaStateImg.style.height = '126px';
            jinhuaStateDiv.style.top = '50px'
            jinhuaStateDiv.style.bottom = 'unset'
        // listening 类图 
        }else if(stateImg.includes('listening.gif')){
            jinhuaStateImg.style.width = '240px';
            jinhuaStateImg.style.height = '240px';
            jinhuaStateDiv.style.bottom = '77px'
            jinhuaStateDiv.style.top = 'unset'
        // talking 类图 
        }else if(stateImg.includes('talking.gif')){
            jinhuaStateImg.style.width = '90px';
            jinhuaStateImg.style.height = '90px';
            jinhuaStateDiv.style.top = '50px'
            jinhuaStateDiv.style.bottom = 'unset'
        }
        jinhuaStateImg.src = stateImg;
        jinhuaStateImg.onload = () => jinhuaStateImg.classList.remove('fade-out');
    };
}

function control_model_motion(){
    if(control_gif_state === 'thinking'){

        triggerMotion('Think')
        
    }else if(control_gif_state === 'talking'){

        triggerRepeatMotion('Talk')

    }else if (control_gif_state === 'listening'){

        showEleMessage('正在听...','success',1000)

        triggerExpression('jingzhang')

    }else {
        triggerExpression('empty')
    }
}

let control_gif_state; //保存当前状态判断gif 4种状态 thingking listening talking ''
// 用于存储定时器 ID 的数组
const timerIds = [];

let contrl_gif_time = 800 //gif 中间帧的间隔时间

function clearAllTimeouts() {
    // 遍历数组中的所有定时器 ID 并清除
    timerIds.forEach(timerId => clearTimeout(timerId));
    // 清空定时器 ID 数组
    timerIds.length = 0;
}

function delayExecution(fn, delay) {
    clearAllTimeouts();
    // 设置新的定时器，并将其 ID 添加到数组中
    const timerId = setTimeout(() => {
        fn();
        // 执行完毕后从数组中移除定时器 ID
        const index = timerIds.indexOf(timerId);
        if (index > -1) {
            timerIds.splice(index, 1);
        }
    }, delay);
    // 记录定时器 ID
    timerIds.push(timerId);
}


export function page_changeState(state) {
    listening_text.style.display = 'none' 
    switch (state) {
        case 'listening':
            if (control_gif_state === 'talking') {
                controlStateGif('finish-talking');
                delayExecution(() => {
                    controlStateGif('start-listening');
                    delayExecution(() => {
                        controlStateGif('listening');
                        listening_text.style.display = 'block' 

                    }, contrl_gif_time);
                }, contrl_gif_time);
                
            } else {
                controlStateGif('start-listening')
                delayExecution(() => {
                    controlStateGif('listening');
                    listening_text.style.display = 'block' 
                }, contrl_gif_time);
            }
            break;
        
        case 'thinking':
            if(control_gif_state === 'thinking'){
                break;
            }else{
                controlStateGif('finish-listening');
                
                delayExecution(() => {
                    controlStateGif('start-thinking');
                    delayExecution(() => {
                        controlStateGif('thinking');
                    }, contrl_gif_time);
                }, contrl_gif_time);
    
                
                break;
            }
        
        case 'talking':

            controlStateGif('thinking-to-talking');
            delayExecution(() => {
                controlStateGif('talking');
            }, contrl_gif_time);

            break;
        
        default:

            controlStateGif('');
            clearAllTimeouts();
            break;
            
    }
    
    control_gif_state = state;
    control_model_motion()
}
// 睡眠开启判断
export function page_live2d_startSleep(x,y){
    if(control_mode === 'BUS'){
        if(Number.isNaN(x) && Number.isNaN(y)){
            if(live2d_express_name !== 'shuijiao'){
                triggerExpression('shuijiao')
            }
            
        }else{
            if(live2d_express_name !== 'nomal' &&  live2d_motion_name !== 'Talk'){
                triggerExpression('nomal')
            }
        }
    }
}