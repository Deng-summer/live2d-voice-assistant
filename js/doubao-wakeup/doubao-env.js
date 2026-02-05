/**
 * 豆包 API 环境配置
 *
 * 根据运行环境自动选择 API 地址：
 * - 本地开发：使用 Token 服务器（localhost:3001）
 * - 线上部署：使用 Nginx 转发（/api/doubao/）
 */

/**
 * 检测当前运行环境
 */
function isProduction() {
    const hostname = window.location.hostname
    // 线上域名
    const productionHosts = ['avatar.chekkk.com', '101.126.81.196']
    return productionHosts.includes(hostname)
}

/**
 * 获取 Token API 地址
 */
export function getTokenApiUrl() {
    if (isProduction()) {
        // 线上环境：使用 Nginx 转发
        return '/api/doubao/token'
    } else {
        // 本地环境：使用 Token 服务器
        return 'http://localhost:3001/token'
    }
}

/**
 * 获取 WebSocket API 地址
 */
export function getWebSocketApiUrl() {
    if (isProduction()) {
        // 线上环境：使用 Nginx 转发
        // 注意：需要根据当前协议选择 ws 或 wss
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
        const host = window.location.host
        return `${protocol}//${host}/api/doubao/ws/api/v3/sauc/bigmodel_async`
    } else {
        // 本地环境：直接连接豆包 API
        return 'wss://openspeech.bytedance.com/api/v3/sauc/bigmodel_async'
    }
}

/**
 * 打印当前环境信息
 */
export function printEnvironment() {
    console.log('=== 豆包 API 环境配置 ===')
    console.log('环境:', isProduction() ? '线上' : '本地')
    console.log('Token API:', getTokenApiUrl())
    console.log('WebSocket API:', getWebSocketApiUrl())
    console.log('========================')
}
