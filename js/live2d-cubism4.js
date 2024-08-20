const mikongModel = '../../../model/rourou/rourou.model3.json'
const mikongMotionIdle = '../../../model/rourou/IDLE.motion3.json'
const jinhuaModel = '../../../model/jinhua/jinhua.model3.json'
const jinhuaMotionIdle = '../../../model/jinhua/IDLE.motion3.json'

const haruModel = '../../../model/haru/haru_greeter_t03.model3.json'
// const haruMotionM05 = '../../../model/haru/motion/haru_g_m05.motion3.json'

const live2d = PIXI.live2d;
var model = {}
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

    const scaleX = (innerWidth * 0.8) / model.width;
    const scaleY = (innerHeight * 0.8) / model.height;
    model.scale.set(Math.min(scaleX, scaleY)); //缩放大小 
    model.x = 100;
    model.y = 100;

    console.log(live2d)
    // debugger
    var idleMotion = null;
    // 加载 IDLE 动作
    // idleMotion = await live2d.Live2DMotion.from(jinhuaMotionIdle);

    // 播放 IDLE 动作
    model.motion("IDLE", 0, true); 

    //     idleMotion 是加载的动作对象。
    //0    表示默认优先级，true 表示循环播放
    //true 表示循环播放该动作。如果你不希望循环播放，可以将其设为 false。

    
    // model.width = 800
    // model.height = 700

    // model.scale.set(0.7);
    
    // draggable(model);
    //表情触发
    // setInterval(() => {
        // model.expression()
        // ParamMouthForm //嘴变形参数名
        // model.expression('手持麦克风')
        // model.expression('说话')
        // model.focus(0, 0)
    // }, 5000);

    // Set mouth parameter periodically
    // setInterval(() => {
        //没用的代码
        // model.defaultMotionGroup.parameterValues.setParameter('ParamMouthForm', 1);
        // model.setParameterValueById("ParamMouthForm", 1);
    // }, 5000);

    // const settings = {
    //     motions: {
    //         sleepy: [
    //             { file: "../../../haru/motion/haru_g_m05.motion3.json", fade_in: 0.5, fade_out: 0.5 },
    //         ],
    //     },
    //     expressions: true // 表情是否可用，根据你的需求设置
    // };
    // const customParameters = {
    //     idle: haruMotionM05,
    //     // sleepy: mikongMotionSleepy,
    //     // talk: mikongMotionTalk
    // };
    // const motionManager = new live2d.Cubism2MotionManager(settings, customParameters);
    
    //睡眠动作触发
    // setInterval(() => {
        // console.log('start motion')
        // motionManager.startMotion('sleepy');
        // model.motion('sleepy',0) //这段 触发自定义Tap动作
    // }, 5000);

    //说话动作触发
    // setInterval(() => {
        // console.log('model.focus')
        // motionManager.startMotion('sleepy');
        // model.motion('Tap',0)
        // model.focus(0, 0)
    // }, 100);
}
// 控制说话和不说话状态
// setTimeout(()=>{
//     motionTalk(true)
// },3000)

var timerTalk = null
function motionTalk(start){
    // let switchFlag = false
    // timerTalk && clearInterval(timerTalk)


    // if(start){
    //     timerTalk = setInterval(() => {
    //         // model.expression()
    //         // ParamMouthForm //嘴变形参数名
    //         // model.expression('手持麦克风')
    //         switchFlag = !switchFlag
    //         let expressName = ''
    //         if(switchFlag){
    //             const options = ['说话'];
    //             const randomIndex = Math.floor(Math.random() * options.length)
    //             expressName = options[randomIndex];
    //         }else{
    //             expressName = '闭嘴'
    //         }
    //         model.expression(expressName)
    //     }, 400)
    // }else{
    //     timerTalk = setInterval(() => {
    //         const options = ['爱心眼', '抱住贝壳手','带虎牙闭嘴','带虎牙闭嘴','高光消失',
    //             '口水','哭','蓝泳圈','脸黑','脸红','帽子',
    //             '眯眯眼','抹胸替换','墨镜','圈圈眼','三角嘴',
    //             '瞳色切换','吐舌头','外套开关','星星眼','泳圈'];
    //         // const options = ['不说话1','不说话2','不说话3','不说话4']
    //         const randomIndex = Math.floor(Math.random() * options.length)
    //         model.expression('爱心眼') //随机表情
    //     },2000)
    // }
}
// async function live2dMain() {
//     console.log(live2d)
//     const priority = live2d.MotionPriority //FORCE: 3IDLE: 1NONE: 0NORMAL: 2

//     const app = new PIXI.Application({
//         view: document.getElementById("canvaslive2d4"),
//         autoStart: true,
//         resizeTo: window,
//         backgroundColor: 0x647
//     });

//     const models = await Promise.all([
//         // live2d.Live2DModel.from(cubism2Model),
//         // live2d.Live2DModel.from(cubism4Model),
//         live2d.Live2DModel.from(mikongModel),
//     ]);

//     models.forEach((model) => {
//         app.stage.addChild(model);
//         const scaleX = (innerWidth * 0.4) / model.width;
//         const scaleY = (innerHeight * 0.8) / model.height;
//         // fit the window
//         model.scale.set(Math.min(scaleX, scaleY));
//         model.x = 0
//         model.scale.set(0.6);
//         // model.y = innerHeight ;
//         // draggable(model);
//         // addFrame(model);
//         // addHitAreaFrames(model);
//     });

//     const modelMikong = models[0];
//     const loader = new PIXI.Loader();

//     loader
//     .add("idle_motion", mikongMotionIdle)
//     .add("sleepy_motion", mikongMotionSleepy)
//     .add("talk_motion", mikongMotionTalk)
//     .load((loader, resources) => {
//         const idleMotionData = resources["idle_motion"].data;
//         const sleepyMotionData = resources["sleepy_motion"].data;
//         const talkMotionData = resources["talk_motion"].data;

//         console.log(idleMotionData,sleepyMotionData,talkMotionData,modelMikong.motion)
//         // modelMikong.motion(sleepyMotionData);
//         // modelMikong.motion('Idle');

//          // 在一定时间后触发其他动作，例如6秒后触发睡觉动作
//         setInterval(() => {
//             console.log('sleepy')
//             // modelMikong.motion(sleepyMotionData);
//             modelMikong.motion('Sleepy', 0,priority.FORCE)
//             modelMikong.motion('SLEEPY', 0,priority.FORCE)

//         }, 4000);
//     });
// }

function draggable(model) {
    model.buttonMode = true;
    model.on("pointerdown", (e) => {
        model.dragging = true;
        model._pointerX = e.data.global.x - model.x;
        model._pointerY = e.data.global.y - model.y;
    });
    model.on("pointermove", (e) => {
        if (model.dragging) {
        model.position.x = e.data.global.x - model._pointerX;
        model.position.y = e.data.global.y - model._pointerY;
        }
    });
    model.on("pointerupoutside", () => (model.dragging = false));
    model.on("pointerup", () => (model.dragging = false));
}

// function addFrame(model) {
//     const foreground = PIXI.Sprite.from(PIXI.Texture.WHITE);
//     foreground.width = model.internalModel.width;
//     foreground.height = model.internalModel.height;
//     foreground.alpha = 0.2;

//     model.addChild(foreground);

//     checkbox("Model Frames", (checked) => (foreground.visible = checked));
// }

// function addHitAreaFrames(model) {
//     const hitAreaFrames = new live2d.HitAreaFrames();

//     model.addChild(hitAreaFrames);

//     checkbox("Hit Area Frames", (checked) => (hitAreaFrames.visible = checked));
// }

// function checkbox(name, onChange) {
//     const id = name.replace(/\W/g, "").toLowerCase();

//     let checkbox = document.getElementById(id);

//     if (!checkbox) {
//         const p = document.createElement("p");
//         p.innerHTML = `<input type="checkbox" id="${id}"> <label for="${id}">${name}</label>`;

//         document.getElementById("control").appendChild(p);
//         checkbox = p.firstChild;
//     }

//     checkbox.addEventListener("change", () => {
//         onChange(checkbox.checked);
//     });

//     onChange(checkbox.checked);
// }
