import { chunkMultiReceived } from './control-multi-talk.js'

//金华 接口
export const control_request = {
    getMusicUrl:getMusicUrl,
    getStation:getStation,
    finishCurStation:finishCurStation,
    heartBeat:heartBeat,
}

const timeout = 3000 //接口超时时间
// const base_url = 'http://localhost:3000' //node_webservice测试环境
const base_url = 'http://1.95.87.50:9000' //生产环境

function getMusicUrl(content){
    return axios({
        data:{"content":content}, //参数
        method: 'POST',
        url:base_url + '/process_generate_music',
        responseType: 'json',
        timeout: 1000*6,
    }).then( res =>{
        console.log('getMusicUrl',res)
        const {code ,data,message} = res?.data || {}
        if(code == 200){
            return data
        }else{
            debugger
            reject(message)
            console.log('getMusicUrl',message)
        }
    }).catch(err =>{

        reject(err)
    })
}

//获取站点
function getStation(){
    return axios({
        data:{}, //参数
        method: 'POST',
        url: base_url + '/get_station_info',
        responseType: 'json',
        timeout: timeout, // 默认值是 `0` (永不超时)
    }).then( res =>{
        console.log('getStation',res)
        const {code,data,message} = res?.data || {}
        if(code == 200){
            return data
        }else{
            console.log('getStation',message)
        }
    }).catch(err =>{
        reject(err)
    })
}
    

// 播放完成上报
function finishCurStation(content){
    return axios({
        data:{"content":content}, //参数
        method: 'POST',
        url: base_url + '/station_report_status',
        responseType: 'json',
        timeout: timeout,
    }).then( res =>{
        console.log('finishCurStation',res)
        const {code,data,message} = res?.data || {}
        if(code == 200){
            return data
        }else{
            console.log('finishCurStation',message)
        }
    }).catch(err =>{
        reject(err)
    })
}

// 心跳接口
function heartBeat(status,reason){
    return axios({
        data:{"status":status,"reason":reason},
        method: 'POST',
        url: base_url + '/web_status',
        responseType: 'json',
        timeout: timeout,
    }).then( res =>{
        console.log('heartBeat',res)
        const {code,data,message} = res?.data || {}
        if(code == 200){
            return data
        }else{
            console.log('heartBeat',message)
        }
    }).catch(err =>{
        reject(err)
    })
}




