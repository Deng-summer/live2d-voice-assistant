/**
 * 豆包 Token 服务器
 *
 * 用途：解决浏览器 CORS 限制，代理获取 JWT Token
 *
 * 使用方法：
 * 1. npm install express cors
 * 2. node token-server.js
 * 3. 浏览器访问 http://localhost:3000/token
 */

import express from 'express'
import cors from 'cors'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// 读取凭证配置
let DOUBAO_CREDENTIALS
try {
    const credentialsPath = join(__dirname, 'doubao-credentials.js')
    const credentialsContent = readFileSync(credentialsPath, 'utf-8')
    const appKeyMatch = credentialsContent.match(/APP_KEY:\s*['"]([^'"]+)['"]/)
    const accessKeyMatch = credentialsContent.match(/ACCESS_KEY:\s*['"]([^'"]+)['"]/)

    DOUBAO_CREDENTIALS = {
        APP_KEY: appKeyMatch ? appKeyMatch[1] : '',
        ACCESS_KEY: accessKeyMatch ? accessKeyMatch[1] : ''
    }
} catch (error) {
    console.error('❌ 无法读取凭证文件:', error.message)
    process.exit(1)
}

// 验证凭证
if (!DOUBAO_CREDENTIALS.APP_KEY || !DOUBAO_CREDENTIALS.ACCESS_KEY) {
    console.error('❌ 凭证配置不完整')
    process.exit(1)
}

const app = express()
const PORT = 3001  // 改用 3001 端口（避免与其他服务冲突）

// 启用 CORS（允许所有来源）
app.use(cors())
app.use(express.json())

// Token 缓存（避免频繁请求）
let tokenCache = {
    token: null,
    expiresAt: 0
}

/**
 * 获取 JWT Token
 */
async function fetchToken() {
    try {
        const response = await fetch('https://openspeech.bytedance.com/api/v1/sts/token', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer; ${DOUBAO_CREDENTIALS.ACCESS_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                appid: DOUBAO_CREDENTIALS.APP_KEY,
                duration: 3600,  // 1小时
            }),
        })

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }

        const data = await response.json()

        if (!data.jwt_token) {
            throw new Error('未获取到 JWT Token')
        }

        console.log('✅ JWT Token 获取成功')
        console.log('  Token:', data.jwt_token.substring(0, 20) + '...')

        return data.jwt_token
    } catch (error) {
        console.error('❌ 获取 JWT Token 失败:', error.message)
        throw error
    }
}

/**
 * Token API 端点
 */
app.get('/token', async (req, res) => {
    try {
        // 检查缓存是否有效（提前 5 分钟刷新）
        const now = Date.now()
        if (tokenCache.token && tokenCache.expiresAt > now + 5 * 60 * 1000) {
            console.log('📦 返回缓存的 Token')
            return res.json({
                success: true,
                token: tokenCache.token,
                cached: true
            })
        }

        // 获取新 Token
        console.log('🔄 获取新的 Token...')
        const token = await fetchToken()

        // 更新缓存（有效期 1 小时）
        tokenCache = {
            token: token,
            expiresAt: now + 3600 * 1000
        }

        res.json({
            success: true,
            token: token,
            cached: false
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        })
    }
})

// 健康检查端点
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        appKey: DOUBAO_CREDENTIALS.APP_KEY,
        tokenCached: !!tokenCache.token
    })
})

// 启动服务器
app.listen(PORT, () => {
    console.log('🚀 豆包 Token 服务器已启动')
    console.log(`📡 监听地址: http://localhost:${PORT}`)
    console.log(`\n💡 使用说明:`)
    console.log(`1. 浏览器访问: http://localhost:${PORT}/token`)
    console.log(`2. 返回格式: { success: true, token: "..." }`)
    console.log(`\n📋 配置信息:`)
    console.log(`  APP_KEY: ${DOUBAO_CREDENTIALS.APP_KEY}`)
    console.log(`  ACCESS_KEY: ${DOUBAO_CREDENTIALS.ACCESS_KEY.substring(0, 10)}...`)
    console.log(`\n按 Ctrl+C 停止服务器\n`)
})

// 优雅关闭
process.on('SIGINT', () => {
    console.log('\n\n🛑 正在关闭服务器...')
    process.exit(0)
})
