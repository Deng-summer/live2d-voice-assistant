/**
 * 豆包音频采集模块
 *
 * 负责：
 * 1. 获取麦克风权限
 * 2. 采集音频数据
 * 3. 转换为PCM16格式
 * 4. 按指定时长分包
 */

import { DOUBAO_CONFIG } from './doubao-config.js'

export class DoubaoAudioCapture {
    constructor() {
        this.audioContext = null
        this.mediaStream = null
        this.sourceNode = null
        this.processorNode = null
        this.isRecording = false
        this.onAudioDataCallback = null

        // 音频缓冲
        this.audioBuffer = []
        this.bufferSize = 4096  // ScriptProcessor的buffer size
        this.targetSamplesPerChunk = Math.floor(
            (DOUBAO_CONFIG.AUDIO_RATE * DOUBAO_CONFIG.AUDIO_CHUNK_DURATION) / 1000
        )
    }

    /**
     * 启动音频采集
     *
     * @param {Function} onAudioData - 音频数据回调函数
     * @returns {Promise<void>}
     */
    async start(onAudioData) {
        try {
            this.onAudioDataCallback = onAudioData

            // 1. 获取麦克风权限
            this.mediaStream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    sampleRate: DOUBAO_CONFIG.AUDIO_RATE,
                    channelCount: DOUBAO_CONFIG.AUDIO_CHANNEL,
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true,
                },
            })

            // 2. 创建AudioContext
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)({
                sampleRate: DOUBAO_CONFIG.AUDIO_RATE,
            })

            // 3. 创建音频源
            this.sourceNode = this.audioContext.createMediaStreamSource(this.mediaStream)

            // 4. 创建ScriptProcessor（用于处理音频数据）
            this.processorNode = this.audioContext.createScriptProcessor(
                this.bufferSize,
                DOUBAO_CONFIG.AUDIO_CHANNEL,
                DOUBAO_CONFIG.AUDIO_CHANNEL
            )

            // 5. 设置音频处理回调
            this.processorNode.onaudioprocess = (e) => {
                if (!this.isRecording) return

                const inputData = e.inputBuffer.getChannelData(0)
                this.processAudioData(inputData)
            }

            // 6. 连接音频节点
            this.sourceNode.connect(this.processorNode)
            this.processorNode.connect(this.audioContext.destination)

            this.isRecording = true

            if (DOUBAO_CONFIG.DEBUG) {
                console.log(`${DOUBAO_CONFIG.LOG_PREFIX} 音频采集已启动`)
                console.log('  采样率:', DOUBAO_CONFIG.AUDIO_RATE)
                console.log('  声道数:', DOUBAO_CONFIG.AUDIO_CHANNEL)
                console.log('  分包时长:', DOUBAO_CONFIG.AUDIO_CHUNK_DURATION, 'ms')
            }
        } catch (error) {
            console.error(`${DOUBAO_CONFIG.LOG_PREFIX} 音频采集启动失败:`, error)
            throw error
        }
    }

    /**
     * 处理音频数据
     *
     * @param {Float32Array} inputData - 输入的音频数据
     */
    processAudioData(inputData) {
        // 将Float32数据添加到缓冲区
        this.audioBuffer.push(...inputData)

        // 当缓冲区达到目标大小时，发送数据
        while (this.audioBuffer.length >= this.targetSamplesPerChunk) {
            // 取出目标数量的样本
            const chunk = this.audioBuffer.splice(0, this.targetSamplesPerChunk)

            // 转换为PCM16格式
            const pcm16Data = this.convertToPCM16(new Float32Array(chunk))

            // 回调发送数据
            if (this.onAudioDataCallback) {
                this.onAudioDataCallback(pcm16Data)
            }
        }
    }

    /**
     * 将Float32音频数据转换为PCM16格式
     *
     * @param {Float32Array} float32Array - Float32格式的音频数据
     * @returns {Uint8Array} PCM16格式的音频数据
     */
    convertToPCM16(float32Array) {
        const pcm16 = new Int16Array(float32Array.length)

        for (let i = 0; i < float32Array.length; i++) {
            // Float32范围是[-1.0, 1.0]，转换为Int16范围[-32768, 32767]
            let s = Math.max(-1, Math.min(1, float32Array[i]))
            pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF
        }

        // 返回Uint8Array（字节数组）
        return new Uint8Array(pcm16.buffer)
    }

    /**
     * 停止音频采集
     */
    stop() {
        this.isRecording = false

        // 断开音频节点
        if (this.processorNode) {
            this.processorNode.disconnect()
            this.processorNode = null
        }

        if (this.sourceNode) {
            this.sourceNode.disconnect()
            this.sourceNode = null
        }

        // 停止媒体流
        if (this.mediaStream) {
            this.mediaStream.getTracks().forEach(track => track.stop())
            this.mediaStream = null
        }

        // 关闭AudioContext
        if (this.audioContext) {
            this.audioContext.close()
            this.audioContext = null
        }

        // 清空缓冲区
        this.audioBuffer = []

        if (DOUBAO_CONFIG.DEBUG) {
            console.log(`${DOUBAO_CONFIG.LOG_PREFIX} 音频采集已停止`)
        }
    }

    /**
     * 检查浏览器是否支持音频采集
     *
     * @returns {boolean}
     */
    static isSupported() {
        return !!(
            navigator.mediaDevices &&
            navigator.mediaDevices.getUserMedia &&
            (window.AudioContext || window.webkitAudioContext)
        )
    }

    /**
     * 检查麦克风权限状态
     *
     * @returns {Promise<string>} 'granted', 'denied', 'prompt'
     */
    static async checkPermission() {
        try {
            if (navigator.permissions && navigator.permissions.query) {
                const result = await navigator.permissions.query({ name: 'microphone' })
                return result.state
            }
            return 'prompt'  // 不支持权限查询API，返回prompt
        } catch (error) {
            return 'prompt'
        }
    }
}
