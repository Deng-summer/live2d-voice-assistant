
#!/bin/sh
# 使用以下命令来赋予脚本执行权限： chmod +x start_chrome_fullscreen.sh
# ./start_chrome_fullscreen.sh
# VERSION=2.0.6

TARGET_URL="https://avatar.chekkk.com/0001/"
MAX_WAIT_SECONDS=600
WAIT_INTERVAL=5
NTP_SERVER="ntp.aliyun.com"
# 优先使用第一个输出设备名称，找不到则依次尝试后面的名称（使用模糊匹配子串）
OUTPUT_DEVICE_NAMES="PCM2902,Unitek Y-247A"
INPUT_DEVICE_NAME="ALU1"

export GOOGLE_API_KEY="AIzaSyB0y-hr-byVeAvxE9gxBqp1pPWxdOTAqOA"
export GOOGLE_DEFAULT_CLIENT_ID="788243036499-1j5nqvnr4lj7gd0fhmrm0f94sqskn6uc.apps.googleusercontent.com"
export GOOGLE_DEFAULT_CLIENT_SECRET="xDHuELbrKd_Bu1OvetUlCXpZ"

# 确保桌面通知相关工具存在（仅在 root 且有 apt-get 时自动安装一次，安装的是不会打断流程的 notify-send）
ensure_notify_tools() {
  if command -v notify-send >/dev/null 2>&1; then
    return 0
  fi

  if [ "$(id -u)" -ne 0 ]; then
    echo "未检测到 notify-send/zenity，且当前不是 root，无法自动安装通知工具。"
    return 0
  fi

  if ! command -v apt-get >/dev/null 2>&1; then
    echo "系统未找到 apt-get，无法自动安装通知工具。"
    return 0
  fi

  echo "尝试通过 apt 自动安装桌面通知工具 libnotify-bin..."
  apt-get update >/dev/null 2>&1 || true
  apt-get install -y libnotify-bin >/dev/null 2>&1 || true
}

# 桌面通知辅助函数：使用 notify-send；没有则退回 echo，不弹交互对话框
notify_desktop() {
  MSG="$1"
  TITLE="${2:-Chromium 启动脚本}"

  if command -v notify-send >/dev/null 2>&1; then
    notify-send "$TITLE" "$MSG" >/dev/null 2>&1 || true
  else
    echo "$TITLE: $MSG"
  fi
}

ensure_notify_tools

# 启动前清理/修正 Chromium 会话状态，避免弹出 “未正确关闭” 提示
cleanup_chromium_session() {
  PROFILE_DIR=""

  # 依次尝试常见的 Chromium 配置目录（包括 snap 版本）
  for dir in \
    "$HOME/.config/chromium/Default" \
    "$HOME/.config/chromium" \
    "$HOME/snap/chromium/current/.config/chromium/Default" \
    "$HOME/snap/chromium/current/.config/chromium" \
    "$HOME/snap/chromium/common/chromium/Default" \
    "$HOME/snap/chromium/common/chromium"
  do
    if [ -f "$dir/Preferences" ]; then
      PROFILE_DIR="$dir"
      break
    fi
  done

  if [ -z "$PROFILE_DIR" ]; then
    echo "未找到 Chromium 配置目录，跳过会话清理。"
    return 0
  fi

  echo "使用的 Chromium 配置目录: $PROFILE_DIR"

  # 清理上次会话/标签页记录，避免被认为是崩溃恢复
  rm -f "$PROFILE_DIR/Current Session" \
        "$PROFILE_DIR/Current Tabs" \
        "$PROFILE_DIR/Last Session" \
        "$PROFILE_DIR/Last Tabs" 2>/dev/null || true

  # 优先使用 python3 精确修改 JSON 中的退出状态，保证不破坏文件格式
  if command -v python3 >/dev/null 2>&1; then
    python3 - "$PROFILE_DIR" << 'EOF'
import json, os, sys

profile_dir = sys.argv[1]
base_dir = os.path.dirname(profile_dir)
paths = [
    os.path.join(profile_dir, "Preferences"),
    os.path.join(base_dir, "Local State"),
]

for path in paths:
    if not os.path.isfile(path):
        continue
    try:
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
    except Exception:
        continue

    changed = False

    def fix_profile(obj):
        nonlocal changed
        if not isinstance(obj, dict):
            return
        prof = obj.get("profile")
        if isinstance(prof, dict):
            if prof.get("exit_type") != "Normal":
                prof["exit_type"] = "Normal"
                changed = True
            if prof.get("exited_cleanly") is False:
                prof["exited_cleanly"] = True
                changed = True

    # 部分版本把字段放在根 profile 下，有的在 nested profile 里，都尝试修正
    fix_profile(data)
    if "profile" in data and isinstance(data["profile"], dict):
        fix_profile({"profile": data["profile"]})

    if not changed:
        continue

    try:
        os.replace(path, path + ".bak")
    except OSError:
        pass
    try:
        with open(path, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
    except Exception:
        # 尝试失败时，尽量回滚备份
        try:
            os.replace(path + ".bak", path)
        except OSError:
            pass
EOF
  else
    # 没有 python3 时，用 sed 兜底修改（可能不如 JSON 方式精确）
    PREF="$PROFILE_DIR/Preferences"
    if [ -f "$PREF" ]; then
      cp "$PREF" "$PREF.bak" 2>/dev/null || true
      sed 's/"exit_type":"Crashed"/"exit_type":"Normal"/g;
           s/"exit_type":"Abnormal"/"exit_type":"Normal"/g;
           s/"exited_cleanly":false/"exited_cleanly":true/g' \
        "$PREF" > "$PREF.tmp" 2>/dev/null && mv "$PREF.tmp" "$PREF"
    fi

    BASE_DIR=$(dirname "$PROFILE_DIR")
    LOCAL_STATE="$BASE_DIR/Local State"
    if [ -f "$LOCAL_STATE" ]; then
      cp "$LOCAL_STATE" "$LOCAL_STATE.bak" 2>/dev/null || true
      sed 's/"exit_type":"Crashed"/"exit_type":"Normal"/g;
           s/"exit_type":"Abnormal"/"exit_type":"Normal"/g;
           s/"exited_cleanly":false/"exited_cleanly":true/g' \
        "$LOCAL_STATE" > "$LOCAL_STATE.tmp" 2>/dev/null && mv "$LOCAL_STATE.tmp" "$LOCAL_STATE"
    fi
  fi
}

# 在检测网络之前，优先尝试设置音频输入输出设备
set_audio_devices() {
  echo "尝试设置音频输出设备为（按优先级）: ${OUTPUT_DEVICE_NAMES}"
  echo "尝试设置音频输入设备为: ${INPUT_DEVICE_NAME}"

  if command -v pactl >/dev/null 2>&1; then
    # 使用 PulseAudio / PipeWire (pactl) 方式设置默认设备
    # 依次在详细列表中按描述匹配 OUTPUT_DEVICE_NAMES 中的名称，拿到真正的 sink name
    SINK_NAME=""
    OLD_IFS="$IFS"
    IFS=","
    for dev in $OUTPUT_DEVICE_NAMES; do
      dev_trim=$(echo "$dev" | sed 's/^ *//;s/ *$//')
      if [ -z "$dev_trim" ]; then
        continue
      fi
      CAND=$(pactl list sinks 2>/dev/null | awk -v dev="$dev_trim" '
        $1 == "Name:" { name=$2 }
        index($0, dev) { cand=name }
        END {
          gsub(/[<>]/,"",cand);
          print cand;
        }')
      if [ -n "$CAND" ]; then
        SINK_NAME="$CAND"
        break
      fi
    done
    IFS="$OLD_IFS"

    if [ -n "${SINK_NAME}" ]; then
      pactl set-default-sink "${SINK_NAME}" >/dev/null 2>&1 || true
      # 把当前所有音频流迁移到新的输出设备
      for INPUT in $(pactl list short sink-inputs 2>/dev/null | awk '{print $1}'); do
        pactl move-sink-input "${INPUT}" "${SINK_NAME}" >/dev/null 2>&1 || true
      done

      # 确保输出设备未静音且音量在一个合理水平
      pactl set-sink-mute "${SINK_NAME}" 0 >/dev/null 2>&1 || true
      pactl set-sink-volume "${SINK_NAME}" 0x10000 >/dev/null 2>&1 || true

      echo "默认输出设备已设置为: ${SINK_NAME}"
    else
      MSG="未在 PulseAudio sink 列表中找到可用的音频输出设备（候选: ${OUTPUT_DEVICE_NAMES}），可能导致没有声音。"
      echo "$MSG"
      notify_desktop "$MSG"
    fi

    # 优先选择真正的输入源（alsa_input 前缀），避免选到 monitor 源
    SRC_LINE=$(pactl list short sources 2>/dev/null | grep "alsa_input" | grep "${INPUT_DEVICE_NAME}" | head -n 1)
    if [ -z "${SRC_LINE}" ]; then
      # 兜底：如果没有 alsa_input，再退回到任意包含名称的 source
      SRC_LINE=$(pactl list short sources 2>/dev/null | grep "${INPUT_DEVICE_NAME}" | head -n 1)
    fi

    if [ -n "${SRC_LINE}" ]; then
      SRC_NAME=$(echo "${SRC_LINE}" | awk '{print $2}')
      pactl set-default-source "${SRC_NAME}" >/dev/null 2>&1 || true
      echo "默认输入设备已设置为: ${SRC_NAME}"

      # 进一步确保麦克风处于可用状态：取消静音并设置一个合理音量
      pactl set-source-mute "${SRC_NAME}" 0 >/dev/null 2>&1 || true
      pactl set-source-volume "${SRC_NAME}" 0x10000 >/dev/null 2>&1 || true

      # 使用一次 1 秒哑录音来“热身”驱动，避免第一次录音不可用的情况
      if command -v arecord >/dev/null 2>&1; then
        arecord -d 1 -q -f cd -t raw /dev/null 2>/dev/null || true
      fi
    else
      MSG="未找到名为 ${INPUT_DEVICE_NAME} 的麦克风输入设备，可能导致无法收音。"
      echo "$MSG"
      notify_desktop "$MSG"
    fi

  elif command -v pacmd >/dev/null 2>&1; then
    # 兼容旧一点的 PulseAudio，仅作为兜底
    SINK_NAME=$(pacmd list-sinks 2>/dev/null | awk -v dev="${OUTPUT_DEVICE_NAME}" '
      $1 == "name:" { gsub(/[<>]/,"",$2); name=$2 }
      index($0, dev) { print name; exit }')
    if [ -n "${SINK_NAME}" ]; then
      pacmd set-default-sink "${SINK_NAME}" >/dev/null 2>&1 || true
      echo "默认输出设备已设置为: ${SINK_NAME}"
    else
      echo "未在 pacmd sink 列表中找到输出设备: ${OUTPUT_DEVICE_NAME}"
    fi

    SRC_NAME=$(pacmd list-sources 2>/dev/null | awk -v dev="${INPUT_DEVICE_NAME}" '
      $1 == "name:" { gsub(/[<>]/,"",$2); name=$2 }
      index($0, dev) { print name; exit }')
    if [ -n "${SRC_NAME}" ]; then
      pacmd set-default-source "${SRC_NAME}" >/dev/null 2>&1 || true
      echo "默认输入设备已设置为: ${SRC_NAME}"
    else
      echo "未在 pacmd source 列表中找到输入设备: ${INPUT_DEVICE_NAME}"
    fi
  else
    MSG="系统未找到 pactl/pacmd，无法自动切换音频输入输出设备，请在系统层面配置。"
    echo "$MSG"
    notify_desktop "$MSG"
  fi
}

set_audio_devices

# 第一步：等待基础网络连通（最多 MAX_WAIT_SECONDS 秒）
ELAPSED=0
NETWORK_OK=0
while [ "$ELAPSED" -lt "$MAX_WAIT_SECONDS" ]; do
  if command -v ping >/dev/null 2>&1; then
    if ping -c 1 8.8.8.8 >/dev/null 2>&1; then
      echo "基础网络已连通。"
      NETWORK_OK=1
      break
    fi
  fi

  echo "基础网络未就绪，等待 ${WAIT_INTERVAL} 秒后重试..."
  sleep "$WAIT_INTERVAL"
  ELAPSED=$(expr "$ELAPSED" + "$WAIT_INTERVAL")
done

if [ "$NETWORK_OK" -ne 1 ]; then
  MSG="在 ${MAX_WAIT_SECONDS} 秒内仍未检测到基础网络连通，将直接启动浏览器。"
  echo "$MSG"
  notify_desktop "$MSG"
else
  # 第二步：尝试自动同步时间（解决 clock is behind 的根本原因）
  if [ "$(id -u)" -eq 0 ]; then
    if command -v ntpdate >/dev/null 2>&1; then
      echo "尝试通过 ntpdate 同步时间..."
      ntpdate -u "$NTP_SERVER" >/dev/null 2>&1 || true
    elif command -v ntpd >/dev/null 2>&1; then
      echo "尝试通过 ntpd 同步时间..."
      ntpd -q -p "$NTP_SERVER" >/dev/null 2>&1 || true
    elif command -v chronyc >/dev/null 2>&1; then
      echo "尝试通过 chronyc 同步时间..."
      chronyc -a makestep >/dev/null 2>&1 || true
    else
      echo "系统未找到 ntpdate/ntpd/chronyc，对时需要在系统层面单独配置。"
    fi
  else
    echo "当前脚本不是以 root 身份运行，无法直接修改系统时间，只做 HTTPS 检查。"
  fi

  # 第三步：一直等到 HTTPS 正常（包括 clock is behind 修复完成）
  while :; do
    if command -v curl >/dev/null 2>&1; then
      if curl -s --head "$TARGET_URL" >/dev/null 2>&1; then
        echo "HTTPS 检查通过，时间/证书看起来正常。"
        break
      else
        echo "HTTPS 仍有问题（可能是 clock is behind），${WAIT_INTERVAL} 秒后重试..."
      fi
    else
      echo "系统未安装 curl，无法自动判断 clock 是否正常，将直接继续启动浏览器。"
      break
    fi

    # 每次失败顺带再尝试一次时间同步（如果是 root 且有可用命令）
    if [ "$(id -u)" -eq 0 ]; then
      if command -v ntpdate >/dev/null 2>&1; then
        ntpdate -u "$NTP_SERVER" >/dev/null 2>&1 || true
      elif command -v ntpd >/dev/null 2>&1; then
        ntpd -q -p "$NTP_SERVER" >/dev/null 2>&1 || true
      elif command -v chronyc >/dev/null 2>&1; then
        chronyc -a makestep >/dev/null 2>&1 || true
      fi
    fi

    sleep "$WAIT_INTERVAL"
  done
fi

# 第四步：关闭已有 Chromium 实例
if command -v pkill >/dev/null 2>&1; then
  pkill -f chromium 2>/dev/null || true
elif command -v killall >/dev/null 2>&1; then
  killall chromium-browser 2>/dev/null || true
fi

# 第四步补充：清理/修正 Chromium 会话状态，防止弹出 “未正确关闭” 提示
cleanup_chromium_session

# 第五步：启动 Chromium 浏览器并全屏显示指定网页（关闭崩溃提示气泡）
chromium-browser --start-fullscreen "$TARGET_URL" \
  --disable-notifications \
  --disable-popup-blocking \
  --disable-infobars \
  --disable-session-crashed-bubble \
  --autoplay-policy=no-user-gesture-required  \
  --hide-crash-restore-bubble \        # 隐藏崩溃恢复气泡
  --disable-breakpad \                 # 禁用崩溃报告
  --hide-crash-restore-bubble \        # 隐藏崩溃恢复气泡
  --disable-session-crashed-bubble & # 禁用会话崩溃气泡提示

sleep 5

# 在 Chromium 启动后，将所有录音流迁移到指定的输入设备（如 ALU1）
if command -v pactl >/dev/null 2>&1; then
  SRC_LINE=$(pactl list short sources 2>/dev/null | grep "${INPUT_DEVICE_NAME}" | head -n 1)
  if [ -n "${SRC_LINE}" ]; then
    SRC_NAME=$(echo "${SRC_LINE}" | awk '{print $2}')
    for OUT_ID in $(pactl list short source-outputs 2>/dev/null | awk '{print $1}'); do
      pactl move-source-output "${OUT_ID}" "${SRC_NAME}" >/dev/null 2>&1 || true
    done
    echo "已将所有录音流切换到输入设备: ${SRC_NAME}"
  else
    echo "未找到包含 ${INPUT_DEVICE_NAME} 的录音源，无法迁移录音流。"
  fi
fi

# 第六步：将窗口置顶（如果系统安装了 wmctrl）
if command -v wmctrl >/dev/null 2>&1; then
  WINDOW_ID=$(wmctrl -l | grep "$TARGET_URL" | awk '{print $1}')
  if [ -n "$WINDOW_ID" ]; then
    wmctrl -i -r "$WINDOW_ID" -b add,above
  fi
else
  echo "未找到 wmctrl 命令，跳过窗口置顶步骤。"
fi
