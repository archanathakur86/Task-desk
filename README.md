# Roots Task Desk

A small employee and task manager built with React, Node.js, Express and MongoDB (Mongoose).
Business rules are enforced on the backend. The frontend mirrors them only so users get fast feedback.

# Frontend URL:https://profound-gaufre-8b3760.netlify.app
# Backend URL:https://task-desk-3c03.onrender.com

## Project layout

```
roots-task-desk/
├── server/          Express API
│   └── src/
│       ├── config/        database connection
│       ├── controllers/   thin request handlers
│       ├── middleware/    error handling
│       ├── models/        Employee, Task, Counter
│       ├── routes/        /employees, /tasks, /dashboard
│       ├── services/      business rules live here
│       ├── utils/         dates, pagination, CSV, errors
│       └── validators/    input checks
└── client/          React (Vite) app
    └── src/
        ├── api/           fetch wrappers per resource
        ├── components/    reusable pieces, grouped by feature
        ├── hooks/         URL state, data fetching
        ├── lib/           constants, formatting, form checks
        └── pages/         one file per route
```

## Setup

Requirements: Node.js 18+ and a MongoDB instance (local or Atlas).

```bash
# 1. API
cd server
cp .env.example .env        # set MONGO_URI
npm install
npm run dev                 # http://localhost:5000

# 2. Frontend (new terminal)
cd client
cp .env.example .env        # leave VITE_API_BASE_URL empty for local dev
npm install
npm run dev                 # http://localhost:5173
```

## Environment variables

| File | Variable | Purpose |
| --- | --- | --- |
| server/.env | `PORT` | API port, default 5000 |
| server/.env | `MONGO_URI` | MongoDB connection string |
| server/.env | `CLIENT_ORIGIN` | Allowed frontend origin(s), comma separated |
| client/.env | `VITE_API_BASE_URL` | Backend API base, for example `https://api.example.com/api`. Empty in local dev |

No secrets are committed. Login is not part of the scope.

## Deployment

- Backend: Render (Web Service), start command `npm start`, set the three server variables.
- Frontend: Netlify or Vercel, build command `npm run build`, publish directory `dist`, set `VITE_API_BASE_URL` to the backend URL plus `/api`. The `public/_redirects` file keeps deep links like `/tasks?status=Todo` working on refresh.

## API overview

All list endpoints return `{ data, pagination: { page, limit, total, totalPages } }`.
Errors return `{ message, details }`, where `details` maps field names to messages.

| Method | Path | Notes |
| --- | --- | --- |
| GET | `/api/employees` | `page`, `limit`, `search`, `department`, `status`, `sort` (name, joiningDate, createdAt), `order` |
| GET | `/api/employees/lookup` | Short list for dropdowns |
| GET | `/api/employees/:id` | Includes `activeTasks` |
| POST | `/api/employees` | 409 on duplicate ID or email |
| PUT | `/api/employees/:id` | Full update |
| DELETE | `/api/employees/:id` | 400 while Todo or In Progress tasks exist |
| GET | `/api/tasks` | `page`, `limit`, `search` (task title or employee name), `department`, `priority`, `status`, `assignee`, `dueFrom`, `dueTo`, `sort` (createdAt, dueDate, priority, title), `order` |
| GET | `/api/tasks/export.csv` | Same filters as the list, no pagination |
| GET | `/api/tasks/:id` | |
| POST | `/api/tasks` | Always creates the task in Todo |
| PUT | `/api/tasks/:id` | Details and assignment. Not status |
| PUT | `/api/tasks/:id/status` | Body `{ "status": "In Progress" }`. The only way to change status |
| DELETE | `/api/tasks/:id` | |
| GET | `/api/dashboard` | Counts and per-employee workload, calculated on the server |

Status codes: 400 for invalid data or a broken rule, 404 for missing records, 409 for duplicates or a status changed by someone else.

## Schema and relationship

**Employee**: `employeeId` (unique), `fullName`, `email` (unique, lowercased), `phone`, `department`, `role`, `joiningDate`, `status` (Active, Inactive, On Leave), `skills[]`, `leaveStart`, `leaveEnd` (only when On Leave).

**Task**: `taskCode` (TSK-001, generated), `title`, `description`, `assignedEmployee` (reference to Employee), `assigneeSnapshot` (`employeeId` and `fullName` copied at assignment), `department`, `priority`, `priorityRank` (derived, used for sorting), `status`, `startDate`, `dueDate`, `completedDate`, plus `createdAt` and `updatedAt`.

**Relationship**: one employee has many tasks. A task points to one employee by ObjectId.

## Employee deletion

An employee cannot be deleted while they have Todo or In Progress tasks. Completed and cancelled tasks are kept. Each task stores a snapshot of the assignee's ID and name when it was assigned, so old tasks still show a name after the employee is removed. The task detail page says the employee was removed and shows the name from the time of assignment.

## Business rules and where they live

- Assignment: `taskService.loadAssignableEmployee`. Inactive is always rejected. On Leave is rejected when the start date falls inside the leave period, both ends included.
- Dates: `validators/index.js`. Due date cannot be before start date.
- Status flow: `constants.js` (transition map) and `taskService.changeStatus`.
- Edit lock: `taskService.updateTask` rejects Completed and Cancelled tasks.
- Capacity: `taskService.createTask` and `updateTask` (see question 6).
- Overdue: computed on the server from `dueDate` and status. The same flag appears in list, details, dashboard and CSV.

## Assumptions

- Dates are calendar dates without a time. They are stored as UTC midnight and shown in UTC, so no day shifts.
- "Today" for overdue is the server's current UTC date.
- Employee ID is entered by the user (for example EMP-014), normalized to uppercase, and must be unique.
- A task's department is chosen separately from the employee's department, so a task can cross departments.
- Editing a task's start date re-runs the leave check.
- Deleting a task is allowed in any status.

## Answers to the review questions

**1. Where status transitions are validated and why.** In `taskService.changeStatus`, using the transition map in `constants.js`. Keeping the map in one place means the frontend dropdown and the backend check use the same rules. The update itself is a compare-and-set on the current status, so two users changing the same task at once cannot both succeed silently.

**2. Why Completed Date comes from the backend.** The client's clock and any submitted value can be wrong or missing. Setting it on the server when the status becomes Completed gives one trusted timestamp and means a client cannot backdate a finished task.

**3. How inactive and on-leave assignment is blocked.** `loadAssignableEmployee` runs on create, and on update when the assignee or start date changes. It loads the employee from the database, so the check cannot be skipped by sending a different status from the browser.

**4. Why filtering and pagination are on the backend.** The dataset grows, and the client should only receive what it displays. Server-side filters also mean CSV export and the list always agree, because they share one filter builder (`buildTaskFilter`).

**5. Why filters live in the URL.** A refresh, a bookmark or a copied link should show the same view. Keeping state in the URL also makes the back button behave as expected. `useSearchParamsState` is the single place that reads and writes it.

**6. What can go wrong if two requests assign a 4th active task at the same time.** Both requests can read "2 active tasks", both pass the first check, and both insert, leaving the employee with 4 active tasks. This implementation adds a second check after the write: it counts again, and if the total is above 3 it removes or reverts the task it just wrote. Under a race both requests may be rejected, which is safe, but no 4th active task is kept. The stronger production fix is an atomic counter on the employee document (`findOneAndUpdate` with `activeTaskCount: { $lt: 3 }`) or a transaction. I chose the post-write check to keep the code simple and still correct.

## Testing notes

- **API business rules (33 checks)** against a MongoDB-compatible server: duplicate ID and email, inactive and on-leave assignment (leave edges inclusive), the 3-task capacity limit with concurrent creates, status transitions, edit lock on finished tasks, employee deletion, snapshot names for removed employees, overdue flags, search, filters, sorting, pagination, CSV export and the dashboard.
- **Phone validation:** 10-digit Indian numbers, or `+` with a country code for international numbers.
- **Browser flows (29 checks)** driven with Playwright: employee and task creation, validation messages, leave and capacity errors, status flow, URL filters, CSV export link, back links, and blocked deletion.
- **Responsive layout:** no sideways page scrolling at 390px, 768px and 1280px on the dashboard, employee, and task pages.
- Not yet covered by automation: deployed URLs (Render and Netlify), and a manual pass on a real phone.
