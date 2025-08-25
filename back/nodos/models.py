from typing import List, Optional

from sqlalchemy import Float, Integer, String, Boolean, Table, Column, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from back.models import ModeloBase


# Tabla intermedia Nodo - Tipo
nodo_tipo = Table(
    "nodo_tipo",
    ModeloBase.metadata,
    Column("nodo_id", ForeignKey("nodos.id"), primary_key=True),
    Column("tipo_id", ForeignKey("tipos.id"), primary_key=True),
)


class Nodo(ModeloBase):
    __tablename__ = "nodos"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    identificador: Mapped[str] = mapped_column(String, unique=True, index=True)
    descripcion: Mapped[str] = mapped_column(String, index=True)
    porcentajeBateria: Mapped[int] = mapped_column(Integer, index=True)
    latitud: Mapped[float] = mapped_column(Float, index=True, nullable=True)
    longitud: Mapped[float] = mapped_column(Float, index=True, nullable=True)
    is_active: Mapped[bool] = mapped_column(
        Boolean, index=True, nullable=True, default=True
    )

    # Relación con Paquetes
    paquetes: Mapped[List["Paquete"]] = relationship(
        "Paquete", back_populates="nodo"
    )

    # Relación con Tipos (muchos a muchos)
    tipos: Mapped[List["Tipo"]] = relationship(
        "Tipo", secondary=nodo_tipo, back_populates="nodos"
    )