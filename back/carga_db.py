import json
from pathlib import Path

from fastapi import HTTPException
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from .alertas.schemas import AlertaCreate
from .alertas.services import crear_alerta
from .auth.services import crear_usuario
from .database import get_db
from .nodos.models import Nodo
from .nodos.schemas import NodoCreate
from .paquete.models import Tipo
from .paquete.schemas import TipoCreate
from .paquete.services import crear_tipo
from .permisos.models import Permiso
from .permisos.schemas import PermisoCreate, RolePermisoCreate
from .permisos.services import assign_permiso_to_role, create_permiso
from .roles.models import Role
from .roles.schemas import RoleCreate, UsuarioRole
from .roles.services import assign_role_to_usuario, create_role
from .usuarios.models import Usuario
from .usuarios.schemas import Usuario as UsuarioSchema
from .usuarios.schemas import UsuarioCreate
from .usuarios.services import get_user_by_username


def init_tipos():
    db: Session = next(get_db())
    tipos_data = [
        TipoCreate(data_type=1, data_symbol="°C", nombre="Temperatura", icon="fa-thermometer", color="text-rose-500"),
        TipoCreate(data_type=14, data_symbol="mm", nombre="Precipitación", icon="fa-umbrella", color="text-blue-400"),
        TipoCreate(data_type=16, data_symbol="V", nombre="Tensión", icon="fa-bolt", color="text-yellow-500"),
        TipoCreate(data_type=25, data_symbol="cm", nombre="Nivel Hidrométrico", icon="fa-tint", color="text-sky-500"),
        TipoCreate(data_type=26, data_symbol="km\h", nombre="Viento", icon="fa-flag", color="text-blue-500"),
    ]
    for tipo_data in tipos_data:
        try:
            crear_tipo(db, tipo_data)
        except IntegrityError:
            db.rollback()
            print(f"El tipo '{tipo_data.data_type}' ya existe.")
    db.commit()
    db.close()
    print("Tipos creados exitosamente")


def init_permisos():
    db: Session = next(get_db())
    permisos_data = [
        # permisos
        PermisoCreate(
            identificador="read_permisos", descripcion="Leer detalles de permisos"
        ),
        PermisoCreate(
            identificador="read_rolepermisos", descripcion="Ver permisos-roles"
        ),
        PermisoCreate(
            identificador="assign_permiso", descripcion="Asignar/Revocar permiso"
        ),
        # nodos
        PermisoCreate(identificador="read_nodos", descripcion="Leer nodos"),
        PermisoCreate(identificador="create_nodos", descripcion="Crear nodos"),
        PermisoCreate(identificador="update_nodos", descripcion="Actualizar nodos"),
        PermisoCreate(identificador="delete_nodos", descripcion="Eliminar nodos"),
        PermisoCreate(identificador="activar_nodos", descripcion="Activar nodos"),
        PermisoCreate(
            identificador="read_nodos_inactivos", descripcion="Ver nodos inactivos"
        ),
        # paquetes
        PermisoCreate(identificador="read_paquetes", descripcion="Leer paquetes"),
        PermisoCreate(
            identificador="read_paquetes_archivos",
            descripcion="Leer paquetes archivados",
        ),
        # usuarios
        PermisoCreate(identificador="read_usuarios", descripcion="Leer usuarios"),
        # roles
        PermisoCreate(identificador="create_roles", descripcion="Crear rol"),
        PermisoCreate(identificador="read_roles", descripcion="Leer roles"),
        PermisoCreate(identificador="update_roles", descripcion="Actualizar rol"),
        PermisoCreate(identificador="delete_roles", descripcion="Eliminar rol"),
        PermisoCreate(
            identificador="assign_roles", descripcion="Asignar rol a usuario"
        ),
        PermisoCreate(
            identificador="read_usuarios_roles", descripcion="Ver usuarios con roles"
        ),
        PermisoCreate(identificador="admin", descripcion="Administrador"),
    ]
    for permiso_data in permisos_data:
        try:
            create_permiso(db, permiso_data)
        except IntegrityError:
            db.rollback()
            print(f"El permiso '{permiso_data.identificador}' ya existe.")
    db.commit()
    db.close()
    print("Permisos creados exitosamente.")


def init_nodos():
    db: Session = next(get_db())

    # Datos de los nodos iniciales
    nodos_data = [
        {
            "identificador": "Legolas",
            "porcentajeBateria": 100,
            "latitud": -43.5,
            "longitud": -65.95,
            "descripcion": "Descripción del Nodo 1",
            "tipos": ["Temperatura", "Nivel Hidrométrico"],  # tension se agrega automáticamente
        },
        {
            "identificador": "Gandalf",
            "porcentajeBateria": 100,
            "latitud": -43.6333,
            "longitud": -66.0667,
            "descripcion": "Descripción del Nodo 2",
            "tipos": ["Temperatura", "Nivel Hidrométrico"],
        },
        {
            "identificador": "Aragorn",
            "porcentajeBateria": 100,
            "latitud": -34.6039,
            "longitud": -58.3818,
            "descripcion": "Descripción del Nodo 3",
            "tipos": ["Temperatura", "Nivel Hidrométrico"],
        },
    ]

    for nodo_data in nodos_data:
        try:
            # Verificar si el nodo ya existe
            nodo_existente = db.query(Nodo).filter_by(identificador=nodo_data["identificador"]).first()
            if nodo_existente:
                print(f"El nodo '{nodo_existente.identificador}' ya existe, se omite creación.")
                continue

            # Obtener los objetos Tipo desde la BD
            tipos_model = []
            for nombre in nodo_data.pop("tipos"):
                tipo = db.query(Tipo).filter_by(nombre=nombre).first()
                if tipo:
                    tipos_model.append(tipo)

            # Siempre agregamos Tensión
            tipo_tension = db.query(Tipo).filter_by(nombre="Tensión").first()
            if tipo_tension and tipo_tension not in tipos_model:
                tipos_model.append(tipo_tension)

            # Crear el nodo y asignarle los tipos
            nodo = Nodo(**nodo_data)
            nodo.tipos = tipos_model
            db.add(nodo)
            db.commit()  # commit por cada nodo para guardar la relación muchos-a-muchos
            print(f"Nodo {nodo.identificador} vinculado a tipos {[t.nombre for t in nodo.tipos]}")

        except IntegrityError:
            db.rollback()
            print(f"Error al crear el nodo '{nodo_data['identificador']}'.")

    db.close()
    print("Nodos creados exitosamente.")





def init_roles():
    db: Session = next(get_db())
    admin_role_data = RoleCreate(
        name="admin", descripcion="Administrador con todos los permisos"
    )
    try:
        admin_role = create_role(db, admin_role_data)
        print(f"rol admin creado exitosamente")
    except IntegrityError:
        db.rollback()
        print(f"Rol 'admin' ya existe.")
    permisos = db.query(Permiso).all()
    admin_role = db.query(Role).filter(Role.name == "admin").first()
    for permiso in permisos:
        role_permiso_data = RolePermisoCreate(
            role_id=admin_role.id, permiso_id=permiso.id
        )
        try:
            assign_permiso_to_role(db, role_permiso_data)
            print("Permiso asignados exitosamente.")
        except IntegrityError:
            db.rollback()
            print(f"Permiso '{permiso.identificador}' ya está asignado al rol 'admin'.")
        except HTTPException as e:
            print(
                f"El permiso '{permiso.identificador}' ya está asignado al rol 'admin'. Detalle: {e.detail}"
            )
    db.commit()
    db.close()


def init_user():
    db: Session = next(get_db())
    usuario = UsuarioCreate(username="admin", password="123")

    try:
        existing_user = db.query(Usuario).filter(Usuario.username == "admin").first()
        if existing_user:
            print("Usuario 'admin' ya existe.")
        else:
            crear_usuario(db, usuario)
            print("Usuario 'admin' creado con éxito.")
        admin_role = db.query(Role).filter(Role.name == "admin").first()
        user = get_user_by_username(db, "admin")
        usuariorole = UsuarioRole(usuario_id=user.id, role_id=admin_role.id)

        try:
            assign_role_to_usuario(db, usuariorole)
            print("Rol asignado al 'admin'")
        except IntegrityError:
            db.rollback()
            print("El rol ya está asignado al 'admin'")
        except HTTPException:
            db.rollback()
            print("El rol ya está asignado al 'admin'")
    except IntegrityError as e:
        db.rollback()
        print(f"Error al inicializar el usuario: {e}")
    finally:
        db.close()


def init_alertas():
    db: Session = next(get_db())

    alerta = AlertaCreate(nombre="amarilla", titulo_notificacion="Alerta Amarilla")
    try:
        crear_alerta(db, alerta)
        print(f"alerta creado exitosamente")
    except IntegrityError:
        db.rollback()
        print(f"Alerta amarilla ya existe.")

    alerta = AlertaCreate(nombre="naranja", titulo_notificacion="Alerta Naranja")
    try:
        crear_alerta(db, alerta)
        print(f"alerta creado exitosamente")
    except IntegrityError:
        db.rollback()
        print(f"Alerta naranja ya existe.")

    alerta = AlertaCreate(nombre="roja", titulo_notificacion="Alerta Roja")
    try:
        crear_alerta(db, alerta)
        print(f"alerta creado exitosamente")
    except IntegrityError:
        db.rollback()
        print(f"Alerta roja ya existe.")

    alerta = AlertaCreate(
        nombre="dato_invalido", titulo_notificacion="Dato erroneo detectado"
    )
    try:
        crear_alerta(db, alerta)
        print(f"alerta creado exitosamente")
    except IntegrityError:
        db.rollback()
        print(f"Alerta de validacion ya existe.")

    alerta = AlertaCreate(
        nombre="bateria_baja", titulo_notificacion="Batería baja detectada"
    )
    try:
        crear_alerta(db, alerta)
        print(f"alerta creado exitosamente")
    except IntegrityError:
        db.rollback()
        print(f"Alerta de bateria ya existe.")

    db.commit()
    db.close()


def init_configjson():

    # Ruta del archivo de configuración
    config_path = Path("config.json")

    # Valores por defecto
    default_config = {
        "type": {
            "temperatura": 1,
            "precipitacion": 14,
            "tension": 16,
            "nivel_hidrometrico": 25,
        },
        "umbral": {
            "temperatura": [1, 99],
            "nivel_hidrometrico": [0, 100],
            "tension": [1, 100],
            "precipitacion": [1, 100],
        },
        "nivel_hidrometrico_alertas": {"amarilla": 50, "naranja": 100, "roja": 200},
        "tension_bateria_baja": 1,
    }

    # Verifica si el archivo existe
    if not config_path.exists():
        # Si no existe, crea el archivo con la configuración predeterminada
        with config_path.open("w", encoding="utf-8") as file:
            json.dump(default_config, file, indent=4, ensure_ascii=False)
        print("Archivo config.json creado con valores predeterminados.")
    else:
        print("Archivo config.json ya existe.")


def init_db():
    init_permisos()
    init_roles()
    init_tipos()
    init_nodos()
    init_user()
    init_alertas()
    init_configjson()


if __name__ == "__main__":
    init_db()
