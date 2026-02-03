/**
 * 豆包使用统计模块
 *
 * 负责：
 * 1. 记录监听时长
 * 2. 记录唤醒次数
 * 3. 记录连接次数
 * 4. 每日统计重置
 * 5. 检查是否达到上限
 */

import { DOUBAO_CONFIG } from './doubao-config.js'

class DoubaoStats {
    constructor() {
        this.stats = this.loadStats()
        this.startTime = null
        this.isListening = false

        // 每天0点重置统计
        this.scheduleReset()
    }

    /**
     * 从localStorage加载统计数据
     */
    loadStats() {
        try {
            const saved = localStorage.getItem('doubao_stats')
            if (saved) {
                const stats = JSON.parse(saved)
                // 检查是否是今天的数据
                if (stats.date === this.getTodayDate()) {
                    return stats
                }
            }
        } catch (error) {
            console.error(`${DOUBAO_CONFIG.LOG_PREFIX} 加载统计数据失败:`, error)
        }

        // 返回默认统计数据
        return this.getDefaultStats()
    }

    /**
     * 获取默认统计数据
     */
    getDefaultStats() {
        return {
            date: this.getTodayDate(),
            listeningDuration: 0,  // 监听时长（毫秒）
            wakeupCount: 0,        // 唤醒次数
            connectionCount: 0,    // 连接次数
        }
    }

    /**
     * 保存统计数据到localStorage
     */
    saveStats() {
        try {
            localStorage.setItem('doubao_stats', JSON.stringify(this.stats))
        } catch (error) {
            console.error(`${DOUBAO_CONFIG.LOG_PREFIX} 保存统计数据失败:`, error)
        }
    }

    /**
     * 获取今天的日期字符串（YYYY-MM-DD）
     */
    getTodayDate() {
        const now = new Date()
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
    }

    /**
     * 开始记录监听时长
     */
    startListening() {
        if (this.isListening) return

        this.startTime = Date.now()
        this.isListening = true

        if (DOUBAO_CONFIG.DEBUG) {
            console.log(`${DOUBAO_CONFIG.LOG_PREFIX} 开始记录监听时长`)
        }
    }

    /**
     * 停止记录监听时长
     */
    stopListening() {
        if (!this.isListening || !this.startTime) return

        const duration = Date.now() - this.startTime
        this.stats.listeningDuration += duration
        this.saveStats()

        this.startTime = null
        this.isListening = false

        if (DOUBAO_CONFIG.DEBUG) {
            console.log(`${DOUBAO_CONFIG.LOG_PREFIX} 停止记录监听时长，本次时长: ${duration}ms`)
        }
    }

    /**
     * 记录唤醒次数
     */
    recordWakeup() {
        this.stats.wakeupCount++
        this.saveStats()

        if (DOUBAO_CONFIG.DEBUG) {
            console.log(`${DOUBAO_CONFIG.LOG_PREFIX} 记录唤醒，今日第 ${this.stats.wakeupCount} 次`)
        }
    }

    /**
     * 记录连接次数
     */
    recordConnection() {
        this.stats.connectionCount++
        this.saveStats()

        if (DOUBAO_CONFIG.DEBUG) {
            console.log(`${DOUBAO_CONFIG.LOG_PREFIX} 记录连接，今日第 ${this.stats.connectionCount} 次`)
        }
    }

    /**
     * 获取今日统计
     */
    getTodayStats() {
        // 如果正在监听，加上当前时长
        let currentDuration = this.stats.listeningDuration
        if (this.isListening && this.startTime) {
            currentDuration += Date.now() - this.startTime
        }

        return {
            date: this.stats.date,
            listeningDuration: currentDuration,
            listeningDurationFormatted: this.formatDuration(currentDuration),
            wakeupCount: this.stats.wakeupCount,
            connectionCount: this.stats.connectionCount,
        }
    }

    /**
     * 格式化时长（毫秒 -> HH:MM:SS）
     */
    formatDuration(ms) {
        const seconds = Math.floor(ms / 1000)
        const hours = Math.floor(seconds / 3600)
        const minutes = Math.floor((seconds % 3600) / 60)
        const secs = seconds % 60

        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
    }

    /**
     * 检查是否达到每日上限
     */
    checkLimit() {
        if (!DOUBAO_CONFIG.LIMIT_ENABLED) {
            return { reached: false }
        }

        const stats = this.getTodayStats()

        // 检查时长上限
        if (stats.listeningDuration >= DOUBAO_CONFIG.DAILY_MAX_DURATION) {
            return {
                reached: true,
                type: 'duration',
                message: `已达到每日监听时长上限（${this.formatDuration(DOUBAO_CONFIG.DAILY_MAX_DURATION)}）`,
            }
        }

        // 检查唤醒次数上限
        if (stats.wakeupCount >= DOUBAO_CONFIG.DAILY_MAX_WAKEUP_COUNT) {
            return {
                reached: true,
                type: 'wakeup',
                message: `已达到每日唤醒次数上限（${DOUBAO_CONFIG.DAILY_MAX_WAKEUP_COUNT}次）`,
            }
        }

        return { reached: false }
    }

    /**
     * 重置每日统计
     */
    resetDailyStats() {
        console.log(`${DOUBAO_CONFIG.LOG_PREFIX} 重置每日统计`)
        this.stats = this.getDefaultStats()
        this.saveStats()
    }

    /**
     * 安排每日重置任务
     */
    scheduleReset() {
        // 计算到明天0点的时间
        const now = new Date()
        const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0)
        const timeUntilReset = tomorrow - now

        setTimeout(() => {
            this.resetDailyStats()
            // 重新安排下一次重置
            this.scheduleReset()
        }, timeUntilReset)

        if (DOUBAO_CONFIG.DEBUG) {
            console.log(`${DOUBAO_CONFIG.LOG_PREFIX} 已安排每日重置，将在 ${tomorrow.toLocaleString()} 执行`)
        }
    }
}

// 导出单例
export const doubaoStats = new DoubaoStats()
