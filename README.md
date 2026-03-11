# MicroTask Platform

An internal microtask management SPA built with **Next.js 16 (App Router)**, **React 19**, **TypeScript**, and **TanStack Query v5**. All data is stored client-side in `localStorage` via a simulated async storage layer that introduces realistic latency and occasional random errors.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Data Model](#data-model)
- [Storage Layer](#storage-layer)
- [Authentication Flow](#authentication-flow)
- [Worker Flow](#worker-flow)
- [Admin Flow](#admin-flow)
- [Theme System](#theme-system)
- [Component Reference](#component-reference)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| UI | React 19 + TypeScript |
| Data fetching | TanStack Query v5 |
| Data tables | TanStack Table v8 |
| Rich text editor | Lexical (`@lexical/react`) |
| Forms | React Hook Form + Zod v4 |
| Persistence | `localStorage` (mock server) |
| Styling | Vanilla CSS (`Microtask.css`) |
| Icons | `react-icons` |
| ID generation | `nanoid` |

---

## Project Structure

```
src/
├── Microtask.tsx                   # Root component — session gate, QueryClientProvider, ThemeProvider
├── app/
│   ├── layout.tsx                  # Next.js root layout (fonts, globals.css)
│   └── page.tsx                    # Renders <Microtask />
├── auth/
│   └── AuthProvider.tsx            # Context + useAuth hook
├── components/
│   ├── common/
│   │   ├── Avatar.tsx              # Initials avatar
│   │   ├── Badge.tsx               # Status + type badges
│   │   ├── LexicalEditor.tsx       # Rich text / markdown editor (Lexical-based)
│   │   ├── ProgressBar.tsx         # Slot fill progress bar
│   │   ├── ThemeContext.tsx        # ThemeProvider context + useTheme hook
│   │   └── ThemeToggle.tsx         # Dark / Light mode toggle button
│   └── layout/
│       ├── AdminShell.tsx          # Admin app shell (sidebar, topbar, routing)
│       └── WorkerShell.tsx         # Worker app shell (sidebar, topbar, routing)
├── data/
│   └── microtaskData.ts            # Static reference data
├── features/
│   ├── hooks.ts                    # TanStack Query hooks for tasks and submissions
│   └── microtask/
│       ├── AdminSubmissionsPage.tsx  # Submission review table with approve/reject
│       ├── AdminTasksPage.tsx        # Admin task table with campaign filter & stats
│       ├── LoginPage.tsx             # Login form UI
│       ├── TaskComposerPage.tsx      # Create/edit task form (with Lexical editor)
│       └── WorkerFeedPage.tsx        # Worker task feed + submission form
├── libs/
│   ├── types.ts                    # All TypeScript interfaces and type aliases
│   └── validation.ts               # Zod schemas for form validation
├── mock/
│   └── seed.ts                     # Seed data: SEED_CAMPAIGNS, users, tasks, submissions
├── storage/
│   └── index.ts                    # Mock async storage layer (authStore, taskStore, submissionStore, etc.)
└── styles/
    └── Microtask.css               # All application CSS (includes theme variables)
```

---

## Data Model

### `User`
```ts
{ id, username, email, role: 'admin' | 'worker',
  total_earned, total_submissions, approved_submissions, created_at }
```

### `Session`
```ts
{ userId, role: 'admin' | 'worker', username, email }
```

### `Task`
```ts
{ id, task_type: 'social_media_posting' | 'email_sending' | 'social_media_liking',
  title, description, details, amount, reward, allow_multiple_submissions,
  campaign_id, status: 'active' | 'paused' | 'completed',
  submissions_count, approved_count, created_at, updated_at }
```

### `Submission` (discriminated union)
```ts
// Social posting / liking
{ id, task_id, user_id, task_type, status: 'pending'|'approved'|'rejected',
  post_url, screenshot_url, submitted_at, reviewed_at?, rejection_reason? }

// Email sending
{ ...base, task_type: 'email_sending', email_content, screenshot_url }
```

### `Campaign`
```ts
{ id, name, description?, created_at }
```

### localStorage Keys
| Key | Contents |
|---|---|
| `mt_users` | `User[]` |
| `mt_tasks` | `Task[]` |
| `mt_submissions` | `Submission[]` |
| `mt_campaigns` | `Campaign[]` |
| `mt_session` | Active `Session` |
| `theme` | `'dark' \| 'light'` |

---

## Storage Layer

`src/storage/index.ts` exports five store objects that simulate a real async API:

- **`sessionStorage`** — `get()`, `set()`, `clear()` for the active session (synchronous wrapper around `localStorage`).
- **`authStore`** — `login(username, password)` / `logout()`. Admin credentials are hardcoded (`admin`/`admin`). Any other username auto-registers a new worker account.
- **`userStore`** — `getById()`, `getAll()`.
- **`campaignStore`** — `getAll()`, `create()`.
- **`taskStore`** — `getAll(filters?)`, `getById()`, `create()`, `update()`, `delete()`, `bulkUpdate()`. Internally calls `_updateCounts()` after each submission event, and auto-completes a task when `approved_count >= amount`.
- **`submissionStore`** — `getAll(filters?)`, `getByTaskId()`, `create()`, `approve()`, `reject()`. Approving a submission credits the worker's `total_earned` and increments `approved_submissions`.

All async methods add simulated latency (reads: 0.8–2 s, writes: 2–4 s) and have an 8% chance of throwing a random error on write operations.

---

## Authentication Flow

```
app/page.tsx
  └── <Microtask />  (src/Microtask.tsx)
        │
        ├── useEffect on mount
        │     ├── seedLocalStorage()     → writes SEED_CAMPAIGNS, users, tasks, submissions to localStorage
        │     └── sessionStorage.get()  → restores saved session on page reload
        │
        ├── No session  → <LoginPage onLogin={handleLogin} />
        │     └── User enters credentials → authStore.login()
        │           ├── admin / admin  → Session { role: 'admin' }
        │           └── any other     → find or auto-create Worker → Session { role: 'worker' }
        │
        ├── session.role === 'admin'  → <AdminShell />
        └── session.role === 'worker' → <WorkerShell />
```

Demo credentials shown on the login screen:
- **Admin:** `admin` / `admin`
- **Worker:** any username + any password (auto-registers)

---

## Worker Flow

```
<WorkerShell session onLogout>
  │
  ├── Sidebar
  │     ├── "Tasks" nav item  → page = 'feed'
  │     ├── "Profile" nav item → page = 'profile'
  │     └── Earnings snapshot (total_earned, approved/total)
  │
  ├── page = 'feed'  →  <WorkerFeedPage session>
  │     │
  │     ├── DATA: useTasks({ status: 'active' })       → active tasks from localStorage
  │     │         useSubmissions({ user_id })           → worker's own submissions
  │     │
  │     ├── Filter bar: All / Posting / Email / Liking tabs + sort (Latest / Highest reward)
  │     ├── Stats bar: Total Earned, Tasks Submitted, Approved, Pending
  │     │
  │     ├── Task cards (grid)
  │     │     ├── Shows: type badge, reward, title, slots remaining, campaign chip
  │     │     ├── "Submitted ✓" label if worker already submitted (no multi-sub tasks)
  │     │     └── "Submit →" button → opens task detail sheet
  │     │
  │     └── Task Detail / Submit Sheet (slide-in overlay)
  │           ├── Detail view: reward, slots left, description, instructions (rendered markdown)
  │           └── Submit view (submitMode = true)
  │                 ├── Social posting / liking → Post URL field + screenshot upload
  │                 ├── Email sending          → Email content textarea + screenshot upload
  │                 └── "Submit for Review" → createSubmission.mutateAsync()
  │                       └── submissionStore.create() → status: 'pending'
  │                             └── TanStack Query invalidates submissions + tasks caches
  │
  └── page = 'profile'
        ├── Avatar, username, email
        ├── Stats: Total Earned, Submissions, Approved (with approval rate)
        └── Recent 5 submissions list with status badges
```

**Worker data writes:**
- `createSubmission()` → new `Submission` with `status: 'pending'`, increments `User.total_submissions`

---

## Admin Flow

```
<AdminShell session onLogout>
  │
  ├── Sidebar
  │     ├── "Tasks" nav item      → page = 'tasks', clear campaign/task filters
  │     ├── "Submissions" nav item → page = 'submissions', clear task filter
  │     ├── "Task Composer" nav item → composing = true
  │     └── Campaign list (from SEED_CAMPAIGNS)
  │           └── Click campaign → activeCampaignId = c.id, page = 'tasks'
  │
  ├── Topbar breadcrumb + ThemeToggle button (top-right)
  │     ├── Composing            → "Tasks › Edit Task" or "Tasks › New Task"
  │     ├── Campaign filter active → "Tasks › {campaign.name}" (click "Tasks" to clear)
  │     └── Default              → "Task Management" / "Submissions"
  │
  ├── composing = true  →  <TaskComposerPage onBack editTaskId?>
  │     │
  │     ├── DATA: useTask(editTaskId) → pre-fills form when editing
  │     │         campaignStore.getAll() → populates campaign dropdown
  │     │
  │     ├── Form: task type selector, title, description, full details (Lexical rich-text editor),
  │     │         campaign, amount (slots), reward (AUD), allow multiple submissions toggle
  │     ├── Live budget estimate: amount × reward
  │     ├── Submission form preview (read-only, changes with task type)
  │     └── Save → useCreateTask() or useUpdateTask()
  │           └── Invalidates all task queries
  │
  ├── page = 'tasks'  →  <AdminTasksPage onOpenComposer onEditTask onViewSubmissions campaignId?>
  │     │
  │     ├── DATA: useTasks()       → all tasks
  │     │         useSubmissions() → all submissions (for live stats)
  │     │
  │     ├── Stats cards (scoped to active campaign or all):
  │     │     Active Tasks, Total Submissions, Pending Review, Rewards Paid
  │     │
  │     ├── Task table (TanStack Table)
  │     │     ├── Filters: search, type, status
  │     │     ├── Multi-select checkboxes + "Bulk Edit" button
  │     │     ├── Columns: Task, Type, Campaign, Reward, Progress bar, Status, Created, Actions
  │     │     └── Row actions: View | Submissions | Edit | Delete
  │     │           ├── "View"        → task detail sheet
  │     │           ├── "Submissions" → onViewSubmissions(taskId) → page = 'submissions', filterTaskId = taskId
  │     │           ├── "Edit"        → onEditTask(taskId) → composing = true, editTaskId = taskId
  │     │           └── "Delete"      → useDeleteTask() → removes task + all its submissions
  │     │
  │     └── Task Detail Sheet
  │           ├── Stats: reward, submissions count, approved count, progress bar
  │           ├── Recent 3 submissions preview
  │           └── Actions: Edit Task | Pause/Resume | Delete
  │
  └── page = 'submissions'  →  <AdminSubmissionsPage filterTaskId? onClearTaskFilter>
        │
        ├── DATA: useSubmissions() → all submissions
        │         useTasks()       → task lookup map (id → Task)
        │
        ├── Filter chip (when filterTaskId set): "Filtered by task: {title}" with ✕ clear button
        ├── Tabs: Pending ({n}) | Approved ({n}) | Rejected ({n})
        │
        ├── Submissions table (TanStack Table)
        │     ├── Columns: Worker avatar, Task title, Type, Submitted date, Evidence preview, Status
        │     ├── Pending tab adds: Approve / Reject quick-action buttons
        │     └── Rejected tab adds: Rejection reason column
        │
        └── Submission Detail Sheet
              ├── Worker avatar + username + submission date
              ├── Task context block (title, type badge, status)
              ├── Evidence: post URL (link) or email content + screenshot image
              ├── Pending → Approve / Reject buttons
              │     ├── "Approve" → useApproveSubmission()
              │     │     └── submissionStore.approve() → status: 'approved'
              │     │           ├── taskStore._updateCounts() → updates task approved_count
              │     │           └── User.total_earned += task.reward, approved_submissions += 1
              │     └── "Reject"  → show rejection reason textarea → useRejectSubmission()
              │           └── submissionStore.reject(id, reason) → status: 'rejected'
              └── Rejected submissions show the stored rejection_reason read-only
```

---

## Theme System

The app ships with **Dark mode** (default) and **Light mode**, toggled via a button in the topbar.

- **`ThemeProvider`** (`src/components/common/ThemeContext.tsx`) — wraps the app; reads preference from `localStorage` (`theme` key) on mount and falls back to `prefers-color-scheme` if no stored value exists.
- **`useTheme()`** — hook to access `{ theme, toggleTheme }` anywhere inside the provider.
- **`ThemeToggle`** (`src/components/common/ThemeToggle.tsx`) — icon button that calls `toggleTheme()`.
- CSS variables are defined under `[data-theme="dark"]` and `[data-theme="light"]` selectors in `Microtask.css`; the `data-theme` attribute is set on `<html>` by the provider.

---

## Component Reference

| Component | Location | Role |
|---|---|---|
| `Microtask` | `src/Microtask.tsx` | Root entry: session gate, QueryClientProvider, ThemeProvider, seed |
| `LoginPage` | `features/microtask/LoginPage.tsx` | Credential form, demo hint |
| `AdminShell` | `components/layout/AdminShell.tsx` | Admin layout shell, in-memory routing |
| `WorkerShell` | `components/layout/WorkerShell.tsx` | Worker layout shell, page switching |
| `WorkerFeedPage` | `features/microtask/WorkerFeedPage.tsx` | Task feed, filtering, submission form |
| `AdminTasksPage` | `features/microtask/AdminTasksPage.tsx` | Task management table + campaign stats |
| `AdminSubmissionsPage` | `features/microtask/AdminSubmissionsPage.tsx` | Submission review with approve/reject |
| `TaskComposerPage` | `features/microtask/TaskComposerPage.tsx` | Create / edit task form (Lexical editor) |
| `LexicalEditor` | `components/common/LexicalEditor.tsx` | Rich text / markdown editor component |
| `ThemeProvider` / `useTheme` | `components/common/ThemeContext.tsx` | Theme context + hook |
| `ThemeToggle` | `components/common/ThemeToggle.tsx` | Dark / Light mode toggle button |
| `Badge` / `TypeBadge` | `components/common/Badge.tsx` | Status and task-type badges |
| `ProgressBar` | `components/common/ProgressBar.tsx` | Slot fill indicator |
| `Avatar` | `components/common/Avatar.tsx` | Initials avatar component |

### TanStack Query Hooks (`features/hooks.ts`)

| Hook | Type | Invalidates |
|---|---|---|
| `useTasks(filters?)` | Query | — |
| `useTask(id)` | Query | — |
| `useCreateTask()` | Mutation | `taskKeys.all` |
| `useUpdateTask()` | Mutation | `taskKeys.all`, `taskKeys.detail(id)` |
| `useDeleteTask()` | Mutation | `taskKeys.all`, `submissionKeys.all` |
| `useBulkUpdateTasks()` | Mutation | `taskKeys.all` |
| `useSubmissions(filters?)` | Query | — |
| `useTaskSubmissions(taskId)` | Query | — |
| `useCreateSubmission()` | Mutation | `submissionKeys.all`, task detail + list |
| `useApproveSubmission()` | Mutation | `submissionKeys.all`, task detail + list |
| `useRejectSubmission()` | Mutation | `submissionKeys.all`, task detail + list |

---

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

| Script | Description |
|---|---|
| `npm run dev` | Start the Next.js development server |
| `npm run build` | Build the production bundle |
| `npm run start` | Serve the production build |
| `npm run lint` | Run ESLint |
