from datetime import datetime, timedelta
from typing import List

from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session
from sqlalchemy import select, delete
from ..nodos import schemas
from ..paquete.models import Paquete, PaqueteArchivo, Tipo
from .models import Nodo
from .schemas import NodoOut as NodoSchema
from .schemas import NodoCreate, NodoUpdate


def crear_nodo(db: Session, nodo: schemas.NodoCreate) -> Nodo:
    return Nodo.create(db, nodo)


def crear_nodo_usuario(db: Session, nodo_data: NodoCreate, tipos_ids: list[int]):
    # Crear el nodo
    nodo = Nodo(**nodo_data.model_dump())

    # Buscar el tipo Tensión
    tipo_tension = db.query(Tipo).filter(Tipo.nombre == "Tensión").first()
    if tipo_tension:
        nodo.tipos.append(tipo_tension)

    # Agregar los demás tipos que el usuario haya elegido
    if tipos_ids:
        tipos_extra = db.query(Tipo).filter(Tipo.id.in_(tipos_ids)).all()
        nodo.tipos.extend(tipos_extra)

    db.add(nodo)
    db.commit()
    db.refresh(nodo)
    return nodo


def listar_nodos(db: Session) -> List[Nodo]:
    return Nodo.filter(db, is_active=True)


def listar_nodos_inactivos(db: Session) -> List[Nodo]:
    return Nodo.filter(db, is_active=False)


def get_nodo(db: Session, nodo_id: int) -> NodoSchema:
    nodo = Nodo.get(db, nodo_id)

    if not nodo:
        raise HTTPException(status_code=404, detail="Nodo no encontrado")

    if not nodo.is_active:
        raise HTTPException(status_code=400, detail="Nodo inactivo")

    return NodoSchema.model_validate(nodo)


def modificar_nodo(db: Session, nodo_id: int, nodo_actualizado: NodoUpdate) -> Nodo:
    nodo = Nodo.get(db, nodo_id)
    if not nodo:
        raise HTTPException(status_code=404, detail="Nodo no encontrado")
    return nodo.update(db, nodo_actualizado)


def archivar_y_eliminar_nodo(db: Session, nodo_id: int) -> dict:
    paquetes = Paquete.filter(db, nodo_id=nodo_id)
    paquetes_archivo = [PaqueteArchivo.from_paquete(paquete) for paquete in paquetes]
    db.bulk_save_objects(paquetes_archivo)
    subquery = select(Paquete.id).filter(Paquete.nodo_id == nodo_id)
    db.execute(delete(Paquete).where(Paquete.id.in_(subquery)))
    nodo = Nodo.get(db, nodo_id)
    if nodo:
        nodo.is_active = False
        nodo.save(db)
    db.commit()
    return {"detail": "Nodo archivado y marcado como inactivo correctamente"}


def activar_nodo(db: Session, nodo_id: int) -> NodoSchema:
    nodo = Nodo.get(db, nodo_id)
    if not nodo:
        raise HTTPException(status_code=404, detail="Nodo no encontrado")

    if nodo:
        nodo.is_active = True
        nodo.save(db)
        db.commit()
    return NodoSchema.model_validate(nodo)
