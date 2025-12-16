from typing import List, Optional
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..auth.dependencies import permiso_requerido
from ..database import get_db
from ..nodos import schemas, services
from .schemas import NodoCreate, NodoOut
from .services import crear_nodo, get_nodo
from ..paquete.models import Tipo

router = APIRouter()

# -------------------------------
# Endpoint: Obtener todos los nodos
# -------------------------------
@router.get(
    "/nodos",
    response_model=List[schemas.NodoOut],
    tags=["Nodos"],
    dependencies=[Depends(permiso_requerido("read_nodos"))],
)
def read_nodos(db: Session = Depends(get_db)):
    """
    Retorna la lista de todos los nodos activos.
    Los tipos se devuelven como lista de strings (nombres), 
    sin modificar la relación ORM.
    """
    nodos = services.listar_nodos(db)
    
    # Convertimos a lista de diccionarios serializable
    nodos_serializados = []
    for nodo in nodos:
        nodo_dict = {
            "id": nodo.id,
            "identificador": nodo.identificador,
            "porcentajeBateria": nodo.porcentajeBateria,
            "latitud": nodo.latitud,
            "longitud": nodo.longitud,
            "descripcion": nodo.descripcion,
            "tipos": [tipo.id for tipo in nodo.tipos]  # solo nombres
        }
        nodos_serializados.append(nodo_dict)
    
    return nodos_serializados

# -------------------------------
# Endpoint: Crear un nuevo nodo
# -------------------------------
@router.post(
    "/nodos",
    response_model=NodoOut,
    tags=["Nodos"],
    dependencies=[Depends(permiso_requerido("create_nodos"))],
)
def create_nodo(nodo: NodoCreate, db: Session = Depends(get_db)):
    """
    Crea un nuevo nodo y devuelve su información serializada.
    Se espera que nodo.tipos sea una lista de IDs de tipos.
    """
    tipos_ids = nodo.tipos or []  # lista de IDs de tipos seleccionados
    nuevo_nodo = crear_nodo(db, nodo, tipos_ids)

    # Construimos diccionario serializable
    nodo_dict = {
        "id": nuevo_nodo.id,
        "identificador": nuevo_nodo.identificador,
        "porcentajeBateria": nuevo_nodo.porcentajeBateria,
        "latitud": nuevo_nodo.latitud,
        "longitud": nuevo_nodo.longitud,
        "descripcion": nuevo_nodo.descripcion,
        "tipos": [tipo.id for tipo in nuevo_nodo.tipos],  # nombres para mostrar en frontend
    }
    return nodo_dict


# -------------------------------
# Endpoint: Obtener un nodo por ID
# -------------------------------
@router.get(
    "/nodos/{id}",
    response_model=NodoOut,
    tags=["Nodos"],
    dependencies=[Depends(permiso_requerido("read_nodos"))],
)
def read_nodo(id: int, db: Session = Depends(get_db)):
    """
    Devuelve un nodo específico por su ID.
    """
    nodo = get_nodo(db, id)
    return nodo

# -------------------------------
# Endpoint: Actualizar nodo
# -------------------------------
@router.put(
    "/nodos/{nodo_id}",
    response_model=NodoOut,
    tags=["Nodos"],
    dependencies=[Depends(permiso_requerido("update_nodos"))],
)
def update_nodo(nodo_id: int, nodo: schemas.NodoUpdate, db: Session = Depends(get_db)):
    """
    Modifica un nodo existente.
    """
    nodo_actualizado = services.modificar_nodo(db, nodo_id, nodo)
    nodo_dict = {
        "id": nodo_actualizado.id,
        "identificador": nodo_actualizado.identificador,
        "porcentajeBateria": nodo_actualizado.porcentajeBateria,
        "latitud": nodo_actualizado.latitud,
        "longitud": nodo_actualizado.longitud,
        "descripcion": nodo_actualizado.descripcion,
        "tipos": [tipo.id for tipo in nodo_actualizado.tipos],
    }
    return nodo_dict

# -------------------------------
# Endpoint: Eliminar/archivar nodo
# -------------------------------
@router.delete(
    "/nodos/{nodo_id}",
    response_model=schemas.DeleteResponseSchema,
    tags=["Nodos"],
    dependencies=[Depends(permiso_requerido("delete_nodos"))],
)
def delete_nodo(nodo_id: int, db: Session = Depends(get_db)):
    """
    Archiva y elimina un nodo.
    """
    return services.archivar_y_eliminar_nodo(db=db, nodo_id=nodo_id)

# -------------------------------
# Endpoint: Listar nodos inactivos
# -------------------------------
@router.get(
    "/nodosinactivos",
    response_model=List[schemas.NodoOut],
    tags=["Nodos"],
    dependencies=[Depends(permiso_requerido("read_nodos_inactivos"))],
)
def read_nodos_inactivos(db: Session = Depends(get_db)):
    """
    Lista todos los nodos inactivos, serializando sus tipos.
    """
    nodos_inactivos = services.listar_nodos_inactivos(db)
    nodos_serializados = []
    for nodo in nodos_inactivos:
        nodo_dict = {
            "id": nodo.id,
            "identificador": nodo.identificador,
            "porcentajeBateria": nodo.porcentajeBateria,
            "latitud": nodo.latitud,
            "longitud": nodo.longitud,
            "descripcion": nodo.descripcion,
            "tipos": [tipo.id for tipo in nodo.tipos],
        }
        nodos_serializados.append(nodo_dict)
    
    return nodos_serializados

# -------------------------------
# Endpoint: Reactivar nodo
# -------------------------------
@router.put(
    "/nodosinactivos/{nodo_id}",
    response_model=NodoOut,
    tags=["Nodos"],
    dependencies=[Depends(permiso_requerido("activar_nodos"))],
)
def revivir_nodo(nodo_id: int, db: Session = Depends(get_db)):
    """
    Reactiva un nodo previamente inactivo.
    """
    nodo_revivido = services.activar_nodo(db, nodo_id)
    nodo_dict = {
        "id": nodo_revivido.id,
        "identificador": nodo_revivido.identificador,
        "porcentajeBateria": nodo_revivido.porcentajeBateria,
        "latitud": nodo_revivido.latitud,
        "longitud": nodo_revivido.longitud,
        "descripcion": nodo_revivido.descripcion,
        "tipos": [tipo.id for tipo in nodo_revivido.tipos],
    }
    return nodo_dict
