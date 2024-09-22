//多轮对话 模块
import { onMultiModuleEnd } from './control.js'
import { control_request } from './control-api.js'
import { control_request_stream } from './control-api-stream.js'
// import { face_max_emotion } from '../face-detector.js'

import { tts_connectWebSocket } from '../tts-lat/example/tts/index.js'
import { control_answer_show,page_changeState } from './control-page.js'
import { triggerExpression } from '../live2d-cubism4.js'
import { extractLastJSONObject } from '../utils/deounce.js'

export let multi_recoder_tts_content_origin = '' //记录接收的语音部分
export let multi_recoder_tts_content_play = '' //记录读了的语音部分
export let multi_tts_done = false //流式是否结束
export let multi_tts_start = true //代表流式第一个包


//识别文字输出后2s 没有结果输出 结束录音
//无效输出 60s后 结束录音 
export function multiModuleStart(tts_result){

    multi_recoder_tts_content_play = ''
    multi_recoder_tts_content_origin = '' 
    multi_tts_done = false
    multi_tts_start = true

    // control_request_stream.getMultiDialogue(tts_result,face_max_emotion).then((data)=>{
    control_request_stream.getMultiDialogue(tts_result,'中性').then((data)=>{
    
        //流式结束处理
        // console.log(data)
    }).catch((err) => {
        console.log('多轮对话接口出错/超时',err)
        showEleMessage('对话出错/网络超时','error')
        onMultiModuleEnd() 
    })
}

export function ttsWsOnClosed_Multi(){
    //通知控制中心结束
    onMultiModuleEnd()
}

export function chunkMultiReceived(data){

    //解析最后一个有效JSON对象{"code": 200,"message": "成功","data": {}}
    let parse_data = extractLastJSONObject(data)
    let content = parse_data?.data?.content //该包的文字内容
    let status = parse_data?.data?.status  //该包的状态
    // console.log('parse_data',content)
    
    //流式包结束帧
    if(status === 'done!'){
        multi_tts_done = true
    }

    if(content){

        control_answer_show(content)

        //记录 接收的流式文字
        multi_recoder_tts_content_origin = content

        //首次需要发起
        if(multi_tts_start){

            //断句判断 后开始 tts
            if(content.includes('，') || content.includes('。') || content.includes('？')){

                page_changeState('talking')

                multi_tts_start = false

                let content_play = dealContentPlay(multi_recoder_tts_content_origin,multi_recoder_tts_content_play)

                tts_connectWebSocket(content_play)
                
                multi_recoder_tts_content_play += content_play

                //触发表情
                triggerExpression('sikao2')

            }
            
        }
    }

}

//上一段语音播放完成后发起tts
export function multi_follow_tts_conntectWebSoket (){

    //截取要播放的部分
    // let content_play = multi_recoder_tts_content_origin.replace(multi_recoder_tts_content_play,'')

    let content_play = dealContentPlay(multi_recoder_tts_content_origin,multi_recoder_tts_content_play)

    if(content_play){
        tts_connectWebSocket(content_play)
    }

    //更新已播放的内容
    // multi_recoder_tts_content_play = multi_recoder_tts_content_origin
    multi_recoder_tts_content_play += content_play

}

//计算播放的句子为，。？分割的整句
function dealContentPlay(str_origin,str_sub){
    // debugger
    //截取要已播放的部分
    let new_content = str_origin.replace(str_sub,'')
    let play_content = ''
    let lastCommaIndex = 0
    //寻找最后一个，
    if(new_content.lastIndexOf('。') !== -1){

        lastCommaIndex = new_content.lastIndexOf('。')+1 //包含。号
        play_content = new_content.substring(0, lastCommaIndex)

    }else if(new_content.lastIndexOf('，') !== -1){
        lastCommaIndex = new_content.lastIndexOf('，')+1
        play_content = new_content.substring(0, lastCommaIndex)

    }else if(new_content.lastIndexOf('？') !== -1){

        lastCommaIndex = new_content.lastIndexOf('？')+1
        play_content = new_content.substring(0, lastCommaIndex)

    }else if(new_content.lastIndexOf('！') !== -1){

        lastCommaIndex = new_content.lastIndexOf('！')+1
        play_content = new_content.substring(0, lastCommaIndex)

    }else{
        play_content = new_content

    }

    return play_content
}
