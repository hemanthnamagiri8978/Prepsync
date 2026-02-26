# PrepSync
**Unified Academic Resource Management Platform**

PrepSync is a full-stack, centralized web application designed to bridge the communication and resource-sharing gap between university faculty and students. It replaces fragmented legacy systems with a streamlined portal for sharing notes, assignments, and past exams.

## Features
*   **Role-Based Access Control:** Distinct views and permissions for Students, Faculty, and Admin.
*   **Targeted Content:** Students only see materials relevant to their specific enrolled section.
*   **Real File Uploads:** Faculty can upload documents with a global upload modal.
*   **Analytics Dashboard:** Track system usage, top contributors, and trending downloads.
*   **Premium Aesthetic:** Built with a fully responsive, dark-mode glassmorphism design.

## Tech Stack
*   **Frontend:** React (Vite), React Router
*   **Backend:** Node.js, Express
*   **Database:** SQLite
*   **File Handling:** Multer

## Getting Started

### 1. Prerequisites
Ensure you have [Node.js](https://nodejs.org/) installed on your machine.

### 2. Backend Setup
1. Open a terminal in the root directory.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the server (runs on `http://localhost:3000`):
   ```bash
   npm start
   ```
*Note: The SQLite database (`prepsync.db`) will automatically initialize and seed with demo data on the first run.*

### 3. Frontend Setup
1. Open a **second terminal** and navigate to the client folder:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. The application will be live at `http://localhost:5173` (or the port specified by Vite).

## Demo Accounts
You can log in using the predefined demo accounts:
*   **Admin:** `admin` / `password`
*   **Faculty:** `faculty` / `password`
*   **Student:** `student` / `password`

## License
MIT License
