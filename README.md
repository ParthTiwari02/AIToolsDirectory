# AI Tools Directory 🤖

### Introduction

AI Tools Directory is a platform for discovering, exploring, and launching AI tools. AI founders can submit their tools to get discovered, while users can explore the best AI tools across multiple categories, upvote their favorites, and find the perfect AI solution for their needs.

### Features

- **🏠 Homepage Sections**:
  - Featured AI Tools - Highlighted tools curated by admins
  - Trending AI Tools - Sorted by upvotes
  - New AI Tools - Sorted by submission date
  - Browse by Category - Easy category navigation

- **📁 Categories**:
  - AI Writing
  - AI Image Generation  
  - AI Video Creation
  - AI Coding Assistants
  - AI Productivity Tools
  - AI Marketing Tools

- **🔍 Search**: Find AI tools by name, tagline, description, or tags

- **🚀 Submit AI Tool**: Founders can submit their tools with:
  - Tool name and tagline
  - Description
  - Website URL
  - Category and tags
  - Logo upload

- **📄 Tool Pages**: Each tool has a dedicated page with:
  - Tool details and description
  - Upvote functionality
  - Link to official website
  - Related tools from the same category

- **🗂️ Category Pages**: Browse tools by category with sorting options:
  - Newest first
  - Most upvoted

- **🔐 Authentication**: 
  - Email/password sign in
  - Google OAuth sign in
  - Required for submitting tools

- **📱 Responsive Design**: Works on all devices

- **🎯 SEO Optimized**: Dynamic meta tags for all pages

### Getting Started

1. Install dependencies:

   ```bash
   npm install --legacy-peer-deps
   ```

2. Configure Firebase:
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com)
   - Enable Authentication:
     - Go to Authentication → Sign-in method
     - Enable **Email/Password**
     - Enable **Google** (click Google → Enable → Add Project support email → Save)
   - Enable Firestore Database (Start in test mode for development)
   - Enable Storage

3. Update Firebase credentials in `firebase/config.js`:

   ```javascript
   const firebaseConfig = {
     apiKey: "your-api-key",
     authDomain: "your-project.firebaseapp.com",
     projectId: "your-project-id",
     storageBucket: "your-project.appspot.com",
     messagingSenderId: "123456789",
     appId: "your-app-id"
   }
   ```

4. Deploy Firestore indexes:

   ```bash
   firebase deploy --only firestore:indexes
   ```

   Or create them manually in Firebase Console when prompted.

5. Seed the database with sample data:
   - Start the dev server: `npm run dev`
   - Visit [http://localhost:3000/admin/seed](http://localhost:3000/admin/seed)
   - Click "Seed Database" to add 17 sample AI tools

6. Run the development server:

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

### Firestore Indexes

The following composite indexes are required (defined in `firestore.indexes.json`):

| Collection | Fields | Purpose |
|------------|--------|---------|
| ai_tools | category (ASC), created_at (DESC) | Category pages sorted by newest |
| ai_tools | category (ASC), upvotes (DESC) | Category pages sorted by popular |
| ai_tools | featured (ASC), upvotes (DESC) | Featured tools sorted by upvotes |
| ai_tools | featured (ASC), created_at (DESC) | Featured tools sorted by date |

Deploy indexes automatically:
```bash
firebase deploy --only firestore:indexes
```

Or wait for the console error link when queries fail and click to create.

### Database Schema

Each AI tool in Firestore contains:

```javascript
{
  id: string,           // Auto-generated
  name: string,         // Tool name
  tagline: string,      // Short description
  description: string,  // Full description
  website_url: string,  // Official website
  logo_url: string,     // Logo image URL
  category: string,     // Category ID
  tags: string[],       // Array of tags
  upvotes: number,      // Number of upvotes
  featured: boolean,    // Featured flag
  created_at: number,   // Timestamp
  submitter_email: string,
  hasVoted: string[],   // User IDs who voted
  slug: string          // URL-friendly slug
}
```

### Technologies Used

- **Next.js 14** - React framework with SSR
- **React 18** - UI library
- **Firebase** - Authentication, Firestore, Storage
- **Emotion** - CSS-in-JS styling
- **date-fns** - Date formatting

### Project Structure

```
pages/
  index.js          # Homepage
  submit.js         # Submit AI Tool page
  search.js         # Search results
  category/
    [slug].js       # Category pages
  tool/
    [slug].js       # Tool detail pages

components/
  AITool/           # AI Tool components
    AIToolCard.js
    AIToolSkeleton.js
    CategoryCard.js
  Layout/           # Layout components
  UI/               # UI components

utils/
  categories.js     # Category definitions

validation/
  aiToolValidation.js
```

### Routes

| Route | Description |
|-------|-------------|
| `/` | Homepage with featured, trending, and new tools |
| `/submit` | Submit a new AI tool (requires auth) |
| `/search?q=query` | Search results |
| `/category/[slug]` | Category page (e.g., `/category/ai-writing`) |
| `/tool/[slug]` | Tool detail page |
| `/signin` | Sign in page (Email + Google) |
| `/signup` | Sign up page (Email + Google) |
| `/admin/seed` | Database seeding tool (dev only) |

### Admin/Development Pages

- **`/admin/seed`** - Seed the database with sample AI tools
  - Adds 17 pre-configured AI tools across all categories
  - Featured tools: ChatGPT, Midjourney, DALL-E 3, Runway, GitHub Copilot, Cursor, Notion AI, HubSpot AI
  - Clear database option available
  - ⚠️ Remove or protect this page in production

### License

MIT
