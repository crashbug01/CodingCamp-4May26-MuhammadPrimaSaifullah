# Implementation Plan: Dashboard Enhancements

## Overview

Extend the existing three-file dashboard (`index.html`, `css/styles.css`, `js/app.js`) with five additive features: light/dark mode theming, custom name in greeting, configurable Pomodoro duration, duplicate task prevention, and task sorting. All changes stay within the existing files and IIFE structure.

## Tasks

- [x] 1. Add CSS custom properties and dark theme overrides to `css/styles.css`
  - Replace all hardcoded colour values in `css/styles.css` with CSS custom properties declared on `:root`
  - Map each existing colour literal to a named variable (e.g. `--color-bg`, `--color-surface`, `--color-text-primary`, `--color-text-muted`, `--color-border`, `--color-accent`, etc.)
  - Add a `[data-theme="dark"]` block on `:root` that overrides every colour variable with dark-palette equivalents
  - Ensure all existing selectors that previously used hardcoded colours now resolve through the variables — no hardcoded colour values should remain outside `:root` and `[data-theme="dark"]`
  - _Requirements: 1.3, 1.4, 6.1, 6.2_

- [x] 2. Add theme toggle button and header to `index.html`
  - Add a `<header>` element above `<main class="dashboard">` containing a `<button id="btn-theme-toggle" type="button">` with initial label text `"Dark Mode"`
  - _Requirements: 1.1, 1.8, 6.1_

- [x] 3. Add `ThemeManager` module to `js/app.js`
  - Insert a new `ThemeManager` object literal between `StorageService` and `GreetingWidget` inside the IIFE
  - Implement `ThemeManager.loadTheme()`: reads `tld_theme` from `StorageService`; defaults to `"light"` if absent or unrecognised; sets `data-theme` attribute on `document.documentElement`; updates `#btn-theme-toggle` text to `"Dark Mode"` when light is active and `"Light Mode"` when dark is active
  - Implement `ThemeManager.toggle()`: reads the current `data-theme` from `document.documentElement`, flips it to the opposite value, writes the new value to `StorageService` under `"tld_theme"`, applies the new `data-theme` attribute, and updates the toggle button label
  - Update `DashboardApp.init()` to call `ThemeManager.loadTheme()` as its very first action, before any widget `init()` call
  - Wire `#btn-theme-toggle` click event to `ThemeManager.toggle` inside `DashboardApp.init()`
  - _Requirements: 1.1, 1.2, 1.5, 1.6, 1.7, 1.8_

- [x] 4. Add header and theme toggle styles to `css/styles.css`
  - Add styles for the new `<header>` element: full-width bar, padding, flex layout to position the toggle button
  - Style `#btn-theme-toggle` as a secondary/outline button distinct from the primary accent buttons
  - _Requirements: 1.1, 1.8_

- [x] 5. Add name input row to `index.html` inside `#greeting-widget`
  - Inside `<section id="greeting-widget">`, add a `<div class="name-input-row">` containing:
    - `<label for="name-input" class="sr-only">Your name</label>`
    - `<input id="name-input" type="text" maxlength="50" placeholder="Enter your name…" autocomplete="off" />`
    - `<button id="btn-save-name" type="button">Save</button>`
  - _Requirements: 2.1, 6.1_

- [x] 6. Extend `GreetingWidget` in `js/app.js` to support custom name
  - Inside `GreetingWidget.init()`, after querying existing DOM references, add:
    - Query `#name-input` and `#btn-save-name` from `containerEl`
    - Load the stored name on init: `var storedName = StorageService.get("tld_name") || ""`; populate `#name-input` with the stored value
    - Update the `render()` function: when `storedName` is non-empty, append `, {storedName}` to the greeting string (e.g. `"Good Morning, Alex"`); when empty, render the greeting without a name
    - Wire `#btn-save-name` click: trim the input value; if non-empty call `StorageService.set("tld_name", trimmed)` and update `storedName`; if empty call `StorageService.remove("tld_name")` and set `storedName = ""`; call `render()` after either branch
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7_

- [x] 7. Add `.name-input-row` styles to `css/styles.css`
  - Style `.name-input-row` as a flex row with a gap, centred alignment, and `margin-top` to separate it from the greeting text
  - Style the input to grow and fill available space; style the Save button consistently with other secondary actions
  - _Requirements: 2.1_

- [x] 8. Add duration input row to `index.html` inside `#focus-timer`
  - Inside `<section id="focus-timer">`, after the `.timer-controls` div, add:
    - `<div class="duration-row">` containing:
      - `<label for="duration-input" class="sr-only">Timer duration in minutes</label>`
      - `<input id="duration-input" type="number" min="1" max="180" value="25" aria-describedby="duration-error" />`
      - `<button id="btn-set-duration" type="button">Set</button>`
    - `<p id="duration-error" class="validation-error" role="alert" aria-live="polite"></p>`
  - _Requirements: 3.1, 3.4, 6.1_

- [x] 9. Extend `FocusTimer` in `js/app.js` to support configurable duration
  - Inside `FocusTimer.init()`, replace the hardcoded `var remainingSeconds = 1500` with:
    - `var configuredMinutes = StorageService.get("tld_timer_duration") || 25;` (validate: if not an integer in [1,180], default to 25)
    - `var remainingSeconds = configuredMinutes * 60;`
  - Query `#duration-input`, `#btn-set-duration`, and `#duration-error` from `containerEl`
  - Set `#duration-input` initial value to `configuredMinutes` on init
  - Implement `setDuration(minutes)` inside the closure:
    - Parse and validate: must be a whole number in [1, 180]; if invalid, set `#duration-error` text to the appropriate message and return without changing state
    - On valid input: clear `#duration-error`; update `configuredMinutes`; call `StorageService.set("tld_timer_duration", configuredMinutes)`; call `reset()`
  - Update `reset()` to use `configuredMinutes * 60` instead of the hardcoded `1500`
  - Implement `updateDurationInput()` inside the closure: sets `#duration-input.disabled` and `#btn-set-duration.disabled` to `isRunning`
  - Extend `updateButtons()` to also call `updateDurationInput()`
  - Wire `#btn-set-duration` click to call `setDuration(Number(durationInput.value))`
  - Wire `#duration-input` input event to clear `#duration-error`
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8_

- [x] 10. Add `.duration-row` styles to `css/styles.css`
  - Style `.duration-row` as a flex row centred below the timer controls, with a gap and `margin-top`
  - Style `#duration-input` (type number) consistently with other text inputs; set a fixed width appropriate for a 1–3 digit number
  - _Requirements: 3.1_

- [x] 11. Extend `TodoList` in `js/app.js` to prevent duplicate tasks
  - Inside `TodoList.init()`, add `isDuplicate(text)` helper: returns `true` if `tasks` contains any entry where `task.text.trim().toLowerCase() === text.trim().toLowerCase()`
  - In `addTask(text)`, after the empty-check block and before the `tasks.push(...)` call, add:
    ```js
    if (isDuplicate(trimmed)) {
      if (todoError) todoError.textContent = 'A task with this name already exists.';
      return;
    }
    ```
  - Do NOT clear `todoInput.value` on duplicate rejection (input must remain populated)
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [x] 12. Add sort select to `index.html` inside `#todo-list`
  - Inside `<section id="todo-list">`, between the `.todo-add-row` div and the `#todo-error` paragraph, add:
    - `<div class="sort-row">` containing:
      - `<label for="task-sort" class="sr-only">Sort tasks by</label>`
      - `<select id="task-sort" aria-label="Sort tasks">`
        - `<option value="creation">Creation order</option>`
        - `<option value="completed-last">Completed last</option>`
        - `<option value="alpha">Alphabetical (A–Z)</option>`
      - `</select>`
  - _Requirements: 5.1, 5.8, 6.1_

- [x] 13. Extend `TodoList` in `js/app.js` to support task sorting
  - Inside `TodoList.init()`, add state variable: `var currentSort = StorageService.get("tld_task_sort") || "creation";`
  - Query `#task-sort` from `containerEl`; on init, set `taskSort.value = currentSort` to reflect the stored preference
  - Implement `getSortedTasks()` inside the closure:
    - `"creation"`: return `tasks.slice()` (preserves insertion order)
    - `"completed-last"`: return a stable sort where incomplete tasks come before completed tasks, preserving relative order within each group
    - `"alpha"`: return tasks sorted by `task.text.toLowerCase()` ascending
  - Implement `setSort(sortValue)` inside the closure: update `currentSort`, call `StorageService.set("tld_task_sort", currentSort)`, call `renderAll()`
  - Update `renderAll()` to iterate over `getSortedTasks()` instead of `tasks` directly
  - Wire `#task-sort` change event to call `setSort(taskSort.value)`
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8_

- [x] 14. Add `.sort-row` styles to `css/styles.css`
  - Style `.sort-row` with `margin-bottom` to separate it from the error paragraph and task list
  - Style the `#task-sort` select element consistently with other form controls: matching font, border, border-radius, padding, and focus ring
  - _Requirements: 5.1, 5.8_

- [x] 15. Final checkpoint — verify all features work end-to-end
  - Open `index.html` directly in a browser via `file://` and confirm:
    - Theme toggle switches colours and persists across reload
    - Greeting shows saved name and persists across reload
    - Custom timer duration resets the display and persists across reload; input is disabled while timer runs
    - Duplicate task submission shows the error and keeps the input populated
    - Sort control re-orders the list immediately and persists across reload
  - Ensure all pre-existing functionality (task CRUD, link CRUD, timer start/stop/reset) is unaffected
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

## Notes

- All changes are confined to `index.html`, `css/styles.css`, and `js/app.js` — no new files
- Module insertion order in `js/app.js`: `StorageService` → `ThemeManager` (new) → `GreetingWidget` → `FocusTimer` → `TodoList` → `QuickLinks` → `DashboardApp`
- `ThemeManager.loadTheme()` must be the first call in `DashboardApp.init()` to prevent a flash of the wrong theme
- `getSortedTasks()` always returns a shallow copy — the `tasks` array insertion order is never mutated by sorting
- The duplicate check is case-insensitive and compares trimmed values; the empty-task check runs first
- Duration validation must guard against non-numeric input, decimals, values below 1, and values above 180
