from datetime import datetime
from typing import Optional, List

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from ..auth.dependencies import permiso_requerido
from ..database import get_db
from ..paquete import schemas, services

router = APIRouter()


# ==========================
# ENDPOINTS PAQUETES
# ==========================

@router.get(
    "/paquetes",
    response_model=schemas.PaqueteResponse,
    tags=["Paquetes"],
    dependencies=[Depends(permiso_requerido("read_paquetes"))],
)
def read_paquetes(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1),
    nodo_id: Optional[int] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    data_min: Optional[float] = None,
    data_max: Optional[float] = None,
    order_by: Optional[str] = None,
    type_id: Optional[int] = None,
    order: str = Query("asc"),
    db: Session = Depends(get_db),
):
    """
    Listar paquetes con filtros y paginación.
    """
    offset = (page - 1) * limit
    result = services.listar_paquetes(
        db,
        limit=limit,
        offset=offset,
        nodo_id=nodo_id,
        start_date=start_date,
        end_date=end_date,
        data_min=data_min,
        data_max=data_max,
        order_by=order_by,
        order=order,
        type_id=type_id,
    )
    return result


@router.get(
    "/paquetesarchivos",
    response_model=schemas.PaqueteArchivoResponse,
    tags=["Paquetes"],
    # dependencies=[Depends(permiso_requerido("read_paquetes_archivos"))],
)
def read_paquetes_archivo(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1),
    nodo_id: Optional[int] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    data_min: Optional[float] = None,
    data_max: Optional[float] = None,
    order_by: Optional[str] = None,
    type_id: Optional[int] = None,
    order: str = Query("asc"),
    db: Session = Depends(get_db),
):
    """
    Listar paquetes archivados con filtros y paginación.
    """
    offset = (page - 1) * limit
    result = services.listar_paquetes_archivo(
        db,
        limit=limit,
        offset=offset,
        nodo_id=nodo_id,
        start_date=start_date,
        end_date=end_date,
        data_min=data_min,
        data_max=data_max,
        order_by=order_by,
        order=order,
        type_id=type_id,
    )
    return result


# ==========================
# ENDPOINTS TIPOS
# ==========================

@router.get(
    "/tipos",
    response_model=List[schemas.TipoOut],
    tags=["Tipos"]
)
def read_tipos(db: Session = Depends(get_db)):
    """
    Obtener todos los tipos de datos.
    """
    tipos = services.listar_tipos(db)
    return tipos


@router.get(
    "/tipos/{id}",
    response_model=schemas.TipoOut,
    tags=["Tipos"]
)
def read_tipo(id: int, db: Session = Depends(get_db)):
    """
    Obtener un tipo de dato específico por id.
    """
    return services.get_tipo(db=db, tipo_id=id)
