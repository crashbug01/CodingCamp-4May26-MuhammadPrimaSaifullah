# Requirements Document

## Introduction

This document describes five enhancement features to be added to the existing **To-Do List Life Dashboard** — a vanilla JS single-page application (`index.html`, `css/styles.css`, `js/app.js`) that runs entirely in the browser with no server or build step. All new features must integrate into the existing three-file structure, use only vanilla HTML/CSS/JS, persist preferences via `localStorage`, and work correctly over the `file://` protocol.

The five enhancements are:

1. **Light / Dark Mode** — a toggle that switches the colour theme and remembers the user's preference.
2. **Custom Name in Greeting** — the user can enter their name so the greeting reads "Good Morning, Alex".
3. **Configurable Pomodoro Duration** — the user can set a custom timer duration instead of the fixed 25 minutes.
4. **Duplicate Task Prevention** — adding a task whose text already exists (case-insensitive) is rejected with an inline error.
5. **Task Sorting** — the user can sort the task list by creation order, completed-last, or alphabetical (A–Z).

---

## Glossary

- **Dashboard**: The existing single-page web application described in the base spec.
- **Dashboard_App**: The top-level JavaScript IIFE that initialises and coordinates all widgets.
- **Greeting_Widget**: The UI component that displays the current time, date, and a time-based greeting message.
- **Focus_Timer**: The UI component that implements a configurable countdown timer with Start, Stop, and Reset controls.
- **Todo_List**: The UI component that manages a collection of task items.
- **Task**: A single to-do item with a text description and a completion state, shaped `{ id, text, completed }`.
- **Theme_Toggle**: The UI control that switches the Dashboard between light and dark colour themes.
- **Name_Input**: The UI control inside the Greeting_Widget that allows the user to enter and save their display name.
- **Duration_Input**: The UI control inside the Focus_Timer that allows the user to set a custom countdown duration in minutes.
- **Sort_Control**: The UI control inside the Todo_List that allows the user to select a sort order for the task list.
- **Local_Storage**: The browser's `localStorage` API used for client-side data persistence.
- **Storage_Key_Theme**: The `localStorage` key `"tld_theme"` used to persist the active colour theme.
- **Storage_Key_Name**: The `localStorage` key `"tld_name"` used to persist the user's display name.
- **Storage_Key_Duration**: The `localStorage` key `"tld_timer_duration"` used to persist the custom timer duration.
- **Storage_Key_Sort**: The `localStorage` key `"tld_task_sort"` used to persist the selected sort order.

---

## Requirements

### Requirement 1: Light / Dark Mode

**User Story:** As a user, I want to toggle between a light and a dark colour theme, so that I can use the Dashboard comfortably in different lighting conditions without having to re-select my preference every time I open the page.

#### Acceptance Criteria

1. THE Dashboard_App SHALL provide a Theme_Toggle control that is visible and accessible on the Dashboard at all times.
2. WHEN the user activates the Theme_Toggle, THE Dashboard_App SHALL switch the active colour theme from light to dark, or from dark to light.
3. WHEN the active theme is dark, THE Dashboard_App SHALL apply a dark colour scheme to all widgets and the page background.
4. WHEN the active theme is light, THE Dashboard_App SHALL apply the default light colour scheme to all widgets and the page background.
5. WHEN the user activates the Theme_Toggle, THE Dashboard_App SHALL persist the selected theme to Local_Storage under Storage_Key_Theme.
6. WHEN the Dashboard page loads, THE Dashboard_App SHALL read Storage_Key_Theme from Local_Storage and apply the stored theme before rendering any widget content.
7. IF Storage_Key_Theme is absent from Local_Storage on page load, THEN THE Dashboard_App SHALL apply the light theme as the default.
8. THE Theme_Toggle SHALL display a visible label or icon that reflects the currently active theme (e.g., "Dark Mode" when light is active, "Light Mode" when dark is active).

---

### Requirement 2: Custom Name in Greeting

**User Story:** As a user, I want to enter my name so that the greeting reads "Good Morning, Alex" instead of just "Good Morning", so that the Dashboard feels more personal.

#### Acceptance Criteria

1. THE Greeting_Widget SHALL provide a Name_Input field that allows the user to enter a display name of up to 50 characters.
2. WHEN the user submits a non-empty name via the Name_Input, THE Greeting_Widget SHALL append the trimmed name to the greeting message (e.g., "Good Morning, Alex").
3. WHEN the user submits a non-empty name via the Name_Input, THE Greeting_Widget SHALL persist the trimmed name to Local_Storage under Storage_Key_Name.
4. WHEN the Dashboard page loads, THE Greeting_Widget SHALL read Storage_Key_Name from Local_Storage and, if a name is present, display the personalised greeting immediately.
5. IF Storage_Key_Name is absent or empty in Local_Storage on page load, THEN THE Greeting_Widget SHALL display the greeting without a name (e.g., "Good Morning").
6. WHEN the user clears the Name_Input and submits an empty value, THE Greeting_Widget SHALL remove the name from the greeting, remove Storage_Key_Name from Local_Storage, and display the greeting without a name.
7. THE Greeting_Widget SHALL allow the user to update the saved name at any time by submitting a new non-empty value via the Name_Input.

---

### Requirement 3: Configurable Pomodoro Duration

**User Story:** As a user, I want to set a custom timer duration instead of the fixed 25 minutes, so that I can adapt the Focus_Timer to my preferred work-session length.

#### Acceptance Criteria

1. THE Focus_Timer SHALL provide a Duration_Input that accepts a whole number of minutes between 1 and 180 inclusive.
2. WHEN the user submits a valid duration via the Duration_Input, THE Focus_Timer SHALL persist the value to Local_Storage under Storage_Key_Duration.
3. WHEN the user submits a valid duration via the Duration_Input, THE Focus_Timer SHALL reset the countdown display to the new duration (in MM:SS format) without starting the timer.
4. IF the user submits a value outside the range 1–180 or a non-numeric value via the Duration_Input, THEN THE Focus_Timer SHALL reject the submission and display an inline validation message.
5. WHEN the Dashboard page loads, THE Focus_Timer SHALL read Storage_Key_Duration from Local_Storage and initialise the countdown to the stored duration.
6. IF Storage_Key_Duration is absent from Local_Storage on page load, THEN THE Focus_Timer SHALL initialise the countdown to 25 minutes (the existing default).
7. WHEN the user activates the Reset control, THE Focus_Timer SHALL restore the countdown to the currently configured duration (the stored custom value, or 25 minutes if none is stored).
8. WHILE the Focus_Timer is counting down, THE Focus_Timer SHALL disable the Duration_Input to prevent mid-session changes.

---

### Requirement 4: Prevent Duplicate Tasks

**User Story:** As a user, I want the Dashboard to prevent me from adding a task that already exists in my list, so that I do not end up with duplicate entries that clutter my task list.

#### Acceptance Criteria

1. WHEN the user attempts to add a task whose trimmed text matches the trimmed text of any existing Task in a case-insensitive comparison, THEN THE Todo_List SHALL reject the submission.
2. WHEN a duplicate task submission is rejected, THE Todo_List SHALL display an inline error message adjacent to the task input field indicating that the task already exists.
3. WHEN a duplicate task submission is rejected, THE Todo_List SHALL leave the task input field populated with the submitted text so the user can modify it.
4. WHEN the user modifies the task input field after a duplicate rejection, THE Todo_List SHALL clear the duplicate error message.
5. THE Todo_List SHALL continue to reject empty and whitespace-only task descriptions as defined in the base requirements, independently of the duplicate check.

---

### Requirement 5: Sort Tasks

**User Story:** As a user, I want to sort my task list in different orders, so that I can view my tasks in the way that is most useful to me at any given time.

#### Acceptance Criteria

1. THE Todo_List SHALL provide a Sort_Control that offers the following three sort options:
   - **Creation order** (default): tasks are displayed in the order they were added.
   - **Completed last**: incomplete tasks are displayed before completed tasks; within each group, the original creation order is preserved.
   - **Alphabetical (A–Z)**: tasks are sorted by their text in ascending case-insensitive alphabetical order.
2. WHEN the user selects a sort option via the Sort_Control, THE Todo_List SHALL immediately re-render the task list in the selected order.
3. WHEN the user selects a sort option via the Sort_Control, THE Todo_List SHALL persist the selected sort option to Local_Storage under Storage_Key_Sort.
4. WHEN the Dashboard page loads, THE Todo_List SHALL read Storage_Key_Sort from Local_Storage and apply the stored sort order when rendering the initial task list.
5. IF Storage_Key_Sort is absent from Local_Storage on page load, THEN THE Todo_List SHALL render tasks in creation order.
6. WHEN a new task is added, THE Todo_List SHALL render the updated task list in the currently active sort order.
7. WHEN a task is edited, completed, uncompleted, or deleted, THE Todo_List SHALL re-render the task list in the currently active sort order.
8. THE Sort_Control SHALL visually indicate which sort option is currently active.

---

### Requirement 6: Technology and Structure Constraints (Enhancements)

**User Story:** As a developer, I want all enhancements to integrate into the existing three-file structure using only vanilla HTML, CSS, and JavaScript, so that the project remains simple, portable, and maintainable without a build step.

#### Acceptance Criteria

1. THE Dashboard_App SHALL implement all five enhancements within the existing `index.html`, `css/styles.css`, and `js/app.js` files — no new files shall be introduced.
2. THE Dashboard_App SHALL implement all enhancements using only vanilla HTML, CSS, and JavaScript, with no external frameworks, libraries, or build tools.
3. THE Dashboard_App SHALL continue to function correctly as a standalone file opened directly in a browser via the `file://` protocol without requiring a local server.
4. THE Dashboard_App SHALL use the browser Local_Storage API as the sole mechanism for persisting all new preference data introduced by these enhancements.
5. THE Dashboard_App SHALL use the following new Local_Storage keys exclusively for the enhancements described in this document:
   - `"tld_theme"` — active colour theme (`"light"` or `"dark"`)
   - `"tld_name"` — user's display name (string)
   - `"tld_timer_duration"` — custom timer duration in minutes (integer)
   - `"tld_task_sort"` — active sort order (`"creation"`, `"completed-last"`, or `"alpha"`)
