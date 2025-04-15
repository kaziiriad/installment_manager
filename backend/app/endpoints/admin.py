from fastapi import APIRouter, Depends
from ..models.schemas import UserResponse
from ..core.security import require_admin

admin_router = APIRouter(prefix="/admin", dependencies=[Depends(require_admin)], tags=["admin"])

@admin_router.get("/reports")
async def generate_report():
    return {"detail": "Admin-only report data"}

@admin_router.get("/customers", response_model=list[UserResponse])
async def list_customers():
    return {
        "detail": "List of all customers",
    }

