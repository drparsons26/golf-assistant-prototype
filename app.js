let round = {
  courseName: "",
  players: [],
  totalHoles: 18,
  currentHole: 1,
  scores: {},
  holeTargets: {},
  holeHazards: {},
  holePars: {},
  holeLengths: {}
};

const setupSection = document.getElementById("setupSection");
const startSetupSection = document.getElementById("startSetupSection");
const roundSection = document.getElementById("roundSection");
const scorecardSection = document.getElementById("scorecardSection");

const courseNameInput = document.getElementById("courseName");
const playerNamesInput = document.getElementById("playerNames");
const totalHolesSelect = document.getElementById("totalHoles");

const homeStartRoundBtn = document.getElementById("homeStartRoundBtn");
const startRoundBtn = document.getElementById("startRoundBtn");
const resetRoundBtn = document.getElementById("resetRoundBtn");
const saveScoresBtn = document.getElementById("saveScoresBtn");
const nextHoleBtn = document.getElementById("nextHoleBtn");
const previousHoleBtn = document.getElementById("previousHoleBtn");
const endRoundBtn = document.getElementById("endRoundBtn");

const courseTitle = document.getElementById("courseTitle");
const holeTitle = document.getElementById("holeTitle");
const scoreInputs = document.getElementById("scoreInputs");
const message = document.getElementById("message");
const scorecardTable = document.getElementById("scorecardTable");
const leaderText = document.getElementById("leaderText");

const voiceBtn = document.getElementById("voiceBtn");
const preRoundVoiceBtn = document.getElementById("preRoundVoiceBtn");
const voiceStatus = document.getElementById("voiceStatus");
const preRoundVoiceStatus = document.getElementById("preRoundVoiceStatus");
const transcriptText = document.getElementById("transcriptText");

const yardageSection = document.getElementById("yardageSection");
const frontLatInput = document.getElementById("frontLat");
const frontLngInput = document.getElementById("frontLng");
const centerLatInput = document.getElementById("centerLat");
const centerLngInput = document.getElementById("centerLng");
const backLatInput = document.getElementById("backLat");
const backLngInput = document.getElementById("backLng");
const saveTargetBtn = document.getElementById("saveTargetBtn");
const getYardageBtn = document.getElementById("getYardageBtn");
const yardageResult = document.getElementById("yardageResult");

const hazardNameInput = document.getElementById("hazardName");
const hazardTypeInput = document.getElementById("hazardType");
const hazardLatInput = document.getElementById("hazardLat");
const hazardLngInput = document.getElementById("hazardLng");
const addHazardBtn = document.getElementById("addHazardBtn");
const clearHazardsBtn = document.getElementById("clearHazardsBtn");
const hazardList = document.getElementById("hazardList");

const savedCourseSelect = document.getElementById("savedCourseSelect");
const loadCourseSetupBtn = document.getElementById("loadCourseSetupBtn");
const saveCourseSetupBtn = document.getElementById("saveCourseSetupBtn");
const golfApiSearchInput = document.getElementById("golfApiSearchInput");
const golfApiCountryInput = document.getElementById("golfApiCountryInput");
const golfApiSearchBtn = document.getElementById("golfApiSearchBtn");
const golfApiSearchStatus = document.getElementById("golfApiSearchStatus");
const golfApiSearchResults = document.getElementById("golfApiSearchResults");

const importCourseDataBtn = document.getElementById("importCourseDataBtn");
const exportCourseDataBtn = document.getElementById("exportCourseDataBtn");
const courseDataFileInput = document.getElementById("courseDataFileInput");

const holeParInput = document.getElementById("holeParInput");
const saveParBtn = document.getElementById("saveParBtn");
const parSummary = document.getElementById("parSummary");

const toggleCommandHelpBtn = document.getElementById("toggleCommandHelpBtn");
const commandHelpPanel = document.getElementById("commandHelpPanel");

const enableAudioBtn = document.getElementById("enableAudioBtn");
const audioStatus = document.getElementById("audioStatus");
const settingsSection = document.getElementById("settingsSection");
const roundParSummary = document.getElementById("roundParSummary");
const roundLengthSummary = document.getElementById("roundLengthSummary");
const navButtons = document.querySelectorAll("[data-nav-target]");

let recognition = null;
let selectedCourseSetup = null;
let isHandlingVoiceCommand = false;
let lastVoiceCommand = "";
let lastVoiceCommandTime = 0;
let voiceResponsesEnabled = false;
const AI_VOICE_CONFIDENCE_THRESHOLD = 0.72;
const VOICE_SILENCE_DELAY_MS = 1800;
let isVoiceCaptureActive = false;
let voiceFinalTranscript = "";
let voiceInterimTranscript = "";
let voiceSilenceTimer = null;
let isFinalizingVoiceCommand = false;
let audioRecorder = null;
let audioChunks = [];
let audioRecordingStream = null;
let audioRecordingTimer = null;
let isAudioRecordingFallback = false;
const AUDIO_RECORDING_MAX_MS = 12000;

startRoundBtn.addEventListener("click", startRound);
resetRoundBtn.addEventListener("click", resetRound);
saveScoresBtn.addEventListener("click", saveScores);
nextHoleBtn.addEventListener("click", nextHole);
previousHoleBtn.addEventListener("click", previousHole);
if (endRoundBtn) {
  endRoundBtn.addEventListener("click", endRoundManually);
}
saveTargetBtn.addEventListener("click", saveTargetGreen);
getYardageBtn.addEventListener("click", function () {
  getYardageToGreen(false);
});
addHazardBtn.addEventListener("click", addHazardForCurrentHole);
clearHazardsBtn.addEventListener("click", clearHazardsForCurrentHole);
loadCourseSetupBtn.addEventListener("click", loadSelectedCourseSetup);
saveCourseSetupBtn.addEventListener("click", saveCurrentCourseSetup);
if (golfApiSearchBtn) {
  golfApiSearchBtn.addEventListener("click", searchGolfApiCourses);
}
importCourseDataBtn.addEventListener("click", function () {
  courseDataFileInput.click();
});
saveParBtn.addEventListener("click", saveParForCurrentHole);
toggleCommandHelpBtn.addEventListener("click", toggleCommandHelp);
courseDataFileInput.addEventListener("change", importCourseDataFromFile);
exportCourseDataBtn.addEventListener("click", exportSavedCourseData);
enableAudioBtn.addEventListener("click", enableVoiceResponses);
if (voiceBtn) {
  voiceBtn.addEventListener("click", startVoiceRecognition);
}

if (preRoundVoiceBtn) {
  preRoundVoiceBtn.addEventListener("click", startVoiceRecognition);
}

navButtons.forEach(button => {
  button.addEventListener("click", function () {
    showAppScreen(button.dataset.navTarget);
  });
});

window.addEventListener("load", function () {
  renderSavedCourseOptions();
  loadSavedRound();
  updateRoundEntryButtons();
  setupVoiceRecognition();
});

function startRound() {
  const courseName = courseNameInput.value.trim() || "Test Course";

  const players = playerNamesInput.value
    .split(",")
    .map(name => name.trim())
    .filter(name => name !== "");

  if (players.length === 0) {
    alert("Please enter at least one player.");
    return;
  }

  round.courseName = courseName;
  round.players = players;
  round.totalHoles = Number(totalHolesSelect.value);
  round.currentHole = 1;
  round.scores = {};

if (selectedCourseSetup) {
  round.holeTargets = deepCopy(selectedCourseSetup.holeTargets || {});
  round.holeHazards = deepCopy(selectedCourseSetup.holeHazards || {});
  round.holePars = deepCopy(selectedCourseSetup.holePars || createDefaultPars(round.totalHoles));
  round.holeLengths = deepCopy(selectedCourseSetup.holeLengths || {});
} else {
  round.holeTargets = {};
  round.holeHazards = {};
  round.holePars = createDefaultPars(round.totalHoles);
  round.holeLengths = {};
}

  players.forEach(player => {
    round.scores[player] = {};
  });

  saveRoundToStorage();
  updateRoundEntryButtons();
  showRoundScreen();
  renderCurrentHole();
  renderScorecard();
}

function updateRoundEntryButtons() {
  const hasActiveRound = round.players.length > 0;

  if (homeStartRoundBtn) {
    homeStartRoundBtn.dataset.navTarget = hasActiveRound ? "round" : "startSetup";
    homeStartRoundBtn.innerHTML = hasActiveRound
      ? '<span aria-hidden="true">●</span><strong>See Current Round</strong>'
      : '<span aria-hidden="true">▶</span><strong>Start Round</strong>';
  }
}

function setVoiceButtonText(text) {
  [voiceBtn, preRoundVoiceBtn].forEach(button => {
    if (button) {
      button.textContent = text;
    }
  });
}

function setVoiceButtonsDisabled(isDisabled) {
  [voiceBtn, preRoundVoiceBtn].forEach(button => {
    if (button) {
      button.disabled = isDisabled;
    }
  });
}

function setVoiceStatus(text) {
  [voiceStatus, preRoundVoiceStatus].forEach(statusElement => {
    if (statusElement) {
      statusElement.textContent = text;
    }
  });
}

function showRoundScreen() {
  showAppScreen("round");
}

function showAppScreen(target) {
  const normalizedTarget = target || "home";
  const screens = {
    home: setupSection,
    startSetup: startSetupSection,
    round: roundSection,
    scorecard: scorecardSection,
    yardage: yardageSection,
    settingsSection: settingsSection
  };

  if (normalizedTarget === "course-library-panel") {
    showAppScreen("startSetup");
    const coursePanel = document.getElementById("course-library-panel");

    if (coursePanel) {
      coursePanel.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    return;
  }

  if ((normalizedTarget === "round" || normalizedTarget === "scorecard" || normalizedTarget === "yardage") && round.players.length === 0) {
    showAppScreen("startSetup");
    return;
  }

  if (normalizedTarget === "round") {
    renderCurrentHole();
  }

  if (normalizedTarget === "scorecard") {
    renderScorecard();
  }

  if (normalizedTarget === "yardage") {
    renderHoleTargetInputs();
    renderHoleHazards();
  }

  Object.values(screens).forEach(screen => {
    if (screen) {
      screen.classList.add("hidden");
    }
  });

  const activeScreen = screens[normalizedTarget] || setupSection;
  activeScreen.classList.remove("hidden");

  navButtons.forEach(button => {
    const isActive =
      button.dataset.navTarget === normalizedTarget ||
      (normalizedTarget === "startSetup" && button.dataset.navTarget === "home") ||
      (normalizedTarget === "round" && button.dataset.navTarget === "home" && round.players.length === 0);

    button.classList.toggle("active", isActive);
  });

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function renderCurrentHole() {
  courseTitle.textContent = round.courseName;
  holeTitle.textContent = `Hole ${round.currentHole}`;
  if (roundParSummary) {
    roundParSummary.textContent = getHolePar(round.currentHole);
  }
  if (roundLengthSummary) {
    roundLengthSummary.textContent = formatHoleLength(round.currentHole);
  }
  scoreInputs.innerHTML = "";

  round.players.forEach((player, index) => {
    const savedScore = round.scores[player][round.currentHole] || "";

    const row = document.createElement("div");
    row.className = "player-score-row";

    row.innerHTML = `
      <span>${player}</span>
      <input 
        type="number" 
        min="1" 
        max="20" 
        id="score-player-${index}" 
        value="${savedScore}" 
        placeholder="Score"
      />
    `;

    scoreInputs.appendChild(row);
  });

  message.textContent = "";
  renderHoleParInput();
  renderHoleTargetInputs();
  renderHoleHazards();
}

function saveScores() {
  for (let i = 0; i < round.players.length; i++) {
    const player = round.players[i];
    const input = document.getElementById(`score-player-${i}`);
    const score = Number(input.value);

    if (!input.value) {
      continue;
    }

    if (score < 1 || score > 20) {
      alert(`Please enter a valid score for ${player}.`);
      return;
    }

    round.scores[player][round.currentHole] = score;
  }

  saveRoundToStorage();
  renderScorecard();
  message.textContent = `Scores saved for Hole ${round.currentHole}.`;
}

function nextHole() {
  saveScores();

  if (round.currentHole < round.totalHoles) {
    round.currentHole++;
    saveRoundToStorage();
    renderCurrentHole();
    renderScorecard();
  } else {
    message.textContent = "You are already on the final hole.";
  }
}

function previousHole() {
  saveScores();

  if (round.currentHole > 1) {
    round.currentHole--;
    saveRoundToStorage();
    renderCurrentHole();
    renderScorecard();
  } else {
    message.textContent = "You are already on Hole 1.";
  }
}

function endRoundManually() {
  if (round.players.length === 0) {
    return;
  }

  endRoundFromVoice();
}

function renderScorecard() {
  scorecardTable.innerHTML = "";
  scorecardTable.className = "scorecard-list";

  const totals = document.createElement("div");
  totals.className = "scorecard-totals";

  const parTotal = document.createElement("div");
  parTotal.className = "scorecard-total-row";
  parTotal.innerHTML = `<span>Par</span><strong>${getTotalCoursePar()}</strong><em>Total</em>`;
  totals.appendChild(parTotal);

  round.players.forEach(player => {
    const total = document.createElement("div");
    const toPar = getPlayerToPar(player);
    total.className = "scorecard-total-row";
    total.innerHTML = `<span>${escapeHtml(player)}</span><strong>${getPlayerTotal(player)}</strong><em>${formatToPar(toPar)}</em>`;
    totals.appendChild(total);
  });

  scorecardTable.appendChild(totals);

  for (let hole = 1; hole <= round.totalHoles; hole++) {
    const card = document.createElement("section");
    card.className = "scorecard-hole-card";

    if (hole === round.currentHole) {
      card.classList.add("current-hole");
    }

    const header = document.createElement("div");
    header.className = "scorecard-hole-header";
    header.innerHTML = `<h3>Hole ${hole}</h3><span>Par ${getHolePar(hole)}</span>`;
    card.appendChild(header);

    round.players.forEach(player => {
      const score = round.scores[player][hole] || "";
      const row = document.createElement("div");
      row.className = "scorecard-player-line";
      row.innerHTML = `<span>${escapeHtml(player)}</span><strong>${score || "—"}</strong>`;
      card.appendChild(row);
    });

    scorecardTable.appendChild(card);
  }

  renderLeader();
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function getPlayerTotal(player) {
  let total = 0;

  for (let hole = 1; hole <= round.totalHoles; hole++) {
    const score = round.scores[player][hole];

    if (score) {
      total += score;
    }
  }

  return total;
}

function renderLeader() {
  if (round.players.length === 0) {
    leaderText.textContent = "";
    return;
  }

  const totals = round.players.map(player => {
    return {
      name: player,
      total: getPlayerTotal(player)
    };
  });

  totals.sort((a, b) => a.total - b.total);

  const leader = totals[0];

  if (leader.total === 0) {
    leaderText.textContent = "No scores entered yet.";
  } else {
    leaderText.textContent = `Current leader: ${leader.name} with ${leader.total}`;
  }
}

function saveRoundToStorage() {
  localStorage.setItem("golfRound", JSON.stringify(round));
}

function loadSavedRound() {
  const savedRound = localStorage.getItem("golfRound");

  if (!savedRound) {
    return;
  }

  round = JSON.parse(savedRound);

  if (!round.holePars) {
  round.holePars = createDefaultPars(round.totalHoles);
}

fillMissingPars();

if (!round.holeLengths) {
  round.holeLengths = {};
}

  if (!round.holeTargets) {
  round.holeTargets = {};
}

normalizeHoleTargets();

renderHoleTargetInputs();

// This keeps old saved rounds from breaking if they used the earlier one-target system.
if (round.targetGreen && round.targetGreen.lat !== null && round.targetGreen.lng !== null) {
  round.holeTargets[round.currentHole] = {
    lat: round.targetGreen.lat,
    lng: round.targetGreen.lng
  };

  delete round.targetGreen;
  saveRoundToStorage();
}

  if (!round.targetGreen) {
  round.targetGreen = {
    lat: null,
    lng: null
  };
}

if (round.targetGreen.lat !== null && round.targetGreen.lng !== null) {
  targetLatInput.value = round.targetGreen.lat;
  targetLngInput.value = round.targetGreen.lng;
}

  updateRoundEntryButtons();
  showRoundScreen();
  renderCurrentHole();
  renderScorecard();
}

function resetRound() {
  const confirmed = confirm("Are you sure you want to reset the round?");

  if (!confirmed) {
    return;
  }

  localStorage.removeItem("golfRound");

  round = {
  courseName: "",
  players: [],
  totalHoles: 18,
  currentHole: 1,
  scores: {},
  holeTargets: {},
  holeHazards: {},
  holePars: {},
  holeLengths: {}
};

  showAppScreen("home");

  courseNameInput.value = "";
  playerNamesInput.value = "";
  totalHolesSelect.value = "18";

  setVoiceStatus("Voice ready.");

  if (transcriptText) {
    transcriptText.textContent = "";
  }

  clearTargetInputs();
  yardageResult.textContent = "No yardage calculated yet.";

  hazardNameInput.value = "";
  hazardTypeInput.value = "bunker";
  hazardLatInput.value = "";
  hazardLngInput.value = "";
  hazardList.textContent = "No hazards or layup targets saved for this hole.";

  selectedCourseSetup = null;

if (savedCourseSelect) {
  savedCourseSelect.value = "";
}

holeParInput.value = "4";
parSummary.textContent = "No par saved yet.";
updateRoundEntryButtons();
}

// -------------------------------
// Voice Recognition
// -------------------------------

function setupVoiceRecognition() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    if (canUseAudioRecordingFallback()) {
      setVoiceStatus("Voice recording ready. Tap Start Listening, speak, then tap Stop.");
      setVoiceButtonsDisabled(false);
      setVoiceButtonText("Start Listening");

      return;
    }

    setVoiceStatus("Voice needs microphone recording support. On phones, open the app with HTTPS or use a supported browser.");
    setVoiceButtonsDisabled(true);
    setVoiceButtonText("Voice Not Supported");

    return;
  }

  recognition = new SpeechRecognition();
  recognition.lang = "en-US";
  recognition.continuous = true;
  recognition.interimResults = true;

  recognition.onstart = function () {
    isVoiceCaptureActive = true;
    setVoiceStatus("Listening... pause briefly when you are done.");
    setVoiceButtonText("Listening...");
  };

  recognition.onresult = function (event) {
    if (isHandlingVoiceCommand) {
      return;
    }

    voiceInterimTranscript = "";

    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcriptPart = event.results[i][0].transcript.trim();

      if (!transcriptPart) {
        continue;
      }

      if (event.results[i].isFinal) {
        voiceFinalTranscript = `${voiceFinalTranscript} ${transcriptPart}`.trim();
      } else {
        voiceInterimTranscript = `${voiceInterimTranscript} ${transcriptPart}`.trim();
      }
    }

    const visibleTranscript = getPendingVoiceTranscript();

    if (visibleTranscript) {
      transcriptText.textContent = visibleTranscript;
      scheduleVoiceCommandFinalization();
    }
  };

  recognition.onerror = function (event) {
    clearVoiceSilenceTimer();
    isVoiceCaptureActive = false;
    isFinalizingVoiceCommand = false;
    setVoiceStatus(getVoiceRecognitionErrorMessage(event.error));
    setVoiceButtonText("Start Listening");
  };

  recognition.onend = function () {
  setVoiceButtonText("Start Listening");

  if (isVoiceCaptureActive && !isFinalizingVoiceCommand && getPendingVoiceTranscript()) {
    scheduleVoiceCommandFinalization(300);
    return;
  }

  isVoiceCaptureActive = false;

  setTimeout(function () {
    isHandlingVoiceCommand = false;
  }, 1000);
  };
}
async function startVoiceRecognition() {
  if (!recognition) {
    await toggleAudioRecordingFallback();
    return;
  }

  if (isVoiceCaptureActive) {
    finalizeVoiceCommandNow();
    return;
  }

  const microphonePermission = await getMicrophonePermissionState();

  if (microphonePermission === "denied") {
    setVoiceStatus(getVoiceRecognitionErrorMessage("not-allowed"));
    setVoiceButtonText("Start Listening");
    return;
  }

  try {
    resetVoiceCaptureState();
    recognition.start();
  } catch (error) {
    setVoiceStatus("Voice recognition could not start. Wait a moment, then tap Start Listening again.");
    setVoiceButtonText("Start Listening");
  }
}

function canUseAudioRecordingFallback() {
  return Boolean(
    navigator.mediaDevices &&
    navigator.mediaDevices.getUserMedia &&
    window.MediaRecorder
  );
}

async function toggleAudioRecordingFallback() {
  if (!canUseAudioRecordingFallback()) {
    alert("Voice recording is not available in this browser. On phones, the app usually needs to be opened with HTTPS for microphone access.");
    return;
  }

  if (isAudioRecordingFallback) {
    stopAudioRecordingFallback();
    return;
  }

  await startAudioRecordingFallback();
}

async function startAudioRecordingFallback() {
  try {
    resetVoiceCaptureState();
    clearAudioRecordingFallback();

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mimeType = getSupportedAudioMimeType();
    const recorderOptions = mimeType ? { mimeType } : undefined;

    audioChunks = [];
    audioRecordingStream = stream;
    audioRecorder = new MediaRecorder(stream, recorderOptions);

    audioRecorder.ondataavailable = function (event) {
      if (event.data && event.data.size > 0) {
        audioChunks.push(event.data);
      }
    };

    audioRecorder.onstop = function () {
      handleAudioRecordingComplete();
    };

    audioRecorder.start();
    isAudioRecordingFallback = true;
    isVoiceCaptureActive = true;
    setVoiceStatus("Listening... tap Stop when you are done.");
    setVoiceButtonText("Stop Listening");

    audioRecordingTimer = setTimeout(function () {
      if (isAudioRecordingFallback) {
        stopAudioRecordingFallback();
      }
    }, AUDIO_RECORDING_MAX_MS);
  } catch (error) {
    clearAudioRecordingFallback();
    setVoiceButtonText("Start Listening");
    setVoiceStatus(getAudioRecordingErrorMessage(error));
  }
}

function stopAudioRecordingFallback() {
  clearTimeout(audioRecordingTimer);
  audioRecordingTimer = null;

  if (audioRecorder && audioRecorder.state !== "inactive") {
    setVoiceStatus("Heard it. Transcribing...");
    setVoiceButtonText("Transcribing...");
    audioRecorder.stop();
    return;
  }

  clearAudioRecordingFallback();
}

async function handleAudioRecordingComplete() {
  const mimeType = audioRecorder ? audioRecorder.mimeType : "audio/webm";
  const audioBlob = new Blob(audioChunks, { type: mimeType || "audio/webm" });

  stopAudioTracks();
  isAudioRecordingFallback = false;
  isVoiceCaptureActive = false;

  if (!audioBlob.size) {
    setVoiceStatus("I did not hear anything. Tap Start Listening and try again.");
    setVoiceButtonText("Start Listening");
    clearAudioRecordingFallback();
    return;
  }

  try {
    isHandlingVoiceCommand = true;
    const transcript = await transcribeVoiceAudio(audioBlob);

    if (!transcript) {
      setVoiceStatus("I could not make out the words. Tap Start Listening and try again.");
      return;
    }

    transcriptText.textContent = transcript;
    setVoiceStatus("Heard it. Thinking...");
    await handleVoiceCommand(transcript);
  } catch (error) {
    console.warn("Audio transcription failed.", error);
    setVoiceStatus("I could not transcribe that audio. Check microphone access and try again.");
  } finally {
    isHandlingVoiceCommand = false;
    isFinalizingVoiceCommand = false;
    setVoiceButtonText("Start Listening");
    clearAudioRecordingFallback();
  }
}

async function transcribeVoiceAudio(audioBlob) {
  const response = await fetch("/api/transcribe", {
    method: "POST",
    headers: {
      "Content-Type": audioBlob.type || "audio/webm"
    },
    body: audioBlob
  });

  const body = await response.json().catch(function () {
    return {};
  });

  if (!response.ok) {
    throw new Error(body.error || "Audio transcription failed.");
  }

  return typeof body.transcript === "string" ? body.transcript.trim() : "";
}

function getSupportedAudioMimeType() {
  const candidates = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/mp4",
    "audio/ogg;codecs=opus"
  ];

  if (!window.MediaRecorder || !MediaRecorder.isTypeSupported) {
    return "";
  }

  return candidates.find(type => MediaRecorder.isTypeSupported(type)) || "";
}

function getAudioRecordingErrorMessage(error) {
  if (!window.isSecureContext) {
    return "Phone browsers require HTTPS for microphone access. The page can load over Wi-Fi, but voice needs HTTPS.";
  }

  if (error && (error.name === "NotAllowedError" || error.name === "SecurityError")) {
    return "Microphone access is blocked. Allow microphone access for this site, then tap Start Listening again.";
  }

  if (error && error.name === "NotFoundError") {
    return "No microphone was found. Check your device microphone, then tap Start Listening again.";
  }

  return "Voice recording could not start. Check microphone permissions and try again.";
}

function clearAudioRecordingFallback() {
  clearTimeout(audioRecordingTimer);
  audioRecordingTimer = null;
  audioRecorder = null;
  audioChunks = [];
  stopAudioTracks();
  isAudioRecordingFallback = false;
}

function stopAudioTracks() {
  if (!audioRecordingStream) {
    return;
  }

  audioRecordingStream.getTracks().forEach(track => {
    track.stop();
  });

  audioRecordingStream = null;
}

function resetVoiceCaptureState() {
  clearVoiceSilenceTimer();
  clearAudioRecordingFallback();
  isVoiceCaptureActive = false;
  isFinalizingVoiceCommand = false;
  voiceFinalTranscript = "";
  voiceInterimTranscript = "";
  transcriptText.textContent = "";
}

function getPendingVoiceTranscript() {
  return `${voiceFinalTranscript} ${voiceInterimTranscript}`.trim();
}

function scheduleVoiceCommandFinalization(delay = VOICE_SILENCE_DELAY_MS) {
  clearVoiceSilenceTimer();

  voiceSilenceTimer = setTimeout(function () {
    finalizeVoiceCommandNow();
  }, delay);
}

function clearVoiceSilenceTimer() {
  if (voiceSilenceTimer) {
    clearTimeout(voiceSilenceTimer);
    voiceSilenceTimer = null;
  }
}

async function finalizeVoiceCommandNow() {
  if (isFinalizingVoiceCommand || isHandlingVoiceCommand) {
    return;
  }

  clearVoiceSilenceTimer();

  const transcript = getPendingVoiceTranscript();

  if (!transcript) {
    isVoiceCaptureActive = false;
    setVoiceButtonText("Start Listening");
    setVoiceStatus("I did not hear anything. Tap Start Listening and try again.");
    return;
  }

  isFinalizingVoiceCommand = true;
  isVoiceCaptureActive = false;

  try {
    recognition.stop();
  } catch (error) {
    // Recognition may already be stopped by the browser.
  }

  const now = Date.now();
  const normalizedTranscript = transcript.toLowerCase();

  if (
    normalizedTranscript === lastVoiceCommand &&
    now - lastVoiceCommandTime < 2000
  ) {
    resetVoiceCaptureState();
    return;
  }

  isHandlingVoiceCommand = true;
  lastVoiceCommand = normalizedTranscript;
  lastVoiceCommandTime = now;
  transcriptText.textContent = transcript;
  setVoiceStatus("Heard it. Thinking...");

  try {
    await handleVoiceCommand(transcript);
  } finally {
    isHandlingVoiceCommand = false;
    isFinalizingVoiceCommand = false;
    isVoiceCaptureActive = false;
    setVoiceButtonText("Start Listening");
    voiceFinalTranscript = "";
    voiceInterimTranscript = "";
  }
}

async function getMicrophonePermissionState() {
  if (!navigator.permissions || !navigator.permissions.query) {
    return "";
  }

  try {
    const status = await navigator.permissions.query({ name: "microphone" });
    return status.state;
  } catch (error) {
    return "";
  }
}

function getVoiceRecognitionErrorMessage(error) {
  if (error === "not-allowed" || error === "service-not-allowed") {
    return "Microphone access is blocked. Allow microphone access for this site in the browser, then tap Start Listening again.";
  }

  if (error === "audio-capture") {
    return "No microphone was found. Check your device microphone, then tap Start Listening again.";
  }

  if (error === "no-speech") {
    return "I did not hear anything. Tap Start Listening and try again.";
  }

  if (error === "network") {
    return "Voice recognition needs a network connection in this browser. Check the connection and try again.";
  }

  if (error === "aborted") {
    return "Voice listening stopped. Tap Start Listening when you are ready.";
  }

  return "Voice recognition hit a browser error. Check microphone permissions and try again.";
}
async function handleVoiceCommand(transcript) {
  if (tryHandleFastLocalVoiceCommand(transcript)) {
    return;
  }

  setVoiceStatus("Thinking through that with the AI caddie...");

  try {
    const agentResult = await askVoiceAgent(transcript);

    if (agentResult && executeVoiceAgentAction(agentResult)) {
      return;
    }
  } catch (error) {
    console.warn("AI voice agent unavailable, using legacy parser.", error);
  }

  if (round.players.length === 0) {
    showFastCaddieMessage("Tell me the course to start. For example, say: start a round at Prairie Pines with Alex and Sam.", true);
    return;
  }

  handleLegacyVoiceCommand(transcript);
}

function tryHandleFastLocalVoiceCommand(transcript) {
  const command = transcript.toLowerCase().trim();

  if (!command) {
    return false;
  }

  if (tryHandleRoundLifecycleVoiceCommand(command, transcript)) {
    return true;
  }

  if (round.players.length === 0) {
    return false;
  }

  const correction = parseCorrectionCommand(command);

  if (correction) {
    round.scores[correction.player][correction.hole] = correction.score;

    saveRoundToStorage();
    renderCurrentHole();
    renderScorecard();

    const confirmation = `Updated ${correction.player}'s score on Hole ${correction.hole} to ${correction.score}.`;
    showFastCaddieMessage(confirmation, false);
    return true;
  }

  const navigationMessage = handleRoundNavigationCommand(command);

  if (navigationMessage) {
    showFastCaddieMessage(navigationMessage, false);
    return true;
  }

  const scoreEntries = parseScoreCommand(command);

  if (scoreEntries.length > 0) {
    scoreEntries.forEach(entry => {
      round.scores[entry.player][round.currentHole] = entry.score;
    });

    saveRoundToStorage();
    renderCurrentHole();
    renderScorecard();

    const confirmationParts = scoreEntries.map(entry => {
      return `${entry.player} ${entry.score}`;
    });

    showFastCaddieMessage(`Saved for Hole ${round.currentHole}: ${confirmationParts.join(", ")}.`, false);
    return true;
  }

  if (commandLooksLikeScoreEntry(command)) {
    setVoiceStatus("Listening for score entry...");
    return true;
  }

  if (handleYardageVoiceCommand(command)) {
    return true;
  }

  if (handleHazardVoiceCommand(command)) {
    return true;
  }

  const questionAnswer = answerVoiceQuestion(command);

  if (questionAnswer) {
    showFastCaddieMessage(questionAnswer, true);
    return true;
  }

  return false;
}

function showFastCaddieMessage(text, shouldSpeak) {
  message.textContent = text;
  setVoiceStatus(text);

  if (shouldSpeak) {
    speakText(text);
  }
}

function tryHandleRoundLifecycleVoiceCommand(command, transcript) {
  if (isEndRoundCommand(command)) {
    endRoundFromVoice();
    return true;
  }

  if (isStartRoundCommand(command)) {
    startRoundFromVoice(transcript);
    return true;
  }

  return false;
}

function isStartRoundCommand(command) {
  return (
    /\b(start|begin|play|create|open)\b/.test(command) &&
    /\b(round|golf|course)\b/.test(command)
  ) ||
    /\b(play|open)\b.+\bwith\b/.test(command) ||
    /\b(start|begin)\b\s+(?:at|on|for)\b/.test(command);
}

function isEndRoundCommand(command) {
  return /\b(end|finish|complete|close)\b/.test(command) &&
    /\b(round|golf)\b/.test(command);
}

function startRoundFromVoice(transcript) {
  if (round.players.length > 0) {
    showFastCaddieMessage("You already have an active round. Say end round when you are finished, or use Reset Round to clear it.", true);
    return;
  }

  const parsedRound = parseVoiceRoundStart(transcript);

  if (!parsedRound.courseName) {
    showFastCaddieMessage("What course should I start? Try saying: start a round at Prairie Pines with Alex and Sam.", true);
    showAppScreen("startSetup");
    return;
  }

  const savedCourse = findSavedCourseSetupByName(parsedRound.courseName);
  const courseName = savedCourse ? savedCourse.courseName : parsedRound.courseName;
  const playerNames = parsedRound.players.length > 0
    ? parsedRound.players
    : getPlayersFromSetupForm();
  const players = playerNames.length > 0 ? playerNames : ["Golfer"];
  const totalHoles = parsedRound.totalHoles || (savedCourse ? savedCourse.totalHoles : Number(totalHolesSelect.value || 18));

  selectedCourseSetup = savedCourse || null;
  courseNameInput.value = courseName;
  playerNamesInput.value = players.join(", ");
  totalHolesSelect.value = String(totalHoles === 9 ? 9 : 18);

  startRound();

  const setupText = savedCourse ? " using the saved course setup" : "";
  showFastCaddieMessage(`Starting ${totalHolesSelect.value} holes at ${round.courseName}${setupText}. You are on Hole 1.`, true);
}

function endRoundFromVoice() {
  if (round.players.length === 0) {
    showFastCaddieMessage("There is no active round to end yet. Say start a round at the course name when you are ready.", true);
    return;
  }

  saveScores();
  renderScorecard();
  saveRoundToStorage();
  showAppScreen("scorecard");
  showFastCaddieMessage(buildFinalRoundMessage(), true);
}

function parseVoiceRoundStart(transcript) {
  const rawTranscript = String(transcript || "").trim();
  const totalHoles = parseSpokenHoleCount(rawTranscript);
  const players = parseSpokenPlayers(rawTranscript);
  const courseName = parseSpokenCourseName(rawTranscript);

  return {
    courseName: courseName,
    players: players,
    totalHoles: totalHoles
  };
}

function parseSpokenCourseName(transcript) {
  const match = transcript.match(/\b(?:start|begin|play|create|open)\s+(?:a\s+)?(?:new\s+)?(?:round|golf|course)?\s*(?:at|on|for)\s+(.+)$/i);

  if (match) {
    return cleanSpokenCourseName(match[1]);
  }

  const playMatch = transcript.match(/\b(?:play|open)\s+(.+)$/i);

  if (playMatch) {
    return cleanSpokenCourseName(playMatch[1]);
  }

  return "";
}

function cleanSpokenCourseName(value) {
  return String(value || "")
    .replace(/\bwith\b.+$/i, "")
    .replace(/\b(?:for|playing)\s+(?:nine|9|eighteen|18)\s+(?:holes?)?\b.*$/i, "")
    .replace(/\b(?:nine|9|eighteen|18)\s+holes?\b.*$/i, "")
    .replace(/[.?!]+$/g, "")
    .trim();
}

function parseSpokenPlayers(transcript) {
  const match = String(transcript || "").match(/\bwith\s+(.+)$/i);

  if (!match) {
    return [];
  }

  return match[1]
    .replace(/\b(?:for|playing)\s+(?:nine|9|eighteen|18)\s+(?:holes?)?\b.*$/i, "")
    .replace(/[.?!]+$/g, "")
    .split(/\s*(?:,| and | & )\s*/i)
    .map(name => normalizeSpokenPlayerName(name))
    .filter(name => name !== "");
}

function normalizeSpokenPlayerName(name) {
  const trimmed = String(name || "").trim();

  if (/^(i|me|myself)$/i.test(trimmed)) {
    return "Golfer";
  }

  return trimmed.replace(/\b(player|golfer)\b/gi, "").trim();
}

function parseSpokenHoleCount(transcript) {
  const normalized = String(transcript || "").toLowerCase();

  if (/\b(9|nine)\s*(holes?)?\b/.test(normalized)) {
    return 9;
  }

  if (/\b(18|eighteen)\s*(holes?)?\b/.test(normalized)) {
    return 18;
  }

  return 0;
}

function getPlayersFromSetupForm() {
  return playerNamesInput.value
    .split(",")
    .map(name => name.trim())
    .filter(name => name !== "");
}

function findSavedCourseSetupByName(courseName) {
  const normalizedName = normalizeCourseNameForMatch(courseName);

  if (!normalizedName) {
    return null;
  }

  return getSavedCourseSetups().find(course => {
    const savedName = normalizeCourseNameForMatch(course.courseName);
    return savedName === normalizedName ||
      savedName.includes(normalizedName) ||
      normalizedName.includes(savedName);
  }) || null;
}

function normalizeCourseNameForMatch(courseName) {
  return String(courseName || "")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/\bgolf\b/g, "")
    .replace(/\bcountry\b/g, "")
    .replace(/\bclub\b/g, "")
    .replace(/\bcourse\b/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function buildFinalRoundMessage() {
  const totals = round.players
    .map(player => ({
      name: player,
      total: getPlayerTotal(player)
    }))
    .sort((a, b) => a.total - b.total);

  if (totals.length === 0 || totals[0].total === 0) {
    return `Round ended at ${round.courseName}. No scores were entered.`;
  }

  const summary = totals.map(player => {
    return `${player.name} ${player.total}`;
  }).join(", ");

  return `Round ended at ${round.courseName}. Final scores: ${summary}.`;
}

async function askVoiceAgent(transcript) {
  const controller = new AbortController();
  const timeoutId = setTimeout(function () {
    controller.abort();
  }, 10000);

  try {
    const response = await fetch("/api/voice-agent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        transcript: transcript,
        round: buildRoundContextForAgent(),
        client: {
          app: "golf-assistant-prototype",
          url: window.location.href
        }
      }),
      signal: controller.signal
    });

    if (!response.ok) {
      throw new Error(`Voice agent request failed with ${response.status}.`);
    }

    const result = await response.json();

    if (!isValidVoiceAgentResult(result)) {
      throw new Error("Voice agent returned an invalid response.");
    }

    return result;
  } finally {
    clearTimeout(timeoutId);
  }
}

function buildRoundContextForAgent() {
  return {
    courseName: round.courseName,
    players: round.players,
    totalHoles: round.totalHoles,
    currentHole: round.currentHole,
    scores: round.scores,
    holeTargets: round.holeTargets || {},
    holeHazards: round.holeHazards || {},
    holePars: round.holePars || {},
    holeLengths: round.holeLengths || {}
  };
}

function isValidVoiceAgentResult(result) {
  const allowedActions = [
    "start_round",
    "end_round",
    "save_scores",
    "change_score",
    "set_par",
    "go_to_hole",
    "answer_question",
    "get_green_yardage",
    "get_hazard_distance",
    "clarify",
    "unknown"
  ];

  return Boolean(
    result &&
    allowedActions.includes(result.action) &&
    typeof result.confidence === "number" &&
    result.confidence >= 0 &&
    result.confidence <= 1 &&
    result.payload &&
    typeof result.payload === "object" &&
    typeof result.message === "string" &&
    typeof result.speak === "boolean"
  );
}

function handleLegacyVoiceCommand(transcript) {
  const command = transcript.toLowerCase().trim();

  // 1. Check for correction commands first.
  const correction = parseCorrectionCommand(command);

  if (correction) {
    round.scores[correction.player][correction.hole] = correction.score;

    saveRoundToStorage();
    renderCurrentHole();
    renderScorecard();

    const confirmation = `Updated ${correction.player}'s score on Hole ${correction.hole} to ${correction.score}.`;

    message.textContent = confirmation;
    setVoiceStatus(confirmation);

    // No speaking for corrections.
    return;
  }

  // 2. Check for round navigation commands.
  const navigationMessage = handleRoundNavigationCommand(command);

  if (navigationMessage) {
    message.textContent = navigationMessage;
    setVoiceStatus(navigationMessage);

    // No speaking for navigation.
    return;
  }

  // 3. Check for normal score entry commands.
  const scoreEntries = parseScoreCommand(command);

  if (scoreEntries.length > 0) {
    scoreEntries.forEach(entry => {
      round.scores[entry.player][round.currentHole] = entry.score;
    });

    saveRoundToStorage();
    renderCurrentHole();
    renderScorecard();

    const confirmationParts = scoreEntries.map(entry => {
      return `${entry.player} ${entry.score}`;
    });

    const confirmation = `Saved for Hole ${round.currentHole}: ${confirmationParts.join(", ")}.`;

    message.textContent = confirmation;
    setVoiceStatus(confirmation);

    // No speaking for score entry.
    return;
  }

  // 4. If it sounds like incomplete score entry, do not answer out loud.
if (commandLooksLikeScoreEntry(command)) {
  setVoiceStatus("Listening for score entry...");
  return;
}

// 5. Check for yardage questions.
const handledYardageCommand = handleYardageVoiceCommand(command);

if (handledYardageCommand) {
  return;
}

const handledHazardCommand = handleHazardVoiceCommand(command);

if (handledHazardCommand) {
  return;
}

// 6. Only clear questions should be spoken.
const questionAnswer = answerVoiceQuestion(command);

if (questionAnswer) {
  message.textContent = questionAnswer;
  setVoiceStatus(questionAnswer);
  speakText(questionAnswer);
  return;
}
}

function executeVoiceAgentAction(result) {
  if (result.action === "clarify") {
    showVoiceAgentMessage(result.message || "Can you say that one more way?", true);
    return true;
  }

  if (result.action === "unknown") {
    showVoiceAgentMessage(result.message || "I can help with scores, holes, yardages, and saved targets.", true);
    return true;
  }

  if (result.confidence < AI_VOICE_CONFIDENCE_THRESHOLD) {
    return false;
  }

  if (result.action === "start_round") {
    return executeAgentStartRound(result);
  }

  if (result.action === "end_round") {
    return executeAgentEndRound(result);
  }

  if (result.action === "save_scores") {
    return executeAgentSaveScores(result);
  }

  if (result.action === "change_score") {
    return executeAgentChangeScore(result);
  }

  if (result.action === "set_par") {
    return executeAgentSetPar(result);
  }

  if (result.action === "go_to_hole") {
    return executeAgentGoToHole(result);
  }

  if (result.action === "answer_question") {
    return executeAgentAnswerQuestion(result);
  }

  if (result.action === "get_green_yardage") {
    showVoiceAgentMessage(result.message || "Getting yardage...", false);
    getYardageToGreen(true);
    return true;
  }

  if (result.action === "get_hazard_distance") {
    showVoiceAgentMessage(result.message || "Getting hazard distance...", false);
    handleAgentHazardDistance(result);
    return true;
  }

  return false;
}

function executeAgentStartRound(result) {
  if (round.players.length > 0) {
    showVoiceAgentMessage("You already have an active round. Say end round when you are finished, or use Reset Round to clear it.", true);
    return true;
  }

  const courseName = String(result.payload.courseName || "").trim();
  const players = Array.isArray(result.payload.players)
    ? result.payload.players.map(player => String(player).trim()).filter(player => player !== "")
    : [];
  const totalHoles = Number(result.payload.totalHoles || 18);

  if (!courseName || players.length === 0 || ![9, 18].includes(totalHoles)) {
    return false;
  }

  const savedCourse = findSavedCourseSetupByName(courseName);

  selectedCourseSetup = savedCourse || null;
  courseNameInput.value = savedCourse ? savedCourse.courseName : courseName;
  playerNamesInput.value = players.join(", ");
  totalHolesSelect.value = String(savedCourse ? savedCourse.totalHoles : totalHoles);

  startRound();
  showVoiceAgentMessage(result.message || `Starting a round at ${round.courseName}. You are on Hole 1.`, result.speak);
  return true;
}

function executeAgentEndRound(result) {
  if (round.players.length === 0) {
    showVoiceAgentMessage("There is no active round to end yet.", true);
    return true;
  }

  saveScores();
  renderScorecard();
  saveRoundToStorage();
  showAppScreen("scorecard");
  showVoiceAgentMessage(result.message || buildFinalRoundMessage(), result.speak);
  return true;
}

function executeAgentSaveScores(result) {
  const scores = Array.isArray(result.payload.scores) ? result.payload.scores : [];

  if (scores.length === 0) {
    return false;
  }

  const validatedScores = [];

  for (const entry of scores) {
    const player = getExactPlayerName(entry.player);
    const hole = Number(entry.hole || round.currentHole);
    const score = Number(entry.score);

    if (!player || !isValidHoleNumber(hole) || !isValidScoreValue(score)) {
      return false;
    }

    validatedScores.push({
      player: player,
      hole: hole,
      score: score
    });
  }

  validatedScores.forEach(entry => {
    ensurePlayerScoreBucket(entry.player);
    round.scores[entry.player][entry.hole] = entry.score;
  });

  saveRoundToStorage();
  renderCurrentHole();
  renderScorecard();

  const response = result.message || buildScoreSaveMessage(validatedScores);
  showVoiceAgentMessage(response, result.speak);
  return true;
}

function executeAgentChangeScore(result) {
  const player = getExactPlayerName(result.payload.player);
  const hole = Number(result.payload.hole || round.currentHole);
  const score = Number(result.payload.score);

  if (!player || !isValidHoleNumber(hole) || !isValidScoreValue(score)) {
    return false;
  }

  ensurePlayerScoreBucket(player);
  round.scores[player][hole] = score;
  saveRoundToStorage();
  renderCurrentHole();
  renderScorecard();

  showVoiceAgentMessage(result.message || `Updated ${player}'s score on Hole ${hole} to ${score}.`, result.speak);
  return true;
}

function executeAgentSetPar(result) {
  const hole = Number(result.payload.hole || round.currentHole);
  const par = Number(result.payload.par);

  if (!isValidHoleNumber(hole) || !isValidParValue(par)) {
    return false;
  }

  if (!round.holePars) {
    round.holePars = {};
  }

  round.holePars[hole] = par;

  if (hole === round.currentHole) {
    holeParInput.value = String(par);
  }

  saveRoundToStorage();
  renderHoleParInput();
  renderScorecard();

  showVoiceAgentMessage(result.message || `Hole ${hole} is now a par ${par}.`, result.speak);
  return true;
}

function executeAgentGoToHole(result) {
  const hole = Number(result.payload.hole);

  if (!isValidHoleNumber(hole)) {
    return false;
  }

  saveScores();
  round.currentHole = hole;
  saveRoundToStorage();
  renderCurrentHole();
  renderScorecard();

  showVoiceAgentMessage(result.message || `Moved to Hole ${round.currentHole}.`, result.speak);
  return true;
}

function executeAgentAnswerQuestion(result) {
  const response = result.payload.answer || result.message;

  if (!response) {
    return false;
  }

  showVoiceAgentMessage(response, result.speak);
  return true;
}

function handleAgentHazardDistance(result) {
  const targetName = String(result.payload.targetName || "").trim().toLowerCase();

  if (!targetName) {
    handleHazardVoiceCommand("what hazards are ahead");
    return;
  }

  handleHazardVoiceCommand(`how far to ${targetName}`);
}

function showVoiceAgentMessage(text, shouldSpeak) {
  message.textContent = text;
  setVoiceStatus(text);

  if (shouldSpeak) {
    speakText(text);
  }
}

function getExactPlayerName(playerName) {
  if (!playerName) {
    return "";
  }

  const normalizedName = String(playerName).trim().toLowerCase();

  return round.players.find(player => {
    return player.toLowerCase() === normalizedName;
  }) || "";
}

function isValidScoreValue(score) {
  return Number.isInteger(score) && score >= 1 && score <= 20;
}

function isValidHoleNumber(hole) {
  return Number.isInteger(hole) && hole >= 1 && hole <= round.totalHoles;
}

function isValidParValue(par) {
  return Number.isInteger(par) && par >= 3 && par <= 6;
}

function ensurePlayerScoreBucket(player) {
  if (!round.scores) {
    round.scores = {};
  }

  if (!round.scores[player]) {
    round.scores[player] = {};
  }
}

function buildScoreSaveMessage(scores) {
  const parts = scores.map(entry => {
    return `${entry.player} ${entry.score}`;
  });

  return `Saved for Hole ${round.currentHole}: ${parts.join(", ")}.`;
}

function parseScoreCommand(command) {
  const entries = [];

  round.players.forEach((player, index) => {
    const playerName = player.toLowerCase();

    const possibleNames = [playerName];

    // Treat the first player as "I", "me", or "my"
    if (index === 0) {
      possibleNames.push("i");
      possibleNames.push("me");
      possibleNames.push("my");
    }

    for (const name of possibleNames) {
      const score = findScoreForName(command, name);

      if (score !== null) {
        entries.push({
          player: player,
          score: score
        });

        break;
      }
    }
  });

  return entries;
}

function findScoreForName(command, name) {
  const numberPattern = "(\\d+|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|double\\s+bogey|triple\\s+bogey|quadruple\\s+bogey|birdie|bogey|eagle|albatross|par)";

  const escapedName = escapeRegExp(name);

  const patterns = [
    new RegExp(`(?:^|\\s)${escapedName}\\s+(?:scored|score|got|had|made|shot)\\s+(?:a\\s+)?${numberPattern}(?:\\s|$|,|\\.)`, "i"),
    new RegExp(`(?:^|\\s)${escapedName}\\s+(?:with)\\s+(?:a\\s+)?${numberPattern}(?:\\s|$|,|\\.)`, "i")
  ];

  for (const pattern of patterns) {
    const match = command.match(pattern);

    if (match) {
      return convertScoreToNumber(match[1]);
    }
  }

  return null;
}

function convertScoreToNumber(scoreText) {
  const normalizedScoreText = String(scoreText).toLowerCase().trim().replace(/\s+/g, " ");
  const currentPar = getHolePar(round.currentHole);
  const relativeScores = {
    albatross: currentPar - 3,
    eagle: currentPar - 2,
    birdie: currentPar - 1,
    par: currentPar,
    bogey: currentPar + 1,
    "double bogey": currentPar + 2,
    "triple bogey": currentPar + 3,
    "quadruple bogey": currentPar + 4
  };

  if (relativeScores[normalizedScoreText]) {
    return relativeScores[normalizedScoreText];
  }

  const numberWords = {
    one: 1,
    two: 2,
    three: 3,
    four: 4,
    five: 5,
    six: 6,
    seven: 7,
    eight: 8,
    nine: 9,
    ten: 10,
    eleven: 11,
    twelve: 12,
    thirteen: 13,
    fourteen: 14,
    fifteen: 15,
    sixteen: 16,
    seventeen: 17,
    eighteen: 18,
    nineteen: 19,
    twenty: 20
  };

  if (numberWords[normalizedScoreText]) {
    return numberWords[normalizedScoreText];
  }

  return Number(normalizedScoreText);
}

function escapeRegExp(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function speakText(text) {
  if (!window.speechSynthesis) {
    if (audioStatus) {
      audioStatus.textContent = "Voice responses are not supported in this browser.";
    }

    return;
  }

  if (!voiceResponsesEnabled) {
    if (audioStatus) {
      audioStatus.textContent = "Tap Enable Voice Responses first.";
    }

    return;
  }

  window.speechSynthesis.cancel();

  // Small delay helps prevent speech from fighting with voice recognition ending.
  setTimeout(function () {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 1;
    utterance.pitch = 1;

    window.speechSynthesis.speak(utterance);
  }, 250);
}

// -------------------------------
// Voice Questions
// -------------------------------

function answerVoiceQuestion(command) {
  if (isHoleLengthQuestion(command)) {
    const mentionedHole = extractHoleNumber(command) || round.currentHole;
    const length = getHoleLength(mentionedHole);

    if (length) {
      return `Hole ${mentionedHole} is ${length} yards.`;
    }

    return `Hole ${mentionedHole} yardage is not loaded yet.`;
  }

  // Current hole questions
  if (isCurrentHoleQuestion(command)) {
    return `You are currently on Hole ${round.currentHole}.`;
  }

  // Winning / leader questions
  if (isWinningQuestion(command)) {
    return getWinningMessage();
  }

  // To-par questions
  if (isToParQuestion(command)) {
    const mentionedPlayer = findPlayerInCommand(command);

    if (mentionedPlayer) {
      const toPar = getPlayerToPar(mentionedPlayer);
      return `${mentionedPlayer} is ${formatToParForSpeech(toPar)}.`;
    }

    return getAllPlayersToParMessage();
  }

  // All scores / scorecard questions
  if (isAllScoresQuestion(command)) {
    return getAllScoresMessage();
  }

  const mentionedPlayer = findPlayerInCommand(command);
  const mentionedHole = extractHoleNumber(command);

  // Specific player on specific hole
  if (mentionedPlayer && mentionedHole !== null) {
    return getPlayerHoleScoreMessage(mentionedPlayer, mentionedHole);
  }

  // Player total questions
  if (mentionedPlayer && isTotalQuestion(command)) {
    return `${mentionedPlayer}'s total is ${getPlayerTotal(mentionedPlayer)}.`;
  }

  // General player score questions
  if (mentionedPlayer && isGeneralPlayerScoreQuestion(command)) {
    return `${mentionedPlayer}'s total is ${getPlayerTotal(mentionedPlayer)}.`;
  }

  // General total questions
  if (command.includes("total") || command.includes("totals")) {
    return getAllScoresMessage();
  }

  return null;
}

function isHoleLengthQuestion(command) {
  return (
    command.includes("how long") ||
    command.includes("hole length") ||
    command.includes("scorecard yardage") ||
    command.includes("tee yardage") ||
    command.includes("how many yards is this hole") ||
    command.includes("how many yards is hole")
  );
}

function isToParQuestion(command) {
  return (
    command.includes("to par") ||
    command.includes("over par") ||
    command.includes("under par") ||
    command.includes("relative to par")
  );
}

function formatToParForSpeech(toPar) {
  if (toPar === null) {
    return "not scored yet";
  }

  if (toPar === 0) {
    return "even par";
  }

  if (toPar > 0) {
    return `${toPar} over par`;
  }

  return `${Math.abs(toPar)} under par`;
}

function getAllPlayersToParMessage() {
  if (!hasAnyScoresEntered()) {
    return "No scores have been entered yet.";
  }

  const parts = round.players.map(player => {
    return `${player} ${formatToParForSpeech(getPlayerToPar(player))}`;
  });

  return `Scores to par: ${parts.join(", ")}.`;
}

function isCurrentHoleQuestion(command) {
  return (
    command.includes("what hole") ||
    command.includes("which hole") ||
    command.includes("current hole") ||
    command.includes("hole are we on")
  );
}

function isWinningQuestion(command) {
  return (
    command.includes("who is winning") ||
    command.includes("who's winning") ||
    command.includes("who is leading") ||
    command.includes("who's leading") ||
    command.includes("leader") ||
    command.includes("in the lead")
  );
}

function isAllScoresQuestion(command) {
  return (
    command.includes("what are the scores") ||
    command.includes("read the scores") ||
    command.includes("read the scorecard") ||
    command.includes("scorecard") ||
    command.includes("standings") ||
    command.includes("everyone's score") ||
    command.includes("everyones score")
  );
}

function isTotalQuestion(command) {
  return (
    command.includes("total") ||
    command.includes("overall") ||
    command.includes("what is") ||
    command.includes("what's") ||
    command.includes("what am i at") ||
    command.includes("what am i shooting") ||
    command.includes("what is my score") ||
    command.includes("what's my score")
  );
}

function isGeneralPlayerScoreQuestion(command) {
  return (
    command.includes("what is") ||
    command.includes("what's") ||
    command.includes("what am i at") ||
    command.includes("what am i shooting") ||
    command.includes("what is my score") ||
    command.includes("what's my score") ||
    command.includes("how many") ||
    command.includes("where am i") ||
    command.includes("where do i stand")
  );
}

function findPlayerInCommand(command) {
  for (let i = 0; i < round.players.length; i++) {
    const player = round.players[i];
    const playerName = player.toLowerCase();

    const playerPattern = new RegExp(`\\b${escapeRegExp(playerName)}\\b`, "i");

    if (playerPattern.test(command)) {
      return player;
    }

    // Treat the first player as the main user.
    // Example: if Drake is first, "my score" means Drake's score.
    if (i === 0) {
      if (
        /\bi\b/.test(command) ||
        /\bme\b/.test(command) ||
        /\bmy\b/.test(command)
      ) {
        return player;
      }
    }
  }

  return null;
}

function extractHoleNumber(command) {
  const numberPattern = "(\\d+|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen)";

  const holeMatch = command.match(new RegExp(`hole\\s+${numberPattern}`, "i"));

  if (!holeMatch) {
    return null;
  }

  const holeNumber = convertScoreToNumber(holeMatch[1]);

  if (holeNumber < 1 || holeNumber > round.totalHoles) {
    return null;
  }

  return holeNumber;
}

function getPlayerHoleScoreMessage(player, hole) {
  const score = round.scores[player][hole];

  if (!score) {
    return `I do not have a score for ${player} on Hole ${hole} yet.`;
  }

  return `${player} scored ${score} on Hole ${hole}.`;
}

function getWinningMessage() {
  if (!hasAnyScoresEntered()) {
    return "No scores have been entered yet.";
  }

  const totals = round.players.map(player => {
    return {
      name: player,
      total: getPlayerTotal(player)
    };
  });

  totals.sort((a, b) => a.total - b.total);

  const lowestScore = totals[0].total;

  const leaders = totals.filter(player => {
    return player.total === lowestScore;
  });

  if (leaders.length === 1) {
    return `Based on the scores entered, ${leaders[0].name} is winning with ${lowestScore}.`;
  }

  const leaderNames = leaders.map(player => player.name).join(" and ");

  return `Based on the scores entered, ${leaderNames} are tied for the lead with ${lowestScore}.`;
}

function getAllScoresMessage() {
  if (!hasAnyScoresEntered()) {
    return "No scores have been entered yet.";
  }

  const totals = round.players.map(player => {
    return {
      name: player,
      total: getPlayerTotal(player)
    };
  });

  totals.sort((a, b) => a.total - b.total);

  const scoreParts = totals.map(player => {
    return `${player.name} ${player.total}`;
  });

  return `Current totals: ${scoreParts.join(", ")}.`;
}

function hasAnyScoresEntered() {
  for (const player of round.players) {
    for (let hole = 1; hole <= round.totalHoles; hole++) {
      if (round.scores[player][hole]) {
        return true;
      }
    }
  }

  return false;
}

// -------------------------------
// Voice Score Corrections
// -------------------------------

function parseCorrectionCommand(command) {
  const isCorrectionCommand =
    command.includes("change") ||
    command.includes("update") ||
    command.includes("fix") ||
    command.includes("correct") ||
    command.includes("set");

  if (!isCorrectionCommand) {
    return null;
  }

  const player = findPlayerInCommand(command);

  if (!player) {
    return null;
  }

  let hole = extractHoleNumber(command);

  if (hole === null) {
    hole = round.currentHole;
  }

  const newScore = extractNewScore(command);

  if (newScore === null) {
    return null;
  }

  if (newScore < 1 || newScore > 20) {
    return null;
  }

  return {
    player: player,
    hole: hole,
    score: newScore
  };
}

function extractNewScore(command) {
  const numberPattern = "(\\d+|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty)";

  const patterns = [
    new RegExp(`\\bto\\s+(?:a\\s+)?${numberPattern}\\b`, "i"),
    new RegExp(`\\bas\\s+(?:a\\s+)?${numberPattern}\\b`, "i"),
    new RegExp(`\\bat\\s+(?:a\\s+)?${numberPattern}\\b`, "i")
  ];

  for (const pattern of patterns) {
    const match = command.match(pattern);

    if (match) {
      return convertScoreToNumber(match[1]);
    }
  }

  return null;
}

function commandLooksLikeScoreEntry(command) {
  const questionStarters = [
    "what",
    "who",
    "which",
    "how",
    "where",
    "when"
  ];

  const startsAsQuestion = questionStarters.some(word => {
    return command.startsWith(word + " ");
  });

  if (startsAsQuestion) {
    return false;
  }

  const scoreEntryWords = [
    "scored",
    "score",
    "got",
    "had",
    "made",
    "shot"
  ];

  const hasScoreEntryVerb = scoreEntryWords.some(word => {
    const pattern = new RegExp(`\\b${word}\\b`, "i");
    return pattern.test(command);
  });

  if (!hasScoreEntryVerb) {
    return false;
  }

  return commandHasPlayerReference(command) && commandHasScoreValuePhrase(command);
}

function commandHasPlayerReference(command) {
  return round.players.some((player, index) => {
    const playerName = player.toLowerCase();
    const playerPattern = new RegExp(`\\b${escapeRegExp(playerName)}\\b`, "i");

    if (playerPattern.test(command)) {
      return true;
    }

    return index === 0 && (
      /\bi\b/.test(command) ||
      /\bme\b/.test(command) ||
      /\bmy\b/.test(command)
    );
  });
}

function commandHasScoreValuePhrase(command) {
  return /(\b\d+\b|\bone\b|\btwo\b|\bthree\b|\bfour\b|\bfive\b|\bsix\b|\bseven\b|\beight\b|\bnine\b|\bten\b|\bpar\b|\bbirdie\b|\bbogey\b|\beagle\b|\balbatross\b)/i.test(command);
}

// -------------------------------
// Voice Round Navigation
// -------------------------------

function handleRoundNavigationCommand(command) {
  if (isNextHoleCommand(command)) {
    saveScores();

    if (round.currentHole < round.totalHoles) {
      round.currentHole++;
      saveRoundToStorage();
      renderCurrentHole();
      renderScorecard();

      return `Moved to Hole ${round.currentHole}.`;
    }

    return "You are already on the final hole.";
  }

  if (isPreviousHoleCommand(command)) {
    saveScores();

    if (round.currentHole > 1) {
      round.currentHole--;
      saveRoundToStorage();
      renderCurrentHole();
      renderScorecard();

      return `Moved to Hole ${round.currentHole}.`;
    }

    return "You are already on Hole 1.";
  }

  const requestedHole = getRequestedHoleFromCommand(command);

  if (requestedHole !== null) {
    saveScores();

    round.currentHole = requestedHole;
    saveRoundToStorage();
    renderCurrentHole();
    renderScorecard();

    return `Moved to Hole ${round.currentHole}.`;
  }

  return null;
}

function isNextHoleCommand(command) {
  return (
    command === "next hole" ||
    command === "go to next hole" ||
    command === "move to next hole" ||
    command === "advance to next hole" ||
    command === "next"
  );
}

function isPreviousHoleCommand(command) {
  return (
    command === "previous hole" ||
    command === "go to previous hole" ||
    command === "move to previous hole" ||
    command === "back a hole" ||
    command === "go back a hole" ||
    command === "previous" ||
    command === "back"
  );
}

function getRequestedHoleFromCommand(command) {
  const numberPattern = "(\\d+|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen)";

  const patterns = [
    new RegExp(`\\bgo to hole\\s+${numberPattern}\\b`, "i"),
    new RegExp(`\\bmove to hole\\s+${numberPattern}\\b`, "i"),
    new RegExp(`\\bset hole to\\s+${numberPattern}\\b`, "i"),
    new RegExp(`\\bhole\\s+${numberPattern}\\b`, "i")
  ];

  for (const pattern of patterns) {
    const match = command.match(pattern);

    if (match) {
      const holeNumber = convertScoreToNumber(match[1]);

      if (holeNumber >= 1 && holeNumber <= round.totalHoles) {
        return holeNumber;
      }
    }
  }

  return null;
}

// -------------------------------
// GPS Yardage
// -------------------------------

function saveTargetGreen() {
  const frontLat = getOptionalCoordinate(frontLatInput.value);
  const frontLng = getOptionalCoordinate(frontLngInput.value);
  const centerLat = getOptionalCoordinate(centerLatInput.value);
  const centerLng = getOptionalCoordinate(centerLngInput.value);
  const backLat = getOptionalCoordinate(backLatInput.value);
  const backLng = getOptionalCoordinate(backLngInput.value);

  if (centerLat === null || centerLng === null) {
    alert("Please enter at least the center green latitude and longitude.");
    return;
  }

  if (!isValidCoordinatePair(centerLat, centerLng)) {
    alert("Center green coordinates are not valid.");
    return;
  }

  if ((frontLat !== null || frontLng !== null) && !isValidCoordinatePair(frontLat, frontLng)) {
    alert("Front green coordinates are not valid.");
    return;
  }

  if ((backLat !== null || backLng !== null) && !isValidCoordinatePair(backLat, backLng)) {
    alert("Back green coordinates are not valid.");
    return;
  }

  if (!round.holeTargets) {
    round.holeTargets = {};
  }

  round.holeTargets[round.currentHole] = {
    front: {
      lat: frontLat,
      lng: frontLng
    },
    center: {
      lat: centerLat,
      lng: centerLng
    },
    back: {
      lat: backLat,
      lng: backLng
    }
  };

  saveRoundToStorage();

  yardageResult.textContent = `Green targets saved for Hole ${round.currentHole}.`;
}

function getOptionalCoordinate(value) {
  if (value === "") {
    return null;
  }

  return Number(value);
}

function isValidCoordinatePair(lat, lng) {
  if (lat === null || lng === null) {
    return false;
  }

  if (Number.isNaN(lat) || Number.isNaN(lng)) {
    return false;
  }

  if (lat < -90 || lat > 90) {
    return false;
  }

  if (lng < -180 || lng > 180) {
    return false;
  }

  return true;
}

function getYardageToGreen(shouldSpeak = false) {
  const target = getCurrentHoleTarget();

  if (!target || target.center.lat === null || target.center.lng === null) {
    const noTargetMessage = `Please save at least a center green target for Hole ${round.currentHole} first.`;
    yardageResult.textContent = noTargetMessage;
    setVoiceStatus(noTargetMessage);

    if (shouldSpeak) {
      speakText(noTargetMessage);
    }

    return;
  }

  if (!navigator.geolocation) {
    const noGpsMessage = "GPS is not supported in this browser.";
    yardageResult.textContent = noGpsMessage;
    setVoiceStatus(noGpsMessage);

    if (shouldSpeak) {
      speakText(noGpsMessage);
    }

    return;
  }

  yardageResult.textContent = "Getting your location...";
  message.textContent = "Getting your location...";

  navigator.geolocation.getCurrentPosition(
    function (position) {
      const userLat = position.coords.latitude;
      const userLng = position.coords.longitude;

      const yardages = calculateGreenYardages(userLat, userLng, target);

      const resultMessage = buildYardageDisplayMessage(yardages);
      const spokenMessage = buildYardageSpokenMessage(yardages);

      yardageResult.textContent = resultMessage;
      message.textContent = resultMessage;
      setVoiceStatus(resultMessage);

      if (shouldSpeak) {
        speakText(spokenMessage);
      }
    },
    function (error) {
      const errorMessage = getLocationErrorMessage(error);

      yardageResult.textContent = errorMessage;
      message.textContent = errorMessage;
      setVoiceStatus(errorMessage);

      if (shouldSpeak) {
        speakText(errorMessage);
      }
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    }
  );
}

function calculateGreenYardages(userLat, userLng, target) {
  const yardages = {
    front: null,
    center: null,
    back: null
  };

  if (target.front.lat !== null && target.front.lng !== null) {
    yardages.front = Math.round(
      calculateYardsBetween(userLat, userLng, target.front.lat, target.front.lng)
    );
  }

  if (target.center.lat !== null && target.center.lng !== null) {
    yardages.center = Math.round(
      calculateYardsBetween(userLat, userLng, target.center.lat, target.center.lng)
    );
  }

  if (target.back.lat !== null && target.back.lng !== null) {
    yardages.back = Math.round(
      calculateYardsBetween(userLat, userLng, target.back.lat, target.back.lng)
    );
  }

  return yardages;
}

function buildYardageDisplayMessage(yardages) {
  const parts = [];

  if (yardages.front !== null) {
    parts.push(`Front: ${yardages.front} yards`);
  }

  if (yardages.center !== null) {
    parts.push(`Center: ${yardages.center} yards`);
  }

  if (yardages.back !== null) {
    parts.push(`Back: ${yardages.back} yards`);
  }

  return `Hole ${round.currentHole} green yardages — ${parts.join(", ")}.`;
}

function buildYardageSpokenMessage(yardages) {
  const parts = [];

  if (yardages.front !== null) {
    parts.push(`front ${yardages.front}`);
  }

  if (yardages.center !== null) {
    parts.push(`center ${yardages.center}`);
  }

  if (yardages.back !== null) {
    parts.push(`back ${yardages.back}`);
  }

  return `Hole ${round.currentHole}: ${parts.join(", ")} yards.`;
}

function calculateYardsBetween(lat1, lng1, lat2, lng2) {
  const earthRadiusMeters = 6371000;

  const lat1Rad = toRadians(lat1);
  const lat2Rad = toRadians(lat2);
  const latDifference = toRadians(lat2 - lat1);
  const lngDifference = toRadians(lng2 - lng1);

  const a =
    Math.sin(latDifference / 2) * Math.sin(latDifference / 2) +
    Math.cos(lat1Rad) *
      Math.cos(lat2Rad) *
      Math.sin(lngDifference / 2) *
      Math.sin(lngDifference / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const meters = earthRadiusMeters * c;
  const yards = meters * 1.09361;

  return yards;
}

function toRadians(degrees) {
  return degrees * Math.PI / 180;
}

function getLocationErrorMessage(error) {
  if (error.code === error.PERMISSION_DENIED) {
    return "Location permission was denied. Please allow location access and try again.";
  }

  if (error.code === error.POSITION_UNAVAILABLE) {
    return "Your location is unavailable right now.";
  }

  if (error.code === error.TIMEOUT) {
    return "Getting your location timed out. Try again.";
  }

  return "An unknown GPS error occurred.";
}

// -------------------------------
// Voice Yardage Commands
// -------------------------------

function handleYardageVoiceCommand(command) {
  if (!isYardageQuestion(command)) {
    return false;
  }

  setVoiceStatus("Getting yardage...");
  getYardageToGreen(true);

  return true;
}

function isYardageQuestion(command) {
  const hasDistancePhrase =
    command.includes("how far") ||
    command.includes("yardage") ||
    command.includes("distance") ||
    command.includes("how many yards") ||
    command.includes("what do i have") ||
    command.includes("what's my number") ||
    command.includes("what is my number");

  const hasGolfTarget =
    command.includes("green") ||
    command.includes("hole") ||
    command.includes("pin") ||
    command.includes("flag") ||
    command.includes("target") ||
    command.includes("yardage");

  return hasDistancePhrase && hasGolfTarget;
}

function renderHoleTargetInputs() {
  if (!frontLatInput || !frontLngInput || !centerLatInput || !centerLngInput || !backLatInput || !backLngInput) {
    return;
  }

  const target = getCurrentHoleTarget();

  if (target) {
    frontLatInput.value = target.front.lat ?? "";
    frontLngInput.value = target.front.lng ?? "";

    centerLatInput.value = target.center.lat ?? "";
    centerLngInput.value = target.center.lng ?? "";

    backLatInput.value = target.back.lat ?? "";
    backLngInput.value = target.back.lng ?? "";

    if (target.center.lat !== null && target.center.lng !== null) {
      yardageResult.textContent = `Saved green targets for Hole ${round.currentHole}.`;
    } else {
      yardageResult.textContent = `No center green target saved for Hole ${round.currentHole}.`;
    }
  } else {
    clearTargetInputs();
    yardageResult.textContent = `No green targets saved for Hole ${round.currentHole}.`;
  }
}

function getCurrentHoleTarget() {
  if (!round.holeTargets) {
    round.holeTargets = {};
  }

  const target = round.holeTargets[round.currentHole];

  if (!target) {
    return null;
  }

  // Converts older single-point targets into the new front/center/back structure.
  if (target.lat !== undefined && target.lng !== undefined) {
    round.holeTargets[round.currentHole] = {
      front: {
        lat: null,
        lng: null
      },
      center: {
        lat: target.lat,
        lng: target.lng
      },
      back: {
        lat: null,
        lng: null
      }
    };

    saveRoundToStorage();
  }

  return round.holeTargets[round.currentHole];
}

function clearTargetInputs() {
  frontLatInput.value = "";
  frontLngInput.value = "";
  centerLatInput.value = "";
  centerLngInput.value = "";
  backLatInput.value = "";
  backLngInput.value = "";
}

function normalizeHoleTargets() {
  if (!round.holeTargets) {
    round.holeTargets = {};
  }

  for (const hole in round.holeTargets) {
    const target = round.holeTargets[hole];

    // Older version used { lat, lng }.
    // New version uses { front, center, back }.
    if (target && target.lat !== undefined && target.lng !== undefined) {
      round.holeTargets[hole] = {
        front: {
          lat: null,
          lng: null
        },
        center: {
          lat: target.lat,
          lng: target.lng
        },
        back: {
          lat: null,
          lng: null
        }
      };
    }
  }

  saveRoundToStorage();
}

// -------------------------------
// Hazards and Layup Targets
// -------------------------------

function getCurrentHoleHazards() {
  if (!round.holeHazards) {
    round.holeHazards = {};
  }

  if (!round.holeHazards[round.currentHole]) {
    round.holeHazards[round.currentHole] = [];
  }

  return round.holeHazards[round.currentHole];
}

function addHazardForCurrentHole() {
  const name = hazardNameInput.value.trim();
  const type = hazardTypeInput.value;
  const lat = Number(hazardLatInput.value);
  const lng = Number(hazardLngInput.value);

  if (!name) {
    alert("Please enter a target name.");
    return;
  }

  if (!hazardLatInput.value || !hazardLngInput.value) {
    alert("Please enter both latitude and longitude.");
    return;
  }

  if (!isValidCoordinatePair(lat, lng)) {
    alert("Target coordinates are not valid.");
    return;
  }

  const hazards = getCurrentHoleHazards();

  hazards.push({
    name: name,
    type: type,
    lat: lat,
    lng: lng
  });

  saveRoundToStorage();
  renderHoleHazards();

  hazardNameInput.value = "";
  hazardTypeInput.value = "bunker";
  hazardLatInput.value = "";
  hazardLngInput.value = "";

  message.textContent = `${name} saved for Hole ${round.currentHole}.`;
}

function renderHoleHazards() {
  if (!hazardList) {
    return;
  }

  const hazards = getCurrentHoleHazards();

  if (hazards.length === 0) {
    hazardList.textContent = `No hazards or layup targets saved for Hole ${round.currentHole}.`;
    return;
  }

  hazardList.innerHTML = "";

  hazards.forEach((hazard, index) => {
    const div = document.createElement("div");
    div.className = "hazard-item";

    div.innerHTML = `
      <strong>${index + 1}. ${hazard.name}</strong>
      <br>
      Type: ${hazard.type}
      <br>
      Coordinates: ${hazard.lat}, ${hazard.lng}
    `;

    hazardList.appendChild(div);
  });
}

function clearHazardsForCurrentHole() {
  const confirmed = confirm(`Clear all hazards and layup targets for Hole ${round.currentHole}?`);

  if (!confirmed) {
    return;
  }

  round.holeHazards[round.currentHole] = [];

  saveRoundToStorage();
  renderHoleHazards();

  message.textContent = `Hazards cleared for Hole ${round.currentHole}.`;
}

// -------------------------------
// Voice Hazard Commands
// -------------------------------

function handleHazardVoiceCommand(command) {
  if (!isHazardQuestion(command)) {
    return false;
  }

  const hazards = getCurrentHoleHazards();

  if (hazards.length === 0) {
    const noHazardsMessage = `No hazards or layup targets are saved for Hole ${round.currentHole}.`;
    setVoiceStatus(noHazardsMessage);
    speakText(noHazardsMessage);
    return true;
  }

  if (!navigator.geolocation) {
    const noGpsMessage = "GPS is not supported in this browser.";
    setVoiceStatus(noGpsMessage);
    speakText(noGpsMessage);
    return true;
  }

  setVoiceStatus("Getting hazard distance...");

  navigator.geolocation.getCurrentPosition(
    function (position) {
      const userLat = position.coords.latitude;
      const userLng = position.coords.longitude;

      const hazardsWithDistance = hazards.map(hazard => {
        return {
          ...hazard,
          yards: Math.round(
            calculateYardsBetween(userLat, userLng, hazard.lat, hazard.lng)
          )
        };
      });

      hazardsWithDistance.sort((a, b) => a.yards - b.yards);

      const requestedHazard = findRequestedHazard(command, hazardsWithDistance);

      if (requestedHazard) {
        const response = `${requestedHazard.name} is ${requestedHazard.yards} yards away.`;
        message.textContent = response;
        setVoiceStatus(response);
        speakText(response);
        return;
      }

      const response = buildAllHazardsMessage(hazardsWithDistance);

      message.textContent = response;
      setVoiceStatus(response);
      speakText(response);
    },
    function (error) {
      const errorMessage = getLocationErrorMessage(error);
      setVoiceStatus(errorMessage);
      speakText(errorMessage);
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    }
  );

  return true;
}

function isHazardQuestion(command) {
  const asksAboutDistance =
    command.includes("how far") ||
    command.includes("distance") ||
    command.includes("yardage") ||
    command.includes("how many yards");

  const asksAboutHazards =
    command.includes("hazard") ||
    command.includes("hazards") ||
    command.includes("bunker") ||
    command.includes("water") ||
    command.includes("layup") ||
    command.includes("dogleg") ||
    command.includes("tree") ||
    command.includes("trouble");

  const asksForHazardList =
    command.includes("what hazards") ||
    command.includes("hazards ahead") ||
    command.includes("what trouble") ||
    command.includes("show hazards") ||
    command.includes("read hazards");

  return (asksAboutDistance && asksAboutHazards) || asksForHazardList;
}

function findRequestedHazard(command, hazardsWithDistance) {
  for (const hazard of hazardsWithDistance) {
    const hazardName = hazard.name.toLowerCase();
    const hazardType = hazard.type.toLowerCase();

    if (command.includes(hazardName)) {
      return hazard;
    }

    if (command.includes(hazardType)) {
      return hazard;
    }
  }

  return null;
}

function buildAllHazardsMessage(hazardsWithDistance) {
  const topHazards = hazardsWithDistance.slice(0, 4);

  const parts = topHazards.map(hazard => {
    return `${hazard.name} ${hazard.yards} yards`;
  });

  return `Hole ${round.currentHole} targets: ${parts.join(", ")}.`;
}

// -------------------------------
// Course Library
// -------------------------------

function getSavedCourseSetups() {
  const savedCourses = localStorage.getItem("golfCourseSetups");

  if (!savedCourses) {
    return [];
  }

  try {
    return JSON.parse(savedCourses);
  } catch {
    return [];
  }
}

function saveCourseSetupsToStorage(courses) {
  localStorage.setItem("golfCourseSetups", JSON.stringify(courses));
}

function renderSavedCourseOptions() {
  if (!savedCourseSelect) {
    return;
  }

  const courses = getSavedCourseSetups();

  savedCourseSelect.innerHTML = `<option value="">No saved course selected</option>`;

  courses.forEach(course => {
    const option = document.createElement("option");
    option.value = course.id;
    option.textContent = `${course.courseName} (${course.totalHoles} holes)`;
    savedCourseSelect.appendChild(option);
  });
}

function loadSelectedCourseSetup() {
  const selectedId = savedCourseSelect.value;

  if (!selectedId) {
    alert("Please choose a saved course setup.");
    return;
  }

  const courses = getSavedCourseSetups();

  const course = courses.find(item => {
    return item.id === selectedId;
  });

  if (!course) {
    alert("That saved course could not be found.");
    return;
  }

  selectedCourseSetup = course;

  courseNameInput.value = course.courseName;
  totalHolesSelect.value = String(course.totalHoles);

  alert(`${course.courseName} loaded. Now add players and start the round.`);
}

async function searchGolfApiCourses() {
  const query = golfApiSearchInput ? golfApiSearchInput.value.trim() : "";
  const country = golfApiCountryInput ? golfApiCountryInput.value.trim() : "usa";

  if (!query) {
    setGolfApiSearchStatus("Enter a city or course name to search.");
    return;
  }

  setGolfApiSearchStatus("Searching GOLFAPI...");
  renderGolfApiSearchResults([]);

  try {
    const params = new URLSearchParams({
      city: query,
      country: country || "usa",
      measureUnit: "km"
    });

    const response = await fetch(`/api/golfapi/clubs?${params.toString()}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "GOLFAPI search failed.");
    }

    const clubs = normalizeGolfApiClubs(data);

    if (clubs.length === 0) {
      setGolfApiSearchStatus("No courses found. Try a nearby city or a shorter search term.");
      return;
    }

    setGolfApiSearchStatus(`Found ${clubs.length} course${clubs.length === 1 ? "" : "s"}.`);
    renderGolfApiSearchResults(clubs);
  } catch (error) {
    console.error("GOLFAPI search failed.", error);
    setGolfApiSearchStatus(error.message || "GOLFAPI search failed. Check the API key and try again.");
  }
}

function setGolfApiSearchStatus(text) {
  if (golfApiSearchStatus) {
    golfApiSearchStatus.textContent = text;
  }
}

function normalizeGolfApiClubs(data) {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data.clubs)) {
    return data.clubs;
  }

  if (Array.isArray(data.data)) {
    return data.data;
  }

  return [];
}

function renderGolfApiSearchResults(clubs) {
  if (!golfApiSearchResults) {
    return;
  }

  golfApiSearchResults.innerHTML = "";

  clubs.forEach(club => {
    const item = document.createElement("div");
    item.className = "course-search-result";

    const details = document.createElement("div");
    details.innerHTML = `
      <strong>${escapeHtml(getGolfApiClubName(club))}</strong>
      <span>${escapeHtml(getGolfApiClubLocation(club))}</span>
    `;

    const button = document.createElement("button");
    button.type = "button";
    button.textContent = "Load";
    button.addEventListener("click", async function () {
      button.disabled = true;
      button.textContent = "Loading...";
      await loadGolfApiClubAsCourseSetup(club);
      button.disabled = false;
      button.textContent = "Load";
    });

    item.appendChild(details);
    item.appendChild(button);
    golfApiSearchResults.appendChild(item);
  });
}

async function loadGolfApiClubAsCourseSetup(club) {
  setGolfApiSearchStatus(`Loading ${getGolfApiClubName(club)} details...`);

  const courseSetup = await buildCourseSetupFromGolfApiClub(club);
  const savedCourses = getSavedCourseSetups();
  const existingIndex = savedCourses.findIndex(savedCourse => {
    return savedCourse.id === courseSetup.id ||
      savedCourse.courseName.toLowerCase() === courseSetup.courseName.toLowerCase();
  });

  if (existingIndex >= 0) {
    courseSetup.id = savedCourses[existingIndex].id;
    savedCourses[existingIndex] = courseSetup;
  } else {
    savedCourses.push(courseSetup);
  }

  saveCourseSetupsToStorage(savedCourses);
  renderSavedCourseOptions();

  selectedCourseSetup = courseSetup;
  courseNameInput.value = courseSetup.courseName;
  totalHolesSelect.value = String(courseSetup.totalHoles);

  if (savedCourseSelect) {
    savedCourseSelect.value = courseSetup.id;
  }

  const yardageText = Object.keys(courseSetup.holeLengths || {}).length > 0
    ? " Pars and hole lengths were loaded."
    : " Hole lengths were not available yet.";

  setGolfApiSearchStatus(`${courseSetup.courseName} loaded.${yardageText} Add players, then start the round.`);
}

async function buildCourseSetupFromGolfApiClub(club) {
  const clubId = club.clubID || club.clubId || club.id || String(Date.now());
  const totalHoles = Number(club.numHoles || club.numholes || club.holes || 18) === 9 ? 9 : 18;
  const details = await fetchGolfApiCourseDetails(clubId);
  const course = details.course || {};
  const tee = details.tee || {};
  const enrichedTotalHoles = Number(course.NumHoles || course.numHoles || totalHoles) === 9 ? 9 : 18;

  return {
    id: `golfapi-${clubId}`,
    courseName: getGolfApiCourseName(course, club),
    totalHoles: enrichedTotalHoles,
    holeTargets: {},
    holeHazards: {},
    holePars: buildHoleParsFromGolfApiCourse(course, enrichedTotalHoles),
    holeLengths: buildHoleLengthsFromGolfApiTee(tee, enrichedTotalHoles),
    source: "golfapi",
    golfApi: {
      clubID: clubId,
      courseID: course.CourseID || course.courseID || course.courseId || null,
      teeID: tee.TeeID || tee.teeID || tee.teeId || null,
      latitude: club.latitude || club.Latitude || null,
      longitude: club.longitude || club.Longitude || null,
      rawClub: club,
      rawCourse: course,
      rawTee: tee
    },
    savedAt: new Date().toISOString()
  };
}

async function fetchGolfApiCourseDetails(clubId) {
  try {
    const courses = await fetchGolfApiCollectionWithFallbacks("courses", [
      { clubID: clubId },
      { ClubID: clubId }
    ]);
    const course = chooseGolfApiCourse(courses);
    const courseId = course.CourseID || course.courseID || course.courseId;

    if (!courseId) {
      return { course: course, tee: {} };
    }

    const tees = await fetchGolfApiCollectionWithFallbacks("tees", [
      { courseID: courseId },
      { CourseID: courseId }
    ]);

    return {
      course: course,
      tee: chooseGolfApiTee(tees)
    };
  } catch (error) {
    console.warn("Could not load GOLFAPI course details.", error);
    return { course: {}, tee: {} };
  }
}

async function fetchGolfApiCollectionWithFallbacks(resource, paramOptions) {
  let lastError = null;

  for (const params of paramOptions) {
    try {
      const data = await fetchGolfApiJson(resource, params);
      const collection = normalizeGolfApiCollection(data, resource);

      if (collection.length > 0) {
        return collection;
      }
    } catch (error) {
      lastError = error;
    }
  }

  if (lastError) {
    throw lastError;
  }

  return [];
}

async function fetchGolfApiJson(resource, params) {
  const searchParams = new URLSearchParams();

  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.set(key, value);
    }
  });

  const response = await fetch(`/api/golfapi/${resource}?${searchParams.toString()}`);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || `GOLFAPI ${resource} request failed.`);
  }

  return data;
}

function normalizeGolfApiCollection(data, collectionName) {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data[collectionName])) {
    return data[collectionName];
  }

  if (Array.isArray(data.data)) {
    return data.data;
  }

  return [];
}

function chooseGolfApiCourse(courses) {
  if (!Array.isArray(courses) || courses.length === 0) {
    return {};
  }

  return courses.find(course => {
    return Number(course.NumHoles || course.numHoles || 0) === 18;
  }) || courses[0];
}

function chooseGolfApiTee(tees) {
  if (!Array.isArray(tees) || tees.length === 0) {
    return {};
  }

  const playableTees = tees.filter(tee => {
    return getGolfApiTeeTotalLength(tee) > 0;
  });

  return playableTees.find(tee => {
    return String(tee.TeeName || tee.teeName || "").toLowerCase().includes("white");
  }) || playableTees[0] || tees[0];
}

function getGolfApiTeeTotalLength(tee) {
  let total = 0;

  for (let hole = 1; hole <= 18; hole++) {
    total += Number(tee[`Length${hole}`] || tee[`length${hole}`] || 0);
  }

  return total;
}

function getGolfApiCourseName(course, club) {
  const clubName = getGolfApiClubName(club);
  const courseName = course.CourseName || course.courseName;

  if (!courseName) {
    return clubName;
  }

  if (String(courseName).toLowerCase() === String(clubName).toLowerCase()) {
    return clubName;
  }

  return `${clubName} - ${courseName}`;
}

function buildHoleParsFromGolfApiCourse(course, totalHoles) {
  const pars = createDefaultPars(totalHoles);

  for (let hole = 1; hole <= totalHoles; hole++) {
    const par = Number(course[`Par${hole}`] || course[`par${hole}`] || 0);

    if (par >= 3 && par <= 6) {
      pars[hole] = par;
    }
  }

  return pars;
}

function buildHoleLengthsFromGolfApiTee(tee, totalHoles) {
  const lengths = {};
  const measureUnit = String(tee.MeasureUnit || tee.measureUnit || "").toLowerCase();

  for (let hole = 1; hole <= totalHoles; hole++) {
    const rawLength = Number(tee[`Length${hole}`] || tee[`length${hole}`] || 0);

    if (rawLength > 0) {
      lengths[hole] = measureUnit === "m" || measureUnit === "meter" || measureUnit === "meters"
        ? Math.round(rawLength * 1.09361)
        : Math.round(rawLength);
    }
  }

  return lengths;
}

function getGolfApiClubName(club) {
  return String(club.clubName || club.ClubName || club.name || "Unnamed Course");
}

function getGolfApiClubLocation(club) {
  return [
    club.city || club.City,
    club.state || club.State,
    club.country || club.Country
  ].filter(Boolean).join(", ");
}

function saveCurrentCourseSetup() {
  if (!round.courseName) {
    alert("Start a round before saving a course setup.");
    return;
  }

  const hasGreenTargets = round.holeTargets && Object.keys(round.holeTargets).length > 0;
  const hasHazards = round.holeHazards && Object.keys(round.holeHazards).length > 0;

  if (!hasGreenTargets && !hasHazards) {
    const confirmed = confirm("This course does not have any green targets or hazards saved yet. Save it anyway?");

    if (!confirmed) {
      return;
    }
  }

  const courses = getSavedCourseSetups();

  const existingIndex = courses.findIndex(course => {
    return course.courseName.toLowerCase() === round.courseName.toLowerCase();
  });

  const courseSetup = {
    id: existingIndex >= 0 ? courses[existingIndex].id : String(Date.now()),
    courseName: round.courseName,
    totalHoles: round.totalHoles,
    holeTargets: deepCopy(round.holeTargets || {}),
    holeHazards: deepCopy(round.holeHazards || {}),
    holePars: deepCopy(round.holePars || createDefaultPars(round.totalHoles)),
    holeLengths: deepCopy(round.holeLengths || {}),
    savedAt: new Date().toISOString()
};

  if (existingIndex >= 0) {
    const confirmed = confirm(`${round.courseName} already exists. Replace the saved course setup?`);

    if (!confirmed) {
      return;
    }

    courses[existingIndex] = courseSetup;
  } else {
    courses.push(courseSetup);
  }

  saveCourseSetupsToStorage(courses);
  renderSavedCourseOptions();

  selectedCourseSetup = courseSetup;

  message.textContent = `${round.courseName} course setup saved.`;
  setVoiceStatus(`${round.courseName} course setup saved.`);
}

function deepCopy(value) {
  return JSON.parse(JSON.stringify(value));
}

// -------------------------------
// Course Data Import / Export
// -------------------------------

function exportSavedCourseData() {
  const courses = getSavedCourseSetups();

  if (courses.length === 0) {
    alert("There are no saved courses to export.");
    return;
  }

  const exportData = {
    appName: "Golf Assistant Prototype",
    version: 1,
    exportedAt: new Date().toISOString(),
    courses: courses
  };

  const jsonText = JSON.stringify(exportData, null, 2);
  const blob = new Blob([jsonText], { type: "application/json" });

  const downloadUrl = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = downloadUrl;
  link.download = "golf-course-data.json";
  link.click();

  URL.revokeObjectURL(downloadUrl);
}

function importCourseDataFromFile(event) {
  const file = event.target.files[0];

  if (!file) {
    return;
  }

  const reader = new FileReader();

  reader.onload = function (loadEvent) {
    try {
      const importedText = loadEvent.target.result;
      const importedJson = JSON.parse(importedText);

      const importedCourses = getCoursesFromImportedJson(importedJson);

      if (importedCourses.length === 0) {
        alert("No courses were found in that file.");
        return;
      }

      const normalizedCourses = [];

      importedCourses.forEach((course, index) => {
        const normalizedCourse = normalizeImportedCourse(course, index);

        if (normalizedCourse) {
          normalizedCourses.push(normalizedCourse);
        }
      });

      if (normalizedCourses.length === 0) {
        alert("No valid courses were found in that file.");
        return;
      }

      const savedCourses = getSavedCourseSetups();

      let addedCount = 0;
      let replacedCount = 0;

      normalizedCourses.forEach(importedCourse => {
        const existingIndex = savedCourses.findIndex(savedCourse => {
          return savedCourse.courseName.toLowerCase() === importedCourse.courseName.toLowerCase();
        });

        if (existingIndex >= 0) {
          const existingId = savedCourses[existingIndex].id;
          importedCourse.id = existingId;
          savedCourses[existingIndex] = importedCourse;
          replacedCount++;
        } else {
          savedCourses.push(importedCourse);
          addedCount++;
        }
      });

      saveCourseSetupsToStorage(savedCourses);
      renderSavedCourseOptions();

      alert(`Import complete. Added ${addedCount} course(s), replaced ${replacedCount} course(s).`);
    } catch (error) {
      alert("The selected file could not be imported. Make sure it is a valid JSON file.");
      console.error(error);
    }

    courseDataFileInput.value = "";
  };

  reader.readAsText(file);
}

function getCoursesFromImportedJson(importedJson) {
  if (Array.isArray(importedJson)) {
    return importedJson;
  }

  if (importedJson.courses && Array.isArray(importedJson.courses)) {
    return importedJson.courses;
  }

  if (importedJson.courseName) {
    return [importedJson];
  }

  return [];
}

function normalizeImportedCourse(course, index) {
  const courseName = course.courseName || course.name || course.title;

  if (!courseName) {
    return null;
  }

  const totalHoles = Number(course.totalHoles || course.holes || 18);

  if (totalHoles !== 9 && totalHoles !== 18) {
    return null;
  }

  return {
    id: course.id || `${Date.now()}-${index}`,
    courseName: courseName,
    totalHoles: totalHoles,
    holeTargets: normalizeImportedHoleTargets(course.holeTargets || {}),
    holeHazards: normalizeImportedHoleHazards(course.holeHazards || {}),
    holePars: normalizeImportedHolePars(course.holePars || course.pars || {}, totalHoles),
    holeLengths: normalizeImportedHoleLengths(course.holeLengths || course.lengths || course.yardages || {}, totalHoles),
    savedAt: new Date().toISOString()
};
}

function normalizeImportedHoleLengths(rawLengths, totalHoles) {
  const normalizedLengths = {};

  for (let hole = 1; hole <= totalHoles; hole++) {
    const length = Number(rawLengths[hole]);

    if (length > 0) {
      normalizedLengths[hole] = Math.round(length);
    }
  }

  return normalizedLengths;
}

function normalizeImportedHolePars(rawPars, totalHoles) {
  const normalizedPars = createDefaultPars(totalHoles);

  for (const hole in rawPars) {
    const par = Number(rawPars[hole]);

    if (par >= 3 && par <= 6) {
      normalizedPars[hole] = par;
    }
  }

  return normalizedPars;
}

function normalizeImportedHoleTargets(rawTargets) {
  const normalizedTargets = {};

  for (const hole in rawTargets) {
    const target = rawTargets[hole];

    if (!target) {
      continue;
    }

    // Older/simple format:
    // "1": { "lat": 35.2, "lng": -97.4 }
    if (target.lat !== undefined && target.lng !== undefined) {
      const center = normalizePoint(target);

      if (center) {
        normalizedTargets[hole] = {
          front: {
            lat: null,
            lng: null
          },
          center: center,
          back: {
            lat: null,
            lng: null
          }
        };
      }

      continue;
    }

    // New format:
    // "1": { "front": {...}, "center": {...}, "back": {...} }
    const front = normalizePoint(target.front);
    const center = normalizePoint(target.center);
    const back = normalizePoint(target.back);

    if (center) {
      normalizedTargets[hole] = {
        front: front || {
          lat: null,
          lng: null
        },
        center: center,
        back: back || {
          lat: null,
          lng: null
        }
      };
    }
  }

  return normalizedTargets;
}

function normalizeImportedHoleHazards(rawHazards) {
  const normalizedHazards = {};

  for (const hole in rawHazards) {
    const hazards = rawHazards[hole];

    if (!Array.isArray(hazards)) {
      continue;
    }

    normalizedHazards[hole] = [];

    hazards.forEach(hazard => {
      const point = normalizePoint(hazard);

      if (!point) {
        return;
      }

      normalizedHazards[hole].push({
        name: hazard.name || "Unnamed target",
        type: hazard.type || "other",
        lat: point.lat,
        lng: point.lng
      });
    });
  }

  return normalizedHazards;
}

function normalizePoint(point) {
  if (!point) {
    return null;
  }

  const lat = Number(point.lat);
  const lng = Number(point.lng);

  if (!isValidCoordinatePair(lat, lng)) {
    return null;
  }

  return {
    lat: lat,
    lng: lng
  };
}

// -------------------------------
// Hole Par
// -------------------------------

function createDefaultPars(totalHoles) {
  const pars = {};

  for (let hole = 1; hole <= totalHoles; hole++) {
    pars[hole] = 4;
  }

  return pars;
}

function fillMissingPars() {
  if (!round.holePars) {
    round.holePars = {};
  }

  for (let hole = 1; hole <= round.totalHoles; hole++) {
    if (!round.holePars[hole]) {
      round.holePars[hole] = 4;
    }
  }
}

function renderHoleParInput() {
  if (!holeParInput || !parSummary) {
    return;
  }

  const par = getHolePar(round.currentHole);

  holeParInput.value = par;
  if (roundParSummary) {
    roundParSummary.textContent = par;
  }
  if (roundLengthSummary) {
    roundLengthSummary.textContent = formatHoleLength(round.currentHole);
  }
  parSummary.textContent = `Hole ${round.currentHole} is a par ${par}. Total course par: ${getTotalCoursePar()}.`;
}

function saveParForCurrentHole() {
  const par = Number(holeParInput.value);

  if (par < 3 || par > 6) {
    alert("Please enter a par between 3 and 6.");
    return;
  }

  if (!round.holePars) {
    round.holePars = {};
  }

  round.holePars[round.currentHole] = par;

  saveRoundToStorage();
  renderScorecard();
  renderHoleParInput();

  message.textContent = `Hole ${round.currentHole} saved as a par ${par}.`;
}

function getHolePar(hole) {
  if (!round.holePars) {
    round.holePars = {};
  }

  return round.holePars[hole] || 4;
}

function getHoleLength(hole) {
  if (!round.holeLengths) {
    round.holeLengths = {};
  }

  return Number(round.holeLengths[hole] || 0);
}

function formatHoleLength(hole) {
  const length = getHoleLength(hole);

  if (!length) {
    return "Yardage not loaded";
  }

  return `${length} yds`;
}

function getTotalCoursePar() {
  let totalPar = 0;

  for (let hole = 1; hole <= round.totalHoles; hole++) {
    totalPar += getHolePar(hole);
  }

  return totalPar;
}

function getCompletedHolesForPlayer(player) {
  let completedHoles = 0;

  for (let hole = 1; hole <= round.totalHoles; hole++) {
    if (round.scores[player][hole]) {
      completedHoles++;
    }
  }

  return completedHoles;
}

function getPlayerParThroughCompletedHoles(player) {
  let parTotal = 0;

  for (let hole = 1; hole <= round.totalHoles; hole++) {
    if (round.scores[player][hole]) {
      parTotal += getHolePar(hole);
    }
  }

  return parTotal;
}

function getPlayerToPar(player) {
  const playerTotal = getPlayerTotal(player);
  const parThroughCompletedHoles = getPlayerParThroughCompletedHoles(player);

  if (playerTotal === 0) {
    return null;
  }

  return playerTotal - parThroughCompletedHoles;
}

function formatToPar(toPar) {
  if (toPar === null) {
    return "—";
  }

  if (toPar === 0) {
    return "Even";
  }

  if (toPar > 0) {
    return `+${toPar}`;
  }

  return `${toPar}`;
}

// -------------------------------
// Voice Command Help
// -------------------------------

function toggleCommandHelp() {
  if (!commandHelpPanel) {
    return;
  }

  const isHidden = commandHelpPanel.classList.toggle("hidden");
  toggleCommandHelpBtn.textContent = isHidden ? "Show Voice Commands" : "Hide Voice Commands";
}

// -------------------------------
// PWA Service Worker Registration
// -------------------------------

if ("serviceWorker" in navigator) {
  window.addEventListener("load", function () {
    navigator.serviceWorker
      .register("./service-worker.js")
      .then(function () {
        console.log("Service worker registered.");
      })
      .catch(function (error) {
        console.log("Service worker registration failed:", error);
      });
  });
}

// -------------------------------
// Voice Response Setup
// -------------------------------

function enableVoiceResponses() {
  if (!window.speechSynthesis) {
    audioStatus.textContent = "Voice responses are not supported in this browser.";
    return;
  }

  voiceResponsesEnabled = true;
  audioStatus.textContent = "Voice responses enabled.";

  const utterance = new SpeechSynthesisUtterance("Voice responses enabled.");
  utterance.lang = "en-US";
  utterance.rate = 1;
  utterance.pitch = 1;

  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
}
