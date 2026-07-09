from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import or_, func
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Package
from app.schemas import PackageListResponse, PackageOut
from app.cache import global_cache

router = APIRouter(prefix="/api/packages", tags=["packages"])


@router.get("", response_model=PackageListResponse)
def list_packages(
    q: Optional[str] = Query(default=None, description="Search title/destination"),
    category: Optional[str] = None,
    tourType: Optional[List[str]] = Query(default=None),
    stars: Optional[List[int]] = Query(default=None),
    maxPrice: Optional[int] = None,
    page: int = Query(default=1, ge=1),
    pageSize: int = Query(default=12, ge=1, le=100),
    db: Session = Depends(get_db),
):
    cache_key = f"packages_list_{q}_{category}_{tourType}_{stars}_{maxPrice}_{page}_{pageSize}"
    cached = global_cache.get(cache_key)
    if cached is not None:
        return cached

    query = db.query(Package).filter(Package.is_active.is_(True))

    if q:
        like = f"%{q}%"
        query = query.filter(or_(Package.title.like(like), Package.destination.like(like)))
    if category:
        import json
        query = query.filter(func.json_contains(Package.categories, f'"{category}"'))
    if tourType:
        import json
        # MySQL 8.0 JSON_OVERLAPS returns 1 if overlapping
        query = query.filter(func.json_overlaps(Package.tour_types, json.dumps(tourType)))
    if stars:
        query = query.filter(Package.stars.in_(stars))
    if maxPrice is not None:
        query = query.filter(Package.price <= maxPrice)

    total = query.count()
    items = (
        query.order_by(Package.id)
        .offset((page - 1) * pageSize)
        .limit(pageSize)
        .all()
    )
    total_pages = (total + pageSize - 1) // pageSize if total else 0

    response_data = PackageListResponse(
        items=items, total=total, page=page, page_size=pageSize, total_pages=total_pages
    )
    global_cache.set(cache_key, response_data, ttl=60)  # cache for 60s
    return response_data


@router.get("/{package_id}", response_model=PackageOut)
def get_package(package_id: int, db: Session = Depends(get_db)):
    pkg = (
        db.query(Package)
        .filter(Package.id == package_id, Package.is_active.is_(True))
        .first()
    )
    if not pkg:
        raise HTTPException(status_code=404, detail="Package not found")
    return pkg
