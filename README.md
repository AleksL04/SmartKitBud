# SmartKitBud

SmartKitBud is a full-stack application designed to help you manage your kitchen inventory. It allows you to upload receipts, automatically extracts the items, and provides recipe suggestions based on the items you have.

## Project Overview

This is a full-stack application with a Next.js frontend and a backend powered by PocketBase and a Node.js command API.

### Frontend

The frontend is a Next.js application located in the `frontend` directory. It uses Material-UI for components and is written in TypeScript.

### Backend

The backend consists of two parts:

*   **PocketBase:** A PocketBase instance is used as the database. The data schema is defined in the migration files located in `backend/pb/pb_migrations`. The main collection is `receipt_items`, which stores information about items from receipts.
*   **Command API:** A Node.js Express server located in `backend/command-api` provides an API for interacting with the system.

## Getting Started

To get started with SmartKitBud, you'll need to have Node.js and npm installed.

### Installation

1.  Clone the repository:

    ```bash
    git clone <repository-url>
    ```

2.  Install the dependencies for the frontend:

    ```bash
    cd frontend
    npm install
    ```

3.  Install the dependencies for the backend:

    ```bash
    cd ../backend/command-api
    npm install
    ```

### Running the Application

To start all services, run the `start-all.sh` script from the project root:

```bash
./start-all.sh
```

This will start the PocketBase server, the command API server, and the frontend development server. Logs for each service are stored in the `logs` directory.

Once the services are running, you can access the application at [http://localhost:3000](http://localhost:3000).

## Development Conventions

*   The frontend code is written in TypeScript and uses Next.js.
*   The backend command API is a Node.js Express server.
*   The database is managed by PocketBase, with schema changes handled through migration files.
