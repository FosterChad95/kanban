# Cline Memory Bank

A consolidated knowledge base for the Kanban project, summarizing all relevant information for rapid onboarding, reference, and development.

---

## 1. Project Overview

- **Name:** Kanban
- **Purpose:** A collaborative Kanban board application for managing tasks, boards, teams, and users.
- **Tech Stack:** Next.js, React, TypeScript, Prisma, Tailwind CSS, PostgreSQL, NextAuth.js

---

## 2. Main Features

- User authentication (NextAuth.js, custom credentials, OAuth)
- Board, column, and task management (CRUD)
- Team management and user roles
- Real-time updates (Pusher)
- Responsive UI (Tailwind CSS)
- Modal-driven UX for board/task/team actions

---

## 3. Key Directories & Files

- `src/app/` - Next.js app directory (pages, API routes)
- `src/components/` - React UI components (Board, Task, Modal, etc.)
- `src/queries/` - Data access/query logic for boards, columns, tasks, users
- `src/lib/` - Auth, Prisma client, Pusher integration, utilities
- `src/providers/` - React context providers (Modal, Session, Theme)
- `prisma/` - Database schema and seed scripts
- `infra/terraform/` - Infrastructure as code (Terraform)
- `public/` - Static assets (SVGs, images)
- `README.md` - Project documentation

---

## 4. Database Schema (Prisma)

- **User:** id, name, email, image, hashedPassword, emailVerified, role
- **Board:** id, name, teamId, columns
- **Column:** id, name, boardId, tasks
- **Task:** id, title, description, status, columnId, subtasks
- **Team:** id, name, users, boards
- **Relationships:** Users can belong to teams; teams own boards; boards have columns; columns have tasks.

See `prisma/schema.prisma` for full schema.

---

## 5. API Endpoints

Located in `src/app/api/`:

- `/api/auth/[...nextauth]` - NextAuth.js authentication
- `/api/auth/signup` - User registration
- `/api/boards` - Board CRUD
- `/api/boards/[id]` - Board by ID
- `/api/columns` - Column CRUD
- `/api/tasks` - Task CRUD
- `/api/tasks/[id]` - Task by ID
- `/api/teams` - Team CRUD
- `/api/teams/add-user` - Add user to team
- `/api/users` - User management

---

## 6. Authentication

- **Library:** NextAuth.js
- **Providers:** Credentials, OAuth (expand as needed)
- **Custom logic:** `src/lib/auth.ts`, `src/app/api/auth/[...nextauth]/route.ts`
- **Password hashing:** bcrypt
- **Session management:** JWT

---

## 7. Notable Implementation Details

- **Real-time:** Pusher integration in `src/lib/pusher.ts`
- **State management:** React context providers in `src/providers/`
- **UI:** Modular, storybook-driven components in `src/components/`
- **Validation:** Zod schemas in `src/schemas/forms.ts`
- **Testing:** (Check `src/tests/` for test coverage)
- **Utilities:** Helper functions in `src/lib/utils.ts`

---

## 8. Development & Deployment

- **Local dev:** `npm run dev`
- **Prisma:** `npx prisma migrate dev`, `npx prisma studio`
- **Seeding:** `node prisma/seed.js`
- **Infra:** Terraform scripts in `infra/terraform/`
- **Environment:** Configure `.env` for secrets and DB connection

---

## 9. References

- [README.md](README.md)
- [Prisma Schema](prisma/schema.prisma)
- [API Routes](src/app/api/)
- [Component Library](src/components/)
- [Queries](src/queries/)
- [Providers](src/providers/)

---

_Last updated: 2025-08-26_
