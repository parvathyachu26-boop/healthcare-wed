import random
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import timedelta
from pydantic import BaseModel
from typing import Optional

from ..database import get_db
from ..models import User, Patient, MedicalHistory, Doctor
from ..schemas import Token, UserLogin, UserOut
from ..auth import verify_password, create_access_token, get_current_user, get_password_hash
from ..config import settings

router = APIRouter(prefix="/auth", tags=["Authentication"])


# ── Patient Registration Payload ────────────────────────────────────────────
class PatientRegisterPayload(BaseModel):
    full_name: str
    email: str
    username: str
    password: str
    age: int
    sex: str
    date_of_birth: Optional[str] = None
    contact: str
    blood_group: Optional[str] = "O+"
    address: Optional[str] = ""
    emergency_contact: Optional[str] = ""


class DoctorRegisterPayload(BaseModel):
    full_name: str
    email: str
    phone: str
    license_number: str
    specialization: str
    hospital_name: str
    password: str


def _build_token(user: User) -> dict:
    expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    token = create_access_token(
        data={"sub": user.username, "role": user.role, "name": user.full_name},
        expires_delta=expires,
    )
    return {
        "access_token": token,
        "token_type": "bearer",
        "user_id": user.id,
        "username": user.username,
        "full_name": user.full_name,
        "role": user.role,
        "department": user.department or "",
    }


# ── Staff / Doctor Login ─────────────────────────────────────────────────────
@router.post("/login", response_model=Token)
def login(login_data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(
        (User.username == login_data.username) | (User.email == login_data.username)
    ).first()
    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password",
        )
    return _build_token(user)


# ── Patient Portal Login ─────────────────────────────────────────────────────
@router.post("/patient/login", response_model=Token)
def patient_login(login_data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(
        (User.username == login_data.username) | (User.email == login_data.username),
        User.role == "patient",
    ).first()
    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid patient credentials",
        )
    return _build_token(user)


@router.post("/doctor/register", response_model=Token, status_code=201)
def doctor_register(payload: DoctorRegisterPayload, db: Session = Depends(get_db)):
    email = payload.email.strip().lower()
    if db.query(User).filter(User.email == email).first():
        raise HTTPException(status_code=409, detail="Email already registered")
    if len(payload.password) < 8:
        raise HTTPException(status_code=422, detail="Password must be at least 8 characters")

    base_username = email.split("@", 1)[0].replace(" ", ".")[:40] or "doctor"
    username = base_username
    while db.query(User).filter(User.username == username).first():
        username = f"{base_username}.{random.randint(1000, 9999)}"

    user = User(
        username=username,
        email=email,
        hashed_password=get_password_hash(payload.password),
        full_name=payload.full_name.strip(),
        role="doctor",
        department=payload.specialization.strip(),
        license_number=payload.license_number.strip(),
    )
    db.add(user)
    db.flush()
    doctor = Doctor(
        user_id=user.id,
        full_name=payload.full_name.strip(),
        specialty=payload.specialization.strip(),
        contact=payload.phone.strip(),
        hospital_name=payload.hospital_name.strip(),
    )
    db.add(doctor)
    db.commit()
    return _build_token(user)


# ── Patient Self-Registration ────────────────────────────────────────────────
@router.post("/patient/register", response_model=Token, status_code=201)
def patient_register(payload: PatientRegisterPayload, db: Session = Depends(get_db)):
    # Duplicate checks
    if db.query(User).filter(User.username == payload.username).first():
        raise HTTPException(status_code=409, detail="Username already taken")
    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(status_code=409, detail="Email already registered")

    # Create user account
    new_user = User(
        username=payload.username,
        email=payload.email,
        hashed_password=get_password_hash(payload.password),
        full_name=payload.full_name,
        role="patient",
        department="Patient Portal",
    )
    db.add(new_user)
    db.flush()  # get new_user.id before commit

    # Generate unique MRN
    while True:
        mrn = f"PAT-{random.randint(10000, 99999)}"
        if not db.query(Patient).filter(Patient.mrn == mrn).first():
            break

    # Create linked patient record
    patient = Patient(
        user_id=new_user.id,
        mrn=mrn,
        name=payload.full_name,
        age=payload.age,
        sex=payload.sex,
        date_of_birth=payload.date_of_birth,
        contact=payload.contact,
        email=payload.email,
        blood_group=payload.blood_group or "O+",
        address=payload.address or "",
        emergency_contact=payload.emergency_contact or "",
        intake_status="pending",
    )
    db.add(patient)
    db.flush()

    # Create blank medical history record
    history = MedicalHistory(
        patient_id=patient.id,
        previous_diseases="None",
        previous_surgeries="None",
        chronic_conditions="None",
        family_history="No known significant family history",
        previous_relevant_episodes="None",
    )
    db.add(history)
    db.commit()

    return _build_token(new_user)


# ── Who am I? ────────────────────────────────────────────────────────────────
@router.get("/me", response_model=UserOut)
def get_current_user_profile(current_user: User = Depends(get_current_user)):
    return current_user


# ── Get linked patient id for logged-in patient user ────────────────────────
@router.get("/patient/my-record")
def get_my_patient_record(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != "patient":
        raise HTTPException(status_code=403, detail="Not a patient account")
    patient = db.query(Patient).filter(Patient.user_id == current_user.id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient record not found")
    return {"patient_id": patient.id, "mrn": patient.mrn, "name": patient.name, "intake_status": patient.intake_status}


# ── 1-click Demo Login ────────────────────────────────────────────────────────
@router.post("/demo-login/{role}", response_model=Token)
def demo_role_login(role: str, db: Session = Depends(get_db)):
    username_map = {
        "doctor": "dr.patel",
        "doctor2": "dr.jenkins",
        "receptionist": "receptionist",
        "admin": "admin",
        "patient": "patient.akhil",
    }
    username = username_map.get(role.lower(), "dr.patel")
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="Demo user account not found")
    return _build_token(user)
