function eyeMove(clientX,clientY){
    var event = new MouseEvent('mousemove', {
        'view': window,
        'bubbles': true,
        'cancelable': true,
        'clientX': clientX,
        'clientY': clientY
    });
    // 触发鼠标移动事件
    document.dispatchEvent(event);

    // 获取页面宽度和高度
    // var pageWidth = window.innerWidth;
    // var pageHeight = window.innerHeight;

    // 模拟鼠标移动的函数
    function simulateMouseMove() {
        // 生成随机的鼠标坐标
        var x = Math.floor(Math.random() * pageWidth);
        var y = Math.floor(Math.random() * pageHeight);
        // 创建鼠标移动事件
        var event = new MouseEvent('mousemove', {
            'view': window,
            'bubbles': true,
            'cancelable': true,
            'clientX': x,
            'clientY': y
        });
        // 触发鼠标移动事件
        document.dispatchEvent(event);
    }

    // 模拟鼠标移动的定时器，每隔一段时间触发一次
    // var moveInterval = setInterval(simulateMouseMove, 1000);
    // 在10秒后停止模拟鼠标移动
    // setTimeout(function() {
    //     clearInterval(moveInterval); // 停止定时器
    // }, 10000);
    // 停止模拟鼠标移动，清除定时器
    // function stopSimulateMouseMove() {
    //     clearInterval(moveInterval);
    // }
    var element = document;
    // 添加鼠标移动事件监听器
    element.addEventListener('mousemove', function(event) {
        // console.log('位置',event.clientX,event.clientY)
    // 当鼠标移动时触发的操作
    })
}

function showMessage(text, timeout, flag) {
    // console.log(101,text)
    if(flag || sessionStorage.getItem('waifu-text') === '' || sessionStorage.getItem('waifu-text') === null){
        if(Array.isArray(text)) text = text[Math.floor(Math.random() * text.length + 1)-1];
        // if (live2d_settings.showF12Message) console.log('[Message]', text.replace(/<[^<>]+>/g,''));
        if(flag) sessionStorage.setItem('waifu-text', text);
        
        $('.waifu-tips').stop();
        $('.waifu-tips').html(text).fadeTo(200, 1);
        if (timeout === undefined) timeout = 5000;
        hideMessage(timeout);
    }
}

function hideMessage(timeout) {
    $('.waifu-tips').stop().css('opacity',1);
    if (timeout === undefined) timeout = 5000;
    window.setTimeout(function() {sessionStorage.removeItem('waifu-text')}, timeout);
    $('.waifu-tips').delay(timeout).fadeTo(200, 0);
}