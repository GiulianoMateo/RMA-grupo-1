import os
import signal
import sys
import threading
from contextlib import asynccontextmanager

import paho.mqtt.client as paho
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import engine
from .depends.config import config
from .depends.paquetes import mi_callback
from .depends.sub import Subscriptor
from .models import ModeloBase
from .paquete.router import router as paquetes_router
from .permisos.router import router as permisos_router
from .nodos.router import router as sensores_router
from .usuarios.router import router as usuarios_router
from .roles.router import router as roles_router
from .rango_valores.router import router as config_router
from .auth.router import router as auth_router
from .alertas.router import router as alertas_router
from .rango_alertas.router import router as rango_alertas_router
from .carga_db import init_db

# -----------------------------
# Carga de variables de entorno
# -----------------------------
load_dotenv()
ENV = os.getenv("ENV", "DEV")
ROOT_PATH = os.getenv(f"ROOT_PATH_{ENV.upper()}", "")

# -----------------------------
# Variable para subscriptor
# -----------------------------
subscriptor_iniciado = False

def iniciar_thread() -> None:
    """Inicializa el subscriptor MQTT en un hilo aparte (solo una vez)."""
    global subscriptor_iniciado
    if not subscriptor_iniciado:
        subscriptor_iniciado = True
        sub = Subscriptor(client=paho.Client(), on_message_callback=mi_callback)
        sub.connect(config.host, config.port, config.keepalive)
        print("Subscriptor iniciado.")
    else:
        print("El hilo del suscriptor ya está en ejecución.")

# -----------------------------
# Lifespan de FastAPI
# -----------------------------
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Crear tablas
    ModeloBase.metadata.create_all(bind=engine)
    # Inicializar datos base
    init_db()

    # Iniciar subscriptor en hilo daemon
    thread_sub = threading.Thread(target=iniciar_thread, daemon=True)
    thread_sub.start()
    print("Hilo del subscriptor lanzado.")

    # Manejo de Ctrl+C para cerrar correctamente
    def signal_handler(sig, frame):
        print("Recibida señal de interrupción (Ctrl+C). Cerrando aplicación...")
        if hasattr(Subscriptor, "should_exit"):
            Subscriptor.should_exit = True
        if thread_sub.is_alive():
            thread_sub.join()
        sys.exit(0)

    signal.signal(signal.SIGINT, signal_handler)

    yield

    # Cleanup al cerrar FastAPI
    print("Finalizando aplicación FastAPI...")
    if thread_sub.is_alive():
        thread_sub.join()
    print("Aplicación cerrada correctamente.")

# -----------------------------
# Inicializar FastAPI
# -----------------------------
app = FastAPI(root_path=ROOT_PATH, lifespan=lifespan)

# -----------------------------
# Configuración CORS
# -----------------------------
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # o ["*"] temporalmente para pruebas
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------------
# Routers
# -----------------------------
app.include_router(permisos_router)
app.include_router(sensores_router)
app.include_router(paquetes_router)
app.include_router(usuarios_router)
app.include_router(roles_router)
app.include_router(auth_router)
app.include_router(config_router)
app.include_router(alertas_router)
app.include_router(rango_alertas_router)

print("FastAPI inicializado correctamente con CORS y routers.")
