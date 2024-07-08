function typeWriter(index, str) {
  // 通过闭包保存当前的索引和字符串
  let text = str;
  let currentIndex = index
  // 使用 setInterval 定时器来实现每50ms输出一个字符
  let intervalId = setInterval(function() {
      // 索引递增
      currentIndex++;
      $('.dialog-answer-p').html(text.substr(0, currentIndex + 1)).fadeTo(100, 1);
      // 如果已经输出完最后一个字符，则清除定时器
      if (currentIndex === text.length) {
        clearInterval(intervalId);
      }
  }, 80);
}
