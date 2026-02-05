import { chunkMultiReceived } from './control-multi-talk.js'

//金华 接口
export const control_request = {
    getMusicUrl:getMusicUrl,
    getStation:getStation,
    finishCurStation:finishCurStation,
    heartBeat:heartBeat,
}

const timeout = 3000 //接口超时时间
// const base_url = 'http://localhost:8080' //node_webservice测试环境
const base_url = 'http://1.95.87.50:9000' //生产环境 panke
// const base_url ='https://avatar.chekkk.com/ai' //生产环境 小巴域名

function getMusicUrl(content){
    return new Promise((resolve,reject)=>{
        axios({
            data:{"content":content}, //参数
            method: 'POST',
            url:base_url + '/process_generate_music',
            responseType: 'json',
            timeout: 1000*60, //获取音乐60秒超时时间
        }).then( res =>{
            // console.log('getMusicUrl',res)
            const {code ,data,message} = res?.data || {}
            if(code == 200){
                return resolve(data)
            }else{
                return reject(message)
            }
        }).catch(err =>{
            let message = err ? err.message : '网络出错'
            return reject(message)
        })
    }) 
}

//获取站点
function getStation(){
    return new Promise((resolve,reject)=>{
        axios({
            data:{}, //参数
            method: 'POST',
            url: base_url + '/get_station_info',
            responseType: 'json',
            timeout: timeout, // 默认值是 `0` (永不超时)
        }).then( res =>{
            // console.log('getStation',res)
            const {code,data,message} = res?.data || {}
            if(code == 200){
                return resolve(data)
            }else{
                console.log('getStation',message)
                return reject(message)
            }
        }).catch(err =>{
            return reject(err)
        })
    })
    
}
    

// 播放完成上报
function finishCurStation(content){
    return new Promise((resolve,reject)=>{
        axios({
            data:{"content":content}, //参数
            method: 'POST',
            url: base_url + '/station_report_status',
            responseType: 'json',
            timeout: timeout,
        }).then( res =>{
            // console.log('finishCurStation',res)
            const {code,data,message} = res?.data || {}
            if(code == 200){
                return resolve(data)
            }else{
                console.log('finishCurStation',message)
                return reject(message)
            }
        }).catch(err =>{
            return reject(err)
        })
    })
}

// 心跳接口
function heartBeat(status,reason){
    return new Promise((resolve,reject)=>{
        axios({
            data:{"status":status,"reason":reason},
            method: 'POST',
            url: base_url + '/web_status',
            responseType: 'json',
            timeout: timeout,
        }).then( res =>{
            // console.log('heartBeat',res)
            const {code,data,message} = res?.data || {}
            if(code == 200){
                return resolve(data)
            }else{
                console.log('heartBeat',message)
                return reject(message)
            }
        }).catch(err =>{
            return reject(err)
        })
    })
}




