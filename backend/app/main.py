from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi import Request
from fastapi import APIRouter
from fastapi import HTTPException
from fastapi import Depends
from sqlalchemy import text
from sqlalchemy.orm import Session
from database.base import get_db


app = FastAPI(
    title="Installment Management System",
    description="A system to manage installment payments",
    version="1.0.0",
)

@app.get("/")
async def root():
    return {"message": "Welcome to the Installment Management System API!"}


@app.get("/test-db")
async def test_db(db: Session = Depends(get_db)):
    try:
        db.execute(text('SELECT 1'))
        return {"message": "Database connection is working!"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database connection failed: {e}")

if __name__ == "__main__":

    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

