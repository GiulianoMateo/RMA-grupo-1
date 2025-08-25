from datetime import datetime
from typing import List

from sqlalchemy import DateTime, Float, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from back.models import ModeloBase
from back.nodos.models import Nodo, nodo_tipo  # Importamos aquí


class Tipo(ModeloBase):
    __tablename__ = "tipos"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    data_type: Mapped[int] = mapped_column(Integer, unique=True, index=True)
    data_symbol: Mapped[str] = mapped_column(String(20), unique=True, index=True)
    nombre: Mapped[str] = mapped_column(String(50), unique=True, index=True)

    # Relación muchos-a-muchos con Nodos
    nodos: Mapped[List[Nodo]] = relationship(
        "Nodo", secondary=nodo_tipo, back_populates="tipos"
    )

    # Relación con Paquetes
    paquetes: Mapped[List["Paquete"]] = relationship("Paquete", back_populates="type")


class Paquete(ModeloBase):
    __tablename__ = "paquetes"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    nodo_id: Mapped[int] = mapped_column(ForeignKey("nodos.id"), index=True)
    data: Mapped[float] = mapped_column(Float, index=True)
    type_id: Mapped[int] = mapped_column(ForeignKey("tipos.id"), index=True)
    timestamp: Mapped[datetime] = mapped_column(DateTime, index=True, default=datetime.utcnow)

    type: Mapped[Tipo] = relationship("Tipo", back_populates="paquetes")
    nodo: Mapped[Nodo] = relationship("Nodo", back_populates="paquetes")


class PaqueteRechazado(ModeloBase):
    __tablename__ = "paquetes_rechazados"

    nodo_id: Mapped[int] = mapped_column(ForeignKey("nodos.id"), primary_key=True, index=True)
    timestamp: Mapped[datetime] = mapped_column(DateTime, primary_key=True, index=True)
    data: Mapped[float] = mapped_column(Float, index=True)
    type_id: Mapped[int] = mapped_column(ForeignKey("tipos.id"), index=True)
    motivo: Mapped[str] = mapped_column(String, index=True)


class PaqueteArchivo(ModeloBase):
    __tablename__ = "paquetes_archivo"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    data: Mapped[float] = mapped_column(Float, index=True)
    type_id: Mapped[int] = mapped_column(ForeignKey("tipos.id"))
    timestamp: Mapped[datetime] = mapped_column(DateTime, index=True)
    nodo_id: Mapped[int] = mapped_column(ForeignKey("nodos.id"))

    type: Mapped[Tipo] = relationship("Tipo")
    nodo: Mapped[Nodo] = relationship("Nodo")

    @classmethod
    def from_paquete(cls, paquete: Paquete):
        return cls(
            data=paquete.data,
            type_id=paquete.type_id,
            timestamp=paquete.timestamp,
            nodo_id=paquete.nodo_id,
        )