const STORAGE_KEYS = {
  appData: "localActivityTracker.appData",
  activities: "localActivityTracker.activities",
  current: "localActivityTracker.currentActivity",
  deleted: "localActivityTracker.deletedActivities",
  presets: "localActivityTracker.presets",
  groups: "localActivityTracker.groups",
  categories: "localActivityTracker.categories",
  deviceId: "localActivityTracker.deviceId",
  signalingSettings: "localActivityTracker.signalingSettings"
};

const DATA_SCHEMA_VERSION = 2;

const GROUP_COLOR_PALETTE = [
  "#1f6f5f",
  "#d06e31",
  "#6f5bd8",
  "#a84444",
  "#2e7da8",
  "#7b8c2f",
  "#9b5f86",
  "#b8812b"
];

const state = {
  deviceId: "",
  activities: [],
  deletedActivities: [],
  presets: [],
  groups: [],
  categories: [],
  currentActivity: null,
  timerId: null,
  editingPresetId: null,
  editingActivityId: null,
  editingGroupId: null,
  editingCategoryId: null,
  activeTab: "presets",
  activeTrackerTab: "live",
  activeAnalyticsSubtab: "overview"
};

const runtime = {
  peerConnection: null,
  dataChannel: null,
  peerRole: "",
  deferredInstallPrompt: null,
  isApplyingRemoteSync: false,
  signalingPollTimer: null,
  activeShortCode: ""
};

const elements = {
  activityForm: document.getElementById("activityForm"),
  activityName: document.getElementById("activityName"),
  activityCategory: document.getElementById("activityCategory"),
  activityNotes: document.getElementById("activityNotes"),
  manualActivityForm: document.getElementById("manualActivityForm"),
  manualActivityName: document.getElementById("manualActivityName"),
  manualActivityCategory: document.getElementById("manualActivityCategory"),
  manualActivityNotes: document.getElementById("manualActivityNotes"),
  manualStartTime: document.getElementById("manualStartTime"),
  manualEndTime: document.getElementById("manualEndTime"),
  manualActivityHelperText: document.getElementById("manualActivityHelperText"),
  saveManualActivityButton: document.getElementById("saveManualActivityButton"),
  cancelManualEditButton: document.getElementById("cancelManualEditButton"),
  startButton: document.getElementById("startButton"),
  pauseButton: document.getElementById("pauseButton"),
  savePresetButton: document.getElementById("savePresetButton"),
  cancelPresetEditButton: document.getElementById("cancelPresetEditButton"),
  stopButton: document.getElementById("stopButton"),
  statusPill: document.getElementById("statusPill"),
  currentActivityCard: document.getElementById("currentActivityCard"),
  groupNameInput: document.getElementById("groupNameInput"),
  saveGroupButton: document.getElementById("saveGroupButton"),
  cancelGroupEditButton: document.getElementById("cancelGroupEditButton"),
  groupHelperText: document.getElementById("groupHelperText"),
  groupList: document.getElementById("groupList"),
  categoryNameInput: document.getElementById("categoryNameInput"),
  categoryGroupSelect: document.getElementById("categoryGroupSelect"),
  saveCategoryButton: document.getElementById("saveCategoryButton"),
  cancelCategoryEditButton: document.getElementById("cancelCategoryEditButton"),
  categoryHelperText: document.getElementById("categoryHelperText"),
  categoryList: document.getElementById("categoryList"),
  presetHelperText: document.getElementById("presetHelperText"),
  presetList: document.getElementById("presetList"),
  historySummary: document.getElementById("historySummary"),
  historyList: document.getElementById("historyList"),
  deletedSummary: document.getElementById("deletedSummary"),
  deletedList: document.getElementById("deletedList"),
  exportCsvButton: document.getElementById("exportCsvButton"),
  exportJsonButton: document.getElementById("exportJsonButton"),
  installAppButton: document.getElementById("installAppButton"),
  installStatus: document.getElementById("installStatus"),
  deviceSyncStatus: document.getElementById("deviceSyncStatus"),
  disconnectDevicesButton: document.getElementById("disconnectDevicesButton"),
  signalingServerUrl: document.getElementById("signalingServerUrl"),
  preferredShortCode: document.getElementById("preferredShortCode"),
  saveSignalingSettingsButton: document.getElementById("saveSignalingSettingsButton"),
  createShortCodeButton: document.getElementById("createShortCodeButton"),
  copyShortCodeButton: document.getElementById("copyShortCodeButton"),
  activeShortCodeOutput: document.getElementById("activeShortCodeOutput"),
  joinShortCodeInput: document.getElementById("joinShortCodeInput"),
  joinShortCodeButton: document.getElementById("joinShortCodeButton"),
  signalingStatus: document.getElementById("signalingStatus"),
  createOfferButton: document.getElementById("createOfferButton"),
  copyOfferButton: document.getElementById("copyOfferButton"),
  hostOfferCode: document.getElementById("hostOfferCode"),
  hostAnswerCodeInput: document.getElementById("hostAnswerCodeInput"),
  acceptAnswerButton: document.getElementById("acceptAnswerButton"),
  joinOfferCodeInput: document.getElementById("joinOfferCodeInput"),
  createAnswerButton: document.getElementById("createAnswerButton"),
  copyAnswerButton: document.getElementById("copyAnswerButton"),
  joinAnswerCodeOutput: document.getElementById("joinAnswerCodeOutput"),
  backupPassphrase: document.getElementById("backupPassphrase"),
  backupPassphraseConfirm: document.getElementById("backupPassphraseConfirm"),
  exportBackupButton: document.getElementById("exportBackupButton"),
  importBackupFile: document.getElementById("importBackupFile"),
  importBackupPassphrase: document.getElementById("importBackupPassphrase"),
  importBackupButton: document.getElementById("importBackupButton"),
  backupStatus: document.getElementById("backupStatus"),
  startDateFilter: document.getElementById("startDateFilter"),
  endDateFilter: document.getElementById("endDateFilter"),
  scopeFilter: document.getElementById("scopeFilter"),
  dailyDateFilter: document.getElementById("dailyDateFilter"),
  dailyScopeFilter: document.getElementById("dailyScopeFilter"),
  resetFiltersButton: document.getElementById("resetFiltersButton"),
  totalTimeStat: document.getElementById("totalTimeStat"),
  activityCountStat: document.getElementById("activityCountStat"),
  topGroupStat: document.getElementById("topGroupStat"),
  topCategoryStat: document.getElementById("topCategoryStat"),
  dailyTotalTimeStat: document.getElementById("dailyTotalTimeStat"),
  dailyActivityCountStat: document.getElementById("dailyActivityCountStat"),
  dailyFirstActivityStat: document.getElementById("dailyFirstActivityStat"),
  dailyLastActivityStat: document.getElementById("dailyLastActivityStat"),
  categoryBreakdown: document.getElementById("categoryBreakdown"),
  chartContainer: document.getElementById("chartContainer"),
  dailyBreakdown: document.getElementById("dailyBreakdown"),
  dailyTimeline: document.getElementById("dailyTimeline"),
  trackerTabButtons: Array.from(document.querySelectorAll("[data-tracker-tab]")),
  trackerTabPanels: Array.from(document.querySelectorAll("[data-tracker-tab-panel]")),
  analyticsSubtabButtons: Array.from(document.querySelectorAll("[data-analytics-subtab]")),
  analyticsSubtabPanels: Array.from(document.querySelectorAll("[data-analytics-subtab-panel]")),
  tabButtons: Array.from(document.querySelectorAll("[data-tab]")),
  tabPanels: Array.from(document.querySelectorAll("[data-tab-panel]"))
};

document.addEventListener("DOMContentLoaded", init);

function init() {
  loadState();
  loadSignalingSettings();
  setDefaultFilters();
  setDefaultDailyFilter();
  setDefaultManualTimes();
  bindEvents();
  registerServiceWorker();
  renderInstallState();
  renderDeviceSyncStatus();
  renderSignalingState();
  renderAll();

  // Refresh the live timer every second while an activity is running.
  state.timerId = window.setInterval(() => {
    if (state.currentActivity && state.currentActivity.status !== "paused") {
      renderCurrentActivity();
    }
  }, 1000);
}

function bindEvents() {
  elements.activityForm.addEventListener("submit", handleStartActivity);
  elements.manualActivityForm.addEventListener("submit", handleSaveManualActivity);
  elements.cancelManualEditButton.addEventListener("click", handleCancelManualEdit);
  elements.pauseButton.addEventListener("click", handleTogglePauseActivity);
  elements.savePresetButton.addEventListener("click", handleSavePreset);
  elements.cancelPresetEditButton.addEventListener("click", clearPresetEditingState);
  elements.saveGroupButton.addEventListener("click", handleSaveGroup);
  elements.cancelGroupEditButton.addEventListener("click", clearGroupEditingState);
  elements.saveCategoryButton.addEventListener("click", handleSaveCategory);
  elements.cancelCategoryEditButton.addEventListener("click", clearCategoryEditingState);
  elements.stopButton.addEventListener("click", handleStopActivity);
  elements.groupList.addEventListener("click", handleGroupListClick);
  elements.categoryList.addEventListener("click", handleCategoryListClick);
  elements.presetList.addEventListener("click", handlePresetListClick);
  elements.historyList.addEventListener("click", handleHistoryListClick);
  elements.deletedList.addEventListener("click", handleDeletedListClick);
  elements.exportCsvButton.addEventListener("click", () => exportActivities("csv"));
  elements.exportJsonButton.addEventListener("click", () => exportActivities("json"));
  elements.installAppButton.addEventListener("click", handleInstallApp);
  elements.disconnectDevicesButton.addEventListener("click", disconnectLiveSync);
  elements.saveSignalingSettingsButton.addEventListener("click", handleSaveSignalingSettings);
  elements.createShortCodeButton.addEventListener("click", handleCreateShortCode);
  elements.copyShortCodeButton.addEventListener("click", () => copyTextToClipboard(elements.activeShortCodeOutput.value, "Short code copied."));
  elements.joinShortCodeButton.addEventListener("click", handleJoinShortCode);
  elements.createOfferButton.addEventListener("click", handleCreateOfferCode);
  elements.copyOfferButton.addEventListener("click", () => copyTextToClipboard(elements.hostOfferCode.value, "Connection code copied."));
  elements.acceptAnswerButton.addEventListener("click", handleAcceptAnswerCode);
  elements.createAnswerButton.addEventListener("click", handleCreateAnswerCode);
  elements.copyAnswerButton.addEventListener("click", () => copyTextToClipboard(elements.joinAnswerCodeOutput.value, "Reply code copied."));
  elements.exportBackupButton.addEventListener("click", handleExportEncryptedBackup);
  elements.importBackupButton.addEventListener("click", handleImportEncryptedBackup);
  elements.startDateFilter.addEventListener("change", renderAnalytics);
  elements.endDateFilter.addEventListener("change", renderAnalytics);
  elements.scopeFilter.addEventListener("change", renderAnalytics);
  elements.dailyDateFilter.addEventListener("change", renderDailyAnalytics);
  elements.dailyScopeFilter.addEventListener("change", renderDailyAnalytics);
  elements.resetFiltersButton.addEventListener("click", () => {
    setDefaultFilters();
    renderAnalytics();
  });
  elements.trackerTabButtons.forEach((button) => {
    button.addEventListener("click", () => switchTrackerTab(button.dataset.trackerTab));
  });
  elements.analyticsSubtabButtons.forEach((button) => {
    button.addEventListener("click", () => switchAnalyticsSubtab(button.dataset.analyticsSubtab));
  });
  elements.tabButtons.forEach((button) => {
    button.addEventListener("click", () => switchTab(button.dataset.tab));
  });
  window.addEventListener("resize", handleWindowResize);
  window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
  window.addEventListener("appinstalled", handleAppInstalled);
}

function loadState() {
  state.deviceId = getOrCreateDeviceId();

  try {
    const snapshot = loadPersistedSnapshot();
    const rawGroups = snapshot.groups || [];
    const rawCategories = snapshot.categories || [];
    const rawActivities = snapshot.activities || [];
    const rawDeleted = snapshot.deletedActivities || [];
    const rawPresets = snapshot.presets || [];
    const rawCurrent = snapshot.currentActivity || null;

    const legacyGroupNames = collectLegacyGroupNames(rawGroups, rawCategories, rawActivities, rawDeleted, rawPresets, rawCurrent);

    state.groups = normalizeStoredGroups(rawGroups, legacyGroupNames);
    state.categories = normalizeStoredCategories(rawCategories);
    state.activities = normalizeStoredActivities(rawActivities);
    state.deletedActivities = normalizeStoredActivities(rawDeleted);
    state.presets = normalizeStoredPresets(rawPresets);
    state.currentActivity = normalizeStoredCurrentActivity(rawCurrent);
  } catch (error) {
    console.error("Unable to load saved activity data:", error);
    state.groups = [];
    state.categories = [];
    state.activities = [];
    state.deletedActivities = [];
    state.presets = [];
    state.currentActivity = null;
  }

  saveAllData();
}

function collectLegacyGroupNames(rawGroups, rawCategories, rawActivities, rawDeleted, rawPresets, rawCurrent) {
  const names = new Set();

  rawGroups.forEach((group) => {
    if (typeof group?.name === "string" && group.name.trim()) {
      names.add(group.name.trim());
    }
  });

  [rawCategories, rawActivities, rawDeleted, rawPresets].forEach((items) => {
    items.forEach((item) => {
      [item.groupName, item.group, item.categoryGroup].forEach((name) => {
        if (typeof name === "string" && name.trim()) {
          names.add(name.trim());
        }
      });
    });
  });

  if (rawCurrent) {
    [rawCurrent.groupName, rawCurrent.group, rawCurrent.categoryGroup].forEach((name) => {
      if (typeof name === "string" && name.trim()) {
        names.add(name.trim());
      }
    });
  }

  return [...names];
}

function normalizeStoredGroups(storedGroups, legacyGroupNames) {
  const seenNames = new Set();
  const normalized = [];

  storedGroups.forEach((group) => {
    if (!group || typeof group.name !== "string") {
      return;
    }

    const name = group.name.trim();
    const key = name.toLowerCase();

    if (!name || seenNames.has(key)) {
      return;
    }

    seenNames.add(key);
    normalized.push(createLocalRecord({
      id: group.id || createId(),
      name
    }, group));
  });

  legacyGroupNames.forEach((name) => {
    const trimmedName = name.trim();
    const key = trimmedName.toLowerCase();

    if (!trimmedName || seenNames.has(key)) {
      return;
    }

    seenNames.add(key);
    normalized.push(createLocalRecord({
      id: createId(),
      name: trimmedName
    }));
  });

  return normalized;
}

function normalizeStoredCategories(storedCategories) {
  const seenNames = new Set();

  return storedCategories
    .filter((category) => category && typeof category.name === "string")
    .map((category) => {
      const name = category.name.trim();
      const group = resolveGroupReference(category);

      return createLocalRecord({
        id: category.id || createId(),
        name,
        groupId: group ? group.id : "",
        groupName: group ? group.name : category.groupName || category.group || ""
      }, category);
    })
    .filter((category) => {
      const key = category.name.toLowerCase();

      if (!category.name || seenNames.has(key)) {
        return false;
      }

      seenNames.add(key);
      return true;
    });
}

function normalizeStoredActivities(activities) {
  return activities.map((activity) => normalizeCategoryReference(activity)).filter(Boolean);
}

function normalizeStoredPresets(presets) {
  return presets.map((preset) => normalizeCategoryReference(preset)).filter(Boolean);
}

function normalizeStoredCurrentActivity(activity) {
  if (!activity) {
    return null;
  }

  const normalized = normalizeCategoryReference(activity);
  return createLocalRecord({
    ...normalized,
    status: normalized.status === "paused" ? "paused" : "running",
    elapsedMsBeforePause: Number.isFinite(normalized.elapsedMsBeforePause) ? normalized.elapsedMsBeforePause : 0,
    lastResumedAt: normalized.lastResumedAt || normalized.startTime,
    pausedAt: normalized.pausedAt || null
  }, activity);
}

function normalizeCategoryReference(item) {
  if (!item) {
    return null;
  }

  const matchedCategory = item.categoryId ? findCategoryById(item.categoryId) : null;
  const matchedGroup = matchedCategory
    ? findGroupById(matchedCategory.groupId)
    : resolveGroupReference(item);

  return createLocalRecord({
    ...item,
    id: item.id || createId(),
    categoryId: matchedCategory ? matchedCategory.id : item.categoryId || "",
    categoryName: matchedCategory ? matchedCategory.name : item.categoryName || item.category || "Uncategorized",
    groupId: matchedGroup ? matchedGroup.id : item.groupId || "",
    groupName: matchedGroup ? matchedGroup.name : item.groupName || item.categoryGroup || item.group || "Ungrouped"
  }, item);
}

function resolveGroupReference(item) {
  if (!item) {
    return null;
  }

  if (item.groupId) {
    const byId = findGroupById(item.groupId);
    if (byId) {
      return byId;
    }
  }

  const candidateName = item.groupName || item.group || item.categoryGroup || "";
  return findGroupByName(candidateName);
}

function loadPersistedSnapshot() {
  const consolidated = readJsonStorage(STORAGE_KEYS.appData);

  if (consolidated && typeof consolidated === "object") {
    return {
      groups: consolidated.groups || [],
      categories: consolidated.categories || [],
      activities: consolidated.activities || [],
      deletedActivities: consolidated.deletedActivities || consolidated.deleted || [],
      presets: consolidated.presets || [],
      currentActivity: consolidated.currentActivity || consolidated.current || null
    };
  }

  return {
    groups: readJsonStorage(STORAGE_KEYS.groups, []),
    categories: readJsonStorage(STORAGE_KEYS.categories, []),
    activities: readJsonStorage(STORAGE_KEYS.activities, []),
    deletedActivities: readJsonStorage(STORAGE_KEYS.deleted, []),
    presets: readJsonStorage(STORAGE_KEYS.presets, []),
    currentActivity: readJsonStorage(STORAGE_KEYS.current, null)
  };
}

function readJsonStorage(key, fallback = null) {
  const rawValue = localStorage.getItem(key);

  if (!rawValue) {
    return fallback;
  }

  try {
    return JSON.parse(rawValue);
  } catch (error) {
    console.error(`Unable to parse saved data for ${key}:`, error);
    return fallback;
  }
}

function saveActivities() {
  saveAllData();
}

function saveDeletedActivities() {
  saveAllData();
}

function savePresets() {
  saveAllData();
}

function saveGroups() {
  saveAllData();
}

function saveCategories() {
  saveAllData();
}

function saveCurrentActivity() {
  saveAllData();
}

function saveAllData() {
  const snapshot = {
    schemaVersion: DATA_SCHEMA_VERSION,
    deviceId: state.deviceId,
    savedAt: getCurrentTimestamp(),
    groups: state.groups,
    categories: state.categories,
    activities: state.activities,
    deletedActivities: state.deletedActivities,
    presets: state.presets,
    currentActivity: state.currentActivity
  };

  localStorage.setItem(STORAGE_KEYS.appData, JSON.stringify(snapshot));
  localStorage.setItem(STORAGE_KEYS.groups, JSON.stringify(state.groups));
  localStorage.setItem(STORAGE_KEYS.categories, JSON.stringify(state.categories));
  localStorage.setItem(STORAGE_KEYS.activities, JSON.stringify(state.activities));
  localStorage.setItem(STORAGE_KEYS.deleted, JSON.stringify(state.deletedActivities));
  localStorage.setItem(STORAGE_KEYS.presets, JSON.stringify(state.presets));

  if (state.currentActivity) {
    localStorage.setItem(STORAGE_KEYS.current, JSON.stringify(state.currentActivity));
  } else {
    localStorage.removeItem(STORAGE_KEYS.current);
  }

  if (!runtime.isApplyingRemoteSync) {
    broadcastSnapshotToPeer("update");
  }
}

function createLocalRecord(record, source = {}) {
  const createdAt = record.createdAt || source.createdAt || getCurrentTimestamp();
  const updatedAt = record.updatedAt || source.updatedAt || createdAt;
  const deviceId = record.deviceId || source.deviceId || state.deviceId;

  return {
    ...record,
    createdAt,
    updatedAt,
    deviceId,
    lastModifiedBy: record.lastModifiedBy || source.lastModifiedBy || deviceId,
    syncStatus: record.syncStatus || source.syncStatus || "local-only"
  };
}

function applyLocalUpdateMetadata(record, changes = {}) {
  const updatedRecord = createLocalRecord({
    ...record,
    ...changes,
    updatedAt: getCurrentTimestamp(),
    lastModifiedBy: state.deviceId,
    syncStatus: "local-only"
  }, record);

  Object.assign(record, updatedRecord);
  return record;
}

function setDefaultFilters() {
  const today = new Date();
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(today.getDate() - 6);

  elements.startDateFilter.value = toDateInputValue(sevenDaysAgo);
  elements.endDateFilter.value = toDateInputValue(today);
}

function loadSignalingSettings() {
  const savedSettings = readJsonStorage(STORAGE_KEYS.signalingSettings, {});
  elements.signalingServerUrl.value = savedSettings.serverUrl || "";
}

function saveSignalingSettings() {
  localStorage.setItem(STORAGE_KEYS.signalingSettings, JSON.stringify({
    serverUrl: getNormalizedSignalingServerUrl()
  }));
}

function handleSaveSignalingSettings() {
  saveSignalingSettings();
  renderSignalingState("Signaling settings saved.", "success");
}

function getNormalizedSignalingServerUrl() {
  return elements.signalingServerUrl.value.trim().replace(/\/+$/, "");
}

function renderSignalingState(message = "", tone = "neutral") {
  const serverUrl = getNormalizedSignalingServerUrl();
  const fallbackMessage = serverUrl
    ? `Signaling server saved: ${serverUrl}`
    : "Short codes require a signaling server. Save a signaling server URL to enable this easier connection flow.";
  const resolvedMessage = message || fallbackMessage;
  const resolvedTone = message ? tone : (serverUrl ? "success" : "neutral");

  elements.signalingStatus.textContent = resolvedMessage;
  elements.signalingStatus.className = `empty-state signaling-status signaling-status--${resolvedTone}`;
  elements.activeShortCodeOutput.value = runtime.activeShortCode || "";
}

async function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) {
    return;
  }

  try {
    await navigator.serviceWorker.register("sw.js");
  } catch (error) {
    console.error("Unable to register service worker:", error);
  }
}

function handleBeforeInstallPrompt(event) {
  event.preventDefault();
  runtime.deferredInstallPrompt = event;
  renderInstallState();
}

async function handleInstallApp() {
  if (!runtime.deferredInstallPrompt) {
    setInstallStatus("Install is not available yet. Open the app from a supported URL in a compatible browser to install it.", "error");
    return;
  }

  runtime.deferredInstallPrompt.prompt();
  const choiceResult = await runtime.deferredInstallPrompt.userChoice;
  runtime.deferredInstallPrompt = null;
  renderInstallState();

  if (choiceResult.outcome === "accepted") {
    setInstallStatus("The app install was accepted. Once installed, you can launch it from your home screen or app list.", "success");
  } else {
    setInstallStatus("Install was dismissed. You can try again later from this tab or your browser menu.", "neutral");
  }
}

function handleAppInstalled() {
  runtime.deferredInstallPrompt = null;
  renderInstallState();
  setInstallStatus("The app is installed and can now be launched more like a native app.", "success");
}

function renderInstallState() {
  elements.installAppButton.hidden = !runtime.deferredInstallPrompt;
}

function setInstallStatus(message, tone = "neutral") {
  elements.installStatus.textContent = message;
  elements.installStatus.className = `empty-state install-status install-status--${tone}`;
}

function renderDeviceSyncStatus(message = "", tone = "neutral") {
  const isConnected = runtime.dataChannel?.readyState === "open";
  const fallbackMessage = isConnected
    ? "Devices are linked and live updates are active while both apps remain open."
    : "No live device link is active yet.";
  const resolvedMessage = message || fallbackMessage;
  const resolvedTone = message ? tone : (isConnected ? "success" : "neutral");

  elements.deviceSyncStatus.textContent = resolvedMessage;
  elements.deviceSyncStatus.className = `empty-state device-sync-status device-sync-status--${resolvedTone}`;
  elements.disconnectDevicesButton.disabled = !(runtime.peerConnection || runtime.dataChannel);
}

function setDefaultDailyFilter() {
  elements.dailyDateFilter.value = toDateInputValue(new Date());
}

function setDefaultManualTimes() {
  const end = new Date();
  const start = new Date(end.getTime() - (60 * 60 * 1000));

  elements.manualStartTime.value = toDateTimeInputValue(start);
  elements.manualEndTime.value = toDateTimeInputValue(end);
}

function switchTrackerTab(tabName) {
  state.activeTrackerTab = tabName;
  renderTrackerTabState();
}

function renderTrackerTabState() {
  elements.trackerTabButtons.forEach((button) => {
    const isActive = button.dataset.trackerTab === state.activeTrackerTab;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-selected", String(isActive));
  });

  elements.trackerTabPanels.forEach((panel) => {
    panel.hidden = panel.dataset.trackerTabPanel !== state.activeTrackerTab;
  });
}

function switchAnalyticsSubtab(tabName) {
  state.activeAnalyticsSubtab = tabName;
  renderAnalyticsSubtabState();
}

function renderAnalyticsSubtabState() {
  elements.analyticsSubtabButtons.forEach((button) => {
    const isActive = button.dataset.analyticsSubtab === state.activeAnalyticsSubtab;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-selected", String(isActive));
  });

  elements.analyticsSubtabPanels.forEach((panel) => {
    panel.hidden = panel.dataset.analyticsSubtabPanel !== state.activeAnalyticsSubtab;
  });

  if (state.activeTab === "analytics") {
    window.requestAnimationFrame(fitAnalyticsStatValues);
  }
}

function switchTab(tabName) {
  state.activeTab = tabName;
  renderTabState();
}

function renderTabState() {
  elements.tabButtons.forEach((button) => {
    const isActive = button.dataset.tab === state.activeTab;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-selected", String(isActive));
  });

  elements.tabPanels.forEach((panel) => {
    panel.hidden = panel.dataset.tabPanel !== state.activeTab;
  });

  if (state.activeTab === "analytics") {
    renderAnalyticsSubtabState();
    window.requestAnimationFrame(fitAnalyticsStatValues);
  }
}

function renderAll() {
  renderCategoryOptions();
  renderGroupOptions();
  renderScopeOptions();
  renderAnalyticsSubtabState();
  renderTrackerTabState();
  renderTabState();
  renderInstallState();
  renderDeviceSyncStatus();
  renderGroups();
  renderCategories();
  renderPresets();
  renderCurrentActivity();
  renderHistory();
  renderDeletedActivities();
  renderAnalytics();
  renderDailyAnalytics();
}

function renderCategoryOptions() {
  const liveSelectedValue = elements.activityCategory.value;
  const manualSelectedValue = elements.manualActivityCategory.value;

  if (!state.categories.length) {
    elements.activityCategory.innerHTML = `<option value="">Create a category first</option>`;
    elements.activityCategory.value = "";
    elements.manualActivityCategory.innerHTML = `<option value="">Create a category first</option>`;
    elements.manualActivityCategory.value = "";
    return;
  }

  const optionMarkup = state.categories
    .map((category) => `<option value="${category.id}">${escapeHtml(category.name)} (${escapeHtml(category.groupName || "Ungrouped")})</option>`)
    .join("");

  elements.activityCategory.innerHTML = optionMarkup;
  elements.manualActivityCategory.innerHTML = optionMarkup;

  const liveOptionExists = state.categories.some((category) => category.id === liveSelectedValue);
  const manualOptionExists = state.categories.some((category) => category.id === manualSelectedValue);
  elements.activityCategory.value = liveOptionExists ? liveSelectedValue : state.categories[0].id;
  elements.manualActivityCategory.value = manualOptionExists ? manualSelectedValue : state.categories[0].id;
}

function renderGroupOptions() {
  const selectedValue = elements.categoryGroupSelect.value;

  if (!state.groups.length) {
    elements.categoryGroupSelect.innerHTML = `<option value="">Create a group first</option>`;
    elements.categoryGroupSelect.value = "";
    return;
  }

  elements.categoryGroupSelect.innerHTML = state.groups
    .map((group) => `<option value="${group.id}">${escapeHtml(group.name)}</option>`)
    .join("");

  const optionExists = state.groups.some((group) => group.id === selectedValue);
  elements.categoryGroupSelect.value = optionExists ? selectedValue : state.groups[0].id;
}

function renderScopeOptions() {
  const selectedValue = elements.scopeFilter.value || "All";
  const dailySelectedValue = elements.dailyScopeFilter.value || "All";
  const groupNames = new Set(state.groups.map((group) => group.name));

  state.activities.forEach((activity) => {
    if (activity.groupName) {
      groupNames.add(activity.groupName);
    }
  });

  const options = ['<option value="All">Combined (All Groups)</option>'];
  [...groupNames].sort((left, right) => left.localeCompare(right)).forEach((groupName) => {
    options.push(`<option value="${escapeHtml(groupName)}">${escapeHtml(groupName)} only</option>`);
  });

  const markup = options.join("");
  elements.scopeFilter.innerHTML = markup;
  elements.dailyScopeFilter.innerHTML = markup;
  elements.scopeFilter.value = [...groupNames].includes(selectedValue) || selectedValue === "All" ? selectedValue : "All";
  elements.dailyScopeFilter.value = [...groupNames].includes(dailySelectedValue) || dailySelectedValue === "All" ? dailySelectedValue : "All";
}

function renderGroups() {
  if (!state.groups.length) {
    elements.groupList.innerHTML = `<div class="empty-state">No groups yet. Add general groups such as Work, Personal, or Other before creating categories.</div>`;
    return;
  }

  elements.groupList.innerHTML = state.groups
    .map((group) => `
      <article class="history-item">
        <div class="history-item__top">
          <div>
            <h3>${escapeHtml(group.name)}</h3>
            <p>${countCategoriesForGroup(group.id)} categories currently use this group.</p>
          </div>
          ${renderGroupBadge(group.name)}
        </div>
        <div class="history-item__actions">
          <button class="mini-button mini-button--neutral" type="button" data-action="edit-group" data-id="${group.id}">Edit</button>
          <button class="mini-button mini-button--danger" type="button" data-action="delete-group" data-id="${group.id}">Delete</button>
        </div>
      </article>
    `)
    .join("");
}

function renderCategories() {
  if (!state.groups.length) {
    elements.categoryList.innerHTML = `<div class="empty-state">Create a group first, then add categories that belong to it.</div>`;
    return;
  }

  if (!state.categories.length) {
    elements.categoryList.innerHTML = `<div class="empty-state">No categories yet. Add one here before starting activities or saving quick-start presets.</div>`;
    return;
  }

  elements.categoryList.innerHTML = state.categories
    .map((category) => `
      <article class="history-item">
        <div class="history-item__top">
          <div>
            <h3>${escapeHtml(category.name)}</h3>
            <p>Belongs to the ${escapeHtml(category.groupName || "Ungrouped")} group.</p>
          </div>
          ${renderCategoryBadge(category.name, category.groupName)}
        </div>
        <div class="history-item__meta">
          ${renderGroupTag(category.groupName)}
        </div>
        <div class="history-item__actions">
          <button class="mini-button mini-button--neutral" type="button" data-action="edit-category" data-id="${category.id}">Edit</button>
          <button class="mini-button mini-button--danger" type="button" data-action="delete-category" data-id="${category.id}">Delete</button>
        </div>
      </article>
    `)
    .join("");
}

function renderPresets() {
  if (!state.presets.length) {
    elements.presetList.innerHTML = `<div class="empty-state">Save a frequently used activity like a course name, meeting type, or recurring task for one-tap use.</div>`;
    return;
  }

  elements.presetList.innerHTML = state.presets
    .map((preset) => `
      <article class="history-item">
        <div class="history-item__top">
          <div>
            <h3>${escapeHtml(preset.name)}</h3>
            <p>${preset.notes ? escapeHtml(preset.notes) : "No notes or tags saved."}</p>
          </div>
          ${renderCategoryBadge(preset.categoryName, preset.groupName)}
        </div>
        <div class="history-item__meta">
          ${renderGroupTag(preset.groupName)}
        </div>
        <div class="history-item__actions">
          <button class="mini-button mini-button--restore" type="button" data-action="start-preset" data-id="${preset.id}">Start</button>
          <button class="mini-button mini-button--neutral" type="button" data-action="edit-preset" data-id="${preset.id}">Edit</button>
          <button class="mini-button mini-button--danger" type="button" data-action="delete-preset" data-id="${preset.id}">Remove</button>
        </div>
      </article>
    `)
    .join("");
}

function renderCurrentActivity() {
  const hasCurrentActivity = Boolean(state.currentActivity);
  const isPaused = hasCurrentActivity && state.currentActivity.status === "paused";
  const isRunning = hasCurrentActivity && !isPaused;
  elements.statusPill.textContent = hasCurrentActivity ? (isPaused ? "Paused" : "Tracking now") : "Idle";
  elements.statusPill.className = `status-pill ${hasCurrentActivity ? (isPaused ? "status-pill--paused" : "status-pill--running") : "status-pill--idle"}`;
  elements.startButton.disabled = hasCurrentActivity;
  elements.pauseButton.disabled = !hasCurrentActivity;
  elements.pauseButton.textContent = isPaused ? "Resume" : "Pause";
  elements.stopButton.disabled = !hasCurrentActivity;

  if (!hasCurrentActivity) {
    elements.currentActivityCard.className = "current-card current-card--empty";
    elements.currentActivityCard.innerHTML = `
      <p class="current-card__label">Current activity</p>
      <h3>No activity is running</h3>
      <p>When you tap Start, the timer begins immediately and stays saved locally in this browser.</p>
    `;
    return;
  }

  const running = state.currentActivity;
  const elapsedMs = getCurrentActivityElapsedMs(running);

  elements.currentActivityCard.className = `current-card ${isPaused ? "current-card--paused" : "current-card--running"}`;
  elements.currentActivityCard.innerHTML = `
    <p class="current-card__label">Current activity</p>
    <h3>${escapeHtml(running.name)}</h3>
    <p>Started ${formatDateTime(running.startTime)} and has ${isPaused ? "tracked" : "been running for"} <strong>${formatDuration(elapsedMs)}</strong>.</p>
    <p>${isPaused ? `Paused ${formatDateTime(running.pausedAt)}.` : "Timer is actively counting."}</p>
    <div class="current-metadata">
      ${renderCategoryBadge(running.categoryName, running.groupName)}
      ${renderGroupTag(running.groupName)}
      ${running.notes ? `<span class="tag">${escapeHtml(running.notes)}</span>` : ""}
    </div>
  `;
}

function renderHistory() {
  if (!state.activities.length) {
    elements.historySummary.textContent = "No completed activities yet.";
    elements.historyList.innerHTML = `<div class="empty-state">Your completed activities will appear here after you stop a session.</div>`;
    return;
  }

  const totalMs = state.activities.reduce((sum, activity) => sum + activity.durationMs, 0);
  elements.historySummary.textContent = `${state.activities.length} saved activities - ${formatDuration(totalMs)} tracked`;

  elements.historyList.innerHTML = state.activities
    .map((activity) => `
      <article class="history-item">
        <div class="history-item__top">
          <div>
            <h3>${escapeHtml(activity.name)}</h3>
            <p>${formatDateTime(activity.startTime)} to ${formatDateTime(activity.endTime)}</p>
          </div>
          <strong>${formatDuration(activity.durationMs)}</strong>
        </div>
        <div class="history-item__meta">
          ${renderCategoryBadge(activity.categoryName, activity.groupName)}
          ${renderGroupTag(activity.groupName)}
          ${activity.notes ? `<span class="tag">${escapeHtml(activity.notes)}</span>` : ""}
        </div>
        <div class="history-item__actions">
          <button class="mini-button mini-button--neutral" type="button" data-action="edit" data-id="${activity.id}">Edit</button>
          <button class="mini-button mini-button--danger" type="button" data-action="delete" data-id="${activity.id}">Delete</button>
        </div>
      </article>
    `)
    .join("");
}

function renderDeletedActivities() {
  if (!state.deletedActivities.length) {
    elements.deletedSummary.textContent = "No recently deleted activities.";
    elements.deletedList.innerHTML = `<div class="empty-state">Deleted activities can be restored from here until newer deletions replace them.</div>`;
    return;
  }

  elements.deletedSummary.textContent = `${state.deletedActivities.length} recently deleted item(s) available to restore`;
  elements.deletedList.innerHTML = state.deletedActivities
    .map((activity) => `
      <article class="history-item">
        <div class="history-item__top">
          <div>
            <h3>${escapeHtml(activity.name)}</h3>
            <p>${formatDateTime(activity.startTime)} to ${formatDateTime(activity.endTime)}</p>
          </div>
          <strong>${formatDuration(activity.durationMs)}</strong>
        </div>
        <div class="history-item__meta">
          ${renderCategoryBadge(activity.categoryName, activity.groupName)}
          ${renderGroupTag(activity.groupName)}
          ${activity.notes ? `<span class="tag">${escapeHtml(activity.notes)}</span>` : ""}
        </div>
        <p class="deleted-note">Deleted ${formatDateTime(activity.deletedAt)}</p>
        <div class="history-item__actions">
          <button class="mini-button mini-button--restore" type="button" data-action="restore" data-id="${activity.id}">Restore</button>
          <button class="mini-button mini-button--danger" type="button" data-action="purge" data-id="${activity.id}">Delete Forever</button>
        </div>
      </article>
    `)
    .join("");
}

function renderAnalytics() {
  const filtered = getFilteredActivities();
  const groupTotals = getGroupTotals(filtered);
  const categoryTotals = getNamedCategoryTotals(filtered);
  const totalMs = Object.values(groupTotals).reduce((sum, value) => sum + value, 0);
  const topGroup = getTopEntry(groupTotals);
  const topCategory = categoryTotals[0] || null;

  elements.totalTimeStat.textContent = formatDuration(totalMs);
  elements.activityCountStat.textContent = String(filtered.length);
  elements.topGroupStat.textContent = topGroup ? topGroup.name : "-";
  elements.topCategoryStat.textContent = topCategory ? topCategory.name : "-";

  if (!categoryTotals.length) {
    elements.categoryBreakdown.innerHTML = `<div class="empty-state">No analytics available for the selected filters.</div>`;
  } else {
    elements.categoryBreakdown.innerHTML = categoryTotals
      .map((categoryTotal) => createBreakdownMarkup(categoryTotal, totalMs))
      .join("");
  }

  elements.chartContainer.innerHTML = createChartMarkup(groupTotals, totalMs);

  if (state.activeTab === "analytics" && state.activeAnalyticsSubtab === "overview") {
    window.requestAnimationFrame(fitAnalyticsStatValues);
  }
}

function handleWindowResize() {
  if (state.activeTab === "analytics") {
    window.requestAnimationFrame(fitAnalyticsStatValues);
  }
}

function fitAnalyticsStatValues() {
  const overviewStats = [
    elements.totalTimeStat,
    elements.activityCountStat,
    elements.topGroupStat,
    elements.topCategoryStat
  ];
  const dailyStats = [
    elements.dailyTotalTimeStat,
    elements.dailyActivityCountStat,
    elements.dailyFirstActivityStat,
    elements.dailyLastActivityStat
  ];

  overviewStats.forEach((element) => fitStatText(element));
  dailyStats.forEach((element) => fitStatText(element));
}

function fitStatText(element) {
  if (!element || element.clientWidth === 0) {
    return;
  }

  const text = element.textContent.trim();
  element.style.fontSize = "";
  const minimumFontSize = 12;
  const isPhrase = /\s/.test(text);
  const startingFontSize = parseFloat(window.getComputedStyle(element).fontSize);

  element.style.whiteSpace = isPhrase ? "normal" : "nowrap";
  element.style.wordBreak = "normal";
  element.style.overflowWrap = "normal";

  let fontSize = startingFontSize;

  while (
    fontSize > minimumFontSize &&
    (element.scrollWidth > element.clientWidth + 1 || element.scrollHeight > element.clientHeight + 1)
  ) {
    fontSize -= 0.5;
    element.style.fontSize = `${fontSize}px`;
  }
}

function renderDailyAnalytics() {
  const selectedDate = elements.dailyDateFilter.value;
  const filtered = getDailyActivities(selectedDate, elements.dailyScopeFilter.value || "All");
  const totalMs = filtered.reduce((sum, activity) => sum + activity.durationMs, 0);
  const firstActivity = filtered[0] || null;
  const lastActivity = filtered[filtered.length - 1] || null;
  const categoryTotals = getNamedCategoryTotals(filtered);

  elements.dailyTotalTimeStat.textContent = formatDuration(totalMs);
  elements.dailyActivityCountStat.textContent = String(filtered.length);
  elements.dailyFirstActivityStat.textContent = firstActivity ? firstActivity.categoryName : "-";
  elements.dailyLastActivityStat.textContent = lastActivity ? lastActivity.categoryName : "-";

  if (!filtered.length) {
    elements.dailyBreakdown.innerHTML = `<div class="empty-state">No activities were saved for the selected day.</div>`;
    elements.dailyTimeline.innerHTML = `<div class="empty-state">Your chosen day will show a timeline here once activities are available.</div>`;
  } else {
    elements.dailyBreakdown.innerHTML = categoryTotals
      .map((categoryTotal) => createBreakdownMarkup(categoryTotal, totalMs))
      .join("");
    elements.dailyTimeline.innerHTML = filtered
      .map((activity) => createDailyTimelineMarkup(activity))
      .join("");
  }

  if (state.activeTab === "analytics" && state.activeAnalyticsSubtab === "daily") {
    window.requestAnimationFrame(fitAnalyticsStatValues);
  }
}

function getFilteredActivities() {
  const startDate = elements.startDateFilter.value ? new Date(`${elements.startDateFilter.value}T00:00:00`) : null;
  const endDate = elements.endDateFilter.value ? new Date(`${elements.endDateFilter.value}T23:59:59`) : null;
  const scope = elements.scopeFilter.value || "All";

  return state.activities.filter((activity) => {
    const activityStart = new Date(activity.startTime);
    const matchesStart = !startDate || activityStart >= startDate;
    const matchesEnd = !endDate || activityStart <= endDate;
    const matchesScope = scope === "All" || activity.groupName === scope;

    return matchesStart && matchesEnd && matchesScope;
  });
}

function getDailyActivities(dateValue, scope) {
  if (!dateValue) {
    return [];
  }

  const startDate = new Date(`${dateValue}T00:00:00`);
  const endDate = new Date(`${dateValue}T23:59:59`);

  return state.activities
    .filter((activity) => {
      const activityStart = new Date(activity.startTime);
      const matchesDate = activityStart >= startDate && activityStart <= endDate;
      const matchesScope = scope === "All" || activity.groupName === scope;

      return matchesDate && matchesScope;
    })
    .sort((left, right) => new Date(left.startTime).getTime() - new Date(right.startTime).getTime());
}

function getGroupTotals(activities) {
  return activities.reduce((accumulator, activity) => {
    const key = activity.groupName || "Ungrouped";
    accumulator[key] = (accumulator[key] || 0) + activity.durationMs;
    return accumulator;
  }, {});
}

function getNamedCategoryTotals(activities) {
  const totals = new Map();

  for (const activity of activities) {
    const key = `${activity.groupName}::${activity.categoryName}`;
    const existing = totals.get(key) || {
      name: activity.categoryName,
      groupName: activity.groupName,
      durationMs: 0
    };

    existing.durationMs += activity.durationMs;
    totals.set(key, existing);
  }

  return [...totals.values()].sort((left, right) => right.durationMs - left.durationMs);
}

function getTopEntry(groupTotals) {
  const entries = Object.entries(groupTotals).sort((left, right) => right[1] - left[1]);

  if (!entries.length) {
    return null;
  }

  return {
    name: entries[0][0],
    durationMs: entries[0][1]
  };
}

function createBreakdownMarkup(categoryTotal, totalMs) {
  const percent = totalMs ? (categoryTotal.durationMs / totalMs) * 100 : 0;
  const groupColor = getGroupColor(categoryTotal.groupName);

  return `
    <article class="breakdown-item">
      <div class="breakdown-item__top">
        <div>
          <h4>${escapeHtml(categoryTotal.name)}</h4>
          <p>${escapeHtml(categoryTotal.groupName)} - ${formatDuration(categoryTotal.durationMs)} tracked</p>
        </div>
        <strong>${percent.toFixed(1)}%</strong>
      </div>
      <div class="bar-track">
        <div class="chart-fill" style="width: ${percent}%; background: ${groupColor};"></div>
      </div>
    </article>
  `;
}

function createChartMarkup(groupTotals, totalMs) {
  const groupEntries = Object.entries(groupTotals).sort((left, right) => right[1] - left[1]);

  if (!totalMs || !groupEntries.length) {
    return `<div class="empty-state">Track a few activities to generate a visual summary.</div>`;
  }

  return groupEntries
    .map(([groupName, durationMs]) => {
      const percent = (durationMs / totalMs) * 100;

      return `
        <article class="chart-row">
          <div class="chart-row__top">
            <strong>${escapeHtml(groupName)}</strong>
            <span>${formatDuration(durationMs)} - ${percent.toFixed(1)}%</span>
          </div>
          <div class="bar-track">
            <div class="chart-fill" style="width: ${percent}%; background: ${getGroupColor(groupName)};"></div>
          </div>
        </article>
      `;
    })
    .join("");
}

function createDailyTimelineMarkup(activity) {
  return `
    <article class="history-item">
      <div class="history-item__top">
        <div>
          <h3>${escapeHtml(activity.name)}</h3>
          <p>${formatTimeOnly(activity.startTime)} to ${formatTimeOnly(activity.endTime)}</p>
        </div>
        <strong>${formatDuration(activity.durationMs)}</strong>
      </div>
      <div class="history-item__meta">
        ${renderCategoryBadge(activity.categoryName, activity.groupName)}
        ${renderGroupTag(activity.groupName)}
        ${activity.notes ? `<span class="tag">${escapeHtml(activity.notes)}</span>` : ""}
      </div>
    </article>
  `;
}

function getFormValues() {
  const selectedCategory = findCategoryById(elements.activityCategory.value);

  if (!selectedCategory) {
    return null;
  }

  return {
    name: elements.activityName.value.trim(),
    notes: elements.activityNotes.value.trim(),
    categoryId: selectedCategory.id,
    categoryName: selectedCategory.name,
    groupId: selectedCategory.groupId,
    groupName: selectedCategory.groupName
  };
}

function getManualFormValues() {
  const selectedCategory = findCategoryById(elements.manualActivityCategory.value);

  if (!selectedCategory) {
    return null;
  }

  return {
    name: elements.manualActivityName.value.trim(),
    notes: elements.manualActivityNotes.value.trim(),
    categoryId: selectedCategory.id,
    categoryName: selectedCategory.name,
    groupId: selectedCategory.groupId,
    groupName: selectedCategory.groupName,
    startTime: elements.manualStartTime.value,
    endTime: elements.manualEndTime.value
  };
}

function handleStartActivity(event) {
  event.preventDefault();

  if (state.currentActivity) {
    window.alert("Please stop the current activity before starting a new one.");
    return;
  }

  const activityData = getFormValues();

  if (!activityData) {
    window.alert("Create at least one category first.");
    switchTab("categories");
    elements.categoryNameInput.focus();
    return;
  }

  if (!activityData.name) {
    window.alert("Enter an activity name to begin tracking.");
    elements.activityName.focus();
    return;
  }

  startActivity(activityData);
}

function handleTogglePauseActivity() {
  if (!state.currentActivity) {
    window.alert("There is no running activity to pause or resume.");
    return;
  }

  if (state.currentActivity.status === "paused") {
    applyLocalUpdateMetadata(state.currentActivity, {
      status: "running",
      lastResumedAt: new Date().toISOString(),
      pausedAt: null
    });
  } else {
    const now = new Date().toISOString();
    applyLocalUpdateMetadata(state.currentActivity, {
      elapsedMsBeforePause: getCurrentActivityElapsedMs(state.currentActivity, now),
      status: "paused",
      pausedAt: now,
      lastResumedAt: null
    });
  }

  saveCurrentActivity();
  renderAll();
}

function handleSaveManualActivity(event) {
  event.preventDefault();

  const activityData = getManualFormValues();

  if (!activityData) {
    window.alert("Create at least one category first.");
    switchTab("categories");
    elements.categoryNameInput.focus();
    return;
  }

  if (!activityData.name) {
    window.alert("Enter an activity name before saving it.");
    elements.manualActivityName.focus();
    return;
  }

  if (!activityData.startTime || !activityData.endTime) {
    window.alert("Enter both a start time and an end time.");
    return;
  }

  const startTime = new Date(activityData.startTime);
  const endTime = new Date(activityData.endTime);

  if (Number.isNaN(startTime.getTime()) || Number.isNaN(endTime.getTime())) {
    window.alert("Enter valid start and end times.");
    return;
  }

  if (endTime <= startTime) {
    window.alert("The end time must be later than the start time.");
    elements.manualEndTime.focus();
    return;
  }

  const activityRecord = {
    name: activityData.name,
    notes: activityData.notes,
    categoryId: activityData.categoryId,
    categoryName: activityData.categoryName,
    groupId: activityData.groupId,
    groupName: activityData.groupName,
    startTime: startTime.toISOString(),
    endTime: endTime.toISOString()
  };

  if (state.editingActivityId) {
    const wasUpdated = updateCompletedActivity(state.editingActivityId, activityRecord);

    if (!wasUpdated) {
      window.alert("That activity could not be found. It may have been deleted already.");
      clearManualEditingState();
      clearManualForm();
      renderAll();
      return;
    }
  } else {
    addCompletedActivity(activityRecord);
  }

  clearManualEditingState();
  clearManualForm();
  renderAll();
}

function handleStopActivity() {
  if (!state.currentActivity) {
    window.alert("There is no running activity to stop.");
    return;
  }

  const now = new Date().toISOString();
  addCompletedActivity({
    ...state.currentActivity,
    startTime: state.currentActivity.startTime,
    endTime: now,
    durationMsOverride: getCurrentActivityElapsedMs(state.currentActivity, now)
  });
  state.currentActivity = null;
  saveCurrentActivity();
  clearForm();
  renderAll();
}

function handleSavePreset() {
  const presetData = getFormValues();

  if (!presetData) {
    window.alert("Create at least one category first.");
    switchTab("categories");
    elements.categoryNameInput.focus();
    return;
  }

  if (!presetData.name) {
    window.alert("Enter an activity name before saving it to Frequently Used.");
    elements.activityName.focus();
    return;
  }

  if (state.editingPresetId) {
    const preset = state.presets.find((item) => item.id === state.editingPresetId);

    if (!preset) {
      clearPresetEditingState();
      return;
    }

    applyLocalUpdateMetadata(preset, presetData);
  } else {
    state.presets.unshift(createLocalRecord({
      id: createId(),
      ...presetData
    }));
  }

  savePresets();
  clearPresetEditingState();
  renderAll();
}

function handleSaveGroup() {
  const name = elements.groupNameInput.value.trim();

  if (!name) {
    window.alert("Enter a group name before saving it.");
    elements.groupNameInput.focus();
    return;
  }

  const duplicate = state.groups.find((group) => {
    const sameName = group.name.toLowerCase() === name.toLowerCase();
    const differentRecord = group.id !== state.editingGroupId;
    return sameName && differentRecord;
  });

  if (duplicate) {
    window.alert("That group name already exists. Please choose a different name.");
    return;
  }

  if (state.editingGroupId) {
    const group = findGroupById(state.editingGroupId);

    if (!group) {
      clearGroupEditingState();
      return;
    }

    applyLocalUpdateMetadata(group, { name });
    synchronizeGroupReferences(group);
  } else {
    state.groups.push(createLocalRecord({
      id: createId(),
      name
    }));
  }

  saveGroups();
  saveCategories();
  saveActivities();
  saveDeletedActivities();
  savePresets();
  saveCurrentActivity();
  clearGroupEditingState();
  renderAll();
}

function handleSaveCategory() {
  const name = elements.categoryNameInput.value.trim();
  const selectedGroup = findGroupById(elements.categoryGroupSelect.value);

  if (!selectedGroup) {
    window.alert("Create a group first, then assign the category to it.");
    elements.groupNameInput.focus();
    return;
  }

  if (!name) {
    window.alert("Enter a category name before saving it.");
    elements.categoryNameInput.focus();
    return;
  }

  const duplicate = state.categories.find((category) => {
    const sameName = category.name.toLowerCase() === name.toLowerCase();
    const differentRecord = category.id !== state.editingCategoryId;
    return sameName && differentRecord;
  });

  if (duplicate) {
    window.alert("That category name already exists. Please choose a different name.");
    return;
  }

  if (state.editingCategoryId) {
    const category = findCategoryById(state.editingCategoryId);

    if (!category) {
      clearCategoryEditingState();
      return;
    }

    applyLocalUpdateMetadata(category, {
      name,
      groupId: selectedGroup.id,
      groupName: selectedGroup.name
    });
    synchronizeCategoryReferences(category);
  } else {
    state.categories.push(createLocalRecord({
      id: createId(),
      name,
      groupId: selectedGroup.id,
      groupName: selectedGroup.name
    }));
  }

  saveCategories();
  saveActivities();
  saveDeletedActivities();
  savePresets();
  saveCurrentActivity();
  clearCategoryEditingState();
  renderAll();
}

function clearForm() {
  elements.activityName.value = "";
  elements.activityCategory.value = state.categories[0]?.id || "";
  elements.activityNotes.value = "";
}

function clearManualForm() {
  elements.manualActivityName.value = "";
  elements.manualActivityCategory.value = state.categories[0]?.id || "";
  elements.manualActivityNotes.value = "";
  setDefaultManualTimes();
}

function clearManualEditingState() {
  state.editingActivityId = null;
  elements.saveManualActivityButton.textContent = "Save Activity";
  elements.cancelManualEditButton.hidden = true;
  elements.manualActivityHelperText.textContent = "Add a completed activity manually if you forgot to log it in real time.";
}

function handleCancelManualEdit() {
  clearManualEditingState();
  clearManualForm();
}

function clearPresetEditingState() {
  state.editingPresetId = null;
  elements.savePresetButton.textContent = "Save to Frequently Used";
  elements.cancelPresetEditButton.hidden = true;
  elements.presetHelperText.textContent = "Save common activities here for one-tap tracking.";
}

function setManualEditingState(activityId, missingCategory = "") {
  state.editingActivityId = activityId;
  elements.saveManualActivityButton.textContent = "Update Activity";
  elements.cancelManualEditButton.hidden = false;
  elements.manualActivityHelperText.textContent = missingCategory
    ? `Editing a saved activity. Its previous category "${missingCategory}" is no longer in the category list, so choose a new one before saving.`
    : "Editing a saved activity. Update the time, category, or notes, then save your changes.";
}

function clearGroupEditingState() {
  state.editingGroupId = null;
  elements.groupNameInput.value = "";
  elements.saveGroupButton.textContent = "Save Group";
  elements.cancelGroupEditButton.hidden = true;
  elements.groupHelperText.textContent = "Create general groups such as Work, Personal, or Other.";
}

function clearCategoryEditingState() {
  state.editingCategoryId = null;
  elements.categoryNameInput.value = "";
  elements.categoryGroupSelect.value = state.groups[0]?.id || "";
  elements.saveCategoryButton.textContent = "Save Category";
  elements.cancelCategoryEditButton.hidden = true;
  elements.categoryHelperText.textContent = "Create specific categories such as House Chores, Homework, Teaching, Errands, or Exercise.";
}

function setPresetEditingState(presetId, missingCategory = "") {
  state.editingPresetId = presetId;
  elements.savePresetButton.textContent = "Update Frequently Used";
  elements.cancelPresetEditButton.hidden = false;
  elements.presetHelperText.textContent = missingCategory
    ? `Editing a preset. Its previous category "${missingCategory}" is no longer in the category list, so choose a new one before saving.`
    : "Editing a saved quick-start preset.";
}

function setGroupEditingState(groupId) {
  state.editingGroupId = groupId;
  elements.saveGroupButton.textContent = "Update Group";
  elements.cancelGroupEditButton.hidden = false;
  elements.groupHelperText.textContent = "Editing a group updates linked categories, presets, and activity labels that use it.";
}

function setCategoryEditingState(categoryId) {
  state.editingCategoryId = categoryId;
  elements.saveCategoryButton.textContent = "Update Category";
  elements.cancelCategoryEditButton.hidden = false;
  elements.categoryHelperText.textContent = "Editing a category updates matching presets and activity labels that use it.";
}

function handleGroupListClick(event) {
  const actionButton = event.target.closest("[data-action]");

  if (!actionButton) {
    return;
  }

  const groupId = actionButton.dataset.id;

  if (actionButton.dataset.action === "edit-group") {
    loadGroupIntoEditor(groupId);
    return;
  }

  if (actionButton.dataset.action === "delete-group") {
    deleteGroup(groupId);
  }
}

function handleCategoryListClick(event) {
  const actionButton = event.target.closest("[data-action]");

  if (!actionButton) {
    return;
  }

  const categoryId = actionButton.dataset.id;

  if (actionButton.dataset.action === "edit-category") {
    loadCategoryIntoEditor(categoryId);
    return;
  }

  if (actionButton.dataset.action === "delete-category") {
    deleteCategory(categoryId);
  }
}

function handlePresetListClick(event) {
  const actionButton = event.target.closest("[data-action]");

  if (!actionButton) {
    return;
  }

  const presetId = actionButton.dataset.id;
  const action = actionButton.dataset.action;

  if (action === "start-preset") {
    startPreset(presetId);
    return;
  }

  if (action === "edit-preset") {
    loadPresetIntoForm(presetId);
    return;
  }

  if (action === "delete-preset") {
    deletePreset(presetId);
  }
}

function handleHistoryListClick(event) {
  const actionButton = event.target.closest("[data-action]");

  if (!actionButton) {
    return;
  }

  if (actionButton.dataset.action === "edit") {
    loadActivityIntoManualForm(actionButton.dataset.id);
    return;
  }

  if (actionButton.dataset.action === "delete") {
    deleteActivity(actionButton.dataset.id);
  }
}

function handleDeletedListClick(event) {
  const purgeButton = event.target.closest("[data-action='purge']");
  const restoreButton = event.target.closest("[data-action='restore']");

  if (purgeButton) {
    permanentlyDeleteActivity(purgeButton.dataset.id);
    return;
  }

  if (!restoreButton) {
    return;
  }

  restoreDeletedActivity(restoreButton.dataset.id);
}

function deleteActivity(activityId) {
  const activityIndex = state.activities.findIndex((activity) => activity.id === activityId);

  if (activityIndex === -1) {
    return;
  }

  const activity = state.activities[activityIndex];
  const shouldDelete = window.confirm(`Delete "${activity.name}" from the saved activity history?`);

  if (!shouldDelete) {
    return;
  }

  if (state.editingActivityId === activityId) {
    clearManualEditingState();
    clearManualForm();
  }

  state.activities.splice(activityIndex, 1);
  const deletedRecord = createLocalRecord({
    ...activity,
    deletedAt: getCurrentTimestamp()
  }, activity);

  deletedRecord.updatedAt = deletedRecord.deletedAt;
  deletedRecord.lastModifiedBy = state.deviceId;
  deletedRecord.syncStatus = "local-only";

  state.deletedActivities.unshift(deletedRecord);

  state.deletedActivities = state.deletedActivities.slice(0, 10);
  saveActivities();
  saveDeletedActivities();
  renderAll();
}

function permanentlyDeleteActivity(activityId) {
  const deletedIndex = state.deletedActivities.findIndex((activity) => activity.id === activityId);

  if (deletedIndex === -1) {
    return;
  }

  const activity = state.deletedActivities[deletedIndex];
  const shouldDelete = window.confirm(`Permanently delete "${activity.name}" from Recently Deleted? This cannot be undone.`);

  if (!shouldDelete) {
    return;
  }

  state.deletedActivities.splice(deletedIndex, 1);
  saveDeletedActivities();
  renderAll();
}

function restoreDeletedActivity(activityId) {
  const deletedIndex = state.deletedActivities.findIndex((activity) => activity.id === activityId);

  if (deletedIndex === -1) {
    return;
  }

  const deletedActivity = state.deletedActivities[deletedIndex];
  const { deletedAt, ...restoredActivity } = deletedActivity;

  state.deletedActivities.splice(deletedIndex, 1);
  state.activities.unshift(createLocalRecord({
    ...restoredActivity,
    updatedAt: getCurrentTimestamp(),
    lastModifiedBy: state.deviceId,
    syncStatus: "local-only"
  }, restoredActivity));
  saveActivities();
  saveDeletedActivities();
  renderAll();
}

function loadGroupIntoEditor(groupId) {
  const group = findGroupById(groupId);

  if (!group) {
    return;
  }

  elements.groupNameInput.value = group.name;
  setGroupEditingState(groupId);
  switchTab("categories");
  elements.groupNameInput.focus();
}

function loadActivityIntoManualForm(activityId) {
  const activity = state.activities.find((item) => item.id === activityId);

  if (!activity) {
    return;
  }

  const matchedCategory = activity.categoryId ? findCategoryById(activity.categoryId) : null;

  elements.manualActivityName.value = activity.name;
  elements.manualActivityNotes.value = activity.notes || "";
  elements.manualActivityCategory.value = matchedCategory ? matchedCategory.id : state.categories[0]?.id || "";
  elements.manualStartTime.value = toDateTimeInputValue(new Date(activity.startTime));
  elements.manualEndTime.value = toDateTimeInputValue(new Date(activity.endTime));
  setManualEditingState(activityId, matchedCategory ? "" : activity.categoryName);
  switchTrackerTab("manual");
  elements.manualActivityName.focus();
}

function loadCategoryIntoEditor(categoryId) {
  const category = findCategoryById(categoryId);

  if (!category) {
    return;
  }

  elements.categoryNameInput.value = category.name;
  elements.categoryGroupSelect.value = category.groupId;
  setCategoryEditingState(categoryId);
  switchTab("categories");
  elements.categoryNameInput.focus();
}

function deleteGroup(groupId) {
  const groupIndex = state.groups.findIndex((group) => group.id === groupId);

  if (groupIndex === -1) {
    return;
  }

  const group = state.groups[groupIndex];
  const linkedCategories = state.categories.filter((category) => category.groupId === groupId);

  if (linkedCategories.length) {
    window.alert(`"${group.name}" still has ${linkedCategories.length} categor${linkedCategories.length === 1 ? "y" : "ies"} assigned to it. Move or delete those categories before deleting the group.`);
    switchTab("categories");
    return;
  }

  const shouldDelete = window.confirm(`Delete the group "${group.name}"?`);

  if (!shouldDelete) {
    return;
  }

  state.groups.splice(groupIndex, 1);

  if (state.editingGroupId === groupId) {
    clearGroupEditingState();
  }

  saveGroups();
  renderAll();
}

function deleteCategory(categoryId) {
  const categoryIndex = state.categories.findIndex((category) => category.id === categoryId);

  if (categoryIndex === -1) {
    return;
  }

  const category = state.categories[categoryIndex];
  const shouldDelete = window.confirm(`Delete the category "${category.name}"? Existing history will keep its label, but future form selections will no longer offer it.`);

  if (!shouldDelete) {
    return;
  }

  state.categories.splice(categoryIndex, 1);
  clearCategoryReferencesFromActiveItems(categoryId);

  if (state.editingCategoryId === categoryId) {
    clearCategoryEditingState();
  }

  saveCategories();
  savePresets();
  saveCurrentActivity();
  renderAll();
}

function synchronizeGroupReferences(group) {
  state.categories.forEach((category) => {
    if (category.groupId === group.id) {
      applyLocalUpdateMetadata(category, { groupName: group.name });
    }
  });

  updateItemGroupReference(state.activities, group.id, group.name);
  updateItemGroupReference(state.deletedActivities, group.id, group.name);
  updateItemGroupReference(state.presets, group.id, group.name);

  if (state.currentActivity && state.currentActivity.groupId === group.id) {
    applyLocalUpdateMetadata(state.currentActivity, { groupName: group.name });
  }
}

function synchronizeCategoryReferences(category) {
  updateItemCategoryReference(state.activities, category);
  updateItemCategoryReference(state.deletedActivities, category);
  updateItemCategoryReference(state.presets, category);

  if (state.currentActivity && state.currentActivity.categoryId === category.id) {
    applyLocalUpdateMetadata(state.currentActivity, {
      categoryName: category.name,
      groupId: category.groupId,
      groupName: category.groupName
    });
  }
}

function clearCategoryReferencesFromActiveItems(categoryId) {
  state.presets.forEach((preset) => {
    if (preset.categoryId === categoryId) {
      applyLocalUpdateMetadata(preset, { categoryId: "" });
    }
  });

  if (state.currentActivity && state.currentActivity.categoryId === categoryId) {
    applyLocalUpdateMetadata(state.currentActivity, { categoryId: "" });
  }
}

function updateItemGroupReference(items, groupId, groupName) {
  items.forEach((item) => {
    if (item.groupId === groupId) {
      applyLocalUpdateMetadata(item, { groupName });
    }
  });
}

function updateItemCategoryReference(items, category) {
  items.forEach((item) => {
    if (item.categoryId === category.id) {
      applyLocalUpdateMetadata(item, {
        categoryName: category.name,
        groupId: category.groupId,
        groupName: category.groupName
      });
    }
  });
}

function addCompletedActivity(activityData) {
  const durationMs = activityData.durationMsOverride ?? (new Date(activityData.endTime).getTime() - new Date(activityData.startTime).getTime());

  state.activities.unshift(createLocalRecord({
    id: activityData.id || createId(),
    name: activityData.name,
    notes: activityData.notes || "",
    categoryId: activityData.categoryId,
    categoryName: activityData.categoryName,
    groupId: activityData.groupId,
    groupName: activityData.groupName,
    startTime: activityData.startTime,
    endTime: activityData.endTime,
    durationMs,
    updatedAt: activityData.updatedAt || activityData.endTime
  }, activityData));

  saveActivities();
}

function updateCompletedActivity(activityId, activityData) {
  const activityIndex = state.activities.findIndex((activity) => activity.id === activityId);

  if (activityIndex === -1) {
    return false;
  }

  state.activities[activityIndex] = createLocalRecord({
    ...state.activities[activityIndex],
    name: activityData.name,
    notes: activityData.notes || "",
    categoryId: activityData.categoryId,
    categoryName: activityData.categoryName,
    groupId: activityData.groupId,
    groupName: activityData.groupName,
    startTime: activityData.startTime,
    endTime: activityData.endTime,
    durationMs: new Date(activityData.endTime).getTime() - new Date(activityData.startTime).getTime(),
    updatedAt: getCurrentTimestamp(),
    lastModifiedBy: state.deviceId,
    syncStatus: "local-only"
  }, state.activities[activityIndex]);

  saveActivities();
  return true;
}

function startActivity(activityData) {
  const startTime = new Date().toISOString();

  state.currentActivity = createLocalRecord({
    id: createId(),
    name: activityData.name,
    notes: activityData.notes,
    categoryId: activityData.categoryId,
    categoryName: activityData.categoryName,
    groupId: activityData.groupId,
    groupName: activityData.groupName,
    startTime,
    status: "running",
    elapsedMsBeforePause: 0,
    lastResumedAt: startTime,
    pausedAt: null
  });

  saveCurrentActivity();
  renderAll();
}

function startPreset(presetId) {
  const preset = state.presets.find((item) => item.id === presetId);

  if (!preset) {
    return;
  }

  if (state.currentActivity) {
    window.alert("Please stop the current activity before starting a saved quick-start.");
    return;
  }

  startActivity(preset);
}

function getCurrentActivityElapsedMs(activity, nowIsoString = new Date().toISOString()) {
  if (!activity) {
    return 0;
  }

  if (activity.status === "paused") {
    return activity.elapsedMsBeforePause || 0;
  }

  const resumeTime = activity.lastResumedAt || activity.startTime;
  const currentSegmentMs = new Date(nowIsoString).getTime() - new Date(resumeTime).getTime();
  return Math.max(0, (activity.elapsedMsBeforePause || 0) + currentSegmentMs);
}

function loadPresetIntoForm(presetId) {
  const preset = state.presets.find((item) => item.id === presetId);

  if (!preset) {
    return;
  }

  const matchedCategory = preset.categoryId ? findCategoryById(preset.categoryId) : null;

  elements.activityName.value = preset.name;
  elements.activityNotes.value = preset.notes || "";
  elements.activityCategory.value = matchedCategory ? matchedCategory.id : state.categories[0]?.id || "";
  clearManualEditingState();
  elements.manualActivityName.value = preset.name;
  elements.manualActivityNotes.value = preset.notes || "";
  elements.manualActivityCategory.value = matchedCategory ? matchedCategory.id : state.categories[0]?.id || "";
  setPresetEditingState(presetId, matchedCategory ? "" : preset.categoryName);
  switchTrackerTab("live");
  switchTab("presets");
  elements.activityName.focus();
}

function deletePreset(presetId) {
  const presetIndex = state.presets.findIndex((preset) => preset.id === presetId);

  if (presetIndex === -1) {
    return;
  }

  const preset = state.presets[presetIndex];
  const shouldDelete = window.confirm(`Remove "${preset.name}" from Frequently Used?`);

  if (!shouldDelete) {
    return;
  }

  state.presets.splice(presetIndex, 1);

  if (state.editingPresetId === presetId) {
    clearPresetEditingState();
  }

  savePresets();
  renderAll();
}

function countCategoriesForGroup(groupId) {
  return state.categories.filter((category) => category.groupId === groupId).length;
}

function findGroupById(groupId) {
  return state.groups.find((group) => group.id === groupId) || null;
}

function findGroupByName(groupName) {
  const normalizedName = String(groupName || "").trim().toLowerCase();

  if (!normalizedName) {
    return null;
  }

  return state.groups.find((group) => group.name.toLowerCase() === normalizedName) || null;
}

function findCategoryById(categoryId) {
  return state.categories.find((category) => category.id === categoryId) || null;
}

function getGroupColor(groupName) {
  const name = String(groupName || "Ungrouped");
  let hash = 0;

  for (let index = 0; index < name.length; index += 1) {
    hash = (hash << 5) - hash + name.charCodeAt(index);
    hash |= 0;
  }

  return GROUP_COLOR_PALETTE[Math.abs(hash) % GROUP_COLOR_PALETTE.length];
}

function renderCategoryBadge(categoryName, groupName) {
  return `<span class="category-badge" style="background: ${getGroupColor(groupName)};">${escapeHtml(categoryName)}</span>`;
}

function renderGroupBadge(groupName) {
  return `<span class="category-badge" style="background: ${getGroupColor(groupName)};">${escapeHtml(groupName)}</span>`;
}

function renderGroupTag(groupName) {
  return `<span class="tag">Group: ${escapeHtml(groupName || "Ungrouped")}</span>`;
}

function exportActivities(format) {
  if (!state.activities.length) {
    window.alert("There are no saved activities to export yet.");
    return;
  }

  if (format === "json") {
    downloadFile("activity-log.json", JSON.stringify(state.activities, null, 2), "application/json");
    return;
  }

  const rows = [
    ["Activity Name", "Category", "Group", "Start Time", "End Time", "Duration Minutes", "Notes/Tags"],
    ...state.activities.map((activity) => [
      activity.name,
      activity.categoryName,
      activity.groupName,
      activity.startTime,
      activity.endTime,
      (activity.durationMs / 60000).toFixed(2),
      activity.notes || ""
    ])
  ];

  const csv = rows
    .map((row) => row.map((value) => `"${String(value).replaceAll("\"", "\"\"")}"`).join(","))
    .join("\n");

  downloadFile("activity-log.csv", csv, "text/csv;charset=utf-8");
}

async function handleCreateOfferCode() {
  if (!window.RTCPeerConnection) {
    renderDeviceSyncStatus("This browser does not support live peer-to-peer device linking.", "error");
    return;
  }

  try {
    disconnectLiveSync({ silent: true });
    const peerConnection = createPeerConnection("host");
    const dataChannel = peerConnection.createDataChannel("activity-sync");
    attachDataChannel(dataChannel);

    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    await waitForIceGatheringComplete(peerConnection);

    elements.hostOfferCode.value = encodeSignalPayload(peerConnection.localDescription);
    elements.hostAnswerCodeInput.value = "";
    renderDeviceSyncStatus("Connection code created. Share it with the second device, then paste the reply code here.", "neutral");
  } catch (error) {
    console.error("Unable to create connection code:", error);
    renderDeviceSyncStatus("The connection code could not be created.", "error");
  }
}

async function handleCreateShortCode() {
  const serverUrl = getNormalizedSignalingServerUrl();

  if (!serverUrl) {
    renderSignalingState("Save a signaling server URL before creating a short code.", "error");
    return;
  }

  if (!window.RTCPeerConnection) {
    renderSignalingState("This browser does not support live peer-to-peer device linking.", "error");
    return;
  }

  try {
    disconnectLiveSync({ silent: true });
    const peerConnection = createPeerConnection("host");
    const dataChannel = peerConnection.createDataChannel("activity-sync");
    attachDataChannel(dataChannel);

    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    await waitForIceGatheringComplete(peerConnection);

    const response = await signalingRequest("/sessions", {
      method: "POST",
      body: {
        offer: encodeSignalPayload(peerConnection.localDescription),
        requestedCode: sanitizeShortCode(elements.preferredShortCode.value)
      }
    });

    runtime.activeShortCode = response.code || "";
    elements.activeShortCodeOutput.value = runtime.activeShortCode;
    startShortCodePolling(runtime.activeShortCode);
    renderSignalingState(`Short code ${runtime.activeShortCode || "created"} is ready. Share it with the second device.`, "success");
  } catch (error) {
    console.error("Unable to create short code:", error);
    renderSignalingState("The short code could not be created. Check the signaling server and try again.", "error");
  }
}

async function handleJoinShortCode() {
  const serverUrl = getNormalizedSignalingServerUrl();
  const shortCode = sanitizeShortCode(elements.joinShortCodeInput.value);

  if (!serverUrl) {
    renderSignalingState("Save a signaling server URL before joining with a short code.", "error");
    return;
  }

  if (!shortCode) {
    renderSignalingState("Enter a short code before joining.", "error");
    return;
  }

  if (!window.RTCPeerConnection) {
    renderSignalingState("This browser does not support live peer-to-peer device linking.", "error");
    return;
  }

  try {
    disconnectLiveSync({ silent: true });
    const session = await signalingRequest(`/sessions/${encodeURIComponent(shortCode)}`, {
      method: "GET"
    });
    const remoteOffer = decodeSignalPayload(session.offer);
    const peerConnection = createPeerConnection("join");
    await peerConnection.setRemoteDescription(new RTCSessionDescription(remoteOffer));

    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    await waitForIceGatheringComplete(peerConnection);

    await signalingRequest(`/sessions/${encodeURIComponent(shortCode)}/answer`, {
      method: "POST",
      body: {
        answer: encodeSignalPayload(peerConnection.localDescription)
      }
    });

    runtime.activeShortCode = shortCode;
    elements.activeShortCodeOutput.value = runtime.activeShortCode;
    renderSignalingState(`Joined short code ${shortCode}. Waiting for the live link to finish connecting.`, "success");
  } catch (error) {
    console.error("Unable to join short code:", error);
    renderSignalingState("The short code could not be joined. Check that it is still active and try again.", "error");
  }
}

function startShortCodePolling(shortCode) {
  stopShortCodePolling();

  if (!shortCode) {
    return;
  }

  runtime.signalingPollTimer = window.setInterval(async () => {
    if (!runtime.peerConnection || runtime.peerConnection.remoteDescription) {
      stopShortCodePolling();
      return;
    }

    try {
      const session = await signalingRequest(`/sessions/${encodeURIComponent(shortCode)}`, {
        method: "GET"
      });

      if (!session.answer) {
        return;
      }

      const remoteAnswer = decodeSignalPayload(session.answer);
      await runtime.peerConnection.setRemoteDescription(new RTCSessionDescription(remoteAnswer));
      stopShortCodePolling();
      renderSignalingState(`Short code ${shortCode} completed. Waiting for live sync to become active.`, "success");
    } catch (error) {
      console.error("Unable to poll short code session:", error);
    }
  }, 2500);
}

function stopShortCodePolling() {
  if (runtime.signalingPollTimer) {
    window.clearInterval(runtime.signalingPollTimer);
    runtime.signalingPollTimer = null;
  }
}

async function signalingRequest(path, options = {}) {
  const serverUrl = getNormalizedSignalingServerUrl();

  if (!serverUrl) {
    throw new Error("No signaling server URL is configured.");
  }

  const response = await fetch(`${serverUrl}${path}`, {
    method: options.method || "GET",
    headers: {
      "Content-Type": "application/json"
    },
    body: options.body ? JSON.stringify(options.body) : undefined
  });

  if (!response.ok) {
    throw new Error(`Signaling request failed with status ${response.status}`);
  }

  return response.json();
}

function sanitizeShortCode(value) {
  return String(value || "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9-]/g, "")
    .slice(0, 32);
}

async function handleCreateAnswerCode() {
  if (!window.RTCPeerConnection) {
    renderDeviceSyncStatus("This browser does not support live peer-to-peer device linking.", "error");
    return;
  }

  const offerCode = elements.joinOfferCodeInput.value.trim();

  if (!offerCode) {
    renderDeviceSyncStatus("Paste the first device's connection code before generating a reply.", "error");
    return;
  }

  try {
    disconnectLiveSync({ silent: true });
    const peerConnection = createPeerConnection("join");
    const remoteOffer = decodeSignalPayload(offerCode);
    await peerConnection.setRemoteDescription(new RTCSessionDescription(remoteOffer));

    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    await waitForIceGatheringComplete(peerConnection);

    elements.joinAnswerCodeOutput.value = encodeSignalPayload(peerConnection.localDescription);
    renderDeviceSyncStatus("Reply code generated. Send it back to the first device to finish linking.", "neutral");
  } catch (error) {
    console.error("Unable to create reply code:", error);
    renderDeviceSyncStatus("The reply code could not be created. Double-check the first device's code and try again.", "error");
  }
}

async function handleAcceptAnswerCode() {
  const answerCode = elements.hostAnswerCodeInput.value.trim();

  if (!answerCode) {
    renderDeviceSyncStatus("Paste the reply code from the second device before finishing the link.", "error");
    return;
  }

  if (!runtime.peerConnection) {
    renderDeviceSyncStatus("Create a connection code first on this device.", "error");
    return;
  }

  try {
    const remoteAnswer = decodeSignalPayload(answerCode);
    await runtime.peerConnection.setRemoteDescription(new RTCSessionDescription(remoteAnswer));
    renderDeviceSyncStatus("Reply code accepted. Waiting for the devices to complete their live link.", "neutral");
  } catch (error) {
    console.error("Unable to accept reply code:", error);
    renderDeviceSyncStatus("That reply code could not be accepted. Make sure it came from the second device for this session.", "error");
  }
}

function createPeerConnection(role) {
  const peerConnection = new RTCPeerConnection({
    iceServers: [
      {
        urls: "stun:stun.l.google.com:19302"
      }
    ]
  });

  runtime.peerConnection = peerConnection;
  runtime.peerRole = role;

  peerConnection.onconnectionstatechange = () => {
    const connectionState = peerConnection.connectionState;

    if (connectionState === "connected") {
      renderDeviceSyncStatus("Devices are linked and live updates are active while both apps remain open.", "success");
      broadcastSnapshotToPeer("initial-sync");
      return;
    }

    if (["failed", "disconnected", "closed"].includes(connectionState)) {
      if (runtime.peerConnection === peerConnection) {
        disconnectLiveSync({ silent: true });
      }

      renderDeviceSyncStatus("The live device link ended. You can generate a new code to reconnect.", "error");
      return;
    }

    renderDeviceSyncStatus(`Live link status: ${connectionState}.`, "neutral");
  };

  peerConnection.ondatachannel = (event) => {
    attachDataChannel(event.channel);
  };

  return peerConnection;
}

function attachDataChannel(dataChannel) {
  runtime.dataChannel = dataChannel;

  dataChannel.onopen = () => {
    renderDeviceSyncStatus("Devices are linked and live updates are active while both apps remain open.", "success");
    broadcastSnapshotToPeer("initial-sync");
  };

  dataChannel.onclose = () => {
    if (runtime.dataChannel === dataChannel) {
      runtime.dataChannel = null;
      renderDeviceSyncStatus("The live device link closed. You can create a new device code to reconnect.", "error");
    }
  };

  dataChannel.onerror = (error) => {
    console.error("Live sync data channel error:", error);
    renderDeviceSyncStatus("The live device link hit an error.", "error");
  };

  dataChannel.onmessage = handlePeerMessage;
}

async function waitForIceGatheringComplete(peerConnection) {
  if (peerConnection.iceGatheringState === "complete") {
    return;
  }

  await new Promise((resolve) => {
    function handleStateChange() {
      if (peerConnection.iceGatheringState === "complete") {
        peerConnection.removeEventListener("icegatheringstatechange", handleStateChange);
        resolve();
      }
    }

    peerConnection.addEventListener("icegatheringstatechange", handleStateChange);
  });
}

function encodeSignalPayload(description) {
  return window.btoa(JSON.stringify(description));
}

function decodeSignalPayload(encodedValue) {
  return JSON.parse(window.atob(encodedValue.trim()));
}

function disconnectLiveSync(options = {}) {
  stopShortCodePolling();

  if (runtime.dataChannel) {
    runtime.dataChannel.close();
    runtime.dataChannel = null;
  }

  if (runtime.peerConnection) {
    runtime.peerConnection.close();
    runtime.peerConnection = null;
  }

  runtime.peerRole = "";
  runtime.activeShortCode = "";
  elements.hostOfferCode.value = "";
  elements.hostAnswerCodeInput.value = "";
  elements.joinOfferCodeInput.value = "";
  elements.joinAnswerCodeOutput.value = "";
  elements.activeShortCodeOutput.value = "";

  if (!options.silent) {
    renderDeviceSyncStatus("Live link disconnected. You can generate a new device code whenever you want to reconnect.", "neutral");
    renderSignalingState("Short-code session cleared. You can create a new short code whenever you want to reconnect.", "neutral");
  } else {
    renderDeviceSyncStatus();
    renderSignalingState();
  }
}

function broadcastSnapshotToPeer(reason = "update") {
  if (!runtime.dataChannel || runtime.dataChannel.readyState !== "open") {
    return;
  }

  runtime.dataChannel.send(JSON.stringify({
    type: "snapshot",
    reason,
    sourceDeviceId: state.deviceId,
    sentAt: getCurrentTimestamp(),
    snapshot: getTransferSnapshot()
  }));
}

function handlePeerMessage(event) {
  try {
    const payload = JSON.parse(event.data);

    if (payload.type !== "snapshot" || !payload.snapshot) {
      return;
    }

    runWithoutPeerBroadcast(() => {
      const mergedSnapshot = mergeSnapshots(getTransferSnapshot(), payload.snapshot);
      applySnapshotToState(mergedSnapshot);
      saveAllData();
      renderAll();
    });

    renderDeviceSyncStatus(`Live sync updated from device ${payload.sourceDeviceId || "unknown"}.`, "success");
  } catch (error) {
    console.error("Unable to process live sync message:", error);
    renderDeviceSyncStatus("A live sync update could not be applied.", "error");
  }
}

function runWithoutPeerBroadcast(work) {
  runtime.isApplyingRemoteSync = true;

  try {
    work();
  } finally {
    runtime.isApplyingRemoteSync = false;
  }
}

async function copyTextToClipboard(value, successMessage) {
  if (!value.trim()) {
    return;
  }

  try {
    await navigator.clipboard.writeText(value);
    renderDeviceSyncStatus(successMessage, "success");
  } catch (error) {
    console.error("Unable to copy text:", error);
    renderDeviceSyncStatus("Copy failed. You can still select the code manually.", "error");
  }
}

async function handleExportEncryptedBackup() {
  if (!window.crypto?.subtle) {
    setBackupStatus("This browser does not support encrypted backup in the required Web Crypto APIs.", "error");
    return;
  }

  const passphrase = elements.backupPassphrase.value;
  const confirmPassphrase = elements.backupPassphraseConfirm.value;

  if (!passphrase || !confirmPassphrase) {
    setBackupStatus("Enter and confirm a passphrase before downloading an encrypted backup.", "error");
    return;
  }

  if (passphrase !== confirmPassphrase) {
    setBackupStatus("The two passphrase entries do not match.", "error");
    return;
  }

  if (passphrase.length < 8) {
    setBackupStatus("Use a passphrase with at least 8 characters for the encrypted backup.", "error");
    return;
  }

  try {
    const payload = {
      format: "local-activity-tracker-backup",
      schemaVersion: DATA_SCHEMA_VERSION,
      exportedAt: getCurrentTimestamp(),
      sourceDeviceId: state.deviceId,
      data: getTransferSnapshot()
    };

    const encryptedBackup = await encryptBackupPayload(payload, passphrase);
    downloadFile(
      `activity-tracker-backup-${toDateInputValue(new Date())}.json`,
      JSON.stringify(encryptedBackup, null, 2),
      "application/json"
    );
    elements.backupPassphrase.value = "";
    elements.backupPassphraseConfirm.value = "";
    setBackupStatus("Encrypted backup downloaded. Keep the passphrase safe because the backup cannot be opened without it.", "success");
  } catch (error) {
    console.error("Unable to create encrypted backup:", error);
    setBackupStatus("The encrypted backup could not be created.", "error");
  }
}

async function handleImportEncryptedBackup() {
  if (!window.crypto?.subtle) {
    setBackupStatus("This browser does not support encrypted import in the required Web Crypto APIs.", "error");
    return;
  }

  const file = elements.importBackupFile.files?.[0];
  const passphrase = elements.importBackupPassphrase.value;

  if (!file) {
    setBackupStatus("Choose an encrypted backup file before importing.", "error");
    return;
  }

  if (!passphrase) {
    setBackupStatus("Enter the backup passphrase before importing.", "error");
    return;
  }

  try {
    const fileContents = await file.text();
    const encryptedBackup = JSON.parse(fileContents);
    const decryptedPayload = await decryptBackupPayload(encryptedBackup, passphrase);

    if (!decryptedPayload || decryptedPayload.format !== "local-activity-tracker-backup" || !decryptedPayload.data) {
      throw new Error("Backup file format is not recognized.");
    }

    const mergedSnapshot = mergeSnapshots(getTransferSnapshot(), decryptedPayload.data);
    applySnapshotToState(mergedSnapshot);
    saveAllData();
    renderAll();
    elements.importBackupFile.value = "";
    elements.importBackupPassphrase.value = "";
    setBackupStatus(`Encrypted backup imported and merged from device ${decryptedPayload.sourceDeviceId || "unknown"}.`, "success");
  } catch (error) {
    console.error("Unable to import encrypted backup:", error);
    setBackupStatus("The backup could not be imported. Check that the file and passphrase are correct.", "error");
  }
}

function getTransferSnapshot() {
  return {
    groups: state.groups,
    categories: state.categories,
    activities: state.activities,
    deletedActivities: state.deletedActivities,
    presets: state.presets,
    currentActivity: state.currentActivity
  };
}

function applySnapshotToState(snapshot) {
  const incomingGroups = snapshot.groups || [];
  const incomingCategories = snapshot.categories || [];
  const incomingActivities = snapshot.activities || [];
  const incomingDeleted = snapshot.deletedActivities || [];
  const incomingPresets = snapshot.presets || [];
  const incomingCurrent = snapshot.currentActivity || null;
  const legacyGroupNames = collectLegacyGroupNames(
    incomingGroups,
    incomingCategories,
    incomingActivities,
    incomingDeleted,
    incomingPresets,
    incomingCurrent
  );

  state.groups = normalizeStoredGroups(incomingGroups, legacyGroupNames);
  state.categories = normalizeStoredCategories(incomingCategories);
  state.activities = normalizeStoredActivities(incomingActivities);
  state.deletedActivities = normalizeStoredActivities(incomingDeleted)
    .sort((left, right) => getRecordTimestamp(right) - getRecordTimestamp(left))
    .slice(0, 10);
  state.presets = normalizeStoredPresets(incomingPresets);
  state.currentActivity = normalizeStoredCurrentActivity(incomingCurrent);

  clearManualEditingState();
  clearPresetEditingState();
  clearGroupEditingState();
  clearCategoryEditingState();
  clearForm();
  clearManualForm();
}

function mergeSnapshots(localSnapshot, importedSnapshot) {
  const mergedActivityState = mergeActivityState(
    localSnapshot.activities || [],
    localSnapshot.deletedActivities || [],
    importedSnapshot.activities || [],
    importedSnapshot.deletedActivities || []
  );

  return {
    groups: mergeRecordCollections(localSnapshot.groups || [], importedSnapshot.groups || []),
    categories: mergeRecordCollections(localSnapshot.categories || [], importedSnapshot.categories || []),
    presets: mergeRecordCollections(localSnapshot.presets || [], importedSnapshot.presets || []),
    activities: mergedActivityState.activities,
    deletedActivities: mergedActivityState.deletedActivities,
    currentActivity: mergeCurrentActivity(localSnapshot, importedSnapshot)
  };
}

function mergeRecordCollections(localRecords, importedRecords) {
  const mergedById = new Map();
  const orderedIds = [];

  [...localRecords, ...importedRecords].forEach((record) => {
    if (!record || !record.id) {
      return;
    }

    if (!mergedById.has(record.id)) {
      orderedIds.push(record.id);
      mergedById.set(record.id, record);
      return;
    }

    mergedById.set(record.id, chooseNewerRecord(mergedById.get(record.id), record));
  });

  return orderedIds
    .map((recordId) => mergedById.get(recordId))
    .filter(Boolean);
}

function mergeActivityState(localActivities, localDeletedActivities, importedActivities, importedDeletedActivities) {
  const combinedById = new Map();

  function upsert(records, location) {
    records.forEach((record) => {
      if (!record || !record.id) {
        return;
      }

      const candidate = {
        ...record,
        __location: location
      };
      const existing = combinedById.get(record.id);

      if (!existing) {
        combinedById.set(record.id, candidate);
        return;
      }

      combinedById.set(record.id, chooseNewerRecord(existing, candidate));
    });
  }

  upsert(localActivities, "active");
  upsert(localDeletedActivities, "deleted");
  upsert(importedActivities, "active");
  upsert(importedDeletedActivities, "deleted");

  const activities = [];
  const deletedActivities = [];

  combinedById.forEach((record) => {
    const { __location, ...cleanRecord } = record;

    if (__location === "deleted") {
      deletedActivities.push(cleanRecord);
      return;
    }

    activities.push(cleanRecord);
  });

  activities.sort((left, right) => getRecordTimestamp(right) - getRecordTimestamp(left));
  deletedActivities.sort((left, right) => getRecordTimestamp(right) - getRecordTimestamp(left));

  return {
    activities,
    deletedActivities: deletedActivities.slice(0, 10)
  };
}

function chooseNewerRecord(leftRecord, rightRecord) {
  if (!leftRecord) {
    return rightRecord ? { ...rightRecord } : null;
  }

  if (!rightRecord) {
    return { ...leftRecord };
  }

  const leftTimestamp = getRecordTimestamp(leftRecord);
  const rightTimestamp = getRecordTimestamp(rightRecord);

  if (rightTimestamp >= leftTimestamp) {
    return { ...rightRecord };
  }

  return { ...leftRecord };
}

function mergeCurrentActivity(localSnapshot, importedSnapshot) {
  const localCurrent = localSnapshot.currentActivity || null;
  const importedCurrent = importedSnapshot.currentActivity || null;

  if (localCurrent && !importedCurrent && hasCompletedVersionOfCurrentActivity(localCurrent, importedSnapshot.activities || [])) {
    return null;
  }

  if (importedCurrent && !localCurrent && hasCompletedVersionOfCurrentActivity(importedCurrent, localSnapshot.activities || [])) {
    return null;
  }

  return chooseNewerRecord(localCurrent, importedCurrent);
}

function hasCompletedVersionOfCurrentActivity(currentActivity, completedActivities) {
  const matchingCompletedActivity = completedActivities.find((activity) => activity.id === currentActivity.id);

  if (!matchingCompletedActivity) {
    return false;
  }

  return getRecordTimestamp(matchingCompletedActivity) >= getRecordTimestamp(currentActivity);
}

function getRecordTimestamp(record) {
  if (!record) {
    return 0;
  }

  const timestamp = record.deletedAt || record.updatedAt || record.endTime || record.startTime || record.createdAt;
  const timeValue = new Date(timestamp).getTime();
  return Number.isNaN(timeValue) ? 0 : timeValue;
}

async function encryptBackupPayload(payload, passphrase) {
  const salt = window.crypto.getRandomValues(new Uint8Array(16));
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const iterations = 250000;
  const key = await derivePassphraseKey(passphrase, salt, iterations);
  const encodedPayload = new TextEncoder().encode(JSON.stringify(payload));
  const ciphertext = await window.crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv
    },
    key,
    encodedPayload
  );

  return {
    format: "local-activity-tracker-encrypted-backup",
    version: 1,
    algorithm: "AES-GCM",
    kdf: "PBKDF2-SHA-256",
    iterations,
    salt: bytesToBase64(salt),
    iv: bytesToBase64(iv),
    ciphertext: bytesToBase64(new Uint8Array(ciphertext)),
    createdAt: getCurrentTimestamp(),
    sourceDeviceId: state.deviceId
  };
}

async function decryptBackupPayload(encryptedBackup, passphrase) {
  if (!encryptedBackup || encryptedBackup.format !== "local-activity-tracker-encrypted-backup") {
    throw new Error("Unrecognized encrypted backup format.");
  }

  const salt = base64ToBytes(encryptedBackup.salt);
  const iv = base64ToBytes(encryptedBackup.iv);
  const ciphertext = base64ToBytes(encryptedBackup.ciphertext);
  const iterations = Number(encryptedBackup.iterations) || 250000;
  const key = await derivePassphraseKey(passphrase, salt, iterations);
  const decryptedBuffer = await window.crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv
    },
    key,
    ciphertext
  );

  return JSON.parse(new TextDecoder().decode(decryptedBuffer));
}

async function derivePassphraseKey(passphrase, salt, iterations) {
  const keyMaterial = await window.crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(passphrase),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );

  return window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations,
      hash: "SHA-256"
    },
    keyMaterial,
    {
      name: "AES-GCM",
      length: 256
    },
    false,
    ["encrypt", "decrypt"]
  );
}

function bytesToBase64(bytes) {
  let binary = "";

  bytes.forEach((value) => {
    binary += String.fromCharCode(value);
  });

  return window.btoa(binary);
}

function base64ToBytes(base64Value) {
  const binary = window.atob(base64Value);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
}

function setBackupStatus(message, tone = "neutral") {
  elements.backupStatus.textContent = message;
  elements.backupStatus.className = `empty-state backup-status backup-status--${tone}`;
}

function downloadFile(filename, content, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function getOrCreateDeviceId() {
  const existingId = localStorage.getItem(STORAGE_KEYS.deviceId);

  if (existingId) {
    return existingId;
  }

  const deviceId = `device-${createId()}`;
  localStorage.setItem(STORAGE_KEYS.deviceId, deviceId);
  return deviceId;
}

function getCurrentTimestamp() {
  return new Date().toISOString();
}

function createId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;
}

function formatDuration(milliseconds) {
  if (!milliseconds || milliseconds < 0) {
    return "0m";
  }

  const totalMinutes = Math.round(milliseconds / 60000);
  const days = Math.floor(totalMinutes / 1440);
  const remainingMinutes = totalMinutes % 1440;
  const hours = Math.floor(remainingMinutes / 60);
  const minutes = remainingMinutes % 60;

  if (days > 0) {
    if (hours === 0 && minutes === 0) {
      return `${days}d`;
    }

    if (minutes === 0) {
      return `${days}d ${hours}h`;
    }

    return `${days}d ${hours}h ${minutes}m`;
  }

  if (hours === 0) {
    return `${minutes}m`;
  }

  if (minutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${minutes}m`;
}

function formatDateTime(isoString) {
  return new Date(isoString).toLocaleString([], {
    dateStyle: "medium",
    timeStyle: "short"
  });
}

function formatTimeOnly(isoString) {
  return new Date(isoString).toLocaleTimeString([], {
    timeStyle: "short"
  });
}

function formatPercent(part, total) {
  if (!total) {
    return "0%";
  }

  return `${Math.round((part / total) * 100)}%`;
}

function toDateInputValue(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function toDateTimeInputValue(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\"", "&quot;")
    .replaceAll("'", "&#39;");
}
