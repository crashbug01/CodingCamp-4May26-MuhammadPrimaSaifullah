/**
 * To-Do List Life Dashboard — app.js
 * All application logic wrapped in an IIFE to avoid polluting the global scope.
 *
 * Sections:
 *   1. StorageService   — localStorage wrapper (Task 3)
 *   2. ThemeManager     — light/dark theme toggle
 *   3. GreetingWidget   — time / date / greeting display (Task 4)
 *   4. FocusTimer       — 25-minute countdown timer (Task 5)
 *   5. TodoList         — task CRUD + rendering (Task 6)
 *   6. QuickLinks       — link CRUD + rendering (Task 8)
 *   7. DashboardApp     — top-level initialiser (Task 9)
 */

(function () {
  'use strict';

  /* =========================================================================
     1. StorageService
     Thin, stateless wrapper around localStorage with JSON serialisation.
     Storage keys:
       "tld_tasks"  — Task[]
       "tld_links"  — Link[]
     ========================================================================= */

  var StorageService = {
    /**
     * Retrieve and JSON-parse a value from localStorage.
     * Returns null if the key is missing or the stored value is corrupt.
     * @param {string} key
     * @returns {any|null}
     */
    get: function (key) {
      try {
        return JSON.parse(localStorage.getItem(key));
      } catch (e) {
        return null;
      }
    },

    /**
     * JSON-stringify and store a value in localStorage.
     * Silently fails if localStorage is unavailable or quota is exceeded.
     * @param {string} key
     * @param {any} value
     */
    set: function (key, value) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch (e) {
        /* silent fail — in-memory state remains correct for the session */
      }
    },

    /**
     * Remove a key from localStorage.
     * Silently fails if localStorage is unavailable.
     * @param {string} key
     */
    remove: function (key) {
      try {
        localStorage.removeItem(key);
      } catch (e) {
        /* silent fail */
      }
    }
  };

  /* =========================================================================
     2. ThemeManager
     Stateless utility that reads/writes the theme preference and applies it
     to the DOM via the data-theme attribute on <html>.
     Storage key: "tld_theme"
     ========================================================================= */

  var ThemeManager = {
    _updateToggleLabel: function(theme) {
      var btn = document.getElementById('btn-theme-toggle');
      if (btn) btn.textContent = theme === 'dark' ? 'Light Mode' : 'Dark Mode';
    },
    loadTheme: function() {
      var stored = StorageService.get('tld_theme');
      var theme = (stored === 'dark') ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', theme);
      ThemeManager._updateToggleLabel(theme);
    },
    toggle: function() {
      var current = document.documentElement.getAttribute('data-theme') || 'light';
      var next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      StorageService.set('tld_theme', next);
      ThemeManager._updateToggleLabel(next);
    }
  };

  /* =========================================================================
     3. GreetingWidget
     Displays the current time (HH:MM), date, and a time-based greeting.
     Updates every 60 seconds via setInterval.
     ========================================================================= */

  var GreetingWidget = {
    /**
     * Format a Date as a zero-padded "HH:MM" string.
     * @param {Date} date
     * @returns {string}
     */
    formatTime: function (date) {
      var h = String(date.getHours()).padStart(2, '0');
      var m = String(date.getMinutes()).padStart(2, '0');
      return h + ':' + m;
    },

    /**
     * Format a Date as a human-readable string, e.g. "Monday, 5 May 2025".
     * @param {Date} date
     * @returns {string}
     */
    formatDate: function (date) {
      return date.toLocaleDateString(undefined, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    },

    /**
     * Return the appropriate greeting for the given hour (0–23).
     *  5–11  → "Good Morning"
     * 12–17  → "Good Afternoon"
     * 18–20  → "Good Evening"
     * 21–23 or 0–4 → "Good Night"
     * @param {number} hour
     * @returns {string}
     */
    getGreeting: function (hour) {
      if (hour >= 5 && hour <= 11) return 'Good Morning';
      if (hour >= 12 && hour <= 17) return 'Good Afternoon';
      if (hour >= 18 && hour <= 20) return 'Good Evening';
      return 'Good Night';
    },

    /**
     * Initialise the greeting widget.
     * Queries #time, #date, #greeting from containerEl (or document),
     * renders immediately, then re-renders every 60 seconds.
     * @param {Element} containerEl
     */
    init: function (containerEl) {
      var root = containerEl || document;
      var timeEl = root.querySelector('#time');
      var dateEl = root.querySelector('#date');
      var greetingEl = root.querySelector('#greeting');
      var nameInput = root.querySelector('#name-input');
      var btnSaveName = root.querySelector('#btn-save-name');

      var storedName = StorageService.get('tld_name') || '';
      if (nameInput) nameInput.value = storedName;

      function render() {
        var now = new Date();
        if (timeEl) timeEl.textContent = GreetingWidget.formatTime(now);
        if (dateEl) dateEl.textContent = GreetingWidget.formatDate(now);
        if (greetingEl) greetingEl.textContent = GreetingWidget.getGreeting(now.getHours()) + (storedName ? ', ' + storedName : '');
      }

      render();
      setInterval(render, 60000);

      if (btnSaveName) {
        btnSaveName.addEventListener('click', function () {
          var trimmed = nameInput ? nameInput.value.trim() : '';
          if (trimmed) {
            StorageService.set('tld_name', trimmed);
            storedName = trimmed;
          } else {
            StorageService.remove('tld_name');
            storedName = '';
          }
          render();
        });
      }
    }
  };

  /* =========================================================================
     4. FocusTimer
     25-minute (1500 s) Pomodoro-style countdown timer.
     Buttons: Start, Stop, Reset.
     ========================================================================= */

  var FocusTimer = {
    /**
     * Initialise the focus timer widget.
     * @param {Element} containerEl
     */
    init: function (containerEl) {
      var root = containerEl || document;

      /* --- DOM references --- */
      var timerDisplay = root.querySelector('#timer-display');
      var btnStart     = root.querySelector('#btn-start');
      var btnStop      = root.querySelector('#btn-stop');
      var btnReset     = root.querySelector('#btn-reset');
      var timerEnded   = root.querySelector('#timer-ended');
      var durationInput  = root.querySelector('#duration-input');
      var btnSetDuration = root.querySelector('#btn-set-duration');
      var durationError  = root.querySelector('#duration-error');

      /* --- Internal state --- */
      var rawDuration = StorageService.get('tld_timer_duration');
      var configuredMinutes = (typeof rawDuration === 'number' && Number.isInteger(rawDuration) && rawDuration >= 1 && rawDuration <= 180) ? rawDuration : 25;
      var remainingSeconds = configuredMinutes * 60;
      var intervalId       = null;
      var isRunning        = false;

      if (durationInput) durationInput.value = configuredMinutes;

      /* --- Helpers --- */

      /**
       * Format seconds as a zero-padded "MM:SS" string.
       * @param {number} seconds
       * @returns {string}
       */
      function formatTimer(seconds) {
        var m = String(Math.floor(seconds / 60)).padStart(2, '0');
        var s = String(seconds % 60).padStart(2, '0');
        return m + ':' + s;
      }

      /** Update the timer display element. */
      function updateDisplay() {
        if (timerDisplay) timerDisplay.textContent = formatTimer(remainingSeconds);
      }

      /** Enable/disable Start and Stop buttons based on isRunning. */
      function updateButtons() {
        if (btnStart) btnStart.disabled = isRunning;
        if (btnStop)  btnStop.disabled  = !isRunning;
        updateDurationInput();
      }

      /** Enable/disable duration input based on isRunning. */
      function updateDurationInput() {
        if (durationInput) durationInput.disabled = isRunning;
        if (btnSetDuration) btnSetDuration.disabled = isRunning;
      }

      /* --- Actions --- */

      /** Start the countdown. No-op if already running. */
      function start() {
        if (isRunning) return;
        isRunning = true;
        updateButtons();
        intervalId = setInterval(function () {
          remainingSeconds -= 1;
          updateDisplay();
          if (remainingSeconds === 0) {
            stop();
            if (timerEnded) timerEnded.removeAttribute('hidden');
          }
        }, 1000);
      }

      /** Stop (pause) the countdown. No-op if not running. */
      function stop() {
        if (!isRunning) return;
        clearInterval(intervalId);
        intervalId = null;
        isRunning  = false;
        updateButtons();
      }

      /** Reset the timer to configured duration and hide the session-complete indicator. */
      function reset() {
        stop();
        remainingSeconds = configuredMinutes * 60;
        updateDisplay();
        if (timerEnded) timerEnded.setAttribute('hidden', '');
      }

      /**
       * Set a new timer duration. Validates [1,180], persists, and resets display.
       * @param {string|number} minutes
       */
      function setDuration(minutes) {
        var parsed = Number(minutes);
        if (!Number.isInteger(parsed) || parsed < 1 || parsed > 180) {
          if (durationError) durationError.textContent = 'Duration must be a whole number between 1 and 180.';
          return;
        }
        if (durationError) durationError.textContent = '';
        configuredMinutes = parsed;
        StorageService.set('tld_timer_duration', configuredMinutes);
        reset();
      }

      /* --- Event bindings --- */
      if (btnStart) btnStart.addEventListener('click', start);
      if (btnStop)  btnStop.addEventListener('click', stop);
      if (btnReset) btnReset.addEventListener('click', reset);

      if (btnSetDuration) btnSetDuration.addEventListener('click', function () {
        setDuration(durationInput ? durationInput.value : '');
      });
      if (durationInput) durationInput.addEventListener('input', function () {
        if (durationError) durationError.textContent = '';
      });

      /* --- Initial state --- */
      if (btnStop) btnStop.disabled = true;
      updateDisplay();
      updateDurationInput();
    }
  };

  /* =========================================================================
     5. TodoList
     Persistent task management: add, edit, toggle completion, delete.
     Storage key: "tld_tasks"
     ========================================================================= */

  var TodoList = {
    /**
     * Initialise the to-do list widget.
     * @param {Element} containerEl
     */
    init: function (containerEl) {
      var root = containerEl || document;

      /* --- State --- */
      var tasks = StorageService.get('tld_tasks') || [];
      var currentSort = StorageService.get('tld_task_sort') || 'creation';

      /* --- DOM references --- */
      var todoInput  = root.querySelector('#todo-input');
      var btnAddTodo = root.querySelector('#btn-add-todo');
      var todoError  = root.querySelector('#todo-error');
      var taskList   = root.querySelector('#task-list');
      var taskSort   = root.querySelector('#task-sort');
      if (taskSort) taskSort.value = currentSort;

      /* --- Helpers --- */

      /** Persist the current tasks array to localStorage. */
      function persist() {
        StorageService.set('tld_tasks', tasks);
      }

      /**
       * Generate a unique ID using crypto.randomUUID when available,
       * falling back to Date.now().
       * @returns {string}
       */
      function generateId() {
        return (typeof crypto !== 'undefined' && crypto.randomUUID)
          ? crypto.randomUUID()
          : Date.now().toString();
      }

      /**
       * Check if a task with the same text already exists (case-insensitive).
       * @param {string} text
       * @returns {boolean}
       */
      function isDuplicate(text) {
        return tasks.some(function (t) {
          return t.text.trim().toLowerCase() === text.trim().toLowerCase();
        });
      }

      /**
       * Return a sorted copy of the tasks array based on currentSort.
       * @returns {Array}
       */
      function getSortedTasks() {
        if (currentSort === 'alpha') {
          return tasks.slice().sort(function (a, b) {
            return a.text.toLowerCase().localeCompare(b.text.toLowerCase());
          });
        }
        if (currentSort === 'completed-last') {
          return tasks.slice().sort(function (a, b) {
            if (a.completed === b.completed) return 0;
            return a.completed ? 1 : -1;
          });
        }
        return tasks.slice(); // 'creation' — preserve insertion order
      }

      /**
       * Update the active sort order, persist it, and re-render.
       * @param {string} sortValue
       */
      function setSort(sortValue) {
        currentSort = sortValue;
        StorageService.set('tld_task_sort', currentSort);
        renderAll();
      }

      /**
       * Add a new task. Rejects empty/whitespace-only text and duplicates.
       * @param {string} text
       */
      function addTask(text) {
        var trimmed = text.trim();
        if (!trimmed) {
          if (todoError) todoError.textContent = 'Task cannot be empty.';
          return;
        }
        if (isDuplicate(trimmed)) {
          if (todoError) todoError.textContent = 'A task with this name already exists.';
          return;
        }
        if (todoError) todoError.textContent = '';
        tasks.push({ id: generateId(), text: trimmed, completed: false });
        persist();
        renderAll();
        if (todoInput) todoInput.value = '';
      }

      /**
       * Edit an existing task's text. Rejects empty/whitespace-only replacement.
       * @param {string} id
       * @param {string} newText
       */
      function editTask(id, newText) {
        var trimmed = newText.trim();
        if (!trimmed) return; /* retain original */
        var task = tasks.find(function (t) { return t.id === id; });
        if (task) {
          task.text = trimmed;
          persist();
          renderAll();
        }
      }

      /**
       * Toggle the completed state of a task.
       * @param {string} id
       */
      function toggleTask(id) {
        var task = tasks.find(function (t) { return t.id === id; });
        if (task) {
          task.completed = !task.completed;
          persist();
          renderAll();
        }
      }

      /**
       * Permanently remove a task.
       * @param {string} id
       */
      function deleteTask(id) {
        tasks = tasks.filter(function (t) { return t.id !== id; });
        persist();
        renderAll();
      }

      /** Re-render the entire task list in the current sort order. */
      function renderAll() {
        if (!taskList) return;
        taskList.innerHTML = '';
        getSortedTasks().forEach(function (task) { renderTask(task); });
      }

      /**
       * Render a single task as an <li> and append it to #task-list.
       * @param {{ id: string, text: string, completed: boolean }} task
       */
      function renderTask(task) {
        /* <li> */
        var li = document.createElement('li');
        if (task.completed) li.classList.add('completed');

        /* Checkbox */
        var checkbox = document.createElement('input');
        checkbox.type    = 'checkbox';
        checkbox.checked = task.completed;
        checkbox.addEventListener('change', function () { toggleTask(task.id); });

        /* Task text span */
        var span = document.createElement('span');
        span.className   = 'task-text';
        span.textContent = task.text;

        /* Edit button */
        var btnEdit = document.createElement('button');
        btnEdit.type      = 'button';
        btnEdit.className = 'btn-edit';
        btnEdit.textContent = 'Edit';

        /* Save button (initially hidden) */
        var btnSave = document.createElement('button');
        btnSave.type      = 'button';
        btnSave.className = 'btn-save';
        btnSave.textContent = 'Save';
        btnSave.hidden    = true;

        /* Delete button */
        var btnDelete = document.createElement('button');
        btnDelete.type      = 'button';
        btnDelete.className = 'btn-delete';
        btnDelete.textContent = 'Delete';

        /* Edit → switch to inline input */
        btnEdit.addEventListener('click', function () {
          var editInput = document.createElement('input');
          editInput.type      = 'text';
          editInput.className = 'task-edit-input';
          editInput.value     = task.text;

          li.replaceChild(editInput, span);
          btnEdit.hidden = true;
          btnSave.hidden = false;

          editInput.focus();
        });

        /* Save → commit edit */
        btnSave.addEventListener('click', function () {
          var editInput = li.querySelector('.task-edit-input');
          editTask(task.id, editInput ? editInput.value : '');
        });

        /* Delete */
        btnDelete.addEventListener('click', function () { deleteTask(task.id); });

        li.appendChild(checkbox);
        li.appendChild(span);
        li.appendChild(btnEdit);
        li.appendChild(btnSave);
        li.appendChild(btnDelete);
        taskList.appendChild(li);
      }

      /* --- Event bindings --- */
      if (btnAddTodo) {
        btnAddTodo.addEventListener('click', function () {
          addTask(todoInput ? todoInput.value : '');
        });
      }

      if (todoInput) {
        todoInput.addEventListener('keydown', function (e) {
          if (e.key === 'Enter') addTask(todoInput.value);
        });
        todoInput.addEventListener('input', function () {
          if (todoError) todoError.textContent = '';
        });
      }

      if (taskSort) taskSort.addEventListener('change', function () {
        setSort(taskSort.value);
      });

      /* --- Initial render --- */
      renderAll();
    }
  };

  /* =========================================================================
     6. QuickLinks
     Persistent URL shortcut panel: add, open in new tab, delete.
     Storage key: "tld_links"
     ========================================================================= */

  var QuickLinks = {
    /**
     * Initialise the quick links widget.
     * @param {Element} containerEl
     */
    init: function (containerEl) {
      var root = containerEl || document;

      /* --- State --- */
      var links = StorageService.get('tld_links') || [];

      /* --- DOM references --- */
      var linkLabel      = root.querySelector('#link-label');
      var linkUrl        = root.querySelector('#link-url');
      var btnAddLink     = root.querySelector('#btn-add-link');
      var linkError      = root.querySelector('#link-error');
      var linksContainer = root.querySelector('#links-container');

      /* --- Helpers --- */

      /** Persist the current links array to localStorage. */
      function persist() {
        StorageService.set('tld_links', links);
      }

      /**
       * Generate a unique ID using crypto.randomUUID when available,
       * falling back to Date.now().
       * @returns {string}
       */
      function generateId() {
        return (typeof crypto !== 'undefined' && crypto.randomUUID)
          ? crypto.randomUUID()
          : Date.now().toString();
      }

      /* --- Actions --- */

      /**
       * Add a new link. Validates label, URL presence, and URL scheme.
       * @param {string} label
       * @param {string} url
       */
      function addLink(label, url) {
        var trimmedLabel = label.trim();
        var trimmedUrl   = url.trim();

        if (!trimmedLabel) {
          if (linkError) linkError.textContent = 'Label cannot be empty.';
          return;
        }
        if (!trimmedUrl) {
          if (linkError) linkError.textContent = 'URL cannot be empty.';
          return;
        }
        if (!trimmedUrl.startsWith('http://') && !trimmedUrl.startsWith('https://')) {
          if (linkError) linkError.textContent = 'URL must start with http:// or https://';
          return;
        }

        if (linkError) linkError.textContent = '';
        links.push({ id: generateId(), label: trimmedLabel, url: trimmedUrl });
        persist();
        renderAll();
        if (linkLabel) linkLabel.value = '';
        if (linkUrl)   linkUrl.value   = '';
      }

      /**
       * Permanently remove a link.
       * @param {string} id
       */
      function deleteLink(id) {
        links = links.filter(function (l) { return l.id !== id; });
        persist();
        renderAll();
      }

      /** Re-render the entire links container. */
      function renderAll() {
        if (!linksContainer) return;
        linksContainer.innerHTML = '';
        links.forEach(function (link) { renderLink(link); });
      }

      /**
       * Render a single link as a .link-item div and append it to #links-container.
       * @param {{ id: string, label: string, url: string }} link
       */
      function renderLink(link) {
        /* Wrapper */
        var div = document.createElement('div');
        div.className = 'link-item';

        /* Link button — opens URL in a new tab */
        var btnLink = document.createElement('button');
        btnLink.type        = 'button';
        btnLink.className   = 'btn-link';
        btnLink.textContent = link.label;
        btnLink.addEventListener('click', function () {
          window.open(link.url, '_blank', 'noopener,noreferrer');
        });

        /* Delete button */
        var btnLinkDelete = document.createElement('button');
        btnLinkDelete.type        = 'button';
        btnLinkDelete.className   = 'btn-link-delete';
        btnLinkDelete.textContent = '×';
        btnLinkDelete.addEventListener('click', function () { deleteLink(link.id); });

        div.appendChild(btnLink);
        div.appendChild(btnLinkDelete);
        linksContainer.appendChild(div);
      }

      /* --- Event bindings --- */
      if (btnAddLink) {
        btnAddLink.addEventListener('click', function () {
          addLink(
            linkLabel ? linkLabel.value : '',
            linkUrl   ? linkUrl.value   : ''
          );
        });
      }

      if (linkLabel) {
        linkLabel.addEventListener('input', function () {
          if (linkError) linkError.textContent = '';
        });
      }

      if (linkUrl) {
        linkUrl.addEventListener('input', function () {
          if (linkError) linkError.textContent = '';
        });
      }

      /* --- Initial render --- */
      renderAll();
    }
  };

  /* =========================================================================
     7. DashboardApp
     Top-level initialiser — wires each widget to its container element.
     ========================================================================= */

  var DashboardApp = {
    /** Initialise all widgets. Called on DOMContentLoaded. */
    init: function () {
      ThemeManager.loadTheme();

      var btnThemeToggle = document.getElementById('btn-theme-toggle');
      if (btnThemeToggle) btnThemeToggle.addEventListener('click', ThemeManager.toggle);

      var greetingEl = document.getElementById('greeting-widget');
      var timerEl    = document.getElementById('focus-timer');
      var todoEl     = document.getElementById('todo-list');
      var linksEl    = document.getElementById('quick-links');

      GreetingWidget.init(greetingEl);
      FocusTimer.init(timerEl);
      TodoList.init(todoEl);
      QuickLinks.init(linksEl);
    }
  };

  document.addEventListener('DOMContentLoaded', DashboardApp.init);

})();
