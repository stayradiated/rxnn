# Anonymous Employee Survey

A privacy-focused survey application built with SvelteKit and SQLite for conducting anonymous employee feedback with real-time aggregated results.

## Overview

This application enables organizations to conduct sensitive employee surveys while maintaining complete anonymity. Key features include:

- **Anonymous token-based system** - No personal data collection
- **One-shot survey approach** - Single response per person with update capability
- **Privacy protection** - Results only shown with minimum response thresholds
- **Real-time dashboard** - Live aggregated results without individual data exposure
- **Universal "Prefer not to answer"** - Every question includes privacy option

## Architecture

### Tech Stack

- **Frontend**: SvelteKit 2.x with TypeScript
- **Database**: SQLite with better-sqlite3
- **Styling**: Vanilla CSS with responsive design
- **Deployment**: Fly.io compatible (Node.js adapter)

### Project Structure

```
src/
├── lib/
│   ├── components/          # Reusable survey components
│   │   ├── RadioGroup.svelte      # Multiple choice questions
│   │   ├── ScaleInput.svelte      # Likert scale (1-5) ratings
│   │   ├── SliderInput.svelte     # Percentage sliders
│   │   ├── TextInput.svelte       # Open text responses
│   │   ├── CheckboxGroup.svelte   # Multiple selection
│   │   └── SectionNavigation.svelte # Survey section jumping
│   ├── database.ts          # SQLite operations & schema
│   └── token-storage.ts     # localStorage token management
├── routes/
│   ├── +page.svelte         # Landing page with start/edit options
│   ├── survey/
│   │   ├── +page.server.ts  # Token validation & response loading
│   │   └── +page.svelte     # Main survey with 9 steps
│   ├── results/
│   │   ├── +page.server.ts  # Aggregated data fetching
│   │   └── +page.svelte     # Public results dashboard
│   └── api/responses/
│       └── +server.ts       # REST API for saving responses
└── app.d.ts                 # TypeScript declarations
```

## Key Concepts

### Anonymous Token System

- **64-character hex tokens** generated server-side via `crypto.randomBytes(32)`
- **URL-based persistence**: `/survey?token=<token>` for bookmarking
- **localStorage backup**: Saved locally for convenience (not required)
- **One-shot enforcement**: Cannot create multiple responses per device

### Privacy Protection

- **Minimum threshold**: Results only visible with 5+ total responses
- **Demographic filtering**: Combinations with <3 responses are hidden
- **"Prefer not to answer"**: Every question includes privacy option
- **No individual data**: Only aggregated results ever displayed

### Database Schema

```sql
-- Anonymous user tokens
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  token TEXT UNIQUE NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Survey responses (JSON-encoded answers)
CREATE TABLE responses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  question_id TEXT NOT NULL,
  answer TEXT NOT NULL,  -- JSON string
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  UNIQUE (user_id, question_id)  -- Upsert support
);
```

## Component System

### Survey Components

All components support TypeScript and include "prefer not to answer" options:

#### RadioGroup
```svelte
<RadioGroup
  label="Question text"
  name="unique_field_name"
  bind:value={responses.fieldName}
  options={[
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' }
  ]}
  allowPreferNotToAnswer={true}  // default: true
/>
```

#### ScaleInput
```svelte
<ScaleInput
  label="Rate from 1-5"
  name="unique_field_name"
  bind:value={responses.fieldName}
  min={1}
  max={5}
  minLabel="1 = Low"
  maxLabel="5 = High"
/>
```

#### SliderInput
```svelte
<SliderInput
  label="Percentage question"
  bind:value={responses.fieldName}
  min={0}
  max={100}
  unit="%"
  minLabel="0% - Never"
  maxLabel="100% - Always"
/>
```

#### TextInput
```svelte
<TextInput
  label="Open feedback"
  bind:value={responses.fieldName}
  placeholder="Share your thoughts..."
  rows={4}
  maxLength={500}
/>
```

### Privacy Response Values

All "prefer not to answer" selections save as: `"prefer-not-to-answer"`

This consistent value enables:
- Easy filtering in aggregation queries
- Response pattern analysis
- Privacy compliance tracking

## Development

### Setup

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Type checking
pnpm check

# Code formatting
pnpm tidy
```

### Database

SQLite database is automatically created on first run:
- **Development**: `survey.db` in project root
- **Production**: Uses `DATABASE_PATH` environment variable

#### Key Functions

```typescript
// User management
findOrCreateUser(token: string)
getUserResponses(userId: number)

// Response handling
saveResponse(userId: number, questionId: string, answer: any)
saveMultipleResponses(userId: number, responses: Record<string, any>)

// Public data
getAggregatedResults()  // Privacy-filtered aggregated data
```

### Adding New Questions

1. **Add to survey component** (`src/routes/survey/+page.svelte`)
2. **Choose appropriate component** (RadioGroup, ScaleInput, etc.)
3. **Bind to responses object**: `bind:value={responses.newFieldName}`
4. **Auto-save included**: Responses save on step navigation

### Privacy Guidelines

- **Never log tokens** beyond first 8 characters
- **No IP tracking** or session storage
- **Aggregate only**: Individual responses never exposed
- **Minimum thresholds**: Always check response counts before displaying data
- **Demographic protection**: Filter combinations with <3 responses

## Survey Structure

The survey consists of 9 steps:

1. **Introduction** - Welcome & token explanation
2. **Role Context** - Department & tenure (2 questions)
3. **Four-Day Week Usage** - Current usage & preferences (2 questions)
4. **Importance & Impact** - Priority & job considerations (2 questions)
5. **Redundancy** - Voluntary redundancy & finances (2 questions)
6. **Pay/Hours Trade-offs** - Salary & time reductions (4 questions)
7. **Well-Being & Trust** - Stress & leadership confidence (2 questions)
8. **Open Feedback** - Missing questions & comments (2 questions)
9. **Complete** - Final save & navigation options

Total: **16 substantive questions** with universal privacy options

## Deployment

### Environment Variables

```bash
# Database location (optional)
DATABASE_PATH=/data/survey.db

# Node environment
NODE_ENV=production
```

### Fly.io Deployment

The app includes Fly.io configuration with:
- Node.js adapter for SvelteKit
- SQLite on persistent volume
- Health check endpoint

### Build Process

```bash
# Production build
pnpm build

# Preview production build
pnpm preview
```

## Security Considerations

- **No authentication required** - Intentionally anonymous
- **Rate limiting recommended** - Prevent token generation abuse
- **HTTPS required** - Protect tokens in transit
- **Database backups** - Regular SQLite file backups
- **Token expiration** - Consider implementing time-based expiry

## Contributing

- **TypeScript required** - All new code must be typed
- **Component patterns** - Follow existing component structure
- **Privacy first** - Always consider anonymity implications
- **Test locally** - Verify complete survey flow
- **Format code** - Run `pnpm tidy` before commits

## License

[Add your license here]