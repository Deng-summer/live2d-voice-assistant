/**
 * 豆包WebSocket二进制协议处理模块
 *
 * 实现豆包语音识别API的二进制协议编解码
 * 协议格式：Header(4字节) + [Sequence(4字节)] + Payload Size(4字节) + Payload
 */

import { DOUBAO_CONFIG } from './doubao-config.js'

/**
 * 消息类型枚举
 */
export const MessageType = {
    FULL_CLIENT_REQUEST: 0x01,    // 端上发送包含请求参数的完整请求
    AUDIO_ONLY_REQUEST: 0x02,     // 端上发送仅包含音频数据的请求
    FULL_SERVER_RESPONSE: 0x09,   // 服务端下发包含识别结果的响应
    ERROR_RESPONSE: 0x0F,         // 服务端处理错误时下发的消息
}

/**
 * 序列化方法枚举
 */
export const SerializationMethod = {
    NONE: 0x00,    // 无序列化
    JSON: 0x01,    // JSON格式
}

/**
 * 压缩方法枚举
 */
export const CompressionMethod = {
    NONE: 0x00,    // 无压缩
    GZIP: 0x01,    // Gzip压缩
}

/**
 * 构建协议Header（4字节）
 *
 * @param {number} messageType - 消息类型
 * @param {boolean} hasSequence - 是否包含sequence number
 * @param {boolean} isLastPacket - 是否是最后一包
 * @param {number} serialization - 序列化方法
 * @param {number} compression - 压缩方法
 * @returns {Uint8Array} 4字节的Header
 */
function buildHeader(
    messageType,
    hasSequence = false,
    isLastPacket = false,
    serialization = SerializationMethod.JSON,
    compression = CompressionMethod.NONE
) {
    const header = new Uint8Array(4)

    // Byte 0: Protocol version (4 bits) + Header size (4 bits)
    // version = 1 (0001), header size = 1 (0001) => 0x11
    header[0] = 0x11

    // Byte 1: Message type (4 bits) + Message type specific flags (4 bits)
    let byte1 = (messageType & 0x0F) << 4
    if (isLastPacket) {
        byte1 |= 0x02  // 最后一包标志
    } else if (hasSequence) {
        byte1 |= 0x01  // 有sequence number
    }
    header[1] = byte1

    // Byte 2: Serialization (4 bits) + Compression (4 bits)
    header[2] = ((serialization & 0x0F) << 4) | (compression & 0x0F)

    // Byte 3: Reserved
    header[3] = 0x00

    return header
}

/**
 * 将数字转换为大端序的4字节数组
 *
 * @param {number} value - 要转换的数字
 * @returns {Uint8Array} 4字节数组
 */
function numberToBytes(value) {
    const bytes = new Uint8Array(4)
    const view = new DataView(bytes.buffer)
    view.setUint32(0, value, false)  // false = 大端序
    return bytes
}

/**
 * 构建Full Client Request（首包）
 *
 * @param {Object} config - 请求配置
 * @returns {Uint8Array} 完整的请求数据
 */
export function buildFullClientRequest(config) {
    // 1. 构建JSON payload
    const payload = {
        user: {
            uid: config.uid || 'live2d-jinhua',
            platform: config.platform || 'Web',
        },
        audio: {
            format: DOUBAO_CONFIG.AUDIO_FORMAT,
            rate: DOUBAO_CONFIG.AUDIO_RATE,
            bits: DOUBAO_CONFIG.AUDIO_BITS,
            channel: DOUBAO_CONFIG.AUDIO_CHANNEL,
        },
        request: {
            model_name: 'bigmodel',
            enable_itn: DOUBAO_CONFIG.ENABLE_ITN,
            enable_punc: DOUBAO_CONFIG.ENABLE_PUNC,
            enable_ddc: DOUBAO_CONFIG.ENABLE_DDC,
            result_type: DOUBAO_CONFIG.RESULT_TYPE,
            enable_accelerate_text: DOUBAO_CONFIG.ENABLE_ACCELERATE_TEXT,
            accelerate_score: DOUBAO_CONFIG.ACCELERATE_SCORE,
            end_window_size: DOUBAO_CONFIG.END_WINDOW_SIZE,
            corpus: {
                context: `{"hotwords":${JSON.stringify(
                    DOUBAO_CONFIG.WAKEUP_KEYWORDS.map(word => ({ word }))
                )}}`,
            },
        },
    }

    // 2. 转换为JSON字符串
    const payloadStr = JSON.stringify(payload)
    const payloadBytes = new TextEncoder().encode(payloadStr)

    // 3. 构建Header
    const header = buildHeader(
        MessageType.FULL_CLIENT_REQUEST,
        false,  // 不包含sequence
        false,  // 不是最后一包
        SerializationMethod.JSON,
        CompressionMethod.NONE
    )

    // 4. 构建Payload Size
    const payloadSize = numberToBytes(payloadBytes.length)

    // 5. 组合完整消息
    const message = new Uint8Array(
        header.length + payloadSize.length + payloadBytes.length
    )
    message.set(header, 0)
    message.set(payloadSize, header.length)
    message.set(payloadBytes, header.length + payloadSize.length)

    if (DOUBAO_CONFIG.DEBUG) {
        console.log(`${DOUBAO_CONFIG.LOG_PREFIX} Full Client Request:`)
        console.log('  Payload:', payloadStr)
        console.log('  Size:', message.length, 'bytes')
    }

    return message
}

/**
 * 构建Audio Only Request（音频包）
 *
 * @param {Uint8Array} audioData - 音频数据
 * @param {boolean} isLastPacket - 是否是最后一包
 * @returns {Uint8Array} 完整的请求数据
 */
export function buildAudioOnlyRequest(audioData, isLastPacket = false) {
    // 1. 构建Header
    const header = buildHeader(
        MessageType.AUDIO_ONLY_REQUEST,
        false,  // 不包含sequence
        isLastPacket,
        SerializationMethod.NONE,  // 音频数据不需要序列化
        CompressionMethod.NONE
    )

    // 2. 构建Payload Size
    const payloadSize = numberToBytes(audioData.length)

    // 3. 组合完整消息
    const message = new Uint8Array(
        header.length + payloadSize.length + audioData.length
    )
    message.set(header, 0)
    message.set(payloadSize, header.length)
    message.set(audioData, header.length + payloadSize.length)

    if (DOUBAO_CONFIG.DEBUG && isLastPacket) {
        console.log(`${DOUBAO_CONFIG.LOG_PREFIX} Audio Only Request (Last):`)
        console.log('  Size:', message.length, 'bytes')
    }

    return message
}

/**
 * 解析Server Response
 *
 * @param {ArrayBuffer} data - 服务器返回的数据
 * @returns {Object} 解析后的响应对象
 */
export function parseServerResponse(data) {
    try {
        // 验证数据长度
        if (!data || data.byteLength < 12) {
            console.error(`${DOUBAO_CONFIG.LOG_PREFIX} 数据长度不足: ${data?.byteLength || 0} bytes (最小需要12 bytes)`)
            return {
                messageType: MessageType.ERROR_RESPONSE,
                isError: true,
                error: `Data too short: ${data?.byteLength || 0} bytes`,
            }
        }

        const view = new DataView(data)

        if (DOUBAO_CONFIG.DEBUG) {
            console.log(`${DOUBAO_CONFIG.LOG_PREFIX} 收到数据包: ${data.byteLength} bytes`)
        }

        // 1. 解析Header (4 bytes)
        const headerByte0 = view.getUint8(0)
        const headerByte1 = view.getUint8(1)
        const headerByte2 = view.getUint8(2)

        const protocolVersion = (headerByte0 >> 4) & 0x0F
        const headerSize = headerByte0 & 0x0F
        const messageType = (headerByte1 >> 4) & 0x0F
        const messageFlags = headerByte1 & 0x0F
        const serialization = (headerByte2 >> 4) & 0x0F
        const compression = headerByte2 & 0x0F

        // 特殊处理：如果是错误响应，直接返回错误信息
        if (messageType === MessageType.ERROR_RESPONSE) {
            if (DOUBAO_CONFIG.DEBUG) {
                console.log(`${DOUBAO_CONFIG.LOG_PREFIX} 收到错误响应 (messageType: ${messageType})`)
            }

            // 尝试解析错误消息
            try {
                let offset = 4
                if (messageFlags & 0x01 || messageFlags & 0x03) {
                    offset += 4  // 跳过 sequence
                }

                const payloadSize = view.getUint32(offset, false)
                offset += 4

                // 对错误响应也进行大小验证，但使用更宽松的限制
                if (payloadSize > 0 && payloadSize < 1024 * 1024) {  // 1MB
                    const payloadBytes = new Uint8Array(data, offset, payloadSize)
                    const payloadText = new TextDecoder().decode(payloadBytes)
                    const payload = JSON.parse(payloadText)

                    console.error(`${DOUBAO_CONFIG.LOG_PREFIX} 服务器错误:`, payload)

                    return {
                        messageType: MessageType.ERROR_RESPONSE,
                        isError: true,
                        error: payload.message || payload.error || '未知错误',
                        payload: payload,
                    }
                } else {
                    console.error(`${DOUBAO_CONFIG.LOG_PREFIX} 错误响应的 payload size 异常: ${payloadSize}`)
                }
            } catch (e) {
                console.error(`${DOUBAO_CONFIG.LOG_PREFIX} 解析错误响应失败:`, e)
            }

            return {
                messageType: MessageType.ERROR_RESPONSE,
                isError: true,
                error: '服务器返回错误响应',
            }
        }

        // 2. 解析Sequence (4 bytes) - 如果有的话
        let offset = 4
        let sequence = null
        if (messageFlags & 0x01 || messageFlags & 0x03) {
            sequence = view.getUint32(offset, false)  // 大端序
            offset += 4
        }

        // 3. 解析Payload Size (4 bytes)
        const payloadSize = view.getUint32(offset, false)
        offset += 4

        // 验证 Payload Size 是否合理（防止异常大的值导致内存错误）
        const MAX_PAYLOAD_SIZE = 10 * 1024 * 1024  // 10MB
        if (payloadSize > MAX_PAYLOAD_SIZE || payloadSize < 0) {
            console.error(`${DOUBAO_CONFIG.LOG_PREFIX} Payload size 异常: ${payloadSize} bytes (最大允许: ${MAX_PAYLOAD_SIZE} bytes)`)
            console.error(`${DOUBAO_CONFIG.LOG_PREFIX} 数据包详情:`, {
                totalSize: data.byteLength,
                headerByte0: headerByte0.toString(16),
                headerByte1: headerByte1.toString(16),
                headerByte2: headerByte2.toString(16),
                messageType,
                messageFlags,
                offset,
                payloadSize
            })
            return {
                messageType: MessageType.ERROR_RESPONSE,
                isError: true,
                error: `Invalid payload size: ${payloadSize}`,
            }
        }

        // 验证数据包是否完整
        const expectedTotalSize = offset + payloadSize
        if (data.byteLength < expectedTotalSize) {
            console.error(`${DOUBAO_CONFIG.LOG_PREFIX} 数据包不完整: 实际 ${data.byteLength} bytes, 期望 ${expectedTotalSize} bytes`)
            return {
                messageType: MessageType.ERROR_RESPONSE,
                isError: true,
                error: `Incomplete data: expected ${expectedTotalSize}, got ${data.byteLength}`,
            }
        }

        // 4. 解析Payload
        let payload = null
        if (payloadSize > 0) {
            const payloadBytes = new Uint8Array(data, offset, payloadSize)

            // 如果是JSON格式，解析为对象
            if (serialization === SerializationMethod.JSON) {
                const payloadText = new TextDecoder().decode(payloadBytes)
                payload = JSON.parse(payloadText)
            } else {
                payload = payloadBytes
            }
        }

        const response = {
            messageType,
            messageFlags,
            sequence,
            payload,
            isError: messageType === MessageType.ERROR_RESPONSE,
            isLast: (messageFlags & 0x02) !== 0,
        }

        if (DOUBAO_CONFIG.DEBUG && payload) {
            console.log(`${DOUBAO_CONFIG.LOG_PREFIX} Server Response:`)
            console.log('  Type:', messageType === MessageType.FULL_SERVER_RESPONSE ? 'Full' : 'Error')
            console.log('  Payload:', payload)
        }

        return response
    } catch (error) {
        console.error(`${DOUBAO_CONFIG.LOG_PREFIX} 解析响应失败:`, error)
        return {
            messageType: MessageType.ERROR_RESPONSE,
            isError: true,
            error: error.message,
        }
    }
}

/**
 * 生成UUID（用于Connect-Id）
 *
 * @returns {string} UUID字符串
 */
export function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = (Math.random() * 16) | 0
        const v = c === 'x' ? r : (r & 0x3) | 0x8
        return v.toString(16)
    })
}
