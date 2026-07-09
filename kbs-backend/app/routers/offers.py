from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Offer
from app.schemas import OfferOut

router = APIRouter(prefix="/api/offers", tags=["offers"])


@router.get("", response_model=List[OfferOut])
def list_offers(db: Session = Depends(get_db)):
    return (
        db.query(Offer)
        .filter(Offer.is_active.is_(True))
        .order_by(Offer.sort_order)
        .all()
    )
