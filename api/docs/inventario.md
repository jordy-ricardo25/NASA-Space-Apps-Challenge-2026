# Inventario de dataset_clean

## Totales por extensión

- .csv: 20
- .txt: 6
- .json: 2
- .pdf: 1

## Archivos sin esquema reconocido

- ninguno

## Detalle


### docs/iss_combustion_guide.pdf  (1500825 bytes)  [guía oficial y referencia]
  PDF · páginas aproximadas: 56

### incidents_txt/apollo_1.txt  (5182 bytes)  [contexto histórico de accidentes]
  codificación: utf-8-sig · líneas con texto: 36 · caracteres: 5088
    | ================================================================================
    | INCIDENTE HISTÓRICO: INCENDIO EN PRUEBA EN PLATAFORMA DE APOLLO 1 (1967)
    | Fuente: Report of Apollo 204 Review Board (Part IV & Part VI) & NASA History
    | ================================================================================

### incidents_txt/apollo_13.txt  (5115 bytes)  [contexto histórico de accidentes]
  codificación: utf-8-sig · líneas con texto: 41 · caracteres: 4987
    | ================================================================================
    | INCIDENTE HISTÓRICO: EXPLOSIÓN DEL TANQUE DE OXÍGENO EN APOLLO 13 (1970)
    | Fuente: Report of Apollo 13 Review Board (NASA) & NASA SMA Lessons Learned
    | ================================================================================

### incidents_txt/mir_1997.txt  (5676 bytes)  [contexto histórico de accidentes]
  codificación: utf-8-sig · líneas con texto: 39 · caracteres: 5556
    | ================================================================================
    | INCIDENTE HISTÓRICO: INCENDIO A BORDO DE LA ESTACIÓN ESPACIAL MIR (1997)
    | Fuente: NASA Johnson Space Center — "25 Years Ago: Fire Aboard Space Station Mir" (2022)
    | ================================================================================

### json/fm2.json  (2537 bytes)  [metadatos de misión o de instalación]
  claves: ['id', 'acronym', 'title', 'status', 'pillar', 'research_type', 'hardware', 'team', 'fuels', 'test_conditions', 'sensors', 'key_finding', 'relevance_to_psi_and_artemis', 'earth_application']
    id: "FUTURE-FM2"
    acronym: "FM2"
    title: "Flammability of Materials on the Moon"
    status: "Planned Lunar Surface Payload (Target: Late 2026)"
    pillar: "partial_gravity_bounding"
    research_type: "Lunar Surface Investigation (1/6 g)"

### json/iss_combustion_guide.json  (12326 bytes)  [metadatos de misión o de instalación]
  claves: ['metadata', 'facilities_and_hardware', 'investigations', 'microgravity_fire_physics_rules']
    metadata: {"source_title": "A Researcher's Guide to International Space Station Combustion Science", "document_id": "NP-2015-10-034-JSC", "publication_date": "October 201
    facilities_and_hardware: [{"id": "CIR-MDCA", "name": "Multi-user Droplet Combustion Apparatus (MDCA)", "parent_rack": "Combustion Integrated Rack (CIR)", "up_mass_kg": 254, "volume_m3":
    investigations: [{"psi_id": "PSI-26 / PSI-25", "acronym": "BASS / BASS-II", "title": "Burning and Suppression of Solids", "pillar": "prevention_and_suppression", "hardware": "M
    microgravity_fire_physics_rules: [{"rule_id": "RULE-01-QUIESCENT-FLAME", "myth_debunked": "Mito: Un fuego estacionario no puede existir sin gravedad ni ventilación.", "scientific_fact": "Falso.

### psi_csv/psi_010_flame_design_inverse.csv  (17314 bytes)
  codificación: utf-8-sig · filas: 120 · separador: ','
  cabecera: Flame Type,Day,Test,XO2,mO2 (mg/s),mN2 (mg/s),mtot (mg/s),XC2H4 initial,XC2H4 final,pinit (atm),pfinal (atm),pmean (atm),mean Zst,Tad (K)
  esquema: psi010.inverse

### psi_csv/psi_010_flame_design_normal.csv  (26933 bytes)
  codificación: utf-8-sig · filas: 207 · separador: ','
  cabecera: Flame Type,Day,Fuel,Test,Xfuel,mfuel (mg/s),mN2 (mg/s),mtot (mg/s),XO2 (init),XO2 (final),pinit (atm),pfinal (atm),pmean (atm),mean Zst,Tad (K)
  esquema: psi010.normal

### psi_csv/psi_020_acme_bre.csv  (1113 bytes)
  codificación: utf-8-sig · filas: 18 · separador: ','
  cabecera: Year,Month,Date,Burner Size (mm),Fuel Bottle,Oxygen Conc (percent),Flames Ignited,Notes
  esquema: psi020.bre

### psi_csv/psi_021_acme_cld_flame.csv  (2454 bytes)
  codificación: utf-8-sig · filas: 32 · separador: ','
  cabecera: Test Type,Test Day,Fuel MFC,N2 MFC,Fuel Bottle,Fuel conc. Range,Flames ignited,Notes
  esquema: psi021.cld

### psi_csv/psi_022_acme_efield_flames.csv  (2475 bytes)
  codificación: utf-8-sig · filas: 32 · separador: ','
  cabecera: Test Type,Test Day,Year,Month,Date,Mesh Polarity,Fuel Bottle,Fuel Conc,Flames Ignited,Notes
  esquema: psi022.efield

### psi_csv/psi_023_acme_s_flame.csv  (2456 bytes)
  codificación: utf-8-sig · filas: 18 · separador: ','
  cabecera: Test Type,Test Day*,Year,Month,Date,Atmosphere*,Fuel Bottle,Flames Ignited*,Notes
  esquema: psi023.sflame

### psi_csv/psi_025_bass_2.csv  (16590 bytes)
  codificación: utf-8-sig · filas: 129 · separador: ','
  cabecera: PI,Test #,Date,GMT,Sample #,Fuel Sample Material,Flow restrictor,Fan display,Air display,Radiometer gain   (1000   250   50   10),Total Frames Shot,Calibrated  initial O2 % by vol ,Calibrated final O2 % by vol,Initial CO2 % by vol,Final CO2 % by vol,Initial CO (ppm),Final CO (ppm)
  esquema: psi025.bass2

### psi_csv/psi_026_bass_1.csv  (4726 bytes)
  codificación: utf-8-sig · filas: 122 · separador: ','
  cabecera: Date,GMT,As Run Test #,Test #,Sample #,Fuel Sample Material
  esquema: psi026.bass1

### psi_csv/psi_039_cfi.csv  (7792 bytes)
  codificación: utf-8-sig · filas: 87 · separador: ','
  cabecera: Flex Number,Test Date,Local Time,CIR ,Pressure,Oxygen,Nitrogen,Helium,Fiber,Fuel 
  esquema: psi039.cfi

### psi_csv/psi_068_flex_2.csv  (1029 bytes)
  codificación: utf-8-sig · filas: 8 · separador: ','
  cabecera: Sample (Fuel Type),Initial Droplet Diameter (mm),Ambient Gas Mixture ,Oxygen Mole Fraction,Ambient Pressure (atm), Ambient Temperature (C),Flow Velocity (cm/s)
  esquema: psi068.flex2

### psi_csv/psi_069_flex_1.csv  (24776 bytes)
  codificación: cp1252 · filas: 274 · separador: ','
  cabecera: FLEX Test #,FLEX Identifier,Test Date,Test GMT,Fuel,Ambient pressure; mmHg,O initial ambient composition; mole fraction,N initial ambient composition; mole fraction,CO initial ambient composition; mole fraction,He initial ambient composition; mole fraction,Droplet initial diameter; mm,Visible flame 
  esquema: psi069.flex1

### psi_csv/psi_098_saffire_1.csv  (467 bytes)
  codificación: utf-8-sig · filas: 4 · separador: ','
  cabecera: Sample Number ,Material,Sample Thickness (cm),Sample Length (cm),Sample Width (cm),Air Flow (cm/s),Percent O2,Ignition Power (W),Ignition Time (s),Burn Time (s),Flow Direction ,Camera 1,Camera 2
  esquema: psi098.saffire1

### psi_csv/psi_099_saffire_2.csv  (1973 bytes)
  codificación: utf-8-sig · filas: 15 · separador: ','
  cabecera: Sample Number,Material,Samle Thickness ,Sample Length ,Sample Width (cm),Air Flow (cm/s),Percent O2 (Note 1),Ignition Power (W),Ignition Time (s),Burn Time (s),Flow Direction,?-g Burn Length,?-g Spread Length,1-g Burn Length,1-g Spread Rate,Camera 1,Camera 2
  esquema: psi099.saffire2

### psi_csv/psi_100_saffire_3.csv  (239 bytes)
  codificación: utf-8-sig · filas: 2 · separador: ','
  cabecera: Sample Number ,Material,Sample Thickness,Sample Length,Sample Width,Air Flow ,Direction,Camera 1,Camera 2
  esquema: psi100.saffire3

### psi_csv/psi_101_same_r.csv  (5674 bytes)
  codificación: utf-8-sig · filas: 109 · separador: ','
  cabecera: Sample Type,SAME Test #,Description,Date,Inlet velocity (cm/s),Rt/R0,Duration (sec),Primary aging time (sec),Primary mixing time (sec),Net aging time (sec)
  esquema: psi101.samer

### psi_csv/psi_102_same.csv  (331 bytes)
  codificación: utf-8-sig · filas: 8 · separador: ','
  cabecera: Sample #,Sample Material  ,Air Flow (cm/s),Weight loss rate (mg/min),Aging Duration (minutes)
  esquema: psi102.same

### psi_csv/psi_106_slice.csv  (734 bytes)
  codificación: utf-8-sig · filas: 12 · separador: ','
  cabecera: Test Date,Fuel Type
  esquema: psi106.slice

### psi_csv/psi_107_spice.csv  (31205 bytes)
  codificación: utf-8-sig · filas: 469 · separador: ','
  cabecera: GMT date,GMT ignition,GMT  Flame Off ,Fuel,Nozzle (mm),Fuel Rate (sccm),Fuel Rate (mg/s),HC Fuel Rate (mg/s),Air Rate (cm/s)
  esquema: psi107.spice

### psi_csv/psi_159_cfi_g_inverse.csv  (39422 bytes)
  codificación: utf-8-sig · filas: 1015 · separador: ','
  cabecera: Flame Type,Day,Fuel,Test,Xf  before test,Xf  after test,approx p (bar),XO2,HC burnrate (mg/s),O2 flow rate (mg/s),TFP,Tad (K),Zst,Hot ignition,burn time (sec),Self -ext or flow term,Peak burner Temp (C),Peak burner temp (K),Color,Comments
  esquema: psi159.cfi_inv

### psi_csv/psi_159_cfi_g_normal.csv  (22166 bytes)
  codificación: utf-8-sig · filas: 179 · separador: ','
  cabecera: Flame Type,Day,Fuel,Test,Cool flame?, XO2 before test,XO2  after test,approx p (bar),Xf,mHC (mg/s),TFP,Tad (K),Zst,Hot ignition,burn time (sec),Self-ext or flow term,Peak burner T (C ),Comments
  esquema: psi159.cfi_norm

### spinoffs_txt/brunswick_fire_detector.txt  (3128 bytes)  [beneficio terrestre]
  codificación: utf-8-sig · líneas con texto: 22 · caracteres: 3089
    | ================================================================================
    | TRANSFERENCIA TECNOLÓGICA (EARTH SPIN-OFF): DETECTOR DE FUEGO INCIPIENTE (1978)
    | Fuente: NASA Spinoff 1978 — NASA Headquarters (Document ID: 20070018916)
    | ================================================================================

### spinoffs_txt/project_fires_1982.txt  (4055 bytes)  [beneficio terrestre]
  codificación: utf-8-sig · líneas con texto: 28 · caracteres: 3981
    | ================================================================================
    | TRANSFERENCIA TECNOLÓGICA (EARTH SPIN-OFF): TRAJES IGNÍFUGOS PARA BOMBEROS (1982)
    | Fuente: NASA Spinoff 1982 — Marshall Space Flight Center (Document ID: 20030002834)
    | ================================================================================

### spinoffs_txt/scott_air_pak.txt  (3366 bytes)  [beneficio terrestre]
  codificación: utf-8-sig · líneas con texto: 29 · caracteres: 3317
    | ================================================================================
    | TRANSFERENCIA TECNOLÓGICA (EARTH SPIN-OFF): TANQUES DE AIRE PARA BOMBEROS (1976)
    | Fuente: NASA Spinoff 1976 — Johnson Space Center (Document ID: 20030005480)
    | ================================================================================