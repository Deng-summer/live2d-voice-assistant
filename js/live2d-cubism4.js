
const mikongModel = '../../../model/rourou/rourou.model3.json'
const mikongMotionIdle = '../../../model/rourou/IDLE.motion3.json'
// const jinhuaModel = '../../../model/jinhua/jinhua.model3.json'
// const jinhuaMotionIdle = '../../../model/jinhua/IDLE.motion3.json'

const jinhuaModel = '../../../model/jinhua_3/jinhua0823.model3.json'
const jinhua_Idle = '../../../model/jinhua_3/motions/IDLE.motion3.json'
const jinhua_Nod = '../../../model/jinhua_3/motions/nod.motion3.json'
const jinhua_Song = '../../../model/jinhua_3/motions/song.motion3.json'
const jinhua_Talk = '../../../model/jinhua_3/motions/talk10s.motion3.json'
const jinhua_Think = '../../../model/jinhua_3/motions/think.motion3.json'
const jinhua_Wave = '../../../model/jinhua_3/motions/wave.motion3.json'

const haruModel = '../../../model/haru/haru_greeter_t03.model3.json'
const haruMotionM05 = '../../../model/haru/motion/haru_g_m05.motion3.json'
//动作 Song:Talk:Nod:Idle:Think:Wave:
//表情 
    // 'wuyanjing':'yanjing', // 没有👓
    // 'maohan':'maohan', //冒汗 需要idle循环
    // 'ruizhi':'expression2', //睿智
    // 'xuanyun':'expression3',
    // 'gaoxing':'expression4',
    // 'wuyu':'expression5', //无语
    // 'shengqi':'expression6',//生气
    // 'shuijiao':'expression7',
    // 'daidai':'expression8',
    // 'zusang':'expression9',//沮丧
    // 'jingzhang':'expression10',
    // 'yinyue':'expression11', //紧张

const live2d = PIXI.live2d;
export var model = {}
const useModelJson = jinhuaModel //使用的皮套模型

export async function live2dMain() {
    
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
    model = await live2d.Live2DModel.from(useModelJson);
    // model.focus = ()=>{} //关闭眼神追捕
    // console.log(model)
    app.stage.addChild(model);

    // console.log(model)
    // console.log(live2d)

    const scaleX = (innerWidth * 0.8) / model.width;
    const scaleY = (innerHeight * 0.8) / model.height;
    model.scale.set(Math.min(scaleX, scaleY)); //缩放大小 
    model.x = innerWidth * 0.1;
    model.y = innerHeight * 0.2;


    //循环播放动作Tap
    // debugger
    // model.motionManager.startMotion("Tap", {
    //     loop: true, // 循环播放
    // });
    // debugger
    // setTimeout(()=>{
    //     model.expression('招手动画开关')
    // },2000)
    // model.expression('说话2秒动画开关')
    // model.focus = () => {}

    //表情触发
    // setInterval(() => {
        // model.expression()
        // ParamMouthForm //嘴变形参数名
        // model.expression('手持麦克风')
        // model.expression('说话')
        // model.focus(0, 0)
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
    triggerMotion('Idle')
}
setTimeout(()=>{
    triggerExpression('empty')
},3000)

//触发表情
export function triggerExpression(express_name){
    let express_name_map = {
        'wuyanjing':'yanjing', // 没有👓
        'maohan':'maohan', //冒汗 需要idle循环
        'nomal':'expression1', //没有表情
        'ruizhi':'expression2', //睿智
        'xuanyun':'expression3',
        'gaoxing':'expression4',
        'wuyu':'expression5', //无语
        'shengqi':'expression6',//生气
        'shuijiao':'expression7',
        'daidai':'expression8',
        'zusang':'expression9',//沮丧
        'jingzhang':'expression10',
        'yinyue':'expression11', //紧张
        'empty':'empty' //空脸 空脸在viewer生效 在这里不生效
        // kong:'expression12', //没有脸
    }
    
    let name  = express_name_map[express_name] || 'expression1'
    if(model.expression){
        console.log('触发 model expression',express_name)
        model.expression(name)
    }
}


let live2d_motion_timer
let live2d_motion_name = "Idle"

export function triggerRepeatMotion(motion_name){
    //终止循环
    if(live2d_motion_timer){
        clearInterval(live2d_motion_timer)
        live2d_motion_timer = null
    }

    live2d_motion_name = motion_name
    const motion_duration = {
        Song:7000 + 40,
        Talk:10000 + 80,
        Nod:3533 + 40,
        Idle:5000 + 40,
        Think:5000 + 40,
        Wave:6367 + 40
    }
    let play_time = motion_duration[live2d_motion_name] || 3000

    const priority = live2d.MotionPriority //FORCE: 3 IDLE: 1 NONE: 0 NORMAL: 2
    // 加载 Tap 动作  0 重复次数  优先级 FORCE
    if(model.motion){
        triggerExpression('empty')
        console.log('触发 开始动作',live2d_motion_name)
        model.motion(live2d_motion_name, 0 ,priority.FORCE)
    }

    if(!live2d_motion_timer){
        live2d_motion_timer = setInterval(()=>{
            if(model.motion){
                console.log('触发 开始动作',live2d_motion_name)
                model.motion(live2d_motion_name, 0 ,priority.FORCE)
            }

        },play_time)
    }
    
}

export function triggerMotion(motion_name){
    const priority = live2d.MotionPriority //FORCE: 3 IDLE: 1 NONE: 0 NORMAL: 2
    // 加载 Tap 动作  0 重复次数  优先级 FORCE
    
    if(model.motion){
        triggerExpression('empty')
        console.log('触发 开始动作',live2d_motion_name)
        if(motion_name == 'Wave'){
            triggerExpression('nomal')
            model.motion(motion_name, 0 ,priority.FORCE)
        }else{
            model.motion(motion_name, 0 ,priority.FORCE)
        }
    }

}

// 获取并打印model对象的所有属性和方法
function logModelLoopProperties() {
    const modelProperties = Object.getOwnPropertyNames(model);
    
    console.log("Properties and Methods containing 'loop':");
    modelProperties.forEach(prop => {
        if (prop.toLowerCase().includes('loop')) {
            console.log(prop);
        }
    });
}

function motionTalk(start){
    if(start){
        
        // model.expression('说话')
    
    }else{
        // model.expression('不说话1')
    }
}

//设置模型参数
export function triggerMotionParams(params_name) {
    // 假设"talk10Button3"对应的参数是一个布尔值（0或1）
    // console.log(model.internalModel.coreModel.setParameterValueById)
    console.log(model.internalModel.coreModel.getParameterValueById());
    console.log(model.internalModel.coreModel)
    console.log("Parameter Value:", model.internalModel.coreModel.getParameterValueById(params_name));

    model.internalModel.coreModel.setParameterValueById(params_name, 1);

    console.log("Parameter Value:", model.internalModel.coreModel.getParameterValueById(params_name));
    // 如果需要在10秒后关闭动画，可以使用setTimeout
    // setTimeout(() => {
    //     model.internalModel.coreModel.setParameterValueById("talk10Button3", 0);
    // }, 10000); // 10秒后关闭
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
//             modelMikong.motion('Sleepy', 0, priority.FORCE)
//             modelMikong.motion('SLEEPY', 0, priority.FORCE)

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
