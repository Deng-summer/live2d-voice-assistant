/**
 * 豆包唤醒词检测主控制模块
 *
 * 这是对外的主要接口，负责协调所有子模块
 *
 * 对外接口：
 * - startWakeupDetection(callback)  启动唤醒词检测
 * - stopWakeupDetection()           停止唤醒词检测
 * - pauseWakeupDetection()          暂停监听
 * - resumeWakeupDetection()         恢复监听
 * - getWakeupStatus()               获取当前状态
 */

import { DOUBAO_CONFIG, validateConfig, printConfig } from './doubao-config.js'
import { DoubaoAudioCapture } from './doubao-audio.js'
import { DoubaoWebSocket } from './doubao-websocket.js'
import { doubaoStats } from './doubao-stats.js'
import { doubaoSchedule } from './doubao-schedule.js'

// 状态枚举
export const WakeupStatus = {
    STOPPED: 'stopped',           // 已停止
    CONNECTING: 'connecting',     // 连接中
    LISTENING: 'listening',       // 正常监听中
    PAUSED: 'paused',            // 已暂停
    SCHEDULED_STOP: 'scheduled_stop',  // 定时停止中
    LIMIT_REACHED: 'limit_reached',    // 已达上限
    ERROR: 'error',              // 错误状态
}

class DoubaoWakeup {
    constructor() {
        this.status = WakeupStatus.STOPPED
        this.audioCapture = null
        this.websocket = null
        this.onWakeupCallback = null
        this.retryCount = 0
        this.retryTimer = null
    }

    /**
     * 启动唤醒词检测
     *
     * @param {Function} onWakeup - 检测到唤醒词时的回调函数
     * @returns {Promise<void>}
     */
    async startWakeupDetection(onWakeup) {
        try {
            // 检查总开关
            if (!DOUBAO_CONFIG.WAKEUP_ENABLED) {
                console.log(`${DOUBAO_CONFIG.LOG_PREFIX} 唤醒功能已禁用`)
                return
            }

            // 验证配置
            if (!validateConfig()) {
                throw new Error('配置验证失败，请检查API凭证')
            }

            // 打印配置信息
            printConfig()

            // 检查定时控制
            if (DOUBAO_CONFIG.SCHEDULE_ENABLED && !doubaoSchedule.isInScheduleTime()) {
                console.log(`${DOUBAO_CONFIG.LOG_PREFIX} 当前不在允许时间段内`)
                this.status = WakeupStatus.SCHEDULED_STOP
                return
            }

            // 检查上限
            const limitCheck = doubaoStats.checkLimit()
            if (limitCheck.reached) {
                console.log(`${DOUBAO_CONFIG.LOG_PREFIX} ${limitCheck.message}`)
                this.status = WakeupStatus.LIMIT_REACHED
                return
            }

            // 检查浏览器支持
            if (!DoubaoAudioCapture.isSupported()) {
                throw new Error('浏览器不支持音频采集')
            }

            // 保存回调
            this.onWakeupCallback = onWakeup

            // 更新状态
            this.status = WakeupStatus.CONNECTING

            console.log(`${DOUBAO_CONFIG.LOG_PREFIX} 正在启动唤醒词检测...`)

            // 1. 创建WebSocket连接
            this.websocket = new DoubaoWebSocket()
            await this.websocket.connect({
                onMessage: (payload) => this.handleRecognitionResult(payload),
                onError: (error) => this.handleError(error),
                onClose: (event) => this.handleClose(event),
            })

            // 记录连接次数
            doubaoStats.recordConnection()

            // 2. 创建音频采集
            this.audioCapture = new DoubaoAudioCapture()
            await this.audioCapture.start((audioData) => {
                // 发送音频数据到服务器
                if (this.websocket && this.websocket.isConnected) {
                    this.websocket.sendAudioData(audioData)
                }
            })

            // 3. 开始记录监听时长
            doubaoStats.startListening()

            // 4. 启动定时控制
            if (DOUBAO_CONFIG.SCHEDULE_ENABLED) {
                doubaoSchedule.startSchedule((inSchedule) => {
                    if (!inSchedule && this.status === WakeupStatus.LISTENING) {
                        console.log(`${DOUBAO_CONFIG.LOG_PREFIX} 到达定时停止时间`)
                        this.stopWakeupDetection()
                        this.status = WakeupStatus.SCHEDULED_STOP
                    } else if (inSchedule && this.status === WakeupStatus.SCHEDULED_STOP) {
                        console.log(`${DOUBAO_CONFIG.LOG_PREFIX} 到达定时开始时间`)
                        this.startWakeupDetection(this.onWakeupCallback)
                    }
                })
            }

            // 5. 更新状态
            this.status = WakeupStatus.LISTENING
            this.retryCount = 0  // 重置重试计数

            console.log(`${DOUBAO_CONFIG.LOG_PREFIX} 唤醒词检测已启动，等待"${DOUBAO_CONFIG.WAKEUP_WORD}"`)
        } catch (error) {
            console.error(`${DOUBAO_CONFIG.LOG_PREFIX} 启动失败:`, error)
            this.status = WakeupStatus.ERROR

            // 尝试重试
            if (DOUBAO_CONFIG.RETRY_ENABLED && this.retryCount < DOUBAO_CONFIG.RETRY_COUNT) {
                this.retryCount++
                console.log(`${DOUBAO_CONFIG.LOG_PREFIX} ${DOUBAO_CONFIG.RETRY_INTERVAL / 1000}秒后进行第${this.retryCount}次重试...`)

                this.retryTimer = setTimeout(() => {
                    this.startWakeupDetection(this.onWakeupCallback)
                }, DOUBAO_CONFIG.RETRY_INTERVAL)
            } else {
                // 重试失败，降级到键盘唤醒
                if (DOUBAO_CONFIG.FALLBACK_TO_KEYBOARD) {
                    console.log(`${DOUBAO_CONFIG.LOG_PREFIX} 降级到键盘唤醒模式`)
                    this.enableKeyboardFallback()
                }
            }

            throw error
        }
    }

    /**
     * 停止唤醒词检测
     */
    stopWakeupDetection() {
        console.log(`${DOUBAO_CONFIG.LOG_PREFIX} 正在停止唤醒词检测...`)

        // 清除重试定时器
        if (this.retryTimer) {
            clearTimeout(this.retryTimer)
            this.retryTimer = null
        }

        // 停止音频采集
        if (this.audioCapture) {
            this.audioCapture.stop()
            this.audioCapture = null
        }

        // 关闭WebSocket连接
        if (this.websocket) {
            this.websocket.close()
            this.websocket = null
        }

        // 停止记录监听时长
        doubaoStats.stopListening()

        // 停止定时控制
        doubaoSchedule.stopSchedule()

        // 更新状态
        this.status = WakeupStatus.STOPPED

        console.log(`${DOUBAO_CONFIG.LOG_PREFIX} 唤醒词检测已停止`)
    }

    /**
     * 暂停监听
     */
    pauseWakeupDetection() {
        if (this.status !== WakeupStatus.LISTENING) {
            console.warn(`${DOUBAO_CONFIG.LOG_PREFIX} 当前状态不允许暂停`)
            return
        }

        console.log(`${DOUBAO_CONFIG.LOG_PREFIX} 暂停监听`)

        // 停止音频采集（但保持WebSocket连接）
        if (this.audioCapture) {
            this.audioCapture.stop()
            this.audioCapture = null
        }

        // 停止记录监听时长
        doubaoStats.stopListening()

        this.status = WakeupStatus.PAUSED
    }

    /**
     * 恢复监听
     */
    async resumeWakeupDetection() {
        if (this.status !== WakeupStatus.PAUSED) {
            console.warn(`${DOUBAO_CONFIG.LOG_PREFIX} 当前状态不允许恢复`)
            return
        }

        console.log(`${DOUBAO_CONFIG.LOG_PREFIX} 恢复监听`)

        try {
            // 重新启动音频采集
            this.audioCapture = new DoubaoAudioCapture()
            await this.audioCapture.start((audioData) => {
                if (this.websocket && this.websocket.isConnected) {
                    this.websocket.sendAudioData(audioData)
                }
            })

            // 开始记录监听时长
            doubaoStats.startListening()

            this.status = WakeupStatus.LISTENING
        } catch (error) {
            console.error(`${DOUBAO_CONFIG.LOG_PREFIX} 恢复监听失败:`, error)
            this.status = WakeupStatus.ERROR
        }
    }

    /**
     * 处理识别结果
     */
    handleRecognitionResult(payload) {
        if (!payload || !payload.result) return

        const text = payload.result.text || ''
        if (!text) return

        if (DOUBAO_CONFIG.DEBUG) {
            console.log(`${DOUBAO_CONFIG.LOG_PREFIX} 识别结果:`, text)
        }

        // 检测唤醒词
        if (this.detectWakeupWord(text)) {
            console.log(`${DOUBAO_CONFIG.LOG_PREFIX} 检测到唤醒词: "${text}"`)

            // 记录唤醒次数
            doubaoStats.recordWakeup()

            // 触发回调
            if (this.onWakeupCallback) {
                this.onWakeupCallback()
            }
        }
    }

    /**
     * 检测唤醒词
     */
    detectWakeupWord(text) {
        const normalizedText = text.toLowerCase().trim()

        // 检查是否包含任何唤醒词
        for (const keyword of DOUBAO_CONFIG.WAKEUP_KEYWORDS) {
            if (normalizedText.includes(keyword.toLowerCase())) {
                return true
            }
        }

        return false
    }

    /**
     * 处理错误
     */
    handleError(error) {
        console.error(`${DOUBAO_CONFIG.LOG_PREFIX} 发生错误:`, error)
        this.status = WakeupStatus.ERROR
    }

    /**
     * 处理连接关闭
     */
    handleClose(event) {
        console.log(`${DOUBAO_CONFIG.LOG_PREFIX} 连接已关闭`)

        // 如果不是主动停止，尝试重连
        if (this.status === WakeupStatus.LISTENING) {
            console.log(`${DOUBAO_CONFIG.LOG_PREFIX} 连接意外关闭，尝试重连...`)
            this.startWakeupDetection(this.onWakeupCallback)
        }
    }

    /**
     * 启用键盘降级模式
     */
    enableKeyboardFallback() {
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' && this.onWakeupCallback) {
                console.log(`${DOUBAO_CONFIG.LOG_PREFIX} 键盘唤醒（Enter键）`)
                this.onWakeupCallback()
            }
        })
    }

    /**
     * 获取当前状态
     */
    getWakeupStatus() {
        return {
            status: this.status,
            stats: doubaoStats.getTodayStats(),
            inSchedule: doubaoSchedule.isInScheduleTime(),
            limitCheck: doubaoStats.checkLimit(),
        }
    }
}

// 导出单例
const doubaoWakeup = new DoubaoWakeup()

// 导出对外接口
export const startWakeupDetection = (callback) => doubaoWakeup.startWakeupDetection(callback)
export const stopWakeupDetection = () => doubaoWakeup.stopWakeupDetection()
export const pauseWakeupDetection = () => doubaoWakeup.pauseWakeupDetection()
export const resumeWakeupDetection = () => doubaoWakeup.resumeWakeupDetection()
export const getWakeupStatus = () => doubaoWakeup.getWakeupStatus()
