from datetime import datetime
from math import ceil
from typing import Optional, List

from sqlalchemy import func
from sqlalchemy.orm import Session

from . import schemas
from .models import Paquete, PaqueteArchivo, PaqueteRechazado, Tipo

# -------------------------------
# Función auxiliar para filtros y orden
# -------------------------------
def aplicar_filtros_y_orden(
    query,
    Model,
    nodo_id: Optional[int] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    data_min: Optional[float] = None,
    data_max: Optional[float] = None,
    order_by: Optional[str] = None,
    order: str = "asc",
    type_id: Optional[int] = None,
):
    # Filtros
    if type_id is not None:
        query = query.filter(Model.type_id == type_id)
    if nodo_id is not None:
        query = query.filter(Model.nodo_id == nodo_id)
    if start_date and end_date:
        query = query.filter(func.date(Model.timestamp).between(start_date.date(), end_date.date()))
    elif start_date:
        query = query.filter(func.date(Model.timestamp) == start_date.date())
    if data_min is not None:
        query = query.filter(Model.data >= data_min)
    if data_max is not None:
        query = query.filter(Model.data <= data_max)

    # Orden dinámico (solo si la columna existe)
    if order_by and hasattr(Model, order_by):
        column = getattr(Model, order_by)
        query = query.order_by(column.desc() if order.lower() == "desc" else column)

    return query

# -------------------------------
# Listar Paquetes
# -------------------------------
def listar_paquetes(
    db: Session,
    limit: Optional[int] = None,
    offset: int = 0,
    nodo_id: Optional[int] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    data_min: Optional[float] = None,
    data_max: Optional[float] = None,
    order_by: Optional[str] = None,
    order: str = "asc",
    type_id: Optional[int] = None,
) -> schemas.PaqueteResponse:
    query = db.query(Paquete)
    query = aplicar_filtros_y_orden(
        query, Paquete, nodo_id, start_date, end_date, data_min, data_max, order_by, order, type_id
    )

    # Paginación
    total_items = query.count()
    if not limit or limit <= 0:
        limit = total_items
    items = query.offset(offset).limit(limit).all()
    total_pages = ceil(total_items / limit) if limit > 0 else 1
    current_page = (offset // limit) + 1 if limit > 0 else 1

    return schemas.PaqueteResponse(
        info=schemas.PaginationInfo(
            total_items=total_items,
            total_pages=total_pages,
            current_page=current_page,
            limit=limit,
            offset=offset,
        ),
        items=[schemas.PaqueteOut.model_validate(p, from_attributes=True) for p in items],
    )

# -------------------------------
# Listar Paquetes Archivo
# -------------------------------
def listar_paquetes_archivo(
    db: Session,
    limit: Optional[int] = None,
    offset: int = 0,
    nodo_id: Optional[int] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    data_min: Optional[float] = None,
    data_max: Optional[float] = None,
    order_by: Optional[str] = None,
    order: str = "asc",
    type_id: Optional[int] = None,
) -> schemas.PaqueteArchivoResponse:
    query = db.query(PaqueteArchivo)
    query = aplicar_filtros_y_orden(
        query, PaqueteArchivo, nodo_id, start_date, end_date, data_min, data_max, order_by, order, type_id
    )

    # Paginación
    total_items = query.count()
    if not limit or limit <= 0:
        limit = total_items
    items = query.offset(offset).limit(limit).all()
    total_pages = ceil(total_items / limit) if limit > 0 else 1
    current_page = (offset // limit) + 1 if limit > 0 else 1

    return schemas.PaqueteArchivoResponse(
        info=schemas.PaginationInfo(
            total_items=total_items,
            total_pages=total_pages,
            current_page=current_page,
            limit=limit,
            offset=offset,
        ),
        items=[schemas.PaqueteArchivoOut.model_validate(p, from_attributes=True) for p in items],
    )



def crear_paquete(db: Session, paquete: schemas.PaqueteCreate) -> schemas.PaqueteCreate:
    """
    Crea un paquete válido en la base de datos.
    """
    nuevo_paquete = Paquete(**paquete.model_dump())
    db.add(nuevo_paquete)
    db.commit()
    db.refresh(nuevo_paquete)
    return schemas.PaqueteCreate.model_validate(nuevo_paquete)

def crear_paquete_rechazado(db: Session, paquete: schemas.PaqueteRechazadoOut) -> schemas.PaqueteRechazadoOut:
    """
    Guarda un paquete rechazado por error o validación.
    """
    nuevo = PaqueteRechazado(**paquete.model_dump())
    db.add(nuevo)
    db.commit()
    db.refresh(nuevo)
    return schemas.PaqueteRechazadoOut.model_validate(nuevo)


def crear_tipo(db: Session, tipo: schemas.TipoCreate) -> Tipo:
    return Tipo.create(db, tipo)