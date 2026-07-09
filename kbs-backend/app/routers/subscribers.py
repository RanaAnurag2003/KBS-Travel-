from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Subscriber
from app.schemas import SubscriberCreate, SubscriberOut

router = APIRouter(prefix="/api/subscribers", tags=["subscribers"])


@router.post("", response_model=SubscriberOut, status_code=201)
def subscribe(payload: SubscriberCreate, db: Session = Depends(get_db)):
    existing = db.query(Subscriber).filter(Subscriber.email == payload.email).first()
    if existing:
        # Re-subscribing someone who previously unsubscribed — just
        # reactivate their existing row instead of erroring or duplicating.
        if not existing.is_active:
            existing.is_active = True
            db.commit()
            db.refresh(existing)
        return existing

    subscriber = Subscriber(email=payload.email)
    db.add(subscriber)
    db.commit()
    db.refresh(subscriber)
    return subscriber
