from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Enquiry, Package
from app.schemas import EnquiryCreate, EnquiryOut

router = APIRouter(prefix="/api/enquiries", tags=["enquiries"])


@router.post("", response_model=EnquiryOut, status_code=201)
def create_enquiry(payload: EnquiryCreate, db: Session = Depends(get_db)):
    # Snapshot the package title at submission time (see schema design notes:
    # this survives even if the package is later edited or deleted).
    snapshot = None
    if payload.package_id:
        pkg = db.query(Package).filter(Package.id == payload.package_id).first()
        if pkg:
            snapshot = pkg.title

    enquiry = Enquiry(
        type=payload.type,
        name=payload.name,
        phone=payload.phone,
        package_id=payload.package_id,
        package_title_snapshot=snapshot,
        source=payload.source,
        message=payload.message,
    )
    db.add(enquiry)
    db.commit()
    db.refresh(enquiry)  # pulls back the DB-generated id, status, created_at
    return enquiry
