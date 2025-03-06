//多轮对话 单轮对话模块
import { onSingleModuleEnd } from './control.js'
import { control_request_stream } from './control-api-stream.js'
import { tts_connectWebSocket } from '../tts-lat/example/tts/index.js'
import { control_answer_show,page_changeState } from './control-page.js'
import { extractLastJSONObject } from '../utils/deounce.js'
// import { face_max_emotion } from '../face-detector.js'
import { replacCircle,containsLatex } from '../utils/mathReplace.js'
export let singel_recoder_tts_content_origin = '' //记录接收的语音部分
export let singel_recoder_tts_content_play = '' //记录读了的语音部分
export let singel_tts_done = false //流式是否结束
export let singel_tts_start = true //代表流式第一个包

//识别文字输出后2s 没有结果输出 结束录音
//无效输出 60s后 结束录音 
export function singelModuleStart(tts_result){

    singel_recoder_tts_content_origin = ''
    singel_recoder_tts_content_play = ''
    singel_tts_done = false
    singel_tts_start = true

    // control_request_stream.getDialogue(tts_result,face_max_emotion).then((data)=>{
    control_request_stream.getDialogue(tts_result,'中性').then((data)=>{
    
    }).catch((err) => {
        console.log('单轮对话接口出错/超时',err)
        showEleMessage('对话出错/网络超时','error')
        // showEleMessage('网络超时，请重试','error')
        onSingleModuleEnd()
    })
}

export function ttsWsOnClosed_Singel(){
    onSingleModuleEnd()
}

export function chunkSingelReceived(data){

    //解析最后一个有效JSON对象{"code": 200,"message": "成功","data": {}}
    let parse_data = extractLastJSONObject(data)
    let content = parse_data?.data?.content //该包的文字内容
    let status = parse_data?.data?.status  //该包的状态
    // console.log('parse_data',content)
    
    //流式包结束帧
    if(status === 'done!'){
        singel_tts_done = true
    }
    

    if(content){
        if(containsLatex(content)){
            content = replacCircle(content)
            console.log('content',content)
            MathJax.Hub.Queue(["Typeset", MathJax.Hub]);
        }
        control_answer_show(content)

        //记录 接收的流式文字
        singel_recoder_tts_content_origin = content

        //首次需要发起
        if(singel_tts_start){

            //断句判断 后开始 tts
            if(content.includes('，') || content.includes('。') || content.includes('？')){

                singel_tts_start = false

                page_changeState('talking')

                let content_play = dealContentPlay(singel_recoder_tts_content_origin,singel_recoder_tts_content_play)

                tts_connectWebSocket(content_play)
                
                singel_recoder_tts_content_play += content_play
            }
            
        }
    }

}

//上一段语音播放完成后发起tts
export function singel_follow_tts_conntectWebSoket (){

    //截取要播放的部分
    // let content_play = singel_recoder_tts_content_origin.replace(singel_recoder_tts_content_play,'')

    let content_play = dealContentPlay(singel_recoder_tts_content_origin,singel_recoder_tts_content_play)

    if(content_play){
        tts_connectWebSocket(content_play)
    }

    //更新已播放的内容
    // singel_recoder_tts_content_play = singel_recoder_tts_content_origin
    singel_recoder_tts_content_play += content_play

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
    if(containsLatex(play_content)){
        play_content = replacCircle(play_content)
    }
    return play_content
}