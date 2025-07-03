# Installment Management System

## Overview

This is a full-stack web application designed to manage installment plans for products. It provides a platform for customers to browse products, calculate installment plans, and manage their payments. An admin dashboard is included for user management and financial reporting.

The application is built with a modern tech stack, featuring a React frontend and a FastAPI backend, containerized with Docker for easy setup and deployment.

## Key Features

- **User Authentication:** Secure user registration with OTP email verification and login.
- **Product Catalog:** Browse a list of available products.
- **Installment Calculator:** Dynamically calculate installment plans based on product price, down payment, and tenure.
- **Customer Dashboard:** Authenticated users can view their active installments, payment history, and make payments.
- **Admin Dashboard:**
  - View key metrics like total customers, revenue, and pending payments.
  - Manage and view a list of all customers.
  - Generate weekly, monthly, or all-time financial reports.
- **Secure API:** Role-based access control for both backend and frontend routes.

## Project Structure

The project is organized into two main directories:

- `frontend/`: Contains the React (Vite + TypeScript) application.
- `backend/`: Contains the FastAPI (Python) application.

## Technologies Used

### Frontend
- Vite & TypeScript
- React & React Router
- Tailwind CSS
- shadcn-ui
- Axios & React Query

### Backend
- FastAPI & Python
- SQLAlchemy (PostgreSQL)
- Alembic (Database Migrations)
- Docker & Docker Compose
- Redis & Celery (for background tasks like sending emails)

## Getting Started

### Prerequisites
- [Docker](https://www.docker.com/get-started) and [Docker Compose](https://docs.docker.com/compose/install/)
- [Node.js](https://nodejs.org/) & npm (for manual frontend setup)

### Running the Application (Recommended)

The easiest way to get the application running is with Docker Compose.

1.  **Clone the repository:**
    ```sh
    git clone [repository-url]
    ```

2.  **Set up environment variables:**
    - In the `frontend/` directory, rename `.env.docker` to `.env` or create a new `.env` file. The default values should work for local development.
    - The backend configuration is managed in `backend/app/core/config.py`.

3.  **Build and run the services:**
    From the project root directory, run:
    ```sh
    docker-compose up --build
    ```
    This command will build the images for the frontend and backend services and start the containers.

4.  **Access the application:**
    - Frontend: [http://localhost:5173](http://localhost:5173)
    - Backend API: [http://localhost:8000/docs](http://localhost:8000/docs)

### Manual Installation (Alternative)

#### Backend
```sh
cd backend
# Recommended: Create and activate a virtual environment
python -m venv .venv
source .venv/bin/activate 
# Install dependencies
pip install -r requirements.txt 
# Run the development server
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

#### Frontend
```sh
cd frontend
# Install dependencies
npm install
# Run the development server
npm run dev
```

## API Documentation

The backend API is self-documenting. Once the backend server is running, you can access the interactive Swagger UI at [http://localhost:8000/docs](http://localhost:8000/docs).

## Contributing

1.  Fork the repository.
2.  Create your feature branch (`git checkout -b feature/amazing-feature`).
3.  Commit your changes (`git commit -m 'Add some amazing feature'`).
4.  Push to the branch (`git push origin feature/amazing-feature`).
5.  Open a Pull Request.
