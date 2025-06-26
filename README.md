# 🗣️ RXNN - Anonymous Voice Platform

A privacy-focused anonymous social platform where users can share thoughts, create polls, and engage with content while maintaining complete anonymity.

## Features

- **Anonymous Accounts**: Create accounts without personal information
- **Privacy-First Design**: No timestamps, usernames are generated anonymously
- **Interactive Polls**: Create radio button or scale-based polls
- **Social Engagement**: Comment on posts and show appreciation with hearts
- **Poll Privacy**: Results hidden until you participate
- **Dark/Light Mode**: Responsive design with theme switching
- **Real-time Stats**: Platform-wide statistics and engagement metrics

## Tech Stack

- **Frontend**: SvelteKit 5 + TypeScript
- **Database**: SQLite with better-sqlite3
- **Authentication**: Custom secure token-based sessions
- **Styling**: CSS with CSS variables for theming
- **Validation**: Zod schemas for type-safe data handling
- **Code Quality**: Biome + ESLint + TypeScript strict mode
- **Deployment**: Fly.io with Docker

## Quick Start

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm

### Installation

```bash
# Clone the repository
git clone https://github.com/stayradiated/rxnn.git
cd rxnn

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

Visit `http://localhost:5173` to see the application.

### Development Commands

```bash
# Development server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview

# Type checking
pnpm check

# Code formatting and linting
pnpm tidy

# Find unused dependencies
pnpm knip
```

## Project Structure

```
src/
├── routes/                    # SvelteKit pages and API routes
│   ├── +layout.svelte        # Global layout with CSS variables
│   ├── feed/                 # Main feed page
│   ├── login/                # Authentication pages
│   └── post/                 # Post creation and editing
├── lib/
│   ├── auth.ts              # Authentication logic
│   ├── platform-database.ts # Database operations
│   ├── schemas.ts           # Zod validation schemas
│   └── components/          # Reusable Svelte components
└── hooks.server.ts          # Session validation middleware
```

## Database

The application uses SQLite with a well-structured schema:

- **accounts**: Anonymous user accounts with secure tokens
- **posts**: User-generated content with privacy protections
- **comments**: Threaded discussions on posts
- **polls**: Interactive voting with radio/scale types
- **hearts**: Appreciation system for posts and comments

## Authentication

- Secure session tokens generated with cryptographically secure random bytes
- No passwords - authentication via unique account tokens
- Session validation handled server-side via SvelteKit hooks
- Privacy-first: no personal information stored

## Privacy Features

- **No Timestamps**: Content doesn't reveal when it was posted
- **Anonymous Usernames**: Generated automatically without personal info
- **Poll Privacy**: Results hidden until user participates
- **Minimal Data**: Only essential information stored
- **Secure Sessions**: Cryptographically secure token generation

## Deployment

The application is configured for deployment on Fly.io:

- Docker containerization with Node.js
- Persistent SQLite database storage
- HTTPS enforced in production
- Environment-based configuration

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes following the existing code style
4. Run `pnpm tidy` to format and lint
5. Run `pnpm check` for type checking
6. Submit a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

*Built with privacy and anonymity as core principles.*
