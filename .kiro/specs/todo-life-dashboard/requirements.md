# Requirements Document

## Introduction

The **To-Do List Life Dashboard** is a client-side, single-page web application built with HTML, CSS, and Vanilla JavaScript. It provides users with a personal productivity hub featuring a live greeting with time and date, a Pomodoro-style focus timer, a persistent to-do list, and a customizable quick-links panel. All data is stored in the browser's Local Storage — no backend or server is required. The app must work as a standalone web page or browser extension in all modern browsers.

---

## Glossary

- **Dashboard**: The single-page web application described in this document.
- **Greeting_Widget**: The UI component that displays the current time, date, and a time-based greeting message.
- **Focus_Timer**: The UI component that implements a 25-minute countdown timer with Start, Stop, and Reset controls.
- **Todo_List**: The UI component that manages a collection of task items.
- **Task**: A single to-do item with a text description and a completion state.
- **Quick_Links**: The UI component that displays a set of user-defined shortcut buttons that open URLs.
- **Link**: A single quick-link entry consisting of a label and a URL.
- **Local_Storage**: The browser's `localStorage` API used for client-side data persistence.
- **Dashboard_App**: The overall JavaScript application that initialises and coordinates all widgets.

---

## Requirements

### Requirement 1: Live Greeting Widget

**User Story:** As a user, I want to see the current time, date, and a personalised greeting when I open the Dashboard, so that I am immediately oriented to the current moment.

#### Acceptance Criteria

1. THE Greeting_Widget SHALL display the current time in HH:MM format, updated every minute.
2. THE Greeting_Widget SHALL display the current date in a human-readable format (e.g., "Monday, 5 May 2025").
3. WHEN the current local time is between 05:00 and 11:59, THE Greeting_Widget SHALL display the message "Good Morning".
4. WHEN the current local time is between 12:00 and 17:59, THE Greeting_Widget SHALL display the message "Good Afternoon".
5. WHEN the current local time is between 18:00 and 20:59, THE Greeting_Widget SHALL display the message "Good Evening".
6. WHEN the current local time is between 21:00 and 04:59, THE Greeting_Widget SHALL display the message "Good Night".
7. WHEN the Dashboard page loads, THE Greeting_Widget SHALL render the correct time, date, and greeting without requiring any user interaction.

---

### Requirement 2: Focus Timer

**User Story:** As a user, I want a 25-minute countdown timer with Start, Stop, and Reset controls, so that I can manage focused work sessions.

#### Acceptance Criteria

1. THE Focus_Timer SHALL initialise with a countdown value of 25 minutes and 00 seconds (25:00).
2. WHEN the user activates the Start control, THE Focus_Timer SHALL begin counting down one second at a time.
3. WHILE the Focus_Timer is counting down, THE Focus_Timer SHALL update the displayed time every second.
4. WHEN the user activates the Stop control, THE Focus_Timer SHALL pause the countdown and retain the current remaining time.
5. WHEN the user activates the Reset control, THE Focus_Timer SHALL stop any active countdown and restore the displayed time to 25:00.
6. WHEN the countdown reaches 00:00, THE Focus_Timer SHALL stop automatically and display a visual indicator that the session has ended.
7. WHILE the Focus_Timer is counting down, THE Focus_Timer SHALL disable the Start control to prevent duplicate timers.
8. WHILE the Focus_Timer is paused or reset, THE Focus_Timer SHALL disable the Stop control.

---

### Requirement 3: To-Do List

**User Story:** As a user, I want to add, edit, mark as done, and delete tasks that persist across browser sessions, so that I can track my daily responsibilities reliably.

#### Acceptance Criteria

1. THE Todo_List SHALL provide an input field and an Add button for creating new tasks.
2. WHEN the user submits a non-empty task description, THE Todo_List SHALL add a new Task to the list and display it immediately.
3. IF the user attempts to submit an empty task description, THEN THE Todo_List SHALL reject the submission and display an inline validation message.
4. WHEN the user activates the edit control on a Task, THE Todo_List SHALL replace the task's display text with an editable input field pre-filled with the current description.
5. WHEN the user confirms an edit with a non-empty description, THE Todo_List SHALL update the Task's text and return to display mode.
6. IF the user confirms an edit with an empty description, THEN THE Todo_List SHALL reject the update and retain the original task text.
7. WHEN the user activates the completion toggle on a Task, THE Todo_List SHALL mark the Task as done and apply a visual distinction (e.g., strikethrough) to differentiate it from incomplete tasks.
8. WHEN the user activates the completion toggle on an already-completed Task, THE Todo_List SHALL mark the Task as incomplete and remove the visual distinction.
9. WHEN the user activates the delete control on a Task, THE Todo_List SHALL remove the Task from the list permanently.
10. WHEN any Task is added, edited, completed, uncompleted, or deleted, THE Todo_List SHALL persist the updated task collection to Local_Storage.
11. WHEN the Dashboard page loads, THE Todo_List SHALL retrieve and render all previously saved tasks from Local_Storage.
12. IF Local_Storage contains no saved tasks on page load, THEN THE Todo_List SHALL render an empty list with no errors.

---

### Requirement 4: Quick Links

**User Story:** As a user, I want to save and manage shortcut buttons that open my favourite websites, so that I can navigate to them quickly from the Dashboard.

#### Acceptance Criteria

1. THE Quick_Links SHALL provide an input form with fields for a link label and a URL, and an Add button for creating new links.
2. WHEN the user submits a non-empty label and a valid URL, THE Quick_Links SHALL add a new Link and display it as a clickable button.
3. IF the user attempts to submit a link with an empty label or an empty URL, THEN THE Quick_Links SHALL reject the submission and display an inline validation message.
4. IF the user attempts to submit a URL that does not begin with "http://" or "https://", THEN THE Quick_Links SHALL reject the submission and display an inline validation message indicating the URL format requirement.
5. WHEN the user activates a Link button, THE Quick_Links SHALL open the associated URL in a new browser tab.
6. WHEN the user activates the delete control on a Link, THE Quick_Links SHALL remove the Link from the panel permanently.
7. WHEN any Link is added or deleted, THE Quick_Links SHALL persist the updated link collection to Local_Storage.
8. WHEN the Dashboard page loads, THE Quick_Links SHALL retrieve and render all previously saved links from Local_Storage.
9. IF Local_Storage contains no saved links on page load, THEN THE Quick_Links SHALL render an empty panel with no errors.

---

### Requirement 5: Technology and Structure Constraints

**User Story:** As a developer, I want the Dashboard built with plain HTML, CSS, and Vanilla JavaScript in a defined folder structure, so that the project remains simple, portable, and maintainable without a build step.

#### Acceptance Criteria

1. THE Dashboard_App SHALL be implemented using only HTML, CSS, and Vanilla JavaScript, with no external frameworks or libraries.
2. THE Dashboard_App SHALL contain exactly one CSS file located at `css/`.
3. THE Dashboard_App SHALL contain exactly one JavaScript file located at `js/`.
4. THE Dashboard_App SHALL function correctly as a standalone file opened directly in a browser (file:// protocol) without requiring a local server.
5. THE Dashboard_App SHALL function correctly in the current stable versions of Chrome, Firefox, Edge, and Safari.
6. THE Dashboard_App SHALL use the browser Local_Storage API as the sole mechanism for persisting user data.

---

### Requirement 6: Performance and Visual Design

**User Story:** As a user, I want the Dashboard to load quickly and respond immediately to my interactions, with a clean and readable visual design, so that using it feels effortless.

#### Acceptance Criteria

1. THE Dashboard_App SHALL render all widgets and display correct content within 2 seconds of the page load event on a standard desktop connection.
2. WHEN the user interacts with any control (button, input, toggle), THE Dashboard_App SHALL reflect the result of that interaction within 100 milliseconds.
3. THE Dashboard_App SHALL apply a clear visual hierarchy so that each widget is visually distinct and its purpose is immediately apparent.
4. THE Dashboard_App SHALL use typography with a minimum body font size of 14px to ensure readability.
5. THE Dashboard_App SHALL present a clean, minimal interface with no extraneous UI elements that are not described in Requirements 1–4.
