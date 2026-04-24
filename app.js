const STORAGE_KEYS = {
  activities: "localActivityTracker.activities",
  current: "localActivityTracker.currentActivity",
  deleted: "localActivityTracker.deletedActivities",
  presets: "localActivityTracker.presets",
  groups: "localActivityTracker.groups",
  categories: "localActivityTracker.categories"
};

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
  activities: [],
  deletedActivities: [],
  presets: [],
  groups: [],
  categories: [],
  currentActivity: null,
  timerId: null,
  editingPresetId: null,
  editingGroupId: null,
  editingCategoryId: null,
  activeTab: "presets"
};

const elements = {
  activityForm: document.getElementById("activityForm"),
  activityName: document.getElementById("activityName"),
  activityCategory: document.getElementById("activityCategory"),
  activityNotes: document.getElementById("activityNotes"),
  startButton: document.getElementById("startButton"),
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
  startDateFilter: document.getElementById("startDateFilter"),
  endDateFilter: document.getElementById("endDateFilter"),
  scopeFilter: document.getElementById("scopeFilter"),
  resetFiltersButton: document.getElementById("resetFiltersButton"),
  totalTimeStat: document.getElementById("totalTimeStat"),
  activityCountStat: document.getElementById("activityCountStat"),
  topGroupStat: document.getElementById("topGroupStat"),
  topCategoryStat: document.getElementById("topCategoryStat"),
  categoryBreakdown: document.getElementById("categoryBreakdown"),
  chartContainer: document.getElementById("chartContainer"),
  tabButtons: Array.from(document.querySelectorAll("[data-tab]")),
  tabPanels: Array.from(document.querySelectorAll("[data-tab-panel]"))
};

document.addEventListener("DOMContentLoaded", init);

function init() {
  loadState();
  setDefaultFilters();
  bindEvents();
  renderAll();

  // Refresh the live timer every second while an activity is running.
  state.timerId = window.setInterval(() => {
    if (state.currentActivity) {
      renderCurrentActivity();
    }
  }, 1000);
}

function bindEvents() {
  elements.activityForm.addEventListener("submit", handleStartActivity);
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
  elements.startDateFilter.addEventListener("change", renderAnalytics);
  elements.endDateFilter.addEventListener("change", renderAnalytics);
  elements.scopeFilter.addEventListener("change", renderAnalytics);
  elements.resetFiltersButton.addEventListener("click", () => {
    setDefaultFilters();
    renderAnalytics();
  });
  elements.tabButtons.forEach((button) => {
    button.addEventListener("click", () => switchTab(button.dataset.tab));
  });
}

function loadState() {
  try {
    const rawGroups = JSON.parse(localStorage.getItem(STORAGE_KEYS.groups)) || [];
    const rawCategories = JSON.parse(localStorage.getItem(STORAGE_KEYS.categories)) || [];
    const rawActivities = JSON.parse(localStorage.getItem(STORAGE_KEYS.activities)) || [];
    const rawDeleted = JSON.parse(localStorage.getItem(STORAGE_KEYS.deleted)) || [];
    const rawPresets = JSON.parse(localStorage.getItem(STORAGE_KEYS.presets)) || [];
    const rawCurrent = JSON.parse(localStorage.getItem(STORAGE_KEYS.current)) || null;

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

  saveGroups();
  saveCategories();
  saveActivities();
  saveDeletedActivities();
  savePresets();
  saveCurrentActivity();
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
    normalized.push({
      id: group.id || createId(),
      name
    });
  });

  legacyGroupNames.forEach((name) => {
    const trimmedName = name.trim();
    const key = trimmedName.toLowerCase();

    if (!trimmedName || seenNames.has(key)) {
      return;
    }

    seenNames.add(key);
    normalized.push({
      id: createId(),
      name: trimmedName
    });
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

      return {
        id: category.id || createId(),
        name,
        groupId: group ? group.id : "",
        groupName: group ? group.name : category.groupName || category.group || ""
      };
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

  return normalizeCategoryReference(activity);
}

function normalizeCategoryReference(item) {
  if (!item) {
    return null;
  }

  const matchedCategory = item.categoryId ? findCategoryById(item.categoryId) : null;
  const matchedGroup = matchedCategory
    ? findGroupById(matchedCategory.groupId)
    : resolveGroupReference(item);

  return {
    ...item,
    id: item.id || createId(),
    categoryId: matchedCategory ? matchedCategory.id : item.categoryId || "",
    categoryName: matchedCategory ? matchedCategory.name : item.categoryName || item.category || "Uncategorized",
    groupId: matchedGroup ? matchedGroup.id : item.groupId || "",
    groupName: matchedGroup ? matchedGroup.name : item.groupName || item.categoryGroup || item.group || "Ungrouped"
  };
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

function saveActivities() {
  localStorage.setItem(STORAGE_KEYS.activities, JSON.stringify(state.activities));
}

function saveDeletedActivities() {
  localStorage.setItem(STORAGE_KEYS.deleted, JSON.stringify(state.deletedActivities));
}

function savePresets() {
  localStorage.setItem(STORAGE_KEYS.presets, JSON.stringify(state.presets));
}

function saveGroups() {
  localStorage.setItem(STORAGE_KEYS.groups, JSON.stringify(state.groups));
}

function saveCategories() {
  localStorage.setItem(STORAGE_KEYS.categories, JSON.stringify(state.categories));
}

function saveCurrentActivity() {
  if (state.currentActivity) {
    localStorage.setItem(STORAGE_KEYS.current, JSON.stringify(state.currentActivity));
  } else {
    localStorage.removeItem(STORAGE_KEYS.current);
  }
}

function setDefaultFilters() {
  const today = new Date();
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(today.getDate() - 6);

  elements.startDateFilter.value = toDateInputValue(sevenDaysAgo);
  elements.endDateFilter.value = toDateInputValue(today);
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
}

function renderAll() {
  renderCategoryOptions();
  renderGroupOptions();
  renderScopeOptions();
  renderTabState();
  renderGroups();
  renderCategories();
  renderPresets();
  renderCurrentActivity();
  renderHistory();
  renderDeletedActivities();
  renderAnalytics();
}

function renderCategoryOptions() {
  const selectedValue = elements.activityCategory.value;

  if (!state.categories.length) {
    elements.activityCategory.innerHTML = `<option value="">Create a category first</option>`;
    elements.activityCategory.value = "";
    return;
  }

  elements.activityCategory.innerHTML = state.categories
    .map((category) => `<option value="${category.id}">${escapeHtml(category.name)} (${escapeHtml(category.groupName || "Ungrouped")})</option>`)
    .join("");

  const optionExists = state.categories.some((category) => category.id === selectedValue);
  elements.activityCategory.value = optionExists ? selectedValue : state.categories[0].id;
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

  elements.scopeFilter.innerHTML = options.join("");
  elements.scopeFilter.value = [...groupNames].includes(selectedValue) || selectedValue === "All" ? selectedValue : "All";
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
  const isRunning = Boolean(state.currentActivity);
  elements.statusPill.textContent = isRunning ? "Tracking now" : "Idle";
  elements.statusPill.className = `status-pill ${isRunning ? "status-pill--running" : "status-pill--idle"}`;
  elements.startButton.disabled = isRunning;
  elements.stopButton.disabled = !isRunning;

  if (!isRunning) {
    elements.currentActivityCard.className = "current-card current-card--empty";
    elements.currentActivityCard.innerHTML = `
      <p class="current-card__label">Current activity</p>
      <h3>No activity is running</h3>
      <p>When you tap Start, the timer begins immediately and stays saved locally in this browser.</p>
    `;
    return;
  }

  const running = state.currentActivity;
  const elapsedMs = Date.now() - new Date(running.startTime).getTime();

  elements.currentActivityCard.className = "current-card current-card--running";
  elements.currentActivityCard.innerHTML = `
    <p class="current-card__label">Current activity</p>
    <h3>${escapeHtml(running.name)}</h3>
    <p>Started ${formatDateTime(running.startTime)} and has been running for <strong>${formatDuration(elapsedMs)}</strong>.</p>
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

function handleStopActivity() {
  if (!state.currentActivity) {
    window.alert("There is no running activity to stop.");
    return;
  }

  const endTime = new Date().toISOString();
  const durationMs = new Date(endTime).getTime() - new Date(state.currentActivity.startTime).getTime();

  state.activities.unshift({
    ...state.currentActivity,
    endTime,
    durationMs
  });

  state.currentActivity = null;
  saveActivities();
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

    Object.assign(preset, presetData);
  } else {
    state.presets.unshift({
      id: createId(),
      ...presetData
    });
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

    group.name = name;
    synchronizeGroupReferences(group);
  } else {
    state.groups.push({
      id: createId(),
      name
    });
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

    category.name = name;
    category.groupId = selectedGroup.id;
    category.groupName = selectedGroup.name;
    synchronizeCategoryReferences(category);
  } else {
    state.categories.push({
      id: createId(),
      name,
      groupId: selectedGroup.id,
      groupName: selectedGroup.name
    });
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

function clearPresetEditingState() {
  state.editingPresetId = null;
  elements.savePresetButton.textContent = "Save to Frequently Used";
  elements.cancelPresetEditButton.hidden = true;
  elements.presetHelperText.textContent = "Save common activities here for one-tap tracking.";
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
  const deleteButton = event.target.closest("[data-action='delete']");

  if (!deleteButton) {
    return;
  }

  deleteActivity(deleteButton.dataset.id);
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

  state.activities.splice(activityIndex, 1);
  state.deletedActivities.unshift({
    ...activity,
    deletedAt: new Date().toISOString()
  });

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
  state.activities.unshift(restoredActivity);
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
      category.groupName = group.name;
    }
  });

  updateItemGroupReference(state.activities, group.id, group.name);
  updateItemGroupReference(state.deletedActivities, group.id, group.name);
  updateItemGroupReference(state.presets, group.id, group.name);

  if (state.currentActivity && state.currentActivity.groupId === group.id) {
    state.currentActivity.groupName = group.name;
  }
}

function synchronizeCategoryReferences(category) {
  updateItemCategoryReference(state.activities, category);
  updateItemCategoryReference(state.deletedActivities, category);
  updateItemCategoryReference(state.presets, category);

  if (state.currentActivity && state.currentActivity.categoryId === category.id) {
    state.currentActivity.categoryName = category.name;
    state.currentActivity.groupId = category.groupId;
    state.currentActivity.groupName = category.groupName;
  }
}

function clearCategoryReferencesFromActiveItems(categoryId) {
  state.presets.forEach((preset) => {
    if (preset.categoryId === categoryId) {
      preset.categoryId = "";
    }
  });

  if (state.currentActivity && state.currentActivity.categoryId === categoryId) {
    state.currentActivity.categoryId = "";
  }
}

function updateItemGroupReference(items, groupId, groupName) {
  items.forEach((item) => {
    if (item.groupId === groupId) {
      item.groupName = groupName;
    }
  });
}

function updateItemCategoryReference(items, category) {
  items.forEach((item) => {
    if (item.categoryId === category.id) {
      item.categoryName = category.name;
      item.groupId = category.groupId;
      item.groupName = category.groupName;
    }
  });
}

function startActivity(activityData) {
  state.currentActivity = {
    id: createId(),
    name: activityData.name,
    notes: activityData.notes,
    categoryId: activityData.categoryId,
    categoryName: activityData.categoryName,
    groupId: activityData.groupId,
    groupName: activityData.groupName,
    startTime: new Date().toISOString()
  };

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

function loadPresetIntoForm(presetId) {
  const preset = state.presets.find((item) => item.id === presetId);

  if (!preset) {
    return;
  }

  const matchedCategory = preset.categoryId ? findCategoryById(preset.categoryId) : null;

  elements.activityName.value = preset.name;
  elements.activityNotes.value = preset.notes || "";
  elements.activityCategory.value = matchedCategory ? matchedCategory.id : state.categories[0]?.id || "";
  setPresetEditingState(presetId, matchedCategory ? "" : preset.categoryName);
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

function createId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;
}

function formatDuration(milliseconds) {
  if (!milliseconds || milliseconds < 0) {
    return "0m";
  }

  const totalMinutes = Math.round(milliseconds / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

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

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\"", "&quot;")
    .replaceAll("'", "&#39;");
}
