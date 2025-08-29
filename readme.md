# [Your Project Name]

A brief description of your project, what it does, and who it's for.


## Prerequisites

Before you begin, ensure you have the following installed on your local machine:

- [Node.js](https://nodejs.org/) (v18.x or later recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [Python](https://www.python.org/downloads/) (v3.8 or later recommended)
- [pip](https://pip.pypa.io/en/stable/installation/) (usually comes with Python)
- [Git](https://git-scm.com/)

## Getting Started

Follow these steps to set up the project on your local machine. This guide assumes your project has a `/frontend` and `/backend` directory structure.

### 1. Clone the Repository

First, clone the repository to your local machine:

```bash
git clone <https://github.com/worldsech/AI-enhanced-marriage-counselling-chatbot.git>
cd <your-project-directory>
```

### 2. Backend Setup (Python)

The backend is built with Python. It's a best practice to use a virtual environment to manage dependencies.

1.  **Navigate to the backend directory:**
    ```bash
    cd backend
    ```

2.  **Create and activate a virtual environment:**

    -   On macOS and Linux:
        ```bash
        python3 -m venv venv
        source venv/bin/activate
        ```
    -   On Windows:
        ```bash
        python -m venv venv
        .\venv\Scripts\activate
        ```
    Your terminal prompt should now be prefixed with `(venv)`.

3.  **Install dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

### 3. Frontend Setup (Next.js)

The frontend is a Next.js application.

1.  **Navigate to the frontend directory from the project root:**
    ```bash
    cd ../frontend
    ```

2.  **Install dependencies:**
    Using npm:
    ```bash
    npm install
    ```
    Or using yarn:
    ```bash
    yarn install
    ```

### 4. Environment Variables

The frontend needs to know the URL of the backend API to communicate with it.

1.  In the `frontend` directory, create a new file named `.env.local`.

2.  Add the following line to your `.env.local` file. This points the Next.js app to your local Python backend server, which we'll run on port 5000 by default.
    ```ini
    NEXT_PUBLIC_API_URL=http://127.0.0.1:5000
    ```
    > **Note:** If your Python backend runs on a different port, make sure to update it here.

## Running the Application

You need to run both the backend and frontend servers simultaneously in two separate terminal windows.

### Running the Backend

1.  **Open a new terminal.**

2.  **Navigate to the `backend` directory and activate the virtual environment:**
    ```bash
    cd path/to/your/project/backend
    source venv/bin/activate  # On macOS/Linux
    # .\venv\Scripts\activate  # On Windows
    ```

3.  **Start the server:**
    The command might differ based on the framework used (e.g., Flask, FastAPI).

    -   For **Flask**:
        ```bash
        flask run
        ```
    -   For **FastAPI** (using uvicorn):
        ```bash
        uvicorn main:app --reload  # Replace 'main:app' with your file and app instance
        ```

    The backend server should now be running, typically at `http://127.0.0.1:5000`.

### Running the Frontend

1.  **Open a second terminal.**

2.  **Navigate to the `frontend` directory:**
    ```bash
    cd path/to/your/project/frontend
    ```

3.  **Start the Next.js development server:**
    - Using npm:
      ```bash
      npm run dev
      ```
    - Or using yarn:
      ```bash
      yarn dev
      ```

    The frontend application should now be running and accessible at `http://localhost:3000`. Open this URL in your web browser to see the application.

## Tech Stack

*   **Frontend:** Next.js, React
*   **Backend:** Python, Flask / FastAPI `(update as needed)`