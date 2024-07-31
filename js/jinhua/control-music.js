import { onMusicEnd } from './control.js'
const control_audioPlayer = null
let control_audioQueue = null

export function loadPlayer(){
    control_audioPlayer = document.getElementById('music_audio');
    // 监听播放出错时的处理
    control_audioPlayer.addEventListener('error', function(event) {
        const error = audioPlayer.error;
        let errorMessage;
        switch (error.code) {
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
        console.error(`Audio playback error: ${errorMessage}`);
        showEleMessage(errorMessage,'error')
    });
    //监听音乐播放结束
    control_audioPlayer.addEventListener('ended', function(event) {
        playMusicEnd()
    })

}



function playMusic(){
    if(control_audioPlayer){
        control_audioPlayer.src = audioQueue[pathSequenceNow] //顺序播放的关键
        
        control_audioPlayer.play();

    }
}

function playMusicEnd(){
    //处理音乐播放结束逻辑
    onMusicEnd() //通知 控制中心control
}

//下载音频
async function downAudio(filePath,fileNum){
    
    return await new Promise((resolve,reject)=>{
        let url = 'http://192.168.192.13:7999/down_load'
        axios({
            data:{filepath:filePath},
            method: 'POST',
            url,
            responseType: 'arraybuffer', // 默认值
            timeout: 0, // 默认值是 `0` (永不超时)
        }).then(async res =>{
            await handleArrayBuffer(res.data).then(()=>{
                resolve(res)
                //播放音乐
                playMusic()
            })
        }).catch(err =>{
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
            control_audioQueue = audioData;
            // model.motion('talk',0) //这段 触发自定义Tap动作
            // 如果当前没有正在播放的音频，则播放队列中的第一个音频
            
            //处理返回成功 回调 延迟
            resolve()
        }catch{
            reject()
        }
    })
}