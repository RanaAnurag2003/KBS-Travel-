from typing import Any, Dict, List

from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy import desc
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.models import Offer, Package, SiteContent, VersionHistory
from app.schemas import (
    AdminLoginRequest,
    OfferDraftInput,
    OfferOut,
    PackageDraftInput,
    PackageOut,
    SiteContentInput,
    SiteContentOut,
    VersionHistoryOut,
)

router = APIRouter(prefix="/api/cms", tags=["cms"])


# Helper dependency to authenticate admin
def get_admin_role(x_api_key: str = Header(None, alias="X-API-Key")) -> str:
    if not x_api_key or x_api_key != settings.admin_api_key:
        raise HTTPException(status_code=401, detail="Unauthorized: Invalid admin key")
    return "Admin"


# Helper to record version history
def add_to_history(
    db: Session, entity_type: str, entity_id: str, data: Dict[str, Any], editor: str
):
    history_entry = VersionHistory(
        entity_type=entity_type,
        entity_id=str(entity_id),
        data=data,
        editor_name=editor,
    )
    db.add(history_entry)
    db.commit()


@router.post("/login")
def admin_login(payload: AdminLoginRequest):
    if payload.key != settings.admin_api_key:
        raise HTTPException(status_code=401, detail="Invalid admin key")
    return {"token": settings.admin_api_key, "user": {"name": settings.admin_username, "role": payload.role}}


# ---------------------------------------------------------------------------
# General Site Content Endpoints
# ---------------------------------------------------------------------------
@router.get("/content", response_model=List[SiteContentOut])
def get_all_site_content(db: Session = Depends(get_db)):
    return db.query(SiteContent).all()


@router.put("/content", response_model=SiteContentOut)
def update_site_content(
    payload: SiteContentInput,
    db: Session = Depends(get_db),
    role: str = Depends(get_admin_role),
    editor_name: str = Header("Admin", alias="X-Editor-Name"),
):
    item = db.query(SiteContent).filter(SiteContent.key == payload.key).first()
    if not item:
        item = SiteContent(key=payload.key, value="", draft_value=payload.draft_value)
        db.add(item)
    else:
        # Save snapshot of current draft to history before updating
        add_to_history(
            db,
            "site_content",
            payload.key,
            {"value": item.value, "draft_value": item.draft_value},
            editor_name,
        )
        item.draft_value = payload.draft_value

    db.commit()
    db.refresh(item)
    return item


@router.post("/content/publish", response_model=List[SiteContentOut])
def publish_all_site_content(
    db: Session = Depends(get_db),
    role: str = Depends(get_admin_role),
    editor_name: str = Header("Admin", alias="X-Editor-Name"),
):
    items = db.query(SiteContent).all()
    for item in items:
        if item.draft_value is not None:
            # Save history entry for publishing
            add_to_history(
                db,
                "site_content",
                item.key,
                {"value": item.value, "draft_value": item.draft_value, "published": True},
                editor_name,
            )
            item.value = item.draft_value
            item.draft_value = None
    db.commit()
    return db.query(SiteContent).all()


# ---------------------------------------------------------------------------
# Package Draft / Publish Endpoints
# ---------------------------------------------------------------------------
@router.put("/packages/{pkg_id}/draft", response_model=PackageOut)
def update_package_draft(
    pkg_id: int,
    payload: PackageDraftInput,
    db: Session = Depends(get_db),
    role: str = Depends(get_admin_role),
    editor_name: str = Header("Admin", alias="X-Editor-Name"),
):
    pkg = db.query(Package).filter(Package.id == pkg_id).first()
    if not pkg:
        raise HTTPException(status_code=404, detail="Package not found")

    # Record history of current draft/published values
    add_to_history(
        db,
        "package",
        str(pkg_id),
        {
            "title": pkg.title,
            "destination": pkg.destination,
            "price": pkg.price,
            "duration": pkg.duration,
            "image": pkg.image,
            "bullets": pkg.bullets,
            "tags": pkg.tags,
            "categories": pkg.categories,
            "tour_types": pkg.tour_types,
            "popular_filters": pkg.popular_filters,
            "highlights": pkg.highlights,
            "inclusions": pkg.inclusions,
            "exclusions": pkg.exclusions,
            "stay_transfers": pkg.stay_transfers,
            "custom_properties": pkg.custom_properties,
            "draft_title": pkg.draft_title,
            "draft_price": pkg.draft_price,
            "draft_custom_properties": pkg.draft_custom_properties,
        },
        editor_name,
    )

    # Helper function to fall back to current value if draft is not provided yet
    def get_val(new_val, current_draft, current_published):
        if new_val is not None:
            return new_val
        if current_draft is not None:
            return current_draft
        return current_published

    pkg.draft_title = get_val(payload.title, pkg.draft_title, pkg.title)
    pkg.draft_destination = get_val(payload.destination, pkg.draft_destination, pkg.destination)
    pkg.draft_price = get_val(payload.price, pkg.draft_price, pkg.price)
    pkg.draft_duration = get_val(payload.duration, pkg.draft_duration, pkg.duration)
    pkg.draft_image = get_val(payload.image, pkg.draft_image, pkg.image)
    pkg.draft_bullets = get_val(payload.bullets, pkg.draft_bullets, pkg.bullets)
    pkg.draft_tags = get_val(payload.tags, pkg.draft_tags, pkg.tags)
    pkg.draft_categories = get_val(payload.categories, pkg.draft_categories, pkg.categories)
    pkg.draft_tour_types = get_val(payload.tour_types, pkg.draft_tour_types, pkg.tour_types)
    pkg.draft_popular_filters = get_val(payload.popular_filters, pkg.draft_popular_filters, pkg.popular_filters)
    pkg.draft_highlights = get_val(payload.highlights, pkg.draft_highlights, pkg.highlights)
    pkg.draft_inclusions = get_val(payload.inclusions, pkg.draft_inclusions, pkg.inclusions)
    pkg.draft_exclusions = get_val(payload.exclusions, pkg.draft_exclusions, pkg.exclusions)
    pkg.draft_stay_transfers = get_val(payload.stay_transfers, pkg.draft_stay_transfers, pkg.stay_transfers)

    if payload.custom_properties is not None:
        curr = pkg.draft_custom_properties or pkg.custom_properties or {}
        pkg.draft_custom_properties = {**curr, **payload.custom_properties}

    pkg.has_draft = True
    db.commit()
    db.refresh(pkg)
    return pkg


@router.post("/packages/{pkg_id}/publish", response_model=PackageOut)
def publish_package(
    pkg_id: int,
    db: Session = Depends(get_db),
    role: str = Depends(get_admin_role),
    editor_name: str = Header("Admin", alias="X-Editor-Name"),
):
    pkg = db.query(Package).filter(Package.id == pkg_id).first()
    if not pkg:
        raise HTTPException(status_code=404, detail="Package not found")

    add_to_history(
        db,
        "package",
        str(pkg_id),
        {"title": pkg.title, "price": pkg.price, "custom_properties": pkg.custom_properties, "published": True},
        editor_name,
    )

    # Copy draft values to active
    if pkg.draft_title is not None:
        pkg.title = pkg.draft_title
    if pkg.draft_destination is not None:
        pkg.destination = pkg.draft_destination
    if pkg.draft_price is not None:
        pkg.price = pkg.draft_price
    if pkg.draft_duration is not None:
        pkg.duration = pkg.draft_duration
    if pkg.draft_image is not None:
        pkg.image = pkg.draft_image
    if pkg.draft_bullets is not None:
        pkg.bullets = pkg.draft_bullets
    if pkg.draft_tags is not None:
        pkg.tags = pkg.draft_tags
    if pkg.draft_categories is not None:
        pkg.categories = pkg.draft_categories
    if pkg.draft_tour_types is not None:
        pkg.tour_types = pkg.draft_tour_types
    if pkg.draft_popular_filters is not None:
        pkg.popular_filters = pkg.draft_popular_filters
    if pkg.draft_highlights is not None:
        pkg.highlights = pkg.draft_highlights
    if pkg.draft_inclusions is not None:
        pkg.inclusions = pkg.draft_inclusions
    if pkg.draft_exclusions is not None:
        pkg.exclusions = pkg.draft_exclusions
    if pkg.draft_stay_transfers is not None:
        pkg.stay_transfers = pkg.draft_stay_transfers
    if pkg.draft_custom_properties is not None:
        pkg.custom_properties = pkg.draft_custom_properties

    # Reset drafts
    pkg.draft_title = None
    pkg.draft_destination = None
    pkg.draft_price = None
    pkg.draft_duration = None
    pkg.draft_image = None
    pkg.draft_bullets = None
    pkg.draft_tags = None
    pkg.draft_categories = None
    pkg.draft_tour_types = None
    pkg.draft_popular_filters = None
    pkg.draft_highlights = None
    pkg.draft_inclusions = None
    pkg.draft_exclusions = None
    pkg.draft_stay_transfers = None
    pkg.draft_custom_properties = None

    pkg.has_draft = False
    pkg.is_published = True
    db.commit()
    db.refresh(pkg)
    return pkg


@router.post("/packages/new", response_model=PackageOut)
def create_package_draft(
    db: Session = Depends(get_db),
    role: str = Depends(get_admin_role),
):
    import random
    new_id = random.randint(10000, 99999)
    slug = f"new-package-{new_id}"
    pkg = Package(
        slug=slug,
        title="New Holiday Tour Package",
        destination="Unknown",
        price=1000,
        duration="3D/2N",
        image="/src/assets/hero.webp",
        rating=5.0,
        rating_label="Excellent",
        reviews=1,
        stars=5,
        bullets=["Exotic Scenic views", "Adventure activities"],
        tags=["Stay", "Food", "Transfer", "Sightseeing"],
        categories=["Weekend"],
        tour_types=["Family Tour"],
        popular_filters=["Sightseeing Tours"],
        highlights=["Fun-filled activities with family", "Explore scenic viewpoints"],
        inclusions=["Daily Breakfast", "Sightseeing Tours"],
        exclusions=["Flights/Train Fare", "GST Charges"],
        stay_transfers="Premium resort stay.",
        is_published=False,  # Draft until published
        is_active=True,
    )

    db.add(pkg)
    db.commit()
    db.refresh(pkg)
    return pkg


@router.delete("/packages/{pkg_id}")
def delete_package(
    pkg_id: int,
    db: Session = Depends(get_db),
    role: str = Depends(get_admin_role),
):
    pkg = db.query(Package).filter(Package.id == pkg_id).first()
    if not pkg:
        raise HTTPException(status_code=404, detail="Package not found")
    # Soft delete
    pkg.is_active = False
    db.commit()
    return {"status": "deleted", "id": pkg_id}


# ---------------------------------------------------------------------------
# Offer Draft / Publish Endpoints
# ---------------------------------------------------------------------------
@router.put("/offers/{offer_id}/draft", response_model=OfferOut)
def update_offer_draft(
    offer_id: int,
    payload: OfferDraftInput,
    db: Session = Depends(get_db),
    role: str = Depends(get_admin_role),
    editor_name: str = Header("Admin", alias="X-Editor-Name"),
):
    offer = db.query(Offer).filter(Offer.id == offer_id).first()
    if not offer:
        raise HTTPException(status_code=404, detail="Offer not found")

    add_to_history(
        db,
        "offer",
        str(offer_id),
        {"title": offer.title, "subtitle": offer.subtitle, "draft_title": offer.draft_title},
        editor_name,
    )

    def get_val(new_val, current_draft, current_published):
        if new_val is not None:
            return new_val
        if current_draft is not None:
            return current_draft
        return current_published

    offer.draft_title = get_val(payload.title, offer.draft_title, offer.title)
    offer.draft_subtitle = get_val(payload.subtitle, offer.draft_subtitle, offer.subtitle)
    offer.draft_description = get_val(payload.description, offer.draft_description, offer.description)
    offer.draft_badge = get_val(payload.badge, offer.draft_badge, offer.badge)
    offer.draft_badge_type = get_val(payload.badge_type, offer.draft_badge_type, offer.badge_type)
    offer.draft_image = get_val(payload.image, offer.draft_image, offer.image)
    offer.draft_cta_label = get_val(payload.cta_label, offer.draft_cta_label, offer.cta_label)

    offer.has_draft = True
    db.commit()
    db.refresh(offer)
    return offer


@router.post("/offers/{offer_id}/publish", response_model=OfferOut)
def publish_offer(
    offer_id: int,
    db: Session = Depends(get_db),
    role: str = Depends(get_admin_role),
    editor_name: str = Header("Admin", alias="X-Editor-Name"),
):
    offer = db.query(Offer).filter(Offer.id == offer_id).first()
    if not offer:
        raise HTTPException(status_code=404, detail="Offer not found")

    add_to_history(db, "offer", str(offer_id), {"title": offer.title, "published": True}, editor_name)

    if offer.draft_title is not None:
        offer.title = offer.draft_title
    if offer.draft_subtitle is not None:
        offer.subtitle = offer.draft_subtitle
    if offer.draft_description is not None:
        offer.description = offer.draft_description
    if offer.draft_badge is not None:
        offer.badge = offer.draft_badge
    if offer.draft_badge_type is not None:
        offer.badge_type = offer.draft_badge_type
    if offer.draft_image is not None:
        offer.image = offer.draft_image
    if offer.draft_cta_label is not None:
        offer.cta_label = offer.draft_cta_label

    offer.draft_title = None
    offer.draft_subtitle = None
    offer.draft_description = None
    offer.draft_badge = None
    offer.draft_badge_type = None
    offer.draft_image = None
    offer.draft_cta_label = None

    offer.has_draft = False
    offer.is_published = True
    db.commit()
    db.refresh(offer)
    return offer


@router.post("/offers/new", response_model=OfferOut)
def create_offer_draft(
    db: Session = Depends(get_db),
    role: str = Depends(get_admin_role),
):
    new_order = db.query(Offer).count() + 1
    offer = Offer(
        title="New Seasonal Travel Offer",
        subtitle="Up to 20% off all tours",
        description="Exclusive discount package available for limited spots.",
        badge="Promo",
        badge_type="discount",
        image="/src/assets/hero.webp",
        cta_label="Claim Now",
        sort_order=new_order,
        is_published=False,
        is_active=True,
    )
    db.add(offer)
    db.commit()
    db.refresh(offer)
    return offer


@router.delete("/offers/{offer_id}")
def delete_offer(
    offer_id: int,
    db: Session = Depends(get_db),
    role: str = Depends(get_admin_role),
):
    offer = db.query(Offer).filter(Offer.id == offer_id).first()
    if not offer:
        raise HTTPException(status_code=404, detail="Offer not found")
    offer.is_active = False
    db.commit()
    return {"status": "deleted", "id": offer_id}


# ---------------------------------------------------------------------------
# History and Undo/Redo/Restore
# ---------------------------------------------------------------------------
@router.get("/history", response_model=List[VersionHistoryOut])
def get_history(
    entity_type: str = None,
    entity_id: str = None,
    db: Session = Depends(get_db),
    role: str = Depends(get_admin_role),
):
    q = db.query(VersionHistory)
    if entity_type:
        q = q.filter(VersionHistory.entity_type == entity_type)
    if entity_id:
        q = q.filter(VersionHistory.entity_id == str(entity_id))
    return q.order_by(desc(VersionHistory.created_at)).limit(50).all()


@router.post("/history/restore")
def restore_version(
    history_id: int,
    db: Session = Depends(get_db),
    role: str = Depends(get_admin_role),
):
    h = db.query(VersionHistory).filter(VersionHistory.id == history_id).first()
    if not h:
        raise HTTPException(status_code=404, detail="History state not found")

    data = h.data

    if h.entity_type == "site_content":
        item = db.query(SiteContent).filter(SiteContent.key == h.entity_id).first()
        if item:
            item.draft_value = data.get("draft_value")
            item.value = data.get("value")
            db.commit()
            return {"status": "restored", "type": h.entity_type}

    elif h.entity_type == "package":
        pkg = db.query(Package).filter(Package.id == int(h.entity_id)).first()
        if pkg:
            pkg.title = data.get("title", pkg.title)
            pkg.destination = data.get("destination", pkg.destination)
            pkg.price = data.get("price", pkg.price)
            pkg.duration = data.get("duration", pkg.duration)
            pkg.image = data.get("image", pkg.image)
            pkg.bullets = data.get("bullets", pkg.bullets)
            pkg.tags = data.get("tags", pkg.tags)
            pkg.categories = data.get("categories", pkg.categories)
            pkg.tour_types = data.get("tour_types", pkg.tour_types)
            pkg.popular_filters = data.get("popular_filters", pkg.popular_filters)
            pkg.highlights = data.get("highlights", pkg.highlights)
            pkg.inclusions = data.get("inclusions", pkg.inclusions)
            pkg.exclusions = data.get("exclusions", pkg.exclusions)
            pkg.stay_transfers = data.get("stay_transfers", pkg.stay_transfers)
            pkg.custom_properties = data.get("custom_properties", pkg.custom_properties or {})
            pkg.draft_title = data.get("draft_title")
            pkg.draft_custom_properties = data.get("draft_custom_properties")
            # Clear draft states on direct restore of history
            pkg.has_draft = False
            db.commit()
            return {"status": "restored", "type": h.entity_type}

    elif h.entity_type == "offer":
        offer = db.query(Offer).filter(Offer.id == int(h.entity_id)).first()
        if offer:
            offer.title = data.get("title", offer.title)
            offer.subtitle = data.get("subtitle", offer.subtitle)
            offer.description = data.get("description", offer.description)
            offer.badge = data.get("badge", offer.badge)
            offer.badge_type = data.get("badge_type", offer.badge_type)
            offer.image = data.get("image", offer.image)
            offer.cta_label = data.get("cta_label", offer.cta_label)
            offer.draft_title = data.get("draft_title")
            offer.has_draft = False
            db.commit()
            return {"status": "restored", "type": h.entity_type}

    raise HTTPException(status_code=400, detail="Unable to restore")
