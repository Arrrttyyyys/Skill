# Skillera - Swipe-Based Skill Sharing Platform

A full-stack skill-sharing platform where people connect by swiping on profiles based on skills they offer and want to learn. Built with a modern Gen Z aesthetic featuring dark themes, neon accents, and vibrant colors.

## Tech Stack

- **Frontend**: React Native + React Native Web (Expo)
- **Backend**: Node.js + Express
- **Database**: SQLite + Prisma ORM (easy local setup)
- **Auth**: JWT tokens
- **UI**: Dark theme with neon green, hot pink, and electric blue accents

## Prerequisites

Before you begin, make sure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn**
- **Git** - [Download](https://git-scm.com/)

> **Note**: For mobile development (iOS/Android), you'll also need Expo CLI and Xcode/Android Studio, but these are optional for web development.

## Quick Start Guide

### Step 1: Clone the Repository

```bash
git clone <your-repo-url>
cd Skillera
```

### Step 2: Set Up the Backend

1. **Navigate to the backend directory:**
```bash
cd backend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Set up the database:**
   The project uses SQLite for easy local development. The database file (`dev.db`) will be created automatically.

```bash
# Generate Prisma Client
npx prisma generate

# Run database migrations
npx prisma migrate dev
```

4. **Seed the database with demo data:**
   This creates demo accounts, skills, matches, and sample data:
```bash
npm run seed
```

   You should see output like:
   ```
   ✅ Seed completed successfully!
   
   Demo accounts:
     emma@skillera.com / demo
     liam@skillera.com / demo
     sarah@skillera.com / demo
     jake@skillera.com / demo
   
   Additional profiles for swipe deck:
     12 additional users created
   ```

5. **Start the backend server:**
```bash
npm run dev
```

   The backend API will start on **`http://localhost:3001`**
   
   You should see:
   ```
   🚀 Server running on http://localhost:3001
   ✅ Connected to database
   ```

### Step 3: Set Up the Frontend

1. **Open a new terminal window** and navigate to the frontend directory:
```bash
cd frontend
```

2. **Install dependencies:**
```bash
npm install
```

   > **Note**: If you encounter peer dependency warnings, you can use `npm install --legacy-peer-deps`

3. **Start the frontend:**
```bash
# For web development
npm run web
```

   This will:
   - Start the Expo development server
   - Open Metro bundler
   - Compile the web app with Webpack
   - Show you a URL (typically `http://localhost:19006`)

4. **Open in your browser:**
   - The app should automatically open in your default browser
   - Or manually navigate to the URL shown in the terminal (usually `http://localhost:19006`)
   - Look for clickable links in your terminal - Expo displays URLs you can Command+Click (Mac) or Ctrl+Click (Windows/Linux)

### Step 4: Start Using the App

1. **On the landing page**, you'll see options to:
   - Sign Up (create a new account)
   - Log In (use existing account)
   - Explore Demo (quick access to demo accounts)

2. **Try a demo account:**
   - Click "Explore Demo" or "Log In"
   - Use any of the demo accounts:
     - `emma@skillera.com` / `demo`
     - `liam@skillera.com` / `demo`
     - `sarah@skillera.com` / `demo`
     - `jake@skillera.com` / `demo`

3. **Start swiping:**
   - After logging in, you'll be taken to the swipe screen
   - Drag cards left (❌ Pass) or right (❤️ Like) with your mouse/trackpad
   - Or use the buttons at the bottom
   - Swipe right on someone to create a match!

## Running Both Servers

You need **two terminal windows** running simultaneously:

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run web
```

## Troubleshooting

### Backend Issues

**Database errors:**
```bash
# Reset the database (WARNING: deletes all data)
cd backend
rm prisma/dev.db
npx prisma migrate dev
npm run seed
```

**Port 3001 already in use:**
- Kill the process: `lsof -ti:3001 | xargs kill -9`
- Or change the port in `backend/src/server.js`

### Frontend Issues

**Dependencies won't install:**
```bash
# Try with legacy peer deps
npm install --legacy-peer-deps

# Or clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Port 19006 already in use:**
- The Expo CLI will automatically try another port
- Look for the new URL in your terminal

**Blank screen in browser:**
- Check the browser console (F12) for errors
- Make sure the backend is running on port 3001
- Try clearing browser cache and refreshing

**Webpack compilation errors:**
- Delete `frontend/node_modules` and reinstall
- Make sure you have `@expo/webpack-config` installed: `npm install @expo/webpack-config@^19.0.1`

### General Issues

**"Cannot find module" errors:**
- Make sure you've run `npm install` in both `backend/` and `frontend/` directories
- Try deleting `node_modules` and reinstalling

**CORS errors:**
- Make sure the backend is running on port 3001
- Check that `frontend/src/config/api.js` points to `http://localhost:3001`

## Development Tips

- **View terminal output**: Keep both terminal windows visible to see compilation status and any errors
- **Hot reloading**: Both frontend and backend support hot reloading - changes will automatically refresh
- **Browser DevTools**: Use F12 to open browser console for debugging
- **Network tab**: Check the Network tab in DevTools to see API calls and responses

## Mobile Development (Optional)

If you want to run on iOS or Android:

```bash
# For iOS (requires macOS and Xcode)
npm run ios

# For Android (requires Android Studio)
npm run android

# Or start Expo and scan QR code with Expo Go app
npm start
```

## Demo Accounts

The seed script creates 4 demo accounts with pre-configured skills, matches, and messages:

- **Emma** - `emma@skillera.com` / `demo`
  - Offers: UI/UX Design, Watercolor Painting
  - Wants to learn: JavaScript, Public Speaking

- **Liam** - `liam@skillera.com` / `demo`
  - Offers: JavaScript, React
  - Wants to learn: Guitar, Cooking

- **Sarah** - `sarah@skillera.com` / `demo`
  - Offers: Yoga, Mindfulness Coaching
  - Wants to learn: Video Editing, Graphic Design

- **Jake** - `jake@skillera.com` / `demo`
  - Offers: Guitar, Music Production
  - Wants to learn: Python, Data Analysis

Plus 12 additional profiles for the swipe deck!

## Key Features

1. **Landing & Onboarding** 
   - Modern dark-themed landing page
   - User-friendly signup/login flow
   - Skill setup wizard

2. **Swipe-Based Matching** 
   - Tinder-like swipe interface
   - Drag cards left (pass) or right (like)
   - Visual feedback with heart/pass overlays
   - Compatibility scoring based on skill overlap

3. **Buddies Management** 
   - View all your matches
   - See compatibility details
   - Access buddy profiles

4. **Skill Exchange Sessions** 
   - Plan upcoming sessions
   - Track past sessions
   - Set goals and schedule meetings

5. **Messaging** 
   - Real-time chat with matches
   - Conversation history
   - Thread-based messaging

6. **Feedback & Reflection** 
   - Rate sessions (1-5 stars)
   - Provide written feedback
   - Track improvement over time

7. **Profile Management**
   - Edit your profile
   - Update skills (what you teach/learn)
   - View statistics and ratings

## Project Structure

```
Skillera/
├── backend/
│   ├── src/
│   │   ├── routes/       # API route handlers
│   │   ├── middleware/   # Auth middleware
│   │   └── seed.js       # Database seed script
│   ├── prisma/
│   │   └── schema.prisma # Database schema
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── screens/      # Screen components
│   │   ├── navigation/   # Navigation setup
│   │   ├── context/      # React context (Auth)
│   │   ├── config/       # API configuration
│   │   └── theme/        # Theme colors
│   └── package.json
└── README.md
```

## API Endpoints

The backend API is available at `http://localhost:3001/api`:

- **Auth**: `POST /api/auth/login`, `POST /api/auth/signup`
- **Users**: `GET /api/users/:id`, `PUT /api/users/:id`
- **Matches**: `GET /api/matches`, `POST /api/matches`, `GET /api/matches/deck`
- **Sessions**: `GET /api/sessions`, `POST /api/sessions`
- **Messages**: `GET /api/messages`, `POST /api/messages`
- **Feedback**: `POST /api/feedback`

## Project Structure

```
Skillera/
├── backend/
│   ├── src/
│   │   ├── routes/          # API route handlers
│   │   │   ├── auth.js      # Authentication routes
│   │   │   ├── users.js     # User profile routes
│   │   │   ├── matches.js   # Match/swipe routes
│   │   │   ├── sessions.js  # Session management
│   │   │   ├── messages.js  # Messaging routes
│   │   │   └── feedback.js  # Feedback routes
│   │   ├── middleware/
│   │   │   └── auth.js      # JWT authentication middleware
│   │   ├── seed.js          # Database seed script
│   │   └── server.js        # Express server setup
│   ├── prisma/
│   │   ├── schema.prisma    # Database schema
│   │   ├── dev.db           # SQLite database file
│   │   └── migrations/      # Database migrations
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── screens/         # Screen components
│   │   │   ├── auth/        # Landing, Login, Signup
│   │   │   ├── onboarding/  # Skill setup, Profile setup
│   │   │   └── main/        # Swipe, Buddies, Sessions, Messages, Profile
│   │   ├── navigation/      # React Navigation setup
│   │   ├── context/         # React Context (AuthContext)
│   │   ├── config/          # API configuration
│   │   ├── theme/           # Color theme (Gen Z dark theme)
│   │   └── components/      # Reusable components
│   ├── App.js               # Root component
│   └── package.json
└── README.md
```

## Development Notes

- **Database**: Uses SQLite (`prisma/dev.db`) for easy local development - no database server required!
- **Authentication**: JWT tokens stored in AsyncStorage (React Native) or localStorage (Web)
- **API Base URL**: Configured in `frontend/src/config/api.js` (defaults to `http://localhost:3001`)
- **Navigation**: React Navigation with bottom tabs and stack navigators
- **Theme**: Gen Z dark theme with neon accents - colors defined in `frontend/src/theme/colors.js`
- **Swipe Detection**: Uses PanResponder for drag/swipe gestures on web and mobile

## Environment Variables

The app works out of the box with default values! However, for production or custom configuration, you can create a `.env` file.

### Optional: Create `.env` file

Create a `.env` file in the `backend/` directory for custom configuration:

```env
# JWT Secret for token signing (REQUIRED for production)
# Defaults to a development secret if not set
JWT_SECRET="your-super-secret-jwt-key-change-in-production"

# Optional: Change server port (defaults to 3001)
PORT=3001

# If using PostgreSQL instead of SQLite (optional):
# DATABASE_URL="postgresql://user:password@localhost:5432/skillera"
```

**Note**: 
- ✅ The app works without a `.env` file - it uses secure defaults for local development
- ⚠️ **For production**, you **MUST** set `JWT_SECRET` to a strong, random string

### Using PostgreSQL (Optional)

If you want to use PostgreSQL instead of SQLite:

1. Create a `.env` file in the `backend/` directory:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/skillera"
JWT_SECRET="your-secret-key-here"
```

2. Update `backend/prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

3. Run migrations again: `npx prisma migrate dev`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - feel free to use this project for learning or as a starting point for your own apps!
