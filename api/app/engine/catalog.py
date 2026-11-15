"""Catálogo de proyectos y hardware. Explica qué comparaciones son legítimas."""

PROJECTS = {
    "acme": {
        "label": "Advanced Combustion via Microgravity Experiments",
        "facility": "CIR",
        "hardware": "set modular ACME (seis experimentos, mismo bastidor)",
    },
    "mdca": {
        "label": "Multi-user Droplet Combustion Apparatus",
        "facility": "CIR",
        "hardware": "MDCA",
    },
    "msg_duct": {
        "label": "Ducto con ventilador de SPICE",
        "facility": "MSG",
        "hardware": "ducto modular con ventilador",
    },
    "msg_smoke": {
        "label": "Medición de humo y aerosol",
        "facility": "MSG",
        "hardware": "instrumento óptico SAME",
    },
    "cygnus": {
        "label": "Demostración de seguridad contra incendios",
        "facility": "Cygnus (control desde CIR)",
        "hardware": "contenedor de gran volumen no tripulado",
    },
    "cir_libre": {
        "label": "Diseño de llama en CIR",
        "facility": "CIR",
        "hardware": "quemador esférico",
    },
}

EXPERIMENT_PROJECT = {
    "acme_bre": "acme", "acme_cld": "acme", "acme_efield": "acme",
    "acme_sflame": "acme", "cfi_g_inverse": "acme", "cfi_g_normal": "acme",
    "flex1": "mdca", "flex2": "mdca", "cfi": "mdca",
    "bass1": "msg_duct", "bass2": "msg_duct", "spice": "msg_duct", "slice": "msg_duct",
    "same": "msg_smoke", "samer": "msg_smoke",
    "saffire1": "cygnus", "saffire2": "cygnus", "saffire3": "cygnus",
    "flame_design_inverse": "cir_libre", "flame_design_normal": "cir_libre",
}
# Relevancia para seguridad contra incendios. "direct" estudia propagación,
# extinción o detección sobre sólidos y gotas, o atmósferas ricas de O2.
# "indirect" aporta condiciones límite o es proxy sin ser el objeto del ensayo.
RELEVANCE = {
    "bass1": "direct", "bass2": "direct",
    "saffire1": "direct", "saffire2": "direct", "saffire3": "direct",
    "flex1": "direct", "flex2": "direct", "cfi": "direct",
    "spice": "direct", "slice": "direct",
    "same": "direct", "samer": "direct",
    "acme_bre": "direct",
    "cfi_g_normal": "direct", "cfi_g_inverse": "direct",
    "acme_cld": "indirect", "acme_sflame": "indirect", "acme_efield": "indirect",
    "flame_design_normal": "indirect", "flame_design_inverse": "indirect",
}


# Vacíos declarados: no están en el corpus y hay que decirlo.
DECLARED_GAPS = [
    {"area": "Gravedad parcial", "detail": "PSI no contiene datos a 0.165 g ni 0.38 g. "
     "LUCI y FM2 los aportarán; E-FIELD sirve de proxy iónico.",
     "bound": "Se acota con µg y 1 g"},
    {"area": "Integridad de recipientes de O2", "detail": "El corpus cubre propagación de llama, "
     "no fallo mecánico de tanques. Apollo 13 queda fuera del alcance.",
     "bound": "Sin cobertura"},
    {"area": "Polvo y aerosol no combustible", "detail": "DAFT y DAFT-2 usan el mismo instrumento "
     "que SAME para polvo; no están ingestados.", "bound": "Ingesta pendiente"},
    {"area": "Supresión activa", "detail": "FLEX diluye con CO2 y He, pero no hay ensayos de "
     "agentes extintores sobre sólidos en µg.", "bound": "Cobertura parcial"},
]


# Qué se midió en cada experimento y con qué instrumento.
MEASUREMENTS = {
    "saffire1": [("cámara", "longitud quemada", "óptico"), ("termopar", "temperatura de muestra", "térmico")],
    "saffire2": [("cámara", "longitud quemada µg y 1 g", "óptico")],
    "saffire3": [("cámara", "longitud quemada", "óptico")],
    "bass1": [("cámara", "geometría de muestra", "óptico")],
    "bass2": [("radiador", "pérdida de calor", "radiométrico"),
              ("sensor O2", "O2 calibrado inicial y final", "gas"),
              ("sensor CO", "CO en ppm", "gas")],
    "spice": [("cámara", "punto de humo", "óptico"), ("medidor de flujo", "caudal de aire", "mecánico")],
    "slice": [("pirómetro", "temperatura de llama", "térmico")],
    "same": [("báscula", "pérdida de peso", "gravimétrico")],
    "samer": [("fotómetro", "obscuración Rt/R0", "óptico")],
    "cfi": [("cámara", "extinción frente a disrupción", "óptico"), ("fibra", "soporte de gota", "mecánico")],
    "cfi_g_inverse": [("termopar de quemador", "temperatura", "térmico"),
                      ("cámara de color", "color de llama", "óptico")],
    "cfi_g_normal": [("termopar de quemador", "temperatura", "térmico")],
    "flex1": [("cámara", "diámetro de extinción", "óptico")],
    "flex2": [("cámara", "diámetro de gota", "óptico")],
    "acme_bre": [("cámara", "tasa de quemado", "óptico")],
    "acme_cld": [("cámara", "longitud de llama", "óptico")],
    "acme_efield": [("cámara", "forma de llama", "óptico"), ("fuente HV", "polaridad de malla", "eléctrico")],
    "acme_sflame": [("cámara", "diámetro de llama", "óptico")],
    "flame_design_inverse": [("termopar", "temperatura adiabática", "térmico")],
    "flame_design_normal": [("termopar", "temperatura adiabática", "térmico")],
}

MISSING_VARIABLES = ["tasa de propagación medida", "espesor de residuo", "composición de humo",
                     "tiempo de reignición"]
