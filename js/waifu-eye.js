function eyeMove(clientX,clientY){
    var targetElement = document.getElementById('live2dpage'); // 替换成您要触发事件的元素的ID
    var event = new MouseEvent('mousemove', {
        'view': window,
        'bubbles': false,
        'cancelable': true,
        'clientX': clientX,
        'clientY': clientY
    });
    // 触发鼠标移动事件
    targetElement.dispatchEvent(event);

    // 获取页面宽度和高度
    // var pageWidth = window.innerWidth;
    // var pageHeight = window.innerHeight;
    // 模拟鼠标移动的函数
    // function simulateMouseMove() {
    //     // 生成随机的鼠标坐标
    //     var x = Math.floor(Math.random() * pageWidth);
    //     var y = Math.floor(Math.random() * pageHeight);
    //     // 创建鼠标移动事件
    //     var event = new MouseEvent('mousemove', {
    //         'view': window,
    //         'bubbles': true,
    //         'cancelable': true,
    //         'clientX': x,
    //         'clientY': y
    //     });
    //     // 触发鼠标移动事件
    //     document.dispatchEvent(event);
    // }

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
    // var element = document;
    // // 添加鼠标移动事件监听器
    // element.addEventListener('mousemove', function(event) {
    //     // console.log('位置',event.clientX,event.clientY)
    //     // 当鼠标移动时触发的操作
    // })
}