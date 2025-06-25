# Anonymous Voice Platform - Implementation Plan

## Overview
Transform the existing survey application into an anonymous Q&A platform where employees can post questions/polls and engage through comments and poll responses. Reuse existing survey components as poll response mechanisms.

## Key Changes from Survey App

### What We're Keeping
- ✅ SvelteKit + TypeScript setup
- ✅ better-sqlite3 database (no Prisma)
- ✅ Anonymous token system with localStorage
- ✅ Survey components (RadioGroup, ScaleInput, SliderInput, CheckboxGroup)
- ✅ Privacy-focused design patterns

### What We're Changing
- ❌ Single 16-question survey → Individual posts with poll/text content
- ❌ One-shot responses → Social platform with ongoing engagement
- ❌ Results dashboard → Live poll results per post
- ➕ Username generation (adjective + animal)
- ➕ Comments system
- ➕ Feed-based UI

## Database Schema

### New Tables (Replace Survey Schema)
```sql
-- Anonymous users with generated usernames
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  token TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_seen DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Posts (text posts and polls)
CREATE TABLE posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  post_type TEXT NOT NULL, -- 'text', 'radio', 'scale', 'slider', 'checkbox'
  poll_config JSON, -- Poll options, min/max values, etc.
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- Comments on posts
CREATE TABLE comments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  post_id INTEGER NOT NULL,
  content TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  FOREIGN KEY (post_id) REFERENCES posts (id) ON DELETE CASCADE
);

-- Poll responses
CREATE TABLE poll_responses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  post_id INTEGER NOT NULL,
  response_data JSON NOT NULL, -- Actual poll response (selected option, scale value, etc.)
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  FOREIGN KEY (post_id) REFERENCES posts (id) ON DELETE CASCADE,
  UNIQUE (user_id, post_id) -- One response per user per poll
);

-- Indexes for performance
CREATE INDEX idx_posts_created_at ON posts (created_at DESC);
CREATE INDEX idx_comments_post_id ON comments (post_id);
CREATE INDEX idx_poll_responses_post_id ON poll_responses (post_id);
```

## Post Types & Components

### Reusable Survey Components as Poll Types

1. **Text Post** 
   - No poll component, just title + content
   - Users comment on it

2. **RadioGroup Poll**
   - Question + multiple choice options
   - Users select one option
   - Results: Bar chart with percentages

3. **ScaleInput Poll** 
   - Question + 1-5 scale with labels
   - Users select rating
   - Results: Horizontal bar chart showing distribution

4. **SliderInput Poll**
   - Question + percentage slider (0-100%)
   - Use step values to create 5 discrete options (0%, 25%, 50%, 75%, 100%)
   - Results: Bar chart with 5 buckets

5. **CheckboxGroup Poll**
   - Question + multiple options (can select multiple)
   - Users check multiple boxes
   - Results: Bar chart showing selection frequency per option

### Poll Configuration JSON Examples
```javascript
// RadioGroup
{
  "type": "radio",
  "options": [
    { "id": "opt1", "label": "Option 1" },
    { "id": "opt2", "label": "Option 2" }
  ]
}

// ScaleInput
{
  "type": "scale",
  "min": 1,
  "max": 5,
  "minLabel": "Strongly Disagree",
  "maxLabel": "Strongly Agree"
}

// SliderInput
{
  "type": "slider",
  "min": 0,
  "max": 100,
  "step": 25,
  "unit": "%",
  "minLabel": "Never",
  "maxLabel": "Always"
}

// CheckboxGroup
{
  "type": "checkbox",
  "options": [
    { "id": "opt1", "label": "Option 1" },
    { "id": "opt2", "label": "Option 2" }
  ]
}
```

## Core Routes

### Main Routes
- `/` or `/feed` - Main feed showing all posts
- `/login` - Authentication page (existing token vs new user)
- `/post/new` - Create new post (unified composer)
- `/post/[id]` - Individual post view with comments

### API Routes
- `/api/posts` - CRUD operations for posts
- `/api/comments` - CRUD operations for comments  
- `/api/poll-response` - Submit/update poll responses
- `/api/user` - User profile operations

## Key Features

### Authentication & Identity
- Keep existing token system from survey app
- Add username generation (stub function for now)
- Allow username regeneration
- Login page with "new user" vs "existing token" flow

### Post Creation (Unified Composer)
- Single form with post type selection
- Dynamic form fields based on selected poll type
- Title field (required)
- Content field (optional for polls, required for text posts)
- Poll configuration builder

### Feed Display
- Chronological list of posts
- Show post type, author username, timestamp
- For polls: Show response count and preview
- For text: Show comment count
- "New" indicators based on user's last_seen timestamp

### Poll Interaction
- Reuse existing survey components for poll responses
- Show aggregated results after user responds
- Keep "prefer not to answer" options
- Update results in real-time (SvelteKit invalidation)

### Comments System
- Linear comments under each post
- Simple text input + submit
- Show commenter username and timestamp
- No threading/replies (keep simple)

### Results Visualization
- Simple bar charts using CSS + percentages
- RadioGroup: Horizontal bars with percentages
- ScaleInput: Distribution chart across 1-5
- SliderInput: 5-bucket distribution (0%, 25%, 50%, 75%, 100%)
- CheckboxGroup: Multiple bars for each option

## Implementation Phases

### Phase 1: Core Infrastructure
1. **Database Migration**
   - Create new schema functions
   - Username generator stub
   - User management functions

2. **Authentication**
   - Login page with token input/generation
   - Adapt existing token storage
   - Username assignment on first login

3. **Basic Posts**
   - Post creation API
   - Text post creation and display
   - Simple feed view

### Phase 2: Poll System
1. **Poll Components**
   - Adapt survey components for individual use
   - Poll response submission
   - Results calculation and display

2. **Unified Composer**
   - Post type selection
   - Dynamic form based on poll type
   - Poll configuration builder

### Phase 3: Engagement Features
1. **Comments System**
   - Comment creation/display
   - Linear comment threads

2. **Polish & UX**
   - Real-time updates
   - New post highlighting
   - Mobile responsiveness

## Technical Notes

### Database Functions to Create
```typescript
// User management
createUser(token: string): User
findUserByToken(token: string): User | null
generateUsername(): string
updateUsername(userId: number, username: string): void
updateLastSeen(userId: number): void

// Post management
createPost(userId: number, title: string, content: string, postType: string, pollConfig?: object): Post
getPostsForFeed(userId: number): Post[]
getPostById(id: number): Post
getPostWithResponses(id: number): PostWithAggregatedResults

// Comments
createComment(userId: number, postId: number, content: string): Comment
getCommentsForPost(postId: number): Comment[]

// Poll responses
submitPollResponse(userId: number, postId: number, responseData: object): void
getPollResults(postId: number): AggregatedResults
```

### Component Adaptations
- Remove form submission logic from survey components
- Add result display modes
- Keep existing styling and validation
- Add poll-specific props (show results, user's response, etc.)

### Real-time Strategy
- Use SvelteKit's built-in invalidation
- Update poll results after user responds
- Refresh feed periodically
- Optimistic UI updates where appropriate

## Migration Strategy

### Keep Existing During Development
- Current survey routes stay functional
- Develop new platform alongside
- Switch over when complete

### Fresh Start Approach
- New database schema (drop existing tables)
- New route structure
- Reuse components and utilities
- Fresh user base (no data migration needed)

## Future Considerations

### Not in MVP
- Emoji reactions (mentioned in original brief but not in final requirements)
- Vote/like system (removed from requirements)
- Real-time notifications
- Advanced sorting (most discussed, etc.)
- Content moderation tools

### Potential Enhancements
- Search functionality
- Post categories/tags
- User profiles
- Export capabilities
- Analytics dashboard

## Success Criteria

### Phase 1 Complete
- Users can create accounts with usernames
- Users can create and view text posts
- Basic commenting works
- Feed displays posts chronologically

### Phase 2 Complete  
- All poll types work (radio, scale, slider, checkbox)
- Poll results display correctly
- Users can respond to polls and see aggregated results
- Unified composer supports all post types

### Phase 3 Complete
- Smooth user experience
- Real-time updates
- Mobile-friendly interface
- "New" post detection working
- Polish and performance optimized

This platform essentially becomes a "survey tool meets social platform" where each survey component becomes a way to ask questions to the community, with the social layer of comments and usernames added on top.