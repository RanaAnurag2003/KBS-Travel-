from datetime import datetime
from typing import Any, Dict, List, Literal, Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field


# ---------------------------------------------------------------------------
# Packages
# ---------------------------------------------------------------------------
class PackageOut(BaseModel):
    """
    Shapes a Package DB row into exactly the JSON your React frontend
    already expects (camelCase field names, matching mockData.js).
    `from_attributes=True` lets this read straight from a SQLAlchemy object
    instead of requiring a plain dict.
    """
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    id: int
    slug: str
    title: str
    destination: str
    price: int
    duration: str
    image: str
    rating: float
    rating_label: Optional[str] = Field(default=None, alias="ratingLabel")
    reviews: int
    stars: int
    bullets: List[str]
    tags: List[str]
    categories: List[str]
    tour_types: List[str] = Field(alias="tourTypes")
    popular_filters: List[str] = Field(alias="popularFilters")
    highlights: List[str]
    inclusions: List[str]
    exclusions: List[str]
    stay_transfers: Optional[str] = Field(default=None, alias="stayTransfers")

    # Draft fields
    draft_title: Optional[str] = Field(default=None, alias="draftTitle")
    draft_destination: Optional[str] = Field(default=None, alias="draftDestination")
    draft_price: Optional[int] = Field(default=None, alias="draftPrice")
    draft_duration: Optional[str] = Field(default=None, alias="draftDuration")
    draft_image: Optional[str] = Field(default=None, alias="draftImage")
    draft_bullets: Optional[List[str]] = Field(default=None, alias="draftBullets")
    draft_tags: Optional[List[str]] = Field(default=None, alias="draftTags")
    draft_categories: Optional[List[str]] = Field(default=None, alias="draftCategories")
    draft_tour_types: Optional[List[str]] = Field(default=None, alias="draftTourTypes")
    draft_popular_filters: Optional[List[str]] = Field(default=None, alias="draftPopularFilters")
    draft_highlights: Optional[List[str]] = Field(default=None, alias="draftHighlights")
    draft_inclusions: Optional[List[str]] = Field(default=None, alias="draftInclusions")
    draft_exclusions: Optional[List[str]] = Field(default=None, alias="draftExclusions")
    draft_stay_transfers: Optional[str] = Field(default=None, alias="draftStayTransfers")
    custom_properties: Optional[Dict[str, Any]] = Field(default=dict, alias="customProperties")
    draft_custom_properties: Optional[Dict[str, Any]] = Field(default=None, alias="draftCustomProperties")
    has_draft: bool = Field(default=False, alias="hasDraft")
    is_published: bool = Field(default=True, alias="isPublished")


class PackageListResponse(BaseModel):
    items: List[PackageOut]
    total: int
    page: int
    page_size: int = Field(alias="pageSize")
    total_pages: int = Field(alias="totalPages")

    model_config = ConfigDict(populate_by_name=True)


class PackageDraftInput(BaseModel):
    title: Optional[str] = None
    destination: Optional[str] = None
    price: Optional[int] = None
    duration: Optional[str] = None
    image: Optional[str] = None
    bullets: Optional[List[str]] = None
    tags: Optional[List[str]] = None
    categories: Optional[List[str]] = None
    tour_types: Optional[List[str]] = Field(default=None, alias="tourTypes")
    popular_filters: Optional[List[str]] = Field(default=None, alias="popularFilters")
    highlights: Optional[List[str]] = None
    inclusions: Optional[List[str]] = None
    exclusions: Optional[List[str]] = None
    stay_transfers: Optional[str] = Field(default=None, alias="stayTransfers")
    custom_properties: Optional[Dict[str, Any]] = Field(default=None, alias="customProperties")

    model_config = ConfigDict(populate_by_name=True)


# ---------------------------------------------------------------------------
# Enquiries (FormModal / SearchBar submissions)
# ---------------------------------------------------------------------------
class EnquiryCreate(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    type: Literal["enquiry", "quote", "book"]
    name: str
    phone: str
    package_id: Optional[int] = Field(default=None, alias="packageId")
    message: Optional[str] = None
    source: str = "unknown"


class EnquiryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    id: int
    type: str
    name: str
    phone: str
    status: str
    created_at: datetime = Field(alias="createdAt")


# ---------------------------------------------------------------------------
# Newsletter subscribers
# ---------------------------------------------------------------------------
class SubscriberCreate(BaseModel):
    email: EmailStr


class SubscriberOut(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    id: int
    email: str
    is_active: bool = Field(alias="isActive")


# ---------------------------------------------------------------------------
# Offers / promo cards
# ---------------------------------------------------------------------------
class OfferOut(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    id: int
    title: str
    subtitle: Optional[str] = None
    description: Optional[str] = None
    badge: Optional[str] = None
    badge_type: Optional[str] = Field(default="default", alias="badgeType")
    image: Optional[str] = None
    cta_label: str = Field(alias="ctaLabel")
    sort_order: int = Field(alias="sortOrder")

    # Draft fields
    draft_title: Optional[str] = Field(default=None, alias="draftTitle")
    draft_subtitle: Optional[str] = Field(default=None, alias="draftSubtitle")
    draft_description: Optional[str] = Field(default=None, alias="draftDescription")
    draft_badge: Optional[str] = Field(default=None, alias="draftBadge")
    draft_badge_type: Optional[str] = Field(default=None, alias="draftBadgeType")
    draft_image: Optional[str] = Field(default=None, alias="draftImage")
    draft_cta_label: Optional[str] = Field(default=None, alias="draftCtaLabel")
    has_draft: bool = Field(default=False, alias="hasDraft")
    is_published: bool = Field(default=True, alias="isPublished")


class OfferDraftInput(BaseModel):
    title: Optional[str] = None
    subtitle: Optional[str] = None
    description: Optional[str] = None
    badge: Optional[str] = None
    badge_type: Optional[str] = Field(default=None, alias="badgeType")
    image: Optional[str] = None
    cta_label: Optional[str] = Field(default=None, alias="ctaLabel")

    model_config = ConfigDict(populate_by_name=True)


# ---------------------------------------------------------------------------
# CMS / Inline Editor General Content
# ---------------------------------------------------------------------------
class SiteContentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    key: str
    value: Optional[str] = None
    draft_value: Optional[str] = Field(default=None, alias="draftValue")
    updated_at: datetime = Field(alias="updatedAt")


class SiteContentInput(BaseModel):
    key: str
    draft_value: str = Field(alias="draftValue")

    model_config = ConfigDict(populate_by_name=True)


class AdminLoginRequest(BaseModel):
    key: str
    role: str = "Admin"


class VersionHistoryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    id: int
    entity_type: str = Field(alias="entityType")
    entity_id: str = Field(alias="entityId")
    data: Dict[str, Any]
    editor_name: Optional[str] = Field(default=None, alias="editorName")
    created_at: datetime = Field(alias="createdAt")


class ImportHistoryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    id: int
    file_name: str = Field(alias="fileName")
    uploaded_by: str = Field(alias="uploadedBy")
    total_rows: int = Field(alias="totalRows")
    imported: int = Field(alias="imported")
    updated: int = Field(alias="updated")
    failed: int = Field(alias="failed")
    status: str
    logs: List[Any]
    created_at: datetime = Field(alias="createdAt")


# ---------------------------------------------------------------------------
# FAQs
# ---------------------------------------------------------------------------
class FAQOut(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    id: int
    destination_name: str = Field(alias="destinationName")
    question: str
    answer: str
    display_order: int = Field(alias="displayOrder")
    is_active: bool = Field(alias="isActive")
    created_at: datetime = Field(alias="createdAt")
    updated_at: datetime = Field(alias="updatedAt")
    created_by: Optional[str] = Field(default=None, alias="createdBy")
    updated_by: Optional[str] = Field(default=None, alias="updatedBy")


class FAQCreate(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    destination_name: str = Field(alias="destinationName")
    question: str
    answer: str
    display_order: Optional[int] = Field(default=0, alias="displayOrder")
    is_active: Optional[bool] = Field(default=True, alias="isActive")


class FAQUpdate(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    destination_name: Optional[str] = Field(default=None, alias="destinationName")
    question: Optional[str] = None
    answer: Optional[str] = None
    display_order: Optional[int] = Field(default=None, alias="displayOrder")
    is_active: Optional[bool] = Field(default=None, alias="isActive")


class FAQReorderItem(BaseModel):
    id: int
    display_order: int = Field(alias="displayOrder")


class FAQReorderRequest(BaseModel):
    items: List[FAQReorderItem]