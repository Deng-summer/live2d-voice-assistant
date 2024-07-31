let socket; // WebSocket 对象
// const url = 'ws://192.168.192.10:7999/ws'; // WebSocket 服务器地址
// const url = 'ws://127.0.0.1:7999/ws'; // 本地WebSocket 服务器地址
const url = 'ws://127.0.0.1:8080/ws'; // 本地node js WebSocket 服务器地址
// const url = 'ws://192.168.192.13:7999/ws_chat'; // 本地WebSocket 服务器地址

let reconnectInterval = 1000; // 重连间隔时间，单位：毫秒
let maxReconnectInterval = 30000; // 最大重连间隔时间，单位：毫秒
let socketText = ''

function connect() {
    socket = new WebSocket(url); // 创建 WebSocket 连接
    // 连接打开时触发
    socket.onopen = function(event) {
        console.log('ws WebSocket连接已打开');
        showEleMessage('ws WebSocket连接已打开','success')

        // alert('connect success')
        // showMessage('WebSocket连接已打开', 1000); 
        // "{\"session_id\": \"start\"}"
        // socket.send(JSON.stringify({'session_id':'start'}))
        socket.send("{\"session_id\": \"start\"}")
        //test 调试
        // socket.send("{\"traceId\": \"finish\"}")
    };

    // 接收到消息时触发
    socket.onmessage = function(event) {
        let temp = event.data
        // console.log('ws 消息', temp);
        let parse_temp = temp ? JSON.parse(JSON.parse(temp)) : {}
        if(parse_temp.question ){
            let question = temp && parse_temp.question
            //正常输出
            $('.dialog-question').html(question).fadeTo(100, 1);
            // showMessage(socketText, 5000); 
            $('.dialog-answer-p').html('').fadeTo(100, 1);
            //清空回答数组
            typeWriter_formatAnswer('')
        }else if(parse_temp.answer){
            let answer = temp && parse_temp.answer
            //流式滚动输出
            if(answer){
                typeWriter_formatAnswer(answer)
            }
            //直接输出
            // $('.dialog-answer-p').html(answer).fadeTo(100, 1);
        }
        else if(parse_temp.filepath){
            let path = parse_temp.filepath
            //autdioLoad中处理 音频
            handleAudioMesage(path) //autdioLoad中处理
        }
        else if(parse_temp.status){
            // alert(parse_temp.status)
            let notify = null
            if(parse_temp.status === '主动聆听'){
                $('#listen-desc').show();
                notify = showEleMessage('正在听...','success',1000)
            }else{
                $('#listen-desc').hide();
                notify?.close()
                if(parse_temp.status === '唤醒成功'){
                    showEleMessage('唤醒成功','success')
                }
            }
        }
    };

    // 连接关闭时触发
    socket.onclose = function(event) {
        console.log('ws WebSocket连接已关闭');
        showEleMessage('ws WebSocket连接被关闭','error')
        // 触发重连逻辑
        // reconnect();
    };

    // 发生错误时触发
    socket.onerror = function(event) {
        console.error('ws WebSocket连接出错：', event);
        // alert('ws WebSocket连接出错')
        showEleMessage('ws WebSocket连接出错','error')
        // 触发重连逻辑
        // reconnect();
    };
}

function reconnect() {
    // 重连间隔递增
    reconnectInterval = Math.min(2 * reconnectInterval, maxReconnectInterval);
    console.log(`尝试在 ${reconnectInterval} 毫秒后重连...`);
    
    // 在重连间隔后尝试重新连接
    setTimeout(function() {
        connect();
    }, reconnectInterval);
}
// 销毁 WebSocket 连接
function disconnect() {
    if (socket) {
        socket.close(); // 关闭 WebSocket 连接
        console.log('WebSocket 连接已销毁');
    }
}

// 在页面关闭之前执行销毁操作
window.addEventListener('beforeunload', function(event) {
    disconnect(); // 页面关闭前销毁 WebSocket 连接
});

