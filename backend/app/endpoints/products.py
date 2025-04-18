from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List

from app.core.database import get_async_db
from app.models.schemas import ProductResponse
from app.models.db_models import Product

product_router = APIRouter(
    prefix="/products",
    tags=["Products"]
)

@product_router.get("/", response_model=List[ProductResponse])
async def get_products(
    db: AsyncSession = Depends(get_async_db), 
    skip: int = 0, 
    limit: int = 100
) -> List[ProductResponse]:
    """Get a list of all products"""
    
    # Use the correct async query pattern
    query = select(Product).offset(skip).limit(limit)
    result = await db.execute(query)
    products = result.scalars().all()
    
    if not products:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No products found"
        )
    
    return products  # Pydantic will handle the conversion automatically

@product_router.get("/{product_id}", response_model=ProductResponse)
async def get_product(
    product_id: int,
    db: AsyncSession = Depends(get_async_db)
) -> ProductResponse:
    """Get details of a specific product"""
    
    query = select(Product).filter(Product.id == product_id)
    result = await db.execute(query)
    product = result.scalar_one_or_none()
    
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product with ID {product_id} not found"
        )
    
    return product  # Pydantic will handle the conversion automatically
