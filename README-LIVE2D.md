#    live2d-cubism4 
##   模型初始化
```
async function live2dMain() {
    
    const app = new PIXI.Application({
        view: document.getElementById("canvaslive2d4"),
        autoStart: true,
        resizeTo: window,
        backgroundColor: 0xf0f2f5,
        interactive:false,
        focus:false,
    });
    //测试haru Tap动作 成功
    // const model = await live2d.Live2DModel.from(haruModel);
    model = await live2d.Live2DModel.from(jinhuaModel);
    // model.focus = ()=>{} //关闭眼神追捕
    // console.log(model)
    app.stage.addChild(model);

    // console.log(model)
    // console.log(live2d)

    const scaleX = (innerWidth * 0.8) / model.width;
    const scaleY = (innerHeight * 0.8) / model.height;
    model.scale.set(Math.min(scaleX, scaleY)); //缩放大小 
    model.x = 100;
    model.y = 100;
}
```
#    动作触发
#    model.motion("Tap", 0); 

#    表情触发
#    model.expression('说话2秒动画开关')

#    参数配置  xxx.cdi3.json
#    model.internalModel.coreModel.setParameterValueById("WaveButton", 1);
#

