export function replacCircle(str) {
    return str.replace(/\$\^{?\\?circ\}?}\$C/g, '°')

}

// let str2 = '金华市，今天：阴，最低温度 8$^{circ}$C，最高温度 17$^{\\circ}$C，空气质量良，pm2.5 指数 61，湿度 53，西风 3 级。'

export function containsLatex(text) {
    // 正则表达式匹配行内公式和块级公式
    const inlineRegex = /(\$.*?\$)|\\\(.*?\\\)/; // 行内公式
    const blockRegex = /(\$\$.*?\$\$)|\\\[.*?\\\]/; // 块级公式

    return inlineRegex.test(text) || blockRegex.test(text);
}
// containsLatex(str2)
// replacCircle(str2)