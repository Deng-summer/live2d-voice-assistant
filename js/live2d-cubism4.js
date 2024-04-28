const mikongModel = '../../../ai/ai.model3.json'
const mikongMotionIdle = '../../../ai/idle.motion3.json'
const mikongMotionSleepy = '../../../ai/sleepy.motion3.json'
const mikongMotionTalk = '../../../ai/talk.motion3.json'

const haruModel = '../../../haru/haru_greeter_t03.model3.json'
const haruMotionM05 = '../../../haru/motion/haru_g_m05.motion3.json'

const live2d = PIXI.live2d;

async function live2dMain() {
    const app = new PIXI.Application({
        view: document.getElementById("canvaslive2d4"),
        autoStart: true,
        resizeTo: window,
        backgroundColor: 0x647
    });

    const model = await live2d.Live2DModel.from(haruModel);
    app.stage.addChild(model);

    const scaleX = (innerWidth * 0.4) / model.width;
    const scaleY = (innerHeight * 0.8) / model.height;
    model.scale.set(Math.min(scaleX, scaleY));
    model.x = 0;
    model.scale.set(0.6);
    
    const settings = {
        motions: {
            sleepy: [
                { file: "../../../haru/motion/haru_g_m05.motion3.json", fade_in: 0.5, fade_out: 0.5 },
            ],
        },
        expressions: true // 表情是否可用，根据你的需求设置
    };
    const customParameters = {
        idle: haruMotionM05,
        // sleepy: mikongMotionSleepy,
        // talk: mikongMotionTalk
    };
    const motionManager = new live2d.Cubism2MotionManager(settings, customParameters);
    setInterval(() => {
        console.log('start motion')
        // motionManager.startMotion('sleepy');
        model.motion('Tap',0)
    }, 5000);
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

// function draggable(model) {
//     model.buttonMode = true;
//     model.on("pointerdown", (e) => {
//         model.dragging = true;
//         model._pointerX = e.data.global.x - model.x;
//         model._pointerY = e.data.global.y - model.y;
//     });
//     model.on("pointermove", (e) => {
//         if (model.dragging) {
//         model.position.x = e.data.global.x - model._pointerX;
//         model.position.y = e.data.global.y - model._pointerY;
//         }
//     });
//     model.on("pointerupoutside", () => (model.dragging = false));
//     model.on("pointerup", () => (model.dragging = false));
// }

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
