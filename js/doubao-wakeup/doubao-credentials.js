/**
 * 豆包API凭证配置
 *
 * 重要提示：
 * 1. 此文件包含敏感信息，请勿提交到git
 * 2. 请填入您的真实凭证
 * 3. 如果此文件不存在，请复制 doubao-credentials.example.js 并重命名
 */

export const DOUBAO_CREDENTIALS = {
    // 应用ID（必填）
    // 从火山引擎控制台获取
    APP_KEY: '3100553971',

    // 访问密钥（必填）
    // 从火山引擎控制台获取
    ACCESS_KEY: 'ildZ234LgPJyCmi9ns9wpfhIvRmo26ja',

    // 资源ID（必填）
    // 推荐使用：volc.seedasr.sauc.concurrent（豆包2.0并发版）
    // 其他选项：
    // - volc.seedasr.sauc.duration（豆包2.0小时版）
    // - volc.bigasr.sauc.concurrent（豆包1.0并发版）
    // - volc.bigasr.sauc.duration（豆包1.0小时版）
    RESOURCE_ID: 'volc.seedasr.sauc.duration',
}

