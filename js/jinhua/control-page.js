import { typeWriter_formatAnswer,changeQuestionText } from '../utils/typeWriter.js'

export function control_tts_show(text){
    changeQuestionText(text)
}

export function control_answer_show(text){
    typeWriter_formatAnswer(text)
}
let jinhuaStateImg = document.getElementById("jinhua_state_git");
let listening_text = document.getElementById("listening-text");

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
