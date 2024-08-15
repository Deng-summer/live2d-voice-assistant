import { latResultOnChange,latWsOnClosed,latOnload,latWsOnOpened,latWsOnError } from '../../../jinhua/control.js'
// 防止全局污染加上 lat_xxx 命名
  var lat_APPID = "9d3bb036";
  var lat_API_SECRET = "NzBkNThlMjM2YWVjNDhkOWNlN2YwOTk2";
  var lat_API_KEY = "5010beeaa5fb401e18039ba9db4b9559";
  let lat_btnStatus = "UNDEFINED"; // "UNDEFINED" "CONNECTING" "OPEN" "CLOSING" "CLOSED"

  const lat_btnControl = document.getElementById("btn_control");
  
  //起live2D.html 地址
  const lat_recorder = new RecorderManager("../js/iat-js/dist/");
  //起lat-js/example/lat中 index.html 地址
  // const lat_recorder = new RecorderManager("../../dist"); 

  lat_recorder.onStart = () => {
    changeBtnStatus("OPEN");
  }
  let lat_WS;
  let lat_resultText = "";
  let lat_resultTextTemp = "";
  let lat_countdownInterval;

  /**
   * 获取websocket url
   * 该接口需要后端提供，这里为了方便前端处理
   */
  function getWebSocketUrl() {
    // 请求地址根据语种不同变化
    var url = "wss://iat-api.xfyun.cn/v2/iat";
    var host = "iat-api.xfyun.cn";
    var apiKey = lat_API_KEY;
    var apiSecret = lat_API_SECRET;
    var date = new Date().toGMTString();
    var algorithm = "hmac-sha256";
    var headers = "host date request-line";
    var signatureOrigin = `host: ${host}\ndate: ${date}\nGET /v2/iat HTTP/1.1`;
    var signatureSha = CryptoJS.HmacSHA256(signatureOrigin, apiSecret);
    var signature = CryptoJS.enc.Base64.stringify(signatureSha);
    var authorizationOrigin = `api_key="${apiKey}", algorithm="${algorithm}", headers="${headers}", signature="${signature}"`;
    var authorization = btoa(authorizationOrigin);
    url = `${url}?authorization=${authorization}&date=${date}&host=${host}`;
    return url;
  }
  //buffer 转 base64
  function toBase64(buffer) {
    var binary = "";
    var bytes = new Uint8Array(buffer);
    var len = bytes.byteLength;
    for (var i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
    //btoa() 函数是浏览器提供的方法，用于将一个字符串（这里是 binary）转换为 Base64 编码。
  }

  function countdown() {
    let seconds = 60;
    lat_btnControl.innerText = `录音中（${seconds}s）`;
    // if(!lat_countdownInterval){
      lat_countdownInterval = setInterval(() => {
        seconds = seconds - 1;
        if (seconds <= 0) {
          clearInterval(lat_countdownInterval);
          lat_countdownInterval = null
          lat_recorder.stop();
        } else {
          lat_btnControl.innerText = `录音中（${seconds}s）`;
        }
      }, 1000);
    // }
  }

  function changeBtnStatus(status) {
    lat_btnStatus = status;
    if (status === "CONNECTING") {
      lat_btnControl.innerText = "建立连接中";
      // document.getElementById("result").innerText = "";
      lat_resultText = "";
      lat_resultTextTemp = "";
    } else if (status === "OPEN") {
      countdown();
    } else if (status === "CLOSING") {
      lat_btnControl.innerText = "关闭连接中";
    } else if (status === "CLOSED") {
      lat_btnControl.innerText = "开始录音";
    }
  }

  function renderResult(resultData) {
    // 识别结束
    let jsonData = JSON.parse(resultData);
    if (jsonData.data && jsonData.data.result) {
      let data = jsonData.data.result;
      let str = "";
      let ws = data.ws;
      for (let i = 0; i < ws.length; i++) {
        str = str + ws[i].cw[0].w;
      }
      // 开启wpgs会有此字段(前提：在控制台开通动态修正功能)
      // 取值为 "apd"时表示该片结果是追加到前面的最终结果；取值为"rpl" 时表示替换前面的部分结果，替换范围为rg字段
      if (data.pgs) {
        if (data.pgs === "apd") {
          // 将resultTextTemp同步给resultText
          lat_resultText = lat_resultTextTemp;
        }
        // 将结果存储在resultTextTemp中
        lat_resultTextTemp = lat_resultText + str;
      } else {
        lat_resultText = lat_resultText + str;
      }
      //原始识别结果
      // document.getElementById("result").innerText =
      // lat_resultTextTemp || lat_resultText || "";
    }
    if (jsonData.code === 0 && jsonData.data.status === 2) {
      lat_WS.close();
    }
    if (jsonData.code !== 0) {
      lat_WS.close();
      console.error(jsonData);
    }
    latResultOnChange({
      latResult:lat_resultTextTemp || lat_resultText,
      latStatus:lat_btnStatus,
      latWS:lat_WS,
      lat_recorder
    })
  }

  export function lat_connectWebSocket() {
    //开启前检查 检查状态
    // if(lat_WS && lat_WS.readyState === lat_WS.OPEN){
    //   return
    // }
    const websocketUrl = getWebSocketUrl();
    if ("WebSocket" in window) {
      lat_WS = new WebSocket(websocketUrl);
    } else if ("MozWebSocket" in window) {
      lat_WS = new MozWebSocket(websocketUrl);
    } else {
      alert("浏览器不支持WebSocket");
      return;
    }
    changeBtnStatus("CONNECTING");
    lat_WS.onopen = (e) => {
      // 开始录音
      lat_recorder.start({
        sampleRate: 16000,
        frameSize: 1280,
      });
      var params = {
        common: {
          app_id: lat_APPID,
        },
        business: {
          language: "zh_cn",
          domain: "iat",
          accent: "mandarin",
          vad_eos: 1000 * 60,//用于设置端点检测的静默时间，单位是毫秒。
          dwa: "wpgs",
        },
        data: {
          status: 0,
          format: "audio/L16;rate=16000",
          encoding: "raw",
        },
      };
      lat_WS.send(JSON.stringify(params));
      latWsOnOpened()
    };
    lat_WS.onmessage = (e) => {
      renderResult(e.data);
    };
    lat_WS.onerror = (e) => {
      console.error(e);
      lat_recorder.stop();
      changeBtnStatus("CLOSED");
      latWsOnError()
    };
    lat_WS.onclose = (e) => {
      lat_recorder.stop();
      changeBtnStatus("CLOSED");
      latWsOnClosed()
    };
    latOnload({latWS:lat_WS,lat_recorder})
  }

  lat_recorder.onFrameRecorded = ({ isLastFrame, frameBuffer }) => {
    if (lat_WS.readyState === lat_WS.OPEN) {
      lat_WS.send(
        JSON.stringify({
          data: {
            status: isLastFrame ? 2 : 1,
            format: "audio/L16;rate=16000",
            encoding: "raw",
            audio: toBase64(frameBuffer),
          },
        })
      );
      if (isLastFrame) {
        changeBtnStatus("CLOSING");
      }
    }
  };
  lat_recorder.onStop = () => {
    clearInterval(lat_countdownInterval);
  };

  lat_btnControl.onclick = function () {
    if (lat_btnStatus === "UNDEFINED" || lat_btnStatus === "CLOSED") {
      //开始录音
      lat_connectWebSocket();
    } else if (lat_btnStatus === "CONNECTING" || lat_btnStatus === "OPEN") {
      // 结束录音
      lat_recorder.stop();
    }
  };


