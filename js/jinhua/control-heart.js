import { control_request } from './control-api.js'

sendHearBeat()

let control_heart_timer
let control_heart_time = 1000 * 60 * 5

function sendHearBeat(){
    control_request.heartBeat('normal','').finally(()=>{
        //释放上一个定时器资源
        if(control_heart_timer){
            clearTimeout(control_heart_timer)
            control_heart_timer = null
        }
        control_heart_timer = setTimeout(() => {
            sendHearBeat()
        }, control_heart_time);
    })
}
