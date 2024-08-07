import { onMusicModuleEnd } from './control.js'
import { control_request } from './control-api.js'
let control_audioPlayer //播放器
let control_audioData //音乐音频数据
let control_music_timeout = 1000 * 60 //下载音乐超时时间

loadMusicPlayer()

export function musicModuleStart(control_lat_result){
    
    control_request.getMusicUrl(control_lat_result).then((res)=>{
        let { music_tos_play_link } = res
        let filePath = music_tos_play_link
        downMusicAudio(filePath).then().catch((err)=>{
            //通知 控制中心control
            onMusicModuleEnd()
        })
    })
}

function loadMusicPlayer(){
    console.log('loadMusicPlayer init')
    control_audioPlayer = document.getElementById('music_audio');
    // 监听播放出错时的处理
    control_audioPlayer.addEventListener('error', function(event) {
        const error = audioPlayer.error;
        console.log('error',error)
        let errorMessage;
        switch (error?.code) {
            case error.MEDIA_ERR_ABORTED:
                errorMessage = '播放被中止';
                break;
            case error.MEDIA_ERR_NETWORK:
                errorMessage = '网络错误';
                break;
            case error.MEDIA_ERR_DECODE:
                errorMessage = '解码错误';
                break;
            case error.MEDIA_ERR_SRC_NOT_SUPPORTED:
                errorMessage = '媒体资源不支持';
                break;
            default:
                errorMessage = '未知错误';
                break;
        }
        console.error(`Music Audio playback error: ${errorMessage}`);
        showEleMessage(errorMessage,'error')
    });
    //监听音乐播放结束
    control_audioPlayer.addEventListener('ended', function(event) {
        playMusicEnd()
    })

}


function playMusic(){
    if(control_audioPlayer){
        control_audioPlayer.src = control_audioData
        
        control_audioPlayer.play();

    }
}

function playMusicEnd(){
    //处理音乐播放结束逻辑
    onMusicModuleEnd() //通知 控制中心control
}

//下载音频
async function downMusicAudio(filePath){
    
    return await new Promise((resolve,reject)=>{
        // let url = 'http://192.168.192.13:7999/down_load'
        axios({
            data:{},
            method: 'GET',//后端是POST
            // method: 'POST',//后端是POST
            url:filePath,
            responseType: 'arraybuffer', // 默认值
            timeout: control_music_timeout, // 默认值是 `0` (永不超时)
        }).then(async res =>{
            await handleArrayBuffer(res.data).then(()=>{
                resolve(res)
                //播放音乐
                playMusic()
            })
        }).catch(err =>{
            showEleMessage('网络超时下载音乐失败,请稍等重试～')
            reject(err)
        })
    })
}

// 处理arraybuffer 二进制 音频数据放入 音频播放器
async function handleArrayBuffer(arrayBuffer) {
    return await new Promise((resolve,reject)=>{
        try{
            const blob = new Blob([arrayBuffer], { type: 'audio/mpeg' }); // 创建 Blob 对象
            const audioData = URL.createObjectURL(blob); // 生成 Blob URL
            // 将音频 URL 加入音频队列
            control_audioData = audioData;
            // model.motion('talk',0) //这段 触发自定义Tap动作
            // 如果当前没有正在播放的音频，则播放队列中的第一个音频
            
            //处理返回成功 回调 延迟
            resolve()
        }catch{
            reject()
        }
    })
}