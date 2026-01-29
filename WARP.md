# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

**MOA Academy** - A Progressive Web Application (PWA) built with Qwik framework for language learning and education. The application features AI-powered chat interactions via LangChain, placement testing, course management, and a full authentication system backed by Turso database.

## Tech Stack

- **Framework**: Qwik with Qwik City (file-based routing)
- **Package Manager**: yarn (required - do not use npm or pnpm)
- **Styling**: Tailwind CSS 4.0
- **UI Components**: @qwik-ui/headless (all UI must use these headless components)
- **Database**: Turso (libSQL/SQLite compatible) via @libsql/client
- **AI/Chat**: LangChain (@langchain/core, @langchain/openai)
- **Server**: Express (Node.js adapter for production)
- **PWA**: @qwikdev/pwa
- **Icons**: @qwikest/icons (Lucide icons)

## Essential Commands

### Development
```bash
yarn dev              # Start development server with SSR (port 5173)
yarn dev.custom       # Development with custom configuration
yarn dev.debug        # Development with Node.js debugging
```

### Building
```bash
yarn build            # Full production build (client + server)
yarn build.client     # Build client-side only
yarn build.server     # Build Express server adapter
yarn build.preview    # Build preview server
```

### Testing & Quality
```bash
# IMPORTANT: Always run these before running any tests
yarn build            # Compile the project
npx tsc               # Type check with TypeScript

yarn fmt              # Format code with Prettier
yarn fmt.check        # Check formatting without changes
```

### Production
```bash
yarn serve            # Run Express production server (port 8080)
yarn preview          # Preview production build locally
yarn deploy           # Deploy to Cloudflare Pages (wrangler)
```

## Project Structure

### Routes (`src/routes/`)
File-based routing following Qwik City conventions:
- `index.tsx` - Route pages
- `layout.tsx` - Nested layouts (applies to all child routes)
- `plugin@*.ts` - Middleware plugins (e.g., `plugin@db.ts`)
- `/auth/` - Authentication routes (login, logout, reset-password)
- `/dashboard/` - Admin dashboard (protected)
- `/chat/` - AI chat interface (authenticated)
- `/placement-test/` - Language placement test
- `/courses/` - Course catalog

### Core Utilities (`src/utils/`)

#### Database (`turso.ts`)
- `tursoClient(requestEvent)` - Create Turso client connection
- `executeQuery(requestEvent, sql, params)` - Execute parameterized queries
- `testDatabaseConnection(requestEvent)` - Health check

#### Database Initialization (`init-db.ts`)
- `initAuthDatabase(requestEvent)` - Initialize all database tables
- `checkDatabaseConnection(requestEvent)` - Verify connection
- `createTestUser(requestEvent)` - Create test user for development

**Database Schema**:
- `users` - User accounts with type (admin/coordinator/normal)
- `chat_history` - AI chat messages
- `text_chat_messages` - Text-only chat history
- `placement_test_attempts` - Test submissions and scores

#### Authentication (`auth.ts`)
- `hashPassword(password)` - PBKDF2 password hashing
- `verifyPassword(password, hash)` - Password verification
- `setCookies(requestEvent, userId, userType)` - Set auth cookies
- `clearAuthCookies(requestEvent)` - Clear session
- `getUserId(requestEvent)` - Get current user ID
- `getUserType(requestEvent)` - Get user role
- `isAdmin(requestEvent)` - Check admin status
- `verifyAuth(requestEvent)` - Verify authentication

**Cookie-based Authentication**:
- `auth_token` - User ID (HTTP-only, 24h)
- `user_type` - User role (HTTP-only, 24h)
- `session_active` - Client-readable session indicator

### Components (`src/components/`)

#### UI Components (`src/components/ui/`)
All UI components use `@qwik-ui/headless`:
- Accordion, Alert, Avatar, Badge, Breadcrumb
- Button, Card, Carousel, Checkbox, Collapsible
- Combobox, Dropdown, Input, Label, Modal
- Popover, Progress, Radio Group, Select, Separator
- Skeleton, Tabs, Textarea, Toggle, Toggle Group

#### Feature Components
- `ChatInput.tsx` - AI chat input interface
- `ChatMessage.tsx` - Chat message display
- `router-head/router-head.tsx` - SEO and meta tags

## Qwik Architecture Patterns

### Server-Side Data Loading

Always use `routeLoader$` for data fetching:

```typescript
export const useMyData = routeLoader$(async (requestEvent) => {
  const client = tursoClient(requestEvent);
  const result = await client.execute({
    sql: 'SELECT * FROM users WHERE id = ?',
    args: [requestEvent.params.id]
  });
  return result.rows;
});
```

### Server-Side Mutations

Use `routeAction$` for form submissions and data mutations:

```typescript
export const useUpdateUser = routeAction$(async (formData, requestEvent) => {
  const client = tursoClient(requestEvent);
  await client.execute({
    sql: 'UPDATE users SET name = ? WHERE id = ?',
    args: [formData.name, formData.id]
  });
  return { success: true };
});
```

### Server Functions

Use `server$()` for RPC calls:

```typescript
import { server$ } from '@builder.io/qwik-city';

export const fetchUserData = server$(async function(userId: string) {
  // 'this' is the RequestEvent
  const client = tursoClient(this);
  const result = await this.env.get('PRIVATE_API_KEY');
  return result;
});
```

### Event Handlers

Always wrap handlers in `$()`:

```typescript
<button onClick$={$(async () => {
  // Handler code here
  await someAction();
})}>Click Me</button>
```

## Environment Variables

### Server-Only (Private)
Access via `requestEvent.env.get()` in `routeLoader$`, `routeAction$`, or `this.env.get()` in `server$`:

- `PRIVATE_TURSO_DATABASE_URL` - Turso database URL
- `PRIVATE_TURSO_AUTH_TOKEN` - Turso authentication token
- `PRIVATE_OPENAI_API_KEY` - OpenAI API key (for LangChain)
- `PRIVATE_RESEND_API_KEY` - Email service API key

### Client + Server (Public)
Access via `import.meta.env.PUBLIC_*`:

- `PUBLIC_*` - Any public configuration

**IMPORTANT**: Never put sensitive data in `PUBLIC_*` variables as they are exposed to the client.

## Database Operations

### Running Migrations

Database initialization is done programmatically via `initAuthDatabase()` from `src/utils/init-db.ts`. Call this in a `routeLoader$` or `server$` function where appropriate:

```typescript
export const onGet: RequestHandler = async (requestEvent) => {
  const result = await initAuthDatabase(requestEvent);
  if (!result.success) {
    throw new Error(result.message);
  }
};
```

### Querying Data

Always use parameterized queries to prevent SQL injection:

```typescript
const client = tursoClient(requestEvent);
const result = await client.execute({
  sql: 'SELECT * FROM users WHERE email = ? AND type = ?',
  args: ['user@example.com', 'admin']
});
```

### Connection Management

The Turso client is created per-request. For production with Express, consider implementing a connection pooling pattern via a plugin.

## Layout & Authentication Flow

### Root Layout (`src/routes/layout.tsx`)

The main layout:
- Handles authentication state via `useLayoutAuthLoader`
- Renders navigation with conditional links based on auth status
- Shows/hides dashboard link based on `canAccessDashboard` (admin check)
- Auth routes (`/auth/*`) bypass the main layout

### Auth Layout (`src/routes/auth/layout.tsx`)

Separate layout for authentication pages (login, signup, etc.)

### Protected Routes

Use a `routeLoader$` to verify authentication:

```typescript
export const onGet: RequestHandler = async (requestEvent) => {
  const isAuth = await verifyAuth(requestEvent);
  if (!isAuth) {
    throw requestEvent.redirect(302, '/auth');
  }
};
```

## PWA Configuration

PWA features are enabled via `@qwikdev/pwa` plugin in `vite.config.ts`:
- Service worker registration in `src/root.tsx`
- Manifest file at `/public/manifest.json`
- Asset generation via `@vite-pwa/assets-generator`

## Styling Guidelines

### Tailwind CSS

Use utility classes directly in JSX:

```typescript
<div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
  <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
    Title
  </h1>
</div>
```

### Dark Mode

Dark mode uses `class` strategy (Tailwind `darkMode: 'class'`):
- Toggle via `document.documentElement.classList` add/remove 'dark'
- Use `dark:` prefix for dark mode styles

### Custom Styles

For component-specific styles, use inline `<style>` tags in components or `useStyles$()` hook (scoped styles).

## Key Development Notes

### Qwik-Specific Rules

1. **Resumability**: Code must be serializable. Avoid non-serializable data in stores/signals (functions, Map, Set, Date without transformation)
2. **QRLs**: Functions passed to event handlers or as props must be wrapped in `$()`
3. **State Management**:
   - `useSignal()` for simple reactive values
   - `useStore()` for reactive objects
4. **Side Effects**:
   - `useTask$()` for server and/or client-side effects
   - `useVisibleTask$()` for client-only effects after component is visible
5. **NO** direct DOM manipulation outside of `useVisibleTask$()`

### Testing Prerequisites

**Before running any tests**, always:

```bash
yarn build
npx tsc
```

This ensures:
- Project compiles correctly
- No TypeScript errors
- All types are validated

### Common Pitfalls

1. **Don't** use `process.env` - use `import.meta.env` or `requestEvent.env.get()`
2. **Don't** forget to wrap event handlers in `$()`
3. **Don't** use `PUBLIC_*` env vars for sensitive data
4. **Don't** perform database operations on the client
5. **Don't** use UI libraries other than `@qwik-ui/headless`

## Express Server Deployment

### Building for Production

```bash
yarn build.client  # Build client assets
yarn build.server  # Build Express server
```

Output:
- `dist/` - Static assets and server build
- `server/entry.express.js` - Express server entry point

### Running Production Server

```bash
yarn serve
# Server starts at http://localhost:8080
```

The Express server (`src/entry.express.tsx`):
- Serves static assets from `dist/build/` with 1-year cache
- Handles Qwik City SSR via middleware
- Supports dynamic PORT via environment variable
- Loads environment variables via `dotenv`

## Important Constants

### Dashboard Access (`src/constants/dashboard.ts`)

Check `isDashboardAdmin(email)` for dashboard access control.

## AI Chat Integration

The chat feature uses LangChain with OpenAI:
- Conversations are stored in `chat_history` table
- Messages have roles: 'user' | 'assistant'
- Context is maintained per user session

## Additional Resources

- [Qwik Documentation](https://qwik.builder.io/)
- [Qwik City Routing](https://qwik.builder.io/qwikcity/routing/overview/)
- [Turso Documentation](https://docs.turso.tech/)
- [@qwik-ui/headless Docs](https://qwikui.com/)
