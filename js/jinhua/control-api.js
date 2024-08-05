//金华 接口
export const control_request = {
    sendText:sentTextF,
    checkProcess:checkProcessF,
    receiveGps:receiveGpsF,
    receiveGpsArea:receiveGpsAreaF,
    getDialogue:getDialogue,
    getMultiDialogue:getMultiDialogue,
    getMusic:getMusic,
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
function getMusic(){
    return axios({
        data:{content:''}, //参数
        method: 'POST',
        url:'process_generate_music',
        responseType: 'json',
        timeout: timeout,
    }).then( res =>{
        console.log('getMusic',res)
    }).catch(err =>{

        reject(err)
    })
}


//1. 用于接收识别后的文本接口
function sentTextF(){
    return axios({
        data:{"content":''}, //参数
        method: 'POST',
        url:'back_end_control',
        responseType: 'json',
        timeout: timeout, // 默认值是 `0` (永不超时)
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
function receiveGpsF(){
    return axios({
        data:{content:''}, //参数
        method: 'POST',
        url:'gps',
        responseType: 'json',
        timeout: timeout, // 默认值是 `0` (永不超时)
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
        responseType: 'json',
        timeout: timeout, // 默认值是 `0` (永不超时)
    }).then( res =>{
    
    }).catch(err =>{
        reject(err)
    })
}




