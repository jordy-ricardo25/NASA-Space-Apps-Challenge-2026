from datetime import datetime, timezone

from sqlalchemy import JSON, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


class Base(DeclarativeBase):
    pass


class IngestRun(Base):
    __tablename__ = "ingest_runs"

    id: Mapped[int] = mapped_column(primary_key=True)
    started_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)
    finished_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    files_seen: Mapped[int] = mapped_column(Integer, default=0)
    files_parsed: Mapped[int] = mapped_column(Integer, default=0)
    rows_read: Mapped[int] = mapped_column(Integer, default=0)
    rows_kept: Mapped[int] = mapped_column(Integer, default=0)
    rows_rejected: Mapped[int] = mapped_column(Integer, default=0)
    kernel_version: Mapped[str] = mapped_column(String(16), default="")

    observations: Mapped[list["Observation"]] = relationship(back_populates="run")


class Observation(Base):
    """Una fila normalizada. Nada se descarta en silencio: si falta, queda la bandera."""

    __tablename__ = "observations"

    id: Mapped[int] = mapped_column(primary_key=True)
    run_id: Mapped[int] = mapped_column(ForeignKey("ingest_runs.id"), index=True)

    source_file: Mapped[str] = mapped_column(String(255), index=True)
    source_row: Mapped[int] = mapped_column(Integer)
    expand_index: Mapped[int] = mapped_column(Integer, default=0)

    experiment_key: Mapped[str] = mapped_column(String(64), index=True)
    experiment_label: Mapped[str] = mapped_column(String(128))
    facility: Mapped[str] = mapped_column(String(64))
    schema_key: Mapped[str] = mapped_column(String(64))

    material: Mapped[str | None] = mapped_column(String(120), nullable=True)
    material_key: Mapped[str | None] = mapped_column(String(32), nullable=True, index=True)
    geometry: Mapped[str | None] = mapped_column(String(128), nullable=True)
    flame_mode: Mapped[str] = mapped_column(String(16), default="unknown")
    gravity_g: Mapped[float | None] = mapped_column(Float, nullable=True)

    o2_min: Mapped[float | None] = mapped_column(Float, nullable=True)
    o2_max: Mapped[float | None] = mapped_column(Float, nullable=True)
    pressure_atm: Mapped[float | None] = mapped_column(Float, nullable=True)
    burn_rate_mm_s: Mapped[float | None] = mapped_column(Float, nullable=True)
    burn_time_s: Mapped[float | None] = mapped_column(Float, nullable=True)
    burn_length_mm: Mapped[float | None] = mapped_column(Float, nullable=True)
    co_ppm: Mapped[float | None] = mapped_column(Float, nullable=True)
    soot_index: Mapped[float | None] = mapped_column(Float, nullable=True)
    tad_k: Mapped[float | None] = mapped_column(Float, nullable=True)
    zst: Mapped[float | None] = mapped_column(Float, nullable=True)
    cool_flame: Mapped[bool | None] = mapped_column(nullable=True)
    hot_ignition: Mapped[bool | None] = mapped_column(nullable=True)
    self_extinguished: Mapped[bool | None] = mapped_column(nullable=True)

    quality: Mapped[float] = mapped_column(Float, default=1.0)
    flags: Mapped[list] = mapped_column(JSON, default=list)
    rules_applied: Mapped[list] = mapped_column(JSON, default=list)
    raw: Mapped[dict] = mapped_column(JSON, default=dict)

    run: Mapped[IngestRun] = relationship(back_populates="observations")