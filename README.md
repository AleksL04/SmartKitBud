# SmartKitBud

This document provides an overview of the SmartKitBud project, a full-stack application for managing kitchen inventory.

## Project Overview

SmartKitBud helps you manage your kitchen inventory by allowing you to upload receipts, automatically extracting the items, and providing recipe suggestions based on what you have.

The application is built with Next.js and uses PocketBase as its backend.

*   **Frontend:** A Next.js application built with TypeScript and Material-UI.
*   **Backend:** A PocketBase instance serves as the database and backend.

## Building and Running

### Prerequisites

*   Node.js and npm
*   PocketBase executable (located in the `backend` directory)

### Installation

1.  **Frontend:**
    ```bash
    cd frontend
    npm install
    ```

### Running the Application

The easiest way to start all services is to use the `start-all.sh` script in the project root:

```bash
./start-all.sh
```

This script will:

1.  Start the PocketBase server.
2.  Start the frontend development server.

Logs for each service are stored in the `logs` directory.

Once all services are running, the application is accessible at [http://localhost:3000](http://localhost:3000).

### Individual Services

*   **Frontend:**
    ```bash
    cd frontend
    npm run dev
    ```

*   **PocketBase:**
    ```bash
    cd backend
    ./pocketbase serve
    ```

## Development Conventions

*   **Frontend:**
    *   The frontend is written in TypeScript and uses the Next.js framework.
    *   Styling is done with Material-UI.
    *   API routes are defined in the `frontend/app/api` directory.
    *   Authentication is handled via a session cookie.

*   **Backend:**
    *   The database is managed by PocketBase.
    *   Database schema changes are handled through migration files located in `backend/pb_migrations`.

*   **Linting:**
    *   The frontend code can be linted with the following command:
        ```bash
        cd frontend
        npm run lint
        ```
