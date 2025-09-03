# 🚀 Kanban Task Manager

A modern, full-stack **Kanban Task Management** application built with Next.js 15, featuring real-time collaboration, role-based access control, and enterprise-grade architecture. Perfect for teams and individuals looking for a comprehensive project management solution.

[![Next.js](https://img.shields.io/badge/Next.js-15.1.4-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6.14.0-2D3748?style=for-the-badge&logo=prisma)](https://prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.17-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)

## ✨ Features

### 🔐 **Multi-Provider Authentication**
- **OAuth Integration**: Google and GitHub authentication
- **Credential Authentication**: Email/password with secure bcrypt hashing
- **Role-Based Access Control**: USER and ADMIN roles with granular permissions
- **Session Management**: JWT-based sessions with NextAuth.js

### 📋 **Advanced Kanban Management**
- **Multi-Board Support**: Create and manage unlimited Kanban boards
- **Customizable Columns**: Flexible column structure for any workflow
- **Rich Task Management**: Tasks with descriptions, subtasks, and completion tracking
- **Drag & Drop Interface**: Intuitive task movement between columns
- **Board Sharing**: Share boards across teams or individual users

### 👥 **Team Collaboration**
- **Team Management**: Create teams and manage memberships
- **Collaborative Boards**: Real-time multi-user board editing
- **User Permissions**: Fine-grained access control for teams and boards
- **Member Invitations**: Easy user invitation and onboarding system

### ⚡ **Real-Time Features**
- **Live Collaboration**: Powered by Pusher WebSockets
- **Instant Updates**: See changes as they happen across all users
- **User Presence**: Track who's currently viewing each board
- **Secure Channels**: Channel-based authorization for data security

### 🎨 **Modern UI/UX**
- **Responsive Design**: Optimized for desktop, tablet, and mobile
- **Dark Mode Support**: Toggle between light and dark themes
- **Professional Design**: Clean, modern interface with smooth animations
- **Component Library**: Comprehensive design system with Storybook integration

### 🛠 **Developer Experience**
- **Type Safety**: Full TypeScript integration throughout the codebase
- **Component Documentation**: Interactive Storybook for UI components
- **Database Management**: Prisma ORM with type-safe queries
- **Input Validation**: Comprehensive Zod-based validation with sanitization
- **Hot Reload**: Fast development with Next.js Turbopack

## 🏗 Architecture

### **Tech Stack**

#### **Core Framework**
- **Next.js 15.1.4** - Full-stack React framework with App Router
- **TypeScript 5** - Type-safe development
- **React 19.0.0** - Latest React features and optimizations

#### **Database & ORM**
- **Prisma 6.14.0** - Type-safe database client and schema management
- **PostgreSQL** - Production-ready relational database
- **Multi-tenant Architecture** - Sophisticated team and user relationship management

#### **Authentication & Security**
- **NextAuth.js 4.24.11** - Complete authentication solution
- **bcryptjs** - Secure password hashing
- **Zod Validation** - Runtime type checking and input sanitization

#### **Real-time & Collaboration**
- **Pusher 5.2.0** - WebSocket-based real-time features
- **Channel Authorization** - Secure real-time data access

#### **Styling & UI**
- **Tailwind CSS 3.4.17** - Utility-first CSS framework
- **Framer Motion** - Smooth animations and transitions
- **Storybook 8.5.2** - Component development and documentation

#### **Development Tools**
- **ESLint** - Code linting and best practices
- **React Hook Form** - Performant form management
- **React DnD** - Drag and drop functionality

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+** - [Download here](https://nodejs.org/)
- **PostgreSQL Database** - Local installation or cloud provider
- **Pusher Account** - [Sign up here](https://pusher.com/) for real-time features
- **OAuth Apps** - Google and/or GitHub OAuth applications

### 1. Clone the Repository

```bash
git clone <repository-url>
cd kanban
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Copy the environment template and configure your variables:

```bash
cp .env.example .env.local
```

Configure the following environment variables in `.env.local`:

```bash
# PostgreSQL Database
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE

# Pusher Configuration (Real-time features)
PUSHER_APP_ID=your-app-id
PUSHER_KEY=your-key
PUSHER_SECRET=your-secret
PUSHER_CLUSTER=your-cluster
NEXT_PUBLIC_PUSHER_KEY=your-key
NEXT_PUBLIC_PUSHER_CLUSTER=your-cluster

# NextAuth.js Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret

# OAuth Providers (Optional but recommended)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
```

### 4. Database Setup

Run database migrations and seed initial data:

```bash
# Run migrations
npx prisma migrate dev

# Seed the database with sample data
npm run db:seed:complete
```

### 5. Start Development Server

```bash
npm run dev
```

The application will be available at **http://localhost:3000**

### 6. View Component Library (Optional)

Start Storybook to browse the component library:

```bash
npm run storybook
```

Storybook will be available at **http://localhost:6006**

## 📁 Project Structure

```
kanban/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── admin/              # Admin dashboard pages
│   │   ├── api/                # API routes
│   │   │   ├── auth/           # Authentication endpoints
│   │   │   ├── boards/         # Board management
│   │   │   ├── tasks/          # Task management
│   │   │   ├── teams/          # Team management
│   │   │   ├── users/          # User management
│   │   │   └── pusher/         # Real-time authentication
│   │   ├── dashboard/          # User dashboard
│   │   ├── signin/             # Authentication pages
│   │   └── create-account/     # User registration
│   ├── components/             # React components
│   │   ├── ui/                 # Base UI components
│   │   ├── content/            # Layout components
│   │   └── admin/              # Admin-specific components
│   ├── lib/                    # Utility libraries
│   │   ├── auth.ts             # Authentication utilities
│   │   ├── prisma.ts           # Database client
│   │   ├── pusher.ts           # Real-time configuration
│   │   └── sanitization.ts     # Input sanitization
│   ├── schemas/                # Validation schemas
│   │   ├── base.ts             # Core validation schemas
│   │   ├── forms.ts            # Form-specific schemas
│   │   └── api.ts              # API validation schemas
│   ├── types/                  # TypeScript type definitions
│   ├── queries/                # Database query functions
│   └── constants/              # Application constants
├── prisma/                     # Database schema and migrations
├── .storybook/                 # Storybook configuration
├── data/                       # Seed data
└── infra/                      # Infrastructure configuration
```

## 🔧 Available Scripts

### Development
```bash
npm run dev          # Start development server with Turbopack
npm run build        # Build production application
npm run start        # Start production server
npm run lint         # Run ESLint code analysis
```

### Database
```bash
npm run db:seed      # Seed database with sample data
npm run db:reset     # Reset database and run migrations
```

### Component Development
```bash
npm run storybook           # Start Storybook development server
npm run build-storybook     # Build Storybook for deployment
```

## 🔒 Security Features

### **Input Validation & Sanitization**
- **XSS Prevention**: HTML sanitization with dangerous tag removal
- **SQL Injection Protection**: Parameterized queries via Prisma
- **Input Validation**: Multi-layer Zod schema validation
- **CSRF Protection**: Built-in Next.js CSRF protection

### **Authentication Security**
- **Secure Password Hashing**: bcrypt with configurable salt rounds
- **Session Security**: HttpOnly cookies with secure flags
- **OAuth Security**: Secure OAuth provider integration
- **Role-Based Access**: Database-level role enforcement

### **API Security**
- **Authentication Middleware**: Protected API routes
- **Authorization Checks**: Resource-level access control
- **Rate Limiting**: Built-in Next.js rate limiting
- **Error Handling**: Secure error responses without information leakage

## 📊 Database Schema

The application uses a sophisticated multi-tenant database design:

### **Core Entities**
- **Users** - Authentication and profile management
- **Teams** - Organizational units for collaboration
- **Boards** - Kanban boards with flexible access control
- **Columns** - Board columns for task organization
- **Tasks** - Individual work items with rich metadata
- **Subtasks** - Task breakdown and completion tracking

### **Relationship Patterns**
- **Many-to-Many Team Membership** - Users can belong to multiple teams
- **Flexible Board Access** - Boards can be assigned to teams OR individual users
- **Hierarchical Task Structure** - Board → Column → Task → Subtask

For detailed schema documentation, see [ADVANCED_ARCHITECTURE.md](./ADVANCED_ARCHITECTURE.md)

## 🌐 API Documentation

### **RESTful Endpoints**

#### **Authentication**
- `POST /api/auth/signup` - User registration
- `GET/POST /api/auth/[...nextauth]` - NextAuth.js handlers

#### **User Management**
- `GET /api/users` - List users (admin)
- `POST /api/users` - Create user (admin)
- `GET /api/users/[id]` - Get user details
- `PATCH /api/users/[id]` - Update user
- `DELETE /api/users/[id]` - Delete user (admin)

#### **Board Management**
- `GET /api/boards` - List accessible boards
- `POST /api/boards` - Create board
- `GET /api/boards/[id]` - Get board details
- `PATCH /api/boards/[id]` - Update board
- `DELETE /api/boards/[id]` - Delete board

#### **Task Management**
- `GET /api/tasks` - List tasks
- `POST /api/tasks` - Create task
- `GET /api/tasks/[id]` - Get task details
- `PATCH /api/tasks/[id]` - Update task
- `DELETE /api/tasks/[id]` - Delete task

#### **Team Management**
- `GET /api/teams` - List teams
- `POST /api/teams` - Create team
- `POST /api/teams/add-user` - Add user to team
- `GET /api/teams/[id]` - Get team details
- `PATCH /api/teams/[id]` - Update team
- `DELETE /api/teams/[id]` - Delete team

## 🎯 User Roles & Permissions

### **USER Role**
- Create and manage personal boards
- Join teams (when invited)
- Create and manage tasks
- Access real-time collaboration features

### **ADMIN Role**
- All USER permissions
- Access admin dashboard
- Manage all users and teams
- Create and assign boards to teams
- System-wide configuration access

## 🚧 Roadmap

### **Phase 1: Core Features** ✅
- [x] Multi-provider authentication
- [x] Kanban board management
- [x] Team collaboration
- [x] Real-time features
- [x] Admin dashboard

### **Phase 2: Enhanced Features** (Planned)
- [ ] **Infrastructure Setup** - AWS/Terraform deployment configuration
- [ ] Task templates and automation
- [ ] Advanced reporting and analytics  
- [ ] File attachments and comments
- [ ] Email notifications
- [ ] Mobile application

### **Phase 3: Enterprise Features** (Future)
- [ ] Single Sign-On (SSO) integration
- [ ] Advanced workflow automation
- [ ] API webhooks and integrations
- [ ] Custom fields and metadata
- [ ] Advanced permission systems

## 📚 Documentation

- **[ADVANCED_ARCHITECTURE.md](./ADVANCED_ARCHITECTURE.md)** - Deep dive into architecture, patterns, and advanced implementation details
- **[CLAUDE.md](./CLAUDE.md)** - Project overview and development guidelines
- **Component Documentation** - Available via Storybook (`npm run storybook`)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### **Development Guidelines**
- Follow TypeScript best practices
- Maintain test coverage
- Update documentation for new features
- Follow the existing code style and patterns

## 📄 License

This project is licensed under the MIT License. See [LICENSE](./LICENSE) for details.

## 🆘 Support

- **Issues** - Report bugs or request features via GitHub Issues
- **Discussions** - Join community discussions
- **Documentation** - Comprehensive guides in `/docs` folder

---

## 🏗 Infrastructure Setup (TODO)

**Coming Soon**: Complete infrastructure setup including:

- [ ] **AWS Deployment Configuration**
  - [ ] Terraform infrastructure as code
  - [ ] ECS/Fargate containerization
  - [ ] RDS PostgreSQL setup
  - [ ] CloudFront CDN configuration
  - [ ] Application Load Balancer setup

- [ ] **CI/CD Pipeline**
  - [ ] GitHub Actions workflows
  - [ ] Automated testing and deployment
  - [ ] Database migration automation
  - [ ] Environment management

- [ ] **Monitoring & Observability**
  - [ ] Application monitoring setup
  - [ ] Log aggregation and analysis
  - [ ] Performance monitoring
  - [ ] Error tracking and alerting

- [ ] **Security Hardening**
  - [ ] WAF configuration
  - [ ] SSL/TLS certificate management
  - [ ] Secrets management
  - [ ] Security scanning integration

*This section will be expanded with detailed infrastructure guides and Terraform configurations.*

---

**Built with ❤️ using Next.js, TypeScript, and modern web technologies**