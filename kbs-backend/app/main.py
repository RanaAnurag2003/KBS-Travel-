from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware

from app.config import settings
from app.routers import enquiries, offers, packages, subscribers, cms, excel_import, faqs
from app.cache import global_cache

app = FastAPI(title="KBS Travels API", version="0.1.0")

# GZip compression
app.add_middleware(GZipMiddleware, minimum_size=1000)

# Clear cache on successful write operations
@app.middleware("http")
async def clear_cache_on_write(request: Request, call_next):
    response = await call_next(request)
    if request.method in ["POST", "PUT", "DELETE"] and response.status_code < 400:
        global_cache.clear()
    return response

# CORS: without this, your React app (running on a different port/origin)
# would be blocked by the browser from calling this API at all.
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(packages.router)
app.include_router(enquiries.router)
app.include_router(subscribers.router)
app.include_router(offers.router)
app.include_router(cms.router)
app.include_router(excel_import.router)
app.include_router(faqs.router)





@app.get("/health")
def health():
    return {"status": "ok"}