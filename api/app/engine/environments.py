from dataclasses import dataclass

DILUENT_COEFF = {"N2": 1.0, "O2/N2": 1.0, "He": 1.26, "CO2": 0.74, "Ar": 0.86,
                 "O2 puro": 1.06, "CO2/N2": 0.88}

# LOI de referencia por material (fracción O2, 1 atm, N2)
MATERIAL_LOI = {
    "SIBAL": 0.1650, "PMMA": 0.175, "Kapton": 0.220, "Teflon": 0.240,
    "C12H26": 0.155, "n-dodecane": 0.155, "Methanol": 0.135,
    "Heptane": 0.145, "Ethylene": 0.110, "C2H4": 0.110, "CH4": 0.120,
    "Methane": 0.120, "Silicone": 0.200, "Ethane": 0.130,
    "Propane": 0.172, "Butane": 0.180,
}
DEFAULT_LOI = 0.200

MATERIAL_CLASS = {
    "SIBAL": "textil", "PMMA": "termoplastico", "Kapton": "pelicula",
    "Teflon": "pelicula", "Silicone": "elastomero",
    "n-dodecane": "liquido", "Methanol": "liquido", "Heptane": "liquido",
    "Ethylene": "gas", "C2H4": "gas", "CH4": "gas", "Methane": "gas",
    "Ethane": "gas", "Propane": "gas", "Butane": "gas",
}
DEFAULT_CLASS = "solido"

# Afinidad de cada clase de material con cada volumen. Un traje es tela y película.
CLASS_FIT = {
    "eva": {"textil": 1.00, "pelicula": 1.00, "termoplastico": 0.90, "elastomero": 0.85,
            "solido": 0.85, "liquido": 0.70, "gas": 0.70},
    "iss": {"textil": 0.90, "pelicula": 0.90, "termoplastico": 0.80, "elastomero": 0.70,
            "solido": 0.80, "liquido": 0.70, "gas": 0.85},
    "lunar": {"textil": 0.90, "pelicula": 0.90, "termoplastico": 0.85, "elastomero": 0.75,
              "solido": 0.85, "liquido": 0.70, "gas": 0.80},
    "rover": {"textil": 0.90, "pelicula": 0.90, "termoplastico": 0.85, "elastomero": 0.75,
              "solido": 0.85, "liquido": 0.80, "gas": 0.80},
    "mars": {"textil": 0.85, "pelicula": 0.85, "termoplastico": 0.85, "elastomero": 0.75,
             "solido": 0.85, "liquido": 0.75, "gas": 0.80},
}


@dataclass(frozen=True)
class Environment:
    key: str
    label: str
    gravity_g: float
    o2_fraction: float
    pressure_atm: float
    diluent: str
    egress_s: int
    caption: str
    material_fit: float
    flow_cm_s: float | None = None
    heat_w: float = 0.0
    diluent_coeff: float | None = None


ENVIRONMENTS: dict[str, Environment] = {
    "iss": Environment("iss", "ISS", 0.0, 0.21, 1.0, "N2", 180, "cabina presurizada", 0.62),
    "lunar": Environment("lunar", "Base lunar", 0.165, 0.32, 0.558, "O2/N2", 300, "hábitat 0.165 g", 0.80),
    "rover": Environment("rover", "Rover presurizado", 0.38, 0.30, 0.558, "N2", 120, "volumen sellado móvil", 0.70),
    "eva": Environment("eva", "Traje EVA", 0.0, 1.0, 0.293, "O2 puro", 45, "PLSS 4.3 psia", 0.98),
    "mars": Environment("mars", "Marte", 0.38, 0.34, 0.558, "CO2/N2", 600, "hábitat superficie marciana", 0.86),
}