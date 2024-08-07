// 修正后的 debounce 函数
export function debounce(func, delay) {
    let timeoutId = null; // 初始化为 null

    return function() {
        const context = this;
        const args = arguments;

        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            // console.log('debounce执行');
            func.apply(context, args);
        }, delay);
    };
}

//一个字符串中是否包含中文字符 且个数超过n个
export function hasNChinese(str,n) {
    // 使用正则表达式判断是否包含中文字符
    const chineseRegex = /[\u4E00-\u9FA5]/; // 匹配中文的正则表达式范围
    let chineseCount = 0;

    // 遍历字符串，计算中文字符的个数
    for (let i = 0; i < str.length; i++) {
        if (chineseRegex.test(str[i])) {
            chineseCount++;
        }
    }

    // 判断中文字符个数是否超过n个
    return chineseCount > n;
}


// 格式化当前时间 输出的函数
export function formatNowTime(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    
    return `${hours}:${minutes}:${seconds}`;
}


//判断最后是 。结尾移除
export function removeTrailingPeriod(str) {
    // 假设 "Noise" 是需要去除的子字符串，使用 replace() 方法将其替换为空字符串
    str = str.replace("Noise", "");

    // 使用 trim() 方法去除字符串两端的空格（如果有的话）
    str = str.trim();
    // 判断字符串是否以中文句号结尾（Unicode编码为 \u3002）
    // if (str.endsWith('。')) {
    //     // 使用 slice() 方法移除最后一个字符（即中文句号）
    //     return str.slice(0, -1);
    // }
    if(!lastCharacterIsChinese(str)){
        return str.slice(0, -1);
    } 
    else {
        return str; // 如果不是以中文句号结尾，直接返回原字符串
    }
}

//判断最后字符是否是中文 是中文字符输出true
function lastCharacterIsChinese(str) {
    // 获取字符串的最后一个字符
    let lastChar = str.charAt(str.length - 1);

    // 使用正则表达式匹配是否是中文字符
    return /[\u4e00-\u9fa5]/.test(lastChar);//是输出true
}