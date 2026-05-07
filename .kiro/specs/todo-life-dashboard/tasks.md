# Implementation Plan: To-Do List Life Dashboard

## Overview

Build a self-contained, client-side single-page application across three files: `index.html`, `css/styles.css`, and `js/app.js`. The implementation follows a module pattern (IIFE/closures) with no external dependencies. Each phase wires one widget at a time, ending with full integration.

## Tasks

- [x] 1. Create the HTML page structure (`index.html`)
  - Write the full HTML5 document with `<head>` linking `css/styles.css` and `js/app.js`
  - Add a top-level `<main>` container with four widget sections: `#greeting-widget`, `#focus-timer`, `#todo-list`, `#quick-links`
  - Inside `#greeting-widget`: elements for time (`#time`), date (`#date`), and greeting (`#greeting`)
  - Inside `#focus-timer`: display element (`#timer-display`) and three buttons (`#btn-start`, `#btn-stop`, `#btn-reset`)
  - Inside `#todo-list`: text input (`#todo-input`), Add button (`#btn-add-todo`), inline validation message (`#todo-error`), and task list container (`#task-list`)
  - Inside `#quick-links`: label input (`#link-label`), URL input (`#link-url`), Add button (`#btn-add-link`), inline validation message (`#link-error`), and links container (`#links-container`)
  - _Requirements: 1.7, 2.1, 3.1, 4.1, 5.1, 5.4_

- [x] 2. Write all visual styles (`css/styles.css`)
  - [x] 2.1 Set up base styles and layout
    - Apply CSS reset/normalisation, set `box-sizing: border-box`, and define a root font size of at least 14px
    - Style `<body>` with a neutral background and center the main content column
    - Define a card/panel style for each widget section with clear visual separation
    - _Requirements: 6.3, 6.4, 6.5_

  - [x] 2.2 Style the Greeting Widget
    - Make the time display prominent (large font, bold)
    - Style the date and greeting text with secondary hierarchy
    - _Requirements: 1.1, 1.2, 6.3_

  - [x] 2.3 Style the Focus Timer
    - Display the countdown in a large, monospaced font
    - Style Start, Stop, and Reset buttons; apply a visually distinct disabled state for when buttons are inactive
    - Add a visual indicator style (e.g., colour change or message) for the session-ended state
    - _Requirements: 2.6, 2.7, 2.8, 6.2_

  - [x] 2.4 Style the To-Do List
    - Style the add-task input and button inline
    - Style each task row with a checkbox/toggle, task text, edit button, and delete button
    - Apply strikethrough and muted colour to completed tasks
    - Style the inline validation error message (e.g., red text, small font)
    - _Requirements: 3.3, 3.7, 3.8, 6.3_

  - [x] 2.5 Style the Quick Links panel
    - Style the label and URL inputs and the Add button
    - Style each link as a clickable button with a delete control
    - Style the inline validation error message
    - _Requirements: 4.3, 4.4, 6.3_

- [x] 3. Implement `StorageService` in `js/app.js`
  - Open an IIFE wrapper that will contain all modules
  - Implement `StorageService` with `get(key)`, `set(key, value)`, and `remove(key)` methods
  - Wrap all `localStorage` calls in `try/catch`; `get` returns `null` on missing or corrupt data, `set` fails silently
  - _Requirements: 3.10, 3.11, 3.12, 4.7, 4.8, 4.9, 5.6_

- [x] 4. Implement `GreetingWidget`
  - Implement `formatTime(date)` returning a zero-padded `"HH:MM"` string
  - Implement `formatDate(date)` returning a human-readable string (e.g., `"Monday, 5 May 2025"`)
  - Implement `getGreeting(hour)` returning the correct phrase for the four time ranges: 05–11 → "Good Morning", 12–17 → "Good Afternoon", 18–20 → "Good Evening", 21–04 → "Good Night"
  - Implement `GreetingWidget.init(containerEl)` that renders immediately on call and sets a `setInterval` to re-render every 60 seconds
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7_

- [x] 5. Implement `FocusTimer`
  - Implement `FocusTimer.init(containerEl)` with internal state: `remainingSeconds = 1500`, `intervalId = null`, `isRunning = false`
  - Implement `start()`: sets `isRunning = true`, starts a 1-second `setInterval` that decrements `remainingSeconds` and updates the display; disables Start button, enables Stop button; is a no-op if already running
  - Implement `stop()`: clears the interval, sets `isRunning = false`; enables Start button, disables Stop button; is a no-op if not running
  - Implement `reset()`: calls `stop()`, sets `remainingSeconds = 1500`, updates the display to `"25:00"`, clears any session-ended indicator
  - Auto-stop when `remainingSeconds` reaches 0: call `stop()` and apply the session-ended visual indicator
  - Bind Start, Stop, and Reset buttons to their respective actions; set initial button states (Stop disabled)
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8_

- [x] 6. Implement `TodoList`
  - Implement `TodoList.init(containerEl)` that loads `Task[]` from `StorageService.get("tld_tasks")` (defaulting to `[]`) and calls `renderAll()`
  - Implement `addTask(text)`: trims input, rejects and shows `#todo-error` if empty, otherwise creates `{ id, text, completed: false }` using `crypto.randomUUID()` or `Date.now().toString()`, pushes to array, persists via `StorageService.set("tld_tasks", tasks)`, and calls `renderAll()`; clears error on valid submission
  - Implement `editTask(id, newText)`: trims `newText`, rejects (retains original text) if empty, otherwise updates the matching task's `text`, persists, and re-renders
  - Implement `toggleTask(id)`: flips `completed` on the matching task, persists, and re-renders
  - Implement `deleteTask(id)`: removes the matching task from the array, persists, and re-renders
  - Implement `renderAll()`: clears `#task-list` and calls `renderTask(task)` for each task in the array
  - Implement `renderTask(task)`: creates a list item with a completion toggle, task text (strikethrough when `completed`), an inline edit control (replaces text with a pre-filled input on activation, confirms/cancels on blur or Enter/Escape), and a delete button; wire all controls to their actions
  - Bind the Add button and Enter key on `#todo-input` to `addTask`; clear `#todo-error` when the input is modified
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 3.10, 3.11, 3.12_

- [x] 7. Checkpoint — verify core widgets in browser
  - Open `index.html` directly in a browser (file:// protocol) and confirm: greeting/time/date display correctly, timer counts down and stops at 00:00, tasks can be added/edited/completed/deleted and survive a page reload
  - Ensure all tests pass, ask the user if questions arise.

- [x] 8. Implement `QuickLinks`
  - Implement `QuickLinks.init(containerEl)` that loads `Link[]` from `StorageService.get("tld_links")` (defaulting to `[]`) and calls `renderAll()`
  - Implement `addLink(label, url)`: trims both inputs; rejects and shows `#link-error` if label or URL is empty, or if URL does not start with `"http://"` or `"https://"`; otherwise creates `{ id, label, url }`, pushes to array, persists via `StorageService.set("tld_links", links)`, and calls `renderAll()`; clears error on valid submission
  - Implement `deleteLink(id)`: removes the matching link from the array, persists, and re-renders
  - Implement `renderAll()`: clears `#links-container` and calls `renderLink(link)` for each link
  - Implement `renderLink(link)`: creates a button that opens `link.url` in a new tab (`window.open(url, "_blank")`) labelled with `link.label`, and a delete button wired to `deleteLink`
  - Bind the Add button to `addLink`; clear `#link-error` when either input is modified
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9_

- [x] 9. Implement `DashboardApp` and wire everything together
  - Implement `DashboardApp.init()` that queries each widget's container element from the DOM and calls `.init(containerEl)` on `GreetingWidget`, `FocusTimer`, `TodoList`, and `QuickLinks`
  - Register `DashboardApp.init` on the `DOMContentLoaded` event at the bottom of the IIFE
  - Close the IIFE wrapper
  - _Requirements: 1.7, 3.11, 4.8, 5.1, 5.3, 5.4_

- [x] 10. Final checkpoint — full integration review
  - Open `index.html` in Chrome, Firefox, Edge, and Safari; confirm all four widgets render and function correctly
  - Verify tasks and links added in one session are present after a page reload
  - Verify the page loads with no JavaScript console errors
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- All code lives in exactly three files: `index.html`, `css/styles.css`, `js/app.js`
- No frameworks, build tools, or external dependencies are used
- The app must work via `file://` protocol with no local server
- Each task references specific requirements for traceability
- Checkpoints (tasks 7 and 10) are manual browser verification steps, not automated tests
