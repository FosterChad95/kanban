# CLAUDE.md - Kanban Task Manager

## Project Overview

A modern, full-stack **Kanban Task Manager** application built with Next.js 15, featuring real-time collaboration, role-based access control, and a polished UI. This is a comprehensive project management tool with OAuth authentication, database management via Prisma, and beautiful styling with Tailwind CSS.

## Tech Stack

### Core Framework & Language
- **Next.js 15.1.4** - Full-stack React framework with App Router
- **TypeScript 5** - Type-safe development
- **React 19.0.0** - UI library with latest features

### Authentication & Authorization
- **NextAuth.js 4.24.11** - Complete authentication solution
- **OAuth Providers**: Google, GitHub
- **Credentials Provider**: Email/password authentication
- **bcryptjs 3.0.2** - Password hashing
- **Role-based Access Control**: USER/ADMIN roles

### Database & ORM
- **Prisma 6.14.0** - Type-safe database client and schema management
- **PostgreSQL** - Primary database (configurable)
- **@prisma/client** - Auto-generated type-safe client

### Styling & UI
- **Tailwind CSS 3.4.17** - Utility-first CSS framework
- **PostCSS** - CSS processing
- **Custom Design System** - Consistent color palette and typography
- **Dark Mode Support** - Class-based theme switching
- **Plus Jakarta Sans** - Primary font family

### Real-time Features
- **Pusher 5.2.0** - Real-time WebSocket connections for collaborative features

### Form Management & Validation
- **React Hook Form 7.62.0** - Performant form library
- **@hookform/resolvers 5.2.1** - Form validation resolvers
- **Zod 4.1.3** - Type-safe schema validation

### Development Tools
- **ESLint** - Code linting with Next.js configuration
- **Storybook 8.5.2** - Component development and documentation
- **TypeScript Config** - Strict type checking enabled

### Utilities
- **clsx 2.1.1** - Conditional class name utility
- **tailwind-merge 3.2.0** - Tailwind class merging utility
- **randomcolor 0.6.2** - Color generation utility
- **framer-motion 12.23.12** - Animation library

## Architecture

### Directory Structure

```
kanban/
├── src/
│   ├── app/                    # Next.js App Router pages and API routes
│   │   ├── admin/              # Admin-only pages
│   │   ├── api/                # API routes
│   │   │   ├── auth/           # Authentication endpoints
│   │   │   ├── boards/         # Board management endpoints
│   │   │   ├── tasks/          # Task management endpoints
│   │   │   ├── teams/          # Team management endpoints
│   │   │   └── users/          # User management endpoints
│   │   ├── create-account/     # User registration pages
│   │   ├── dashboard/          # Protected dashboard pages
│   │   │   ├── [boardId]/      # Dynamic board pages
│   │   │   └── create-board/   # Board creation page
│   │   ├── signin/             # Authentication pages
│   │   ├── globals.css         # Global styles
│   │   ├── layout.tsx          # Root layout component
│   │   └── page.tsx            # Landing page
│   ├── components/             # Reusable React components
│   │   ├── admin/              # Admin-specific components
│   │   ├── content/            # Content components (Header, Footer, etc.)
│   │   └── ui/                 # Base UI components
│   ├── hooks/                  # Custom React hooks (empty)
│   ├── images/                 # Image components and assets
│   ├── lib/                    # Utility libraries
│   │   ├── auth.ts             # Authentication utilities
│   │   ├── prisma.ts           # Prisma client configuration
│   │   ├── pusher.ts           # Real-time setup
│   │   └── utils.ts            # General utilities
│   ├── providers/              # React context providers
│   ├── queries/                # Database query functions
│   ├── schemas/                # Zod validation schemas
│   ├── tests/                  # Test files (empty)
│   ├── types/                  # TypeScript type definitions
│   └── util/                   # Additional utilities
├── prisma/                     # Database schema and migrations
│   ├── migrations/             # Database migration files
│   └── schema.prisma           # Prisma schema definition
├── public/                     # Static assets
├── data/                       # Mock data and seed files
├── infra/                      # Infrastructure configuration
│   └── terraform/              # Infrastructure as code
├── .storybook/                 # Storybook configuration
├── .next/                      # Next.js build output
└── Configuration files
```

### Database Schema (Prisma)

The application uses a comprehensive relational database schema:

#### Core User Management
- **User**: User accounts with email, name, image, role (USER/ADMIN)
- **Account**: OAuth account linking for social authentication
- **Session**: User session management
- **VerificationToken**: Email verification tokens

#### Team & Board Management
- **Team**: Team entity for collaborative workspaces
- **UserTeam**: Many-to-many relationship between users and teams
- **Board**: Kanban boards with name and relationships
- **TeamBoard**: Many-to-many relationship between teams and boards
- **UserBoard**: Many-to-many relationship between users and boards

#### Kanban Board Structure
- **Column**: Board columns (e.g., "To Do", "In Progress", "Done")
- **Task**: Individual tasks with title, description, and status
- **Subtask**: Task sub-items with completion status

#### Key Relationships
- Users can belong to multiple teams and have access to multiple boards
- Boards can be shared across teams or assigned to individual users
- Tasks belong to columns and optionally to boards
- Subtasks track completion within tasks

## Authentication System

### Supported Authentication Methods
1. **OAuth Providers**:
   - Google OAuth
   - GitHub OAuth
2. **Credentials Authentication**:
   - Email/password with bcrypt hashing
   - Custom sign-up flow

### Authorization & Roles
- **USER Role**: Standard user permissions
- **ADMIN Role**: Administrative privileges
- **Protected Routes**: Middleware-based route protection
- **Session Management**: JWT-based sessions via NextAuth.js

### Key Features
- Automatic user profile creation on OAuth sign-in
- Password hashing with bcryptjs
- Role-based access control throughout the application
- Custom sign-in and sign-up pages

## Development & Build Configuration

### Scripts
- `npm run dev` - Development server with Turbopack
- `npm run build` - Production build
- `npm run start` - Production server
- `npm run lint` - ESLint code linting
- `npm run storybook` - Storybook development server
- `npm run build-storybook` - Build Storybook
- `npm run db:seed` - Seed database with sample data
- `npm run db:reset` - Reset database and run migrations

### Build Configuration
- **Next.js Config**: TypeScript support, image optimization for Unsplash and Google
- **TypeScript Config**: Strict mode, ES2017 target, path mapping with `@/` alias
- **Tailwind Config**: Custom color palette, dark mode, Plus Jakarta Sans font
- **ESLint Config**: Next.js and TypeScript best practices

### Environment Variables
```bash
# Database
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE

# Real-time Features
PUSHER_APP_ID=your-app-id
PUSHER_KEY=your-key
PUSHER_SECRET=your-secret
PUSHER_CLUSTER=your-cluster

# Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
```

## API Routes

### Authentication Endpoints
- `POST /api/auth/signup` - User registration
- `/api/auth/[...nextauth]` - NextAuth.js authentication handler

### User Management
- `GET/POST /api/users` - User operations
- `GET/PATCH/DELETE /api/users/[id]` - Individual user operations
- `GET /api/users/me/teams` - Current user's teams

### Board Management
- `GET/POST /api/boards` - Board operations
- `GET/PATCH/DELETE /api/boards/[id]` - Individual board operations

### Task Management
- `GET/POST /api/tasks` - Task operations
- `GET/PATCH/DELETE /api/tasks/[id]` - Individual task operations

### Team Management
- `POST /api/teams/add-user` - Add user to team

## Component Architecture

### UI Component Library
The project includes a comprehensive design system with:

#### Base Components (src/components/ui/)
- **Button**: Multiple variants and sizes
- **Modal**: Reusable modal dialogs
- **TextField**: Form input components
- **Checkbox**: Form checkbox components
- **Dropdown**: Select dropdown components
- **ThemeToggle**: Dark/light mode switcher

#### Content Components (src/components/content/)
- **Header/Navbar**: Navigation and branding
- **Footer**: Site footer
- **MainBoardLayout**: Kanban board layout

#### Specialized Components
- **Hero**: Landing page hero section
- **TextAndImage**: Marketing content blocks
- **Admin Components**: Administrative interface elements

### Storybook Integration
- Component documentation and testing
- Visual component development
- Interaction testing capabilities
- Chromatic integration for visual testing

## Key Features

### 🔐 Authentication & Authorization
- Multi-provider OAuth (Google, GitHub)
- Email/password authentication
- Role-based access control (USER/ADMIN)
- Protected routes with middleware
- Session management with NextAuth.js

### 📋 Kanban Board Management
- Create and manage multiple boards
- Customizable columns
- Drag-and-drop task management
- Task descriptions and subtasks
- Board sharing across teams

### 👥 Team Collaboration
- Team creation and management
- User invitation system
- Shared board access
- Role-based permissions

### 🎨 Modern UI/UX
- Responsive design (mobile, tablet, desktop)
- Dark mode support
- Consistent design system
- Smooth animations with Framer Motion
- Professional typography with Plus Jakarta Sans

### ⚡ Real-time Features
- Live collaboration with Pusher
- Real-time task updates
- Multi-user board editing

### 🛠 Developer Experience
- Type-safe development with TypeScript
- Component documentation with Storybook
- Database migrations with Prisma
- Hot reload development
- Comprehensive linting

## Database Migrations

The project includes several database migrations showing the evolution:
1. `20250822062841_add_user_role` - Added user roles
2. `20250825165131_add_user_image` - Added user profile images
3. `20250825165408_add_email_verified_to_user` - Email verification
4. `20250826135020_add_hashed_password` - Password authentication
5. `20250826202108_add_teams_and_board_relationships` - Team/board system
6. `20250826205617_add_task_board_relationship` - Task-board relationships

## File Count & Scale
- **90 TypeScript files** - Comprehensive codebase
- **Multiple API routes** - Full backend functionality
- **Component library** - Reusable UI system
- **Database migrations** - Evolving schema management

## Infrastructure
- **Terraform Configuration**: Infrastructure as code setup
- **Vercel Deployment Ready**: Optimized for serverless deployment
- **PostgreSQL Database**: Production-ready database setup
- **Environment Configuration**: Comprehensive environment management

This project represents a production-ready, scalable Kanban application with enterprise-level features including authentication, real-time collaboration, team management, and a polished user experience. The codebase follows modern development practices with type safety, component-driven architecture, and comprehensive configuration management.