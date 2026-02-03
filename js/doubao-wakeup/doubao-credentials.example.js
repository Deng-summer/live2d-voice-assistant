/**
 * 豆包API凭证配置模板
 *
 * 使用说明：
 * 1. 复制此文件为 doubao-credentials.js
 * 2. 填入您的真实凭证
 * 3. doubao-credentials.js 不会被提交到git
 *
 * 获取凭证：
 * 1. 登录火山引擎控制台：https://www.volcengine.com/
 * 2. 进入"语音服务" → "应用管理"
 * 3. 创建应用并获取凭证
 */

export const DOUBAO_CREDENTIALS = {
    // 应用ID（必填）
    // 对应控制台的 APP ID
    APP_KEY: '',  // 例如：'4145251174'

    // 访问密钥（必填）
    // ⚠️ 重要：这里填 Access Token，不是 Secret Key！
    // 对应控制台的 Access Token（不是Secret Key）
    ACCESS_KEY: '',  // 例如：'LpK1fJ6uG4frTjWqMiZZ7Jp8agvDeSAW'

    // 资源ID（必填）
    // ⚠️ 这不是实例ID，而是固定的资源ID字符串
    // 豆包2.0小时版：volc.seedasr.sauc.duration
    // 豆包2.0并发版：volc.seedasr.sauc.concurrent
    // 豆包1.0小时版：volc.bigasr.sauc.duration
    // 豆包1.0并发版：volc.bigasr.sauc.concurrent
    RESOURCE_ID: 'volc.seedasr.sauc.duration',  // 默认使用豆包2.0小时版
}
