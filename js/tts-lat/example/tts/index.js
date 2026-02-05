// 邓夏茹
// const tts_APPID = "9d3bb036";
// const tts_API_SECRET = "NzBkNThlMjM2YWVjNDhkOWNlN2YwOTk2";
// const tts_API_KEY = "5010beeaa5fb401e18039ba9db4b9559";

//jason
// var tts_APPID = "371291e2";
// var tts_API_SECRET = "N2YyZjZhNzhkM2VmNDE5Y2IxOTdiZmIx";
// var tts_API_KEY = "15cef8aebda3f263918938388219c6ea";

//jason jinhua
// var tts_APPID = "41d33e78";
// var tts_API_SECRET = "NWM4ZDMwZDA4YzU5NmNjOGQ5NTE1Y2Mx";
// var tts_API_KEY = "7466275c8bb1d6ca274ec46bb2eadc3d";

// dxr2
//var tts_APPID = "e3c362d4";
//var tts_API_SECRET = "NWM4ZDMwZDA4YzU5NmNjOGQ5NTE1Y2Mx";
//var tts_API_KEY = "7466275c8bb1d6ca274ec46bb2eadc3d";

// panke
//var tts_APPID = "ebb6ffab"
//var tts_API_SECRET = "MTJiYjU4NTVhMzY1YzY4ZDUzYzQwMDIx"
//var tts_API_KEY = "022cdbe61dcc721ad6b14b24e344795d"

//var tts_APPID = "de2e6072"
//var tts_API_SECRET = "YTYxZjJiMWQ4YmI5M2Y3Mzc3MWViMTkz"
//var tts_API_KEY = "eb303cb179bf8ef828493712cb819010"

// maoqian  2025.2.7 15:31
//var tts_APPID = "8234b2b4"
//var tts_API_SECRET = "NDA5NDIzNDBhODRmMzY3NzYzMTViZWZi"
//var tts_API_KEY = "bed3c35248c342bd72c01d08499c8780"

// maoqian2 2025.2.27 10:32
//var tts_APPID = "dd3cc58a"
//var tts_API_SECRET = "YzQxODVmYTU0MDEwZWQ4Zjc1ZWEwZmIx"
//var tts_API_KEY = "5c834e6d4e6f5ae3e28406768ab340d5"

// jianxin 2025.3.24 9:55
//var tts_APPID = "704c6226"
//var tts_API_SECRET = "NTk3NDM2ZTU3ZThkNTUyY2FhYTE4OGQ4"
//var tts_API_KEY = "c760a6eb09be2c6a053aa9c9889f93b8"

// xueting 2025.4.1 15:09
//var tts_APPID = "f7e8d347"
//var tts_API_SECRET = "OWM2ZTY5YmViNzliMzNlZjhlN2JlZTY0"
//var tts_API_KEY = "f22d3f94bdee48219de2ca8e43756c80"

// panke 2025.4.21 09:51
//var tts_APPID = "e0e5fc53"
//var tts_API_SECRET = "YWI1M2NiZTUyNzdjY2UxMTdlOWNiODUy"
//var tts_API_KEY = "da3e23eeef12fa93be218f226e4c966d"

//zexin 2025.05.21 00:00到期
//var tts_APPID = "493f6442"
//var tts_API_SECRET = "OTUyZDVkOTQzMWMzM2RiZTkyOTE4YTk1"
//var tts_API_KEY = "d1836921aa827f8dd463ae96e1e54c35"

//zexin 2025.06.05 00:00到期
// var tts_APPID = "81518a85"
// var tts_API_SECRET = "ODIwZjk4OWQyYjQxNTk2N2QwMTQ2ZGQ0"
// var tts_API_KEY = "f2e79959f5198e8b35d677e117cbbe11"

// This APPID is used for https://avatar.chekkk.com/0001/. Last modified on May 24, 2025.
// var tts_APPID = "81518a85"
// var tts_API_SECRET = "ODIwZjk4OWQyYjQxNTk2N2QwMTQ2ZGQ0"
// var tts_API_KEY = "f2e79959f5198e8b35d677e117cbbe11"

//17301386690
// var tts_APPID = "67a20db7"
// var tts_API_SECRET = "OTgxOWZjOTU1ZmE3MjZkZmQ5YjhkNDEw"
// var tts_API_KEY = "bb3b8c1da17492f6b1562db0c9d24e69"

var tts_APPID = "864add85"
var tts_API_SECRET = "NTI0ZTZjODdjYzYwYzFjNDU3OGI5NmM5"
var tts_API_KEY = "bf7628beabdaab738649fe5163dbcb97"

import { ttsWsOnClosed_Singel, singel_recoder_tts_content_play, singel_recoder_tts_content_origin, singel_follow_tts_conntectWebSoket } from '../../../jinhua/control-singel-talk.js'
import { ttsWsOnClosed_Multi, multi_recoder_tts_content_play, multi_recoder_tts_content_origin, multi_follow_tts_conntectWebSoket } from '../../../jinhua/control-multi-talk.js'
import { control_mode } from '../../../jinhua/control.js'
import { triggerMotion, triggerRepeatMotion } from '../../../live2d-cubism4.js'

// let tts_btnControl = document.getElementById("controll_tts");
let tts_btnStatus = "UNDEFINED"; // "UNDEFINED" "CONNECTING" "PLAY" "STOP"
function tts_changeBtnStatus(status) {
  tts_btnStatus = status;
  if (status === "UNDEFINED") {
    // tts_btnControl.innerText = "立即合成";
  } else if (status === "CONNECTING") {
    // tts_btnControl.innerText = "正在合成";
  } else if (status === "PLAY") {
    // tts_btnControl.innerText = "停止播放";
  } else if (status === "STOP") {
    // tts_btnControl.innerText = "重新播放";
  }
}

export const tts_audioPlayer = new AudioPlayer("/js/tts-lat/dist/");
tts_audioPlayer.onPlay = () => {
  tts_changeBtnStatus("PLAY");
  triggerRepeatMotion('Talk')
};
//播放完成
tts_audioPlayer.onStop = (audioDatas) => {
  // console.log(audioDatas);
  console.log('[DEBUG TTS结束] play长度:', multi_recoder_tts_content_play.length, 'origin长度:', multi_recoder_tts_content_origin.length, '模式:', control_mode);
  //判断是否还有文本没有播放（比较长度，不是字典序）
  if (multi_recoder_tts_content_play.length < multi_recoder_tts_content_origin.length && control_mode == 'MULTI') {
    console.log('[DEBUG TTS结束] 继续播放下一段');
    // 继续合成流式下一段语音
    multi_follow_tts_conntectWebSoket()
  } else if (singel_recoder_tts_content_play.length < singel_recoder_tts_content_origin.length && control_mode == 'SINGEL') {
    singel_follow_tts_conntectWebSoket()
  }
  else {
    console.log('[DEBUG TTS结束] 所有内容播放完毕，结束TTS');
    tts_btnStatus === "PLAY" && tts_changeBtnStatus("STOP");
    triggerMotion('Idle')
    if (control_mode == 'SINGEL') {
      //通知control-singel-talk 模块
      ttsWsOnClosed_Singel()
    } else if (control_mode == 'MULTI') {
      //通知control-multi-talk 模块
      ttsWsOnClosed_Multi()
    }
  }
};

function tts_getWebSocketUrl(apiKey, apiSecret) {
  var url = "wss://tts-api.xfyun.cn/v2/tts";
  var host = location.host;
  var date = new Date().toGMTString();
  var algorithm = "hmac-sha256";
  var headers = "host date request-line";
  var signatureOrigin = `host: ${host}\ndate: ${date}\nGET /v2/tts HTTP/1.1`;
  var signatureSha = CryptoJS.HmacSHA256(signatureOrigin, apiSecret);
  var signature = CryptoJS.enc.Base64.stringify(signatureSha);
  var authorizationOrigin = `api_key="${apiKey}", algorithm="${algorithm}", headers="${headers}", signature="${signature}"`;
  var authorization = btoa(authorizationOrigin);
  url = `${url}?authorization=${authorization}&date=${date}&host=${host}`;
  return url;
}
function encodeText(text, type) {
  if (type === "unicode") {
    let buf = new ArrayBuffer(text.length * 4);
    let bufView = new Uint16Array(buf);
    for (let i = 0, strlen = text.length; i < strlen; i++) {
      bufView[i] = text.charCodeAt(i);
    }
    let binary = "";
    let bytes = new Uint8Array(buf);
    let len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  } else {
    return Base64.encode(text);
  }
}

let ttsWS;
export function tts_connectWebSocket(tts_text) {
  // console.log('tts_connectWebSocket',tts_text)

  const url = tts_getWebSocketUrl(tts_API_KEY, tts_API_SECRET);

  //连接已存在 直接发送消息
  // if(ttsWS && ttsWS.readyState === ttsWS.OPEN){
  //   tts_sendTextWebSocket(tts_text)
  //   return
  // }

  if ("WebSocket" in window) {
    ttsWS = new WebSocket(url);
  } else if ("MozWebSocket" in window) {
    ttsWS = new MozWebSocket(url);
  } else {
    alert("浏览器不支持WebSocket");
    return;
  }

  tts_changeBtnStatus("CONNECTING");

  ttsWS.onopen = (e) => {
    tts_audioPlayer.start({
      autoPlay: true,
      sampleRate: 16000,
      resumePlayDuration: 1000
    });
    tts_changeBtnStatus("PLAY");
    var text = tts_text;
    // var tte = document.getElementById("tte").checked ? "unicode" : "UTF8";
    var tte = 'UTF8'
    var params = {
      common: {
        app_id: tts_APPID,
      },
      business: {
        aue: "raw",
        auf: "audio/L16;rate=16000",
        // vcn: 'xiaofeng', //发音人
        // vcn: 'aisbabyxu', //免费 许小宝
        vcn: 'x4_yezi', //小露发音人
        // vcn: 'x4_lingxiaowan_en', //小婉
        //vcn: 'x4_lingxiaoyao_em',
        // vcn:'x4_panting',//潘婷
        // vcn:'x4_xiaoling',//志玲
        speed: 55,//语速([0-100]
        volume: 50,//音量([0-100])
        pitch: 50,//音高([0-100])
        bgs: 0,
        tte, //小语种为unicode 中文为UTF8
        reg: "2",//1：所有英文按字母发音 2：自动判断处理，如果不确定将按照字母朗读
        rdn: "1",//合成音频数字发音方式
      },
      data: {
        status: 2,
        text: encodeText(text, tte),
      },
    };
    // console.log('tts_send 1',tts_text)

    ttsWS.send(JSON.stringify(params));
  };
  ttsWS.onmessage = (e) => {
    let jsonData = JSON.parse(e.data);

    // 合成失败
    if (jsonData.code !== 0) {
      console.error(jsonData);
      tts_changeBtnStatus("UNDEFINED");
      return;
    }

    tts_audioPlayer.postMessage({
      type: "base64",
      data: jsonData.data.audio,
      isLastData: jsonData.data.status === 2,
    });

    if (jsonData.code === 0 && jsonData.data.status === 2) {
      ttsWS.close()
    }

  };

  ttsWS.onerror = (e) => {
    if (control_mode == 'SINGEL') {
      //通知control-singel-talk 模块
      ttsWsOnClosed_Singel()
    } else if (control_mode == 'MULTI') {
      //通知control-multi-talk 模块
      ttsWsOnClosed_Multi()
    }
    console.error(e);
  };
  ttsWS.onclose = (e) => {

    // console.log(e);
  };
}
// document.getElementById("controll_tts").onclick = function () {
//   if (tts_btnStatus === "UNDEFINED") {
//     // 开始合成
//     tts_connectWebSocket();
//   } else if (tts_btnStatus === "CONNECTING") {
//     // 停止合成
//     tts_changeBtnStatus("UNDEFINED");
//     ttsWS?.close();
//     tts_audioPlayer.reset();
//     return;
//   } else if (tts_btnStatus === "PLAY") {
//     tts_audioPlayer.stop();
//   } else if (tts_btnStatus === "STOP") {
//     tts_audioPlayer.play();
//   }
// };

