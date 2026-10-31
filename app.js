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
const caddieConversation = document.getElementById("caddieConversation");

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

const accessCodeInput = document.getElementById("accessCodeInput");
const accessCodeHint = document.getElementById("accessCodeHint");
const accessCodeStatus = document.getElementById("accessCodeStatus");
const saveAccessCodeBtn = document.getElementById("saveAccessCodeBtn");
const clearAccessCodeBtn = document.getElementById("clearAccessCodeBtn");

const clubDistanceList = document.getElementById("clubDistanceList");
const addClubRowBtn = document.getElementById("addClubRowBtn");
const saveClubProfileBtn = document.getElementById("saveClubProfileBtn");
const clearClubProfileBtn = document.getElementById("clearClubProfileBtn");
const clubProfileStatus = document.getElementById("clubProfileStatus");

const shotClubInput = document.getElementById("shotClubInput");
const shotClubOptions = document.getElementById("shotClubOptions");
const shotDistanceInput = document.getElementById("shotDistanceInput");
const shotResultInput = document.getElementById("shotResultInput");
const shotLieInput = document.getElementById("shotLieInput");
const logShotBtn = document.getElementById("logShotBtn");
const useGpsForShotBtn = document.getElementById("useGpsForShotBtn");
const shotLogStatus = document.getElementById("shotLogStatus");
const shotHistorySummary = document.getElementById("shotHistorySummary");
const exportShotLogBtn = document.getElementById("exportShotLogBtn");
const clearShotLogBtn = document.getElementById("clearShotLogBtn");

const courseLoadPanel = document.getElementById("courseLoadPanel");
const courseLoadTitle = document.getElementById("courseLoadTitle");
const courseLoadStatus = document.getElementById("courseLoadStatus");
const golfApiCourseSelect = document.getElementById("golfApiCourseSelect");
const golfApiTeeSelect = document.getElementById("golfApiTeeSelect");
const confirmCourseLoadBtn = document.getElementById("confirmCourseLoadBtn");
const cancelCourseLoadBtn = document.getElementById("cancelCourseLoadBtn");

const roundYardageBtn = document.getElementById("roundYardageBtn");
const homeRoundSummary = document.getElementById("homeRoundSummary");
const homeCourseCount = document.getElementById("homeCourseCount");
const homeShotCount = document.getElementById("homeShotCount");
const homeClubCount = document.getElementById("homeClubCount");

const offlineBanner = document.getElementById("offlineBanner");
const resumeBanner = document.getElementById("resumeBanner");
const resumeBannerText = document.getElementById("resumeBannerText");
const resumeRoundBtn = document.getElementById("resumeRoundBtn");
const discardRoundBtn = document.getElementById("discardRoundBtn");
const roundHistoryList = document.getElementById("roundHistoryList");
const exportRoundHistoryBtn = document.getElementById("exportRoundHistoryBtn");
const clearRoundHistoryBtn = document.getElementById("clearRoundHistoryBtn");
const statsSection = document.getElementById("statsSection");
const statsPlayerTitle = document.getElementById("statsPlayerTitle");
const statsRoundCount = document.getElementById("statsRoundCount");
const statsHandicap = document.getElementById("statsHandicap");
const statsHandicapNote = document.getElementById("statsHandicapNote");
const statsScoringAverage = document.getElementById("statsScoringAverage");
const statsBestRound = document.getElementById("statsBestRound");
const statsPutts = document.getElementById("statsPutts");
const statsFairways = document.getElementById("statsFairways");
const statsGreens = document.getElementById("statsGreens");
const statsAccuracyNote = document.getElementById("statsAccuracyNote");
const statsTrend = document.getElementById("statsTrend");
const statsRoundList = document.getElementById("statsRoundList");
const statsParBreakdown = document.getElementById("statsParBreakdown");
const glanceSection = document.getElementById("glanceSection");
const glanceHole = document.getElementById("glanceHole");
const glancePar = document.getElementById("glancePar");
const glanceDistance = document.getElementById("glanceDistance");
const glanceUnit = document.getElementById("glanceUnit");
const glanceClub = document.getElementById("glanceClub");
const glanceClubReason = document.getElementById("glanceClubReason");
const glanceFront = document.getElementById("glanceFront");
const glanceBack = document.getElementById("glanceBack");
const glanceStatus = document.getElementById("glanceStatus");
const glanceExitBtn = document.getElementById("glanceExitBtn");
const glancePrevBtn = document.getElementById("glancePrevBtn");
const glanceNextBtn = document.getElementById("glanceNextBtn");
const openGlanceBtn = document.getElementById("openGlanceBtn");
let glanceTimer = null;
const deleteCourseSetupBtn = document.getElementById("deleteCourseSetupBtn");
const managePlayersBtn = document.getElementById("managePlayersBtn");
const playersSheet = document.getElementById("playersSheet");
const playerManageList = document.getElementById("playerManageList");
const addPlayerInput = document.getElementById("addPlayerInput");
const addPlayerBtn = document.getElementById("addPlayerBtn");
const playerManageStatus = document.getElementById("playerManageStatus");
const undoScoreBtn = document.getElementById("undoScoreBtn");
const shotDirectionInput = document.getElementById("shotDirectionInput");
const unitPreferenceSelect = document.getElementById("unitPreferenceSelect");
const toastElement = document.getElementById("toast");
const confirmOverlay = document.getElementById("confirmOverlay");
const confirmText = document.getElementById("confirmText");
const confirmAcceptBtn = document.getElementById("confirmAcceptBtn");
const confirmCancelBtn = document.getElementById("confirmCancelBtn");

let lastYardageHole = null;
let loadedRoundSavedAt = 0;
let serverPaused = false;
let accountsEnabled = false;
let signedInEmail = "";
let recognition = null;
let selectedCourseSetup = null;
let isHandlingVoiceCommand = false;
let lastVoiceCommand = "";
let lastVoiceCommandTime = 0;
let voiceResponsesEnabled = false;
const AI_VOICE_CONFIDENCE_THRESHOLD = 0.72;
const VOICE_SILENCE_DELAY_MS = 950;
const AI_VOICE_TIMEOUT_MS = 7500;
const MIN_SHOTS_FOR_LEARNED_CLUB = 3;
const SHOT_LOG_LIMIT = 500;
const CLUB_PROFILE_STORAGE_KEY = "golfPlayerClubProfile";
const SHOT_LOG_STORAGE_KEY = "golfShotLog";
const ROUND_HISTORY_STORAGE_KEY = "golfRoundHistory";
const UNIT_STORAGE_KEY = "golfDistanceUnit";
const GOLFER_NAME_STORAGE_KEY = "golfGolferName";
const ROUND_HISTORY_LIMIT = 100;
const STALE_ROUND_MS = 10 * 60 * 60 * 1000;
const POSITION_MAX_AGE_MS = 12000;
const WEAK_ACCURACY_METERS = 25;
const HAZARD_TYPES = new Set(["bunker", "water", "layup", "dogleg", "tree", "other"]);
const MAX_COURSE_IMPORT_BYTES = 2 * 1024 * 1024;
const CONDITIONS_MAX_AGE_MS = 10 * 60 * 1000;
// What a lie costs in carry, as a fraction of the shot.
const LIE_ADJUSTMENTS = {
  tee: { factor: 0, label: "a teed ball" },
  fairway: { factor: 0, label: "a fairway lie" },
  rough: { factor: 0.05, label: "rough" },
  sand: { factor: 0.12, label: "sand" },
  recovery: { factor: 0.15, label: "a recovery lie" }
};
const SPOKEN_SHOT_RESULTS = { "as planned": "good", short: "short", long: "long" };
let conditionsCache = null;

// Earlier releases stored the shared server access code in readable browser
// storage. The server now uses an HttpOnly cookie; remove any legacy copy.
try {
  localStorage.removeItem("golfApiAccessToken");
} catch {
  // Storage can be unavailable in hardened/private browser contexts.
}
let roundHistoryCache = null;
let lastPosition = null;
let locationWatchId = null;
let wakeLock = null;
let pendingConfirm = null;
let toastTimer = null;
let scoreUndoSnapshot = null;
let pendingCourseLoad = null;
const golfApiCourseCache = new Map();
let clubProfileCache = null;
let shotLogCache = null;
let learnedClubCache = null;
let savedCourseCache = null;
let serverRequiresAccessCode = false;
let serverAccessGranted = false;
const DEFAULT_CLUB_DISTANCES = [
  { club: "driver", min: 215, max: 700 },
  { club: "3 wood", min: 195, max: 230 },
  { club: "5 wood or hybrid", min: 175, max: 205 },
  { club: "4 iron or hybrid", min: 165, max: 185 },
  { club: "5 iron", min: 155, max: 175 },
  { club: "6 iron", min: 145, max: 160 },
  { club: "7 iron", min: 135, max: 150 },
  { club: "8 iron", min: 120, max: 140 },
  { club: "9 iron", min: 105, max: 125 },
  { club: "pitching wedge", min: 90, max: 110 },
  { club: "gap wedge", min: 75, max: 95 },
  { club: "sand wedge", min: 55, max: 80 },
  { club: "lob wedge", min: 1, max: 60 }
];
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

saveAccessCodeBtn.addEventListener("click", saveAccessCodeFromSettings);
clearAccessCodeBtn.addEventListener("click", clearAccessCode);
addClubRowBtn.addEventListener("click", function () {
  addClubDistanceRow({ club: "", carryYards: "" });
});
saveClubProfileBtn.addEventListener("click", saveClubProfileFromSettings);
clearClubProfileBtn.addEventListener("click", clearClubProfile);
logShotBtn.addEventListener("click", logShotFromForm);
useGpsForShotBtn.addEventListener("click", fillShotDistanceFromGps);
exportShotLogBtn.addEventListener("click", exportShotLog);
clearShotLogBtn.addEventListener("click", clearShotLog);
confirmCourseLoadBtn.addEventListener("click", confirmCourseLoadSelection);
cancelCourseLoadBtn.addEventListener("click", closeCourseLoadPanel);
golfApiCourseSelect.addEventListener("change", handleCourseSelectionChange);

if (roundYardageBtn) {
  roundYardageBtn.addEventListener("click", function () {
    getYardageToGreen(false);
  });
}

if (openGlanceBtn) {
  openGlanceBtn.addEventListener("click", openGlanceView);
}

if (glanceExitBtn) {
  glanceExitBtn.addEventListener("click", showRoundScreen);
}

if (glancePrevBtn) {
  glancePrevBtn.addEventListener("click", function () {
    previousHole();
    renderGlance();
  });
}

if (glanceNextBtn) {
  glanceNextBtn.addEventListener("click", function () {
    nextHole();
    renderGlance();
  });
}

deleteCourseSetupBtn.addEventListener("click", deleteSelectedCourseSetup);
exportRoundHistoryBtn.addEventListener("click", exportRoundHistory);
clearRoundHistoryBtn.addEventListener("click", clearRoundHistory);
undoScoreBtn.addEventListener("click", undoLastScoreChange);
addPlayerBtn.addEventListener("click", addPlayerToRound);
managePlayersBtn.addEventListener("click", function () {
  playersSheet.open = !playersSheet.open;
  renderPlayerManageList();

  if (playersSheet.open) {
    playersSheet.scrollIntoView({ behavior: "smooth", block: "center" });
  }
});
unitPreferenceSelect.addEventListener("change", function () {
  setUnitPreference(unitPreferenceSelect.value);
});
confirmAcceptBtn.addEventListener("click", function () {
  closeConfirm(true);
});
confirmCancelBtn.addEventListener("click", function () {
  closeConfirm(false);
});
confirmOverlay.addEventListener("click", function (event) {
  if (event.target === confirmOverlay) {
    closeConfirm(false);
  }
});
resumeRoundBtn.addEventListener("click", function () {
  hideResumeBanner();
  showAppScreen("round");
});
discardRoundBtn.addEventListener("click", function () {
  hideResumeBanner();
  resetRound();
});

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
  renderAccessCodeSettings();
  renderClubProfileEditor();
  renderShotHistorySummary();
  renderShotClubOptions();
  renderShotLogStatus();
  checkServerAccessRequirement();
  renderHomeSummary();
  renderRoundHistory();
  renderUnitPreference();
  renderGolferName();
  prefillGolferAsPlayer();
  renderConnectionState();
  maybeShowResumeBanner();
  reportSignInRedirect();
  syncWakeLock();

  if (round.players.length > 0) {
    startLocationWatch();
  }
});

window.addEventListener("online", renderConnectionState);
window.addEventListener("offline", renderConnectionState);
document.addEventListener("visibilitychange", syncWakeLock);
window.addEventListener("pagehide", function () {
  saveScoresQuietly();
});

function startRound() {
  const courseName = (courseNameInput.value.trim() || "Test Course").slice(0, 160);
  const players = normalizePlayerNames(playerNamesInput.value.split(","));
  if (players.length === 0) {
    notify("Please enter at least one player.");
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

  round.holeStats = {};
  scoreUndoSnapshot = null;
  hideResumeBanner();
  saveRoundToStorage();
  startLocationWatch();
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

  renderHomeSummary();
}

function renderHomeSummary() {
  if (homeCourseCount) {
    homeCourseCount.textContent = String(getSavedCourseSetups().length);
  }

  if (homeShotCount) {
    homeShotCount.textContent = String(getShotLog().length);
  }

  if (homeClubCount) {
    homeClubCount.textContent = String(Object.keys(getLearnedClubDistances()).length);
  }

  if (!homeRoundSummary) {
    return;
  }

  if (round.players.length === 0) {
    homeRoundSummary.textContent = "No round in progress.";
    return;
  }

  const leader = round.players
    .map(player => ({ name: player, toPar: getPlayerToPar(player) }))
    .sort((a, b) => a.toPar - b.toPar)[0];

  homeRoundSummary.textContent =
    `${round.courseName} · Hole ${round.currentHole} of ${round.totalHoles} · ${leader.name} ${formatToPar(leader.toPar)}`;
}

function setVoiceButtonText(text) {
  const isIdle = text === "Start Listening";

  if (voiceBtn) {
    voiceBtn.setAttribute("aria-label", isIdle ? "Talk to the caddie" : text);
    voiceBtn.classList.toggle("is-active", !isIdle && text !== "Voice Not Supported");
    voiceBtn.classList.toggle("is-unsupported", text === "Voice Not Supported");
  }

  if (preRoundVoiceBtn) {
    preRoundVoiceBtn.textContent = isIdle ? "Hold a conversation" : text;
  }
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

function addCaddieBubble(text, type = "caddie", options = {}) {
  if (!caddieConversation || !text) {
    return null;
  }

  const bubble = document.createElement("div");
  bubble.className = `bubble bubble-${type}`;

  if (options.thinking) {
    bubble.classList.add("bubble-thinking");
  }

  bubble.textContent = text;
  caddieConversation.appendChild(bubble);

  while (caddieConversation.children.length > 8) {
    caddieConversation.removeChild(caddieConversation.firstElementChild);
  }

  caddieConversation.scrollTop = caddieConversation.scrollHeight;
  return bubble;
}

function updateCaddieBubble(bubble, text, type = "caddie") {
  if (!bubble) {
    return addCaddieBubble(text, type);
  }

  bubble.className = `bubble bubble-${type}`;
  bubble.textContent = text;

  if (caddieConversation) {
    caddieConversation.scrollTop = caddieConversation.scrollHeight;
  }

  return bubble;
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
    stats: statsSection,
    yardage: yardageSection,
    glance: glanceSection,
    settingsSection: settingsSection
  };

  if (!roundSection.classList.contains("hidden") && normalizedTarget !== "round") {
    saveScoresQuietly();
  }

  if (normalizedTarget === "course-library-panel") {
    showAppScreen("startSetup");
    const coursePanel = document.getElementById("course-library-panel");

    if (coursePanel) {
      coursePanel.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    return;
  }

  if ((normalizedTarget === "round" || normalizedTarget === "scorecard" || normalizedTarget === "yardage" || normalizedTarget === "glance") && round.players.length === 0) {
    showAppScreen("startSetup");
    return;
  }

  if (normalizedTarget !== "glance") {
    stopGlanceRefresh();
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

  if (normalizedTarget === "stats") {
    renderStatistics();
  }

  if (normalizedTarget === "settingsSection") {
    renderAccessCodeSettings();
    renderClubProfileStatus();
    renderShotHistorySummary();
    renderUnitPreference();
    renderGolferName();
  }

  if (normalizedTarget === "home") {
    renderHomeSummary();
    renderRoundHistory();
  }

  Object.values(screens).forEach(screen => {
    if (screen) {
      screen.classList.add("hidden");
    }
  });

  const activeScreen = screens[normalizedTarget] || setupSection;
  activeScreen.classList.remove("hidden");

  // Started only once the screen is visible, because the renderer skips work
  // while the section is still hidden.
  if (normalizedTarget === "glance") {
    startGlanceRefresh();
  }

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
    const par = getHolePar(round.currentHole);
    const stats = getHoleStats(player, round.currentHole);

    const row = document.createElement("div");
    row.className = "score-row";

    const top = document.createElement("div");
    top.className = "score-row-top";

    const name = document.createElement("span");
    name.className = "score-name";
    name.textContent = player;

    const stepper = document.createElement("div");
    stepper.className = "stepper";

    const minus = document.createElement("button");
    minus.type = "button";
    minus.className = "stepper-btn";
    minus.setAttribute("aria-label", `One less for ${player}`);
    minus.textContent = "−";

    const input = document.createElement("input");
    input.type = "number";
    input.min = "1";
    input.max = "20";
    input.inputMode = "numeric";
    input.id = `score-player-${index}`;
    input.value = savedScore;
    input.placeholder = String(par);
    input.setAttribute("aria-label", `Score for ${player}`);

    const plus = document.createElement("button");
    plus.type = "button";
    plus.className = "stepper-btn";
    plus.setAttribute("aria-label", `One more for ${player}`);
    plus.textContent = "+";

    minus.addEventListener("click", function () {
      stepScoreInput(input, -1, par);
    });
    plus.addEventListener("click", function () {
      stepScoreInput(input, 1, par);
    });
    input.addEventListener("change", function () {
      saveScoresQuietly();
    });

    stepper.appendChild(minus);
    stepper.appendChild(input);
    stepper.appendChild(plus);
    top.appendChild(name);
    top.appendChild(stepper);

    const detail = document.createElement("div");
    detail.className = "score-detail";

    const putts = document.createElement("div");
    putts.className = "putt-control";

    const puttLabel = document.createElement("span");
    puttLabel.textContent = "Putts";

    const puttMinus = document.createElement("button");
    puttMinus.type = "button";
    puttMinus.className = "mini-btn";
    puttMinus.textContent = "−";
    puttMinus.setAttribute("aria-label", `One less putt for ${player}`);

    const puttValue = document.createElement("strong");
    puttValue.textContent = stats.putts === null ? "—" : String(stats.putts);

    const puttPlus = document.createElement("button");
    puttPlus.type = "button";
    puttPlus.className = "mini-btn";
    puttPlus.textContent = "+";
    puttPlus.setAttribute("aria-label", `One more putt for ${player}`);

    puttMinus.addEventListener("click", function () {
      stepPutts(player, -1);
    });
    puttPlus.addEventListener("click", function () {
      stepPutts(player, 1);
    });

    putts.appendChild(puttLabel);
    putts.appendChild(puttMinus);
    putts.appendChild(puttValue);
    putts.appendChild(puttPlus);

    const fairway = document.createElement("button");
    fairway.type = "button";
    fairway.className = `toggle-chip${stats.fairway ? " is-on" : ""}`;
    fairway.textContent = "Fairway";
    fairway.setAttribute("aria-pressed", String(Boolean(stats.fairway)));
    fairway.disabled = par === 3;
    fairway.title = par === 3 ? "Par 3 holes do not count a fairway" : "";
    fairway.addEventListener("click", function () {
      toggleHoleStat(player, "fairway");
    });

    const green = document.createElement("button");
    green.type = "button";
    green.className = `toggle-chip${stats.gir ? " is-on" : ""}`;
    green.textContent = "GIR";
    green.setAttribute("aria-pressed", String(Boolean(stats.gir)));
    green.addEventListener("click", function () {
      toggleHoleStat(player, "gir");
    });

    detail.appendChild(putts);
    detail.appendChild(fairway);
    detail.appendChild(green);

    row.appendChild(top);
    row.appendChild(detail);
    scoreInputs.appendChild(row);
  });

  message.textContent = "";
  renderHoleParInput();
  renderHoleTargetInputs();
  renderHoleHazards();
  renderShotLogStatus();
  renderPlayerManageList();

  if (lastYardageHole !== round.currentHole) {
    lastYardageHole = round.currentHole;
    clearYardageReadouts();
  }
}

function stepScoreInput(input, delta, par) {
  const current = Number(input.value) || Number(par) || 4;
  const next = Math.min(20, Math.max(1, current + delta));

  input.value = String(next);
  buzz();
  saveScoresQuietly();
}

function getHoleStats(player, hole) {
  const forPlayer = (round.holeStats || {})[player] || {};
  const stats = forPlayer[hole] || {};

  return {
    putts: Number.isFinite(Number(stats.putts)) && stats.putts !== null ? Number(stats.putts) : null,
    fairway: Boolean(stats.fairway),
    gir: Boolean(stats.gir)
  };
}

function setHoleStats(player, hole, stats) {
  if (!round.holeStats) {
    round.holeStats = {};
  }

  if (!round.holeStats[player]) {
    round.holeStats[player] = {};
  }

  round.holeStats[player][hole] = stats;
  saveRoundToStorage();
}

function stepPutts(player, delta) {
  const stats = getHoleStats(player, round.currentHole);
  const current = stats.putts === null ? 0 : stats.putts;
  const next = Math.min(10, Math.max(0, current + delta));

  captureScoreUndo("putts");
  setHoleStats(player, round.currentHole, { ...stats, putts: next });
  buzz();
  renderCurrentHole();
  renderScorecard();
}

function toggleHoleStat(player, key) {
  const stats = getHoleStats(player, round.currentHole);

  captureScoreUndo(key === "gir" ? "green hit" : "fairway");
  setHoleStats(player, round.currentHole, { ...stats, [key]: !stats[key] });
  buzz();
  renderCurrentHole();
  renderScorecard();
}

function getPlayerPuttTotal(player) {
  const forPlayer = (round.holeStats || {})[player] || {};

  return Object.values(forPlayer).reduce((total, stats) => {
    const putts = Number(stats.putts);

    return Number.isFinite(putts) ? total + putts : total;
  }, 0);
}

function getPlayerFairwayCount(player) {
  const forPlayer = (round.holeStats || {})[player] || {};

  return Object.values(forPlayer).filter(stats => stats.fairway).length;
}

function getPlayerGreenCount(player) {
  const forPlayer = (round.holeStats || {})[player] || {};

  return Object.values(forPlayer).filter(stats => stats.gir).length;
}

function clearYardageReadouts() {
  renderYardageReadouts({ front: null, center: null, back: null });
}

function renderYardageReadouts(yardages) {
  const text = value => (value ? String(value) : "—");

  [
    ["yardFront", yardages.front],
    ["yardCenter", yardages.center],
    ["yardBack", yardages.back],
    ["roundYardFront", yardages.front],
    ["roundYardBack", yardages.back],
    ["roundYardageValue", yardages.center || yardages.front || yardages.back]
  ].forEach(([id, value]) => {
    const element = document.getElementById(id);

    if (element) {
      element.textContent = text(value);
    }
  });
}

function saveScores() {
  const result = saveScoresQuietly();

  if (!result.ok) {
    message.textContent = result.error;
    notify(result.error);
    return;
  }

  message.textContent = `Scores saved for Hole ${round.currentHole}.`;
}

function saveScoresQuietly() {
  if (round.players.length === 0) {
    return { ok: true };
  }

  const pending = [];

  for (let i = 0; i < round.players.length; i++) {
    const player = round.players[i];
    const input = document.getElementById(`score-player-${i}`);

    if (!input || !input.value) {
      continue;
    }

    const score = Number(input.value);

    if (!Number.isInteger(score) || score < 1 || score > 20) {
      return { ok: false, error: `Enter a score between 1 and 20 for ${player}.` };
    }

    pending.push([player, score]);
  }

  const changed = pending.some(([player, score]) => {
    return round.scores[player][round.currentHole] !== score;
  });

  if (!changed) {
    return { ok: true };
  }

  captureScoreUndo(`hole ${round.currentHole}`);

  pending.forEach(([player, score]) => {
    round.scores[player][round.currentHole] = score;
  });

  saveRoundToStorage();
  renderScorecard();
  renderHomeSummary();
  return { ok: true };
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

    const stats = document.createElement("div");
    stats.className = "scorecard-stat-row";
    stats.textContent = `${getPlayerPuttTotal(player)} putts · ${getPlayerFairwayCount(player)} fairways · ${getPlayerGreenCount(player)} greens`;
    totals.appendChild(stats);
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

      const name = document.createElement("span");
      name.textContent = player;

      const chip = document.createElement("strong");
      chip.className = `score-chip ${getScoreChipClass(score, getHolePar(hole))}`;
      chip.textContent = score || "—";

      row.appendChild(name);
      row.appendChild(chip);
      card.appendChild(row);
    });

    scorecardTable.appendChild(card);
  }

  renderLeader();
}

function getScoreChipClass(score, par) {
  if (!score) {
    return "is-empty";
  }

  const diff = Number(score) - Number(par);

  if (diff <= -2) {
    return "is-eagle";
  }

  if (diff === -1) {
    return "is-birdie";
  }

  if (diff === 0) {
    return "is-par";
  }

  if (diff === 1) {
    return "is-bogey";
  }

  return "is-double";
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
  round.savedAt = Date.now();
  localStorage.setItem("golfRound", JSON.stringify(round));
  syncWakeLock();
}

function loadSavedRound() {
  const savedRound = localStorage.getItem("golfRound");

  if (!savedRound) {
    return;
  }

  round = JSON.parse(savedRound);
  loadedRoundSavedAt = Number(round.savedAt || 0);

  if (!round.holePars) {
    round.holePars = createDefaultPars(round.totalHoles);
  }

  if (!round.holeStats) {
    round.holeStats = {};
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

async function resetRound() {
  const confirmed = await confirmAction(
    roundHasScores()
      ? "Reset this round? It will be saved to your round history first."
      : "Reset this round?",
    "Reset round"
  );

  if (!confirmed) {
    return;
  }

  archiveCurrentRound();

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

  if (caddieConversation) {
    caddieConversation.innerHTML = "";
    addCaddieBubble("Ready when you are. Speak naturally, just like you would to a real caddie.");
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
      transcriptText.textContent = `Hearing: ${visibleTranscript}`;
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
    notify("Voice recording is not available in this browser. On phones, the app usually needs to be opened with HTTPS for microphone access.");
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
    addCaddieBubble(transcript, "user");
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
    headers: { "Content-Type": audioBlob.type || "audio/webm" },
    body: audioBlob
  });

  if (!response.ok) {
    const error = await buildApiError(response, "Audio transcription");

    throw new Error(error.userMessage || error.message || "Audio transcription failed.");
  }

  const body = await response.json().catch(function () {
    return {};
  });

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
  addCaddieBubble(transcript, "user");
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
  if (!isOnline()) {
    setVoiceStatus("Offline — using on-device handling.");
    addCaddieBubble("No connection right now, so I'm using on-device handling for that.", "system");

    if (!tryHandleFastLocalVoiceCommand(transcript)) {
      handleLegacyVoiceCommand(transcript);
    }

    return;
  }

  setVoiceStatus("Asking the AI caddie...");
  const thinkingBubble = addCaddieBubble("Asking the AI caddie", "caddie", { thinking: true });

  try {
    const agentResult = await askVoiceAgent(transcript);

    if (agentResult && executeVoiceAgentAction(agentResult)) {
      if (thinkingBubble && thinkingBubble.parentElement) {
        thinkingBubble.remove();
      }
      return;
    }
  } catch (error) {
    if (error && error.userMessage) {
      if (thinkingBubble && thinkingBubble.parentElement) {
        thinkingBubble.remove();
      }

      setVoiceStatus("Voice caddie request blocked.");
      showVoiceAgentMessage(error.userMessage, true);
      return;
    }

    console.warn("AI voice agent unavailable, using legacy parser.", error);
  }

  if (thinkingBubble && thinkingBubble.parentElement) {
    thinkingBubble.remove();
  }

  setVoiceStatus("AI caddie unavailable. Trying backup command handling...");
  addCaddieBubble("The AI caddie did not answer in time, so I’m trying the backup command handler.", "system");

  if (tryHandleFastLocalVoiceCommand(transcript)) {
    return;
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
  addCaddieBubble(text, "caddie");

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
  archiveCurrentRound();
  renderScorecard();
  syncAccountData(false);
  saveRoundToStorage();
  releaseWakeLock();
  stopLocationWatch();
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
  }, AI_VOICE_TIMEOUT_MS);

  try {
    const response = await fetch("/api/voice-agent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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
      throw await buildApiError(response, "Voice agent");
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


async function buildApiError(response, label) {
  const body = await response.json().catch(function () {
    return {};
  });
  const error = new Error(body.error || `${label} request failed with ${response.status}.`);

  error.status = response.status;

  if (body.code === "access_code_required") {
    error.userMessage = "This server needs an access code. Open Settings and enter the access code, then try again.";
  } else if (body.code === "service_paused") {
    error.userMessage = body.error || "The caddie service is paused right now. Scoring and saved course data still work.";
  } else if (body.code === "server_budget_reached") {
    error.userMessage = body.error || "This server hit its daily caddie budget. Scoring and saved course data still work.";
  } else if (response.status === 401 || response.status === 403) {
    error.userMessage = "The server's provider key was rejected. Check the GOLFAPI or OpenAI key on the server.";
  } else if (response.status === 429) {
    error.userMessage = body.error || "Too many requests in a short time. Wait a moment and ask again.";
  } else if (response.status === 503) {
    error.userMessage = body.error || "The server is missing an API key for that request.";
  }

  return error;
}

function buildRoundContextForAgent() {
  const currentHole = Number(round.currentHole || 1);

  return {
    courseName: round.courseName,
    players: round.players,
    // Who "I", "me", and "my" mean: the signed-in golfer, matched into this
    // round's player list. Null when the account holder is not playing.
    you: getMyPlayerName(),
    golferName: getGolferName(),
    totalHoles: round.totalHoles,
    currentHole: currentHole,
    scores: round.scores,
    holePars: round.holePars || {},
    holeLengths: round.holeLengths || {},
    currentHoleContext: {
      par: getHolePar(currentHole),
      lengthYards: getHoleLength(currentHole),
      greenTarget: (round.holeTargets || {})[currentHole] || null,
      hazards: (round.holeHazards || {})[currentHole] || [],
      hasGreenTargetsOnOtherHoles: Object.keys(round.holeTargets || {}).length > 0
    },
    playerClubProfile: getPlayerClubProfileForAgent(),
    // Only conditions already fetched: a voice reply never waits on weather.
    conditions: conditionsCache && Date.now() - conditionsCache.time < CONDITIONS_MAX_AGE_MS
      ? conditionsCache.value
      : null,
    currentLie: shotLieInput ? shotLieInput.value : null
  };
}

// -------------------------------
// Golfer identity
// -------------------------------

// "I", "me", and "my" mean the person whose account is in use. The name is
// saved per device, filled in from the account email on first sign-in, and
// synced with the account so a second phone resolves the same golfer.
function getGolferName() {
  try {
    return String(localStorage.getItem(GOLFER_NAME_STORAGE_KEY) || "").trim();
  } catch {
    return "";
  }
}

function saveGolferName(name) {
  const cleaned = String(name || "").trim().slice(0, 60);

  try {
    if (cleaned) {
      localStorage.setItem(GOLFER_NAME_STORAGE_KEY, cleaned);
    } else {
      localStorage.removeItem(GOLFER_NAME_STORAGE_KEY);
    }
  } catch {
    // Storage can be unavailable in hardened/private browser contexts.
  }

  return cleaned;
}

// The account holder, resolved into this round's player list. Falls back to
// the first player only when no identity is saved, so rounds started before
// this feature keep behaving exactly as they did.
function getMyPlayerName() {
  const golfer = getGolferName();

  if (golfer) {
    const match = round.players.find(player => player.toLowerCase() === golfer.toLowerCase());

    return match || null;
  }

  return round.players[0] || null;
}

function isMyPlayer(player) {
  const me = getMyPlayerName();

  return Boolean(me) && player === me;
}

function defaultGolferNameFromEmail(email) {
  const local = String(email || "").split("@")[0].replace(/[._-]+/g, " ").trim();

  if (!local) {
    return "";
  }

  return local
    .split(/\s+/)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
    .slice(0, 60);
}

function getPlayerClubProfileForAgent() {
  const clubs = getEffectiveClubDistances();

  if (clubs.length === 0) {
    return {
      status: "not_configured",
      note: "No personal club distances have been saved and no clubs have enough logged shots yet."
    };
  }

  return {
    status: "configured",
    clubs: clubs.map(entry => ({
      club: entry.club,
      carryYards: entry.carryYards,
      source: entry.source,
      shots: entry.shots
    })),
    note: "Carry distances come from the golfer's saved profile and logged shots. Prefer these over any general chart."
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
    "recommend_club",
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

  if (result.action === "recommend_club") {
    executeAgentClubRecommendation(result);
    return true;
  }

  if (result.action === "log_shot") {
    return executeAgentLogShot(result);
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

async function executeAgentClubRecommendation(result) {
  const statedDistance = Number(result.payload.distanceYards || 0);

  if (statedDistance > 0) {
    // A spoken distance is the number on a marker or a rangefinder, so the
    // app only applies the conditions it can measure for itself.
    const conditions = await getConditionsForCurrentShot();
    const recommendation = buildClubRecommendationMessage(result, statedDistance, "asked distance", conditions.value, conditions.bearing);

    showVoiceAgentMessage(recommendation, result.speak);
    return;
  }

  const target = getCurrentHoleTarget();

  if (!target || target.center.lat === null || target.center.lng === null) {
    const fallbackMessage = result.message ||
      "I can help pick a club, but I need a distance first. Tell me something like, I have 150 yards, what should I hit?";
    showVoiceAgentMessage(fallbackMessage, true);
    return;
  }

  if (!navigator.geolocation) {
    const noGpsMessage = "I can recommend a club if you tell me the distance. GPS is not supported in this browser.";
    showVoiceAgentMessage(noGpsMessage, true);
    return;
  }

  showVoiceAgentMessage("Getting your yardage so I can make a club call...", false);

  try {
    const position = await getCurrentPositionForCaddie();
    const yardages = calculateGreenYardages(
      position.coords.latitude,
      position.coords.longitude,
      target
    );
    const distance = yardages.center || yardages.front || yardages.back;

    if (!distance) {
      showVoiceAgentMessage("I could not calculate a clean yardage. Tell me the distance and I will make a club call.", true);
      return;
    }

    const conditions = await getConditionsForCurrentShot(position, target);
    const recommendation = buildClubRecommendationMessage(
      result,
      distance,
      "GPS center-green yardage",
      conditions.value,
      conditions.bearing
    );

    showVoiceAgentMessage(recommendation, result.speak);
  } catch (error) {
    const gpsMessage = `${getLocationErrorMessage(error)} Tell me the distance and I can still recommend a club.`;
    showVoiceAgentMessage(gpsMessage, true);
  }
}

function getCurrentPositionForCaddie() {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    });
  });
}

// Returns the conditions for the shot in front of the golfer, along with the
// bearing to the target so a wind can be split into head and cross components.
async function getConditionsForCurrentShot(position, target) {
  const hole = target || getCurrentHoleTarget();
  const coords = position ? position.coords : (lastPosition ? lastPosition.coords : null);

  if (!coords) {
    return { value: null, bearing: null };
  }

  const hasTarget = Boolean(hole && hole.center && hole.center.lat !== null && hole.center.lng !== null);
  const value = await fetchPlayingConditions(coords.latitude, coords.longitude, hole);
  const bearing = hasTarget
    ? calculateBearing(coords.latitude, coords.longitude, hole.center.lat, hole.center.lng)
    : null;

  return { value: value, bearing: bearing };
}

function buildClubRecommendationMessage(result, distanceYards, distanceSource, conditions, shotBearing) {
  const lie = shotLieInput ? shotLieInput.value : "fairway";
  const playing = computePlayingDistance(distanceYards, conditions, shotBearing, lie);
  // The club is chosen for how far the shot plays, not how far it measures.
  const personalChoice = chooseClubFromPersonalDistances(playing.playingYards);
  const club = personalChoice ? personalChoice.club : (result.payload.recommendedClub || chooseDefaultClubForDistance(playing.playingYards));
  const par = getHolePar(round.currentHole);
  const holeLength = getHoleLength(round.currentHole);
  const hazards = getCurrentHoleHazards();
  const hazardAdvice = buildCaddieHazardAdvice(hazards);
  const target = result.payload.shotTarget || buildDefaultShotTarget(playing.playingYards, par);
  const miss = result.payload.missPreference || buildDefaultMissPreference(hazards);
  const reason = buildClubRecommendationReason(result, personalChoice, playing.playingYards);
  const tendency = describeClubTendency(club);
  const holeContext = holeLength
    ? `Hole ${round.currentHole} is a par ${par}, ${formatDistance(holeLength)}.`
    : `Hole ${round.currentHole} is a par ${par}.`;
  const playsLine = playing.adjustments.length > 0
    ? `That plays about ${formatDistance(playing.playingYards)}: ${playing.adjustments.map(item => item.label).join(", ")}.`
    : "";
  const weatherLine = playing.adjustments.length === 0 ? describePlayingConditions(conditions) : "";

  prefillShotLogFromRecommendation(club, distanceYards);

  return [
    `${holeContext} From ${formatDistance(distanceYards)}, I would hit ${club}.`,
    playsLine,
    `Aim ${target}.`,
    `Best miss: ${miss}.`,
    hazardAdvice,
    reason,
    tendency,
    weatherLine ? `Conditions: ${weatherLine}.` : "",
    distanceSource === "GPS center-green yardage" ? "This is based on center-green GPS yardage." : ""
  ].filter(Boolean).join(" ");
}

function buildClubRecommendationReason(result, personalChoice, distanceYards) {
  if (personalChoice && personalChoice.source === "learned") {
    return `Your logged shots put that club around ${personalChoice.carryYards} yards over ${personalChoice.shots} swings.`;
  }

  if (personalChoice) {
    return `Your saved profile carries that club about ${personalChoice.carryYards} yards.`;
  }

  return result.payload.recommendationReason ||
    `That fits a ${distanceYards}-yard shot using the general club chart. Add your club distances in Settings for a personal call.`;
}

function prefillShotLogFromRecommendation(club, distanceYards) {
  if (shotClubInput && !shotClubInput.value) {
    shotClubInput.value = club;
  }

  if (shotDistanceInput && !shotDistanceInput.value) {
    shotDistanceInput.value = String(distanceYards);
  }
}

function chooseDefaultClubForDistance(distanceYards) {
  const match = DEFAULT_CLUB_DISTANCES.find(club => {
    return distanceYards >= club.min && distanceYards <= club.max;
  });

  return match ? match.club : "a comfortable wedge";
}

function buildDefaultShotTarget(distanceYards, par) {
  if (distanceYards >= 215 && par >= 4) {
    return "at the widest part of the fairway, not directly at trouble";
  }

  if (distanceYards >= 160) {
    return "for the center of the green";
  }

  if (distanceYards >= 80) {
    return "for the middle number and take enough club";
  }

  return "for a controlled landing spot, not the flag unless it is safe";
}

function buildDefaultMissPreference(hazards) {
  const waterHazard = hazards.find(hazard => String(hazard.type).toLowerCase() === "water");

  if (waterHazard) {
    return `away from ${waterHazard.name}`;
  }

  const bunkerHazard = hazards.find(hazard => String(hazard.type).toLowerCase() === "bunker");

  if (bunkerHazard) {
    return `away from ${bunkerHazard.name}`;
  }

  return "short and safe rather than long";
}

function buildCaddieHazardAdvice(hazards) {
  if (!Array.isArray(hazards) || hazards.length === 0) {
    return "";
  }

  const namedHazards = hazards.slice(0, 2).map(hazard => hazard.name).join(" and ");

  return `Watch ${namedHazards}.`;
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
  addCaddieBubble(text, "caddie");

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

  round.players.forEach(player => {
    const playerName = player.toLowerCase();

    const possibleNames = [playerName];

    // "I", "me", and "my" belong to the signed-in golfer, not to whoever
    // happens to be listed first.
    if (isMyPlayer(player)) {
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
  // A named player always wins over a pronoun, so "what did Sam shoot" is
  // never mistaken for the account holder's own score.
  for (const player of round.players) {
    const playerPattern = new RegExp(`\\b${escapeRegExp(player.toLowerCase())}\\b`, "i");

    if (playerPattern.test(command)) {
      return player;
    }
  }

  if (/\bi\b/.test(command) || /\bme\b/.test(command) || /\bmy\b/.test(command)) {
    return getMyPlayerName();
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
    notify("Please enter at least the center green latitude and longitude.");
    return;
  }

  if (!isValidCoordinatePair(centerLat, centerLng)) {
    notify("Center green coordinates are not valid.");
    return;
  }

  if ((frontLat !== null || frontLng !== null) && !isValidCoordinatePair(frontLat, frontLng)) {
    notify("Front green coordinates are not valid.");
    return;
  }

  if ((backLat !== null || backLng !== null) && !isValidCoordinatePair(backLat, backLng)) {
    notify("Back green coordinates are not valid.");
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

  const cached = getFreshCachedPosition();

  if (cached) {
    applyYardagePosition(cached, target, shouldSpeak);
    return;
  }

  yardageResult.textContent = "Getting your location...";
  message.textContent = "Getting your location...";

  navigator.geolocation.getCurrentPosition(
    function (position) {
      lastPosition = position;
      applyYardagePosition(position, target, shouldSpeak);
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

function applyYardagePosition(position, target, shouldSpeak) {
  const yardages = calculateGreenYardages(
    position.coords.latitude,
    position.coords.longitude,
    target
  );
  const accuracy = getAccuracyNote(position);
  const resultMessage = buildYardageDisplayMessage(yardages);
  const spokenMessage = buildYardageSpokenMessage(yardages);

  renderYardageReadouts(yardages);

  const displayed = accuracy.text ? `${resultMessage} ${accuracy.text}.` : resultMessage;
  const warning = accuracy.weak
    ? " GPS is weak right now, so treat that number as approximate."
    : "";

  yardageResult.textContent = accuracy.weak ? `${displayed}${warning}` : displayed;
  message.textContent = displayed;
  setVoiceStatus(displayed);

  if (shouldSpeak) {
    speakText(`${spokenMessage}${warning}`);
  }
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
    parts.push(`Front ${fromYards(yardages.front)}`);
  }

  if (yardages.center !== null) {
    parts.push(`Center ${fromYards(yardages.center)}`);
  }

  if (yardages.back !== null) {
    parts.push(`Back ${fromYards(yardages.back)}`);
  }

  return `Hole ${round.currentHole} — ${parts.join(", ")} ${unitLabel(true)}.`;
}

function buildYardageSpokenMessage(yardages) {
  const parts = [];

  if (yardages.front !== null) {
    parts.push(`front ${fromYards(yardages.front)}`);
  }

  if (yardages.center !== null) {
    parts.push(`center ${fromYards(yardages.center)}`);
  }

  if (yardages.back !== null) {
    parts.push(`back ${fromYards(yardages.back)}`);
  }

  return `Hole ${round.currentHole}: ${parts.join(", ")} ${unitLabel(true)}.`;
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

// -------------------------------
// Playing conditions
// -------------------------------

function calculateBearing(lat1, lng1, lat2, lng2) {
  const startLat = toRadians(lat1);
  const endLat = toRadians(lat2);
  const deltaLng = toRadians(lng2 - lng1);
  const y = Math.sin(deltaLng) * Math.cos(endLat);
  const x = Math.cos(startLat) * Math.sin(endLat) - Math.sin(startLat) * Math.cos(endLat) * Math.cos(deltaLng);

  return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
}

// One lookup serves a whole hole: the server caches by rounded position and
// the client holds the answer long enough that walking a fairway is free.
async function fetchPlayingConditions(lat, lng, target) {
  const hasTarget = Boolean(target && target.center && target.center.lat !== null && target.center.lng !== null);
  const key = [lat.toFixed(3), lng.toFixed(3), hasTarget ? target.center.lat.toFixed(3) : ""].join(",");

  if (conditionsCache && conditionsCache.key === key && Date.now() - conditionsCache.time < CONDITIONS_MAX_AGE_MS) {
    return conditionsCache.value;
  }

  const params = new URLSearchParams({ lat: String(lat), lng: String(lng) });

  if (hasTarget) {
    params.set("targetLat", String(target.center.lat));
    params.set("targetLng", String(target.center.lng));
  }

  try {
    const response = await fetch(`/api/conditions?${params.toString()}`, { credentials: "same-origin" });

    if (!response.ok) {
      return null;
    }

    const value = await response.json();

    conditionsCache = { key: key, time: Date.now(), value: value };
    return value;
  } catch {
    return null;
  }
}

// Turns a measured yardage into the distance the shot actually plays. Each
// rule is a widely used caddie approximation, kept separate so the spoken
// explanation can name exactly what moved the number.
function computePlayingDistance(distanceYards, conditions, shotBearing, lie) {
  const adjustments = [];
  let playingYards = distanceYards;

  if (conditions) {
    const rise = conditions.elevation ? conditions.elevation.riseMeters : null;

    if (Number.isFinite(rise) && Math.abs(rise) >= 1.5) {
      // A shot plays roughly its height change in yards longer uphill.
      const riseYards = Math.round(rise * 1.09361);

      // The elevation model has about 90 m resolution, and a saved green
      // coordinate can be wrong. A golf shot never climbs a quarter of its own
      // length, so a larger figure is bad data, not a steep hole, and acting on
      // it would hand out a driver for a wedge shot.
      if (Math.abs(riseYards) > distanceYards * 0.25) {
        adjustments.push({
          yards: 0,
          label: "elevation data here looks wrong, so I ignored it"
        });
      } else {
        playingYards += riseYards;
        adjustments.push({
          yards: riseYards,
          label: `${Math.abs(riseYards)} yards ${riseYards > 0 ? "uphill" : "downhill"}`
        });
      }
    }

    if (Number.isFinite(conditions.windMph) && conditions.windMph >= 4 && Number.isFinite(shotBearing) && Number.isFinite(conditions.windFromDegrees)) {
      // Wind direction is reported as the direction it comes from, so a wind
      // from the same bearing you are aiming at is a headwind.
      const angle = toRadians(conditions.windFromDegrees - shotBearing);
      const headComponent = conditions.windMph * Math.cos(angle);
      const crossComponent = conditions.windMph * Math.sin(angle);
      // Headwind hurts about twice as much as the same tailwind helps.
      const windYards = Math.round(headComponent >= 0 ? headComponent * 1 : headComponent * 0.5);

      if (Math.abs(windYards) >= 2) {
        playingYards += windYards;
        adjustments.push({
          yards: windYards,
          label: `${Math.abs(windYards)} yards for a ${Math.round(Math.abs(headComponent))} mph ${headComponent >= 0 ? "headwind" : "downwind"}`
        });
      }

      if (Math.abs(crossComponent) >= 7) {
        adjustments.push({
          yards: 0,
          label: `${Math.round(Math.abs(crossComponent))} mph crosswind from the ${crossComponent > 0 ? "right" : "left"}`
        });
      }
    }

    if (Number.isFinite(conditions.temperatureF)) {
      // Cold, dense air costs roughly two yards per ten degrees below 70F.
      const temperatureYards = Math.round((70 - conditions.temperatureF) / 10 * 2);

      if (Math.abs(temperatureYards) >= 2) {
        playingYards += temperatureYards;
        adjustments.push({
          yards: temperatureYards,
          label: `${Math.abs(temperatureYards)} yards for ${conditions.temperatureF} degrees`
        });
      }
    }
  }

  const lieAdjustment = LIE_ADJUSTMENTS[lie];

  if (lieAdjustment && lieAdjustment.factor !== 0) {
    const lieYards = Math.round(distanceYards * lieAdjustment.factor);

    if (Math.abs(lieYards) >= 2) {
      playingYards += lieYards;
      adjustments.push({ yards: lieYards, label: `${Math.abs(lieYards)} yards from ${lieAdjustment.label}` });
    }
  }

  return {
    playingYards: Math.max(1, Math.round(playingYards)),
    rawYards: Math.round(distanceYards),
    adjustments: adjustments
  };
}

function describePlayingConditions(conditions) {
  if (!conditions) {
    return "";
  }

  const parts = [];

  if (Number.isFinite(conditions.temperatureF)) {
    parts.push(`${conditions.temperatureF} degrees`);
  }

  if (Number.isFinite(conditions.windMph) && conditions.windMph >= 1) {
    parts.push(`${conditions.windMph} mph wind from the ${compassName(conditions.windFromDegrees)}`);
  }

  return parts.join(", ");
}

function compassName(degrees) {
  if (!Number.isFinite(degrees)) {
    return "";
  }

  const names = ["north", "northeast", "east", "southeast", "south", "southwest", "west", "northwest"];

  return names[Math.round(degrees / 45) % 8];
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
    notify("Please enter a target name.");
    return;
  }

  if (!hazardLatInput.value || !hazardLngInput.value) {
    notify("Please enter both latitude and longitude.");
    return;
  }

  if (!isValidCoordinatePair(lat, lng)) {
    notify("Target coordinates are not valid.");
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

    const title = document.createElement("strong");
    title.textContent = `${index + 1}. ${hazard.name}`;

    const detail = document.createElement("div");
    detail.textContent = `Type: ${hazard.type} · ${hazard.lat}, ${hazard.lng}`;

    div.appendChild(title);
    div.appendChild(detail);
    hazardList.appendChild(div);
  });
}

async function clearHazardsForCurrentHole() {
  const confirmed = await confirmAction(
    `Clear all hazards and layup targets for hole ${round.currentHole}?`,
    "Clear targets"
  );

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
  if (savedCourseCache) {
    return savedCourseCache;
  }

  const savedCourses = localStorage.getItem("golfCourseSetups");

  if (!savedCourses) {
    savedCourseCache = [];
    return savedCourseCache;
  }

  try {
    const parsed = JSON.parse(savedCourses);

    savedCourseCache = Array.isArray(parsed) ? parsed : [];
  } catch {
    savedCourseCache = [];
  }

  return savedCourseCache;
}

function saveCourseSetupsToStorage(courses) {
  localStorage.setItem("golfCourseSetups", JSON.stringify(courses));
  savedCourseCache = courses;
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
    notify("Please choose a saved course setup.");
    return;
  }

  const courses = getSavedCourseSetups();

  const course = courses.find(item => {
    return item.id === selectedId;
  });

  if (!course) {
    notify("That saved course could not be found.");
    return;
  }

  selectedCourseSetup = course;

  courseNameInput.value = course.courseName;
  totalHolesSelect.value = String(course.totalHoles);

  notify(`${course.courseName} loaded. Now add players and start the round.`);
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
  closeCourseLoadPanel();

  try {
    const data = await fetchGolfApiJson("clubs", {
      city: query,
      country: country || "usa",
      measureUnit: "km"
    });
    const clubs = normalizeGolfApiClubs(data);

    if (clubs.length === 0) {
      setGolfApiSearchStatus("No courses found. Try a nearby city or a shorter search term.");
      return;
    }

    setGolfApiSearchStatus(`Found ${clubs.length} club${clubs.length === 1 ? "" : "s"}. Choose one to pick its course and tee.`);
    renderGolfApiSearchResults(clubs);
  } catch (error) {
    console.error("GOLFAPI search failed.", error);
    setGolfApiSearchStatus(error.userMessage || error.message || "GOLFAPI search failed. Check the API key and try again.");
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
    button.textContent = "Select";
    button.addEventListener("click", function () {
      openCourseLoadPanel(club);
    });

    item.appendChild(details);
    item.appendChild(button);
    golfApiSearchResults.appendChild(item);
  });
}

async function openCourseLoadPanel(club) {
  pendingCourseLoad = { club: club, courses: [], course: null };

  courseLoadPanel.classList.remove("hidden");
  courseLoadTitle.textContent = `Choose a course and tee at ${getGolfApiClubName(club)}`;
  courseLoadStatus.textContent = "Loading courses...";
  golfApiCourseSelect.innerHTML = "";
  golfApiTeeSelect.innerHTML = "";
  confirmCourseLoadBtn.disabled = true;

  try {
    const courses = await fetchGolfApiClubCourses(club);

    if (courses.length === 0) {
      courseLoadStatus.textContent = "GOLFAPI did not list any courses for this club.";
      return;
    }

    pendingCourseLoad.courses = courses;

    const preferred = chooseGolfApiCourse(courses);

    courses.forEach((course, index) => {
      const option = document.createElement("option");
      const holes = Number(course.numHoles || course.NumHoles || 0);

      option.value = String(index);
      option.textContent = holes
        ? `${getGolfApiCourseLabel(course, index)} (${holes} holes)`
        : getGolfApiCourseLabel(course, index);
      golfApiCourseSelect.appendChild(option);
    });

    const preferredIndex = courses.indexOf(preferred);
    golfApiCourseSelect.value = String(preferredIndex >= 0 ? preferredIndex : 0);

    await handleCourseSelectionChange();
  } catch (error) {
    console.error("Could not load GOLFAPI courses.", error);
    courseLoadStatus.textContent = error.userMessage || error.message || "Could not load courses for that club.";
  }
}

function closeCourseLoadPanel() {
  pendingCourseLoad = null;

  if (courseLoadPanel) {
    courseLoadPanel.classList.add("hidden");
  }
}

async function handleCourseSelectionChange() {
  if (!pendingCourseLoad) {
    return;
  }

  const courseRef = pendingCourseLoad.courses[Number(golfApiCourseSelect.value || 0)] || {};
  const courseId = getGolfApiCourseId(courseRef);

  golfApiTeeSelect.innerHTML = "";
  confirmCourseLoadBtn.disabled = true;
  courseLoadStatus.textContent = "Loading tees...";

  if (!courseId) {
    courseLoadStatus.textContent = "That course has no GOLFAPI course ID, so tees cannot be loaded.";
    return;
  }

  try {
    const bundle = await fetchGolfApiCourseBundle(courseId);

    pendingCourseLoad.course = bundle;

    const tees = bundle.tees;

    if (tees.length === 0) {
      courseLoadStatus.textContent = "No tees were returned for this course. Loading will still save pars and any mapped targets.";
      confirmCourseLoadBtn.disabled = false;
      return;
    }

    tees.forEach((tee, index) => {
      const option = document.createElement("option");
      const totalLength = getGolfApiTeeTotalLength(tee);

      option.value = String(index);
      option.textContent = totalLength
        ? `${getGolfApiTeeName(tee)} - ${totalLength} yards`
        : `${getGolfApiTeeName(tee)} - length unavailable`;
      golfApiTeeSelect.appendChild(option);
    });

    const preferredTee = chooseGolfApiTee(tees);
    const preferredTeeIndex = tees.indexOf(preferredTee);
    golfApiTeeSelect.value = String(preferredTeeIndex >= 0 ? preferredTeeIndex : 0);

    const coordinateNote = bundle.coordinates.length > 0
      ? "Mapped green and hazard points are available."
      : "No mapped coordinates were returned for this course.";

    courseLoadStatus.textContent = `${tees.length} tee${tees.length === 1 ? "" : "s"} available. ${coordinateNote}`;
    confirmCourseLoadBtn.disabled = false;
  } catch (error) {
    console.error("Could not load GOLFAPI tees.", error);
    courseLoadStatus.textContent = error.userMessage || error.message || "Could not load tees for that course.";
  }
}

async function confirmCourseLoadSelection() {
  if (!pendingCourseLoad || !pendingCourseLoad.course) {
    return;
  }

  const bundle = pendingCourseLoad.course;
  const tee = bundle.tees[Number(golfApiTeeSelect.value || 0)] || {};

  confirmCourseLoadBtn.disabled = true;
  courseLoadStatus.textContent = "Saving course setup...";

  const courseSetup = buildCourseSetupFromGolfApi(pendingCourseLoad.club, bundle, tee);
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

  const lengthCount = Object.keys(courseSetup.holeLengths || {}).length;
  const yardageText = lengthCount > 0
    ? ` Hole lengths loaded for the ${courseSetup.teeName} tees.`
    : " Hole lengths were not available for that tee.";
  const targetCount = Object.keys(courseSetup.holeTargets || {}).length;
  const targetText = targetCount > 0
    ? ` Green GPS targets were loaded for ${targetCount} hole${targetCount === 1 ? "" : "s"}.`
    : " Green GPS targets were not available yet.";

  closeCourseLoadPanel();
  setGolfApiSearchStatus(`${courseSetup.courseName} loaded.${yardageText}${targetText} Add players, then start the round.`);
}

function buildCourseSetupFromGolfApi(club, bundle, tee) {
  const clubId = club.clubID || club.clubId || club.id || String(Date.now());
  const course = bundle.course;
  const courseId = getGolfApiCourseId(course) || "course";
  const totalHoles = Number(course.numHoles || course.NumHoles || club.numHoles || 18) === 9 ? 9 : 18;

  return {
    id: `golfapi-${clubId}-${courseId}-${tee.teeID || tee.TeeID || tee.teeId || "tee"}`,
    courseName: getGolfApiCourseName(course, club),
    teeName: getGolfApiTeeName(tee),
    totalHoles: totalHoles,
    holeTargets: buildHoleTargetsFromGolfApiCoordinates(bundle.coordinates, totalHoles),
    holeHazards: buildHoleHazardsFromGolfApiCoordinates(bundle.coordinates, totalHoles),
    holePars: buildHoleParsFromGolfApiCourse(course, totalHoles),
    holeLengths: buildHoleLengthsFromGolfApiTee(withCourseMeasureUnit(tee, course), totalHoles),
    source: "golfapi",
    golfApi: {
      clubID: clubId,
      courseID: getGolfApiCourseId(course) || null,
      teeID: tee.teeID || tee.TeeID || tee.teeId || null,
      latitude: club.latitude || club.Latitude || null,
      longitude: club.longitude || club.Longitude || null,
      coordinateCount: bundle.coordinates.length
    },
    savedAt: new Date().toISOString()
  };
}

async function fetchGolfApiClubCourses(club) {
  const listed = Array.isArray(club.courses) ? club.courses : [];

  if (listed.length > 0) {
    return listed;
  }

  const clubId = club.clubID || club.clubId || club.id;

  if (!clubId) {
    return [];
  }

  const details = await fetchGolfApiJson(`clubs/${clubId}`);

  return Array.isArray(details.courses) ? details.courses : [];
}

async function fetchGolfApiCourseBundle(courseId) {
  const cached = golfApiCourseCache.get(courseId);

  if (cached) {
    return cached;
  }

  const course = await fetchGolfApiJson(`courses/${courseId}`, { measureUnit: "yd" });
  const coordinatesResponse = await fetchGolfApiJson(`coordinates/${courseId}`).catch(error => {
    console.warn("Could not load GOLFAPI coordinates.", error);
    return {};
  });
  const bundle = {
    course: course,
    tees: Array.isArray(course.tees) ? course.tees : [],
    coordinates: Array.isArray(coordinatesResponse.coordinates) ? coordinatesResponse.coordinates : []
  };

  golfApiCourseCache.set(courseId, bundle);

  return bundle;
}

function getGolfApiCourseId(course) {
  return course.courseID || course.CourseID || course.courseId || "";
}

function getGolfApiCourseLabel(course, index) {
  return String(course.courseName || course.CourseName || `Course ${index + 1}`);
}

function getGolfApiTeeName(tee) {
  return String(tee.teeName || tee.TeeName || tee.name || "Unnamed tee");
}

function withCourseMeasureUnit(tee, course) {
  return {
    ...tee,
    measureUnit: tee.MeasureUnit || tee.measureUnit || course.measure || course.measureUnit || "yd"
  };
}

async function fetchGolfApiJson(resource, params) {
  const searchParams = new URLSearchParams();

  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.set(key, value);
    }
  });

  const query = searchParams.toString();
  const response = await fetch(`/api/golfapi/${resource}${query ? `?${query}` : ""}`);

  if (!response.ok) {
    throw await buildApiError(response, `GOLFAPI ${resource}`);
  }

  return response.json();
}

function chooseGolfApiCourse(courses) {
  if (!Array.isArray(courses) || courses.length === 0) {
    return {};
  }

  return courses.find(course => {
    return Number(course.numHoles || course.NumHoles || 0) === 18;
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
    return String(tee.teeName || tee.TeeName || "").toLowerCase().includes("white");
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
  const courseName = course.courseName || course.CourseName;

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

  const parsMen = Array.isArray(course.parsMen) ? course.parsMen : [];

  for (let hole = 1; hole <= totalHoles; hole++) {
    const par = Number(parsMen[hole - 1] || course[`Par${hole}`] || course[`par${hole}`] || 0);

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

function buildHoleTargetsFromGolfApiCoordinates(coordinates, totalHoles) {
  const targets = {};

  if (!Array.isArray(coordinates)) {
    return targets;
  }

  coordinates.forEach(point => {
    const hole = Number(point.hole ?? point.Hole);
    const poi = Number(point.poi ?? point.POI);

    if (poi !== 1 || !Number.isInteger(hole) || hole < 1 || hole > totalHoles) {
      return;
    }

    const location = Number(point.location ?? point.Location);
    const normalizedPoint = normalizeGolfApiCoordinatePoint(point);

    if (!normalizedPoint) {
      return;
    }

    if (!targets[hole]) {
      targets[hole] = createEmptyGreenTarget();
    }

    if (location === 1) {
      targets[hole].front = normalizedPoint;
    } else if (location === 2) {
      targets[hole].center = normalizedPoint;
    } else if (location === 3) {
      targets[hole].back = normalizedPoint;
    }
  });

  Object.keys(targets).forEach(hole => {
    if (!targets[hole].center || targets[hole].center.lat === null || targets[hole].center.lng === null) {
      delete targets[hole];
    }
  });

  return targets;
}

function buildHoleHazardsFromGolfApiCoordinates(coordinates, totalHoles) {
  const hazards = {};

  if (!Array.isArray(coordinates)) {
    return hazards;
  }

  coordinates.forEach((point, index) => {
    const hole = Number(point.hole ?? point.Hole);
    const poi = Number(point.poi ?? point.POI);

    if (poi === 1 || !Number.isInteger(hole) || hole < 1 || hole > totalHoles) {
      return;
    }

    const normalizedPoint = normalizeGolfApiCoordinatePoint(point);
    const hazardMeta = getGolfApiHazardMeta(point);

    if (!normalizedPoint || !hazardMeta) {
      return;
    }

    if (!hazards[hole]) {
      hazards[hole] = [];
    }

    hazards[hole].push({
      name: `${hazardMeta.label}${buildGolfApiSideLabel(point)}`,
      type: hazardMeta.type,
      lat: normalizedPoint.lat,
      lng: normalizedPoint.lng,
      source: "golfapi",
      golfApiId: `golfapi-${hole}-${poi}-${Number(point.location ?? point.Location ?? 0)}-${index}`
    });
  });

  return hazards;
}

function createEmptyGreenTarget() {
  return {
    front: {
      lat: null,
      lng: null
    },
    center: {
      lat: null,
      lng: null
    },
    back: {
      lat: null,
      lng: null
    }
  };
}

function normalizeGolfApiCoordinatePoint(point) {
  const lat = Number(point.latitude ?? point.Latitude);
  const lng = Number(point.longitude ?? point.Longitude);

  if (!isValidCoordinatePair(lat, lng)) {
    return null;
  }

  return {
    lat: lat,
    lng: lng
  };
}

function getGolfApiHazardMeta(point) {
  const poi = Number(point.poi ?? point.POI);

  const knownPoints = {
    2: {
      label: "Green bunker",
      type: "bunker"
    },
    3: {
      label: "Fairway bunker",
      type: "bunker"
    },
    4: {
      label: "Water",
      type: "water"
    },
    5: {
      label: "Trees",
      type: "trees"
    },
    6: {
      label: "Marker",
      type: "layup"
    },
    7: {
      label: "Marker",
      type: "layup"
    },
    8: {
      label: "Marker",
      type: "layup"
    },
    9: {
      label: "Dogleg",
      type: "dogleg"
    },
    10: {
      label: "Road",
      type: "other"
    },
    11: {
      label: "Tee front",
      type: "layup"
    },
    12: {
      label: "Tee back",
      type: "layup"
    }
  };

  return knownPoints[poi] || null;
}

function buildGolfApiSideLabel(point) {
  const side = Number(point.sideFW ?? point.SideFW ?? point.sideOfFairway ?? point.SideOfFairway);
  const labels = {
    1: " left",
    2: " center",
    3: " right"
  };

  return labels[side] || "";
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

async function saveCurrentCourseSetup() {
  if (!round.courseName) {
    notify("Start a round before saving a course setup.");
    return;
  }

  const hasGreenTargets = round.holeTargets && Object.keys(round.holeTargets).length > 0;
  const hasHazards = round.holeHazards && Object.keys(round.holeHazards).length > 0;

  if (!hasGreenTargets && !hasHazards) {
    const confirmed = await confirmAction(
      "This course has no green targets or hazards saved yet. Save it anyway?",
      "Save anyway"
    );

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
    const confirmed = await confirmAction(
      `${round.courseName} is already saved. Replace that setup?`,
      "Replace"
    );

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
    notify("There are no saved courses to export.");
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
  if (file.size > MAX_COURSE_IMPORT_BYTES) {
    notify("That course file is too large. Choose a JSON file smaller than 2 MB.");
    event.target.value = "";
    return;
  }

  const reader = new FileReader();

  reader.onload = function (loadEvent) {
    try {
      const importedText = loadEvent.target.result;
      const importedJson = JSON.parse(importedText);

      const importedCourses = getCoursesFromImportedJson(importedJson).slice(0, 200);

      if (importedCourses.length === 0) {
        notify("No courses were found in that file.");
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
        notify("No valid courses were found in that file.");
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

      notify(`Import complete. Added ${addedCount} course(s), replaced ${replacedCount} course(s).`);
    } catch (error) {
      notify("The selected file could not be imported. Make sure it is a valid JSON file.");
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

  if (!isPlainRecord(importedJson)) {
    return [];
  }

  if (Array.isArray(importedJson.courses)) {
    return importedJson.courses;
  }

  if (importedJson.courseName) {
    return [importedJson];
  }

  return [];
}

function normalizeImportedCourse(course, index) {
  if (!isPlainRecord(course)) {
    return null;
  }

  const courseName = String(course.courseName || course.name || course.title || "").trim().slice(0, 160);
  const totalHoles = Number(course.totalHoles || course.holes || 18);
  const importedId = String(course.id || "").trim().slice(0, 120);

  if (!courseName || (totalHoles !== 9 && totalHoles !== 18)) {
    return null;
  }

  return {
    id: importedId || `${Date.now()}-${index}`,
    courseName,
    teeName: String(course.teeName || "").trim().slice(0, 120),
    totalHoles,
    holeTargets: normalizeImportedHoleTargets(course.holeTargets || {}, totalHoles),
    holeHazards: normalizeImportedHoleHazards(course.holeHazards || {}, totalHoles),
    holePars: normalizeImportedHolePars(course.holePars || course.pars || {}, totalHoles),
    holeLengths: normalizeImportedHoleLengths(course.holeLengths || course.lengths || course.yardages || {}, totalHoles),
    source: String(course.source || "imported").trim().slice(0, 40),
    savedAt: new Date().toISOString()
  };
}

function normalizeImportedHoleLengths(rawLengths, totalHoles) {
  const normalizedLengths = {};

  if (!isPlainRecord(rawLengths)) {
    return normalizedLengths;
  }

  for (let hole = 1; hole <= totalHoles; hole++) {
    const length = Number(rawLengths[hole]);

    if (Number.isFinite(length) && length > 0 && length <= 1000) {
      normalizedLengths[hole] = Math.round(length);
    }
  }

  return normalizedLengths;
}

function normalizeImportedHolePars(rawPars, totalHoles) {
  const normalizedPars = createDefaultPars(totalHoles);

  if (!isPlainRecord(rawPars)) {
    return normalizedPars;
  }

  for (const key of Object.keys(rawPars)) {
    const hole = normalizeHoleNumber(key, totalHoles);
    const par = Number(rawPars[key]);

    if (hole && Number.isInteger(par) && par >= 3 && par <= 6) {
      normalizedPars[hole] = par;
    }
  }

  return normalizedPars;
}

function normalizeImportedHoleTargets(rawTargets, totalHoles = 18) {
  const normalizedTargets = {};

  if (!isPlainRecord(rawTargets)) {
    return normalizedTargets;
  }

  for (const key of Object.keys(rawTargets)) {
    const hole = normalizeHoleNumber(key, totalHoles);
    const target = rawTargets[key];

    if (!hole || !isPlainRecord(target)) {
      continue;
    }

    // Older/simple format:
    // "1": { "lat": 35.2, "lng": -97.4 }
    if (target.lat !== undefined && target.lng !== undefined) {
      const center = normalizePoint(target);

      if (center) {
        normalizedTargets[hole] = {
          front: { lat: null, lng: null },
          center,
          back: { lat: null, lng: null }
        };
      }

      continue;
    }

    const front = normalizePoint(target.front);
    const center = normalizePoint(target.center);
    const back = normalizePoint(target.back);

    if (center) {
      normalizedTargets[hole] = {
        front: front || { lat: null, lng: null },
        center,
        back: back || { lat: null, lng: null }
      };
    }
  }

  return normalizedTargets;
}

function normalizeImportedHoleHazards(rawHazards, totalHoles = 18) {
  const normalizedHazards = {};

  if (!isPlainRecord(rawHazards)) {
    return normalizedHazards;
  }

  for (const key of Object.keys(rawHazards)) {
    const hole = normalizeHoleNumber(key, totalHoles);
    const hazards = rawHazards[key];

    if (!hole || !Array.isArray(hazards)) {
      continue;
    }

    normalizedHazards[hole] = [];

    hazards.slice(0, 30).forEach(hazard => {
      if (!isPlainRecord(hazard)) {
        return;
      }

      const point = normalizePoint(hazard);

      if (!point) {
        return;
      }

      const type = String(hazard.type || "");
      normalizedHazards[hole].push({
        name: String(hazard.name || "Unnamed target").trim().slice(0, 80),
        type: HAZARD_TYPES.has(type) ? type : "other",
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

function isPlainRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function normalizeHoleNumber(value, totalHoles = 18) {
  const hole = Number(value);
  return Number.isInteger(hole) && hole >= 1 && hole <= totalHoles ? hole : null;
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
    notify("Please enter a par between 3 and 6.");
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
    return "Length not loaded";
  }

  return formatDistance(length);
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
// Server Access Code
// -------------------------------

async function saveAccessCodeFromSettings() {
  const value = accessCodeInput.value.trim();

  if (!value) {
    accessCodeStatus.textContent = "Enter the access code before saving.";
    return;
  }

  accessCodeStatus.textContent = "Checking access code...";

  try {
    const response = await fetch("/api/access", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: value })
    });
    const body = await response.json().catch(function () {
      return {};
    });

    if (!response.ok) {
      accessCodeStatus.textContent = body.error || "That access code could not be accepted.";
      return;
    }

    accessCodeInput.value = "";
    serverAccessGranted = true;
    renderAccessCodeSettings();
    await checkServerAccessRequirement();
  } catch {
    accessCodeStatus.textContent = "Could not reach the server. Try again when you are online.";
  }
}

async function clearAccessCode() {
  accessCodeInput.value = "";

  try {
    await fetch("/api/access", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clear: true })
    });
  } catch {
    // The local UI can still forget access until the next health check.
  }

  serverAccessGranted = false;
  renderAccessCodeSettings();
  checkServerAccessRequirement();
}

function renderAccessCodeSettings() {
  accessCodeStatus.textContent = serverAccessGranted
    ? "Access is enabled on this device."
    : "Access is not enabled on this device.";
}

async function checkServerAccessRequirement() {
  try {
    const response = await fetch("/api/health");
    const health = await response.json();

    serverRequiresAccessCode = Boolean(health.accessTokenRequired);
    serverAccessGranted = Boolean(health.accessGranted);
    accountsEnabled = Boolean(health.accountsEnabled);
    renderAccessCodeSettings();
    await refreshAccountState();
    syncAccountData(false);
    renderPausedState(Boolean(health.paused));

    if (!serverRequiresAccessCode) {
      accessCodeHint.textContent = "This server does not require an access code right now.";
      return;
    }

    accessCodeHint.textContent = serverAccessGranted
      ? "This server requires an access code, and access is enabled on this device."
      : "This server requires an access code. Voice and course lookups will not work until you enable access here.";
  } catch {
    accessCodeHint.textContent = "Could not reach the server to check whether an access code is required.";
  }
}

function renderPausedState(paused) {
  serverPaused = paused;

  if (!offlineBanner) {
    return;
  }

  if (paused) {
    offlineBanner.textContent = "Caddie service paused — scoring, the scorecard, and saved courses still work.";
    offlineBanner.classList.remove("hidden");
    return;
  }

  offlineBanner.textContent = "Offline — the caddie is using on-device handling only.";
  renderConnectionState();
}

// -------------------------------
// Personal Club Distances
// -------------------------------

function getClubProfile() {
  if (clubProfileCache) {
    return clubProfileCache;
  }

  let stored = null;

  try {
    stored = JSON.parse(localStorage.getItem(CLUB_PROFILE_STORAGE_KEY) || "null");
  } catch {
    stored = null;
  }

  const rawClubs = stored && Array.isArray(stored.clubs) ? stored.clubs : [];
  const clubs = rawClubs
    .map(entry => ({
      club: normalizeClubName(entry.club),
      carryYards: Number(entry.carryYards)
    }))
    .filter(entry => entry.club && isValidCarryDistance(entry.carryYards));

  clubProfileCache = {
    clubs: clubs.sort((a, b) => b.carryYards - a.carryYards),
    updatedAt: stored && stored.updatedAt ? stored.updatedAt : null
  };

  return clubProfileCache;
}

function saveClubProfile(clubs) {
  const profile = {
    clubs: clubs,
    updatedAt: new Date().toISOString()
  };

  localStorage.setItem(CLUB_PROFILE_STORAGE_KEY, JSON.stringify(profile));
  clubProfileCache = null;
}

function isValidCarryDistance(value) {
  return Number.isFinite(value) && value >= 20 && value <= 400;
}

function normalizeClubName(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function renderClubProfileEditor() {
  const profile = getClubProfile();

  clubDistanceList.innerHTML = "";

  const rows = profile.clubs.length > 0
    ? profile.clubs
    : DEFAULT_CLUB_DISTANCES.map(entry => ({ club: entry.club, carryYards: "" }));

  rows.forEach(row => {
    addClubDistanceRow(row);
  });

  renderClubProfileStatus();
}

function addClubDistanceRow(row) {
  const wrapper = document.createElement("div");
  wrapper.className = "club-distance-row";

  const clubField = document.createElement("input");
  clubField.type = "text";
  clubField.className = "club-distance-name";
  clubField.placeholder = "Club";
  clubField.value = row.club || "";

  const carryField = document.createElement("input");
  carryField.type = "number";
  carryField.className = "club-distance-yards";
  carryField.min = "20";
  carryField.max = "400";
  carryField.placeholder = "Yards";
  carryField.value = row.carryYards === "" || row.carryYards === undefined ? "" : String(row.carryYards);

  const removeButton = document.createElement("button");
  removeButton.type = "button";
  removeButton.className = "icon-button danger";
  removeButton.textContent = "×";
  removeButton.setAttribute("aria-label", "Remove club");
  removeButton.addEventListener("click", function () {
    wrapper.remove();
  });

  wrapper.appendChild(clubField);
  wrapper.appendChild(carryField);
  wrapper.appendChild(removeButton);
  clubDistanceList.appendChild(wrapper);
}

function saveClubProfileFromSettings() {
  const rows = Array.from(clubDistanceList.querySelectorAll(".club-distance-row"));
  const clubs = [];
  let rejected = 0;

  rows.forEach(row => {
    const club = normalizeClubName(row.querySelector(".club-distance-name").value);
    const carryText = row.querySelector(".club-distance-yards").value.trim();

    if (carryText === "") {
      return;
    }

    const carryYards = Number(carryText);

    if (!club || !isValidCarryDistance(carryYards)) {
      rejected += 1;
      return;
    }

    clubs.push({ club: club, carryYards: Math.round(carryYards) });
  });

  saveClubProfile(clubs.sort((a, b) => b.carryYards - a.carryYards));
  renderShotClubOptions();
  renderClubProfileStatus();

  if (rejected > 0) {
    clubProfileStatus.textContent += ` ${rejected} row${rejected === 1 ? "" : "s"} skipped: each club needs a name and a carry between 20 and 400 yards.`;
  }
}

function clearClubProfile() {
  localStorage.removeItem(CLUB_PROFILE_STORAGE_KEY);
  clubProfileCache = null;
  renderClubProfileEditor();
  renderShotClubOptions();
}

function renderClubProfileStatus() {
  const profile = getClubProfile();
  const learned = getLearnedClubDistances();
  const learnedCount = Object.keys(learned).length;

  if (profile.clubs.length === 0) {
    clubProfileStatus.textContent = learnedCount > 0
      ? `No saved club distances yet, but ${learnedCount} club${learnedCount === 1 ? " has" : "s have"} learned distances from your shot log.`
      : "No personal club distances saved yet.";
    return;
  }

  const learnedText = learnedCount > 0
    ? ` ${learnedCount} club${learnedCount === 1 ? " also has" : "s also have"} learned distances from your shot log.`
    : "";

  clubProfileStatus.textContent = `${profile.clubs.length} club distance${profile.clubs.length === 1 ? "" : "s"} saved.${learnedText}`;
}

function getEffectiveClubDistances() {
  const learned = getLearnedClubDistances();
  const byClub = new Map();

  getClubProfile().clubs.forEach(entry => {
    byClub.set(entry.club, {
      club: entry.club,
      carryYards: entry.carryYards,
      source: "saved",
      shots: 0
    });
  });

  Object.values(learned).forEach(entry => {
    byClub.set(entry.club, {
      club: entry.club,
      carryYards: entry.carryYards,
      source: "learned",
      shots: entry.shots
    });
  });

  return Array.from(byClub.values()).sort((a, b) => b.carryYards - a.carryYards);
}

function chooseClubFromPersonalDistances(distanceYards) {
  const clubs = getEffectiveClubDistances();

  if (clubs.length === 0) {
    return null;
  }

  const enough = clubs.filter(entry => entry.carryYards >= distanceYards);
  const choice = enough.length > 0 ? enough[enough.length - 1] : clubs[0];

  return choice;
}

// -------------------------------
// Shot Log and Learning
// -------------------------------

function getShotLog() {
  if (shotLogCache) {
    return shotLogCache;
  }

  try {
    const stored = JSON.parse(localStorage.getItem(SHOT_LOG_STORAGE_KEY) || "[]");

    shotLogCache = Array.isArray(stored) ? stored : [];
  } catch {
    shotLogCache = [];
  }

  return shotLogCache;
}

function saveShotLog(shots) {
  const trimmed = shots.slice(-SHOT_LOG_LIMIT);

  localStorage.setItem(SHOT_LOG_STORAGE_KEY, JSON.stringify(trimmed));
  shotLogCache = trimmed;
  learnedClubCache = null;
}

function logShotFromForm() {
  const club = normalizeClubName(shotClubInput.value);
  const entered = Math.round(Number(shotDistanceInput.value));

  if (!club) {
    shotLogStatus.textContent = "Enter the club you hit.";
    return;
  }

  if (!Number.isFinite(entered) || entered < 1 || entered > 400) {
    shotLogStatus.textContent = `Enter the shot distance in ${unitLabel(true)}, between 1 and 400.`;
    return;
  }

  const distanceYards = getUnitPreference() === "meters" ? Math.round(entered / 0.9144) : entered;
  const shots = getShotLog().slice();

  shots.push({
    time: new Date().toISOString(),
    courseName: round.courseName || "",
    hole: round.currentHole || 1,
    par: getHolePar(round.currentHole || 1),
    club: club,
    distanceYards: distanceYards,
    result: shotResultInput.value,
    lie: shotLieInput.value,
    direction: shotDirectionInput ? shotDirectionInput.value : "straight"
  });

  buzz();

  saveShotLog(shots);

  shotDistanceInput.value = "";
  renderShotLogStatus();
  renderShotHistorySummary();
  renderClubProfileStatus();
  renderShotClubOptions();
}

// Logging a shot by voice keeps the golfer's hands on the club. The spoken
// distance is always yards, because that is how the caddie and the agent talk
// about shots regardless of the display unit preference.
function executeAgentLogShot(result) {
  const club = normalizeClubName(result.payload.club || "");
  const distanceYards = Math.round(Number(result.payload.distanceYards || 0));

  if (!club) {
    showVoiceAgentMessage(
      result.message || "Tell me the club too, like: log a seven iron, one sixty five.",
      true
    );
    return true;
  }

  if (!Number.isFinite(distanceYards) || distanceYards < 1 || distanceYards > 400) {
    showVoiceAgentMessage(
      `How far did that ${club} go? Say something like: log a ${club}, one fifty.`,
      true
    );
    return true;
  }

  const lie = LIE_ADJUSTMENTS[result.payload.shotLie] ? result.payload.shotLie : (shotLieInput ? shotLieInput.value : "fairway");
  // The shot log stores "good" for a shot that came off as planned, and only
  // those shots teach a club distance, so the agent's wording is mapped here.
  const shotResult = SPOKEN_SHOT_RESULTS[result.payload.shotResult] || "good";
  const shots = getShotLog().slice();

  shots.push({
    time: new Date().toISOString(),
    courseName: round.courseName || "",
    hole: round.currentHole || 1,
    par: getHolePar(round.currentHole || 1),
    club: club,
    distanceYards: distanceYards,
    result: shotResult,
    lie: lie,
    direction: result.payload.shotDirection || "straight"
  });

  buzz();
  saveShotLog(shots);
  renderShotLogStatus();
  renderShotHistorySummary();
  renderClubProfileStatus();
  renderShotClubOptions();

  const learned = getEffectiveClubDistances().find(entry => entry.club === club);
  const learnedNote = learned && learned.source === "learned"
    ? ` Your ${club} is averaging ${learned.carryYards} yards over ${learned.shots} logged shots.`
    : "";

  showVoiceAgentMessage(`Logged: ${club}, ${distanceYards} yards, hole ${round.currentHole}.${learnedNote}`, result.speak);
  return true;
}

async function fillShotDistanceFromGps() {
  const target = getCurrentHoleTarget();

  if (!target || target.center.lat === null || target.center.lng === null) {
    shotLogStatus.textContent = "Save a center-green target for this hole before using GPS distance.";
    return;
  }

  if (!navigator.geolocation) {
    shotLogStatus.textContent = "This browser cannot provide GPS distance.";
    return;
  }

  shotLogStatus.textContent = "Getting GPS distance...";

  try {
    const position = await getCurrentPositionForCaddie();
    const yardages = calculateGreenYardages(position.coords.latitude, position.coords.longitude, target);
    const distance = yardages.center || yardages.front || yardages.back;

    if (!distance) {
      shotLogStatus.textContent = "No usable GPS distance for this hole yet.";
      return;
    }

    shotDistanceInput.value = String(distance);
    shotLogStatus.textContent = `GPS distance to the center of the green: ${distance} yards.`;
  } catch (error) {
    shotLogStatus.textContent = getLocationErrorMessage(error);
  }
}

function getLearnedClubDistances() {
  if (learnedClubCache) {
    return learnedClubCache;
  }

  const byClub = Object.create(null);

  getShotLog().forEach(shot => {
    const club = normalizeClubName(shot.club);
    const distance = Number(shot.distanceYards);

    if (!club || !Number.isFinite(distance) || shot.result !== "good") {
      return;
    }

    if (!byClub[club]) {
      byClub[club] = [];
    }

    byClub[club].push(distance);
  });

  learnedClubCache = {};

  Object.entries(byClub).forEach(([club, distances]) => {
    if (distances.length < MIN_SHOTS_FOR_LEARNED_CLUB) {
      return;
    }

    learnedClubCache[club] = {
      club: club,
      carryYards: median(distances),
      shots: distances.length
    };
  });

  return learnedClubCache;
}

function median(values) {
  const sorted = values.slice().sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 1) {
    return Math.round(sorted[middle]);
  }

  return Math.round((sorted[middle - 1] + sorted[middle]) / 2);
}

function renderShotLogStatus() {
  const currentHole = round.currentHole || 1;
  const shotsThisHole = getShotLog().filter(shot => {
    return shot.courseName === round.courseName && Number(shot.hole) === Number(currentHole);
  });

  shotLogStatus.textContent = shotsThisHole.length === 0
    ? "No shots logged on this hole yet."
    : shotsThisHole.map(shot => `${shot.club} ${shot.distanceYards}y`).join(", ");
}

function renderShotHistorySummary() {
  const shots = getShotLog();

  if (shots.length === 0) {
    shotHistorySummary.textContent = "No shots logged yet.";
    return;
  }

  const learned = getLearnedClubDistances();
  const learnedRows = Object.values(learned)
    .sort((a, b) => b.carryYards - a.carryYards)
    .map(entry => `${entry.club}: ${entry.carryYards} yards from ${entry.shots} shots`);

  shotHistorySummary.textContent = learnedRows.length === 0
    ? `${shots.length} shot${shots.length === 1 ? "" : "s"} logged. A club needs ${MIN_SHOTS_FOR_LEARNED_CLUB} shots marked "as planned" before it is learned.`
    : `${shots.length} shot${shots.length === 1 ? "" : "s"} logged. Learned: ${learnedRows.join("; ")}.`;
}

function renderShotClubOptions() {
  const names = new Set();

  getEffectiveClubDistances().forEach(entry => names.add(entry.club));
  DEFAULT_CLUB_DISTANCES.forEach(entry => names.add(entry.club));

  shotClubOptions.innerHTML = "";

  names.forEach(name => {
    const option = document.createElement("option");
    option.value = name;
    shotClubOptions.appendChild(option);
  });
}

function exportShotLog() {
  const shots = getShotLog();

  if (shots.length === 0) {
    shotHistorySummary.textContent = "There are no shots to export yet.";
    return;
  }

  const blob = new Blob([JSON.stringify({ shots: shots }, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `golf-shot-log-${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

async function clearShotLog() {
  const confirmed = await confirmAction(
    "Clear every logged shot? Learned club distances will be removed.",
    "Clear shots"
  );

  if (!confirmed) {
    return;
  }

  localStorage.removeItem(SHOT_LOG_STORAGE_KEY);
  shotLogCache = null;
  learnedClubCache = null;
  renderShotHistorySummary();
  renderShotLogStatus();
  renderClubProfileStatus();
}

// -------------------------------
// Feedback: toasts, confirms, haptics
// -------------------------------

function notify(text) {
  if (!toastElement || !text) {
    return;
  }

  toastElement.textContent = text;
  toastElement.classList.remove("hidden");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(function () {
    toastElement.classList.add("hidden");
  }, 3800);
}

function confirmAction(message, acceptLabel = "Confirm") {
  if (!confirmOverlay) {
    return Promise.resolve(true);
  }

  confirmText.textContent = message;
  confirmAcceptBtn.textContent = acceptLabel;
  confirmOverlay.classList.remove("hidden");

  return new Promise(resolve => {
    pendingConfirm = resolve;
  });
}

function closeConfirm(result) {
  if (confirmOverlay) {
    confirmOverlay.classList.add("hidden");
  }

  if (pendingConfirm) {
    const resolve = pendingConfirm;
    pendingConfirm = null;
    resolve(result);
  }
}

function buzz(pattern = 12) {
  if (navigator.vibrate) {
    navigator.vibrate(pattern);
  }
}

// -------------------------------
// Units
// -------------------------------

function getUnitPreference() {
  try {
    return localStorage.getItem(UNIT_STORAGE_KEY) === "meters" ? "meters" : "yards";
  } catch {
    return "yards";
  }
}

function setUnitPreference(unit) {
  localStorage.setItem(UNIT_STORAGE_KEY, unit === "meters" ? "meters" : "yards");
  renderCurrentHole();
  renderShotHistorySummary();
  renderClubProfileStatus();
  renderUnitPreference();
  clearYardageReadouts();
  notify(`Distances now shown in ${unitLabel(true)}.`);
}

function unitLabel(plural = false) {
  if (getUnitPreference() === "meters") {
    return plural ? "meters" : "meter";
  }

  return plural ? "yards" : "yard";
}

function fromYards(yards) {
  const value = Number(yards);

  if (!Number.isFinite(value)) {
    return null;
  }

  return getUnitPreference() === "meters" ? Math.round(value * 0.9144) : Math.round(value);
}

function formatDistance(yards) {
  const converted = fromYards(yards);

  return converted === null ? "" : `${converted} ${unitLabel(true)}`;
}

// -------------------------------
// Screen wake lock
// -------------------------------

async function requestWakeLock() {
  if (!("wakeLock" in navigator) || wakeLock) {
    return;
  }

  try {
    wakeLock = await navigator.wakeLock.request("screen");
    wakeLock.addEventListener("release", function () {
      wakeLock = null;
    });
  } catch {
    wakeLock = null;
  }
}

function releaseWakeLock() {
  if (wakeLock) {
    wakeLock.release().catch(function () {});
    wakeLock = null;
  }
}

function syncWakeLock() {
  if (round.players.length > 0 && document.visibilityState === "visible") {
    requestWakeLock();
  } else {
    releaseWakeLock();
  }
}

// -------------------------------
// Connectivity
// -------------------------------

function isOnline() {
  return navigator.onLine !== false;
}

function renderConnectionState() {
  if (offlineBanner) {
    offlineBanner.classList.toggle("hidden", isOnline());
  }
}

// -------------------------------
// Location warming
// -------------------------------

function startLocationWatch() {
  if (!navigator.geolocation || locationWatchId !== null) {
    return;
  }

  locationWatchId = navigator.geolocation.watchPosition(
    function (position) {
      lastPosition = position;
    },
    function () {},
    { enableHighAccuracy: true, timeout: 20000, maximumAge: 5000 }
  );
}

function stopLocationWatch() {
  if (locationWatchId !== null) {
    navigator.geolocation.clearWatch(locationWatchId);
    locationWatchId = null;
  }
}

function getFreshCachedPosition() {
  if (!lastPosition) {
    return null;
  }

  return Date.now() - lastPosition.timestamp < POSITION_MAX_AGE_MS ? lastPosition : null;
}

function getAccuracyNote(position) {
  const accuracy = position && position.coords ? Number(position.coords.accuracy) : NaN;

  if (!Number.isFinite(accuracy)) {
    return { weak: false, text: "" };
  }

  const converted = fromYards(accuracy / 0.9144);

  return {
    weak: accuracy > WEAK_ACCURACY_METERS,
    text: `±${converted} ${unitLabel(true)} GPS accuracy`
  };
}

// -------------------------------
// Glance view
// -------------------------------

// One screen a golfer can read without touching the phone: the hole, the
// number that matters, and the club. It redraws from the GPS watch that the
// round already runs, so it adds no extra location work of its own.
function openGlanceView() {
  if (round.players.length === 0) {
    notify("Start a round first.");
    return;
  }

  showAppScreen("glance");
}

function startGlanceRefresh() {
  stopGlanceRefresh();
  startLocationWatch();
  requestWakeLock();
  renderGlance();
  glanceTimer = setInterval(renderGlance, 2000);
}

function stopGlanceRefresh() {
  if (glanceTimer !== null) {
    clearInterval(glanceTimer);
    glanceTimer = null;
  }
}

function renderGlance() {
  if (!glanceSection || glanceSection.classList.contains("hidden")) {
    return;
  }

  const hole = round.currentHole || 1;

  glanceHole.textContent = String(hole);
  glancePar.textContent = `Par ${getHolePar(hole)}`;
  glanceUnit.textContent = `${unitLabel(true)} to center`;

  const target = getCurrentHoleTarget();
  const hasTarget = Boolean(target && target.center.lat !== null && target.center.lng !== null);
  const position = getFreshCachedPosition() || lastPosition;

  if (!hasTarget) {
    setGlanceDistances(null, null, null);
    glanceClub.textContent = "—";
    glanceClubReason.textContent = "Save a green target for this hole to get a club call.";
    glanceStatus.textContent = "No green target saved for this hole.";
    glanceStatus.classList.remove("weak");
    return;
  }

  if (!position) {
    setGlanceDistances(null, null, null);
    glanceClub.textContent = "—";
    glanceClubReason.textContent = "Waiting for a GPS fix.";
    glanceStatus.textContent = navigator.geolocation
      ? "Waiting for GPS…"
      : "This browser cannot provide GPS.";
    glanceStatus.classList.remove("weak");
    return;
  }

  const yardages = calculateGreenYardages(position.coords.latitude, position.coords.longitude, target);
  const center = yardages.center || yardages.front || yardages.back;

  setGlanceDistances(center, yardages.front, yardages.back);
  renderGlanceClub(center);

  const accuracy = getAccuracyNote(position);
  const ageSeconds = Math.max(0, Math.round((Date.now() - position.timestamp) / 1000));

  glanceStatus.classList.toggle("weak", accuracy.weak);
  glanceStatus.textContent = accuracy.weak
    ? `Weak GPS, ${accuracy.text}`
    : `${accuracy.text} · updated ${ageSeconds}s ago`;
}

function setGlanceDistances(center, front, back) {
  glanceDistance.textContent = center === null || center === undefined ? "—" : String(fromYards(center));
  glanceFront.textContent = front === null || front === undefined ? "—" : String(fromYards(front));
  glanceBack.textContent = back === null || back === undefined ? "—" : String(fromYards(back));
}

// The club here is the same call the caddie would make, conditions included,
// but it never blocks the display: whatever conditions are already cached get
// used, and nothing is fetched while the screen is being read.
function renderGlanceClub(distanceYards) {
  if (!distanceYards) {
    glanceClub.textContent = "—";
    glanceClubReason.textContent = "No distance yet.";
    return;
  }

  const conditions = conditionsCache && Date.now() - conditionsCache.time < CONDITIONS_MAX_AGE_MS
    ? conditionsCache.value
    : null;
  const target = getCurrentHoleTarget();
  const position = getFreshCachedPosition() || lastPosition;
  const bearing = conditions && position && target && target.center.lat !== null
    ? calculateBearing(position.coords.latitude, position.coords.longitude, target.center.lat, target.center.lng)
    : null;
  const lie = shotLieInput ? shotLieInput.value : "fairway";
  const playing = computePlayingDistance(distanceYards, conditions, bearing, lie);
  const personal = chooseClubFromPersonalDistances(playing.playingYards);

  glanceClub.textContent = personal ? personal.club : chooseDefaultClubForDistance(playing.playingYards);

  if (playing.adjustments.length > 0) {
    glanceClubReason.textContent = `Plays ${formatDistance(playing.playingYards)} · ${playing.adjustments.map(item => item.label).join(", ")}`;
    return;
  }

  glanceClubReason.textContent = personal
    ? personal.source === "learned"
      ? `Your logged ${personal.club}: ${personal.carryYards} yards`
      : `Your saved ${personal.club}: ${personal.carryYards} yards`
    : "General club chart. Add your distances in Settings.";
}

// -------------------------------
// Round history
// -------------------------------

function getRoundHistory() {
  if (roundHistoryCache) {
    return roundHistoryCache;
  }

  try {
    const stored = JSON.parse(localStorage.getItem(ROUND_HISTORY_STORAGE_KEY) || "[]");

    roundHistoryCache = Array.isArray(stored) ? stored : [];
  } catch {
    roundHistoryCache = [];
  }

  return roundHistoryCache;
}

function saveRoundHistory(rounds) {
  const trimmed = rounds.slice(-ROUND_HISTORY_LIMIT);

  localStorage.setItem(ROUND_HISTORY_STORAGE_KEY, JSON.stringify(trimmed));
  roundHistoryCache = trimmed;
}

function roundHasScores() {
  return round.players.some(player => Object.keys(round.scores[player] || {}).length > 0);
}

function archiveCurrentRound() {
  if (round.players.length === 0 || !roundHasScores()) {
    return false;
  }

  const signature = JSON.stringify(round.scores);

  if (round.archivedSignature === signature) {
    return false;
  }

  round.archivedSignature = signature;

  const history = getRoundHistory().slice();

  history.push({
    id: `round-${Date.now()}`,
    finishedAt: new Date().toISOString(),
    courseName: round.courseName,
    totalHoles: round.totalHoles,
    players: round.players.slice(),
    scores: deepCopy(round.scores),
    holePars: deepCopy(round.holePars || {}),
    holeStats: deepCopy(round.holeStats || {}),
    totals: round.players.map(player => ({
      name: player,
      total: getPlayerTotal(player),
      toPar: getPlayerToPar(player),
      putts: getPlayerPuttTotal(player),
      fairways: getPlayerFairwayCount(player),
      greens: getPlayerGreenCount(player)
    }))
  });

  saveRoundHistory(history);
  renderRoundHistory();
  return true;
}

function renderRoundHistory() {
  if (!roundHistoryList) {
    return;
  }

  const history = getRoundHistory().slice().reverse().slice(0, 5);

  roundHistoryList.innerHTML = "";

  if (history.length === 0) {
    roundHistoryList.textContent = "No finished rounds yet.";
    return;
  }

  history.forEach(entry => {
    const item = document.createElement("div");
    item.className = "history-item";

    const leader = (entry.totals || [])
      .filter(total => total.total > 0)
      .sort((a, b) => a.total - b.total)[0];
    const date = new Date(entry.finishedAt);

    const title = document.createElement("strong");
    title.textContent = entry.courseName || "Unnamed course";

    const detail = document.createElement("span");
    detail.textContent = leader
      ? `${date.toLocaleDateString()} · ${entry.totalHoles} holes · ${leader.name} ${leader.total} (${formatToPar(leader.toPar)})`
      : `${date.toLocaleDateString()} · ${entry.totalHoles} holes`;

    item.appendChild(title);
    item.appendChild(detail);
    roundHistoryList.appendChild(item);
  });
}

// -------------------------------
// Round statistics
// -------------------------------

// Statistics follow the account holder. Each stored round is searched for that
// name; rounds played before an identity was saved fall back to the first
// player, which is how those rounds were recorded.
function findMyNameInRound(entry, golfer) {
  const players = Array.isArray(entry.players) ? entry.players : [];

  if (golfer) {
    return players.find(player => player.toLowerCase() === golfer.toLowerCase()) || "";
  }

  return players[0] || "";
}

function summarizeRoundForPlayer(entry, player) {
  const scores = (entry.scores && entry.scores[player]) || {};
  const stats = (entry.holeStats && entry.holeStats[player]) || {};
  const pars = entry.holePars || {};
  const summary = {
    id: entry.id,
    finishedAt: entry.finishedAt,
    courseName: entry.courseName || "Unnamed course",
    holesScored: 0,
    strokes: 0,
    par: 0,
    putts: 0,
    holesWithPutts: 0,
    fairwaysHit: 0,
    fairwayChances: 0,
    greensHit: 0,
    greenChances: 0,
    byPar: {}
  };

  for (let hole = 1; hole <= (Number(entry.totalHoles) || 18); hole++) {
    const score = Number(scores[hole]);
    const holeStats = stats[hole];
    const par = Number(pars[hole]) || 4;

    if (Number.isInteger(score) && score > 0) {
      summary.holesScored += 1;
      summary.strokes += score;
      summary.par += par;

      if (!summary.byPar[par]) {
        summary.byPar[par] = { holes: 0, strokes: 0, par: 0 };
      }

      summary.byPar[par].holes += 1;
      summary.byPar[par].strokes += score;
      summary.byPar[par].par += par;
    }

    if (holeStats && typeof holeStats === "object") {
      if (Number.isFinite(Number(holeStats.putts))) {
        summary.putts += Number(holeStats.putts);
        summary.holesWithPutts += 1;
      }

      // A par 3 is not a driving hole, so it never counts as a fairway chance.
      if (typeof holeStats.fairway === "boolean" && par >= 4) {
        summary.fairwayChances += 1;
        summary.fairwaysHit += holeStats.fairway ? 1 : 0;
      }

      if (typeof holeStats.gir === "boolean") {
        summary.greenChances += 1;
        summary.greensHit += holeStats.gir ? 1 : 0;
      }
    }
  }

  summary.toPar = summary.strokes - summary.par;
  return summary;
}

function computeRoundStatistics() {
  const history = getRoundHistory();
  const golfer = getGolferName();
  const named = history
    .map(entry => ({ entry, player: findMyNameInRound(entry, golfer) }))
    .filter(item => item.player !== "");

  const player = golfer || (named.length > 0 ? named[named.length - 1].player : "");

  const rounds = named
    .map(item => summarizeRoundForPlayer(item.entry, item.player))
    .filter(summary => summary.holesScored > 0)
    .sort((a, b) => new Date(a.finishedAt) - new Date(b.finishedAt));

  if (rounds.length === 0) {
    return { player, rounds: [] };
  }

  const totals = rounds.reduce((acc, item) => {
    acc.holesScored += item.holesScored;
    acc.strokes += item.strokes;
    acc.par += item.par;
    acc.putts += item.putts;
    acc.holesWithPutts += item.holesWithPutts;
    acc.fairwaysHit += item.fairwaysHit;
    acc.fairwayChances += item.fairwayChances;
    acc.greensHit += item.greensHit;
    acc.greenChances += item.greenChances;
    return acc;
  }, {
    holesScored: 0,
    strokes: 0,
    par: 0,
    putts: 0,
    holesWithPutts: 0,
    fairwaysHit: 0,
    fairwayChances: 0,
    greensHit: 0,
    greenChances: 0
  });

  // Rounds of different lengths cannot be averaged directly, so every round is
  // scaled to an 18-hole equivalent before comparison.
  const scaled = rounds.map(item => ({
    ...item,
    per18Strokes: (item.strokes / item.holesScored) * 18,
    per18ToPar: (item.toPar / item.holesScored) * 18,
    per18Putts: item.holesWithPutts > 0 ? (item.putts / item.holesWithPutts) * 18 : null
  }));

  const complete = scaled.filter(item => item.holesScored >= 9);
  const recent = scaled.slice(-5);
  const previous = scaled.slice(-10, -5);
  const puttingRounds = scaled.filter(item => item.per18Putts !== null);

  const byPar = {};

  rounds.forEach(item => {
    Object.keys(item.byPar).forEach(par => {
      if (!byPar[par]) {
        byPar[par] = { holes: 0, strokes: 0, par: 0 };
      }

      byPar[par].holes += item.byPar[par].holes;
      byPar[par].strokes += item.byPar[par].strokes;
      byPar[par].par += item.byPar[par].par;
    });
  });

  return {
    player,
    rounds: scaled,
    roundsCounted: scaled.length,
    holesScored: totals.holesScored,
    scoringAverage: (totals.strokes / totals.holesScored) * 18,
    averageToPar: (totals.strokes - totals.par) / totals.holesScored * 18,
    bestRound: complete.length > 0
      ? complete.slice().sort((a, b) => a.per18ToPar - b.per18ToPar)[0]
      : null,
    puttsPerRound: puttingRounds.length > 0
      ? puttingRounds.reduce((sum, item) => sum + item.per18Putts, 0) / puttingRounds.length
      : null,
    puttsPerHole: totals.holesWithPutts > 0 ? totals.putts / totals.holesWithPutts : null,
    fairwayPercent: totals.fairwayChances > 0 ? (totals.fairwaysHit / totals.fairwayChances) * 100 : null,
    greenPercent: totals.greenChances > 0 ? (totals.greensHit / totals.greenChances) * 100 : null,
    recentAverage: recent.length > 0
      ? recent.reduce((sum, item) => sum + item.per18Strokes, 0) / recent.length
      : null,
    previousAverage: previous.length > 0
      ? previous.reduce((sum, item) => sum + item.per18Strokes, 0) / previous.length
      : null,
    handicapEstimate: estimateHandicap(complete),
    byPar
  };
}

// A real Handicap Index needs each course's rating and slope, which this app
// does not have. This uses the same shape - the best eight of the last twenty
// differentials - but against par, and it is labeled an estimate everywhere.
function estimateHandicap(rounds) {
  const eligible = rounds.slice(-20);

  if (eligible.length < 3) {
    return null;
  }

  const differentials = eligible
    .map(item => item.per18ToPar)
    .sort((a, b) => a - b)
    .slice(0, Math.max(1, Math.min(8, Math.round(eligible.length * 0.4))));

  const average = differentials.reduce((sum, value) => sum + value, 0) / differentials.length;

  return {
    value: Math.max(0, average * 0.96),
    roundsUsed: eligible.length,
    roundsCounted: differentials.length
  };
}

function renderStatistics() {
  if (!statsRoundCount) {
    return;
  }

  const stats = computeRoundStatistics();

  if (!stats.rounds || stats.rounds.length === 0) {
    statsPlayerTitle.textContent = "Your scoring";
    statsRoundCount.textContent = "No finished rounds yet. Finish a round to start building statistics.";
    [statsHandicap, statsScoringAverage, statsBestRound, statsPutts, statsFairways, statsGreens].forEach(element => {
      if (element) {
        element.textContent = "-";
      }
    });
    statsTrend.textContent = "Finish a few rounds to see a trend.";
    statsRoundList.textContent = "No finished rounds yet.";
    statsParBreakdown.textContent = "No scored holes yet.";
    return;
  }

  statsPlayerTitle.textContent = `${stats.player}'s scoring`;
  statsRoundCount.textContent = `${stats.roundsCounted} finished ${stats.roundsCounted === 1 ? "round" : "rounds"} · ${stats.holesScored} scored holes`;

  statsHandicap.textContent = stats.handicapEstimate
    ? stats.handicapEstimate.value.toFixed(1)
    : "-";
  statsHandicapNote.textContent = stats.handicapEstimate
    ? `Estimated from the best ${stats.handicapEstimate.roundsCounted} of your last ${stats.handicapEstimate.roundsUsed} rounds against par. An official index also needs course rating and slope.`
    : "Finish at least three rounds of nine or more holes for an estimate.";

  statsScoringAverage.textContent = stats.scoringAverage.toFixed(1);
  statsBestRound.textContent = stats.bestRound
    ? `${Math.round(stats.bestRound.per18Strokes)} (${formatToPar(Math.round(stats.bestRound.per18ToPar))})`
    : "-";

  statsPutts.textContent = stats.puttsPerRound !== null ? stats.puttsPerRound.toFixed(1) : "-";
  statsFairways.textContent = stats.fairwayPercent !== null ? `${Math.round(stats.fairwayPercent)}%` : "-";
  statsGreens.textContent = stats.greenPercent !== null ? `${Math.round(stats.greenPercent)}%` : "-";
  statsAccuracyNote.textContent = stats.puttsPerHole !== null
    ? `${stats.puttsPerHole.toFixed(2)} putts per hole across ${stats.roundsCounted} ${stats.roundsCounted === 1 ? "round" : "rounds"}.`
    : "Record putts, fairways, and greens on the Active Round screen to build these numbers.";

  if (stats.recentAverage !== null && stats.previousAverage !== null) {
    const change = stats.recentAverage - stats.previousAverage;
    const direction = change < -0.5 ? "better" : change > 0.5 ? "worse" : "steady";

    statsTrend.textContent = direction === "steady"
      ? `Steady: your last five rounds average ${stats.recentAverage.toFixed(1)}, about the same as the five before.`
      : `Trending ${direction}: your last five rounds average ${stats.recentAverage.toFixed(1)} against ${stats.previousAverage.toFixed(1)} for the five before, a ${Math.abs(change).toFixed(1)} stroke difference.`;
  } else if (stats.recentAverage !== null) {
    statsTrend.textContent = `Your last ${Math.min(5, stats.roundsCounted)} ${stats.roundsCounted === 1 ? "round averages" : "rounds average"} ${stats.recentAverage.toFixed(1)} per 18 holes. Finish five more for a comparison.`;
  }

  statsRoundList.innerHTML = "";

  stats.rounds.slice().reverse().slice(0, 10).forEach(item => {
    const row = document.createElement("div");
    row.className = "history-item";

    const title = document.createElement("strong");
    title.textContent = item.courseName;

    const detail = document.createElement("span");
    const date = new Date(item.finishedAt);
    const puttText = item.holesWithPutts > 0 ? ` · ${item.putts} putts` : "";
    detail.textContent = `${date.toLocaleDateString()} · ${item.holesScored} holes · ${item.strokes} (${formatToPar(item.toPar)})${puttText}`;

    row.appendChild(title);
    row.appendChild(detail);
    statsRoundList.appendChild(row);
  });

  statsParBreakdown.innerHTML = "";

  const parKeys = Object.keys(stats.byPar).map(Number).sort((a, b) => a - b);

  if (parKeys.length === 0) {
    statsParBreakdown.textContent = "No scored holes yet.";
    return;
  }

  parKeys.forEach(par => {
    const bucket = stats.byPar[par];
    const row = document.createElement("div");
    row.className = "history-item";

    const title = document.createElement("strong");
    title.textContent = `Par ${par}`;

    const detail = document.createElement("span");
    const average = bucket.strokes / bucket.holes;
    const relative = (bucket.strokes - bucket.par) / bucket.holes;
    detail.textContent = `${bucket.holes} holes · ${average.toFixed(2)} average · ${relative >= 0 ? "+" : ""}${relative.toFixed(2)} to par`;

    row.appendChild(title);
    row.appendChild(detail);
    statsParBreakdown.appendChild(row);
  });
}

function exportRoundHistory() {
  const history = getRoundHistory();

  if (history.length === 0) {
    notify("There are no finished rounds to export yet.");
    return;
  }

  downloadJson({ rounds: history }, `golf-rounds-${new Date().toISOString().slice(0, 10)}.json`);
}

async function clearRoundHistory() {
  const confirmed = await confirmAction("Delete every finished round stored on this device?", "Delete rounds");

  if (!confirmed) {
    return;
  }

  localStorage.removeItem(ROUND_HISTORY_STORAGE_KEY);
  roundHistoryCache = null;
  renderRoundHistory();
  notify("Round history cleared.");
}

function downloadJson(value, filename) {
  const blob = new Blob([JSON.stringify(value, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

// -------------------------------
// Undo for score changes
// -------------------------------

function captureScoreUndo(description) {
  scoreUndoSnapshot = {
    description: description,
    scores: deepCopy(round.scores),
    holeStats: deepCopy(round.holeStats || {})
  };

  if (undoScoreBtn) {
    undoScoreBtn.classList.remove("hidden");
    undoScoreBtn.textContent = `Undo ${description}`;
  }
}

function undoLastScoreChange() {
  if (!scoreUndoSnapshot) {
    return;
  }

  round.scores = scoreUndoSnapshot.scores;
  round.holeStats = scoreUndoSnapshot.holeStats;
  scoreUndoSnapshot = null;

  if (undoScoreBtn) {
    undoScoreBtn.classList.add("hidden");
  }

  saveRoundToStorage();
  renderCurrentHole();
  renderScorecard();
  notify("Last score change undone.");
}

// -------------------------------
// Miss tendencies
// -------------------------------

function getClubTendencies() {
  const byClub = Object.create(null);

  getShotLog().forEach(shot => {
    const club = normalizeClubName(shot.club);

    if (!club) {
      return;
    }

    if (!byClub[club]) {
      byClub[club] = { left: 0, right: 0, straight: 0, total: 0 };
    }

    const entry = byClub[club];

    entry.total += 1;

    if (shot.direction === "left" || shot.direction === "right") {
      entry[shot.direction] += 1;
    } else {
      entry.straight += 1;
    }
  });

  return byClub;
}

function describeClubTendency(club) {
  const entry = getClubTendencies()[normalizeClubName(club)];

  if (!entry || entry.total < MIN_SHOTS_FOR_LEARNED_CLUB) {
    return "";
  }

  const miss = entry.left > entry.right ? "left" : "right";
  const missCount = Math.max(entry.left, entry.right);

  if (missCount < 2 || missCount / entry.total < 0.5) {
    return "";
  }

  return `You miss ${miss} with that club in ${missCount} of ${entry.total} logged shots.`;
}

// -------------------------------
// Players in the current round
// -------------------------------

function renderPlayerManageList() {
  if (!playerManageList) {
    return;
  }

  playerManageList.innerHTML = "";

  if (round.players.length === 0) {
    playerManageList.textContent = "No players yet.";
    return;
  }

  round.players.forEach(player => {
    const row = document.createElement("div");
    row.className = "player-manage-row";

    const name = document.createElement("span");
    name.textContent = player;

    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "btn btn-ghost btn-sm danger";
    remove.textContent = "Remove";
    remove.addEventListener("click", function () {
      removePlayerFromRound(player);
    });

    row.appendChild(name);
    row.appendChild(remove);
    playerManageList.appendChild(row);
  });
}

function addPlayerToRound() {
  const name = String(addPlayerInput.value || "").trim().slice(0, 60);

  if (!name || !isSafeObjectKey(name)) {
    playerManageStatus.textContent = "Enter a valid name first.";
    return;
  }

  if (round.players.length === 0) {
    playerManageStatus.textContent = "Start a round before adding players.";
    return;
  }

  if (round.players.length >= 8) {
    playerManageStatus.textContent = "A round can have up to 8 players.";
    return;
  }

  if (round.players.some(player => player.toLowerCase() === name.toLowerCase())) {
    playerManageStatus.textContent = `${name} is already in this round.`;
    return;
  }

  round.players.push(name);
  round.scores[name] = {};
  addPlayerInput.value = "";
  saveRoundToStorage();
  renderCurrentHole();
  renderScorecard();
  renderHomeSummary();
  playerManageStatus.textContent = `${name} added.`;
  notify(`${name} joined the round.`);
}

async function removePlayerFromRound(player) {
  if (round.players.length <= 1) {
    playerManageStatus.textContent = "A round needs at least one player.";
    return;
  }

  const confirmed = await confirmAction(`Remove ${player} and their scores from this round?`, "Remove");

  if (!confirmed) {
    return;
  }

  round.players = round.players.filter(name => name !== player);
  delete round.scores[player];

  if (round.holeStats) {
    delete round.holeStats[player];
  }

  saveRoundToStorage();
  renderCurrentHole();
  renderScorecard();
  renderHomeSummary();
  playerManageStatus.textContent = `${player} removed.`;
}

// -------------------------------
// Saved course deletion
// -------------------------------

async function deleteSelectedCourseSetup() {
  const selectedId = savedCourseSelect.value;

  if (!selectedId) {
    notify("Choose a saved course to delete.");
    return;
  }

  const courses = getSavedCourseSetups();
  const course = courses.find(item => item.id === selectedId);

  if (!course) {
    notify("That saved course could not be found.");
    return;
  }

  const confirmed = await confirmAction(`Delete the saved setup for ${course.courseName}?`, "Delete course");

  if (!confirmed) {
    return;
  }

  saveCourseSetupsToStorage(courses.filter(item => item.id !== selectedId));
  renderSavedCourseOptions();
  renderHomeSummary();

  if (selectedCourseSetup && selectedCourseSetup.id === selectedId) {
    selectedCourseSetup = null;
  }

  notify(`${course.courseName} deleted.`);
}

// -------------------------------
// Resume or discard a stale round
// -------------------------------

function maybeShowResumeBanner() {
  if (!resumeBanner || round.players.length === 0) {
    return;
  }

  const savedAt = loadedRoundSavedAt;

  if (!savedAt || Date.now() - savedAt < STALE_ROUND_MS) {
    return;
  }

  resumeBannerText.textContent =
    `Unfinished round at ${round.courseName || "an unnamed course"} from ${new Date(savedAt).toLocaleString()}.`;
  resumeBanner.classList.remove("hidden");
}

function hideResumeBanner() {
  if (resumeBanner) {
    resumeBanner.classList.add("hidden");
  }
}

function renderUnitPreference() {
  if (unitPreferenceSelect) {
    unitPreferenceSelect.value = getUnitPreference();
  }

  [
    document.getElementById("roundDistanceUnit"),
    document.getElementById("greenDistanceUnit")
  ].forEach(element => {
    if (element) {
      element.textContent = unitLabel(true);
    }
  });
}

// -------------------------------
// Account and sync
// -------------------------------

const accountCard = document.getElementById("accountCard");
const accountHint = document.getElementById("accountHint");
const accountStatus = document.getElementById("accountStatus");
const accountSignedOut = document.getElementById("accountSignedOut");
const accountSignedIn = document.getElementById("accountSignedIn");
const accountEmailInput = document.getElementById("accountEmailInput");
const accountEmailLabel = document.getElementById("accountEmailLabel");
const accountNameInput = document.getElementById("accountNameInput");
const accountNameLabel = document.getElementById("accountNameLabel");
const golferNameInput = document.getElementById("golferNameInput");
const golferNameStatus = document.getElementById("golferNameStatus");
const saveGolferNameBtn = document.getElementById("saveGolferNameBtn");
const sendLoginLinkBtn = document.getElementById("sendLoginLinkBtn");
const syncNowBtn = document.getElementById("syncNowBtn");
const signOutBtn = document.getElementById("signOutBtn");
const accountExportBtn = document.getElementById("accountExportBtn");
const deleteAccountBtn = document.getElementById("deleteAccountBtn");

sendLoginLinkBtn.addEventListener("click", requestLoginLink);
syncNowBtn.addEventListener("click", function () {
  syncAccountData(true);
});
signOutBtn.addEventListener("click", signOutOfAccount);
accountExportBtn.addEventListener("click", function () {
  window.location.href = "/api/account/export";
});

if (saveGolferNameBtn) {
  saveGolferNameBtn.addEventListener("click", saveGolferNameFromSettings);
}
deleteAccountBtn.addEventListener("click", deleteAccount);

async function accountFetch(path, options = {}) {
  const response = await fetch(`/api/account${path}`, {
    credentials: "same-origin",
    ...options
  });
  const body = await response.json().catch(function () {
    return {};
  });

  return { ok: response.ok, status: response.status, body };
}

async function refreshAccountState() {
  if (!accountCard) {
    return;
  }

  if (!accountsEnabled) {
    accountHint.textContent = "This server stores nothing. Your rounds stay in this browser.";
    accountSignedOut.classList.add("hidden");
    accountSignedIn.classList.add("hidden");
    accountStatus.textContent = "Device-only mode. Export your data to keep a copy.";
    return;
  }

  const { ok, body } = await accountFetch("/");

  if (ok && body.signedIn) {
    signedInEmail = body.email;
    accountHint.textContent = "Your rounds, clubs, and shots sync to your account.";
    accountEmailLabel.textContent = body.email;

    // The account is the authority on who the golfer is, so a second device
    // adopts the same name the moment it signs in.
    if (body.name) {
      saveGolferName(body.name);
    }

    if (accountNameLabel) {
      accountNameLabel.textContent = getGolferName() || "Not set";
    }

    renderGolferName();
    accountSignedIn.classList.remove("hidden");
    accountSignedOut.classList.add("hidden");
    return;
  }

  signedInEmail = "";
  accountHint.textContent = "Sign in to back up your data and use it on another device.";
  accountSignedIn.classList.add("hidden");
  accountSignedOut.classList.remove("hidden");
}

async function requestLoginLink() {
  const email = accountEmailInput.value.trim();
  const name = accountNameInput ? accountNameInput.value.trim() : "";

  if (name.length < 2) {
    accountStatus.textContent = "Enter the name you want the caddie to call you.";
    return;
  }

  if (!email) {
    accountStatus.textContent = "Enter your email address next.";
    return;
  }

  accountStatus.textContent = "Sending a sign-in link...";

  const { ok, body } = await accountFetch("/login-link", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: email, name: name })
  });

  if (ok) {
    // Save it now so the caddie knows the golfer even before the link is used.
    saveGolferName(name);
    renderGolferName();
  }

  accountStatus.textContent = ok
    ? body.message
    : body.error || "That sign-in link could not be sent.";
}

function renderGolferName() {
  const name = getGolferName();

  if (golferNameInput && document.activeElement !== golferNameInput) {
    golferNameInput.value = name;
  }

  if (accountNameInput && !accountNameInput.value) {
    accountNameInput.value = name;
  }

  if (accountNameLabel) {
    accountNameLabel.textContent = name || "Not set";
  }

  if (!golferNameStatus) {
    return;
  }

  if (!name) {
    golferNameStatus.textContent = "Add your name so the caddie knows who \"I\" and \"my\" mean.";
    return;
  }

  const inRound = round.players.some(player => player.toLowerCase() === name.toLowerCase());

  golferNameStatus.textContent = round.players.length > 0 && !inRound
    ? `Saved. This round has no player called ${name}, so the caddie will ask who you mean.`
    : `Saved. The caddie treats "I" and "my" as ${name}.`;
}

async function saveGolferNameFromSettings() {
  const name = saveGolferName(golferNameInput ? golferNameInput.value : "");

  if (!name) {
    golferNameStatus.textContent = "Enter the name you want the caddie to use.";
    return;
  }

  renderGolferName();
  renderStatistics();

  if (!accountsEnabled || !signedInEmail) {
    return;
  }

  const { ok, body } = await accountFetch("/name", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: name })
  });

  if (ok) {
    golferNameStatus.textContent = `Saved to your account. The caddie treats "I" and "my" as ${body.name}.`;
  }
}

// A round the account holder plays should already list them, so "my score"
// resolves without retyping the name every time.
function prefillGolferAsPlayer() {
  const name = getGolferName();

  if (name && playerNamesInput && !playerNamesInput.value.trim()) {
    playerNamesInput.value = name;
  }
}

async function signOutOfAccount() {
  await accountFetch("/signout", { method: "POST" });
  accountStatus.textContent = "Signed out. Your data is still on this device.";
  await refreshAccountState();
}

async function deleteAccount() {
  const confirmed = await confirmAction(
    "Delete your account and everything stored on the server? Data on this device is not affected.",
    "Delete account"
  );

  if (!confirmed) {
    return;
  }

  const { ok, body } = await accountFetch("/", { method: "DELETE" });

  accountStatus.textContent = ok
    ? "Account deleted. Your device data is untouched."
    : body.error || "That account could not be deleted.";
  await refreshAccountState();
}

function buildSyncPayload() {
  return {
    clubs: getClubProfile().clubs,
    shots: getShotLog().map(shot => ({
      ...shot,
      id: shot.id || `${shot.time}-${shot.club}-${shot.distanceYards}`
    })),
    rounds: getRoundHistory(),
    courses: getSavedCourseSetups().map(course => ({
      id: course.id,
      courseName: course.courseName,
      teeName: course.teeName,
      totalHoles: course.totalHoles,
      holePars: course.holePars,
      holeLengths: course.holeLengths,
      holeTargets: course.holeTargets,
      holeHazards: course.holeHazards,
      source: course.source
    }))
  };
}

function mergeSyncedData(data) {
  if (!data) {
    return;
  }

  if (Array.isArray(data.clubs) && data.clubs.length > 0) {
    saveClubProfile(data.clubs
      .filter(isPlainRecord)
      .map(entry => ({
        club: normalizeClubName(entry.club),
        carryYards: Number(entry.carryYards)
      }))
      .filter(entry => entry.club && isValidCarryDistance(entry.carryYards)));
  }

  if (Array.isArray(data.shots)) {
    const seen = new Set(getShotLog().map(shot => shot.id || `${shot.time}-${shot.club}-${shot.distanceYards}`));
    const merged = getShotLog().slice();

    data.shots.forEach(shot => {
      const normalized = normalizeSyncedShot(shot);

      if (!normalized || seen.has(normalized.id)) {
        return;
      }

      seen.add(normalized.id);
      merged.push(normalized);
    });

    merged.sort((a, b) => new Date(a.time) - new Date(b.time));
    saveShotLog(merged);
  }

  if (Array.isArray(data.rounds)) {
    const existing = getRoundHistory();
    const seen = new Set(existing.map(entry => entry.id));
    const merged = existing.slice();

    data.rounds.forEach(entry => {
      const normalized = normalizeSyncedRound(entry);

      if (!normalized || seen.has(normalized.id)) {
        return;
      }

      seen.add(normalized.id);
      merged.push(normalized);
    });

    merged.sort((a, b) => new Date(a.finishedAt) - new Date(b.finishedAt));
    saveRoundHistory(merged);
  }

  if (Array.isArray(data.courses)) {
    const existing = getSavedCourseSetups();
    const byId = new Map(existing.map(course => [course.id, course]));

    data.courses.slice(0, 200).forEach((course, index) => {
      const normalized = normalizeImportedCourse(course, index);

      if (normalized && normalized.id && !byId.has(normalized.id)) {
        byId.set(normalized.id, normalized);
      }
    });

    saveCourseSetupsToStorage(Array.from(byId.values()));
    renderSavedCourseOptions();
  }

  renderRoundHistory();
  renderShotHistorySummary();
  renderClubProfileEditor();
  renderHomeSummary();
}

function normalizeSyncedShot(shot) {
  if (!isPlainRecord(shot)) {
    return null;
  }

  const id = String(shot.id || "").trim().slice(0, 120);
  const time = normalizeClientTimestamp(shot.time);
  const club = normalizeClubName(shot.club);
  const distanceYards = Math.round(Number(shot.distanceYards));

  if (!id || !time || !club || !Number.isInteger(distanceYards) || distanceYards < 1 || distanceYards > 500) {
    return null;
  }

  return {
    id,
    time,
    courseName: String(shot.courseName || "").trim().slice(0, 160),
    hole: normalizeHoleNumber(shot.hole),
    par: normalizeParValue(shot.par),
    club,
    distanceYards,
    result: String(shot.result || "").trim().slice(0, 40),
    lie: String(shot.lie || "").trim().slice(0, 40),
    direction: String(shot.direction || "straight").trim().slice(0, 40)
  };
}

function normalizeSyncedRound(entry) {
  if (!isPlainRecord(entry)) {
    return null;
  }

  const id = String(entry.id || "").trim().slice(0, 120);
  const finishedAt = normalizeClientTimestamp(entry.finishedAt);
  const totalHoles = Number(entry.totalHoles);
  const players = normalizePlayerNames(Array.isArray(entry.players) ? entry.players : []);

  if (!id || !finishedAt || (totalHoles !== 9 && totalHoles !== 18) || players.length === 0) {
    return null;
  }

  const holePars = normalizeImportedHolePars(entry.holePars || {}, totalHoles);
  const scores = {};
  const holeStats = {};
  const totals = [];

  players.forEach(player => {
    const playerScores = isPlainRecord(entry.scores) && isPlainRecord(entry.scores[player])
      ? entry.scores[player]
      : {};
    const playerStats = isPlainRecord(entry.holeStats) && isPlainRecord(entry.holeStats[player])
      ? entry.holeStats[player]
      : {};
    scores[player] = {};
    holeStats[player] = {};
    let total = 0;
    let toPar = 0;
    let putts = 0;
    let fairways = 0;
    let greens = 0;

    for (let hole = 1; hole <= totalHoles; hole++) {
      const score = Number(playerScores[hole]);

      if (Number.isInteger(score) && score >= 1 && score <= 20) {
        scores[player][hole] = score;
        total += score;
        toPar += score - holePars[hole];
      }

      const stats = playerStats[hole];

      if (isPlainRecord(stats)) {
        const holePutts = Math.min(20, Math.max(0, Math.round(Number(stats.putts) || 0)));
        const fairway = typeof stats.fairway === "boolean" ? stats.fairway : null;
        const gir = typeof stats.gir === "boolean" ? stats.gir : null;
        holeStats[player][hole] = { putts: holePutts, fairway, gir };
        putts += holePutts;
        fairways += fairway === true ? 1 : 0;
        greens += gir === true ? 1 : 0;
      }
    }

    totals.push({ name: player, total, toPar, putts, fairways, greens });
  });

  return {
    id,
    finishedAt,
    courseName: String(entry.courseName || "").trim().slice(0, 160),
    teeName: String(entry.teeName || "").trim().slice(0, 120),
    totalHoles,
    players,
    scores,
    holePars,
    holeStats,
    totals
  };
}

function normalizeClientTimestamp(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function normalizeParValue(value) {
  const par = Number(value);
  return Number.isInteger(par) && par >= 3 && par <= 6 ? par : null;
}

function isSafeObjectKey(value) {
  return value !== "__proto__" && value !== "prototype" && value !== "constructor";
}

function normalizePlayerNames(values) {
  const seen = new Set();

  return values
    .map(player => String(player || "").trim().slice(0, 60))
    .filter(player => {
      const key = player.toLowerCase();

      if (!player || !isSafeObjectKey(player) || seen.has(key)) {
        return false;
      }

      seen.add(key);
      return true;
    })
    .slice(0, 8);
}

async function syncAccountData(showStatus = false) {
  if (!accountsEnabled || !signedInEmail || !isOnline()) {
    return false;
  }

  if (showStatus) {
    accountStatus.textContent = "Syncing...";
  }

  const { ok, body } = await accountFetch("/sync", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(buildSyncPayload())
  });

  if (!ok) {
    accountStatus.textContent = body.error || "Sync failed. Your data is safe on this device.";
    return false;
  }

  mergeSyncedData(body.data);
  accountStatus.textContent =
    `Synced ${body.data.rounds.length} round${body.data.rounds.length === 1 ? "" : "s"}, ` +
    `${body.data.shots.length} shot${body.data.shots.length === 1 ? "" : "s"}, and ` +
    `${body.data.clubs.length} club distance${body.data.clubs.length === 1 ? "" : "s"}.`;
  return true;
}

function reportSignInRedirect() {
  const params = new URLSearchParams(window.location.search);
  const state = params.get("signin");

  if (!state) {
    return;
  }

  if (state === "ok") {
    notify("Signed in. Syncing your data now.");
  } else if (state === "expired") {
    notify("That sign-in link expired. Request a new one.");
  } else {
    notify("That sign-in link could not be used.");
  }

  window.history.replaceState({}, "", window.location.pathname);
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
