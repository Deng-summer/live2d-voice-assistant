// import { onMounted, onUnmounted, reactive } from "vue";

/**属性状态 */
const state = {
    /**初始化模型加载 */
    netsLoadModel: true,
    /**算法模型 */
    netsType: "ssdMobilenetv1",
    /**模型参数 */
    netsOptions: {
        ssdMobilenetv1: undefined,
        tinyFaceDetector: undefined,
        mtcnn: undefined,
    },
    /**检测人脸 多或单 */
    detectFace: "detectAllFaces",
    /**面框分值, 面部轮廓, 面部表情, 年龄性别 */
    draws: ["box", "landmark", "expression", "ageGender"],
    // draws:["box"],
    /**视频元素 */
    videoEl: null,
    /**画布图层元素 */
    canvasEl: null,
    /**绘制定时器 */
    timer: 0,
    /**视频媒体参数配置 */
    constraints: {
        audio: false,
        video: {
        /**ideal（应用最理想的） */
        width: {
            min: 320,
            // ideal: 720,
            ideal: window.innerWidth,
            max: window.innerWidth,
        },
        height: {
            min: 200,
            // ideal: 480,
            ideal: window.innerHeight,
            max: window.innerHeight,
        },
        /**frameRate 受限带宽传输时，低帧率可能更适宜 */
        frameRate: {
            min: 7,
            ideal: 15,
            max: 30,
        },
        /**facingMode 摄像头前后切换 */
        facingMode: "environment",
        },
    },
    /**视频流 */
    stream: null,
}
/**初始化模型加载 */
async function fnLoadModel() {
    // 面部轮廓模型
    await faceapi.loadFaceLandmarkModel("/js/public/models");
    // 面部表情模型
    await faceapi.loadFaceExpressionModel("/js/public/models");
    // 年龄性别模型
    await faceapi.loadAgeGenderModel("/js/public/models");

    // 模型参数-ssdMobilenetv1
    await faceapi.nets.ssdMobilenetv1.loadFromUri("/js/public/models");
    state.netsOptions.ssdMobilenetv1 = new faceapi.SsdMobilenetv1Options({
        minConfidence: 0.5, // 0.1 ~ 0.9
    });
    // 模型参数-tinyFaceDetector
    await faceapi.nets.tinyFaceDetector.loadFromUri("/js/public/models");
    state.netsOptions.tinyFaceDetector = new faceapi.TinyFaceDetectorOptions({
        inputSize: 224, // 160 224 320 416 512 608
        scoreThreshold: 0.5, // 0.1 ~ 0.9
    });
    // 模型参数-mtcnn 已弃用，将很快被删除
    await faceapi.nets.mtcnn.loadFromUri("/js/public/models");
    state.netsOptions.mtcnn = new faceapi.MtcnnOptions({
        minFaceSize: 20, // 1 ~ 50
        scaleFactor: 0.56, // 0.1 ~ 0.9
    });

    // 节点元素
    state.videoEl = document.getElementById("page_draw-video");
    state.canvasEl = document.getElementById("page_draw-video-canvas");

    // 关闭模型加载
    state.netsLoadModel = false;
    console.log('fnLoadModel 初始化模型加载')
}

/**根据模型参数识别绘制 */
async function fnRedraw() {
    if (!state.videoEl || !state.canvasEl) return;
    // console.log("Run Redraw");
    // 暂停视频时清除定时
    if (state.videoEl.paused) {
        clearTimeout(state.timer);
        state.timer = 0;
        return;
    }
    // 识别绘制人脸信息
    const detect = await faceapi[state.detectFace](
        state.videoEl,
        state.netsOptions[state.netsType]
    )
        // 需引入面部轮廓模型
        .withFaceLandmarks()
        // 需引入面部表情模型
        .withFaceExpressions()
        // 需引入年龄性别模型
        .withAgeAndGender();
    // 无识别数据时，清除定时重新再次识别
    if (!detect) {
        clearTimeout(state.timer);
        state.timer = 0;
        fnRedraw();
        return;
    }
    // 匹配元素大小
    const dims = faceapi.matchDimensions(state.canvasEl, state.videoEl, true);
    const result = faceapi.resizeResults(detect, dims);
    // 面框分值
    // if (state.draws.includes("box")) {
        // faceapi.draw.drawDetections(state.canvasEl, result);
        // console.log(result[0].detection.box._width>300)
    // }
    // 面部轮廓
    // if (state.draws.includes("landmark")) {
    //     // 需引入面部轮廓模型
    //     faceapi.draw.drawFaceLandmarks(state.canvasEl, result);
    // }
    // 面部表情
    if (state.draws.includes("expression")) {
        // 需引入面部表情模型
        faceapi.draw.drawFaceExpressions(state.canvasEl, result, 0.05);
    }
    console.log('expression',result)
    // 年龄性别
    // if (state.draws.includes("ageGender")) {
    //     // 需引入年龄性别模型模型
    //     const drawItem = (item) => {
    //         const { age, gender, genderProbability } = item;
    //         new faceapi.draw.DrawTextField(
    //             [
    //             `${Math.round(age)} Age`,
    //             `${gender} (${Math.round(genderProbability)})`,
    //             ],
    //             item.detection.box.topRight
    //         ).draw(state.canvasEl);
    //     };
    //     // 多结果
    //     if (Array.isArray(result)) {
    //         result.forEach((item) => drawItem(item));
    //     } else {
    //         drawItem(result);
    //     }
    // }
    // 定时器句柄
    state.timer = setTimeout(() => fnRedraw(), 5000);
    let x = window.innerWidth - result[0]?.detection.box.x +  result[0]?.detection.box._width/2//获取 人脸绘制结果的x坐标
    let y = result[0]?.detection.box.y +  result[0]?.detection.box._height/2//获取 人脸绘制结果的y坐标
    if(x>0 && y>0){
        //节流版
        throttledEyeMove(Math.floor(x), Math.floor(y));
        //不节流版
        // eyeMove(Math.floor(x), Math.floor(y))
    }
}
function throttle(func, wait) {
    let previous = 0;
    return function() {
        const now = Date.now();
        const context = this;
        const args = arguments;
        if (now - previous > wait) {
        func.apply(context, args);
            previous = now;
        }
    };
}
// 使用节流函数包装 eyeMove 函数
const throttledEyeMove = throttle(eyeMove, 50);
/**启动摄像头视频媒体 */
async function fnOpen() {
    if (state.stream) return;
    if (!state.videoEl) {
        state.videoEl = document.getElementById("page_draw-video");
        if (!state.videoEl) {
            console.error("无法找到视频元素");
            return;
        }
    }

    if (!state.canvasEl) {
        state.canvasEl = document.getElementById("page_draw-video-canvas");
        if (!state.canvasEl) {
            console.error("无法找到画布元素");
            return;
        }
    }
    try {
        state.stream = {}; // 置为空对象，避免重复点击
        const stream = await navigator.mediaDevices.getUserMedia(state.constraints);
        state.stream = stream;
        state.videoEl.srcObject = stream;
        state.videoEl.play();
        setTimeout(() => fnRedraw(), 300);
    } catch (error) {
        state.stream = null; // 置为空，可点击
        console.error(error);
        alert("视频媒体流获取错误: " + error);
    }
}

/**结束摄像头视频媒体 */
function fnClose() {
    if (state.stream === null) return;
    state.videoEl.pause();
    state.videoEl.srcObject = null;
    state.stream.getTracks().forEach((track) => track.stop());
    state.stream = null;
    clearTimeout(state.timer);
    state.timer = 0;

    setTimeout(() => {
        // 清空画布
        state.canvasEl
        .getContext("2d")
        .clearRect(0, 0, state.canvasEl.width, state.canvasEl.height);
    }, 300);
}

/**
 * 视频暂停播放
 *
 * 播放视频，开始识别绘制
 *
 * 暂停视频，不清除画布
 */
function fnVidelPaused() {
    if (state.videoEl.paused) {
        state.videoEl.play();
        setTimeout(() => fnRedraw(), 300);
    } else {
        state.videoEl.pause();
    }
}

/**更换视频 */
function fnChange(e) {
    if (!state.videoEl || !state.canvasEl) return;
    if (!e.target || !e.target.files.length) return;
    // 将文件显示为视频并识别
    state.videoEl.pause();
    state.videoEl.src = URL.createObjectURL(e.target.files[0]);
    clearTimeout(state.timer);
    state.timer = 0;

    setTimeout(() => {
        // 清空画布
        state.canvasEl
        .getContext("2d")
        .clearRect(0, 0, state.canvasEl.width, state.canvasEl.height);
    }, 300);
}


window.addEventListener('load', async (event) => {
    await fnLoadModel();
    await fnOpen() //button按钮控制
    // 在这里执行你想要在页面加载完成后执行的操作
});
window.addEventListener('beforeunload', (event) => {
    console.log('beforeunload');
    fnClose()
    clearTimeout(state.timer);
    state.timer = 0;
});

