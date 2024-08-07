//多轮对话 模块
import { onMultiModuleEnd } from './control.js'
import { control_request } from './control-api.js'
import { tts_connectWebSocket } from '../tts-lat/example/tts/index.js'

//识别文字输出后2s 没有结果输出 结束录音
//无效输出 60s后 结束录音 
export function multiModuleStart(tts_result){
    control_request.getMultiDialogue(tts_result).then((data)=>{
        const { content } = data
        tts_connectWebSocket(content)
    }).catch((err) => {
        console.log('多轮对话接口出错/超时')
        onMultiModuleEnd() 
    })
}

export function ttsWsOnClosed_Multi(){
    onMultiModuleEnd()
}

export function handleContinueMulti(){

}
