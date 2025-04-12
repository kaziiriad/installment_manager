from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi import Request
from fastapi import APIRouter
from fastapi import HTTPException
from fastapi import Depends



app = FastAPI(
    title="Installment Management System",
    description="A system to manage installment payments",
    version="1.0.0",
)

@app.get("/")
async def root():
    return {"message": "Welcome to the Installment Management System API!"}


if __name__ == "__main__":

    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

