//报站模块
import { control_request } from './control-api.js'
import { control_mode  } from './control.js'
import { stop_audio_address, stop_introduce} from './bus-stop-audio/stop-info.js'
import { control_answer_show } from './control-page.js'

let control_station_time = 1000 * 60 //获取站点 间隔时间  
let control_station_timer = null //定时器
let control_audioPlayer
let control_station_current //当前站点

export function stationModuleStart(){
    getLoopStation()
}

//获取站点
function getLoopStation(){
    if(control_mode == 'BUS'){
        control_request.getStation().then((data)=>{

            const { station, status } = data
            if(status === '允许报站' && station && control_mode == 'BUS'){
            // if(station && control_mode == 'BUS'){
                control_station_current = station
                //播报站点
                playStationAudio(station)
            }

        }).catch((error)=>{
            console.log(error)
        }).finally(()=>{
            //释放上一个定时器资源
            if(control_station_timer){
                clearTimeout(control_station_timer)
                control_station_timer = null
            }
            control_station_timer = setTimeout(() => {
                getLoopStation()
            }, control_station_time);
        })
    }else{
        //其他模式
        if(control_station_timer){
            clearTimeout(control_station_timer)
            control_station_timer = null
        }
    }
}

//播放站点
function playStationAudio(station){
    let audioFilePath = stop_audio_address[station]
    if(audioFilePath){
        control_audioPlayer.src = audioFilePath;
        // 加载新的音频文件
        control_audioPlayer.load();
        // 播放音频（可选）
        control_audioPlayer.play();
    }

    // 显示站点
    let cur_station_info =  stop_introduce[station]
    if(cur_station_info){
        control_answer_show(cur_station_info)
    }
}

//播放完成
function playStationAudioEnd(){
    //上报当前站点播放完成
    control_request.finishCurStation(control_station_current)
}

loadStationPlayer()

function loadStationPlayer(){
    console.log('loadPlayer init')
    control_audioPlayer = document.getElementById('station_audio');
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
        console.error(`Station Audio playback error: ${errorMessage}`);
        showEleMessage('播放出错'+errorMessage,'error')
        playStationAudioEnd()

    });
    //监听音乐播放结束
    control_audioPlayer.addEventListener('ended', function(event) {
        playStationAudioEnd()
    })
}

