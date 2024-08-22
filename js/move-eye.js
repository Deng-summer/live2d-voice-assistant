
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
    // console.log(clientX, clientY)
    model.focus(clientX, clientY)
}

// setInterval(()=>{
//     eyeMove(window.innerWidth/2,window.innerHeight*0.5)
// },3000)