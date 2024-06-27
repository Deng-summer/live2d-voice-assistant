
let socket_audio; // WebSocket 对象
// const url_audio = 'ws://192.168.192.10:7999/ws_vedio'; // WebSocket 服务器地址
// const url_audio = 'ws://127.0.0.1:7999/ws_vedio'
const url_audio = 'ws://192.168.192.13:7999/ws_vedio'

// const url_audio = 'ws://127.0.0.1:7999/ws'; // 本地WebSocket 服务器地址
let reconnectInterval_audio = 1000; // 重连间隔时间，单位：毫秒
let maxReconnectIntezrval_audio = 30000; // 最大重连间隔时间，单位：毫秒
let audioList = [] //音频路径列表
let receive_audio_done = false //音频传输结束 接收到 done

function connectAudio() {
    socket_audio = new WebSocket(url_audio); // 创建 WebSocket 连接
    // 连接打开时触发
    socket_audio.onopen = function(event) {
        console.log('ws_vedio WebSocket连接已打开');
        // showMessage('ws_vedio WebSocket连接已打开', 10000); 
        socket_audio.send(JSON.stringify({'traceId':'start'}))
    };

    // 接收到消息时触发
    socket_audio.onmessage = function(event) {
        let temp = event.data
        console.log('ws_vedio 消息', temp);
        handleAudioMesage(temp)
    };

    // 连接关闭时触发
    socket_audio.onclose = function(event) {
        console.log('ws_vedio WebSocket连接已关闭');
        // alert('ws_vedio WebSocket连接已关闭')

        // 触发重连逻辑
        // reconnectAudio();
    };

    // 发生错误时触发
    socket_audio.onerror = function(event) {
        console.error('ws_vedio WebSocket连接出错：', event);
        alert('ws_vedio WebSocket连接出错：')
        // 触发重连逻辑
        // reconnectAudio();
    };
}


function reconnectAudio() {
    // 重连间隔递增
    reconnectInterval_audio = Math.min(2 * reconnectInterval_audio, maxReconnectInterval);
    console.log(`尝试在 ${reconnectInterval_audio} 毫秒后重连...`);
    
    // 在重连间隔后尝试重新连接
    setTimeout(function() {
        connect();
    }, reconnectInterval_audio);
}
// 销毁 WebSocket 连接
function disconnectAudio() {
    if (socket_audio) {
        socket_audio.close(); // 关闭 WebSocket 连接
        console.log('WebSocket 连接已销毁');
    }
}

// 在页面关闭之前执行销毁操作
window.addEventListener('beforeunload', function(event) {
    disconnectAudio(); // 页面关闭前销毁 WebSocket 连接
});
var pathSequence = 0 //存储的音频文件的序列号
var pathSequenceNow = 0 //正在播放的音频文件的序列号

//处理发送回来的音频消息
function handleAudioMesage(path){
    return new Promise(async (resolve,reject)=>{
        if(path !== 'Done!'){ //不是结束音频
            //只会阻塞downAudio的调用
            await downAudio(path,pathSequence).finally(()=>{
                resolve()
            })
            pathSequence++
        }else{
            if(path === 'Done!'){
                receive_audio_done = true
                pathSequence = 0
            }
        }
    })
    
}

//下载音频
async function downAudio(filePath,fileNum){
    return await new Promise((resolve,reject)=>{
        // let url = 'http://192.168.192.10:7999/down_load'
        // let url = 'http://127.0.0.1:7999/down_load'
        let url = 'http://192.168.192.13:7999/down_load'
        axios({
            data:{filepath:filePath},
            method: 'POST',
            url,
            responseType: 'arraybuffer', // 默认值
            timeout: 0, // 默认值是 `0` (永不超时)
        }).then(async res =>{
            await playAudio(res.data,fileNum).then(()=>{
                resolve(res)
            })
        }).catch(err =>{
            reject(err)
        })
    })
}
// 音频队列
let audioQueue = [];
 // 标记是否正在播放音频
let isPlaying = false;

// 播放音频数据放入音频播放器
async function playAudio(arrayBuffer,fileNum) {
    return await new Promise((resolve,reject)=>{
        try{
            const blob = new Blob([arrayBuffer], { type: 'audio/mpeg' }); // 创建 Blob 对象
            const audioData = URL.createObjectURL(blob); // 生成 Blob URL
            // 将音频 URL 加入音频队列
            audioQueue.push(audioData);
            // audioQueue[fileNum]=audioData
        
            // model.motion('talk',0) //这段 触发自定义Tap动作
            // 如果当前没有正在播放的音频，则播放队列中的第一个音频
            if (!isPlaying) {
                playNextAudio();
                motionTalk(true)
            }
            resolve()
        }catch{
            reject()
        }
    })
}

let audioPlayer = null
window.onload = function() {
    audioPlayer = document.getElementById('my_audio');
    if (audioPlayer) {
        audioPlayer.addEventListener('ended', function() {
            isPlaying = false; // 标记播放结束
            pathSequenceNow++;
            playNextAudio(); // 播放下一段音频
            // 如果需要清空当前播放音频，请在这里实现相关逻辑
            // audioQueue[pathSequenceNow] = ''; 
        })
        // 播放出错时的处理
        audioPlayer.addEventListener('error', function(event) {
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
            isPlaying = false; // 标记播放结束，即使是因为错误
            pathSequenceNow++;
            playNextAudio();
        });
    
    } else {
        console.error('Audio element not found!');
    }
};

// 播放队列中的下一段音频
function playNextAudio() {
    console.log('音频列表',audioQueue)
    console.log('当前音频序列',pathSequenceNow)

    // 如果队列中有音频
    if (audioQueue.length > 0 && pathSequenceNow<= audioQueue.length -1 && !isPlaying) {

        if(audioQueue[pathSequenceNow]){
            audioPlayer.src = audioQueue[pathSequenceNow] //顺序播放的关键
            // audioQueue.sclie(pathSequenceNow); // 从队列中取出并移除第一段音频
            audioPlayer.play();
            isPlaying = true; // 标记正在播放
        }
        
        // else{
        //     // 当前这段音频为空
        //     isPlaying = false; // 标记播放结束
        //     pathSequenceNow++
        //     playNextAudio(); // 播放下一段音频
        // }
        
    }else{
        if(receive_audio_done){
            pathSequenceNow = 0
            pathSequence = 0
            audioQueue = []
            console.log('音频列表 被清',audioQueue)
            console.log('当前音频序列 被清',pathSequenceNow)
            judgeLastAudio()
        }
    }
}

//判断最后一段音频播放结束
function judgeLastAudio(){
    //发送结束
    socket.send("{\"traceId\": \"finish\"}")
    //重新置位
    receive_audio_done = false
    motionTalk(false) // live2d-cubism4
}

//切换说话动作
function changeTalk(time) {
    var model = new LAppModel();
// (2) 第二个参数3 ，动作的优先级程度
    // 动作优先级常量
    // PRIORITY_NONE : 0,
    // PRIORITY_IDLE : 1,
    // PRIORITY_NORMAL : 2,
    // PRIORITY_FORCE : 3,
// （3）第三个参数10，代表动作组里的第(10 + 1)个动作，数组从0开始。
    model.startAppointMotion("tap_body",3,2);
    let timer = null
    if(timer){
        timer = setTimeout(() => {
            model.startAppointMotion("idle",3,0);
            clearTimeout(timers)
            timer = null
        }, time*1000)
    }
}

