import { onMusicModuleEnd } from './control.js'
import { control_request } from './control-api.js'
import { page_changeState } from './control-page.js'

let control_audioPlayer //播放器
let control_audioData //音乐音频数据
let control_music_timeout = 1000 * 60 //下载音乐超时时间
let control_music_progress = document.getElementById('music-moudle')
let control_music_progressBar = document.getElementById('music-progress-bar')
let music_title = document.querySelector('.music-title')
let dialog_answer = document.querySelector('.dialog-answer')

loadMusicPlayer()

export function musicModuleStart(control_lat_result){

    // playMusic("https://bytevdn.chekkk.com/temp/heal_project/music/%E5%BF%AB%E4%B9%90/006e764e-9e1c-4b41-bc25-26b95545cb56.mp3?auth_key=1723486491-ZcOjE40tkuyNris4-0-e7456fce9d8679b10350e0f9ab25a401")
    
    control_request.getMusicUrl(control_lat_result).then((res)=>{
        let { music_tos_play_link,title } = res
        let filePath = music_tos_play_link

        if(filePath){
            control_audioPlayer.src = filePath

            page_changeState('talking')
            
            playMusic(filePath)

            showMusicProgress(true)
        }

        if(title){
            music_title.innerText = title
        }

        // downMusicAudio(filePath).then().catch((err)=>{
        //     //通知 控制中心control
        //     onMusicModuleEnd()
        // })
        
    }).catch((err)=>{
        console.error(err)
        showEleMessage('音乐生成失败,请联系工作人员','error')
        onMusicModuleEnd()
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
        playMusicEnd()

    });
    //监听音乐播放结束
    control_audioPlayer.addEventListener('ended', function(event) {
        playMusicEnd()
        showMusicProgress(false)
    })


    // 提取事件处理函数
    function updateProgress() {
        if (control_audioPlayer.duration) {
            const percentage = (control_audioPlayer.currentTime.toFixed(2) / control_audioPlayer.duration).toFixed(2) * 100;
            control_music_progressBar.style.width = percentage + '%';
        }
    }

    // 监听 canplaythrough 事件
    control_audioPlayer.addEventListener('canplaythrough', () => {
        console.log('Audio is fully loaded and ready to play through.');

        // 移除之前的监听器以避免重复添加
        control_audioPlayer.removeEventListener('timeupdate', updateProgress);

        // 添加新的监听器
        control_audioPlayer.addEventListener('timeupdate', updateProgress);
    });
    
}

function playMusic(src){

    if(control_audioPlayer){

        control_audioPlayer.src = src
        
        control_audioPlayer.play();

    }
}

function playMusicEnd(){
    //处理音乐播放结束逻辑
    onMusicModuleEnd() //通知 控制中心control
}

//下载音频 options 预请求会被拦截
async function downMusicAudio(filePath){
    
    return await new Promise((resolve,reject)=>{
        // let url = 'http://192.168.192.13:7999/down_load'
        axios({
            data:{},
            method: 'GET',
            url:filePath,
            // url:'http://localhost:3000/api' + filePath,
            responseType: 'arraybuffer', // 默认值
            timeout: control_music_timeout,
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

//控制音乐播放UI
function  showMusicProgress(flag){
    if(flag){
        //回答对话栏隐藏
        dialog_answer.style.display = 'none'
        //音乐模块显示
        control_music_progress.style.display = 'flex'
    }else{
        dialog_answer.style.display = 'block'
        control_music_progress.style.display = 'none'
    }
}