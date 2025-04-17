from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi import Request
from pydantic import EmailStr
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession
from contextlib import asynccontextmanager

# Use absolute imports

from app.core.database import get_async_db, Base, create_tables_async
from app.core.seed import create_admin
from app.endpoints.auth import auth_router
from app.endpoints.installments import installment_router
from app.endpoints.admin import admin_router
from app.services.email import send_email, send_otp_email

# Import other routers as needed
# from .endpoints.users import user_router
# from .endpoints.products import product_router
# from .endpoints.installments import installment_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Setup code here (runs before application startup)
    print("Creating database tables...")
    await create_tables_async()
    await create_admin(
        admin_email="admin@example.com",
    )
    
    yield  # This line yields control back to FastAPI
    
    # Teardown code here (runs when application is shutting down)
    print("Application shutting down...")

app = FastAPI(
    lifespan=lifespan,
    title="Installment Management System",
    description="A system to manage installment payments",
    version="1.0.0",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API routers
app.include_router(auth_router)
app.include_router(installment_router)
app.include_router(admin_router)
# app.include_router(user_router, prefix="/api/v1", tags=["Users"])
# app.include_router(product_router, prefix="/api/v1", tags=["Products"])
# app.include_router(installment_router, prefix="/api/v1", tags=["Installments"])


@app.get("/")
async def root():
    return {"message": "Welcome to the Installment Management System API!"}


    # Placeholder for email sending logic
    # Implement your email sending logic here
    # return {"message": f"Email sent to {email}"}

@app.get("/test-db")
async def test_db(db: AsyncSession = Depends(get_async_db)):
    try:
        result = await db.execute(text("SELECT 1"))
        return {"message": "Database connection is working!",
                "result": result.scalar()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database connection failed: {str(e)}")

# Add static file serving if needed
# app.mount("/static", StaticFiles(directory="static"), name="static")

# if __name__ == "__main__":
#     import uvicorn
#     uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

