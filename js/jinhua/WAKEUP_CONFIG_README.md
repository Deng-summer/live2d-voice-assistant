# 豆包唤醒词控制配置说明

## 配置文件位置

`js/jinhua/control-config.js`

## 可配置项

### 1. SHOW_WAKEUP_HINT（唤醒提示显示）

**说明：** 是否显示屏幕中央的大提示框（"说'湖宝湖宝'来唤醒我吧！"）

**默认值：** `false`（关闭）

**修改方法：**
```javascript
SHOW_WAKEUP_HINT: true,  // 打开提示
```

**效果：**
- `true`：启动唤醒检测后，屏幕中央显示绿色脉冲提示框
- `false`：不显示提示框，界面更简洁

---

### 2. SHOW_WAKEUP_BUTTON（控制按钮显示）

**说明：** 是否显示右下角的唤醒词控制按钮

**默认值：** `false`（关闭）

**修改方法：**
```javascript
SHOW_WAKEUP_BUTTON: true,  // 显示按钮
```

**效果：**
- `true`：显示右下角的绿色按钮，可手动控制启动/停止
- `false`：不显示按钮，完全自动化运行

---

### 3. ENABLE_KEY_D_SHORTCUT（按键D快捷键）

**说明：** 是否启用按键 D 来启动/停止唤醒检测

**默认值：** `false`（关闭）

**修改方法：**
```javascript
ENABLE_KEY_D_SHORTCUT: true,  // 启用按键D
```

**效果：**
- `true`：按 D 键可以快速启动/停止唤醒检测
- `false`：只能通过右下角按钮控制（如果按钮显示的话）

---

### 4. AUTO_START_ON_LOAD（自动启动）

**说明：** 页面加载后是否自动启动唤醒检测

**默认值：** `true`（打开）

**修改方法：**
```javascript
AUTO_START_ON_LOAD: false,  // 关闭自动启动
```

**效果：**
- `true`：页面加载后延迟一段时间自动启动（仅在 BUS 模式下）
- `false`：需要手动点击按钮启动

---

### 5. AUTO_START_DELAY（自动启动延迟）

**说明：** 自动启动的延迟时间（毫秒）

**默认值：** `10000`（10秒）

**修改方法：**
```javascript
AUTO_START_DELAY: 5000,  // 改为5秒
```

**效果：**
- 页面加载后等待指定时间再自动启动
- 只有在 `AUTO_START_ON_LOAD` 为 `true` 时生效

---

### 6. AUTO_RESTART_AFTER_MULTI（多轮对话后自动重启）

**说明：** 从多轮对话模式退出后，是否自动重启唤醒检测

**默认值：** `true`（打开）

**修改方法：**
```javascript
AUTO_RESTART_AFTER_MULTI: false,  // 关闭自动重启
```

**效果：**
- `true`：说"退下"结束对话后，自动重启唤醒检测，可以继续唤醒
- `false`：退出后不自动重启，需要手动启动

---

## 状态文字配置

### STATUS_MESSAGES

**说明：** 不同状态下显示的提示文字

**可配置的状态：**

1. **BUS_WAITING**（等待唤醒）
   ```javascript
   BUS_WAITING: {
       question: '你好！我是湖宝 🚌',
       answer: '试试说"湖宝湖宝"来唤醒我吧',
   }
   ```

2. **BUS_NOT_STARTED**（未启动检测）
   ```javascript
   BUS_NOT_STARTED: {
       question: '你好！我是湖宝 🚌',
       answer: '试试喊醒我：“湖宝湖宝”',
   }
   ```

3. **MULTI**（连续对话模式）
   ```javascript
   MULTI: {
       question: '连续对话模式已开启',
       answer: '你可以连续说话，说"退下"结束对话',
   }
   ```

4. **SINGEL**（单轮对话）
5. **MUSIC**（音乐播放）
6. **READY**（准备接收指令）

---

## 推荐配置方案

### 方案一：完全自动（推荐 - 展示环境）

```javascript
SHOW_WAKEUP_HINT: true,             // 显示提示框
SHOW_WAKEUP_BUTTON: false,          // 不显示按钮
ENABLE_KEY_D_SHORTCUT: false,       // 不启用按键
AUTO_START_ON_LOAD: true,           // 自动启动
AUTO_START_DELAY: 6000,             // 6秒后启动
AUTO_RESTART_AFTER_MULTI: true,     // 对话后自动重启
```

**适用场景：** 展示环境、公共场所，用户无需手动操作，完全自动化

**用户体验：**
1. 页面加载 → 6秒后自动启动
2. 屏幕中央显示提示："说'湖宝湖宝'来唤醒我吧"
3. 唤醒后进入对话
4. 说"退下"后自动重启检测

---

### 方案二：手动控制（开发测试）

```javascript
SHOW_WAKEUP_HINT: true,             // 显示提示框
SHOW_WAKEUP_BUTTON: true,           // 显示按钮
ENABLE_KEY_D_SHORTCUT: true,        // 启用按键D
AUTO_START_ON_LOAD: false,          // 不自动启动
AUTO_RESTART_AFTER_MULTI: false,    // 不自动重启
```

**适用场景：** 开发测试、需要手动控制的场景

**用户体验：**
1. 页面加载 → 等待手动启动
2. 点击按钮或按 D 键启动
3. 完全手动控制启动/停止

---

### 方案三：混合模式（当前默认）

```javascript
SHOW_WAKEUP_HINT: true,             // 显示提示框
SHOW_WAKEUP_BUTTON: false,          // 不显示按钮
ENABLE_KEY_D_SHORTCUT: false,       // 不启用按键
AUTO_START_ON_LOAD: true,           // 自动启动
AUTO_START_DELAY: 6000,             // 6秒后启动
AUTO_RESTART_AFTER_MULTI: true,     // 对话后自动重启
```

**适用场景：** 生产环境，既要自动化又要友好提示

**用户体验：**
1. 自动启动，无需手动操作
2. 有明显的视觉提示
3. 对话后自动循环

---

## 修改后的效果

修改配置文件后，刷新页面即可生效。

**注意事项：**
1. 修改配置文件后需要刷新浏览器
2. 自动启动只在 BUS 模式下生效
3. 状态文字会根据当前模式自动切换
