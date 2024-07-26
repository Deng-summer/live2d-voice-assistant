import { control_request } from './control-api.js'

//金华  模式控制中心
( function (){
    let modeMap = {
        0:'报站模式',
        1:'唤醒模式',
        2:'音乐模式',
        3:'对话模式',
    }
    let control_mode = 0 ;
    let modeText = document.getElementById('mode_text')
    document.addEventListener('keydown', wakeupDetect);

    changeMode(0)

    //唤醒检测
    function wakeupDetect(event){
        //按键
        if(event.key === 'Enter' ){
            changeMode(1)
        }
    }

    function changeMode(cur_mode_num){
        control_mode = cur_mode_num
        modeText = document.getElementById("mode_text");
        modeText.innerText = `${modeMap[cur_mode_num]}`;
    }

})()



