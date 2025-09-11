# Project Overview

This is a full-stack application that allows users to scan receipts, extract the items, and then get recipe suggestions based on the items they have.

The application is composed of two main parts:

*   **Frontend:** A [Next.js](https://nextjs.org/) application that provides the user interface.
*   **Backend:** A Node.js with Express application that provides an API for processing receipts and a PocketBase instance for data storage.

## Architecture

1.  **Frontend (Next.js):**
    *   The user uploads a receipt through the web interface.
    *   The frontend sends the receipt image to the backend for processing.
    *   The frontend fetches the extracted items from the backend and displays them to the user.
    *   The user can select items from their inventory to get recipe suggestions from the Spoonacular API.

2.  **Backend (Node.js/Express & PocketBase):**
    *   **`command-api`:** An Express server that exposes a `/scan-receipt` endpoint. This endpoint takes an image file, uses Google's Generative AI to extract the items, and saves them to the PocketBase database.
    *   **`pb`:** A PocketBase instance that provides a database and authentication services.

# Building and Running

## Frontend

To run the frontend development server:

```bash
cd frontend
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Backend

To run the backend server:

```bash
cd backend/command-api
npm start
```

The backend server will be running on [http://localhost:3005](http://localhost:3005).

To run the PocketBase server:

```bash
cd backend/pb
./pocketbase serve
```

The PocketBase server will be running on [http://localhost:8090](http://localhost:8090).

# Development Conventions

## Code Style

*   The frontend uses TypeScript with React and Material-UI.
*   The backend uses JavaScript with Node.js and Express.

## Testing

There are no testing frameworks set up for this project.

## API Keys

The application requires API keys for Google Generative AI and Spoonacular. These should be stored in a `.env.local` file in the root directory and a `.env` file in the `backend/command-api` directory.

**`.env.local`**

```
NEXT_PUBLIC_POCKETBASE_URL=http://127.0.0.1:8090
SPOONTACULAR_KEY=YOUR_SPOONACULAR_API_KEY
```

**`backend/command-api/.env`**

```
GEMINI_API_KEY=YOUR_GEMINI_API_KEY
```
