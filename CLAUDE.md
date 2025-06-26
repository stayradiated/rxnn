# RXNN - Anonymous Voice Platform

## Project Overview

RXNN is an anonymous voice platform built with SvelteKit 5 and TypeScript. It enables users to create anonymous accounts, post content, create polls, and engage through comments and reactions while maintaining privacy through anonymity.

## Technology Stack

- **Framework**: SvelteKit 5 with TypeScript
- **Runtime**: Node.js with @sveltejs/adapter-node
- **Database**: SQLite using better-sqlite3 with WAL mode
- **Authentication**: Custom session-based auth using @oslojs/crypto
- **Styling**: CSS custom properties with automatic dark/light mode
- **Package Manager**: pnpm
- **Build Tools**: Vite
- **Code Quality**: Biome (formatter/linter) + ESLint for Svelte-specific rules
- **Deployment**: Fly.io with Docker, persistent SQLite volume
- **Validation**: Zod v4 for schema validation

## Core Features

### User System
- Anonymous accounts with generated usernames
- Token-based authentication with secure sessions
- No email/password required - privacy-first approach

### Content Types
1. **Text Posts**: Simple text-based posts
2. **Radio Polls**: Multiple choice questions with predefined options
3. **Scale Polls**: Numeric rating scales with configurable min/max values

### Social Features
- Comments on all post types
- Heart (like) system for posts and comments
- Poll participation with privacy protections
- Platform statistics tracking

### Privacy Features
- Timestamps removed from database for privacy
- Poll results only visible after user participation
- Minimum 5 responses required before showing poll aggregates
- Anonymous usernames generated automatically

## Architecture

### Database Schema
Located in `/src/lib/platform-database.ts`:

- **users**: Anonymous users with tokens and usernames
- **posts**: Text posts and polls with sort ordering
- **comments**: Comments on posts
- **poll_responses**: User poll responses (unique per user/post)
- **hearts**: Like system for posts and comments
- **session**: Authentication sessions

### Key Files Structure

```
/src/
├── routes/                    # SvelteKit pages and API routes
│   ├── +layout.svelte        # Global layout with CSS variables
│   ├── +page.svelte          # Root redirect to /feed
│   ├── feed/                 # Main feed page
│   ├── login/                # Authentication pages
│   └── post/                 # Post creation and editing
├── lib/
│   ├── auth.ts              # Authentication logic and session management
│   ├── platform-database.ts # All database operations
│   ├── schemas.ts           # Zod validation schemas
│   ├── types.ts             # TypeScript type definitions
│   └── components/          # Reusable Svelte components
├── hooks.server.ts          # Session validation middleware
└── app.html                 # HTML template with Google Fonts
```

### Database Operations

The `platform-database.ts` file contains all database operations:
- User creation and authentication
- Post CRUD operations with poll support
- Comment management
- Poll response submission and aggregation
- Heart (like) toggle functionality
- Platform statistics

### Authentication Flow
1. User visits `/login`
2. Can create new account or login with existing token
3. Username generated automatically or user can choose
4. Session token stored in HTTP-only cookie
5. Session validated in `hooks.server.ts`

## Development

### Available Scripts
```bash
pnpm dev          # Development server
pnpm build        # Production build
pnpm preview      # Preview production build
pnpm check        # Type checking
pnpm tidy         # Format and lint code
pnpm knip         # Find unused dependencies
```

### Code Style
- **Biome**: Primary formatter and linter
- **ESLint**: Additional Svelte-specific rules
- **TypeScript**: Strict mode enabled
- Consistent 2-space indentation
- Single quotes in JavaScript, double quotes in HTML attributes

### Database Setup
- SQLite database auto-created on first run
- WAL mode enabled for better concurrency
- Indexes created for performance
- Schema migrations handled automatically

## Deployment

### Fly.io Configuration
- App name: `rxnn`
- Region: Sydney (syd)
- Persistent volume mounted at `/data` for SQLite database
- Node.js 24.2.0 runtime
- Auto-scaling with stop/start machines

### Environment Variables
- `DATABASE_PATH`: Path to SQLite database file (default: `/data/platform.db`)
- `NODE_ENV`: Environment (production/development)

### Docker Build
Multi-stage build process:
1. Install pnpm and dependencies
2. Build SvelteKit application
3. Prune dev dependencies
4. Create lightweight runtime image

## Key Components

### Core Components
- `PostCard.svelte`: Main post display with poll rendering
- `PollSection.svelte`: Poll interaction and results display
- `HeartButton.svelte`: Like button for posts/comments
- `FeedHeader.svelte`: Navigation and user info
- `PlatformStats.svelte`: Statistics display

### Poll System
Two poll types supported:
1. **Radio Polls**: Multiple choice with predefined options
2. **Scale Polls**: Numeric ratings with min/max bounds

Special options available:
- "Prefer not to say"
- "Not applicable"

### Privacy Considerations
- No timestamps stored (removed via migration)
- Poll results hidden until user participates
- Minimum response threshold for showing results
- Anonymous usernames only

## Notable Design Decisions

1. **Privacy-First**: Timestamps removed, anonymous-only system
2. **Poll Privacy**: Results hidden until participation to avoid bias
3. **SQLite Choice**: Simple deployment, good performance for expected scale
4. **SvelteKit 5**: Modern reactive framework with server-side rendering
5. **Custom Auth**: Simple token-based system, no external dependencies

## Testing

Currently no test suite is implemented. Consider adding:
- Unit tests for database operations
- Integration tests for authentication
- Component tests for Svelte components
- End-to-end tests for user flows

## Contributing Guidelines

When working on this codebase:

1. **Database Changes**: Always add migrations and update type definitions
2. **New Features**: Consider privacy implications and anonymous user experience
3. **Code Style**: Run `pnpm tidy` before commits
4. **Type Safety**: Maintain strict TypeScript usage
5. **Components**: Keep components focused and reusable
6. **Performance**: Consider SQLite query optimization for new features

## Common Tasks

### Adding New Poll Type
1. Extend `PollConfig` type in `types.ts`
2. Add validation schema in `schemas.ts`
3. Update poll aggregation logic in `platform-database.ts`
4. Modify `PollSection.svelte` for UI rendering

### Database Modifications
1. Update schema in `createTables()` function
2. Add migration logic if needed
3. Update TypeScript types
4. Add/modify database operation functions
5. Test with existing data

### UI Changes
1. Maintain CSS custom property usage
2. Ensure dark/light mode compatibility
3. Follow existing component patterns
4. Test on mobile devices (responsive design)

## Security Notes

- Session tokens generated with cryptographically secure random bytes
- SQL injection prevented through prepared statements
- CSRF protection via SvelteKit's default behavior
- No sensitive data stored (privacy-first design)
- HTTPS enforced in production (Fly.io configuration)
