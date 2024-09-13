import { chunkMultiReceived } from './control-multi-talk.js'
import { chunkSingelReceived } from './control-singel-talk.js'

//金华 接口
export const control_request_stream = {
    getDialogue:getDialogue,
    getMultiDialogue:getMultiDialogue,
}

const timeout = 8000 //接口超时时间
// const base_url = 'http://localhost:3000' //node_webservice测试环境
// const base_url = 'http://1.95.87.50:9000' //生产环境 panke
const base_url ='https://avatar.chekkk.com/ai' //生产环境 小巴域名


function getDialogue(content,sentiment){
    return new Promise(async (resolve,reject)=>{
        
        const abortController = new AbortController();
        const signal = abortController.signal;

        const timeoutId = setTimeout(() => {
            abortController.abort(); // 在超时后中止请求
            reject('getDialogue超时')
            timeoutId && clearTimeout(timeoutId)
        }, timeout); // 设置超时时间为 10 秒（单位为毫秒）

        try {
            //fetch不需要额外设置流式参数
            const requestOptions = {
                method: 'POST',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json' // 根据服务器要求的内容类型进行调整
                },
                // 如果需要发送数据，可以将数据转换为 JSON 字符串或者其他格式
                body: JSON.stringify({
                    // 可根据服务器要求的格式设置具体的数据
                    content: content,
                    sentiment:sentiment
                }),
                signal: signal
            };
            try {
                let response = await fetch(base_url+'/process_dialogue', requestOptions)
                timeoutId && clearTimeout(timeoutId); // 在请求成功返回后清除超时计时器
                if (!response.ok) {
                    reject('请求失败')
                    throw new Error('Network response was not ok');
                }
            
                const reader = response.body.getReader();
                const textDecoder = new TextDecoder();
                let output = '';
                
                function readChunk() {
                    return reader.read().then(({ done, value }) => {
                        if (done) {
                            // console.log('Stream ended 流式包结束帧');
                            resolve('Stream ended 流式包结束帧')
                            return;
                        }
                        const chunkText = textDecoder.decode(value, { stream: true });
                        output += chunkText;
                        // console.log('Received chunk:', chunkText);
                        chunkSingelReceived(output)
                        return readChunk(); // 继续读取下一个块
                    }).catch((err) => {
                        console.error('读取流时发生错误')
                        // 处理读取流时的错误
                        reject(`读取流时发生错误: ${err?.message}`);
                    });
                }
                return readChunk();
            } catch (e) {
                reject(e)
            }
        }
        catch (error) {
            timeoutId && clearTimeout(timeoutId)
            reject(error)
        }
    })
}



function getMultiDialogue(content,sentiment){
    
    const abortController = new AbortController();
    const signal = abortController.signal;

    return new Promise(async (resolve,reject)=>{

        const timeoutId = setTimeout(() => {
            abortController.abort(); // 在超时后中止请求
            timeoutId && clearTimeout(timeoutId); 
            reject('getMultiDialogue超时')
        }, timeout); // 设置超时时间为 10 秒（单位为毫秒）

        try {
            //fetch不需要额外设置流式参数
            const requestOptions = {
                method: 'POST',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json' // 根据服务器要求的内容类型进行调整
                },
                // 如果需要发送数据，可以将数据转换为 JSON 字符串或者其他格式
                body: JSON.stringify({
                    // 可根据服务器要求的格式设置具体的数据
                    content: content,
                    sentiment: sentiment
                }),
                signal: signal
            };
            try {
                let response = await fetch(base_url + '/process_continue_dialogue', requestOptions)

                timeoutId && clearTimeout(timeoutId); // 在请求成功返回后清除超时计时器
                if (!response.ok) {
                    reject('请求失败')
                    throw new Error('Network response was not ok');
                }
            
                const reader = response.body.getReader();
                const textDecoder = new TextDecoder();
                let output = '';
                
                function readChunk() {
                    return reader.read().then(({ done, value }) => {
                        if (done) {
                            // console.log('Stream ended 流式包结束帧');
                            resolve('Stream ended 流式包结束帧')
                            return;
                        }
                        const chunkText = textDecoder.decode(value, { stream: true });
                        output += chunkText;
                        // console.log('Received chunk:', chunkText);
                        chunkMultiReceived(output)
                        return readChunk(); // 继续读取下一个块
                    }).catch((err) => {
                        console.error('读取流时发生错误')
                        // 处理读取流时的错误
                        reject(`读取流时发生错误: ${err?.message}`);
                    });
                }
    
                return readChunk();
            } catch (e) {
                reject(e)
            }
        }
        catch (error) {
            timeoutId && clearTimeout(timeoutId); 
            reject(error)
        }
    })
}




