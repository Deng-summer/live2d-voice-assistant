/**
 * 豆包 API 鉴权模块
 *
 * 根据官方文档实现：
 * 1. 通过 HTTP API 获取 JWT Token
 * 2. 使用 JWT Token 构建 WebSocket URL
 */

import { DOUBAO_CONFIG } from './doubao-config.js'

/**
 * 获取 JWT Token
 *
 * 由于豆包 Token API 不支持 CORS，需要通过本地服务器代理
 *
 * 使用方法：
 * 1. 启动 Token 服务器：node token-server.js
 * 2. 服务器会在 http://localhost:3000 监听
 * 3. 前端调用 /token 端点获取 JWT Token
 *
 * @returns {Promise<string>} JWT Token
 */
export async function getToken() {
    try {
        // 从本地 Token 服务器获取（解决 CORS 问题）
        const response = await fetch('http://localhost:3001/token', {
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
        console.error('请确保 Token 服务器已启动：node token-server.js')
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
