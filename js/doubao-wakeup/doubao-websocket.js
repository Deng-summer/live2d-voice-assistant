/**
 * 豆包WebSocket连接管理模块
 *
 * 负责：
 * 1. 建立WebSocket连接
 * 2. 添加鉴权Header
 * 3. 发送音频数据
 * 4. 接收识别结果
 * 5. 连接状态管理
 */

import { DOUBAO_CONFIG } from './doubao-config.js'
import {
    buildFullClientRequest,
    buildAudioOnlyRequest,
    parseServerResponse,
    generateUUID,
} from './doubao-protocol.js'
import { getAuthenticatedUrl } from './doubao-auth.js'

export class DoubaoWebSocket {
    constructor() {
        this.ws = null
        this.connectId = null
        this.isConnected = false
        this.onMessageCallback = null
        this.onErrorCallback = null
        this.onCloseCallback = null
    }

    /**
     * 建立WebSocket连接
     *
     * @param {Object} callbacks - 回调函数集合
     * @returns {Promise<void>}
     */
    async connect(callbacks = {}) {
        return new Promise(async (resolve, reject) => {
            try {
                // 生成连接ID
                this.connectId = generateUUID()

                // 获取鉴权后的 WebSocket URL
                // 根据官方文档，需要先获取 JWT Token，然后通过 URL 参数传递鉴权信息
                if (DOUBAO_CONFIG.DEBUG) {
                    console.log(`${DOUBAO_CONFIG.LOG_PREFIX} 正在获取 JWT Token...`)
                }

                const wsUrl = await getAuthenticatedUrl()

                if (DOUBAO_CONFIG.DEBUG) {
                    console.log(`${DOUBAO_CONFIG.LOG_PREFIX} 准备连接 WebSocket`)
                }

                // 创建WebSocket连接
                this.ws = new WebSocket(wsUrl)
                this.ws.binaryType = 'arraybuffer'

                // 保存回调
                this.onMessageCallback = callbacks.onMessage
                this.onErrorCallback = callbacks.onError
                this.onCloseCallback = callbacks.onClose

                // 连接打开
                this.ws.onopen = () => {
                    this.isConnected = true

                    if (DOUBAO_CONFIG.DEBUG) {
                        console.log(`${DOUBAO_CONFIG.LOG_PREFIX} WebSocket已连接`)
                        console.log('  Connect-Id:', this.connectId)
                    }

                    // 发送Full Client Request（首包）
                    this.sendFullClientRequest()

                    resolve()
                }

                // 接收消息
                this.ws.onmessage = (event) => {
                    this.handleMessage(event.data)
                }

                // 连接错误
                this.ws.onerror = (error) => {
                    console.error(`${DOUBAO_CONFIG.LOG_PREFIX} WebSocket错误:`, error)

                    if (this.onErrorCallback) {
                        this.onErrorCallback(error)
                    }

                    reject(error)
                }

                // 连接关闭
                this.ws.onclose = (event) => {
                    this.isConnected = false

                    if (DOUBAO_CONFIG.DEBUG) {
                        console.log(`${DOUBAO_CONFIG.LOG_PREFIX} WebSocket已关闭`)
                        console.log('  Code:', event.code)
                        console.log('  Reason:', event.reason)
                    }

                    if (this.onCloseCallback) {
                        this.onCloseCallback(event)
                    }
                }
            } catch (error) {
                console.error(`${DOUBAO_CONFIG.LOG_PREFIX} WebSocket连接失败:`, error)
                reject(error)
            }
        })
    }

    /**
     * 发送Full Client Request（首包）
     */
    sendFullClientRequest() {
        const request = buildFullClientRequest({
            uid: 'live2d-jinhua',
            platform: 'Web',
        })

        this.send(request)

        if (DOUBAO_CONFIG.DEBUG) {
            console.log(`${DOUBAO_CONFIG.LOG_PREFIX} 已发送Full Client Request`)
        }
    }

    /**
     * 发送音频数据
     *
     * @param {Uint8Array} audioData - 音频数据
     * @param {boolean} isLast - 是否是最后一包
     */
    sendAudioData(audioData, isLast = false) {
        if (!this.isConnected) {
            console.warn(`${DOUBAO_CONFIG.LOG_PREFIX} WebSocket未连接，无法发送音频数据`)
            return
        }

        const request = buildAudioOnlyRequest(audioData, isLast)
        this.send(request)
    }

    /**
     * 发送数据
     *
     * @param {Uint8Array} data - 要发送的数据
     */
    send(data) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(data)
        } else {
            console.warn(`${DOUBAO_CONFIG.LOG_PREFIX} WebSocket未就绪，无法发送数据`)
        }
    }

    /**
     * 处理接收到的消息
     *
     * @param {ArrayBuffer} data - 接收到的数据
     */
    handleMessage(data) {
        const response = parseServerResponse(data)

        if (response.isError) {
            console.error(`${DOUBAO_CONFIG.LOG_PREFIX} 服务器返回错误:`, response)

            if (this.onErrorCallback) {
                this.onErrorCallback(response)
            }
            return
        }

        // 回调处理识别结果
        if (this.onMessageCallback && response.payload) {
            this.onMessageCallback(response.payload)
        }
    }

    /**
     * 关闭连接
     */
    close() {
        if (this.ws) {
            // 发送最后一包（空音频数据）
            if (this.isConnected) {
                this.sendAudioData(new Uint8Array(0), true)
            }

            this.ws.close()
            this.ws = null
        }

        this.isConnected = false
        this.connectId = null

        if (DOUBAO_CONFIG.DEBUG) {
            console.log(`${DOUBAO_CONFIG.LOG_PREFIX} WebSocket连接已关闭`)
        }
    }

    /**
     * 获取连接状态
     */
    getState() {
        if (!this.ws) return 'CLOSED'

        switch (this.ws.readyState) {
            case WebSocket.CONNECTING:
                return 'CONNECTING'
            case WebSocket.OPEN:
                return 'OPEN'
            case WebSocket.CLOSING:
                return 'CLOSING'
            case WebSocket.CLOSED:
                return 'CLOSED'
            default:
                return 'UNKNOWN'
        }
    }
}
