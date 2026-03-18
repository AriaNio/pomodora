const presetGrid = document.getElementById("presetGrid");
const presetCards = Array.from(document.querySelectorAll(".preset-card"));
const customPanel = document.getElementById("customPanel");
const customHours = document.getElementById("customHours");
const customMinutes = document.getElementById("customMinutes");
const applyCustom = document.getElementById("applyCustom");
const soundEnabled = document.getElementById("soundEnabled");
const startPauseBtn = document.getElementById("startPauseBtn");
const stopBtn = document.getElementById("stopBtn");
const resetBtn = document.getElementById("resetBtn");
const timeDisplay = document.getElementById("timeDisplay");
const timeSubtext = document.getElementById("timeSubtext");
const timerTitle = document.getElementById("timerTitle");
const statusPill = document.getElementById("statusPill");
const ringProgress = document.getElementById("ringProgress");
const stageLabel = document.getElementById("stageLabel");
const heroMascot = document.getElementById("heroMascot");

const RING_CIRCUMFERENCE = 2 * Math.PI * 48;

const modeMeta = {
  focus: {
    title: "番茄小主陪你冲刺",
    label: "长一点点，进入沉浸区",
    color: "#f06a5c",
  },
  calm: {
    title: "小熊陪你慢慢推进",
    label: "稳定专注，刚刚好",
    color: "#d88a4d",
  },
  quick: {
    title: "小鸡陪你马上开动",
    label: "五分钟，立刻起步",
    color: "#efb326",
  },
  custom: {
    title: "小猫陪你自己定节奏",
    label: "现在由你来掌控时长",
    color: "#6b99d6",
  },
};

const state = {
  selectedMinutes: 0,
  initialSeconds: 0,
  remainingSeconds: 0,
  running: false,
  completed: false,
  intervalId: null,
  selectedMode: null,
  selectedLabel: "",
};

function init() {
  ringProgress.style.strokeDasharray = String(RING_CIRCUMFERENCE);
  populateTimeOptions();
  renderHeroMascot("focus");
  updateUI();
}

function renderHeroMascot(mode) {
  const markupByMode = {
    focus: `
      <span class="preset-illustration bunny">
        <span class="bunny-ear ear-left"></span>
        <span class="bunny-ear ear-right"></span>
        <span class="bunny-face">
          <span class="eye"></span>
          <span class="eye"></span>
          <span class="mouth"></span>
        </span>
      </span>
    `,
    calm: `
      <span class="preset-illustration bear">
        <span class="bear-ear ear-left"></span>
        <span class="bear-ear ear-right"></span>
        <span class="bear-face">
          <span class="eye"></span>
          <span class="eye"></span>
          <span class="mouth"></span>
        </span>
      </span>
    `,
    quick: `
      <span class="preset-illustration chick">
        <span class="chick-face">
          <span class="eye"></span>
          <span class="eye"></span>
          <span class="mouth"></span>
        </span>
      </span>
    `,
    custom: `
      <span class="preset-illustration cat">
        <span class="cat-ear ear-left"></span>
        <span class="cat-ear ear-right"></span>
        <span class="cat-face">
          <span class="eye"></span>
          <span class="eye"></span>
          <span class="mouth"></span>
        </span>
      </span>
    `,
  };

  heroMascot.innerHTML = markupByMode[mode] || markupByMode.focus;
}

function populateTimeOptions() {
  for (let hour = 0; hour <= 12; hour += 1) {
    const option = document.createElement("option");
    option.value = String(hour);
    option.textContent = `${String(hour).padStart(2, "0")} 时`;
    customHours.append(option);
  }

  for (let minute = 0; minute < 60; minute += 1) {
    const option = document.createElement("option");
    option.value = String(minute);
    option.textContent = `${String(minute).padStart(2, "0")} 分`;
    customMinutes.append(option);
  }

  customHours.value = "0";
  customMinutes.value = "25";
}

function formatTime(totalSeconds) {
  const safeSeconds = Math.max(0, totalSeconds);
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = safeSeconds % 60;

  if (hours > 0) {
    return [
      String(hours).padStart(2, "0"),
      String(minutes).padStart(2, "0"),
      String(seconds).padStart(2, "0"),
    ].join(":");
  }

  return [String(minutes).padStart(2, "0"), String(seconds).padStart(2, "0")].join(":");
}

function describeDuration(totalMinutes) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours > 0 && minutes > 0) {
    return `${hours} 小时 ${minutes} 分钟`;
  }

  if (hours > 0) {
    return `${hours} 小时`;
  }

  return `${minutes} 分钟`;
}

function clearTimer() {
  if (state.intervalId) {
    window.clearInterval(state.intervalId);
    state.intervalId = null;
  }
  state.running = false;
}

function resetCelebration() {
  heroMascot.classList.remove("is-celebrating");
}

function setSelection({ minutes, mode, title, subtitle, selectedCard }) {
  clearTimer();
  resetCelebration();

  state.selectedMinutes = minutes;
  state.initialSeconds = minutes * 60;
  state.remainingSeconds = state.initialSeconds;
  state.selectedMode = mode;
  state.selectedLabel = title;
  state.completed = false;
  renderHeroMascot(mode);

  presetCards.forEach((card) => {
    card.classList.toggle("is-selected", card === selectedCard);
  });

  const meta = modeMeta[mode];
  timerTitle.textContent = title;
  stageLabel.textContent = subtitle || meta.label;
  ringProgress.style.stroke = meta.color;
  statusPill.textContent = "已选择";
  updateUI();
}

function choosePreset(card) {
  const minutes = Number(card.dataset.minutes);
  const mode = card.dataset.mode;
  const meta = modeMeta[mode];

  customPanel.hidden = true;
  setSelection({
    minutes,
    mode,
    title: `${describeDuration(minutes)} 倒计时`,
    subtitle: meta.label,
    selectedCard: card,
  });
}

function chooseCustom() {
  customPanel.hidden = false;
  presetCards.forEach((card) => {
    card.classList.toggle("is-selected", card.dataset.customTrigger === "true");
  });
  customHours.focus();
}

function applyCustomSelection() {
  const hours = Number(customHours.value);
  const minutes = Number(customMinutes.value);
  const totalMinutes = hours * 60 + minutes;

  if (totalMinutes <= 0) {
    timerTitle.textContent = "自定义时间需要大于 0";
    timeSubtext.textContent = "请至少选择 1 分钟";
    statusPill.textContent = "等待设置";
    return;
  }

  const customCard = presetCards.find((card) => card.dataset.customTrigger === "true");

  setSelection({
    minutes: totalMinutes,
    mode: "custom",
    title: `${describeDuration(totalMinutes)} 自定义倒计时`,
    subtitle: `小猫已经准备好陪你专注 ${describeDuration(totalMinutes)}`,
    selectedCard: customCard,
  });
}

function startTimer() {
  if (!state.initialSeconds || state.running) {
    return;
  }

  resetCelebration();
  state.running = true;
  state.completed = false;
  statusPill.textContent = "进行中";
  timeSubtext.textContent = "专注进行中";

  const endAt = Date.now() + state.remainingSeconds * 1000;

  state.intervalId = window.setInterval(() => {
    const diff = Math.round((endAt - Date.now()) / 1000);
    state.remainingSeconds = Math.max(0, diff);
    updateUI();

    if (state.remainingSeconds <= 0) {
      completeTimer();
    }
  }, 250);

  updateUI();
}

function pauseTimer() {
  if (!state.running) {
    return;
  }

  clearTimer();
  statusPill.textContent = "已暂停";
  timeSubtext.textContent = "随时可以继续";
  updateUI();
}

function stopTimer() {
  if (!state.initialSeconds) {
    return;
  }

  clearTimer();
  resetCelebration();
  state.remainingSeconds = 0;
  state.completed = false;
  statusPill.textContent = "已停止";
  timeSubtext.textContent = "当前倒计时已结束";
  updateUI();
}

function resetTimer() {
  if (!state.initialSeconds) {
    return;
  }

  clearTimer();
  resetCelebration();
  state.remainingSeconds = state.initialSeconds;
  state.completed = false;
  statusPill.textContent = "已重置";
  timeSubtext.textContent = "可以重新开始";
  updateUI();
}

function completeTimer() {
  clearTimer();
  state.remainingSeconds = 0;
  state.completed = true;
  statusPill.textContent = "已完成";
  timeSubtext.textContent = "时间到啦，休息一下吧";
  heroMascot.classList.add("is-celebrating");
  stageLabel.textContent = `${state.selectedLabel} 已完成`;
  playCompletionSound();
  showCompletionNotification();
  updateUI();
}

function showCompletionNotification() {
  if (!("Notification" in window)) {
    return;
  }

  if (Notification.permission === "granted") {
    new Notification("软软番茄钟", {
      body: `${state.selectedLabel} 已结束，记得活动一下。`,
    });
    return;
  }

  if (Notification.permission === "default") {
    Notification.requestPermission().then((permission) => {
      if (permission === "granted") {
        new Notification("软软番茄钟", {
          body: `${state.selectedLabel} 已结束，记得活动一下。`,
        });
      }
    });
  }
}

function playCompletionSound() {
  if (!soundEnabled.checked) {
    return;
  }

  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) {
    return;
  }

  const audioContext = new AudioContextClass();
  const notes = [659.25, 783.99, 1046.5];
  const now = audioContext.currentTime;

  notes.forEach((frequency, index) => {
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.type = "sine";
    oscillator.frequency.value = frequency;

    gain.gain.setValueAtTime(0.0001, now + index * 0.18);
    gain.gain.exponentialRampToValueAtTime(0.12, now + index * 0.18 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + index * 0.18 + 0.22);

    oscillator.connect(gain);
    gain.connect(audioContext.destination);

    oscillator.start(now + index * 0.18);
    oscillator.stop(now + index * 0.18 + 0.25);
  });

  window.setTimeout(() => {
    audioContext.close().catch(() => {});
  }, 1000);
}

function updateButtons() {
  const hasSelection = state.initialSeconds > 0;
  startPauseBtn.disabled = !hasSelection || state.completed;
  stopBtn.disabled = !hasSelection;
  resetBtn.disabled = !hasSelection;
  startPauseBtn.textContent = state.running ? "暂停" : "开始";
}

function updateProgress() {
  const progress = state.initialSeconds
    ? state.remainingSeconds / state.initialSeconds
    : 0;
  const offset = RING_CIRCUMFERENCE * (1 - progress);
  ringProgress.style.strokeDashoffset = String(offset);
}

function updateUI() {
  updateButtons();
  updateProgress();

  if (!state.initialSeconds) {
    timeDisplay.textContent = "00:00";
    timeSubtext.textContent = "请选择一个倒计时";
    return;
  }

  timeDisplay.textContent = formatTime(state.remainingSeconds);

  if (state.running) {
    timeSubtext.textContent = "专注进行中";
  } else if (state.completed) {
    timeSubtext.textContent = "时间到啦，休息一下吧";
  } else if (state.remainingSeconds === 0) {
    timeSubtext.textContent = "当前倒计时已结束";
  } else if (state.remainingSeconds !== state.initialSeconds) {
    timeSubtext.textContent = "已暂停，可继续";
  } else {
    timeSubtext.textContent = `准备开始 ${describeDuration(state.selectedMinutes)}`;
  }
}

presetGrid.addEventListener("click", (event) => {
  const card = event.target.closest(".preset-card");
  if (!card) {
    return;
  }

  if (card.dataset.customTrigger === "true") {
    chooseCustom();
    return;
  }

  choosePreset(card);
});

applyCustom.addEventListener("click", applyCustomSelection);

startPauseBtn.addEventListener("click", () => {
  if (state.running) {
    pauseTimer();
  } else {
    startTimer();
  }
});

stopBtn.addEventListener("click", stopTimer);
resetBtn.addEventListener("click", resetTimer);

soundEnabled.addEventListener("change", () => {
  statusPill.textContent = soundEnabled.checked ? "声音已开启" : "声音已关闭";
});

document.addEventListener("visibilitychange", () => {
  if (!state.running || document.visibilityState !== "visible") {
    return;
  }

  updateUI();
});

init();
