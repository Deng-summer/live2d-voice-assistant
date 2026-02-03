/**
 * 豆包 WebSocket 代理服务器
 *
 * 用途：解决浏览器 WebSocket API 无法添加自定义 Header 的问题
 *
 * 工作原理：
 * 1. 浏览器连接到本地代理服务器（ws://localhost:8081）
 * 2. 代理服务器连接到豆包 API（添加鉴权 Header）
 * 3. 代理服务器转发双向消息
 *
 * 使用方法：
 * 1. 安装依赖：npm install ws
 * 2. 运行服务器：node proxy-server.js
 * 3. 修改 doubao-config.js 中的 WS_URL 为 ws://localhost:8081
 */

import WebSocket from 'ws'
import { createServer } from 'http'
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
    // 简单解析（实际项目中应该使用更robust的方法）
    const appKeyMatch = credentialsContent.match(/APP_KEY:\s*['"]([^'"]+)['"]/)
    const accessKeyMatch = credentialsContent.match(/ACCESS_KEY:\s*['"]([^'"]+)['"]/)
    const resourceIdMatch = credentialsContent.match(/RESOURCE_ID:\s*['"]([^'"]+)['"]/)

    DOUBAO_CREDENTIALS = {
        APP_KEY: appKeyMatch ? appKeyMatch[1] : '',
        ACCESS_KEY: accessKeyMatch ? accessKeyMatch[1] : '',
        RESOURCE_ID: resourceIdMatch ? resourceIdMatch[1] : ''
    }
} catch (error) {
    console.error('❌ 无法读取凭证文件:', error.message)
    console.error('请确保 doubao-credentials.js 文件存在')
    process.exit(1)
}

// 验证凭证
if (!DOUBAO_CREDENTIALS.APP_KEY || !DOUBAO_CREDENTIALS.ACCESS_KEY || !DOUBAO_CREDENTIALS.RESOURCE_ID) {
    console.error('❌ 凭证配置不完整')
    console.error('APP_KEY:', DOUBAO_CREDENTIALS.APP_KEY ? '✓' : '✗')
    console.error('ACCESS_KEY:', DOUBAO_CREDENTIALS.ACCESS_KEY ? '✓' : '✗')
    console.error('RESOURCE_ID:', DOUBAO_CREDENTIALS.RESOURCE_ID ? '✓' : '✗')
    process.exit(1)
}

// 豆包 API 地址
const DOUBAO_WS_URL = 'wss://openspeech.bytedance.com/api/v3/sauc/bigmodel_async'

// 创建 HTTP 服务器
const server = createServer()

// 创建 WebSocket 服务器
const wss = new WebSocket.Server({ server })

console.log('🚀 豆包 WebSocket 代理服务器启动中...')
console.log('📋 配置信息:')
console.log('  APP_KEY:', DOUBAO_CREDENTIALS.APP_KEY)
console.log('  ACCESS_KEY:', DOUBAO_CREDENTIALS.ACCESS_KEY.substring(0, 10) + '...')
console.log('  RESOURCE_ID:', DOUBAO_CREDENTIALS.RESOURCE_ID)
console.log('  目标地址:', DOUBAO_WS_URL)

wss.on('connection', (clientWs) => {
    console.log('\n✅ 浏览器客户端已连接')

    // 生成连接 ID
    const connectId = generateUUID()
    console.log('  Connect-Id:', connectId)

    // 连接到豆包 API（添加鉴权 Header）
    const doubaoWs = new WebSocket(DOUBAO_WS_URL, {
        headers: {
            'X-Api-App-Key': DOUBAO_CREDENTIALS.APP_KEY,
            'X-Api-Access-Key': DOUBAO_CREDENTIALS.ACCESS_KEY,
            'X-Api-Resource-Id': DOUBAO_CREDENTIALS.RESOURCE_ID,
            'X-Api-Connect-Id': connectId
        }
    })

    // 豆包连接打开
    doubaoWs.on('open', () => {
        console.log('✅ 已连接到豆包 API')
    })

    // 豆包连接错误
    doubaoWs.on('error', (error) => {
        console.error('❌ 豆包 API 连接错误:', error.message)
        clientWs.close()
    })

    // 豆包连接关闭
    doubaoWs.on('close', (code, reason) => {
        console.log('🔌 豆包 API 连接已关闭')
        console.log('  Code:', code)
        console.log('  Reason:', reason.toString())
        clientWs.close()
    })

    // 豆包返回消息 -> 转发给浏览器
    doubaoWs.on('message', (data) => {
        if (clientWs.readyState === WebSocket.OPEN) {
            clientWs.send(data)
            console.log('📥 转发消息: 豆包 -> 浏览器 (' + data.length + ' bytes)')
        }
    })

    // 浏览器发送消息 -> 转发给豆包
    clientWs.on('message', (data) => {
        if (doubaoWs.readyState === WebSocket.OPEN) {
            doubaoWs.send(data)
            console.log('📤 转发消息: 浏览器 -> 豆包 (' + data.length + ' bytes)')
        }
    })

    // 浏览器连接关闭
    clientWs.on('close', () => {
        console.log('🔌 浏览器客户端已断开')
        doubaoWs.close()
    })

    // 浏览器连接错误
    clientWs.on('error', (error) => {
        console.error('❌ 浏览器客户端错误:', error.message)
        doubaoWs.close()
    })
})

// 生成 UUID
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = (Math.random() * 16) | 0
        const v = c === 'x' ? r : (r & 0x3) | 0x8
        return v.toString(16)
    })
}

// 启动服务器
const PORT = 8081
server.listen(PORT, () => {
    console.log(`\n✅ 代理服务器已启动`)
    console.log(`📡 监听地址: ws://localhost:${PORT}`)
    console.log(`\n💡 使用说明:`)
    console.log(`1. 修改 doubao-config.js 中的 WS_URL 为: ws://localhost:${PORT}`)
    console.log(`2. 在浏览器中打开测试页面`)
    console.log(`3. 点击"启动检测"按钮`)
    console.log(`\n按 Ctrl+C 停止服务器\n`)
})

// 优雅关闭
process.on('SIGINT', () => {
    console.log('\n\n🛑 正在关闭服务器...')
    wss.close(() => {
        server.close(() => {
            console.log('✅ 服务器已关闭')
            process.exit(0)
        })
    })
})
