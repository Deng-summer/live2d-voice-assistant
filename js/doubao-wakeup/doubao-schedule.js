/**
 * 豆包定时控制模块
 *
 * 负责：
 * 1. 检查当前时间是否在允许范围内
 * 2. 定时启动/停止监听
 * 3. 时间段配置管理
 */

import { DOUBAO_CONFIG } from './doubao-config.js'

class DoubaoSchedule {
    constructor() {
        this.checkInterval = null
        this.onScheduleChangeCallback = null
    }

    /**
     * 解析时间字符串（HH:MM）为分钟数
     */
    parseTime(timeStr) {
        const [hours, minutes] = timeStr.split(':').map(Number)
        return hours * 60 + minutes
    }

    /**
     * 获取当前时间的分钟数
     */
    getCurrentMinutes() {
        const now = new Date()
        return now.getHours() * 60 + now.getMinutes()
    }

    /**
     * 检查当前时间是否在允许范围内
     */
    isInScheduleTime() {
        if (!DOUBAO_CONFIG.SCHEDULE_ENABLED) {
            return true  // 未启用定时控制，始终允许
        }

        const currentMinutes = this.getCurrentMinutes()
        const startMinutes = this.parseTime(DOUBAO_CONFIG.SCHEDULE_START_TIME)
        const stopMinutes = this.parseTime(DOUBAO_CONFIG.SCHEDULE_STOP_TIME)

        // 处理跨天的情况（如 22:00 - 08:00）
        if (stopMinutes < startMinutes) {
            // 跨天：当前时间在停止时间之前，或在开始时间之后
            return currentMinutes < stopMinutes || currentMinutes >= startMinutes
        } else {
            // 不跨天：当前时间在开始和停止时间之间
            return currentMinutes >= startMinutes && currentMinutes < stopMinutes
        }
    }

    /**
     * 启动定时控制
     *
     * @param {Function} onScheduleChange - 时间段变化回调
     */
    startSchedule(onScheduleChange) {
        if (!DOUBAO_CONFIG.SCHEDULE_ENABLED) {
            return
        }

        this.onScheduleChangeCallback = onScheduleChange

        // 每分钟检查一次
        this.checkInterval = setInterval(() => {
            const inSchedule = this.isInScheduleTime()

            if (this.onScheduleChangeCallback) {
                this.onScheduleChangeCallback(inSchedule)
            }
        }, 60 * 1000)  // 每分钟检查一次

        if (DOUBAO_CONFIG.DEBUG) {
            console.log(`${DOUBAO_CONFIG.LOG_PREFIX} 定时控制已启动`)
            console.log('  允许时间段:', `${DOUBAO_CONFIG.SCHEDULE_START_TIME} - ${DOUBAO_CONFIG.SCHEDULE_STOP_TIME}`)
            console.log('  当前状态:', this.isInScheduleTime() ? '允许' : '禁止')
        }
    }

    /**
     * 停止定时控制
     */
    stopSchedule() {
        if (this.checkInterval) {
            clearInterval(this.checkInterval)
            this.checkInterval = null
        }

        if (DOUBAO_CONFIG.DEBUG) {
            console.log(`${DOUBAO_CONFIG.LOG_PREFIX} 定时控制已停止`)
        }
    }

    /**
     * 更新时间段配置
     */
    updateSchedule(startTime, stopTime) {
        DOUBAO_CONFIG.SCHEDULE_START_TIME = startTime
        DOUBAO_CONFIG.SCHEDULE_STOP_TIME = stopTime

        if (DOUBAO_CONFIG.DEBUG) {
            console.log(`${DOUBAO_CONFIG.LOG_PREFIX} 时间段已更新:`, `${startTime} - ${stopTime}`)
        }
    }

    /**
     * 获取下一次状态变化的时间
     */
    getNextChangeTime() {
        if (!DOUBAO_CONFIG.SCHEDULE_ENABLED) {
            return null
        }

        const now = new Date()
        const currentMinutes = this.getCurrentMinutes()
        const startMinutes = this.parseTime(DOUBAO_CONFIG.SCHEDULE_START_TIME)
        const stopMinutes = this.parseTime(DOUBAO_CONFIG.SCHEDULE_STOP_TIME)

        let nextChangeMinutes
        let nextChangeType

        if (this.isInScheduleTime()) {
            // 当前在允许时间内，下一次变化是停止时间
            nextChangeMinutes = stopMinutes
            nextChangeType = 'stop'
        } else {
            // 当前在禁止时间内，下一次变化是开始时间
            nextChangeMinutes = startMinutes
            nextChangeType = 'start'
        }

        // 计算下一次变化的时间
        const nextChange = new Date(now)
        nextChange.setHours(Math.floor(nextChangeMinutes / 60))
        nextChange.setMinutes(nextChangeMinutes % 60)
        nextChange.setSeconds(0)

        // 如果计算出的时间已经过去，加一天
        if (nextChange <= now) {
            nextChange.setDate(nextChange.getDate() + 1)
        }

        return {
            time: nextChange,
            type: nextChangeType,
            formatted: nextChange.toLocaleString(),
        }
    }
}

// 导出单例
export const doubaoSchedule = new DoubaoSchedule()
