from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Header, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field

from app.database import get_db
from app.models import FAQ
from app.schemas import FAQOut, FAQCreate, FAQUpdate, FAQReorderRequest

router = APIRouter(prefix="/api/faqs", tags=["faqs"])

# Helper dependency to authenticate admin
def get_admin_role(x_api_key: str = Header(None, alias="X-API-Key")) -> str:
    from app.config import settings
    if not x_api_key or x_api_key != settings.admin_api_key:
        raise HTTPException(status_code=401, detail="Unauthorized: Invalid admin key")
    return "Admin"

class FAQCopyRequest(BaseModel):
    from_destination: str = Field(alias="fromDestination")
    to_destination: str = Field(alias="toDestination")

@router.get("", response_model=List[FAQOut])
def list_all_faqs(
    destination: Optional[str] = Query(default=None),
    db: Session = Depends(get_db)
):
    query = db.query(FAQ)
    if destination:
        query = query.filter(FAQ.destination_name.like(destination))
    return query.order_by(FAQ.display_order).all()

@router.get("/{destination}", response_model=List[FAQOut])
def get_destination_faqs(destination: str, db: Session = Depends(get_db)):
    # Try fetching destination-specific active FAQs
    faqs = (
        db.query(FAQ)
        .filter(FAQ.destination_name.like(destination), FAQ.is_active.is_(True))
        .order_by(FAQ.display_order)
        .all()
    )
    # Fallback to default/global if empty
    if not faqs:
        faqs = (
            db.query(FAQ)
            .filter(FAQ.destination_name.like("default"), FAQ.is_active.is_(True))
            .order_by(FAQ.display_order)
            .all()
        )
    if not faqs:
        faqs = (
            db.query(FAQ)
            .filter(FAQ.destination_name.like("global"), FAQ.is_active.is_(True))
            .order_by(FAQ.display_order)
            .all()
        )
    return faqs

@router.post("", response_model=FAQOut)
def create_faq(
    payload: FAQCreate,
    db: Session = Depends(get_db),
    role: str = Depends(get_admin_role),
    editor_name: str = Header("Admin", alias="X-Editor-Name")
):
    faq = FAQ(
        destination_name=payload.destination_name,
        question=payload.question,
        answer=payload.answer,
        display_order=payload.display_order or 0,
        is_active=payload.is_active if payload.is_active is not None else True,
        created_by=editor_name,
        updated_by=editor_name
    )
    db.add(faq)
    db.commit()
    db.refresh(faq)
    return faq

@router.put("/reorder")
def reorder_faqs(
    payload: FAQReorderRequest,
    db: Session = Depends(get_db),
    role: str = Depends(get_admin_role)
):
    for item in payload.items:
        db.query(FAQ).filter(FAQ.id == item.id).update(
            {"display_order": item.display_order, "updated_at": datetime.now()}
        )
    db.commit()
    return {"status": "success", "message": "FAQs reordered successfully"}

@router.post("/copy")
def copy_faqs(
    payload: FAQCopyRequest,
    db: Session = Depends(get_db),
    role: str = Depends(get_admin_role),
    editor_name: str = Header("Admin", alias="X-Editor-Name")
):
    source_faqs = (
        db.query(FAQ)
        .filter(FAQ.destination_name.like(payload.from_destination))
        .all()
    )
    if not source_faqs:
        raise HTTPException(
            status_code=404, 
            detail=f"No FAQs found for source destination '{payload.from_destination}'"
        )
    
    copied_count = 0
    for src in source_faqs:
        new_faq = FAQ(
            destination_name=payload.to_destination,
            question=src.question,
            answer=src.answer,
            display_order=src.display_order,
            is_active=src.is_active,
            created_by=editor_name,
            updated_by=editor_name
        )
        db.add(new_faq)
        copied_count += 1
        
    db.commit()
    return {"status": "success", "message": f"Copied {copied_count} FAQs to '{payload.to_destination}'"}

@router.put("/{faq_id}", response_model=FAQOut)
def update_faq(
    faq_id: int,
    payload: FAQUpdate,
    db: Session = Depends(get_db),
    role: str = Depends(get_admin_role),
    editor_name: str = Header("Admin", alias="X-Editor-Name")
):
    faq = db.query(FAQ).filter(FAQ.id == faq_id).first()
    if not faq:
        raise HTTPException(status_code=404, detail="FAQ not found")
        
    if payload.destination_name is not None:
        faq.destination_name = payload.destination_name
    if payload.question is not None:
        faq.question = payload.question
    if payload.answer is not None:
        faq.answer = payload.answer
    if payload.display_order is not None:
        faq.display_order = payload.display_order
    if payload.is_active is not None:
        faq.is_active = payload.is_active
        
    faq.updated_by = editor_name
    faq.updated_at = datetime.now()
    
    db.commit()
    db.refresh(faq)
    return faq

@router.delete("/{faq_id}")
def delete_faq(
    faq_id: int,
    db: Session = Depends(get_db),
    role: str = Depends(get_admin_role)
):
    faq = db.query(FAQ).filter(FAQ.id == faq_id).first()
    if not faq:
        raise HTTPException(status_code=404, detail="FAQ not found")
    db.delete(faq)
    db.commit()
    return {"status": "success", "message": f"FAQ {faq_id} deleted successfully"}


# ---------------------------------------------------------------------------
# Excel Import for FAQs
# ---------------------------------------------------------------------------
import io
import openpyxl
from fastapi import UploadFile, File
from typing import Any, Dict

FAQ_REQUIRED_COLUMNS = ["question", "answer", "destination_name"]
FAQ_COLUMN_MAPPING = {
    "question": ["question", "q", "query", "faq question", "faq_question"],
    "answer": ["answer", "a", "response", "solution", "faq answer", "faq_answer"],
    "destination_name": ["destination", "destination_name", "location", "dest", "destinationname", "destination name"],
    "display_order": ["display_order", "displayorder", "order", "sort_order", "sortorder", "display order"],
    "is_active": ["active", "is_active", "isactive", "status", "active toggle"]
}

def clean_header(val: Any) -> str:
    if not val:
        return ""
    return str(val).strip().lower()

@router.post("/excel/validate")
def validate_faq_excel(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    role: str = Depends(get_admin_role)
):
    if not file.filename.endswith(('.xlsx', '.xls')):
        raise HTTPException(status_code=400, detail="Invalid file type. Only Excel files (.xlsx, .xls) are allowed.")

    try:
        contents = file.file.read()
        wb = openpyxl.load_workbook(io.BytesIO(contents), data_only=True)
        sheet = wb.active
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to read Excel file: {str(e)}")

    rows = list(sheet.iter_rows(values_only=True))
    if not rows:
        raise HTTPException(status_code=400, detail="Excel sheet is empty.")

    header_row = rows[0]
    headers_dict = {}
    
    for idx, cell in enumerate(header_row):
        if cell is None:
            continue
        cleaned = clean_header(cell)
        matched = False
        for field, aliases in FAQ_COLUMN_MAPPING.items():
            if cleaned in aliases:
                headers_dict[field] = idx
                matched = True
                break
        if not matched:
            headers_dict[cleaned] = idx

    missing_required = [col for col in FAQ_REQUIRED_COLUMNS if col not in headers_dict]
    if missing_required:
        return {
            "valid": False,
            "errors": [f"Missing required columns: {', '.join(missing_required)}. Ensure sheet has Question, Answer and Destination headers."],
            "total_rows": 0,
            "preview_rows": [],
            "failed_rows_json": []
        }

    preview_rows = []
    errors = []
    failed_rows = []

    for r_idx, row in enumerate(rows[1:], start=2):
        if not any(cell is not None for cell in row):
            continue

        row_errors = []

        def get_val(field: str, default: Any = None) -> Any:
            if field in headers_dict:
                idx = headers_dict[field]
                if idx < len(row):
                    return row[idx]
            return default

        question = get_val("question")
        answer = get_val("answer")
        destination_name = get_val("destination_name")
        display_order_val = get_val("display_order", 0)
        is_active_val = get_val("is_active", True)

        if not question:
            row_errors.append("Question is required.")
        if not answer:
            row_errors.append("Answer is required.")
        if not destination_name:
            row_errors.append("Destination is required.")

        display_order = 0
        try:
            display_order = int(float(str(display_order_val).strip())) if display_order_val is not None else 0
        except ValueError:
            row_errors.append(f"Display order must be a number (got '{display_order_val}').")

        is_active = True
        if is_active_val is not None:
            val_str = str(is_active_val).strip().lower()
            if val_str in ["false", "0", "n", "no", "inactive"]:
                is_active = False

        parsed_data = {
            "question": str(question) if question else "",
            "answer": str(answer) if answer else "",
            "destinationName": str(destination_name) if destination_name else "",
            "displayOrder": display_order,
            "isActive": is_active
        }

        if row_errors:
            failed_rows.append({
                "row_number": r_idx,
                "data": {str(header_row[i]): row[i] for i in range(len(row)) if i < len(header_row)},
                "errors": row_errors
            })
            errors.append(f"Row {r_idx}: {'; '.join(row_errors)}")
        else:
            parsed_data["rowNumber"] = r_idx
            preview_rows.append(parsed_data)

    return {
        "valid": len(failed_rows) == 0,
        "total_rows": len(rows) - 1,
        "preview_rows": preview_rows,
        "failed_rows_json": failed_rows,
        "errors": errors
    }

@router.post("/excel/confirm")
def confirm_faq_excel_import(
    payload: Dict[str, Any],
    db: Session = Depends(get_db),
    role: str = Depends(get_admin_role),
    editor_name: str = Header("Admin", alias="X-Editor-Name")
):
    preview_rows = payload.get("preview_rows", [])
    
    imported_count = 0
    for row in preview_rows:
        faq = FAQ(
            destination_name=row["destinationName"],
            question=row["question"],
            answer=row["answer"],
            display_order=row["displayOrder"],
            is_active=row["isActive"],
            created_by=editor_name,
            updated_by=editor_name
        )
        db.add(faq)
        imported_count += 1
        
    db.commit()
    return {
        "status": "success",
        "imported": imported_count,
        "message": f"Successfully imported {imported_count} FAQs."
    }

