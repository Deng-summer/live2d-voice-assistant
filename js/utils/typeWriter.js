// function typeWriter(index, str) {
//   // 通过闭包保存当前的索引和字符串
//   let text = str;
//   let currentIndex = index
//   // 使用 setInterval 定时器来实现每50ms输出一个字符
//   let intervalId = setInterval(function() {
//       // 索引递增
//       currentIndex++;
//       console.log(currentIndex,text.length)
//       // typeWriter_Inx = 
//       $('.dialog-answer-p').html(text.substr(0, currentIndex + 1)).fadeTo(100, 1);
//       // 如果已经输出完最后一个字符，则清除定时器
//       if (currentIndex >= text.length) {
//         clearInterval(intervalId);
//       }
//   }, 200);
// }

let typeWriter_timer_arr = []
let typeWriter_answer_format = []
let typeWriter_Inx = 0;


export function typeWriter_formatAnswer(origin_answer){
  // let answer_origin = [
  //   '你好',
  //   '你好，我是小仙女',
  //   '你好,我是小仙女，请问你是'
  // ]
  if(origin_answer == ''){
    typeWriter_timer_arr?.map(item=>{
      clearTimeout(item)
    })
    typeWriter_timer_arr = []
    typeWriter_answer_format = []
    typeWriter_Inx = 0
    $('.dialog-answer-p')[0].innerText = origin_answer
    
  }else{
    let str = origin_answer
    // 遍历原始字符串的每个字符
    let temp = ''
    for (let i = 0; i < str.length; i++) {
      temp += str[i]; // 逐步构建新的字符串
      if (!typeWriter_answer_format.includes(temp)) {
        typeWriter_answer_format.push(temp); // 将构建的字符串添加到格式数组中（确保不重复添加）

        let timer = setTimeout(()=>{
          $('.dialog-answer-p')[0].innerText = typeWriter_answer_format[typeWriter_Inx++];
          // console.log(typeWriter_Inx)
        },100 * typeWriter_answer_format.length)
        typeWriter_timer_arr.push(timer)
      }
    }
  }
}
export function changeQuestionText(question){
  $('.dialog-question')[0].innerText = question
}

