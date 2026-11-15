from pydantic import BaseModel, ConfigDict, Field


class FactorOut(BaseModel):
    name: str
    value: float
    weight: float
    contribution: float


class FindingOut(BaseModel):
    key: str
    experiment: str
    facility: str
    material: str | None
    geometry: str | None
    flame_mode: str
    o2_min: float | None
    o2_max: float | None
    pressure_atm: float | None
    observations: int
    quality: float
    rpi: int
    band: str
    relevance: str
    factors: list[FactorOut]
    narrative: str
    sources: list[str]
    rules: list[str]


class MatrixCell(BaseModel):
    key: str
    experiment: str
    environment: str
    rpi: int
    band: str
    relevance: str


class MatrixOut(BaseModel):
    findings: list[MatrixCell]
    environment_means: dict[str, float]


class LabIn(BaseModel):
    material: str = "SIBAL"
    o2_fraction: float = Field(0.21, ge=0.05, le=1.0)
    pressure_atm: float = Field(1.0, gt=0.05, le=3.0)
    gravity_g: float = Field(0.0, ge=0.0, le=1.8)
    flow_cm_s: float | None = Field(None, ge=0.0, le=200.0)
    ignition_w: float = Field(0.0, ge=0.0, le=500.0)
    co2_pct: float = Field(0.0, ge=0.0, le=60.0)
    he_pct: float = Field(0.0, ge=0.0, le=60.0)
    diluent: str = "N2"
    mode: str = "opposed"


class LabOut(BaseModel):
    limit: float
    excess: float
    quenched: bool
    rate_mm_s: float
    curve: list[list[float]]


class IngestOut(BaseModel):
    files_seen: int
    files_parsed: int
    rows_read: int
    rows_kept: int
    rows_rejected: int
    skipped: list[str]

class VariationColumn(BaseModel):
    column: str
    distinct: int
    minimum: float | None = None
    maximum: float | None = None
    examples: list[str] = []


class VariationOut(BaseModel):
    experiment: str
    material: str | None
    observations: int
    varying: list[VariationColumn]
    constant: list[str]
    note: str


class SimilarityPair(BaseModel):
    a: str
    b: str
    similarity: int
    shared: list[str]
    differing: list[str]


class GravityBandIn(BaseModel):
    material: str = "SIBAL"
    o2_fraction: float = Field(0.21, ge=0.05, le=1.0)
    pressure_atm: float = Field(1.0, gt=0.05, le=3.0)
    diluent: str = "N2"
    mode: str = "opposed"
    gravity_g: float = Field(0.165, ge=0.0, le=1.0)


class GravityBandOut(BaseModel):
    low: float
    high: float
    interpolated: float
    interpolated_at: float
    declared: bool
    quenched_low: bool
    quenched_high: bool

class HealthOut(BaseModel):
    status: str
    kernel: str


class EnvironmentOut(BaseModel):
    key: str
    label: str
    gravity_g: float
    o2_fraction: float
    pressure_atm: float
    diluent: str
    egress_s: int
    caption: str
    material_fit: float


class MetaOut(BaseModel):
    kernel_version: str
    environments: dict[str, EnvironmentOut]
    weights: dict[str, float]
    materials: dict[str, float]
    diluents: dict[str, float]
    bands: dict[str, int]


class ProvenanceRow(BaseModel):
    row: int
    flags: list[str]
    rules: list[str]
    quality: float
    raw: dict


class ProvenanceOut(BaseModel):
    source_file: str
    observations: int
    rows: list[ProvenanceRow]


class IncidentOut(BaseModel):
    slug: str
    name: str
    year: int
    environment: str
    atmosphere: str
    timeline: str
    verdict: str
    evidence: list[str]
    summary: str
    linked_observations: int
    mean_rpi: float | None = None


class IncidentSourceOut(BaseModel):
    slug: str
    excerpt: list[str]
    lines: int
    chars: int


class SpinoffOut(BaseModel):
    name: str
    source: str
    benefit: str


class InvestigationOut(BaseModel):
    key: str
    label: str
    facility: str
    relevance: str
    project: str | None = None
    project_label: str | None = None
    hardware: str | None = None
    observations: int
    materials: list[str]
    modes: list[str]


class HardwareExperiment(BaseModel):
    key: str
    observations: int


class HardwareNodeOut(BaseModel):
    label: str
    facility: str
    hardware: str
    project: str
    experiments: list[HardwareExperiment]


class GapCell(BaseModel):
    environment: str
    material_class: str
    observations: int
    affinity: float
    state: str


class DeclaredGap(BaseModel):
    area: str
    detail: str
    bound: str


class GapsOut(BaseModel):
    cells: list[GapCell]
    declared: list[DeclaredGap]
    note: str


class LadderStep(BaseModel):
    o2: float
    over_cabin_limit: float
    over_suit_limit: float
    sustains_cabin: bool
    sustains_suit: bool


class LadderMaterial(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    material: str
    clase: str = Field(alias="class")
    steps: list[LadderStep]


class LadderAnchor(BaseModel):
    o2: float
    label: str


class OxygenLadderOut(BaseModel):
    steps: list[float]
    materials: list[LadderMaterial]
    anchors: list[LadderAnchor]


class MeasurementItem(BaseModel):
    instrument: str
    variable: str
    kind: str


class MeasurementOut(BaseModel):
    experiment: str
    measurements: list[MeasurementItem]
    kinds: list[str]


class MeasurementsOut(BaseModel):
    experiments: list[MeasurementOut]
    missing_variables: list[str]
    note: str


class RuleOut(BaseModel):
    id: str | None = None
    mito: str | None = None
    hecho: str | None = None
    fuente: str | None = None


class RulesOut(BaseModel):
    rules: list[RuleOut]
    count: int
    source: str


class FacilityOut(BaseModel):
    id: str | None = None
    nombre: str | None = None
    bastidor: str | None = None
    masa_kg: float | None = None
    volumen_m3: float | None = None


class FacilityInvestigation(BaseModel):
    psi_id: str | None = None
    acronimo: str | None = None
    titulo: str | None = None
    pilar: str | None = None


class FacilitiesOut(BaseModel):
    facilities: list[FacilityOut]
    investigations: list[FacilityInvestigation]


class Fm2Out(BaseModel):
    payload: dict
    note: str


class EvidenceRow(BaseModel):
    file: str
    row: int
    quality: float
    flags: list[str]
    raw: dict


class Message(BaseModel):
    role: str
    content: str


class ContextOut(BaseModel):
    finding: FindingOut
    environment: EnvironmentOut
    evidence: list[EvidenceRow]
    messages: list[Message]
    response_schema: dict
    provider: str

