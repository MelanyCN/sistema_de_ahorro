"""
Schemas Pydantic: Usuario
"""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field, validator


class UsuarioBase(BaseModel):
    nombre: str = Field(..., min_length=1, max_length=100)
    apellido: str = Field(..., min_length=1, max_length=100)
    email: EmailStr
    edad: Optional[int] = Field(None, ge=16, le=100)
    ingreso_mensual: Optional[float] = Field(0.0, ge=0)


class UsuarioCreate(UsuarioBase):
    password: str = Field(..., min_length=6, max_length=100)
    password_confirm: str

    @validator("password_confirm")
    def passwords_match(cls, v, values):
        if "password" in values and v != values["password"]:
            raise ValueError("Las contraseñas no coinciden")
        return v


class UsuarioUpdate(BaseModel):
    nombre: Optional[str] = Field(None, min_length=1, max_length=100)
    apellido: Optional[str] = Field(None, min_length=1, max_length=100)
    edad: Optional[int] = Field(None, ge=16, le=100)
    ingreso_mensual: Optional[float] = Field(None, ge=0)


class UsuarioChangePassword(BaseModel):
    password_actual: str
    password_nuevo: str = Field(..., min_length=6)
    password_confirm: str

    @validator("password_confirm")
    def passwords_match(cls, v, values):
        if "password_nuevo" in values and v != values["password_nuevo"]:
            raise ValueError("Las contraseñas no coinciden")
        return v


class UsuarioInDB(UsuarioBase):
    id: int
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class UsuarioResponse(UsuarioBase):
    id: int
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True
