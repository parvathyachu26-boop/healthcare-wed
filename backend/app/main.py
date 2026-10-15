from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import inspect, text
import logging

from .config import settings
from .database import engine, Base, SessionLocal
from .seeds import seed_database
from .routes import (
    auth_routes,
    patients_routes,
    ai_routes,
    reports_routes,
    consultations_routes,
    analytics_routes,
    audit_routes,
    handoff_routes,
    followups_routes,
    patient_portal_routes
)

# Initialize database schema
Base.metadata.create_all(bind=engine)

# Add the doctor clinic field to databases created by earlier versions.
if "hospital_name" not in {column["name"] for column in inspect(engine).get_columns("doctors")}:
    with engine.begin() as connection:
        connection.execute(text("ALTER TABLE doctors ADD COLUMN hospital_name VARCHAR(150) DEFAULT ''"))

# Seed database on start
db = SessionLocal()
try:
    seed_database(db)
finally:
    db.close()

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="MediAssist AI — Clinical Decision Support System for Doctors. AI prepares. Doctors decide.",
    version="2.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Friendly error handling per Section 27
@app.exception_handler(Exception)
async def custom_exception_handler(request: Request, exc: Exception):
    logging.error(f"Clinical CDSS Exception on {request.url}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": True,
            "message": "Something went wrong while loading the patient record. Please try again.",
            "type": "ClinicalSystemNotice"
        }
    )

# Include API Routers
api_v1 = settings.API_V1_STR
app.include_router(auth_routes.router, prefix=api_v1)
app.include_router(patients_routes.router, prefix=api_v1)
app.include_router(ai_routes.router, prefix=api_v1)
app.include_router(reports_routes.router, prefix=api_v1)
app.include_router(consultations_routes.router, prefix=api_v1)
app.include_router(analytics_routes.router, prefix=api_v1)
app.include_router(audit_routes.router, prefix=api_v1)
app.include_router(handoff_routes.router, prefix=api_v1)
app.include_router(followups_routes.router, prefix=api_v1)
app.include_router(patient_portal_routes.router, prefix=api_v1)

@app.get("/")
def root():
    return {
        "system": "MediAssist AI - Clinical Decision Support System",
        "status": "Operational",
        "philosophy": "AI prepares. Doctors decide.",
        "compliance": "HIPAA & Clinical Decision Support Prototype Guidelines",
        "version": "2.0.0"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "MediAssist Backend API"}
