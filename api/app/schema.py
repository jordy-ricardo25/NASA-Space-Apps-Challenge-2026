from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class SimulationRequest(BaseModel):
    habitat_preset: str = Field("LUNAR_BASE", description="ISS | LUNAR_BASE | PRESSURIZED_ROVER | EVA_SUIT | MARS_HABITAT | CUSTOM")
    material: str = Field("cotton_sibal", description="cotton_sibal | pmma | kapton | liquid_heptane | liquid_methanol | gaseous_fuel")
    o2_percent: float = Field(30.0, ge=10.0, le=100.0)
    pressure_psi: float = Field(8.2, ge=3.0, le=45.0)
    airflow_cms: float = Field(10.0, ge=0.0, le=60.0)
    gravity_g: float = Field(0.165, ge=0.0, le=1.0)

class ActionProtocol(BaseModel):
    prevention: List[str]
    detection: List[str]
    suppression_and_cutoff: List[str]

class SimulationResponse(BaseModel):
    risk_score: int
    risk_level: str
    gravity_regime: str
    nasa_std_6001_valid: bool
    scientific_alerts: List[Dict[str, str]]
    action_protocol: ActionProtocol
    matched_psi_runs: List[Dict[str, Any]]
    historical_parallel: Dict[str, Any]
    earth_spinoff_connection: Dict[str, Any]

class SIChatRequest(BaseModel):
    question: str
    simulation_context: Optional[Dict[str, Any]] = None