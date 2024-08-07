//多轮对话 单轮对话模块
import { onSingleModuleEnd } from './control.js'
import { control_request } from './control-api.js'
import { tts_connectWebSocket } from '../tts-lat/example/tts/index.js'
import { control_answer_show } from './control-page.js'

//识别文字输出后2s 没有结果输出 结束录音
//无效输出 60s后 结束录音 
export function singelModuleStart(tts_result){
    control_request.getDialogue(tts_result).then((data)=>{
        const { content } = data
        control_answer_show(content)
        tts_connectWebSocket(content)
    }).catch((err) => {
        console.log('单轮对话接口出错/超时')
        showEleMessage('单轮对话接口出错/超时','error')
        // showEleMessage('网络超时，请重试','error')
        onSingleModuleEnd()
    })
}

export function ttsWsOnClosed(){
    onSingleModuleEnd()
}
