from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel

# ==========================
# SCHEMAS TIPO
# ==========================

class TipoBase(BaseModel):
    """
    Schema base para Tipo.
    Contiene los campos comunes que se usan tanto para creación como para salida.
    """
    data_type: int
    data_symbol: str
    nombre: str
    icon: Optional[str] = None
    color: Optional[str] = None

class TipoCreate(TipoBase):
    """
    Schema para crear un Tipo.
    Hereda de TipoBase.
    """
    pass

class TipoUpdate(BaseModel):
    """
    Schema para actualizar un Tipo.
    Todos los campos son opcionales para permitir updates parciales.
    """
    data_type: Optional[int] = None
    data_symbol: Optional[str] = None
    nombre: Optional[str] = None
    icon: Optional[str] = None
    color: Optional[str] = None

class TipoOut(TipoBase):
    """
    Schema para la salida de Tipo.
    Incluye el id generado por la base de datos.
    """
    id: int
    icon: Optional[str] = None
    color: Optional[str] = None

    class Config:
        orm_mode = True  # Permite convertir objetos SQLAlchemy a JSON


# ==========================
# SCHEMAS PAQUETE
# ==========================

class PaqueteBase(BaseModel):
    """
    Schema base para Paquete.
    Contiene los campos que se comparten entre creación y salida.
    """
    nodo_id: int
    type_id: int
    data: float
    timestamp: Optional[datetime] = None  # Se genera por defecto en la BD

class PaqueteCreate(PaqueteBase):
    """
    Schema para crear un Paquete.
    No incluye id porque lo genera la base de datos.
    """
    pass

class PaqueteOut(PaqueteBase):
    """
    Schema para devolver un Paquete.
    Incluye id y la relación con Tipo para mostrar detalles completos.
    """
    id: int

    class Config:
        orm_mode = True

class PaqueteArchivoOut(PaqueteBase):
    """
    Schema para paquetes que se guardan en archivo.
    Similar a PaqueteOut.
    """
    id: int
    type: TipoOut

    class Config:
        orm_mode = True

class PaqueteRechazadoOut(PaqueteBase):
    """
    Schema para paquetes rechazados.
    Incluye un motivo explicando por qué no fue aceptado.
    """
    id: int
    motivo: str

    class Config:
        orm_mode = True

# ==========================
# PAGINACIÓN
# ==========================

class PaginationInfo(BaseModel):
    """
    Información de paginación para respuestas que retornan listas.
    """
    total_items: int
    total_pages: int
    current_page: int
    limit: int
    offset: int

class PaqueteResponse(BaseModel):
    """
    Respuesta paginada de Paquetes.
    """
    info: PaginationInfo
    items: List[PaqueteOut]

class PaqueteArchivoResponse(BaseModel):
    """
    Respuesta paginada de PaquetesArchivo.
    """
    info: PaginationInfo
    items: List[PaqueteArchivoOut]
