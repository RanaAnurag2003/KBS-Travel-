from sqlalchemy import Boolean, Column, ForeignKey, Integer, Numeric, Text, text, JSON, TIMESTAMP, String
from sqlalchemy.orm import relationship

from app.database import Base


class Package(Base):
    __tablename__ = "packages"

    id = Column(Integer, primary_key=True)
    slug = Column(String(255), unique=True, nullable=False)
    title = Column(Text, nullable=False)
    destination = Column(Text, nullable=False)
    price = Column(Integer, nullable=False)
    duration = Column(Text, nullable=False)
    image = Column(Text, nullable=False)
    rating = Column(Numeric(2, 1), nullable=False, default=0)
    rating_label = Column(Text)
    reviews = Column(Integer, nullable=False, default=0)
    stars = Column(Integer, nullable=False, default=0)
    bullets = Column(JSON, nullable=False)
    tags = Column(JSON, nullable=False)
    categories = Column(JSON, nullable=False)
    tour_types = Column(JSON, nullable=False)
    popular_filters = Column(JSON, nullable=False)
    highlights = Column(JSON, nullable=False)
    inclusions = Column(JSON, nullable=False)
    exclusions = Column(JSON, nullable=False)
    stay_transfers = Column(Text)
    is_active = Column(Boolean, nullable=False, default=True, index=True)
    created_at = Column(TIMESTAMP(timezone=True), server_default=text("now()"))
    updated_at = Column(TIMESTAMP(timezone=True), server_default=text("now()"))

    # Draft Fields
    draft_title = Column(Text)
    draft_destination = Column(Text)
    draft_price = Column(Integer)
    draft_duration = Column(Text)
    draft_image = Column(Text)
    draft_bullets = Column(JSON)
    draft_tags = Column(JSON)
    draft_categories = Column(JSON)
    draft_tour_types = Column(JSON)
    draft_popular_filters = Column(JSON)
    draft_highlights = Column(JSON)
    draft_inclusions = Column(JSON)
    draft_exclusions = Column(JSON)
    draft_stay_transfers = Column(Text)
    has_draft = Column(Boolean, nullable=False, default=False, server_default="0")
    is_published = Column(Boolean, nullable=False, default=True, server_default="1")
    custom_properties = Column(JSON, nullable=False, default=dict)
    draft_custom_properties = Column(JSON)

    enquiries = relationship("Enquiry", back_populates="package")


class Enquiry(Base):
    __tablename__ = "enquiries"

    id = Column(Integer, primary_key=True)
    type = Column(Text, nullable=False)
    name = Column(Text, nullable=False)
    phone = Column(Text, nullable=False)
    package_id = Column(Integer, ForeignKey("packages.id", ondelete="SET NULL"))
    package_title_snapshot = Column(Text)
    source = Column(Text, nullable=False, default="unknown")
    message = Column(Text)
    status = Column(Text, nullable=False, default="new")
    created_at = Column(TIMESTAMP(timezone=True), server_default=text("now()"))

    package = relationship("Package", back_populates="enquiries")


class Subscriber(Base):
    __tablename__ = "subscribers"

    id = Column(Integer, primary_key=True)
    email = Column(String(255), unique=True, nullable=False)
    subscribed_at = Column(TIMESTAMP(timezone=True), server_default=text("now()"))
    is_active = Column(Boolean, nullable=False, default=True)


class Offer(Base):
    __tablename__ = "offers"

    id = Column(Integer, primary_key=True)
    title = Column(Text, nullable=False)
    subtitle = Column(Text)
    description = Column(Text)
    badge = Column(Text)
    badge_type = Column(Text)
    image = Column(Text)
    cta_label = Column(Text, nullable=False, default="Book Now")
    is_active = Column(Boolean, nullable=False, default=True, index=True)
    sort_order = Column(Integer, nullable=False, default=0)
    created_at = Column(TIMESTAMP(timezone=True), server_default=text("now()"))

    # Draft Fields
    draft_title = Column(Text)
    draft_subtitle = Column(Text)
    draft_description = Column(Text)
    draft_badge = Column(Text)
    draft_badge_type = Column(Text)
    draft_image = Column(Text)
    draft_cta_label = Column(Text)
    has_draft = Column(Boolean, nullable=False, default=False, server_default="0")
    is_published = Column(Boolean, nullable=False, default=True, server_default="1")


class SiteContent(Base):
    __tablename__ = "site_content"

    key = Column(String(255), primary_key=True)
    value = Column(Text)
    draft_value = Column(Text)
    updated_at = Column(TIMESTAMP(timezone=True), server_default=text("now()"))


class VersionHistory(Base):
    __tablename__ = "version_history"

    id = Column(Integer, primary_key=True, autoincrement=True)
    entity_type = Column(Text, nullable=False)  # 'site_content', 'package', 'offer'
    entity_id = Column(Text, nullable=False)
    data = Column(JSON, nullable=False)
    editor_name = Column(Text)
    created_at = Column(TIMESTAMP(timezone=True), server_default=text("now()"))


class ImportHistory(Base):
    __tablename__ = "import_history"

    id = Column(Integer, primary_key=True, autoincrement=True)
    file_name = Column(Text, nullable=False)
    uploaded_by = Column(Text, nullable=False)
    total_rows = Column(Integer, nullable=False, default=0)
    imported = Column(Integer, nullable=False, default=0)
    updated = Column(Integer, nullable=False, default=0)
    failed = Column(Integer, nullable=False, default=0)
    status = Column(Text, nullable=False, default="success")  # "success", "partial_success", "failed"
    logs = Column(JSON, nullable=False, default=list)
    failed_rows_json = Column(JSON, nullable=True)
    created_at = Column(TIMESTAMP(timezone=True), server_default=text("now()"))


class FAQ(Base):
    __tablename__ = "faqs"

    id = Column(Integer, primary_key=True)
    destination_name = Column(Text, nullable=False)
    question = Column(Text, nullable=False)
    answer = Column(Text, nullable=False)
    display_order = Column(Integer, nullable=False, default=0)
    is_active = Column(Boolean, nullable=False, default=True, index=True)
    created_at = Column(TIMESTAMP(timezone=True), server_default=text("now()"))
    updated_at = Column(TIMESTAMP(timezone=True), server_default=text("now()"))
    created_by = Column(Text)
    updated_by = Column(Text)