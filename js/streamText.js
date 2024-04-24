//流式文字

function streamShowText(text){
    // $('.dialog-question').html(text).fadeTo(200, 1);
    const $dialog = $('.dialog-question');
    $dialog.html(''); // 清空原有内容
    let index = 0;
    let timer = null
    function typeWriter() {
        if (index < text.length) {
            $dialog.append(text.charAt(index))
            index++;
            timer = setTimeout(typeWriter, 80); // 50ms 后再次调用 typeWriter 函数
        }else{
            clearInterval(timer)
            timer = null
        }
    }
    typeWriter(); // 开始打字效果
}
document.addEventListener("DOMContentLoaded", function() {
    streamShowText("我是魔法小仙女");
});
