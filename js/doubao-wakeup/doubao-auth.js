
/**
 * 豆包 API 鉴权模块
 *
 * 根据官方文档实现：
 * 1. 通过 HTTP API 获取 JWT Token
 * 2. 使用 JWT Token 构建 WebSocket URL
 */

import { DOUBAO_CONFIG } from './doubao-config.js'
import { getTokenApiUrl, printEnvironment } from './doubao-env.js'

/**
 * 获取 JWT Token
 *
 * 根据环境自动选择 API 地址：
 * - 本地环境：http://localhost:3001/token
 * - 线上环境：/api/doubao/token（Nginx 转发）
 *
 * @returns {Promise<string>} JWT Token
 */
export async function getToken() {
    try {
        // 获取 Token API 地址（根据环境自动选择）
        const tokenApiUrl = getTokenApiUrl()

        if (DOUBAO_CONFIG.DEBUG) {
            printEnvironment()
            console.log(`${DOUBAO_CONFIG.LOG_PREFIX} 正在从 ${tokenApiUrl} 获取 Token...`)
        }

        const response = await fetch(tokenApiUrl, {
            method: 'GET',
        })

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }

        const data = await response.json()

        if (!data.success || !data.token) {
            throw new Error(data.error || '未获取到 JWT Token')
        }

        if (DOUBAO_CONFIG.DEBUG) {
            console.log(`${DOUBAO_CONFIG.LOG_PREFIX} JWT Token 获取成功`)
            console.log('  Token:', data.token.substring(0, 20) + '...')
            console.log('  Cached:', data.cached ? '是' : '否')
        }

        return data.token
    } catch (error) {
        console.error(`${DOUBAO_CONFIG.LOG_PREFIX} 获取 JWT Token 失败:`, error)
        console.error('请确保：')
        console.error('  - 本地环境：Token 服务器已启动（node token-server.js）')
        console.error('  - 线上环境：Nginx 配置正确')
        throw error
    }
}

/**
 * 构建完整的 WebSocket URL（包含鉴权参数）
 *
 * 根据官方文档，大模型语音识别需要以下参数：
 * - api_resource_id: 资源ID
 * - api_app_key: APP ID
 * - api_access_key: Jwt; ${token}
 *
 * @param {string} jwtToken - JWT Token
 * @returns {string} 完整的 WebSocket URL
 */
export function buildAuthUrl(jwtToken) {
    const auth = {
        api_resource_id: DOUBAO_CONFIG.RESOURCE_ID,
        api_app_key: DOUBAO_CONFIG.APP_KEY,
        api_access_key: `Jwt; ${jwtToken}`,
    }

    // 构建 URL 参数
    const params = []
    for (const key in auth) {
        params.push(`${key}=${encodeURIComponent(auth[key])}`)
    }

    const fullUrl = `${DOUBAO_CONFIG.WS_URL}?${params.join('&')}`

    if (DOUBAO_CONFIG.DEBUG) {
        console.log(`${DOUBAO_CONFIG.LOG_PREFIX} WebSocket URL 已构建`)
        console.log('  Base URL:', DOUBAO_CONFIG.WS_URL)
        console.log('  Resource ID:', auth.api_resource_id)
        console.log('  App Key:', auth.api_app_key)
    }

    return fullUrl
}

/**
 * 获取鉴权后的 WebSocket URL
 *
 * 这是一个便捷方法，组合了 getToken 和 buildAuthUrl
 *
 * @returns {Promise<string>} 完整的 WebSocket URL
 */
export async function getAuthenticatedUrl() {
    const token = await getToken()
    return buildAuthUrl(token)
}
