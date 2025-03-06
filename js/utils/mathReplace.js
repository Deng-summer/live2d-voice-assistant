export function replacCircle(str) {
    return str.replace(/\$\^{circ}\$/g, '°');
}

export function containsLatex(text) {
    // 正则表达式匹配行内公式和块级公式
    const inlineRegex = /(\$.*?\$)|\\\(.*?\\\)/; // 行内公式
    const blockRegex = /(\$\$.*?\$\$)|\\\[.*?\\\]/; // 块级公式

    return inlineRegex.test(text) || blockRegex.test(text);
}