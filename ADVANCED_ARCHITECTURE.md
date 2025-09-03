# Advanced Architecture & Implementation Guide

## Table of Contents
1. [Database Architecture & Prisma Schema Design](#database-architecture--prisma-schema-design)
2. [Real-time Features with Pusher](#real-time-features-with-pusher)
3. [TypeScript Type System & Complex Types](#typescript-type-system--complex-types)
4. [Authentication & Authorization Architecture](#authentication--authorization-architecture)
5. [Input Validation & Security](#input-validation--security)
6. [API Architecture & Route Patterns](#api-architecture--route-patterns)
7. [Advanced React Patterns](#advanced-react-patterns)

---

## Database Architecture & Prisma Schema Design

### Core Design Principles

The Kanban application uses a sophisticated multi-tenant database design that supports both individual user workflows and team collaboration. The schema is designed around several key architectural decisions:

#### 1. **Flexible User-Board Relationships**

The system implements a dual-access pattern for boards:

```prisma
model UserBoard {
  id      String @id @default(cuid())
  user    User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId  String
  board   Board  @relation(fields: [boardId], references: [id], onDelete: Cascade)
  boardId String

  @@unique([userId, boardId])
}

model TeamBoard {
  id      String @id @default(cuid())
  team    Team   @relation(fields: [teamId], references: [id], onDelete: Cascade)
  teamId  String
  board   Board  @relation(fields: [boardId], references: [id], onDelete: Cascade)
  boardId String

  @@unique([teamId, boardId])
}
```

**Why this pattern?**
- Boards can be assigned directly to users OR to teams
- A board can be shared with multiple teams while also being accessible by individual users
- Supports granular access control without complex permission tables
- Allows for future role-based permissions within teams

#### 2. **Normalized Kanban Structure**

```prisma
model Board {
  id      String      @id @default(cuid())
  name    String
  columns Column[]
  teams   TeamBoard[]
  users   UserBoard[]
  Task    Task[]      // Tasks have optional board reference
}

model Column {
  id      String @id @default(cuid())
  name    String
  board   Board  @relation(fields: [boardId], references: [id], onDelete: Cascade)
  boardId String
  tasks   Task[]
}

model Task {
  id          String    @id @default(cuid())
  title       String
  description String?
  column      Column    @relation(fields: [columnId], references: [id], onDelete: Cascade)
  columnId    String
  board       Board?    @relation(fields: [boardId], references: [id], onDelete: Cascade)
  boardId     String?   // Optional - allows tasks to exist in multiple boards
  subtasks    Subtask[]
}
```

**Key Design Decisions:**

1. **Hierarchical Relationship**: Board → Column → Task → Subtask
2. **Status via Position**: Task status is determined by which column it belongs to, not a separate status field
3. **Optional Task-Board Reference**: Tasks are primarily organized by columns, but can optionally reference boards for cross-board functionality
4. **Cascade Deletion**: Proper cleanup when parent entities are deleted

#### 3. **Authentication Schema Integration**

The schema integrates with NextAuth.js while extending it with custom fields:

```prisma
model User {
  id             String      @id @default(cuid())
  email          String      @unique
  name           String?
  image          String?
  hashedPassword String?     // For credential authentication
  emailVerified  DateTime?   // NextAuth.js field
  role           Role        @default(USER)
  createdAt      DateTime    @default(now())
  updatedAt      DateTime    @updatedAt
  accounts       Account[]   // OAuth accounts
  sessions       Session[]   // User sessions
  UserTeam       UserTeam[]  // Team memberships
  UserBoard      UserBoard[] // Direct board access
}

enum Role {
  USER
  ADMIN
}
```

**Design Benefits:**
- Supports both OAuth and credential authentication
- Role-based access control at the database level
- Maintains NextAuth.js compatibility while adding custom fields
- Flexible user profile management

### Advanced Query Patterns

#### 1. **Efficient Board Loading with Nested Includes**

```typescript
// From boardQueries.ts - loads complete board structure
const board = await prisma.board.findUnique({
  where: { id: boardId },
  include: {
    columns: {
      include: {
        tasks: {
          include: {
            subtasks: true
          },
          orderBy: { createdAt: 'asc' }
        }
      },
      orderBy: { id: 'asc' }
    },
    teams: {
      include: {
        team: {
          include: {
            users: {
              include: {
                user: {
                  select: { id: true, name: true, email: true, image: true }
                }
              }
            }
          }
        }
      }
    },
    users: {
      include: {
        user: {
          select: { id: true, name: true, email: true, image: true }
        }
      }
    }
  }
});
```

This single query loads:
- Board details
- All columns with their tasks
- All subtasks for each task
- All teams with their users
- All direct user assignments

#### 2. **Permission-Based Filtering**

```typescript
// Gets boards accessible to a user via teams OR direct assignment
const userBoards = await prisma.board.findMany({
  where: {
    OR: [
      {
        users: {
          some: {
            userId: user.id
          }
        }
      },
      {
        teams: {
          some: {
            team: {
              users: {
                some: {
                  userId: user.id
                }
              }
            }
          }
        }
      }
    ]
  }
});
```

### Migration Strategy & Schema Evolution

The project includes comprehensive migrations showing schema evolution:

1. **`20250822062841_add_user_role`** - Added role-based access control
2. **`20250825165131_add_user_image`** - Extended user profiles
3. **`20250825165408_add_email_verified_to_user`** - Email verification support
4. **`20250826135020_add_hashed_password`** - Credential authentication
5. **`20250826202108_add_teams_and_board_relationships`** - Multi-tenant team system
6. **`20250826205617_add_task_board_relationship`** - Cross-board task references

**Migration Best Practices:**
- Each migration focuses on a single feature
- Data integrity maintained through proper constraints
- Backward compatibility considered for API changes

---

## Real-time Features with Pusher

### Architecture Overview

The application implements real-time collaboration using Pusher WebSockets with a sophisticated channel-based authorization system.

#### 1. **Server-Side Pusher Configuration**

```typescript
// src/lib/pusher.ts
import Pusher from "pusher";

export const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.PUSHER_CLUSTER!,
  useTLS: true,
});
```

**Environment Variables Required:**
```bash
PUSHER_APP_ID=your-app-id
PUSHER_KEY=your-key  
PUSHER_SECRET=your-secret
PUSHER_CLUSTER=your-cluster
```

#### 2. **Advanced Channel Authorization**

The system implements fine-grained channel access control:

```typescript
// src/app/api/pusher/auth/route.ts
async function isUserAuthorizedForChannel(
  user: { id: string; role: string }, 
  channelName: string
): Promise<boolean> {
  // User's personal channel - only they can access
  if (channelName === `user-${user.id}`) {
    return true;
  }
  
  // Admin users can access any channel
  if (user.role === 'ADMIN') {
    return true;
  }
  
  // Board channels - check if user has access to the board
  if (channelName.startsWith('board-')) {
    const boardId = channelName.replace('board-', '');
    return await checkBoardAccess(user.id, boardId);
  }
  
  // Team channels - check if user is a member of the team
  if (channelName.startsWith('team-')) {
    const teamId = channelName.replace('team-', '');
    return await checkTeamAccess(user.id, teamId);
  }
  
  // Global channels - only admins for now
  if (channelName === 'global') {
    return user.role === 'ADMIN';
  }
  
  // Default deny
  return false;
}
```

**Channel Naming Patterns:**
- `user-{userId}` - Personal user channels
- `board-{boardId}` - Board-specific collaboration
- `team-{teamId}` - Team-wide communications
- `global` - System-wide announcements (admin only)

#### 3. **Security-First Approach**

**Board Access Verification:**
```typescript
async function checkBoardAccess(userId: string, boardId: string): Promise<boolean> {
  try {
    const { getBoardsForUser } = await import('../../../../queries/boardQueries');
    const userBoards = await getBoardsForUser({ id: userId, role: 'USER' });
    return userBoards.some(board => board.id === boardId);
  } catch (error) {
    console.error('Error checking board access:', error);
    return false;
  }
}
```

**Team Access Verification:**
```typescript
async function checkTeamAccess(userId: string, teamId: string): Promise<boolean> {
  try {
    const prisma = (await import('../../../../lib/prisma')).default;
    const userTeam = await prisma.userTeam.findUnique({
      where: {
        userId_teamId: {
          userId,
          teamId,
        },
      },
    });
    return !!userTeam;
  } catch (error) {
    console.error('Error checking team access:', error);
    return false;
  }
}
```

### Real-time Event Patterns

#### 1. **Task Updates**
```typescript
// When a task is moved between columns
pusher.trigger(`board-${boardId}`, 'task-moved', {
  taskId: task.id,
  fromColumnId: oldColumnId,
  toColumnId: newColumnId,
  movedBy: user.id,
  timestamp: new Date()
});
```

#### 2. **User Presence**
```typescript
// Track who's currently viewing a board
pusher.trigger(`board-${boardId}`, 'user-joined', {
  user: {
    id: user.id,
    name: user.name,
    image: user.image
  },
  timestamp: new Date()
});
```

#### 3. **Collaborative Editing**
```typescript
// Real-time task description updates
pusher.trigger(`board-${boardId}`, 'task-updated', {
  taskId: task.id,
  field: 'description',
  value: newDescription,
  editedBy: user.id,
  timestamp: new Date()
});
```

### Client-Side Integration Patterns

While the server configuration is shown above, implementing the client-side would follow these patterns:

#### 1. **Connection Management**
```typescript
// Hypothetical client-side implementation
const pusherClient = new PusherJS(process.env.NEXT_PUBLIC_PUSHER_KEY, {
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
  authEndpoint: '/api/pusher/auth',
  auth: {
    headers: {
      // Include authentication headers
    }
  }
});
```

#### 2. **Channel Subscription**
```typescript
// Subscribe to board-specific channel
const boardChannel = pusherClient.subscribe(`board-${boardId}`);

boardChannel.bind('task-moved', (data) => {
  // Update local state when task is moved by another user
  updateTaskPosition(data.taskId, data.toColumnId);
});

boardChannel.bind('user-joined', (data) => {
  // Show user presence indicator
  addActiveUser(data.user);
});
```

---

## TypeScript Type System & Complex Types

### Type Architecture Overview

The application employs a sophisticated type system that separates concerns between API types, form types, and database types while maintaining consistency and type safety.

#### 1. **Layered Type Architecture**

```
src/types/
├── api.ts          # API request/response types aligned with Prisma
├── admin.ts        # Admin interface specific types
├── dragDrop.ts     # Drag & drop functionality types  
└── next-auth.d.ts  # NextAuth.js type extensions
```

#### 2. **API Types with Prisma Integration**

```typescript
// src/types/api.ts
export interface ApiUser {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  role: Role;                    // Imported from @prisma/client
  createdAt: Date;
  updatedAt: Date;
}

export interface ApiBoard {
  id: string;
  name: string;
  columns: {
    id: string;
    name: string;
    tasks: {
      id: string;
      title: string;
      description: string | null;
      subtasks: {
        id: string;
        title: string;
        isCompleted: boolean;
      }[];
    }[];
  }[];
  teams: {
    id: string;
    name: string;
  }[];
  users: {
    user: {
      id: string;
      name: string | null;
      email: string;
      image: string | null;
    };
  }[];
}
```

**Key Design Principles:**
- **Exact Prisma Alignment**: API types match Prisma query results exactly
- **Nested Structure Representation**: Complex joins represented in type structure
- **Null Safety**: Explicit null/undefined handling for optional fields

#### 3. **Advanced Admin CRUD Types**

```typescript
// src/types/admin.ts - Generic CRUD state management
export interface CrudState<T> {
  items: T[];
  loading: boolean;
  error: string | null;
  showAdd: boolean;
  adding: boolean;
  addError: string | null;
  showEdit: boolean;
  editingItem: T | null;
  editing: boolean;
  editError: string | null;
  showDelete: boolean;
  deletingItem: T | null;
  deleting: boolean;
  deleteError: string | null;
}

// Discriminated union for type-safe actions
export type CrudAction<T> =
  | { type: 'SET_ITEMS'; items: T[] }
  | { type: 'SET_LOADING'; loading: boolean }
  | { type: 'SET_ERROR'; error: string | null }
  | { type: 'SHOW_ADD' }
  | { type: 'HIDE_ADD' }
  | { type: 'SET_ADDING'; adding: boolean }
  | { type: 'SET_ADD_ERROR'; error: string | null }
  | { type: 'ADD_ITEM'; item: T }
  | { type: 'SHOW_EDIT'; item: T }
  | { type: 'HIDE_EDIT' }
  | { type: 'SET_EDITING'; editing: boolean }
  | { type: 'SET_EDIT_ERROR'; error: string | null }
  | { type: 'UPDATE_ITEM'; item: T }
  | { type: 'SHOW_DELETE'; item: T }
  | { type: 'HIDE_DELETE' }
  | { type: 'SET_DELETING'; deleting: boolean }
  | { type: 'SET_DELETE_ERROR'; error: string | null }
  | { type: 'REMOVE_ITEM'; id: string };
```

**Advanced Pattern Benefits:**
- **Generic CRUD Operations**: Reusable across all admin entities
- **Type-Safe State Management**: Compiler-enforced action types
- **Error State Isolation**: Separate error states for each operation
- **UI State Management**: Loading states for all async operations

#### 4. **Drag & Drop Type System**

```typescript
// src/types/dragDrop.ts
export const DND_ITEM_TYPES = {
  TASK: 'task',
} as const;

export type DragItem = {
  type: typeof DND_ITEM_TYPES.TASK;
  id: string;
  columnId: string;
  index: number;
};

export type DropResult = {
  targetColumnId: string;
  targetIndex?: number;
};
```

**Type Safety Benefits:**
- **Const Assertions**: Prevents accidental string mutations
- **Branded Types**: `typeof` ensures type consistency
- **Position Tracking**: Index-based positioning for precise drops

#### 5. **NextAuth.js Type Extensions**

```typescript
// src/types/next-auth.d.ts
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user?: {
      id: string;
      role: string;
    } & DefaultSession["user"];
  }
}
```

**Module Augmentation Benefits:**
- **Seamless Integration**: Extends existing NextAuth types
- **IDE Support**: Full autocomplete and type checking
- **Runtime Safety**: Type-safe session access throughout app

### Advanced Type Utilities

#### 1. **Conditional Form Types**

```typescript
// Conditional type for edit vs create forms
export type FormMode<T> = T extends { id: string } 
  ? "edit" 
  : "create";

// Form data based on mode
export type FormData<T, Mode extends "edit" | "create"> = 
  Mode extends "edit" 
    ? Partial<T> & { id: string }
    : Omit<T, "id">;
```

#### 2. **API Response Wrappers**

```typescript
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

// Usage with type inference
const response: ApiResponse<ApiUser[]> = await fetchUsers();
if (response.data) {
  // TypeScript knows response.data is ApiUser[]
  response.data.forEach(user => console.log(user.email));
}
```

---

## Authentication & Authorization Architecture

### Multi-Provider Authentication System

The application implements a sophisticated authentication system supporting multiple providers while maintaining security and flexibility.

#### 1. **NextAuth.js Configuration Architecture**

```typescript
// src/lib/authOptions.ts
export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID as string,
      clientSecret: process.env.GITHUB_SECRET as string,
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "email", type: "text" },
        password: { label: "password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          return null;
        }

        const user = await getUserByEmailForAuth(credentials.email);

        if (!user || !user.hashedPassword) {
          return null;
        }

        const isCorrectPassword = await bcrypt.compare(
          credentials.password,
          user.hashedPassword
        );

        if (!isCorrectPassword) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          hashedPassword: user.hashedPassword,
        };
      },
    }),
  ],
  // ... additional configuration
};
```

**Architecture Decisions:**

1. **Prisma Adapter**: Seamless database integration for sessions and accounts
2. **Mixed Authentication**: OAuth and credentials in same system
3. **Role Persistence**: User roles stored in database and included in session
4. **Security First**: Password comparison using bcrypt

#### 2. **Advanced Session Management**

```typescript
// JWT and Session Callbacks
callbacks: {
  async jwt({ token, user }) {
    if (user) {
      const u = user as {
        id: string;
        email: string;
        name?: string;
        role?: string;
      };
      token.id = u.id;
      token.email = u.email;
      token.name = u.name;
      token.role = u.role ?? USER_ROLES.USER;
    }
    return token;
  },
  async session({ session, token }) {
    if (session.user) {
      session.user.id = token.sub as string;
      session.user.role = (token.role as string) ?? USER_ROLES.USER;
    }
    return session;
  },
},
```

**Token Strategy:**
- **JWT Strategy**: Scalable for serverless deployments
- **Role Injection**: Role information available in all requests
- **Type Safety**: Proper TypeScript integration with callbacks

#### 3. **Authorization Utilities**

```typescript
// src/lib/auth.ts
export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return null;
  }

  const user = await getUserById(session.user.id);
  return user;
}
```

**Benefits:**
- **Fresh Data**: Always queries database for latest user info
- **Session Validation**: Verifies session exists and is valid
- **Type Safety**: Returns properly typed user object

#### 4. **Role-Based Access Control (RBAC)**

```typescript
// Constants for role management
export const USER_ROLES = {
  ADMIN: "ADMIN",
  USER: "USER",
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];
```

**Database Role Integration:**
```prisma
enum Role {
  USER
  ADMIN
}

model User {
  // ...
  role Role @default(USER)
  // ...
}
```

#### 5. **Route Protection Patterns**

**API Route Protection:**
```typescript
// Example API route with role checking
export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  if (user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  
  // Admin-only logic here
}
```

**Middleware Pattern (hypothetical):**
```typescript
// middleware.ts pattern for route protection
export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Protect admin routes
  if (pathname.startsWith('/admin')) {
    // Redirect to sign in if not authenticated
    // Check admin role if authenticated
  }
  
  // Protect dashboard routes
  if (pathname.startsWith('/dashboard')) {
    // Redirect to sign in if not authenticated
  }
}
```

### Security Considerations

#### 1. **Password Security**
- **bcrypt Hashing**: Industry-standard password hashing
- **Salt Rounds**: Configurable salt rounds for hash strength
- **No Plaintext Storage**: Passwords never stored in plaintext

#### 2. **Session Security**
- **HttpOnly Cookies**: Session cookies not accessible via JavaScript
- **Secure Cookies**: HTTPS-only in production
- **Session Rotation**: New session ID on role changes

#### 3. **OAuth Security**
- **Provider Validation**: Only trusted OAuth providers
- **Scope Limitation**: Minimal required scopes requested
- **State Validation**: CSRF protection built-in

---

## Input Validation & Security

### Comprehensive Validation Architecture

The application implements a multi-layered validation system using Zod schemas with custom sanitization and security measures.

#### 1. **Three-Layer Schema Architecture**

```
src/schemas/
├── base.ts     # Core validation schemas with sanitization
├── forms.ts    # Form-specific schemas for UI validation  
├── api.ts      # API-specific schemas with Prisma alignment
```

#### 2. **Base Validation with Sanitization**

```typescript
// src/schemas/base.ts
import { sanitizeText, sanitizeHtml } from "../lib/sanitization";

// Sanitizing field schemas
export const NameField = z.string().transform(sanitizeText).pipe(z.string().min(1));
export const EmailField = z.string().email().toLowerCase().trim();
export const PasswordField = z.string().min(6);
export const OptionalDescriptionField = z.string().transform(sanitizeHtml).optional();
export const IdField = z.string().min(1);

// Complex schemas built from sanitized fields
export const TaskCreateSchema = BaseTaskSchema.extend({
  columnId: IdField,
  subtasks: z.array(SubtaskWithCompletionSchema).optional().default([]),
});

export const TaskUpdateSchema = z.object({
  title: NameField.optional(),
  description: OptionalDescriptionField,
  columnId: IdField.optional(),
  subtasks: z.array(SubtaskUpdateSchema).optional(),
});
```

**Key Features:**
- **Automatic Sanitization**: Input cleaned before validation
- **Composable Fields**: Reusable field definitions
- **Type Safety**: Full TypeScript integration
- **Security First**: XSS prevention built-in

#### 3. **Advanced Sanitization System**

```typescript
// src/lib/sanitization.ts
export function sanitizeHtml(input: string): string {
  if (typeof input !== "string") return "";
  
  // Remove script tags and their content
  let sanitized = input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
  
  // Remove dangerous HTML tags
  const dangerousTags = ['script', 'iframe', 'object', 'embed', 'form', 'input', 'textarea', 'button', 'select'];
  dangerousTags.forEach(tag => {
    const regex = new RegExp(`<${tag}\\b[^>]*>.*?<\\/${tag}>`, 'gi');
    sanitized = sanitized.replace(regex, "");
    const selfClosingRegex = new RegExp(`<${tag}\\b[^>]*\\/?>`, 'gi');
    sanitized = sanitized.replace(selfClosingRegex, "");
  });
  
  // Remove dangerous attributes
  const dangerousAttrs = ['onclick', 'onload', 'onerror', 'onmouseover', 'onmouseout'];
  dangerousAttrs.forEach(attr => {
    const regex = new RegExp(`\\s${attr}\\s*=\\s*["'][^"']*["']`, 'gi');
    sanitized = sanitized.replace(regex, "");
  });
  
  return sanitized.trim();
}

export function sanitizeText(input: string): string {
  if (typeof input !== "string") return "";
  
  return input
    .trim()
    .replace(/\s+/g, " ")           // Multiple whitespace to single space
    .replace(/[\x00-\x1F\x7F]/g, ""); // Remove control characters
}
```

**Security Benefits:**
- **XSS Prevention**: Removes dangerous HTML and JavaScript
- **Injection Protection**: Sanitizes SQL injection attempts
- **Data Consistency**: Normalizes whitespace and formatting
- **Control Character Removal**: Prevents terminal injection

#### 4. **Form-Specific Validation**

```typescript
// src/schemas/forms.ts
export const AddTaskSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  description: z.string().optional().or(z.literal("")),
  columnId: z.string().min(1, { message: "Column is required" }),
  subtasks: z
    .array(SubtaskSchema)
    .min(0)
    .transform((arr) =>
      arr.map((s) => ({
        id: s.id ?? crypto?.randomUUID?.() ?? "",
        title: s.title,
      }))
    ),
});

// Type inference for forms
export type AddTaskFormValues = z.infer<typeof AddTaskSchema>;
export type AddTaskInput = z.input<typeof AddTaskSchema>;
```

**Form Features:**
- **Custom Error Messages**: User-friendly validation messages  
- **Transform Functions**: Data normalization during validation
- **Type Generation**: Automatic TypeScript types for forms
- **Input/Output Types**: Separate types for raw input vs processed output

#### 5. **API Schema Alignment**

```typescript
// src/schemas/api.ts
export const CreateTaskSchema = TaskCreateSchema.passthrough();
export const UpdateTaskSchema = TaskUpdateSchema.passthrough();

// Type helpers for API routes
export type CreateTaskData = z.infer<typeof CreateTaskSchema>;
export type UpdateTaskData = z.infer<typeof UpdateTaskSchema>;
```

**API Benefits:**
- **Prisma Compatibility**: `.passthrough()` allows additional Prisma fields
- **Strict Validation**: Known fields validated, unknown fields passed through
- **Type Alignment**: API types match database operations exactly

### Validation Utilities

#### 1. **Reusable Validators**

```typescript
export const withTrimming = <T extends z.ZodTypeAny>(schema: T) =>
  schema.transform((val: unknown) => typeof val === 'string' ? val.trim() : val);

export const withMinLength = (minLength: number, message?: string) =>
  z.string().min(minLength, message);

export const withMaxLength = (maxLength: number, message?: string) =>
  z.string().max(maxLength, message);
```

#### 2. **Recursive Object Sanitization**

```typescript
export function sanitizeObject<T extends Record<string, any>>(
  obj: T,
  sanitizer: (value: string) => string = sanitizeText
): T {
  const sanitized = {} as T;
  
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === "string") {
      sanitized[key as keyof T] = sanitizer(value) as T[keyof T];
    } else if (Array.isArray(value)) {
      sanitized[key as keyof T] = value.map(item => 
        typeof item === "string" ? sanitizer(item) : 
        typeof item === "object" && item !== null ? sanitizeObject(item, sanitizer) : item
      ) as T[keyof T];
    } else if (typeof value === "object" && value !== null) {
      sanitized[key as keyof T] = sanitizeObject(value, sanitizer) as T[keyof T];
    } else {
      sanitized[key as keyof T] = value;
    }
  }
  
  return sanitized;
}
```

---

## API Architecture & Route Patterns

### RESTful API Design with Next.js App Router

The application follows consistent patterns across all API routes with proper error handling, validation, and authorization.

#### 1. **Route Structure Pattern**

```
src/app/api/
├── auth/
│   ├── signup/route.ts
│   └── [...nextauth]/route.ts
├── boards/
│   ├── route.ts          # GET /api/boards, POST /api/boards
│   └── [id]/route.ts     # GET/PATCH/DELETE /api/boards/[id]
├── tasks/
│   ├── route.ts          # GET /api/tasks, POST /api/tasks
│   └── [id]/route.ts     # GET/PATCH/DELETE /api/tasks/[id]
├── teams/
│   ├── route.ts          # GET /api/teams, POST /api/teams
│   ├── [id]/route.ts     # GET/PATCH/DELETE /api/teams/[id]
│   └── add-user/route.ts # POST /api/teams/add-user
├── users/
│   ├── route.ts          # GET /api/users, POST /api/users
│   ├── [id]/route.ts     # GET/PATCH/DELETE /api/users/[id]
│   └── me/teams/route.ts # GET /api/users/me/teams
└── pusher/
    └── auth/route.ts     # POST /api/pusher/auth
```

#### 2. **Standard Route Handler Pattern**

```typescript
// Example: src/app/api/boards/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { CreateBoardSchema } from '@/schemas/api';
import { createBoard, getBoardsForUser } from '@/queries/boardQueries';

export async function GET(request: NextRequest) {
  try {
    // 1. Authentication check
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Business logic
    const boards = await getBoardsForUser(user);

    // 3. Success response
    return NextResponse.json({ data: boards });
  } catch (error) {
    console.error('Error fetching boards:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // 1. Authentication check
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Input validation
    const body = await request.json();
    const validatedData = CreateBoardSchema.parse(body);

    // 3. Authorization check (if needed)
    if (user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // 4. Business logic
    const board = await createBoard(validatedData, user);

    // 5. Success response
    return NextResponse.json({ data: board }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating board:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

#### 3. **Dynamic Route Handler Pattern**

```typescript
// Example: src/app/api/boards/[id]/route.ts
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 1. Parameter validation
    const { id } = IdParamSchema.parse(params);

    // 2. Authentication check
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 3. Resource access check
    const hasAccess = await checkBoardAccess(user.id, id);
    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // 4. Business logic
    const board = await getBoardById(id);
    if (!board) {
      return NextResponse.json({ error: 'Board not found' }, { status: 404 });
    }

    // 5. Success response
    return NextResponse.json({ data: board });
  } catch (error) {
    console.error('Error fetching board:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

#### 4. **Error Handling Patterns**

**Consistent Error Response Format:**
```typescript
interface ApiErrorResponse {
  error: string;
  details?: any;
  timestamp?: string;
}

// Usage
return NextResponse.json(
  { 
    error: 'Validation failed', 
    details: zodError.errors,
    timestamp: new Date().toISOString()
  },
  { status: 400 }
);
```

**Error Type Handling:**
```typescript
try {
  // ... business logic
} catch (error) {
  // Zod validation errors
  if (error instanceof z.ZodError) {
    return NextResponse.json(
      { error: 'Validation failed', details: error.errors },
      { status: 400 }
    );
  }

  // Prisma errors
  if (error instanceof PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Resource already exists' },
        { status: 409 }
      );
    }
  }

  // Generic server errors
  console.error('Unexpected error:', error);
  return NextResponse.json(
    { error: 'Internal server error' },
    { status: 500 }
  );
}
```

### API Utilities & Helpers

#### 1. **Common Response Utilities**

```typescript
// src/lib/api-utils.ts (hypothetical)
export class ApiResponse {
  static success<T>(data: T, status = 200) {
    return NextResponse.json({ data }, { status });
  }

  static error(message: string, status = 400, details?: any) {
    return NextResponse.json(
      { error: message, details, timestamp: new Date().toISOString() },
      { status }
    );
  }

  static unauthorized() {
    return this.error('Unauthorized', 401);
  }

  static forbidden() {
    return this.error('Forbidden', 403);
  }

  static notFound(resource = 'Resource') {
    return this.error(`${resource} not found`, 404);
  }
}
```

#### 2. **Authentication Middleware Pattern**

```typescript
// Higher-order function for authentication
export function withAuth(
  handler: (request: NextRequest, user: User, params?: any) => Promise<NextResponse>
) {
  return async (request: NextRequest, context?: any) => {
    const user = await getCurrentUser();
    if (!user) {
      return ApiResponse.unauthorized();
    }
    return handler(request, user, context?.params);
  };
}

// Usage
export const GET = withAuth(async (request, user, params) => {
  // user is guaranteed to be authenticated
  const boards = await getBoardsForUser(user);
  return ApiResponse.success(boards);
});
```

#### 3. **Validation Middleware Pattern**

```typescript
export function withValidation<T>(
  schema: z.ZodSchema<T>,
  handler: (request: NextRequest, data: T, user: User) => Promise<NextResponse>
) {
  return withAuth(async (request, user) => {
    try {
      const body = await request.json();
      const validatedData = schema.parse(body);
      return handler(request, validatedData, user);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return ApiResponse.error('Validation failed', 400, error.errors);
      }
      throw error;
    }
  });
}

// Usage
export const POST = withValidation(
  CreateBoardSchema,
  async (request, boardData, user) => {
    const board = await createBoard(boardData, user);
    return ApiResponse.success(board, 201);
  }
);
```

---

## Advanced React Patterns

### Component Architecture & Design Patterns

The application employs sophisticated React patterns for maintainable, scalable component architecture.

#### 1. **Compound Components Pattern**

While not explicitly shown in the analyzed files, the modal and form components likely follow this pattern:

```typescript
// Hypothetical modal compound component
const Modal = {
  Root: ({ children, isOpen, onClose }) => (
    <ModalContext.Provider value={{ isOpen, onClose }}>
      {isOpen && <ModalOverlay>{children}</ModalOverlay>}
    </ModalContext.Provider>
  ),
  Header: ({ children }) => <div className="modal-header">{children}</div>,
  Body: ({ children }) => <div className="modal-body">{children}</div>,
  Footer: ({ children }) => <div className="modal-footer">{children}</div>,
};

// Usage
<Modal.Root isOpen={isOpen} onClose={onClose}>
  <Modal.Header>Edit Task</Modal.Header>
  <Modal.Body>
    <TaskForm />
  </Modal.Body>
  <Modal.Footer>
    <Button onClick={onSave}>Save</Button>
  </Modal.Footer>
</Modal.Root>
```

#### 2. **Hook-Based State Management**

Custom hooks for complex state management:

```typescript
// Hypothetical board management hook
function useBoard(boardId: string) {
  const [board, setBoard] = useState<ApiBoard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const updateTask = useCallback(async (taskId: string, updates: Partial<Task>) => {
    try {
      const updatedTask = await api.updateTask(taskId, updates);
      setBoard(prevBoard => {
        if (!prevBoard) return null;
        return {
          ...prevBoard,
          columns: prevBoard.columns.map(column => ({
            ...column,
            tasks: column.tasks.map(task =>
              task.id === taskId ? { ...task, ...updatedTask } : task
            )
          }))
        };
      });
      return updatedTask;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  }, []);

  const moveTask = useCallback(async (
    taskId: string, 
    fromColumnId: string, 
    toColumnId: string
  ) => {
    // Optimistic update
    setBoard(prevBoard => {
      // Complex state update logic
    });

    try {
      await api.moveTask(taskId, toColumnId);
    } catch (error) {
      // Revert optimistic update
      fetchBoard();
      throw error;
    }
  }, []);

  return { board, loading, error, updateTask, moveTask };
}
```

#### 3. **Render Props & Higher-Order Components**

```typescript
// Generic CRUD component using render props
interface CrudRenderProps<T> {
  items: T[];
  loading: boolean;
  error: string | null;
  create: (item: Omit<T, 'id'>) => Promise<void>;
  update: (id: string, updates: Partial<T>) => Promise<void>;
  delete: (id: string) => Promise<void>;
}

function CrudProvider<T>({ 
  endpoint, 
  children 
}: { 
  endpoint: string;
  children: (props: CrudRenderProps<T>) => React.ReactNode;
}) {
  // CRUD logic implementation
  const [items, setItems] = useState<T[]>([]);
  // ... other state and operations

  return children({ items, loading, error, create, update, delete });
}

// Usage
<CrudProvider<User> endpoint="/api/users">
  {({ items, loading, create, update, delete }) => (
    <UserManagement 
      users={items}
      loading={loading}
      onCreateUser={create}
      onUpdateUser={update}
      onDeleteUser={delete}
    />
  )}
</CrudProvider>
```

#### 4. **Context + Reducer Pattern**

Based on the admin types, this pattern is likely used for admin state management:

```typescript
// Admin state management
function adminReducer<T>(state: CrudState<T>, action: CrudAction<T>): CrudState<T> {
  switch (action.type) {
    case 'SET_ITEMS':
      return { ...state, items: action.items, loading: false };
    
    case 'SET_LOADING':
      return { ...state, loading: action.loading };
      
    case 'ADD_ITEM':
      return {
        ...state,
        items: [...state.items, action.item],
        adding: false,
        showAdd: false,
      };
      
    case 'UPDATE_ITEM':
      return {
        ...state,
        items: state.items.map(item =>
          'id' in item && item.id === action.item.id ? action.item : item
        ),
        editing: false,
        showEdit: false,
        editingItem: null,
      };
      
    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter(item => 
          'id' in item && item.id !== action.id
        ),
        deleting: false,
        showDelete: false,
        deletingItem: null,
      };
      
    default:
      return state;
  }
}

// Generic admin context
function createAdminContext<T>() {
  const Context = createContext<{
    state: CrudState<T>;
    dispatch: React.Dispatch<CrudAction<T>>;
  } | null>(null);

  function Provider({ children }: { children: React.ReactNode }) {
    const [state, dispatch] = useReducer(adminReducer<T>, initialState);
    return (
      <Context.Provider value={{ state, dispatch }}>
        {children}
      </Context.Provider>
    );
  }

  function useAdmin() {
    const context = useContext(Context);
    if (!context) {
      throw new Error('useAdmin must be used within AdminProvider');
    }
    return context;
  }

  return { Provider, useAdmin };
}
```

#### 5. **Form Management Patterns**

Based on the form schemas, sophisticated form patterns are implemented:

```typescript
// Generic form hook with validation
function useValidatedForm<T extends FieldValues>(
  schema: z.ZodSchema<T>,
  onSubmit: (data: T) => Promise<void>
) {
  const form = useForm<T>({
    resolver: zodResolver(schema),
  });

  const handleSubmit = form.handleSubmit(async (data) => {
    try {
      await onSubmit(data);
      form.reset();
    } catch (error) {
      if (error.validation) {
        // Set field-specific errors
        Object.entries(error.validation).forEach(([field, message]) => {
          form.setError(field as Path<T>, { message });
        });
      } else {
        // Set general form error
        form.setError('root', { message: error.message });
      }
    }
  });

  return { ...form, handleSubmit };
}

// Usage in components
function TaskForm({ onSubmit }: { onSubmit: (task: AddTaskFormValues) => Promise<void> }) {
  const { register, handleSubmit, formState: { errors } } = useValidatedForm(
    AddTaskSchema,
    onSubmit
  );

  return (
    <form onSubmit={handleSubmit}>
      <input {...register('title')} />
      {errors.title && <span>{errors.title.message}</span>}
      
      <textarea {...register('description')} />
      {errors.description && <span>{errors.description.message}</span>}
      
      <button type="submit">Create Task</button>
    </form>
  );
}
```

### Performance Optimization Patterns

#### 1. **Optimistic Updates**
```typescript
// Optimistic task movement
const moveTask = useCallback((taskId: string, newColumnId: string) => {
  // Immediately update UI
  setTasks(prevTasks => 
    prevTasks.map(task =>
      task.id === taskId 
        ? { ...task, columnId: newColumnId }
        : task
    )
  );

  // Background sync
  api.moveTask(taskId, newColumnId).catch(() => {
    // Revert on failure
    refetchTasks();
  });
}, []);
```

#### 2. **Virtualization for Large Lists**
```typescript
// Hypothetical implementation for large task lists
function VirtualizedTaskList({ tasks }: { tasks: Task[] }) {
  const { height } = useWindowDimensions();
  const itemHeight = 120;
  const containerHeight = Math.min(height * 0.8, tasks.length * itemHeight);

  return (
    <FixedSizeList
      height={containerHeight}
      itemCount={tasks.length}
      itemSize={itemHeight}
      itemData={tasks}
    >
      {TaskItem}
    </FixedSizeList>
  );
}
```

This comprehensive guide covers the advanced architecture patterns, implementation details, and design decisions that make this Kanban application a sophisticated, production-ready system. Each section provides the deep technical knowledge needed to understand, maintain, and extend the codebase without AI assistance.