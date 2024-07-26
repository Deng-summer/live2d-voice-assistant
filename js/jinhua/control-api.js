//金华 接口
export const control_request = {
    sendText:sentTextF,
    checkProcess:checkProcessF,
    receiveGps:receiveGpsF,
    receiveGpsArea:receiveGpsAreaF,
}


//1. 用于接收识别后的文本接口
function sentTextF(){
    return axios({
        data:{content:''}, //参数
        method: 'POST',
        url:'back_end_control',
        responseType: 'arraybuffer', // 默认值
        timeout: 0, // 默认值是 `0` (永不超时)
    }).then( res =>{

    }).catch(err =>{

        reject(err)
    })
}


//2. 用于检测程序是否挂掉的接口
function checkProcessF(){
    return axios({
        data:{content:''}, //参数
        method: 'POST',
        url:'check_process',
        responseType: 'arraybuffer', // 默认值
        timeout: 0, // 默认值是 `0` (永不超时)
    }).then( res =>{
    
    }).catch(err =>{
        showEleMessage({
            message: JSON.stringify(err),
            type: 'error',  
        })
        reject(err)
    })
}

//3. 用于接收实时gps
function receiveGpsF(){
    return axios({
        data:{content:''}, //参数
        method: 'POST',
        url:'gps',
        responseType: 'arraybuffer', // 默认值
        timeout: 0, // 默认值是 `0` (永不超时)
    }).then( res =>{

    }).catch(err =>{
        reject(err)
    })
}
    

//4. 用于接收电子围栏
function receiveGpsAreaF(){
    return axios({
        data:{content:''}, //参数
        method: 'POST',
        url:'gps/area',
        responseType: 'arraybuffer', // 默认值
        timeout: 0, // 默认值是 `0` (永不超时)
    }).then( res =>{
    
    }).catch(err =>{
        reject(err)
    })
}




