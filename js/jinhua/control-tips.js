/**
 * 金华状态提示系统
 *
 * 根据不同模式显示友好的引导提示，帮助用户了解当前状态和可以做什么
 */

// 提示文字配置
const STATUS_TIPS = {
    BUS: {
        main: '睡眠模式 💤',
        sub: '你可以喊醒我："湖宝湖宝"',
        examples: [
            '💡 说"湖宝湖宝"唤醒我',
        ]
    },
    READY: {
        main: '我在听，请说话 👂',
        sub: '你可以问我问题，或让我唱歌、播放音乐',
        examples: [
            '💬 "今天天气怎么样？"',
            '🎵 "给我唱首关于金华的歌"',
            '🎶 "播放音乐"',
            '💭 "湖宝，跟我聊聊天"',
            '👋 说"退下"结束对话'
        ]
    },
    SINGEL: {
        main: '正在思考中... 🤔',
        sub: '马上为你解答',
        examples: []
    },
    MULTI_ASKING: {
        main: '对话模式 💬',
        sub: '我会记住我们的对话内容，继续聊吧',
        examples: [
            '💬 继续提问吧~，例如"你叫什么名字？"',
            '💬 介绍关于金华的历史文化',
            '💬 介绍金华的旅游景点',
            '💬 介绍金华的美食',
            '💬 介绍金华的投资政策',
            '💬 介绍一下湖心岛',
            '💬 介绍一下秋枫港',
            '💬 介绍金华的民间故事',
            '💬 介绍金华的民间传说',
            '💬 介绍金华的民间习俗',
            '🎵 播放金华的相关音乐',
            '👋 说"退下吧"结束对话'
        ]
    },
    MULTI_GENERATING: {
        main: '正在思考回答... 🤔',
        sub: '请稍等，我正在为你生成回复',
        examples: []
    },
    MULTI_TALKING: {
        main: '正在回复中... 💬',
        sub: '请听我说完',
        examples: []
    },
    MUSIC: {
        main: '音乐模式 🎵',
        sub: '正在为你播放音乐',
        examples: [
            '别着急，请等待音乐播放完成~'
        ]
    },
    LISTENING: {
        main: '正在监听唤醒词... 👂',
        sub: '说"湖宝湖宝"来唤醒我',
        examples: []
    }
}

// 当前显示的提示
let currentTip = null
let tipTimeout = null

/**
 * 显示状态提示
 *
 * @param {string} mode - 模式名称（BUS, READY, SINGEL, MULTI_ASKING, MULTI_GENERATING, MULTI_TALKING, MUSIC）
 * @param {number} duration - 显示时长（毫秒），0 表示一直显示
 */
export function showStatusTip(mode, duration = 0) {
    const tip = STATUS_TIPS[mode]
    if (!tip) {
        console.warn('未知的模式:', mode)
        return
    }

    currentTip = mode

    // 更新主提示
    const tipsElement = document.querySelector('.waifu-tips')
    if (tipsElement) {
        // 构建提示内容
        let html = `<div class="status-tip-main">${tip.main}</div>`
        html += `<div class="status-tip-sub">${tip.sub}</div>`

        if (tip.examples && tip.examples.length > 0) {
            html += '<div class="status-tip-examples">'
            tip.examples.forEach(example => {
                html += `<div class="status-tip-example">${example}</div>`
            })
            html += '</div>'
        }

        tipsElement.innerHTML = html
        tipsElement.style.opacity = '1'
        tipsElement.style.visibility = 'visible'

        // 添加动画效果
        tipsElement.classList.add('tip-fade-in')
        setTimeout(() => {
            tipsElement.classList.remove('tip-fade-in')
        }, 300)
    }

    // 清除之前的定时器
    if (tipTimeout) {
        clearTimeout(tipTimeout)
        tipTimeout = null
    }

    // 如果设置了显示时长，自动隐藏
    if (duration > 0) {
        tipTimeout = setTimeout(() => {
            hideStatusTip()
        }, duration)
    }
}

/**
 * 隐藏状态提示
 */
export function hideStatusTip() {
    const tipsElement = document.querySelector('.waifu-tips')
    if (tipsElement) {
        tipsElement.classList.add('tip-fade-out')
        setTimeout(() => {
            tipsElement.style.opacity = '0'
            tipsElement.style.visibility = 'hidden'
            tipsElement.classList.remove('tip-fade-out')
        }, 300)
    }

    currentTip = null
}

/**
 * 显示临时消息
 *
 * @param {string} message - 消息内容
 * @param {number} duration - 显示时长（毫秒）
 */
export function showTempMessage(message, duration = 2000) {
    const tipsElement = document.querySelector('.waifu-tips')
    if (tipsElement) {
        tipsElement.innerHTML = `<div class="status-tip-temp">${message}</div>`
        tipsElement.style.opacity = '1'
        tipsElement.style.visibility = 'visible'

        // 清除之前的定时器
        if (tipTimeout) {
            clearTimeout(tipTimeout)
        }

        // 自动恢复之前的提示
        tipTimeout = setTimeout(() => {
            if (currentTip) {
                showStatusTip(currentTip)
            } else {
                hideStatusTip()
            }
        }, duration)
    }
}

/**
 * 显示唤醒词监听状态
 */
export function showWakeupListening() {
    showStatusTip('LISTENING')
}

/**
 * 显示唤醒成功消息
 */
export function showWakeupSuccess() {
    showTempMessage('✓ 唤醒成功！请说话...', 1500)
}

/**
 * 显示错误消息
 *
 * @param {string} message - 错误消息
 */
export function showErrorMessage(message) {
    showTempMessage(`❌ ${message}`, 3000)
}

/**
 * 根据模式自动显示提示
 *
 * @param {string} mode - 模式名称
 */
export function autoShowTipForMode(mode) {
    switch (mode) {
        case 'BUS':
            showStatusTip('BUS')
            break
        case 'READY':
            showStatusTip('READY')
            break
        case 'SINGEL':
            showStatusTip('SINGEL', 3000) // 3秒后自动隐藏
            break
        case 'MULTI':
            // 兼容旧的 MULTI 模式，映射到 MULTI_ASKING
            showStatusTip('MULTI_ASKING')
            break
        case 'MULTI_ASKING':
            showStatusTip('MULTI_ASKING')
            break
        case 'MULTI_GENERATING':
            showStatusTip('MULTI_GENERATING', 5000) // 5秒后自动隐藏
            break
        case 'MULTI_TALKING':
            showStatusTip('MULTI_TALKING')
            break
        case 'MUSIC':
            showStatusTip('MUSIC')
            break
        default:
            console.warn('未知的模式:', mode)
    }
}
