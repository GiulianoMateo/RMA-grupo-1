from datetime import datetime, timedelta
from typing import List

from fastapi import HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import select, delete

from ..paquete.models import Paquete, PaqueteArchivo, Tipo
from .models import Nodo
from .schemas import NodoOut as NodoSchema
from .schemas import NodoCreate, NodoUpdate


# --------------------------------------------------
# CREAR NODO
# --------------------------------------------------
def crear_nodo(db: Session, nodo_data: NodoCreate, tipos_ids: List[int]) -> Nodo:
    nodo = Nodo(**nodo_data.model_dump(exclude={"tipos"}))

    if tipos_ids:
        tipos = db.query(Tipo).filter(Tipo.id.in_(tipos_ids)).all()
        nodo.tipos.extend(tipos)

    db.add(nodo)
    db.commit()
    db.refresh(nodo)
    return nodo


# --------------------------------------------------
# LISTADOS
# --------------------------------------------------
def listar_nodos(db: Session) -> List[Nodo]:
    return Nodo.filter(db, is_active=True)


def listar_nodos_inactivos(db: Session) -> List[Nodo]:
    return Nodo.filter(db, is_active=False)


# --------------------------------------------------
# OBTENER NODO
# --------------------------------------------------
def get_nodo(db: Session, nodo_id: int) -> NodoSchema:
    nodo = Nodo.get(db, nodo_id)

    if not nodo:
        raise HTTPException(status_code=404, detail="Nodo no encontrado")

    if not nodo.is_active:
        raise HTTPException(status_code=400, detail="Nodo inactivo")

    return NodoSchema(
        id=nodo.id,
        identificador=nodo.identificador,
        porcentajeBateria=nodo.porcentajeBateria,
        latitud=nodo.latitud,
        longitud=nodo.longitud,
        descripcion=nodo.descripcion,
        tipos=[tipo.id for tipo in nodo.tipos],
    )


# --------------------------------------------------
# MODIFICAR NODO 
# --------------------------------------------------
def modificar_nodo(db: Session, nodo_id: int, nodo_actualizado: NodoUpdate) -> Nodo:
    nodo = Nodo.get(db, nodo_id)

    if not nodo:
        raise HTTPException(status_code=404, detail="Nodo no encontrado")

    data = nodo_actualizado.model_dump(exclude_unset=True)

    # 1️⃣ Actualizar campos simples
    for field in ["identificador", "descripcion", "latitud", "longitud", "porcentajeBateria"]:
        if field in data:
            setattr(nodo, field, data[field])

    # 2️⃣ Actualizar tipos (relación)
    if "tipos" in data and data["tipos"] is not None:
        tipos = db.query(Tipo).filter(Tipo.id.in_(data["tipos"])).all()
        nodo.tipos.clear()
        nodo.tipos.extend(tipos)

    db.commit()
    db.refresh(nodo)
    return nodo


# --------------------------------------------------
# ARCHIVAR NODO
# --------------------------------------------------
def archivar_y_eliminar_nodo(db: Session, nodo_id: int) -> dict:
    paquetes = Paquete.filter(db, nodo_id=nodo_id)
    paquetes_archivo = [PaqueteArchivo.from_paquete(p) for p in paquetes]

    db.bulk_save_objects(paquetes_archivo)

    subquery = select(Paquete.id).filter(Paquete.nodo_id == nodo_id)
    db.execute(delete(Paquete).where(Paquete.id.in_(subquery)))

    nodo = Nodo.get(db, nodo_id)
    if nodo:
        nodo.is_active = False

    db.commit()
    return {"detail": "Nodo archivado y marcado como inactivo correctamente"}


# --------------------------------------------------
# ACTIVAR NODO
# --------------------------------------------------
def activar_nodo(db: Session, nodo_id: int) -> NodoSchema:
    nodo = Nodo.get(db, nodo_id)

    if not nodo:
        raise HTTPException(status_code=404, detail="Nodo no encontrado")

    nodo.is_active = True
    db.commit()

    return NodoSchema.model_validate(nodo)
