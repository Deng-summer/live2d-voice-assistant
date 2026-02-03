/**
 * 豆包唤醒词检测配置文件
 *
 * 此文件包含所有可配置项，便于统一管理和调整
 */

// 导入凭证配置
// 注意：首次使用需要复制 doubao-credentials.example.js 为 doubao-credentials.js 并填入真实凭证
import { DOUBAO_CREDENTIALS } from './doubao-credentials.js'

export const DOUBAO_CONFIG = {
    // ==================== WebSocket配置 ====================
    // 豆包语音识别服务地址（双向流式优化版本）
    // 根据官方文档，浏览器环境通过 URL 参数鉴权（不需要代理）
    WS_URL: 'wss://openspeech.bytedance.com/api/v3/sauc/bigmodel_async',

    // ==================== 鉴权信息 ====================
    // 从独立配置文件读取凭证
    ...DOUBAO_CREDENTIALS,

    // ==================== 唤醒词配置 ====================
    // 主唤醒词
    WAKEUP_WORD: '湖宝湖宝',

    // 支持的唤醒词列表（模糊匹配）
    WAKEUP_KEYWORDS: ['湖宝湖宝', '湖宝', '胡宝胡宝'],

    // 是否启用自定义唤醒词（预留功能）
    CUSTOM_WAKEUP_ENABLED: false,

    // 自定义唤醒词（预留）
    CUSTOM_WAKEUP_WORD: '',

    // ==================== 音频配置 ====================
    // 音频格式
    AUDIO_FORMAT: 'pcm',

    // 采样率（Hz）
    AUDIO_RATE: 16000,

    // 采样位数
    AUDIO_BITS: 16,

    // 声道数（1=单声道，2=立体声）
    AUDIO_CHANNEL: 1,

    // 音频分包大小（毫秒）- 200ms性能最优
    AUDIO_CHUNK_DURATION: 200,

    // ==================== 识别配置 ====================
    // 启用文本规范化（ITN）
    ENABLE_ITN: true,

    // 启用标点符号
    ENABLE_PUNC: false,

    // 启用语义顺滑
    ENABLE_DDC: false,

    // 结果返回方式（single=增量返回，full=全量返回）
    RESULT_TYPE: 'single',

    // 启用首字加速
    ENABLE_ACCELERATE_TEXT: true,

    // 首字加速率（0-20，越大越快）
    ACCELERATE_SCORE: 15,

    // 强制判停时间（毫秒）
    END_WINDOW_SIZE: 800,

    // ==================== 资源控制 ====================
    // 是否启用暂停功能
    PAUSE_ENABLED: true,

    // 是否启用定时控制
    SCHEDULE_ENABLED: true,

    // 定时停止时间（24小时制，如 '22:00'）
    SCHEDULE_STOP_TIME: '22:00',

    // 定时开始时间（24小时制，如 '08:00'）
    SCHEDULE_START_TIME: '08:00',

    // ==================== 成本控制 ====================
    // 是否启用使用统计
    STATS_ENABLED: true,

    // 是否启用上限控制
    LIMIT_ENABLED: true,

    // 每日最大监听时长（毫秒）- 默认8小时
    DAILY_MAX_DURATION: 8 * 60 * 60 * 1000,

    // 每日最大唤醒次数
    DAILY_MAX_WAKEUP_COUNT: 100,

    // ==================== 错误处理 ====================
    // 失败时是否降级到键盘唤醒
    FALLBACK_TO_KEYBOARD: true,

    // 是否启用自动重试
    RETRY_ENABLED: true,

    // 重试次数
    RETRY_COUNT: 3,

    // 重试间隔（毫秒）
    RETRY_INTERVAL: 3000,

    // 是否显示连接状态
    SHOW_STATUS: true,

    // ==================== 总开关 ====================
    // 是否启用豆包唤醒（总开关）
    WAKEUP_ENABLED: true,

    // ==================== 调试配置 ====================
    // 是否启用调试日志
    DEBUG: true,

    // 日志前缀
    LOG_PREFIX: '[豆包唤醒]',
}

/**
 * 获取热词配置（用于API请求）
 */
export function getHotwordsConfig() {
    const hotwords = DOUBAO_CONFIG.WAKEUP_KEYWORDS.map(word => ({ word }))
    return JSON.stringify({ hotwords })
}

/**
 * 验证配置是否完整
 */
export function validateConfig() {
    const errors = []

    if (!DOUBAO_CONFIG.APP_KEY) {
        errors.push('APP_KEY 未配置')
    }

    if (!DOUBAO_CONFIG.ACCESS_KEY) {
        errors.push('ACCESS_KEY 未配置')
    }

    if (!DOUBAO_CONFIG.RESOURCE_ID) {
        errors.push('RESOURCE_ID 未配置')
    }

    if (errors.length > 0) {
        console.error(`${DOUBAO_CONFIG.LOG_PREFIX} 配置错误：`)
        errors.forEach(err => console.error(`  - ${err}`))
        console.error('请参考 doubao-credentials.example.js 配置凭证')
        return false
    }

    return true
}

/**
 * 打印配置信息（隐藏敏感信息）
 */
export function printConfig() {
    if (!DOUBAO_CONFIG.DEBUG) return

    console.log(`${DOUBAO_CONFIG.LOG_PREFIX} 配置信息：`)
    console.log('  WebSocket:', DOUBAO_CONFIG.WS_URL)
    console.log('  APP_KEY:', DOUBAO_CONFIG.APP_KEY ? '✓ 已配置' : '✗ 未配置')
    console.log('  ACCESS_KEY:', DOUBAO_CONFIG.ACCESS_KEY ? '✓ 已配置' : '✗ 未配置')
    console.log('  RESOURCE_ID:', DOUBAO_CONFIG.RESOURCE_ID)
    console.log('  唤醒词:', DOUBAO_CONFIG.WAKEUP_WORD)
    console.log('  支持的唤醒词:', DOUBAO_CONFIG.WAKEUP_KEYWORDS.join(', '))
    console.log('  暂停功能:', DOUBAO_CONFIG.PAUSE_ENABLED ? '启用' : '禁用')
    console.log('  定时控制:', DOUBAO_CONFIG.SCHEDULE_ENABLED ? '启用' : '禁用')
    console.log('  使用统计:', DOUBAO_CONFIG.STATS_ENABLED ? '启用' : '禁用')
    console.log('  上限控制:', DOUBAO_CONFIG.LIMIT_ENABLED ? '启用' : '禁用')
}
