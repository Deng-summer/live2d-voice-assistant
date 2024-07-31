//火山语音合成tts


const openai = require("@volcengine/openapi");
const Service = openai.Service

const appKey = 'LpxpUFCRGy'
const accessKeyId = 'REDACTED_OLD_CREDENTIAL'
const secretKey = 'REDACTED_OLD_CREDENTIAL'

const hostname = 'open.volcengineapi.com'
const path = "/";
const action = "GetToken";
const version = "2021-07-27";
const region = "cn-north-1"
const authVersion = "volc-auth-v1";
const serviceName = 'sami'

const expiration = 36000; //60s * 60 * 10 10个小时
let token_time = '' //token 的获取时间
let token_expires = '' //token的过期时间
let token = ''

export const getToken = async () => {
    const options = {
        accessKeyId: accessKeyId,
        secretKey: secretKey,
        // sessionToken:sessionToken,
        region: region,
        host: hostname,
        serviceName: serviceName,
        defaultVersion: version,
    }
    const samiService = new Service(options);
    const bodyObj = {
        token_version: authVersion,
        appkey: appKey,
        expiration,
    }
    // const res = await samiService.fetchOpenAPI({
    //     pathname: path,
    //     Action: action,
    //     Version: version,
    //     method: "POST",
    //     headers: {
    //         'content-type': 'application/json',
    //     },
    //     data: JSON.stringify(bodyObj)
    // })
    // if (!res.token) {
    //     throw new Error(res.msg ?? '获取token失败')
    // }
    // token = res.token
    // return res.token
    return axios({
        service:serviceName,//音频技术对应填sami
        Region:region,//访问地区
        access_key:accessKeyId,//
        secret_key:secretKey,
        method: 'POST',
        token_version:authVersion,
        appkey:appKey,
        expiration:expiration, //token 的过期时间，单位是秒
        Content: 'application/json',
        url:'https://open.volcengineapi.com/',
        responseType: 'application/json', // 默认值
        timeout: 0, // 默认值是 `0` (永不超时)
    }).then( res =>{
            // "status_code": 20000000,
            // "status_text": "OK",
            // "task_id": "00000000-0000-0000-0000-000000000000",
            // "token": "eyJhb...Ng",
            // "expires_at": 1626796800
        const { status_code,status_text,task_id,token:token_temp,expires_at } = res
        token_time = new Date().getTime()
        token_expires = expires_at
        token = token_temp

    }).catch(err =>{

        reject(err)
    })
}


// https://sami.bytedance.com
// POST /api/v1/invoke 非流式调用方式
// token	//服务鉴权token，获取方式见服务鉴权-获取token	string	是	-
// appkey	//服务接入appkey。在音频技术控制台创建应用后获得	string	是	-
// namespace	//服务接口命名空间，比如TTS	string	是	-
// data	//服务请求二进制数据，比如音频二进制数据，标准base64编码。	string	否	-
// payload.url	//服务请求数据的url，需要公网公开可访问，比如音频二进制数据 音频示例。若data字段不空，则以data为准；
// //若data字段为空，则使用payload.url下载音频数据	string	否
// payload	//服务请求配置参数，比如音频编码信息等。具体填写要求详见对应API接口说明文档	string	否	-
//     text //输入文本	
//     speaker //发音人，
//     audio_config.speech_rate	//语速 取值范围[-50,100]，100代表2.0倍速，-50代表0.5倍数
//     audio_config.pitch_rate //音调 音调，取值范围[-12,12] 默认0
//     audio_config.enable_timestamp // 是否 bool 选择同时返回字与音素时间戳	

//语音识别接口
function sendTTS(){
    return axios({
        data:{
            payload:{
                text:'我是智能语音小助手湖宝，请问有什么可以帮到你的嘛', //输入文本	
                speaker:'zh_female_qingxin', //发音人，
                audio_config:{
                    // speech_rate:'',//语速
                    // pitch_rate:'', //音调
                    // enable_timestamp:'', // 
                }
            }
        }, //参数
        method: 'POST',
        Content: 'application/json',
        url:'https://sami.bytedance.com/api/v1/invoke',
        responseType: 'application/json', // 默认值
        timeout: 0, // 默认值是 `0` (永不超时)
    }).then( res =>{

    }).catch(err =>{

        reject(err)
    })
}