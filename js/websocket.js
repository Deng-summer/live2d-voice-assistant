let socket; // WebSocket 对象
// const url = 'ws://192.168.192.10:7999/ws'; // WebSocket 服务器地址
const url = 'ws://127.0.0.1:7999/ws'; // 本地WebSocket 服务器地址
// const url = 'ws://192.168.192.13:7999/ws'; // 本地WebSocket 服务器地址

let reconnectInterval = 1000; // 重连间隔时间，单位：毫秒
let maxReconnectInterval = 30000; // 最大重连间隔时间，单位：毫秒
let socketText = ''

function connect() {
    socket = new WebSocket(url); // 创建 WebSocket 连接
    // 连接打开时触发
    socket.onopen = function(event) {
        console.log('ws WebSocket连接已打开');
        // showMessage('WebSocket连接已打开', 10000); 
    };

    // 接收到消息时触发
    socket.onmessage = function(event) {
        let temp = event.data
        console.log('ws 消息', temp);
        let question = temp && JSON.parse(JSON.parse(temp)).question
        let answer = temp && JSON.parse(JSON.parse(temp)).answer
        //流式输出
        // streamShowText2($('.dialog-question'),question)
        // streamShowText2($('.dialog-answer-p'),answer)

        $('.dialog-question').html(question).fadeTo(100, 1);
        $('.dialog-answer-p').html(answer).fadeTo(100, 1);
        // showMessage(socketText, 5000); 
    };

    // 连接关闭时触发
    socket.onclose = function(event) {
        console.log('WebSocket连接已关闭');
        // 触发重连逻辑
        reconnect();
    };

    // 发生错误时触发
    socket.onerror = function(event) {
        console.error('WebSocket连接出错：', event);
        // 触发重连逻辑
        reconnect();
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

function showWKText(text, timeout, flag) {
    // console.log(101,text)
    $('.waifu-tips').stop();
    $('.waifu-tips').html(text).fadeTo(200, 1);
    $('.dialog-question').html(text).fadeTo(200, 1);
    $('.dialog-answer-p').html(text).fadeTo(200, 1);
    if (timeout === undefined) timeout = 5000;
}
// 在页面关闭之前执行销毁操作
window.addEventListener('beforeunload', function(event) {
    disconnect(); // 页面关闭前销毁 WebSocket 连接
});


