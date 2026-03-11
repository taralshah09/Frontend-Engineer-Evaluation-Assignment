# CLAUDE.md — MicroTask Platform Assignment

## Project Overview
Internal freelancing platform for micro-tasks. Two roles: **admin** (posts tasks, reviews submissions) and **worker** (completes tasks for rewards).

## Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Shadcn UI (customized)
- **Forms**: react-hook-form + Zod
- **Data fetching**: TanStack Query
- **Tables**: TanStack Table
- **URL state**: nuqs
- **Markdown editor**: Lexical
- **Storage**: localStorage (mock server)

## Mock Auth Strategy
- **Admin**: username `admin`, password `admin` — hardcoded, role stored in localStorage session
- **Worker**: any username/password — account created on first login and persisted to localStorage
- Session stored as `{ userId, role, username }` in `localStorage['mt_session']`

## localStorage Schema
```
mt_session        → { userId, role, username, email }
mt_users          → User[]
mt_tasks          → Task[]
mt_submissions    → Submission[]
mt_campaigns      → Campaign[]
```

## Routing Structure
```
/                           → redirect based on role
/login                      → shared login page
/admin/tasks                → task management table
/admin/tasks/new            → task composer (create)
/admin/tasks/[id]/edit      → task composer (edit)
/admin/submissions          → submissions management
/worker/feed                → tasks feed (mobile-first)
/worker/profile             → worker profile + earnings
```

## Folder Structure
```
src/
  app/
    (auth)/login/page.tsx
    (admin)/
      layout.tsx             ← admin shell + sidebar
      tasks/page.tsx
      tasks/new/page.tsx
      tasks/[id]/edit/page.tsx
      submissions/page.tsx
    (worker)/
      layout.tsx             ← worker shell + bottom nav
      feed/page.tsx
      profile/page.tsx
  components/
    ui/                      ← shadcn (customized)
    layout/
      AdminSidebar.tsx
      AdminHeader.tsx
      WorkerNav.tsx
    tasks/
      TaskComposer/
        index.tsx
        TaskTypeSelector.tsx
        DetailsEditor.tsx
      TaskCard.tsx
      TaskFeed/
        index.tsx
        TaskDetailDrawer.tsx
        SubmitTaskForm.tsx
      TaskTable/
        index.tsx
        columns.tsx
        BulkEditDialog.tsx
    submissions/
      SubmissionTable/
        index.tsx
        columns.tsx
      SubmissionReviewSheet.tsx
  features/
    auth/
      AuthProvider.tsx
      useAuth.ts
    tasks/
      useTasks.ts
      useTask.ts
      useCreateTask.ts
      useUpdateTask.ts
      useDeleteTask.ts
    submissions/
      useSubmissions.ts
      useReviewSubmission.ts
      useCreateSubmission.ts
  lib/
    storage/
      base.ts                ← generic get/set/delay helpers
      tasks.ts
      submissions.ts
      users.ts
    mock/
      seed.ts                ← initial seed data
      factories.ts           ← data generators
    types.ts
    utils.ts
    constants.ts
  providers/
    AppProviders.tsx         ← wraps QueryProvider + AuthProvider
```

## Design System Direction
- **Aesthetic**: Refined utilitarian — dark sidebar, clean white content area, sharp accents in indigo/violet
- **Font pairing**: `Sora` (headings) + `DM Sans` (body)
- **Color tokens** (CSS vars):
  - `--primary`: #6366f1 (indigo)
  - `--accent`: #8b5cf6 (violet)
  - `--surface`: #f8f9fc
  - `--sidebar`: #0f1117
- **Component philosophy**: Shadcn base → extend with class-variance-authority variants
- **Key UX decisions**:
  - Task details → slide-over sheet (not modal, not redirect) — Discord-style
  - Submission review → right sheet with task context always visible
  - Worker feed → card grid (mobile) / list (desktop), bottom tab nav on mobile
  - Admin tables → sticky headers, row hover actions, inline status badges

## Mock Server Contract
All storage functions must:
1. Return a Promise
2. Add 1–3s delay for reads, 3–5s for writes
3. Throw errors occasionally (10% chance) to test error states
4. Accept typed parameters and return typed data

## Key UX Decisions (Document Your Thinking)
| Screen | Decision | Reasoning |
|--------|----------|-----------|
| Task details (worker) | Drawer/Sheet from bottom on mobile, right sheet on desktop | Zero page reload, keeps feed context, Discord-like |
| Task composer | Stay on page after create, reset form | Admin creates many tasks in batches — redirect kills flow |
| Submissions screen | Tabs: Pending / Approved / Rejected | Pending is high-priority; mixing all three creates cognitive load |
| Task management | Full data table with inline preview | Admin needs density; row click opens right sheet with submissions |
| Worker feed | Separated by task type (tabs) | Different audiences for different task types; reduces scroll fatigue |
| Submission grouping | Group by task with collapsible rows | Makes it easy to see how a single task is performing |