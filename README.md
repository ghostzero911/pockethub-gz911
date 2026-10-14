# PocketHub

**A simple, local-first productivity hub for everyday work.**

PocketHub brings tasks, notes, quick calculations, and a productivity overview into one lightweight web application. Built with React and TypeScript, it focuses on a clean interface, practical workflows, and keeping your data stored locally in the browser.

## Features

### Dashboard
- View a summary of your tasks and completion progress.
- See your task list at a glance.
- Access Tasks, Notes, and Calculator from one place.
- Return to the dashboard and refresh task information as you navigate.

### Task Manager
- Create, edit, and delete tasks.
- Mark tasks as complete or reopen them.
- Set optional schedules and deadlines.
- Identify overdue tasks.
- Track task status through the dashboard.

### Notes
- Create and manage notes.
- Edit note titles and content.
- Switch between saved notes.
- Delete notes you no longer need.
- Automatically update note timestamps when saving.

### Calculator
- Perform basic arithmetic calculations.
- Work with decimal numbers.
- Calculate percentages.
- Toggle the sign of a number.
- Clear the current calculation.
- Handle division-by-zero cases.

## Tech Stack

| Technology | Purpose |
|---|---|
| React | User interface |
| TypeScript | Type safety |
| Vite | Development server and build tooling |
| IndexedDB | Browser-based local data storage |
| `idb` | Promise-based IndexedDB interface |
| Vitest | Unit and component testing |
| React Testing Library | UI behavior testing |
| `user-event` | Simulating user interactions |
| ESLint | Code quality and linting |
| `fake-indexeddb` | IndexedDB testing in a simulated environment |

## Getting Started

### Prerequisites

Install the following before running PocketHub:

- [Node.js](https://nodejs.org/) — use a version compatible with the project's Vite dependencies.
- npm, included with Node.js.
- Git, if you want to clone or manage the project with version control.

### Installation

Clone the repository or open your existing project directory.

```bash
git clone <your-repository-url>
cd pockethub
```

Install dependencies:

```bash
npm install
```

If you are already working from the project directory, skip the cloning step.

### Run the Development Server

```bash
npm run dev
```

Open the local URL printed in your terminal by Vite, usually:

```text
http://localhost:5173
```

The development server supports hot module replacement, so most code changes appear in the browser without manually restarting the application.

## Available Commands

Run these commands from the project root.

| Command | Description |
|---|---|
| `npm run dev` | Start the local development server |
| `npm run build` | Create a production build |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint checks |
| `npm run test` | Run the test suite once |
| `npm run test:watch` | Run tests in watch mode |

### Run All Quality Checks

Before committing changes, run:

```bash
npm run test
npm run lint
npm run build
```

All three commands should complete successfully before considering a change ready for a checkpoint.

## Data Storage and Privacy

PocketHub uses **IndexedDB**, a browser-based database, to store application data locally.

This means:

- Tasks and notes are stored in the browser rather than a remote application server.
- Data can persist across browser refreshes and normal browser restarts.
- The app does not currently provide automatic cloud synchronization between devices.
- Clearing browser site data or using a different browser profile may remove or make existing local data inaccessible.

For important information, keep an independent backup until an export and restore feature is available.

## Testing

PocketHub includes automated tests for its core functionality.

Current test coverage includes:

- Database operations for tasks and notes.
- Task creation, editing, completion, scheduling, deadlines, and deletion.
- Note creation, selection, editing, saving, and deletion.
- Calculator operations and edge cases.
- Dashboard rendering, task progress, navigation, and error handling.

The test environment uses Vitest, React Testing Library, and `fake-indexeddb` to test behavior without relying on a user's actual browser database.

Automated tests do not replace manual checks for visual appearance, responsive layouts, keyboard accessibility, or behavior across different browsers.

## Project Structure

The main application code is organized by feature.

```text
pockethub/
├── src/
│   ├── features/
│   │   ├── tasks/
│   │   │   ├── TasksPage.tsx
│   │   │   └── TasksPage.test.tsx
│   │   ├── notes/
│   │   │   ├── NotesPage.tsx
│   │   │   └── NotesPage.test.tsx
│   │   └── calculator/
│   │       ├── CalculatorPage.tsx
│   │       └── CalculatorPage.test.tsx
│   ├── lib/
│   │   ├── db.ts
│   │   └── db.test.ts
│   ├── test/
│   │   └── setup.ts
│   ├── App.tsx
│   ├── App.test.tsx
│   ├── App.css
│   └── index.css
├── package.json
├── vite.config.ts
└── README.md
```

*This is a representative overview of the current structure. Additional files, components, and configuration may exist in the project.*

## Development Principles

PocketHub is being developed around a few practical principles:

- **Local-first:** Keep core workflows usable without requiring a backend.
- **Simple UX:** Favor clear navigation and straightforward interactions.
- **Feature separation:** Keep tasks, notes, and calculator functionality organized by feature.
- **Type safety:** Use TypeScript to catch common mistakes during development.
- **Testable behavior:** Automate functional checks where practical.
- **Incremental development:** Make changes in small steps and verify them with tests, linting, and production builds.

## Current Limitations

PocketHub is an evolving personal productivity project. Current limitations include:

- No user accounts or authentication.
- No cloud database or cross-device synchronization.
- No automatic cloud backup.
- No confirmed import/export workflow for user data.
- Visual and responsive behavior still requires manual verification.

These limitations may change as development continues.

## Roadmap

Potential future improvements include:

- [ ] Task filtering, sorting, and search.
- [ ] Improved task organization and prioritization.
- [ ] Note search and organization.
- [ ] Data export and import.
- [ ] Optional cloud backup and synchronization.
- [ ] Improved keyboard accessibility.
- [ ] Additional responsive layout refinements.
- [ ] Expanded automated integration tests.

The roadmap is exploratory; these features are not represented as implemented.

## Contributing

PocketHub is currently a personal development project. If you extend it, a useful workflow is:

1. Create a dedicated Git branch.
2. Make one focused change at a time.
3. Add or update tests for the affected behavior.
4. Run the test suite, lint checks, and production build.
5. Review the changes before committing.

```bash
git switch -c feature/your-feature
npm run test
npm run lint
npm run build
git add .
git commit -m "feat: describe your change"
```

## License

No license has been specified yet. Unless a license is added to the repository, the project's reuse and redistribution terms should not be assumed to be open source.

---

**PocketHub — your everyday workspace, kept simple.**
