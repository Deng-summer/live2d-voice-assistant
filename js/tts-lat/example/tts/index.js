  // 邓夏茹
  // const tts_APPID = "9d3bb036";
  // const tts_API_SECRET = "NzBkNThlMjM2YWVjNDhkOWNlN2YwOTk2";
  // const tts_API_KEY = "5010beeaa5fb401e18039ba9db4b9559";

  //jason
  // var tts_APPID = "371291e2";
  // var tts_API_SECRET = "N2YyZjZhNzhkM2VmNDE5Y2IxOTdiZmIx";
  // var tts_API_KEY = "15cef8aebda3f263918938388219c6ea";
  
  //jason jinhua
  var tts_APPID = "68d6bff2";
  var tts_API_SECRET = "YTFmYWZiZWEwOGFmMzFmNjVlNWIzOTVm";
  var tts_API_KEY = "a0c9b7763601a9968f358f1faa6f2539";


  import { ttsWsOnClosed_Singel,singel_recoder_tts_content_play, singel_recoder_tts_content_origin,singel_follow_tts_conntectWebSoket } from '../../../jinhua/control-singel-talk.js'
  import { ttsWsOnClosed_Multi, multi_recoder_tts_content_play, multi_recoder_tts_content_origin,multi_follow_tts_conntectWebSoket } from '../../../jinhua/control-multi-talk.js'
  import { control_mode } from '../../../jinhua/control.js'
  import { triggerMotion,triggerRepeatMotion } from '../../../live2d-cubism4.js'

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
    //判断是否还有文本没有播放
    if(multi_recoder_tts_content_play<multi_recoder_tts_content_origin && control_mode == 'MULTI'){
      // 继续合成流式下一段语音
      multi_follow_tts_conntectWebSoket()
    }else if(singel_recoder_tts_content_play<singel_recoder_tts_content_origin && control_mode == 'SINGEL'){
      singel_follow_tts_conntectWebSoket()
    }
    else{
      tts_btnStatus === "PLAY" && tts_changeBtnStatus("STOP");
      triggerMotion('Idle')
      if(control_mode == 'SINGEL'){
        //通知control-singel-talk 模块
        ttsWsOnClosed_Singel()
      }else if(control_mode == 'MULTI'){
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
          vcn: 'aisbabyxu', //免费 许小宝
          // vcn: 'x4_yezi', //小露发音人
          // vcn:'x4_panting',//潘婷
          // vcn:'x4_xiaoling',//志玲
          speed: 55,//语速([0-100]
          volume: 50,//音量([0-100])
          pitch: 50,//音高([0-100])
          bgs: 0,
          tte, //小语种为unicode 中文为UTF8
          reg:"2",//1：所有英文按字母发音 2：自动判断处理，如果不确定将按照字母朗读
          rdn:"1",//合成音频数字发音方式
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
      if(control_mode == 'SINGEL'){
        //通知control-singel-talk 模块
        ttsWsOnClosed_Singel()
      }else if(control_mode == 'MULTI'){
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

