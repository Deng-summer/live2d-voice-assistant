import { typeWriter_formatAnswer,changeQuestionText } from '../utils/typeWriter.js'
import { debounce } from '../utils/deounce.js'



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

// finish-listening.gif
// finish-talking.gif
// listening.gif
// start-listening.gif
// start-thinking.gif
// talking-to-thinking.gif //用不到
// talking.gif
// thinking-to-talking.gif 
// thinking.gif

function controlStateGif(state){
    // console.log('controlStateGif',state)
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
        case 'talking-to-thinking':
            stateImg = './js/jinhua/state-gif/talking-to-thinking.gif'
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
            // stateImg = './js/jinhua/state-gif/talking.gif'
            // stateImg = './js/jinhua/state-gif/listening.gif'

            stateImg = '../../css/transparent.png';
            break;
    }
    //动画过渡 fixed闪烁
    // Fade out the image
    jinhuaStateImg.classList.add('fade-out');
            
    // Handle image loading
    const newImg = new Image();
    newImg.src = stateImg;
    
    newImg.onload = function() {
        // Update the image source and remove the fade-out class to fade in the new image
        jinhuaStateImg.src = stateImg;
        jinhuaStateImg.onload = () => jinhuaStateImg.classList.remove('fade-out');
    };
}

let control_gif_state; //保存当前状态判断gif
let control_state_timerId = null; // 用于存储定时器 ID
let contrl_gif_time = 800 //gif 中间帧的间隔时间

function clearExistingTimeout() {
    if (control_state_timerId !== null) {
        clearTimeout(control_state_timerId);
        control_state_timerId = null;
    }
}

function delayExecution(fn, delay) {
    clearExistingTimeout();
    control_state_timerId = setTimeout(() => {
        fn();
        control_state_timerId = null;
    }, delay);
}


export function page_changeState(state) {
    if(state === 'listening'){
        listening_text.style.display = 'block' 
    }else{
        listening_text.style.display = 'none' 
    }
    switch (state) {
        case 'listening':
            if (control_gif_state === 'talking') {
                controlStateGif('finish-talking');
                delayExecution(() => {
                    controlStateGif('start-listening');
                    delayExecution(() => {
                        controlStateGif('listening');
                    }, contrl_gif_time);
                }, contrl_gif_time);
            } else {

                controlStateGif('start-listening');
                delayExecution(() => {
                    controlStateGif('listening');
                }, contrl_gif_time);

            }
            jinhuaStateImg.className = '';
            jinhuaStateImg.classList.add('state-listening')

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
    
                jinhuaStateImg.className = '';
                jinhuaStateImg.classList.add('state-thinking')
                break;
            }
        
        case 'talking':

            controlStateGif('thinking-to-talking');
            delayExecution(() => {
                controlStateGif('talking');
            }, contrl_gif_time);

            jinhuaStateImg.className = '';
            jinhuaStateImg.classList.add('state-talking')
            break;
        
        default:

            controlStateGif('');
            clearExistingTimeout();
            break;
            
    }
    
    control_gif_state = state;
}


