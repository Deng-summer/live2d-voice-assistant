//金华 接口
export const control_request = {
    sendText:sentTextF,
    checkProcess:checkProcessF,
    receiveGps:receiveGpsF,
    receiveGpsArea:receiveGpsAreaF,
    getDialogue:getDialogue,
    getMultiDialogue:getMultiDialogue,
    getMusicUrl:getMusicUrl,
}
const timeout = 3000

function getDialogue(content){
    return axios({
        data:{"content":content}, //参数
        method: 'POST',
        url:'http://localhost:3000/process_dialogue',
        responseType: 'json',
        timeout: timeout, // 默认值是 `0` (永不超时)
    }).then( res =>{
        console.log('getDialogue',res)
        const {code ,data,message} = res?.data || {}
        if(code == 200){
            return data
        }else{
            console.log('getDialogue',message)
        }

    }).catch(err =>{

        reject(err)
    })
}
function getMultiDialogue(content){
    return axios({
        data:{"content":content}, //参数
        method: 'POST',
        url:'http://localhost:3000/process_continue_dialogue',
        responseType: 'json',
        timeout: timeout, // 默认值是 `0` (永不超时)
    }).then( res =>{
        console.log('getMultiDialogue',res)
        const {code ,data,message} = res?.data || {}
        if(code == 200){
            return data
        }else{
            console.log('getDialogue',message)
        }
    }).catch(err =>{

        reject(err)
    })
}
function getMusicUrl(content){
    return axios({
        data:{"content":content}, //参数
        method: 'POST',
        url:'http://localhost:3000/process_generate_music',
        responseType: 'json',
        timeout: 1000*6,
    }).then( res =>{
        console.log('getMusicUrl',res)
        const {code ,data,message} = res?.data || {}
        if(code == 200){
            return data
        }else{
            console.log('getMusicUrl',message)
        }
    }).catch(err =>{

        reject(err)
    })
}


//1. 用于接收识别后的文本接口
function sentTextF(content){
    return axios({
        data:{"content":content}, //参数
        method: 'POST',
        url:'http://localhost:3000/back_end_control',
        responseType: 'json',
        timeout: timeout, // 默认值是 `0` (永不超时)
    }).then( res =>{

    }).catch(err =>{

        reject(err)
    })
}


//2. 用于检测程序是否挂掉的接口
function checkProcessF(content){
    return axios({
        data:{"content":content}, //参数
        method: 'POST',
        url:'http://localhost:3000/check_process',
        responseType: 'json',
        timeout: timeout, // 默认值是 `0` (永不超时)
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
function receiveGpsF(content){
    return axios({
        data:{"content":content}, //参数
        method: 'POST',
        url:'http://localhost:3000/gps',
        responseType: 'json',
        timeout: timeout, // 默认值是 `0` (永不超时)
    }).then( res =>{

    }).catch(err =>{
        reject(err)
    })
}
    

//4. 用于接收电子围栏
function receiveGpsAreaF(content){
    return axios({
        data:{"content":content}, //参数
        method: 'POST',
        url:'http://localhost:3000/gps/area',
        responseType: 'json',
        timeout: timeout, // 默认值是 `0` (永不超时)
    }).then( res =>{
    
    }).catch(err =>{
        reject(err)
    })
}




