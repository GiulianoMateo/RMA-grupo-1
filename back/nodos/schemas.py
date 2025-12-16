from typing import List, Optional
from pydantic import BaseModel
from ..paquete.schemas import PaqueteOut as PaqueteSchema


class NodoBase(BaseModel):
    identificador: str
    porcentajeBateria: int
    latitud: Optional[float]
    longitud: Optional[float]
    descripcion: Optional[str]
    tipos: Optional[List[int]] = None 
    is_active: Optional[bool] = True


class NodoCreate(NodoBase):
    pass


class NodoUpdate(NodoBase):
    pass


class NodoOut(NodoBase):
    id: int
    latitud: Optional[float]
    longitud: Optional[float]
    model_config = {"from_attributes": True}


class DeleteResponseSchema(BaseModel):
    detail: str
    model_config = {"from_attributes": True}


class NodoConPaquetes(NodoOut):
    paquetes: List[PaqueteSchema]
