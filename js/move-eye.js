
function eyeMove(clientX,clientY){
    // console.log('eyeMove',clientX,clientY)
    var event = new MouseEvent('mousemove', {
        'view': window,
        'bubbles': false,
        'cancelable': true,
        'clientX': clientX,
        'clientY': clientY
    });
    // 触发鼠标移动事件
    // document.dispatchEvent(event);
    model.focus(clientX, clientY)

}