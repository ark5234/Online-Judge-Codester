# OJ Codester Frontend

This is the React + Vite frontend for OJ Codester, using Appwrite for authentication.

## Setup

1. Install dependencies:
   ```sh
   npm install
   ```
2. Run the development server:
   ```sh
   npm run dev
   ```

## Google Auth with Appwrite
- Google OAuth2 is configured via Appwrite Console.
- The frontend uses Appwrite's SDK for authentication.
- No Google Client ID is needed in the frontend code.

## Project Structure
- `src/` - React source code
- `src/appwrite.js` - Appwrite client config
- `src/pages/` - Page components
- `src/App.jsx` - Main app with routing

--- 