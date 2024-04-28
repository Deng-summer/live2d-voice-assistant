// const cubism2Model =
// "https://cdn.jsdelivr.net/gh/guansss/pixi-live2d-display/test/assets/shizuku/shizuku.model.json";
// const cubism4Model =
// "https://cdn.jsdelivr.net/gh/guansss/pixi-live2d-display/test/assets/haru/haru_greeter_t03.model3.json";

var mikongModel = '../../../ai/ai.model3.json'

async function loadModleFile(){
    await fetch('../../../ai/ai.model3.json')
    .then(response => {
        if (!response.ok) {
        throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        console.log(data);
        mikongModel = data
        // 在这里对返回的JSON数据进行操作
    })
    .catch(error => {
        console.error('There was a problem with the fetch operation:', error);
    });
}

async function live2dMain() {
    // await loadModleFile()
    const app = new PIXI.Application({
        view: document.getElementById("canvaslive2d4"),
        autoStart: true,
        resizeTo: window,
        backgroundColor: 0x647,
    });

    // const model2 = await PIXI.live2d.Live2DModel.from(cubism2Model);
    // const model4 = await PIXI.live2d.Live2DModel.from(cubism4Model);
    const modelMikong = await PIXI.live2d.Live2DModel.from(mikongModel);
    // app.stage.addChild(model2);
    // app.stage.addChild(model4);
    app.stage.addChild(modelMikong);
    // model2.scale.set(0.3);
    // model4.scale.set(0.25);
    modelMikong.x = 0;
    modelMikong.scale.set(0.6);
}
