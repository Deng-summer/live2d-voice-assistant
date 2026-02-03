/**
 * 豆包唤醒词UI模块
 *
 * 负责：
 * 1. 显示连接状态
 * 2. 显示使用统计
 * 3. 暂停/恢复按钮
 * 4. 提示消息
 */

import { DOUBAO_CONFIG } from './doubao-config.js'
import { WakeupStatus } from './doubao-wakeup.js'

class DoubaoUI {
    constructor() {
        this.statusElement = null
        this.statsElement = null
        this.controlButton = null
        this.initialized = false
    }

    /**
     * 初始化UI
     */
    initUI() {
        if (this.initialized || !DOUBAO_CONFIG.SHOW_STATUS) {
            return
        }

        // 创建状态显示容器
        this.createStatusDisplay()

        // 创建统计显示容器
        if (DOUBAO_CONFIG.STATS_ENABLED) {
            this.createStatsDisplay()
        }

        // 创建控制按钮
        if (DOUBAO_CONFIG.PAUSE_ENABLED) {
            this.createControlButton()
        }

        this.initialized = true

        if (DOUBAO_CONFIG.DEBUG) {
            console.log(`${DOUBAO_CONFIG.LOG_PREFIX} UI已初始化`)
        }
    }

    /**
     * 创建状态显示
     */
    createStatusDisplay() {
        this.statusElement = document.createElement('div')
        this.statusElement.id = 'doubao-status'
        this.statusElement.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            padding: 8px 12px;
            background: rgba(0, 0, 0, 0.7);
            color: white;
            border-radius: 4px;
            font-size: 12px;
            z-index: 9999;
            display: flex;
            align-items: center;
            gap: 8px;
        `

        document.body.appendChild(this.statusElement)
    }

    /**
     * 创建统计显示
     */
    createStatsDisplay() {
        this.statsElement = document.createElement('div')
        this.statsElement.id = 'doubao-stats'
        this.statsElement.style.cssText = `
            position: fixed;
            top: 40px;
            right: 10px;
            padding: 8px 12px;
            background: rgba(0, 0, 0, 0.7);
            color: white;
            border-radius: 4px;
            font-size: 11px;
            z-index: 9999;
        `

        document.body.appendChild(this.statsElement)
    }

    /**
     * 创建控制按钮
     */
    createControlButton() {
        this.controlButton = document.createElement('button')
        this.controlButton.id = 'doubao-control'
        this.controlButton.textContent = '暂停'
        this.controlButton.style.cssText = `
            position: fixed;
            top: 10px;
            right: 150px;
            padding: 6px 12px;
            background: #4CAF50;
            color: white;
            border: none;
            border-radius: 4px;
            font-size: 12px;
            cursor: pointer;
            z-index: 9999;
        `

        document.body.appendChild(this.controlButton)
    }

    /**
     * 更新状态显示
     */
    updateStatus(status) {
        if (!this.statusElement) return

        let icon = ''
        let text = ''
        let color = ''

        switch (status) {
            case WakeupStatus.LISTENING:
                icon = '🟢'
                text = '正常监听中'
                color = '#4CAF50'
                break
            case WakeupStatus.CONNECTING:
                icon = '🟡'
                text = '连接中...'
                color = '#FFC107'
                break
            case WakeupStatus.ERROR:
                icon = '🔴'
                text = '连接失败'
                color = '#F44336'
                break
            case WakeupStatus.PAUSED:
                icon = '⏸️'
                text = '已暂停'
                color = '#9E9E9E'
                break
            case WakeupStatus.SCHEDULED_STOP:
                icon = '🌙'
                text = '定时停止中'
                color = '#9E9E9E'
                break
            case WakeupStatus.LIMIT_REACHED:
                icon = '🚫'
                text = '已达上限'
                color = '#FF5722'
                break
            case WakeupStatus.STOPPED:
                icon = '⚫'
                text = '已停止'
                color = '#9E9E9E'
                break
            default:
                icon = '❓'
                text = '未知状态'
                color = '#9E9E9E'
        }

        this.statusElement.innerHTML = `
            <span style="font-size: 14px;">${icon}</span>
            <span style="color: ${color};">${text}</span>
        `
    }

    /**
     * 更新统计显示
     */
    updateStats(stats) {
        if (!this.statsElement) return

        this.statsElement.innerHTML = `
            <div>今日监听: ${stats.listeningDurationFormatted}</div>
            <div>唤醒次数: ${stats.wakeupCount}次</div>
        `
    }

    /**
     * 显示提示消息
     */
    showMessage(message, type = 'info', duration = 3000) {
        const messageElement = document.createElement('div')
        messageElement.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            padding: 16px 24px;
            background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#F44336' : '#2196F3'};
            color: white;
            border-radius: 4px;
            font-size: 14px;
            z-index: 10000;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        `
        messageElement.textContent = message

        document.body.appendChild(messageElement)

        setTimeout(() => {
            messageElement.remove()
        }, duration)
    }

    /**
     * 销毁UI
     */
    destroyUI() {
        if (this.statusElement) {
            this.statusElement.remove()
            this.statusElement = null
        }

        if (this.statsElement) {
            this.statsElement.remove()
            this.statsElement = null
        }

        if (this.controlButton) {
            this.controlButton.remove()
            this.controlButton = null
        }

        this.initialized = false
    }
}

// 导出单例
export const doubaoUI = new DoubaoUI()
