/**
 * 豆包唤醒词控制配置
 *
 * 这个文件包含所有可配置的开关和参数
 */

export const WAKEUP_CONFIG = {
    // 是否显示唤醒提示（屏幕中央的大提示框）
    SHOW_WAKEUP_HINT: true,  // 默认关闭

    // 是否显示右下角的唤醒词控制按钮
    SHOW_WAKEUP_BUTTON: false,  // 默认关闭

    // 是否启用按键D快捷键
    ENABLE_KEY_D_SHORTCUT: false,  // 默认关闭

    // 是否启用页面加载后自动启动唤醒检测
    AUTO_START_ON_LOAD: true,  // 默认打开

    // 自动启动延迟时间（毫秒）
    AUTO_START_DELAY: 3000,  // 秒

    // 多轮对话退出后是否自动重启唤醒检测
    AUTO_RESTART_AFTER_MULTI: true,  // 默认打开

    // 是否在控制台输出调试信息
    DEBUG: true,
}

/**
 * 不同状态下的提示文字配置
 */
export const STATUS_MESSAGES = {
    // BUS 模式 - 等待唤醒
    BUS_WAITING: {
        question: '',
        answer: '你好！我是湖宝 🚌',
    },

    // BUS 模式 - 唤醒检测未启动
    BUS_NOT_STARTED: {
        question: '',
        answer: '你好！我是湖宝 🚌',
    },

    // READY 模式 - 准备接收指令
    READY: {
        question: '我在听，请说话...',
        answer: '试试说"跟我聊聊天"或"给我唱首歌"',
    },

    // MULTI 模式 - 连续对话中
    MULTI: {
        question: '连续对话模式已开启',
        answer: '你可以连续说话，说"退下"结束对话',
    },

    // SINGEL 模式 - 单轮对话
    SINGEL: {
        question: '正在处理你的问题...',
        answer: '请稍等，我正在思考',
    },

    // MUSIC 模式 - 音乐播放
    MUSIC: {
        question: '',
        answer: '🎵音乐生成中 ...',
    },
}

/**
 * 获取当前状态的提示文字
 * @param {string} mode - 当前模式
 * @param {boolean} wakeupActive - 唤醒检测是否激活
 * @returns {Object} 包含 question 和 answer 的对象
 */
export function getStatusMessage(mode, wakeupActive) {
    if (mode === 'BUS') {
        return wakeupActive ? STATUS_MESSAGES.BUS_WAITING : STATUS_MESSAGES.BUS_NOT_STARTED
    }
    return STATUS_MESSAGES[mode] || STATUS_MESSAGES.BUS_WAITING
}
