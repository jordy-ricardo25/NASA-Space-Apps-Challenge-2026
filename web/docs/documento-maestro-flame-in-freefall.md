# Fuego en baja gravedad: base técnica, física y de datos para el software del reto "Flame in Freefall"

## Índice

- [1. Glosario técnico extendido](#1-glosario-técnico-extendido)
   - [1.1 Siglas de programas, experimentos y hardware](#11-siglas-de-programas-experimentos-y-hardware)
   - [1.2 Términos físicos y químicos](#12-términos-físicos-y-químicos)
   - [1.3 Química de la llama, hollín y términos de software](#13-química-de-la-llama-hollín-y-términos-de-software)
- [2. Propósito del software y alineación con el reto](#2-propósito-del-software-y-alineación-con-el-reto)
   - [2.1 El problema que resuelve el software](#21-el-problema-que-resuelve-el-software)
   - [2.2 Las cuatro funciones del sistema](#22-las-cuatro-funciones-del-sistema-)
   - [2.3 Fuera del alcance](#23-fuera-del-alcance)
   - [2.4 Etiquetas de origen](#24-etiquetas-de-origen)
   - [2.5 Mapa de la bibliografía del proyecto](#25-mapa-de-la-bibliografía-del-proyecto)
   - [2.6 Unidades](#26-unidades)
- [3. Contexto científico del reto](#3-contexto-científico-del-reto)
   - [3.1 La estrategia de NASA: prevenir, detectar, suprimir y limpiar](#31-la-estrategia-de-nasa-prevenir-detectar-suprimir-y-limpiar)
   - [3.2 Por qué estudiar el fuego sin gravedad](#32-por-qué-estudiar-el-fuego-sin-gravedad)
   - [3.3 Línea de tiempo resumida](#33-línea-de-tiempo-resumida)
- [4. Química y termodinámica de la combustión: el tetraedro del fuego](#4-química-y-termodinámica-de-la-combustión-el-tetraedro-del-fuego)
   - [4.1 El tetraedro del fuego](#41-el-tetraedro-del-fuego)
   - [4.2 Química y cinética: qué tan rápido reacciona](#42-química-y-cinética-qué-tan-rápido-reacciona)
   - [4.3 Oxígeno y presión: por qué "respirar igual" no es "arder igual"](#43-oxígeno-y-presión-por-qué-respirar-igual-no-es-arder-igual)
   - [4.4 Cómo la ausencia de gravedad altera el tetraedro](#44-cómo-la-ausencia-de-gravedad-altera-el-tetraedro)
- [5. Transporte de calor, masa y cantidad de movimiento: gravedad y microgravedad](#5-transporte-de-calor-masa-y-cantidad-de-movimiento-gravedad-y-microgravedad)
   - [5.1 Gravedad y flotabilidad: por qué la vela tiene forma de gota](#51-gravedad-y-flotabilidad-por-qué-la-vela-tiene-forma-de-gota)
   - [5.2 Qué es la microgravedad y cómo se consigue](#52-qué-es-la-microgravedad-y-cómo-se-consigue)
   - [5.3 Transferencia de calor: los tres caminos](#53-transferencia-de-calor-los-tres-caminos)
   - [5.4 Transferencia de masa: cómo llega el oxígeno](#54-transferencia-de-masa-cómo-llega-el-oxígeno)
   - [5.5 Números adimensionales: el "idioma común" para comparar ambientes](#55-números-adimensionales-el-idioma-común-para-comparar-ambientes-)
- [6. Comportamiento del fuego en los entornos críticos](#6-comportamiento-del-fuego-en-los-entornos-críticos)
   - [6.1 Entorno terrestre estándar (1 g): el penacho ascendente](#61-entorno-terrestre-estándar-1-g-el-penacho-ascendente)
   - [6.2 Microgravedad (ISS y naves en tránsito): difusión y ventilación](#62-microgravedad-iss-y-naves-en-tránsito-difusión-y-ventilación)
   - [6.3 Gravedad parcial (Luna 0,165 g; Marte 0,38 g)](#63-gravedad-parcial-luna-0165-g-marte-038-g)
   - [6.4 Cabinas presurizadas, baja presión y atmósferas enriquecidas en oxígeno](#64-cabinas-presurizadas-baja-presión-y-atmósferas-enriquecidas-en-oxígeno)
   - [6.5 Tabla comparativa de entornos](#65-tabla-comparativa-de-entornos-)
- [7. Dinámica y comportamiento del hollín (soot)](#7-dinámica-y-comportamiento-del-hollín-soot)
   - [7.1 Qué es el hollín](#71-qué-es-el-hollín)
   - [7.2 Ciclo de vida del hollín](#72-ciclo-de-vida-del-hollín)
   - [7.3 Hollín en la Tierra frente a microgravedad](#73-hollín-en-la-tierra-frente-a-microgravedad)
   - [7.4 Radiación del hollín e impacto en la propagación del fuego](#74-radiación-del-hollín-e-impacto-en-la-propagación-del-fuego)
   - [7.5 Hollín, humo y detección](#75-hollín-humo-y-detección)
   - [7.6 Qué datos de hollín existen y cómo usarlos en el software](#76-qué-datos-de-hollín-existen-y-cómo-usarlos-en-el-software-)
- [8. Propagación sobre sólidos y límites de inflamabilidad](#8-propagación-sobre-sólidos-y-límites-de-inflamabilidad)
   - [8.1 Propagación de llama sobre sólidos](#81-propagación-de-llama-sobre-sólidos)
   - [8.2 Límites de inflamabilidad: dónde el fuego deja de existir](#82-límites-de-inflamabilidad-dónde-el-fuego-deja-de-existir)
- [9. Gotas, llamas frías y supresión](#9-gotas-llamas-frías-y-supresión)
   - [9.1 Gotas: la ley d² y las llamas frías](#91-gotas-la-ley-d²-y-las-llamas-frías)
   - [9.2 Supresión: cómo se apaga un fuego sin gravedad](#92-supresión-cómo-se-apaga-un-fuego-sin-gravedad)
- [10. Humo, detección y escala de cabina](#10-humo-detección-y-escala-de-cabina)
   - [10.1 Humo y detección](#101-humo-y-detección)
   - [10.2 Escala de cabina: calor, gases tóxicos y limpieza](#102-escala-de-cabina-calor-gases-tóxicos-y-limpieza)
- [11. Ecuaciones de gobierno y constantes](#11-ecuaciones-de-gobierno-y-constantes)
   - [11.1 Ecuaciones de gobierno (modelo de bajo número de Mach) [INF]](#111-ecuaciones-de-gobierno-modelo-de-bajo-número-de-mach-inf)
   - [11.2 Constantes y valores de referencia](#112-constantes-y-valores-de-referencia-)
- [12. Análisis de datos de la NASA y la PSI (Physical Sciences Informatics)](#12-análisis-de-datos-de-la-nasa-y-la-psi-physical-sciences-informatics)
   - [12.1 Qué es PSI y cómo está organizado](#121-qué-es-psi-y-cómo-está-organizado)
   - [12.2 Inventario de investigaciones y su utilidad](#122-inventario-de-investigaciones-y-su-utilidad-)
   - [12.3 Instalaciones y rangos de operación (límites físicos de los datos)](#123-instalaciones-y-rangos-de-operación-límites-físicos-de-los-datos-)
   - [12.4 Datos cuantitativos clave ya extraídos](#124-datos-cuantitativos-clave-ya-extraídos-)
   - [12.5 Parámetros críticos que el software debe procesar (diccionario de datos)](#125-parámetros-críticos-que-el-software-debe-procesar-diccionario-de-datos-)
   - [12.6 Conversiones obligatorias](#126-conversiones-obligatorias-)
   - [12.7 Modelo de datos (entidades)](#127-modelo-de-datos-entidades-)
   - [12.8 Catálogo de ambientes](#128-catálogo-de-ambientes-)
   - [12.9 Errores de datos que el software debe prevenir](#129-errores-de-datos-que-el-software-debe-prevenir-)
- [13. Especificación del modelo predictivo (aprendizaje automático y simulación)](#13-especificación-del-modelo-predictivo-aprendizaje-automático-y-simulación)
   - [13.0 Decisión de modelos: qué es "modelo predictivo" en este reto y cuál construir](#130-decisión-de-modelos-qué-es-modelo-predictivo-en-este-reto-y-cuál-construir-)
   - [13.1 Principios de diseño [REQ][INF]](#131-principios-de-diseño-reqinf)
   - [13.2 ¿Qué debe predecir el modelo? (salidas objetivo)](#132-qué-debe-predecir-el-modelo-salidas-objetivo-)
   - [13.3 ¿Con qué datos? (entradas requeridas)](#133-con-qué-datos-entradas-requeridas-)
   - [13.4 Arquitectura lógica del modelo](#134-arquitectura-lógica-del-modelo-)
   - [13.5 Modelo de sólidos: frontera de propagación](#135-modelo-de-sólidos-frontera-de-propagación)
   - [13.6 Modelo de líquidos: K y modo de terminación](#136-modelo-de-líquidos-k-y-modo-de-terminación)
   - [13.7 Margen de inflamabilidad e índice de riesgo](#137-margen-de-inflamabilidad-e-índice-de-riesgo)
   - [13.8 Ranking de investigaciones (O1)](#138-ranking-de-investigaciones-o1)
   - [13.9 Niveles de evidencia](#139-niveles-de-evidencia)
   - [13.10 Métricas de validación [INF]](#1310-métricas-de-validación-inf)
   - [13.11 Visualización del modelo](#1311-visualización-del-modelo-)
- [14. Interoperabilidad tecnológica: entrenamiento en R (RStudio) ↔ backend en Python (FastAPI)](#14-interoperabilidad-tecnológica-entrenamiento-en-r-rstudio--backend-en-python-fastapi)
   - [14.1 Decisión recomendada](#141-decisión-recomendada-)
   - [14.2 Contrato de artefactos entre R y Python](#142-contrato-de-artefactos-entre-r-y-python-)
   - [14.3 Código de exportación en R](#143-código-de-exportación-en-r)
   - [14.4 Backend mínimo en FastAPI (probado)](#144-backend-mínimo-en-fastapi-probado)
   - [14.5 Puesta en producción en tres niveles (del más simple al más completo)](#145-puesta-en-producción-en-tres-niveles-del-más-simple-al-más-completo)
- [15. Arquitectura del producto software y UI/UX](#15-arquitectura-del-producto-software-y-uiux)
   - [15.1 Módulos del producto y objetivos del reto](#151-módulos-del-producto-y-objetivos-del-reto)
   - [15.2 Apartado "Classroom" — Centro de Inteligencia y Divulgación (Objetivo 1)](#152-apartado-classroom--centro-de-inteligencia-y-divulgación-objetivo-1)
   - [15.3 Visualización de datos de PSI en el dashboard](#153-visualización-de-datos-de-psi-en-el-dashboard-)
   - [15.4 Arquitectura técnica mínima (propuesta)](#154-arquitectura-técnica-mínima-propuesta)
   - [15.5 Recorrido de demostración (alineado con los cuatro objetivos)](#155-recorrido-de-demostración-alineado-con-los-cuatro-objetivos)
- [16. Lecciones históricas de seguridad aeroespacial](#16-lecciones-históricas-de-seguridad-aeroespacial)
   - [16.1 Apolo 1 (27 de enero de 1967): el fuego en una atmósfera de oxígeno puro](#161-apolo-1-27-de-enero-de-1967-el-fuego-en-una-atmósfera-de-oxígeno-puro)
   - [16.2 Apolo 13 (13–14 de abril de 1970): la explosión del tanque de oxígeno](#162-apolo-13-1314-de-abril-de-1970-la-explosión-del-tanque-de-oxígeno)
   - [16.3 Incendio de la estación Mir (23 de febrero de 1997): el fuego que traía su propio oxígeno](#163-incendio-de-la-estación-mir-23-de-febrero-de-1997-el-fuego-que-traía-su-propio-oxígeno)
   - [16.4 Otros antecedentes útiles](#164-otros-antecedentes-útiles)
   - [16.5 Síntesis: reglas de diseño derivadas de la historia](#165-síntesis-reglas-de-diseño-derivadas-de-la-historia-)
- [17. Tecnologías derivadas (spin-offs) y aplicaciones terrestres](#17-tecnologías-derivadas-spin-offs-y-aplicaciones-terrestres)
   - [17.1 Tanques de aire ligeros para bomberos (transferencia documentada)](#171-tanques-de-aire-ligeros-para-bomberos-transferencia-documentada)
   - [17.2 Detectores de fuego y humo](#172-detectores-de-fuego-y-humo)
   - [17.3 Materiales para trajes de bomberos](#173-materiales-para-trajes-de-bomberos)
   - [17.4 Otras transferencias y aplicaciones](#174-otras-transferencias-y-aplicaciones)
- [18. Enlaces de descarga directa y referencias bibliográficas](#18-enlaces-de-descarga-directa-y-referencias-bibliográficas)
   - [18.1 Reto y documentos del equipo](#181-reto-y-documentos-del-equipo)
   - [18.2 Datos: PSI](#182-datos-psi)
   - [18.3 Divulgación y guías oficiales de NASA](#183-divulgación-y-guías-oficiales-de-nasa)
   - [18.4 Reportes NASA (NTRS) con descarga directa](#184-reportes-nasa-ntrs-con-descarga-directa)
   - [18.5 Artículos de revista (DOI)](#185-artículos-de-revista-doi)
   - [18.6 Normas](#186-normas)
   - [18.7 Casos históricos](#187-casos-históricos)
   - [18.8 Spin-offs](#188-spin-offs)
- [19. Anexo para la IA de software: reglas, prohibiciones y pendientes](#19-anexo-para-la-ia-de-software-reglas-prohibiciones-y-pendientes)
   - [19.1 Reglas que el código debe cumplir](#191-reglas-que-el-código-debe-cumplir-)
   - [19.2 Frases prohibidas y su versión correcta](#192-frases-prohibidas-y-su-versión-correcta)
   - [19.3 Recorrido de demostración verificable (guion)](#193-recorrido-de-demostración-verificable-guion)
   - [19.4 Puntos abiertos que bloquean o condicionan el desarrollo](#194-puntos-abiertos-que-bloquean-o-condicionan-el-desarrollo)
   - [19.5 Lista de verificación antes de publicar el producto](#195-lista-de-verificación-antes-de-publicar-el-producto)

---

## 1. Glosario técnico extendido

### 1.1 Siglas de programas, experimentos y hardware

| Sigla / Término | Significado en inglés | Significado y explicación en español (desde cero) |
|---|---|---|
| **ACME** | Advanced Combustion via Microgravity Experiments | Proyecto de NASA con seis experimentos de llamas de **gas** en la ISS (2017–2022), todos con el mismo hardware dentro del CIR. [B3][WEB] |
| **BASS / BASS-II** | Burning and Suppression of Solids | Experimentos en la guantera MSG de la ISS que queman muestras **sólidas** pequeñas (acrílico, papel, tejidos) variando flujo de aire y O₂. Los datos de BASS-II están en PSI-25. [REQ][INF] |
| **BRE** | Burning Rate Emulator | Quemador poroso plano que expulsa gas combustible para **imitar** cómo arde la superficie de un sólido. Ayuda a estudiar el calor que vuelve a la superficie. No es una medición directa de cada plástico. [B3][INF] |
| **CFI / CFI-G** | Cool Flames Investigation / with Gases | Experimentos sobre **llamas frías** (ver glosario 1.2). CFI usó gotas; CFI-G usó gases en quemador poroso, con oxígeno de hasta 85 %. [REQ][B3] |
| **CIR** | Combustion Integrated Rack | "Armario de combustión" de la ISS: cámara de unos 100 L con ventanas ópticas, suministro de gases, ventilación y cámaras. Llegó a la ISS en noviembre de 2008. [B3][WEB] |
| **CLD Flame** | Coflow Laminar Diffusion Flame | Experimento ACME sobre llamas de chorro de gas rodeadas de aire que fluye en la misma dirección; midió hollín. [B3] |
| **DAFT** | Dust and Aerosol measurement Feasibility Test | Prueba en la ISS para comprobar si los instrumentos de medición de partículas funcionaban en microgravedad, usando polvo de referencia. Precursor de SAME. [B15][WEB] |
| **E-FIELD Flames** | Electric-Field Effects on Laminar Diffusion Flames | Experimento ACME que aplica un campo eléctrico a la llama. Los iones de la llama se mueven y arrastran gas ("viento iónico"), lo que cambia su forma. **Es un análogo de un mecanismo de transporte, no un convertidor de voltios a gravedad.** [B3][INF] |
| **ECLSS** | Environmental Control and Life Support System | Sistema de soporte vital: ventila, filtra, controla O₂, CO₂ y humedad. En un incendio puede alimentar la llama (trae O₂) y a la vez limpiar el humo. [INF][B22] |
| **Flame Design** | Flame Design | Experimento ACME sobre cómo "diseñar" llamas sin hollín variando dónde está el oxígeno (llama normal o inversa). [B3] |
| **FLARE** | Flammability Limits at Reduced gravity Experiment | Experimento japonés (JAXA) en el módulo Kibo de la ISS con PMMA y NOMEX. [INF] |
| **FLEX / FLEX-2** | Flame Extinguishment Experiment | Experimentos de **gotas** de combustible líquido (metanol, heptano) que arden en atmósferas con distinto O₂, CO₂, He y presión. Descubrieron las llamas frías sin premezcla. Datos en PSI-69. [INF][WEB] |
| **FM2** | Flammability of Materials on the Moon | Experimento futuro que quemará materiales **en la superficie de la Luna** (gravedad lunar real y prolongada). Volará en el aterrizador HLS. Aún no hay resultados en superficie. [B7][INF] |
| **FWM** | Fine Water Mist (extinguisher) | Extintor portátil de **niebla de agua fina** desarrollado para la ISS para reemplazar los extintores de CO₂. [B16][WEB] |
| **GEL** | Growth and Extinction Limit | Investigación de SoFIE sobre crecimiento y extinción de llama en sólidos gruesos. [WEB] |
| **HLS** | Human Landing System | Aterrizador lunar tripulado del programa Artemis. [B7] |
| **ISS** | International Space Station | Estación Espacial Internacional. Laboratorio en órbita baja donde la gravedad aparente es casi cero. |
| **LUCI** | Lunar Combustion Investigation | Ensayo en un cohete suborbital New Shepard que **gira** para crear gravedad lunar artificial durante más de 2,5 min (vuelo del 4-feb-2025). Gravedad simulada por rotación, en aire normal. [INF] |
| **MDCA** | Multi-user Droplet Combustion Apparatus | Inserto del CIR para quemar gotas de 1–5 mm a 0–3 atm con hasta 40 % de O₂. [WEB] |
| **MIST (SoFIE)** | Material Ignition and Suppression Test | Investigación de SoFIE. **Ojo:** "MIST" aquí **no** significa niebla de agua. [INF] |
| **Mist (STS-107)** | Water-Mist Fire Suppression Experiment | Experimento del transbordador Columbia (2003) sobre cómo una nube de gotas de agua frena una llama premezclada de propano. [B18] |
| **MSG** | Microgravity Science Glovebox | Guantera sellada de 255 L en la ISS donde se hacen experimentos que la tripulación manipula con guantes. [WEB] |
| **PSI** | Physical Sciences Informatics | Repositorio abierto de NASA con datos de experimentos de ciencias físicas en microgravedad. Combustión es una de sus seis áreas. [WEB][REQ] |
| **s-Flame** | Structure and Response of Spherical Diffusion Flames | Experimento ACME con llamas **esféricas** de gas alrededor de un quemador poroso; estudió extinción radiativa y cinética. [B3] |
| **Saffire (I–VI)** | Spacecraft Fire Safety Demonstration | Incendios **grandes** (muestras de decenas de cm) dentro de la nave de carga Cygnus, después de separarse de la ISS y sin tripulación. Miden propagación, calor, gases y humo a escala de nave. [B2][B10] |
| **SAME / SAME-2 (SAME-R)** | Smoke Aerosol Measurement Experiment | Experimentos que calientan materiales de nave (Teflon, Kapton, silicona, algodón…) para producir humo y medir el tamaño de sus partículas. [B11][B13] |
| **SIBAL** | Solid Inflammability Boundary at Low Speed | Tejido de 75 % algodón y 25 % fibra de vidrio usado como material de referencia en Saffire (densidad superficial 18,05 mg/cm²). [B2] |
| **SLICE** | Structure & Liftoff in Combustion Experiment | Experimento sobre llamas de chorro de gas que se "despegan" del quemador. Operó en 2012 dentro de la MSG con el hardware de SPICE. [WEB] |
| **SMAC** | Spacecraft Maximum Allowable Concentration | Concentración máxima de un contaminante que la tripulación puede respirar durante un tiempo dado (1 h, 24 h…). Documento JSC 20584. [INF] |
| **SoFIE** | Solid Fuel Ignition and Extinction | Instalación del CIR (lanzada en febrero de 2022) para estudiar ignición, propagación y extinción de **sólidos**: 10–40 % O₂, 0,2–1,5 atm, flujo de 0–30 cm/s. [WEB] |
| **SPICE** | Smoke Point In Coflow Experiment | Experimento sobre el "punto de humo": cuándo una llama de gas empieza a soltar hollín. [REQ] |
| **SEA** | Spacecraft/Space Exploration Atmosphere | Atmósfera de exploración propuesta: **34 % O₂ a 8,2 psia (56,5 kPa)**. Menos presión facilita las caminatas espaciales; más fracción de O₂ aumenta la inflamabilidad. [REQ][B7] |
| **WSTF** | White Sands Test Facility | Instalación de NASA en Nuevo México donde se hacen ensayos terrestres de inflamabilidad y baterías. [B6][INF] |
| **NTRS** | NASA Technical Reports Server | Buscador oficial de reportes técnicos de NASA (ntrs.nasa.gov). |
| **NASA-STD-6001B** | Flammability, Offgassing, and Compatibility Requirements and Test Procedures | Norma de NASA que dice cómo se prueba si un material es aceptable para una nave. Su **Test 1** es la prueba de propagación hacia arriba. [B9] |
| **NASA-STD-3001** | Spaceflight Human-System Standard | Norma de salud y factores humanos; de ella derivan los requisitos de protección contra incendios (OCHMO-TB-008). [B22] |
| **FDS** | Fire Dynamics Simulator | Software libre del NIST para simular incendios y transporte de humo (CFD). [INF] |
| **CFD** | Computational Fluid Dynamics | Simulación numérica de cómo se mueven gases y líquidos. |

### 1.2 Términos físicos y químicos

| Sigla / Término | Significado en inglés | Significado y explicación en español (desde cero) |
|---|---|---|
| **Combustión** | Combustion | Reacción química rápida entre un **combustible** y un **oxidante** (aquí, oxígeno) que libera calor y luz. Necesita los tres lados del "triángulo del fuego": combustible, oxígeno y calor. |
| **Microgravedad (µg)** | Microgravity | Situación de **caída libre** en la que los objetos "flotan" entre sí. No es ausencia de gravedad: la ISS cae continuamente alrededor de la Tierra. La aceleración residual es del orden de una millonésima de g. [T] |
| **g₀** | Standard gravity | Aceleración de referencia en la Tierra: 9,80665 m/s². Se escribe la gravedad del escenario como fracción: Luna ≈ 0,165 g₀, Marte ≈ 0,38 g₀. [INF] |
| **Gravedad parcial** | Partial gravity | Cualquier gravedad entre 0 y 1 g₀ (Luna, Marte). **No hay datos de PSI en gravedad parcial**; existen datos de vuelos parabólicos, centrífugas y LUCI. [REQ][INF] |
| **Flotabilidad (buoyancy)** | Buoyancy | Empuje hacia arriba que sufre el gas caliente porque es menos denso que el aire frío que lo rodea (como un globo aerostático). Es lo que hace que una vela tenga forma de gota. Desaparece en microgravedad. |
| **Convección natural** | Natural convection | Movimiento del aire causado por la flotabilidad: el aire caliente sube y el frío baja. En la Tierra trae oxígeno fresco a la llama y se lleva los productos. |
| **Convección forzada** | Forced convection | Movimiento del aire impuesto por un ventilador o por el ECLSS. En una nave típica es de unos 10–20 cm/s. [B4] |
| **Difusión** | Diffusion | Mezcla de gases por el movimiento aleatorio de las moléculas, sin corrientes de aire. Es lenta. En microgravedad quieta, es casi la única forma de que el O₂ llegue a la llama. |
| **Llama de difusión** | Diffusion (non-premixed) flame | Llama donde combustible y oxígeno llegan **por separado** y se encuentran en la llama (vela, fogata, incendio). Es el tipo relevante para incendios. |
| **Llama premezclada** | Premixed flame | Llama donde el combustible y el aire ya están mezclados antes de arder (estufa de gas, motor). |
| **Penacho (plume)** | Plume | Columna de gases calientes que sube sobre un fuego en la Tierra. |
| **Hollín (soot)** | Soot | Partículas sólidas de carbono que se forman en la llama. Brillan en amarillo-naranja cuando están calientes. En la Tierra la flotabilidad las lleva hacia arriba y las quema; en microgravedad pueden quedar atrapadas. |
| **Pirólisis** | Pyrolysis | Descomposición de un sólido por calor **sin** llama: el plástico se "cocina" y suelta vapores combustibles. Esos vapores son los que realmente arden. |
| **Ignición** | Ignition | Inicio de una reacción que se sostiene sola. |
| **Propagación (flame spread)** | Flame spread | Avance del frente de llama sobre combustible que aún no ha ardido. |
| **Extinción** | Extinction | Apagado de la llama. Puede ser por falta de O₂, por enfriamiento (pérdidas de calor) o por soplado (flujo demasiado rápido). |
| **Regresión** | Regression | Retroceso de la superficie de un sólido que se consume en su sitio, aunque el frente ya no avance. [INF] |
| **Flujo opuesto** | Opposed flow | El aire viene **contra** la dirección en que avanza la llama. Como caminar contra el viento. [INF] |
| **Flujo concurrente** | Concurrent flow | El aire va **en la misma dirección** que la llama; la empuja hacia el combustible nuevo. En la Tierra, la llama que sube por una cortina es concurrente. [INF] |
| **Térmicamente delgado** | Thermally thin | Material tan delgado (papel, tela) que se calienta casi uniforme en todo su espesor. [T] |
| **Térmicamente grueso** | Thermally thick | Material grueso (placa de acrílico) en el que solo se calienta una capa superficial. [T] |
| **Longitud de precalentamiento (ℓh, Lg)** | Preheat-zone length | Distancia delante de la llama donde el combustible se calienta antes de arder. Responde rápido a la gravedad y sirve como indicador en vuelos cortos. [B5] |
| **LOC** | Limiting Oxygen Concentration | **Mínimo** porcentaje de O₂ con el que un material todavía arde **bajo un protocolo concreto**. Por debajo, se apaga. Cambia con la geometría, el flujo, la presión y la gravedad. [INF] |
| **LOC-FS** | LOC for Flame Spread | LOC para que el frente **siga avanzando**. [INF] |
| **LOC-FR** | LOC for Flame Regression (extinction) | LOC para que la llama se apague **por completo**, incluida la combustión en el sitio. Para PMMA, LOC-FS > LOC-FR. [INF] |
| **MLOC** | Minimum LOC | El LOC más bajo cuando se barre otra variable (flujo o gravedad). Es la condición "más peligrosa". [B8][INF] |
| **MOC** | Maximum Oxygen Concentration | En NASA-STD-6001B, el **máximo** O₂ en el que **cinco** probetas superan el Test 1. Es la cifra que usan los ingenieros de materiales. [B9] |
| **OI / LOI** | Oxygen Index / Limiting Oxygen Index | Mínimo O₂ en el que un material arde como una vela, según ASTM D2863. Útil para comparar, no para predecir el comportamiento en una nave. [B9] |
| **ppO₂ (pO₂)** | Oxygen partial pressure | La "parte" de la presión total que corresponde al oxígeno: $p_{O_2}=x_{O_2}\,P$. Es lo que importa para **respirar**. [INF] |
| **xO₂ (fracción molar)** | Oxygen mole fraction | Porcentaje de moléculas que son oxígeno. Es lo que más importa para **arder**. [INF] |
| **Diluyente** | Diluent | Gas que no arde y "estorba" a la reacción: N₂, CO₂, He. Absorbe calor y aleja el O₂. |
| **Supresión** | Suppression | Acción de apagar o frenar un fuego (agente químico, agua, gas inerte, cortar ventilación). |
| **Ley d²** | d-squared law | Regla que dice que el **cuadrado** del diámetro de una gota que arde disminuye en línea recta con el tiempo. [INF][T] |
| **K (constante de combustión)** | Burning-rate constant | Pendiente de la ley d²; unidades mm²/s. [INF] |
| **Llama fría (cool flame)** | Cool flame | Llama química de baja temperatura (≈500–800 K) e invisible al ojo, que puede seguir oxidando el combustible **después** de que la llama visible se apague. Riesgo de reignición. [WEB][T] |
| **Extinción radiativa** | Radiative extinction | Apagado porque la llama pierde demasiado calor por radiación. Frecuente con flujo muy bajo en microgravedad. [B4][B3] |
| **Soplado (blowoff)** | Blowoff | Apagado porque el flujo es tan rápido que los reactivos no tienen tiempo de reaccionar. [B4] |
| **Damköhler (Da)** | Damköhler number | Cociente entre el tiempo que el gas pasa junto a la llama y el tiempo que tarda la química. Da bajo → soplado. [INF] |
| **HRR (Q̇)** | Heat Release Rate | Potencia del fuego en W o kW. **No confundir** con energía total (kJ, Wh). [INF] |
| **Calorimetría por consumo de O₂** | Oxygen consumption calorimetry | Método para medir la potencia de un fuego: casi todos los combustibles liberan ≈13,1 kJ por gramo de O₂ consumido. [B2] |
| **Aerosol** | Aerosol | Partículas sólidas o líquidas suspendidas en el aire (humo, polvo). |
| **Detector de ionización** | Ionization smoke detector | Detector con una fuente radiactiva débil que ioniza el aire; el humo reduce la corriente. Más sensible a partículas pequeñas. [B15][B12] |
| **Detector fotoeléctrico / de dispersión** | Photoelectric / light-scattering detector | Detector con un láser o LED; las partículas desvían luz hacia un sensor. Más sensible a partículas grandes. El de la ISS es de este tipo. [B12] |
| **Obscuración (%/ft)** | Obscuration per foot | Porcentaje de luz que el humo bloquea por cada pie de recorrido. La ISS alarma a 1 %/ft para humo de combustión lenta. [WEB] |
| **Distribución lognormal** | Log-normal distribution | Forma típica en que se reparten los tamaños de las partículas de humo: muchas pequeñas, pocas grandes. [B11][B12] |
| **Proxy** | Proxy | Mecanismo sustituto que imita parte de un fenómeno (E-FIELD imita flotabilidad). [REQ] |
| **Extrapolación** | Extrapolation | Estimar fuera del rango donde hay datos. Siempre debe marcarse. [REQ][INF] |
| **Bajo número de Mach** | Low-Mach-number | Aproximación para flujos lentos comparados con la velocidad del sonido; la densidad sigue cambiando con la temperatura. [INF] |
| **Coriolis** | Coriolis effect | Fuerza aparente en un sistema que gira (centrífugas, LUCI) que desvía el gas en movimiento. Debe evaluarse en datos de gravedad simulada por rotación. [INF][B8] |
| **g-jitter** | g-jitter | Pequeñas vibraciones de la aceleración en vuelos parabólicos o en la ISS. [B5] |

---

### 1.3 Química de la llama, hollín y términos de software

| Sigla / Término | Significado en inglés | Significado y explicación en español (desde cero) |
|---|---|---|
| **Tetraedro del fuego** | Fire tetrahedron | Modelo de cuatro elementos que necesita el fuego: combustible, comburente, calor y reacción en cadena. Si se quita uno, el fuego se apaga. [T] |
| **Comburente** | Oxidizer | La sustancia que "acepta" el combustible al arder; aquí, el oxígeno. |
| **Radical libre** | Free radical | Átomo o fragmento de molécula con un electrón suelto (H·, O·, OH·). Muy reactivo; es el "mensajero" que mantiene viva la llama. [T] |
| **Reacción en cadena / ramificación** | Chain reaction / chain branching | Secuencia en la que cada reacción crea radicales para la siguiente. Si una reacción crea dos radicales de uno (ramificación), la llama se acelera sola. [T] |
| **Halón** | Halon | Agente extintor que libera bromo, que captura radicales y corta la reacción en cadena. Se usó en la espuma de los extintores de Mir (Halón 1301). [B22][T] |
| **Venteo** | Venting | Apagar un fuego bajando la presión de la cabina hacia el vacío. Opción que solo existe en el espacio. [WEB] |
| **Fracción volumétrica de hollín ($f_v$)** | Soot volume fraction | Volumen ocupado por hollín por cada volumen de gas (típico: 0,1–10 ppm). [T] |
| **PAH** | Polycyclic Aromatic Hydrocarbons | Moléculas de varios anillos de carbono; son los "ladrillos" del hollín. [T] |
| **HACA** | Hydrogen-Abstraction–Carbon-Addition | Mecanismo por el que las partículas de hollín crecen capturando acetileno. [T] |
| **Agregado fractal** | Fractal aggregate | Cadena ramificada de partículas de hollín unidas. [T] |
| **Termoforesis** | Thermophoresis | Movimiento de partículas pequeñas desde zonas calientes hacia zonas frías. Sin flotabilidad, esta fuerza débil concentra el hollín en capas o cáscaras. [T] |
| **Punto de humo** | Smoke point | Tamaño de llama a partir del cual el hollín escapa sin quemarse (la llama "humea"). [T] |
| **Fracción radiante ($\chi_r$)** | Radiant fraction | Parte de la potencia de un fuego que sale como radiación. [T] |
| **Tiempo de residencia** | Residence time | Tiempo que el gas pasa en una zona de la llama. En microgravedad es más largo. [T] |
| **Arrastre (entrainment)** | Entrainment | Aire que el penacho de un fuego "succiona" desde los lados. [T] |
| **Parpadeo (puffing/flicker)** | Puffing | Oscilación periódica de una llama terrestre por inestabilidad de flotabilidad. [T] |
| **Burke–Schumann** | Burke–Schumann flame model | Modelo clásico de llama de difusión que supone química infinitamente rápida; da la posición y el radio de la llama. [T] |
| **Fracción de mezcla ($Z$)** | Mixture fraction | Variable que mide qué parte del gas vino del combustible (1) y qué parte del aire (0). La llama está donde $Z = Z_{st}$. [T] |
| **Censura por intervalo** | Interval censoring | Cuando solo se sabe que el límite real está entre dos valores ensayados (no propaga a $x_L$, sí a $x_U$). El modelo debe tratarlo como intervalo, no como punto. [INF] |
| **Validación por grupos** | Group k-fold cross-validation | Separar datos de entrenamiento y prueba por campaña o muestra, no al azar. [REQ][INF] |
| **Dominio de aplicabilidad** | Applicability domain | Rango de condiciones donde el modelo tiene datos que lo respaldan. Fuera de él, la predicción es extrapolación. [INF] |
| **Intervalo conformal** | Conformal prediction interval | Método para dar intervalos de predicción con cobertura garantizada a partir de los errores de validación. [T] |
| **JSON** | JavaScript Object Notation | Formato de texto estándar para intercambiar datos entre programas (R, Python, web). |
| **Parquet** | Apache Parquet | Formato de archivo de tablas, compacto y rápido, que leen R (arrow) y Python (pandas). |
| **.rds** | R Data Serialization | Formato propio de R para guardar objetos. Solo lo abre R. |
| **ONNX** | Open Neural Network Exchange | Formato abierto para modelos de aprendizaje automático que se ejecutan con `onnxruntime`. |
| **FastAPI** | FastAPI | Librería de Python para crear APIs web rápidamente. |
| **Pydantic** | Pydantic | Librería de Python que valida datos de entrada (tipos y rangos) en FastAPI. |
| **RAG** | Retrieval-Augmented Generation | Técnica en la que la IA primero busca fragmentos de documentos y después responde citándolos. |
| **Classroom** | Classroom | Módulo educativo del producto: centro de inteligencia y divulgación del Objetivo 1 (§15.2). |

---

## 2. Propósito del software y alineación con el reto

### 2.1 El problema que resuelve el software

NASA reúne en **PSI (Physical Sciences Informatics)** décadas de experimentos de combustión en baja gravedad: **24 investigaciones y ≈12 TB** en el área de combustión. [REQ] Esos datos sufren tres problemas:

| Problema | Qué significa para un ingeniero | Qué hace el software |
|---|---|---|
| **Sobrecarga** | Demasiados archivos, carpetas por muestra, videos y tablas | Filtra y prioriza lo relevante para su ambiente |
| **Dispersión** | Resultados repartidos entre PSI, NTRS, revistas y normas | Une cada dato con su fuente (DOI/NTRS) en una sola vista |
| **Complejidad** | Interpretar exige saber combustión en microgravedad | Explica la física (Classroom) y calcula márgenes con incertidumbre |

> **Enunciado operativo.** El software convierte la base de datos PSI en decisiones de seguridad contra incendios para **ambientes habitables tripulados**: ISS, naves en tránsito, hábitats lunares y marcianos, y vehículos presurizados. [REQ]

### 2.2 Las cuatro funciones del sistema 🤖

| # | Función (objetivo del reto) | Qué debe permitir | Módulo del producto (§15) | Secciones técnicas que la sostienen |
|---|---|---|---|---|
| **O1** | **Identificar investigaciones relevantes** para la seguridad contra incendios en ambientes habitables | Encontrar, comparar y entender las investigaciones PSI por ambiente, material y pilar (prevención, detección, supresión) | **Classroom / Centro de Inteligencia y Divulgación** (base de conocimiento) | §3–§11, §12.2, §16 |
| **O2** | **Extraer datos limpios** para modelos predictivos de inflamabilidad | Tablas curadas, unidades armonizadas, protocolos explícitos, modelos con incertidumbre | **Laboratorio de datos y simuladores** | §12, §13, §14 |
| **O3** | **Destacar tecnologías de control de incendios de próxima generación** | Evidencia para extintores de niebla fina, detección avanzada de humo, materiales y equipos de protección | **Radar tecnológico** | §9.2, §10, §17 |
| **O4** | **Puente con aplicaciones terrestres** | Transferencia a bomberos e industria | **Vista Tierra** | §17 |

### 2.3 Fuera del alcance

| Excluido | Por qué |
|---|---|
| **Combustión de cohetes y propulsores de alta velocidad** | El reto los excluye. [REQ] Además, en una cámara de combustión de cohete los flujos son tan rápidos que la flotabilidad es despreciable frente a la inercia ($Ri \ll 1$, §5.5): la gravedad no cambia el problema, que es lo que estudia PSI. [T] |
| Incendios forestales y monitoreo satelital (FIRMS, Copernicus) | Fuego en 1 g dominado por viento y flotabilidad; no son atmósferas internas de naves. [REQ] |
| Detección de incendios reales con sensores en tiempo real | El producto analiza datos de archivo; las "alertas" son avisos de análisis. [REQ][INF] |
| Predicciones cuantitativas en gravedad parcial presentadas como hechos | Solo como extrapolación etiquetada. [REQ][INF] |

### 2.4 Etiquetas de origen

| Etiqueta | Significado | Cómo debe tratarla la IA de software |
|---|---|---|
| **[REQ]** | Documento de requerimientos del equipo (`1 requerimientos-flame-in-freefall.md`) | Requisito del producto |
| **[INF]** | Informe técnico del físico del equipo (`Informe del reto NASA Space.pdf`) | Criterio físico revisado; prevalece sobre [REQ] en temas de física |
| **[B#]** | PDF de la bibliografía del proyecto (tabla 2.5) | Evidencia primaria; citar el DOI/NTRS |
| **[WEB]** | Página oficial de NASA u otra fuente web consultada | Contexto verificado; volver a comprobar antes de publicar |
| **[T]** | Conocimiento estándar de combustión (libros de texto) | Válido como orden de magnitud; **el asesor debe validarlo** antes de usarlo como dato |
| **[S]** | Supuesto o propuesta del equipo | Configurable; nunca presentarlo como resultado científico |
| **[CALC]** | Cálculo hecho en este documento a partir de datos citados | Reproducible; la fórmula está escrita junto al número |

Las secciones marcadas con 🤖 contienen especificaciones listas para convertirse en código, esquemas o reglas.

### 2.5 Mapa de la bibliografía del proyecto

| Código | Archivo en el proyecto | Referencia |
|---|---|---|
| B2 | `2 Preliminary Results from the Saffire VI Experiment.pdf` | Urban et al. (2024), ICES-2024-365 |
| B3 | `3 Recent Research on Flames of Gaseous Fuel Aboard the ISS.pdf` | Stocker (2021), ACME |
| B4 | `4 Challenges and Research Needs for Micro- and Partial-Gravity Fires.pdf` | Liao et al. (2021) |
| B5 | `5 Downward flame spread ... partial-gravity environments.pdf` | Takahashi et al. (2026a) |
| B6 | `6 Solid Fuel Ignition Testing for Lunar Applications.pdf` | Urban et al. (2025) |
| B7 | `7 Flammability of Materials on the Moon.pdf` | Zayac et al. (2024), FM2 |
| B8 | `8 A Bayesian approach to estimate flame spread model parameters ... PMMA.pdf` | Nakaya et al. (2025) |
| B9 | `(9) FLAMMABILITY, OFFGASSING, AND COMPATIBILITY ... .pdf` | NASA-STD-6001B Change 3 (2025) |
| B10 | `10 Results of Large-Scale Spacecraft Flammability Tests-IMPORTANTE.pdf` | Ferkul et al. (2017), Saffire I–II |
| B11 | `11 Particle Morphology and Size Results from SAME-2.pdf` | Urban et al. (2012) |
| B12 | `12 Spacecraft Fire Detection - Smoke Properties and Transport.pdf` | Urban et al. (2008) |
| B13 | `13 Evaluation of Spacecraft Smoke Detector Performance.pdf` | Meyer et al. (2018) |
| B14 | `14 The Influence of Smoke Particle Properties ... Lunar Gravity.pdf` | Fortenberry et al. (2023) |
| B15 | `15 Particle and Smoke Detection on ISS for Next Generation Smoke Detectors.pdf` | Urban et al. (2007), DAFT |
| B16 | `16 Development of the ISS Fine Water Mist Portable Fire Extinguisher.pdf` | Rodriguez et al. (2012) |
| B17 | `17 EVALUATION OF CO2 N2 AND HE AS FIRE SUPPRESSION AGENTS.pdf` | Ruff et al. (2004) |
| B18 | `18 The Water-Mist Fire Suppression Experiment Mist - STS-107.pdf` | Abbud-Madrid et al. (2003) |
| B19 | `19 Flame spread limits LOC of fire resistant fabrics.pdf` | Thomsen et al. (2017) |
| B20 | `20 Flammability Testing Configuration ... Barrier Material Assemblies.pdf` | Abney (2026), NESC TB 26-03 |
| B21 | `21 Flammability Configuration Analysis for Spacecraft Applications.pdf` | JSC-29353B (2014) |
| B22 | `22 Fire protection.pdf` | OCHMO-TB-008 Rev A (2023) |

### 2.6 Unidades

El sistema interno usa **SI** (kPa, m/s, K, fracción molar 0–1). La interfaz puede mostrar psi, cm/s, °C y %. Las conversiones obligatorias están en §12.6.

---


---

## 3. Contexto científico del reto

### 3.1 La estrategia de NASA: prevenir, detectar, suprimir y limpiar

La seguridad contra incendios en una nave se organiza en cuatro capacidades que deben trabajar juntas y con el ECLSS: **(1) prevención e inflamabilidad de materiales, (2) detección, (3) supresión y (4) limpieza posterior**. [B22] El enfoque principal de NASA hoy es la **prevención**: elegir materiales probados como resistentes al fuego. [B22]

> **Analogía.** Una nave es como un submarino en el que no se puede abrir una ventana ni llamar a los bomberos. Si hay fuego, la tripulación debe apagarlo **y** seguir respirando el mismo aire. Por eso, apagar la llama no termina el problema: quedan humo y gases tóxicos en un volumen pequeño. [INF][B2]

### 3.2 Por qué estudiar el fuego sin gravedad

1. **Para entender el fuego mejor.** En la Tierra, la flotabilidad mezcla todo y "tapa" la física de fondo. Una llama a ~2.300 K tiene un gas unas **ocho veces menos denso** que el aire a ~300 K; ese contraste genera corrientes que dominan la llama. Sin gravedad, los problemas se vuelven casi unidimensionales y más fáciles de modelar. [WEB]
2. **Porque la intuición terrestre falla.** NASA señala tres ideas erróneas comunes: que un fuego estable no puede existir en microgravedad quieta, que un fuego se apaga solo sin ventilación y que la baja gravedad es intrínsecamente más segura. [WEB]
3. **Porque se viene la Luna.** Las atmósferas propuestas tienen **más fracción de O₂ y menos presión**, y la gravedad lunar podría ser **el peor caso** para algunos materiales. [REQ][B7][B8]
4. **Porque la norma de materiales se hace en 1 g.** El Test 1 de NASA-STD-6001B prueba la llama hacia arriba en la Tierra, y la evidencia de BASS sugiere que **podría no ser conservador** en microgravedad. [WEB][B9]

### 3.3 Línea de tiempo resumida

| Año | Hito | Relevancia |
|---|---|---|
| 1967 | Incendio del **Apolo 1** en tierra (O₂ puro, 16,7 psi) | Nacen las pruebas de materiales en O₂ enriquecido [B22][WEB] |
| 1970 | Explosión del tanque de O₂ del **Apolo 13** | Primer accidente con fuego registrado sin flotabilidad [B22] |
| 1973–79 | Skylab con ~30 detectores UV | Problemas de línea de visión y falsas alarmas [B12] |
| 1981–2011 | Transbordador con detectores de ionización | Diseño terrestre sin datos de humo en µg [B12] |
| 1997 | Incendio del generador de O₂ en **Mir** | Fuego autooxidante, humo y CO [B22][WEB] |
| 2003 | Experimento Mist en STS-107 | Niebla de agua contra llamas premezcladas [B18] |
| 2008 | CIR llega a la ISS | Plataforma para FLEX, ACME, SoFIE [WEB] |
| 2009–2012 | FLEX y FLEX-2 en el CIR | Descubrimiento de llamas frías sin premezcla [B3][WEB] |
| 2012 | BASS en MSG | Inflamabilidad de sólidos en µg [WEB] |
| Desde 2016 | Saffire I–VI en Cygnus (resultados publicados hasta 2024) | Fuego a escala de nave [B2][B10] |
| 2017–2022 | ACME (6 experimentos de gas) | Más de 1.500 llamas en la ISS [WEB] |
| 2022–2025 | SoFIE en CIR | Sólidos, ignición y extinción [WEB] |
| 2025 | LUCI (New Shepard rotatorio) | Gravedad lunar simulada >2,5 min [INF] |
| Futuro | FM2 en superficie lunar | Primer ensayo de fuego en la Luna real [B7] |

---


---

## 4. Química y termodinámica de la combustión: el tetraedro del fuego

> **Idea central.** El fuego es un equilibrio entre **calor que se genera** (química) y **calor que se pierde** (conducción, convección, radiación), y entre **oxígeno que llega** y **productos que se van**. La gravedad cambia **cómo se mueven** el oxígeno, el calor y los productos; **no** cambia la química "por un interruptor". [INF] Toda esta sección desarrolla esa idea.

### 4.1 El tetraedro del fuego

**Analogía.** Una llama es una fábrica que necesita cuatro cosas: **materia prima** (combustible), **trabajadores** (oxígeno), **energía para encender las máquinas** (calor) y una **línea de montaje que no se detenga** (reacción en cadena). Si falta cualquiera, la fábrica para. En la Tierra, una cinta transportadora gratuita (la flotabilidad) trae trabajadores y se lleva los desechos; en el espacio esa cinta no existe.

El antiguo "triángulo del fuego" (combustible, oxígeno, calor) explica casi todo, pero no explica por qué ciertos agentes químicos (como los halones) apagan el fuego en cantidades pequeñas. La cuarta cara, la **reacción en cadena**, completa el modelo. [T]

```
                 Calor
                  /\
                 /  \
                /    \
   Combustible /______\ Comburente (O₂)
                \    /
                 \  /
                  \/
           Reacción en cadena
   (radicales libres H·, O·, OH· que se regeneran)
```

#### 4.1.1 Cara 1 · Combustible

Cualquier sustancia que pueda oxidarse liberando calor. En una nave: plásticos (PMMA, policarbonato), tejidos (algodón, Nomex), aislamientos de cables (Teflon, Kapton), lubricantes, papel, baterías.

- Los **sólidos no arden directamente**: primero se descomponen por calor (**pirólisis**) y sueltan vapores; los vapores son los que arden. [T]
- Los **líquidos** se evaporan y arden en fase gas (gotas, §9.1).
- Los **gases** ya están listos para mezclarse.

#### 4.1.2 Cara 2 · Comburente (oxígeno)

El oxidante que acepta electrones del combustible. Su efecto depende de **dos números** distintos (§4.3):
- **Fracción molar** $x_{O_2}$: cuántas moléculas de cada 100 son O₂ → controla la temperatura de llama.
- **Presión parcial** $p_{O_2}=x_{O_2}P$: controla la respiración de la tripulación.

Una reacción global de ejemplo (metano):

$$\text{CH}_4 + 2\,\text{O}_2 \;\longrightarrow\; \text{CO}_2 + 2\,\text{H}_2\text{O} + \Delta h_c$$

La **relación estequiométrica** $\nu$ es la masa de O₂ necesaria por unidad de masa de combustible para quemarlo por completo (metano: $\nu = 64/16 = 4$). [T]

#### 4.1.3 Cara 3 · Calor

Se necesita calor para tres cosas: llevar el combustible a su temperatura de pirólisis o evaporación, superar la **energía de activación** de la reacción y compensar las pérdidas. El calor generado se expresa con el **calor de combustión** $\Delta h_c$ (J/kg). Un indicador práctico es la **temperatura adiabática de llama** (§4.2): la máxima que alcanzaría la llama si no perdiera calor.

#### 4.1.4 Cara 4 · Reacción en cadena

La combustión no ocurre en un solo paso: son cientos de reacciones elementales en las que intervienen **radicales libres** (átomos o fragmentos con un electrón desapareado: H·, O·, OH·). Las reacciones se clasifican así [T]:

| Tipo | Qué hace | Ejemplo clave |
|---|---|---|
| **Iniciación** | Crea los primeros radicales | Ruptura térmica del combustible: $\text{RH} \rightarrow \text{R·} + \text{H·}$ |
| **Ramificación** | Un radical produce **dos**: la reacción se acelera sola | $\text{H·} + \text{O}_2 \rightarrow \text{OH·} + \text{O·}$ (la reacción más importante de la combustión a alta temperatura) |
| **Propagación** | Un radical produce otro y libera calor | $\text{CO} + \text{OH·} \rightarrow \text{CO}_2 + \text{H·}$ (la mayor parte del calor de un hidrocarburo sale aquí) |
| **Terminación** | Dos radicales se unen o chocan con una pared y desaparecen | $\text{H·} + \text{OH·} + \text{M} \rightarrow \text{H}_2\text{O} + \text{M}$ |

**Lectura para no químicos.** Una llama vive mientras **se crean más radicales de los que se destruyen**. Si las pérdidas de calor bajan la temperatura, la ramificación (muy sensible a la temperatura) se frena, ganan las reacciones de terminación y la llama se apaga de golpe. Esa es la razón química de los **límites de inflamabilidad**.

**Llamas frías.** Por debajo de ≈800 K existe otra familia de reacciones en cadena (vía radicales peróxido, RO₂·) que algunos hidrocarburos (heptano, n-butano) pueden sostener: es la química de las **llamas frías** (§4.2). [WEB][T]

#### 4.1.5 Cómo se apaga cada cara: estrategias de supresión 🤖

| Cara atacada | Estrategia | En la Tierra | En una nave | Particularidad en microgravedad | Fuente |
|---|---|---|---|---|---|
| Combustible | Retirar o aislar el combustible | Cortafuegos, cortar el gas | **Cortar la energía eléctrica** del equipo (la electrónica es la fuente más probable de fuego y humo en el espacio) | Sin goteo ni caída de material encendido; los vapores se quedan cerca | [B17][WEB] |
| Comburente | Diluir o retirar el O₂ | Espuma, CO₂, tapar | **Cortar la ventilación**; extintor de CO₂; despresurizar (**venteo**) | El extintor induce flujo y puede traer O₂ a la llama | [B17][WEB] |
| Calor | Enfriar | Agua a chorro | **Niebla de agua fina** (FWM) | Las gotas no caen: se quedan suspendidas y evaporan | [B16][B18] |
| Reacción en cadena | Capturar radicales | Halones, polvos químicos | Halón 1301 en la espuma usada en Mir | Mismo mecanismo químico; transporte distinto | [B22][T] |

> **Procedimiento ISS documentado.** Tras una alarma de incendio se corta la ventilación y la energía. [B17] SoFIE estudia expresamente la supresión por diluyentes, por reducción de flujo y por venteo. [WEB]

> **Excepción crítica: fuentes con oxidante propio.** Un generador químico de O₂ (incendio de Mir, §16.3) lleva el comburente dentro: diluir el aire de la cabina o cortar la ventilación **no** lo apaga. [B22] El software debe clasificar estas fuentes aparte.

### 4.2 Química y cinética: qué tan rápido reacciona

**Analogía.** La química de la llama es como una cocina: si el horno no está lo bastante caliente, la comida no se cocina, por mucho tiempo que la dejes.

**Ley de Arrhenius** [T]:

$$k(T) = A\,T^{n}\exp\!\left(-\frac{E_a}{R\,T}\right)$$

| Símbolo | Significado | Unidad |
|---|---|---|
| $k$ | constante de velocidad de reacción | depende del orden |
| $A$ | factor preexponencial | depende del orden |
| $E_a$ | energía de activación | J/mol |
| $n$ | exponente de temperatura | – |

Pequeños cambios de temperatura producen cambios enormes de velocidad. Por eso una llama que pierde un poco de calor puede apagarse de golpe.

**Pirólisis del sólido** [INF]:

$$\rho_s c_s \frac{\partial T_s}{\partial t} = \nabla\cdot(\lambda_s \nabla T_s) - \dot m'''_p\,\Delta h_p, \qquad \dot m'''_p = A_p\,\rho_s\,f(\alpha)\exp\!\left[-\frac{E_a}{R\,T_s}\right]$$

$\Delta h_p > 0$ para una descomposición endotérmica; $\alpha$ es la conversión. **No se deben asignar los mismos parámetros a Nomex, papel y PMMA.** [INF]

**Temperatura adiabática de llama** [T]: temperatura máxima si todo el calor de la reacción se queda en los productos. Balance simplificado:

$$T_{ad} \approx T_0 + \frac{Y_{F,0}\,\Delta h_c}{c_p}$$

**Depende sobre todo de la fracción de O₂ y de cuánto gas inerte hay que calentar**, no de la presión total. [T] Esta es la razón física central de §4.3.

**Damköhler** [INF]:

$$Da = \frac{\tau_{transporte}}{\tau_{química}}$$

- $Da$ grande: hay tiempo de sobra para reaccionar → llama robusta.
- $Da$ pequeño (flujo rápido): **soplado**.
- Flujo muy lento: dominan pérdidas y agotamiento de O₂ → **extinción radiativa o térmica**.

**Llamas frías** [WEB][B3][T]. A temperaturas de ≈500–800 K, algunos hidrocarburos (heptano, butano) siguen una química de baja temperatura con una zona de "coeficiente de temperatura negativo" (NTC): la reacción se frena al calentarse. Resultado: una llama débil, casi invisible, que oxida el combustible sin llama visible. En la Tierra parpadea y se apaga casi al instante; en la ISS duró **minutos**. Se descubrió en FLEX con heptano (2012) y después en CFI-G con n-butano en quemador poroso. [WEB][B3]

🤖 **Implicación:** una caída de luz **no** prueba que el fuego esté apagado ni que haya llama fría; hace falta un diagnóstico adecuado (por ejemplo, emisión de formaldehído). [INF][B3]

### 4.3 Oxígeno y presión: por qué "respirar igual" no es "arder igual"

**Analogía.** Imagina que el oxígeno son obreros y el nitrógeno son espectadores que solo estorban y se calientan. Si reduces el total de personas en la sala pero mantienes el número de obreros, hay **menos espectadores por obrero**: el trabajo (la llama) se hace más rápido y más caliente.

**Formalismo.**

$$p_{O_2} = x_{O_2}\,P$$

- La **tripulación respira** según $p_{O_2}$ (presión parcial).
- La **llama** responde sobre todo a $x_{O_2}$ (fracción), porque determina cuánto diluyente hay por molécula de O₂ y, por tanto, la temperatura de llama. [REQ][T]

| Atmósfera | $x_{O_2}$ | $P$ | $p_{O_2}$ | Aumento de $x_{O_2}$ frente a la Tierra | Fuente |
|---|---|---|---|---|---|
| Tierra / ISS | 20,9 % | 101,3 kPa (14,7 psi) | 21,2 kPa (3,07 psi) | – | [B9][CALC] |
| Gateway (escenario) | 26,5 % | 73,5 kPa | 19,5 kPa | +27 % | [INF][CALC] |
| Base lunar (ejemplo del reto) | 30 % | 70,3 kPa (10,2 psi) | 21,1 kPa (3,06 psi) | **+44 %** | [REQ][CALC] |
| SEA / FM2 | 34 % | 56,5 kPa (8,2 psi) | 19,2 kPa (2,79 psi) | **+63 %** | [INF][B7][CALC] |
| Saffire VI-2 (medido) | 31,0 % | 54,1 kPa | 16,8 kPa | +48 % | [B2][CALC] |
| Traje espacial | 100 % | 29,6 kPa (4,3 psi) | 29,6 kPa | ×4,8 | [REQ][CALC] |
| Apolo 1 (en tierra, 1967) | 100 % | 115,1 kPa (16,7 psi) | 115,1 kPa | ×4,8; $p_{O_2}$ ×5,4 | [WEB][CALC] |

**Por qué la Luna quiere más O₂ y menos presión.** Menos presión reduce el riesgo de descompresión ("the bends") al salir a caminatas espaciales, lo que permite **EVA más frecuentes**. Para que la tripulación siga respirando igual, se sube la fracción de O₂. El precio: los materiales se vuelven mucho más inflamables. [REQ]

**Efecto de la presión sobre la propagación** [B19]. Con la presión cambian el Reynolds y el Grashof:

$$Re = \frac{\rho U L}{\mu} \;\Rightarrow\; Re \propto P, \qquad Gr = \frac{\rho^2 \beta g L^3 \Delta T}{\mu^2} \;\Rightarrow\; Gr \propto P^2 g$$

Bajar la presión aleja la llama del sólido (calienta menos) pero también reduce las pérdidas convectivas: los efectos se compensan en parte. Si la presión baja mucho, hace falta **más O₂** para sostener la llama. [B19] Una fuente de radiación externa compensa la falta de O₂ y de presión. [B19]

🤖 **Regla de datos:** guardar **siempre** $P$ y $x_{O_2}$ por separado. Una misma $p_{O_2}$ no define una misma mezcla, transporte ni respuesta del material. [INF]

### 4.4 Cómo la ausencia de gravedad altera el tetraedro

**Analogía.** En la Tierra, el fuego vive en una "casa con chimenea": el aire caliente sube, entra aire fresco por abajo y el humo se va por arriba. En microgravedad, la chimenea desaparece: el fuego vive en un cuarto sin corrientes, donde el aire fresco solo llega si alguien enciende un ventilador o si el oxígeno "se cuela" lentamente por difusión.

La clave física es que **desaparece la flotabilidad térmica** (§5.1) y con ella la **convección natural**. Eso modifica las cuatro caras a la vez:

| Cara | Qué cambia sin flotabilidad | Consecuencia | Fuente |
|---|---|---|---|
| **Combustible** | Los vapores de pirólisis no son arrastrados hacia arriba; se acumulan alrededor del sólido. El material fundido no gotea; en el acrílico aparecen burbujas de vapor que estallan a través de la llama azul | La llama rodea la superficie; ignición más fácil | [WEB] |
| **Comburente** | El O₂ solo llega por difusión (lenta) o por ventilación forzada; la llama agota el O₂ a su alrededor | Sin flujo, una llama pequeña puede apagarse por falta de O₂; con un flujo suave (≈10 cm/s) puede arder **mejor** que en la Tierra | [WEB][B4] |
| **Calor** | Las pérdidas por convección caen; la radiación se vuelve la pérdida dominante | El flujo de calor crítico para encender puede ser **la mitad** que en 1 g; a flujo muy bajo, la llama puede apagarse por **pérdida radiativa** | [WEB][B4] |
| **Reacción en cadena** | El gas pasa **más tiempo** junto a la llama (tiempo de residencia largo): Damköhler alto; más tiempo para formar hollín | Llamas más grandes, a veces con más hollín; las llamas frías pueden durar minutos | [B3][WEB] |

#### 4.4.1 Efecto neto sobre los límites de inflamabilidad

| Efecto | Dirección | Evidencia |
|---|---|---|
| Aire quieto (sin flujo) | Puede **estrechar** el rango de inflamabilidad (extinción por pérdidas y falta de O₂) | [B4] |
| Flujo bajo (≈5–15 cm/s, típico de la ventilación de una nave) | Puede **ampliarlo**: materiales que arden con **menos** O₂ que en la Tierra | [WEB][B8] |
| Gravedad parcial (Luna, Marte) | Puede ser el **peor caso** ("zona Ricitos de Oro") | [B7][B8][B5] |
| Gotas (FLEX) | El índice de oxígeno límite fue **bastante menor** que en 1 g | [WEB] |
| Ensayo terrestre de materiales (Test 1) | **Podría no ser conservador** en microgravedad | [WEB] |

> **Tres ideas erróneas que el software debe corregir** (NASA): que un fuego estable no puede existir en microgravedad quieta, que un fuego se apaga solo sin ventilación, y que la baja gravedad es intrínsecamente más segura. [WEB]

El detalle cuantitativo está en §8.2 (curva en "U", MLOC y gravedad parcial).

---

## 5. Transporte de calor, masa y cantidad de movimiento: gravedad y microgravedad

### 5.1 Gravedad y flotabilidad: por qué la vela tiene forma de gota

**Analogía.** Un globo aerostático sube porque su aire caliente pesa menos que el aire frío de afuera. Los gases de una llama son "globos" diminutos: suben, y el hueco que dejan lo llena aire fresco desde abajo. Eso estira la llama hacia arriba y la hace parpadear.

**Formalismo.** La densidad de un gas ideal es:

$$\rho = \frac{P\,M}{R\,T}$$

| Símbolo | Significado | Unidad SI |
|---|---|---|
| $\rho$ | densidad | kg/m³ |
| $P$ | presión absoluta | Pa |
| $M$ | masa molar de la mezcla | kg/mol |
| $R$ | constante universal de los gases = 8,314 | J/(mol·K) |
| $T$ | temperatura absoluta | K |

Con $T_{llama}\approx 2300$ K y $T_{aire}\approx 300$ K, el gas de la llama es unas **7–8 veces** menos denso [CALC: 2300/300 ≈ 7,7][WEB]. La fuerza de flotabilidad por unidad de volumen es:

$$f_b = (\rho_{ref} - \rho)\,g$$

En las ecuaciones de movimiento aparece como el término $(\rho-\rho_{ref})\,\mathbf{g}$ (ec. 11.1-2). Si $g \to 0$, ese término desaparece. [INF]

**Velocidad inducida por flotabilidad.** No existe una única fórmula; depende de la geometría y del balance dominante. [INF] Las dos escalas más usadas son:

$$U_b \sim \sqrt{g\,\beta\,\Delta T\,L} \qquad \text{(escala viscosa/inercial, crece con } g^{1/2}\text{)}$$

$$U_b \sim \left(\frac{\alpha_g\,g\,(T_f - T_\infty)}{T_v}\right)^{1/3} \qquad \text{(escala térmica, Nakaya et al. 2025; crece con } g^{1/3}\text{)} \;[\text{B8}]$$

| Símbolo | Significado | Unidad |
|---|---|---|
| $\beta$ | coeficiente de expansión térmica; para gas ideal $\beta\approx 1/T$ | 1/K |
| $\Delta T$ | diferencia de temperatura llama–ambiente | K |
| $L$ | longitud característica | m |
| $\alpha_g$ | difusividad térmica del gas, $\alpha=\lambda/(\rho c_p)$ | m²/s |
| $T_f, T_v, T_\infty$ | temperatura de llama, de pirólisis (PMMA ≈ 593 K) y ambiente (300 K) | K |

**Factor de escala de la velocidad de flotabilidad respecto a la Tierra** [CALC]:

| Ambiente | $g/g_0$ | $(g/g_0)^{1/3}$ | $(g/g_0)^{1/2}$ |
|---|---|---|---|
| Tierra | 1 | 1,00 | 1,00 |
| Marte | 0,38 | 0,72 | 0,62 |
| Luna | 0,165 | 0,55 | 0,41 |
| ISS (≈10⁻⁶ g₀) [T] | 10⁻⁶ | 0,01 | 0,001 |

**Verificación con datos reales.** Takahashi et al. (2026a) publican "velocidades equivalentes de flujo opuesto" para llama descendente sobre sólidos delgados: a 101,3 kPa son 15,3 / 19,3 / 25,2 / 35 cm/s para 1/12, 1/6, 3/8 y 1 g. [B5] El cociente respecto a 1 g (0,437 / 0,551 / 0,720) coincide con $(g/g_0)^{1/3}$ (0,437 / 0,550 / 0,721) [CALC]. Es decir, para esa configuración: $U_{eq}(g) \approx U_{eq}(1g)\,(g/g_0)^{1/3}$.

🤖 **Regla de software:** la conversión gravedad → flujo equivalente **solo** es válida para la configuración y presión donde se calibró (llama descendente, sólidos delgados, 56,5 o 101,3 kPa). Sumar $U_b$ a un flujo forzado sin considerar su dirección puede crear una falsa equivalencia entre Tierra, Luna e ISS. [INF]

### 5.2 Qué es la microgravedad y cómo se consigue

**Analogía.** En una montaña rusa, al caer, sientes que flotas. No es que la gravedad se apague; es que tú y el asiento caen juntos. La ISS está en caída libre permanente alrededor de la Tierra.

| Plataforma | Duración típica de baja gravedad | Fortaleza | Limitación | Fuente |
|---|---|---|---|---|
| Torre de caída (NASA Glenn) | ≈2,2 s y ≈5 s | Barata, repetible | Puede no alcanzar estado estacionario | [INF][WEB] |
| Vuelo parabólico | ≈20–28 s según nivel de g | Permite gravedad parcial (1/6, 3/8 g) | g-jitter; ventanas cortas | [B5][INF] |
| Centrífuga en torre de caída | ≈5 s; 0,04–1 g | Barre gravedad parcial | Coriolis; tiempo corto | [B8][INF] |
| Cohete sonda / suborbital (LUCI) | >2,5 min en g lunar simulada | Duración larga en g parcial | Rotación (Coriolis); un vuelo | [INF] |
| ISS (CIR, MSG) | Ilimitada | Ensayos largos y repetidos | Escala pequeña de muestra | [WEB] |
| Cygnus (Saffire) | Horas | **Escala real de nave** | Pocos ensayos, sin tripulación | [B2][B10] |

**Aceleración residual de la ISS.** Se mide con SAMS (vibraciones) y MAMS (perturbaciones cuasiestacionarias por debajo de 0,01 Hz). Viene de la tripulación, acoplamientos, propulsores y equipos. [WEB] Orden de magnitud cuasiestacionario: ~1 µg [T].

### 5.3 Transferencia de calor: los tres caminos

**Analogía.** El calor sale de una taza de café de tres formas: por la mano que la sostiene (**conducción**), por el aire que sopla encima (**convección**) y por el resplandor invisible que sientes en la cara (**radiación**).

| Mecanismo | Ley | Ecuación | Qué cambia en µg |
|---|---|---|---|
| Conducción | Fourier | $q'' = -\lambda\,\nabla T$ | Nada en sí misma; pasa a dominar la transferencia cerca de la llama |
| Convección | Newton | $q'' = h\,(T_s - T_\infty)$ | $h$ cae mucho sin convección natural: los materiales se enfrían menos y se encienden más fácilmente [WEB] |
| Radiación | Stefan–Boltzmann | $q'' = \varepsilon\,\sigma\,(T_s^4 - T_\infty^4)$ | Se vuelve la pérdida dominante; puede apagar la llama (extinción radiativa) [B4][B3] |

| Símbolo | Significado | Unidad / valor |
|---|---|---|
| $\lambda$ | conductividad térmica | W/(m·K) |
| $h$ | coeficiente de convección | W/(m²·K) |
| $\varepsilon$ | emisividad (0–1) | – |
| $\sigma$ | constante de Stefan–Boltzmann | 5,670374419 × 10⁻⁸ W/(m²·K⁴) |

**Consecuencias medidas en la ISS (BASS)** [WEB]:
- Los materiales se encienden más fácilmente porque se pierde menos calor por convección.
- El **flujo de calor crítico para la ignición** en microgravedad puede ser **la mitad** del valor en la Tierra.
- La propagación es más rápida cerca de una velocidad mínima del gas de **≈10 cm/s**, el mismo orden que la ventilación de una nave.
- Con flujo lento, la llama puede avanzar **contra** el flujo, lo opuesto a la Tierra.

**Radiación del gas** [INF]. En una aproximación sin dispersión, para cada dirección $\mathbf{s}$:

$$\mathbf{s}\cdot\nabla I = \kappa\,[I_b(T) - I], \qquad \nabla\cdot\mathbf{q}_r = \kappa\left(4\pi I_b - \int_{4\pi} I\,d\Omega\right)$$

$I$ es intensidad; $\kappa$, coeficiente de absorción; $I_b=\sigma T^4/\pi$, emisión de cuerpo negro. Tratar el gas como "gris" es una simplificación: H₂O, CO₂, combustible y hollín tienen respuestas espectrales distintas. **Ignorar la radiación cerca de los límites de microgravedad puede borrar justo el mecanismo que se quiere estudiar.** [INF]

**Balance de energía en la superficie del sólido** [INF] (flujos positivos hacia la superficie):

$$q''_{g\to s} + q''_{r\to s} + q''_{ext} = q''_{conducido} + q''_{emitido} + \dot m''_f\,L_g$$

$L_g$ es el calor efectivo de gasificación (J/kg) y $\dot m''_f$ el flujo de masa de combustible (kg/(m²·s)). No se debe contar la misma energía dos veces usando a la vez $L_g$ y un modelo de pirólisis volumétrica. [INF]

### 5.4 Transferencia de masa: cómo llega el oxígeno

**Analogía.** Una gota de tinta en un vaso de agua quieta se extiende sola, muy despacio (difusión). Si revuelves, se mezcla en segundos (convección).

**Ley de Fick** [T]:

$$\mathbf{J}_k = -\rho\,D_k\,\nabla Y_k$$

| Símbolo | Significado | Unidad |
|---|---|---|
| $\mathbf{J}_k$ | flujo difusivo de la especie $k$ | kg/(m²·s) |
| $D_k$ | coeficiente de difusión | m²/s |
| $Y_k$ | fracción **másica** de la especie $k$ | – |

**Número de Lewis** $Le = \alpha/D$: compara la rapidez con que se difunde el calor y la masa. Para O₂ en aire, $Le\approx 1$; para combustibles pesados (heptano) $Le>1$; para helio o hidrógeno, $Le<1$. [T] Esto importa en supresión con He: el helio conduce muy bien el calor y enfría la llama. [B17]

**Agotamiento local.** En aire quieto, una llama consume el O₂ a su alrededor más rápido de lo que la difusión lo repone, y puede apagarse sola **si es pequeña**. Pero no es una garantía: NASA advierte que "el fuego se apaga solo sin ventilación" es una **idea errónea**. [WEB] En Saffire, la extinción tardía en reposo y el crecimiento con flujo forzado fueron fenómenos distintos. [INF]

### 5.5 Números adimensionales: el "idioma común" para comparar ambientes 🤖

| Número | Fórmula | Compara | Interpretación para la IA |
|---|---|---|---|
| Reynolds | $Re = UL/\nu$ | inercia vs. viscosidad | Bajo → flujo laminar ordenado |
| Péclet | $Pe = UL/\alpha_g$ | advección vs. difusión térmica | Bajo → domina la difusión (µg quieta) |
| Grashof | $Gr = g\beta\Delta T L^3/\nu^2$ | flotabilidad vs. viscosidad | $\propto g$; ≈0 en µg |
| Richardson | $Ri = Gr/Re^2 = g\beta\Delta T L/U^2$ | flotabilidad vs. flujo forzado | $Ri\gg1$: manda la flotabilidad; $Ri\ll1$: manda el ventilador |
| Damköhler | $Da = \tau_{transp}/\tau_{quím}$ | transporte vs. química | Bajo → soplado |
| Lewis | $Le = \alpha/D$ | calor vs. masa | ≠1 → efectos preferenciales (He) |
| Stokes | $St = \tau_p/\tau_{flujo}$ | inercia de gota vs. flujo | $\ll1$: la gota sigue al aire |

**Ejemplo de orden de magnitud** [CALC][T] con $U$ = 20 cm/s, $L$ = 10 cm, $\Delta T$ = 1000 K, $\beta$ = 1/300 K⁻¹, $\nu$ = 1,6 × 10⁻⁵ m²/s (aire a temperatura ambiente; con propiedades a temperatura de película los valores cambian):

| Ambiente | $Re$ | $Gr$ | $Ri$ | Lectura |
|---|---|---|---|---|
| Tierra (1 g) | 1.250 | 1,3 × 10⁸ | ≈82 | Domina la flotabilidad |
| Marte (0,38 g) | 1.250 | 4,9 × 10⁷ | ≈31 | Domina la flotabilidad |
| Luna (0,165 g) | 1.250 | 2,1 × 10⁷ | ≈13 | Flotabilidad aún importante |
| ISS (10⁻⁶ g) | 1.250 | ≈130 | ≈8 × 10⁻⁵ | Domina el ventilador |

🤖 **Reglas** [INF]: (1) si $U = 0$, no calcular $Ri$ (división por cero): marcar "convección natural/difusión"; (2) si faltan $T$ o propiedades, dejar el descriptor vacío o marcarlo como estimación; (3) declarar siempre $L$.


---

## 6. Comportamiento del fuego en los entornos críticos

> Esta sección es la base del **selector de ambiente** del producto. Para cada entorno se describe cómo llega el oxígeno, cómo se pierde el calor, qué forma tiene la llama, qué hace el humo y cuál es el riesgo principal. Los valores numéricos de cada ambiente están en el catálogo §12.8.

### 6.1 Entorno terrestre estándar (1 g): el penacho ascendente

**Analogía.** Una fogata es una chimenea invisible: el aire caliente sube como un globo, arrastra aire fresco de los lados (**arrastre** o *entrainment*) y empuja el humo hacia arriba.

**Física.**

| Fenómeno | Descripción | Ecuación / dato | Fuente |
|---|---|---|---|
| Penacho de flotabilidad | El gas caliente (≈7–8 veces menos denso) sube y arrastra aire | $f_b = (\rho_{ref}-\rho)\,g$ | [WEB][CALC] |
| Velocidad en el eje del penacho | Crece con la potencia del fuego | $u \propto \left(\dfrac{g\,\dot Q}{\rho_\infty c_p T_\infty}\right)^{1/3} z^{-1/3}$ | [T] |
| Altura de llama de un incendio (correlación de Heskestad) | $\dot Q$ en kW, $D$ en m | $L_f = 0{,}235\,\dot Q^{2/5} - 1{,}02\,D$ | [T] |
| Parpadeo (*puffing*) | La llama oscila por inestabilidad de flotabilidad | $f \approx 1{,}5/\sqrt{D}$ Hz ($D$ en m): una vela (≈1 cm) ≈ 15 Hz; un charco de 1 m ≈ 1,5 Hz | [T][CALC] |
| Turbulencia | Los fuegos grandes se vuelven turbulentos: mezcla rápida y mucho calor por convección | $Gr$ alto (§5.5) | [T] |
| Propagación hacia arriba | La más peligrosa en la Tierra: la velocidad crece con la longitud de pirólisis y la llama **acelera** | $V_f \propto$ longitud de pirólisis | [B4] |
| Velocidad de flotabilidad en una vela | ≈1 m/s | – | [WEB] |
| Humo | Sube rápido y se concentra cerca del techo; por eso los detectores domésticos van en el techo | – | [WEB] |

**Consecuencias para la seguridad terrestre:** alta transferencia de calor por convección, llamas amarillas con hollín que se quema al subir, y una configuración "peor caso" bien conocida: la propagación ascendente. Por eso el **Test 1 de NASA-STD-6001B** prueba la llama hacia arriba. [B9][B4]

### 6.2 Microgravedad (ISS y naves en tránsito): difusión y ventilación

**Analogía.** En lugar de una chimenea, una **pompa de jabón** alrededor del combustible: el oxígeno se cuela despacio desde todas las direcciones y los productos se quedan cerca.

| Propiedad | Tierra (1 g) | Microgravedad quieta | Fuente |
|---|---|---|---|
| Forma | Gota alargada que parpadea | Esfera o semiesfera estable | [WEB][REQ] |
| Color | Amarillo-naranja (hollín brillando) | Azul y tenue; el hollín puede quedar atrapado dentro | [WEB][REQ] |
| Suministro de O₂ | Convección natural, rápido (~1 m/s en una vela) | Difusión, lento (o ventilación forzada) | [WEB] |
| Salida de productos | Hacia arriba con el penacho | Se acumulan alrededor de la llama | [T] |
| Tamaño | Más pequeño | Más grande y ancho (llamas de gas laminares) | [B3][WEB] |
| Hollín | Se oxida al subir | La fracción de hollín puede ser **varias veces mayor** (CLD Flame) | [B3] |
| Duración en ambiente cerrado | Minutos | Una vela en Mir ardió más de 45 min | [WEB] |
| Límite de O₂ | Más alto | Puede arder con **menos** O₂ | [WEB] |

**Tres regímenes según el flujo de aire:**

| Régimen | Flujo | Qué pasa | Fuente |
|---|---|---|---|
| **Quieto** | ≈0 cm/s | **Combustión lenta**, controlada por difusión. Una llama pequeña puede **autoextinguirse** por falta de O₂ y por pérdida radiativa. **No es una garantía**: NASA advierte que creer que "el fuego se apaga solo sin ventilación" es un error | [B4][WEB] |
| **Ventilación de nave** | ≈10–20 cm/s | El flujo trae O₂ fresco sin enfriar mucho la llama: la propagación es más rápida cerca de ≈10 cm/s (BASS). En Saffire, las llamas en flujo concurrente alcanzaron un tamaño **limitado** o, en PMMA grueso, **crecieron de forma continua** hasta reducir el flujo | [WEB][B4][B2][B10] |
| **Flujo alto** | > decenas de cm/s | Soplado (Damköhler bajo) | [B4] |

**Advertencia física** [INF]: la llama no es siempre esférica en microgravedad. Si hay flujo impuesto, paredes o una superficie grande, se inclina o se alarga. La esfera es el caso ideal de combustible pequeño en aire quieto.

**Escala de tiempo de difusión** [T]: $t_D \sim L^2/D$. Con $D_{O_2-N_2}\approx 2\times10^{-5}$ m²/s y $L = 1$ cm, $t_D \sim 5$ s, mucho más lento que la renovación de aire de una vela en la Tierra. $D$ crece aproximadamente como $T^{1{,}75}/P$: **a menor presión, difusión más rápida**.

**Riesgo principal en una nave:** un fuego que crece con la ventilación, en un volumen pequeño y cerrado, donde el humo y el CO se quedan. [B2][B22]

### 6.3 Gravedad parcial (Luna 0,165 g; Marte 0,38 g)

**Analogía.** Una chimenea "débil": hay algo de corriente ascendente, suficiente para traer oxígeno fresco, pero no tanta como para enfriar la llama. Es la "zona Ricitos de Oro". [B7]

| Aspecto | Comportamiento | Fuente |
|---|---|---|
| Velocidad de flotabilidad | Crece como $g^{1/3}$ (escala térmica): Luna ≈ 55 % de la terrestre; Marte ≈ 72 % | [B8][B5][CALC] |
| Límites de inflamabilidad | Para algunos materiales, **más amplios** que en la Tierra | [B7] |
| Mínimo del límite de O₂ | Cerca de gravedad lunar (varillas de PMMA, Olson 2024); cerca de 0,01 g (papel, Takahashi 2026a); posiblemente en gravedad parcial (modelo bayesiano, Nakaya 2025) | [INF][B5][B8] |
| Datos disponibles | **No hay en PSI.** Sí hay vuelos parabólicos (1/6, 1/3, 3/8 g), centrífugas y LUCI (g lunar simulada >2,5 min en aire) | [REQ][INF] |
| Atmósfera combinada | La SEA (34 % O₂, 56,5 kPa) suma una fracción de O₂ mucho mayor | [B7] |

El tratamiento cuantitativo y las reglas de software están en §8.2.

### 6.4 Cabinas presurizadas, baja presión y atmósferas enriquecidas en oxígeno

**Analogía.** Si en una sala de trabajo quitas espectadores (nitrógeno) pero dejas a todos los obreros (oxígeno), el trabajo se hace más rápido y más caliente. Bajar la presión de la cabina y subir la fracción de O₂ hace exactamente eso.

#### 6.4.1 Por qué los hábitats usan menos presión y más O₂

Para caminar fuera de la nave, los trajes trabajan a baja presión (≈4,3 psi, 100 % O₂). Si la cabina tiene menos presión, el astronauta necesita menos tiempo de "prerrespiración" y corre menos riesgo de descompresión: se pueden hacer **EVA más frecuentes**. Para que la tripulación siga respirando igual, se sube la fracción de O₂. El precio: los materiales arden con más facilidad. [REQ]

| Atmósfera | $x_{O_2}$ | $P$ | $p_{O_2}$ | Aumento de $x_{O_2}$ frente a la Tierra |
|---|---|---|---|---|
| Tierra / ISS | 20,9 % | 101,3 kPa | 21,2 kPa | – |
| Gateway (escenario) | 26,5 % | 73,5 kPa | 19,5 kPa | +27 % |
| Base lunar (reto) | 30 % | 70,3 kPa | 21,1 kPa | +44 % |
| SEA / FM2 | 34 % | 56,5 kPa | 19,2 kPa | +63 % |

(Detalle y fuentes en §4.3.)

#### 6.4.2 Qué cambia en el fuego

| Variable | Efecto | Fuente |
|---|---|---|
| Más $x_{O_2}$ | Menos diluyente por molécula de O₂ → llama más caliente → propagación más rápida y límites más amplios | [T][REQ] |
| Menos $P$ | El Reynolds baja ($\propto P$) y el Grashof baja ($\propto P^2 g$): la llama se aleja del sólido (calienta menos) pero las pérdidas convectivas también bajan; los efectos se compensan en parte. Si la presión baja mucho, hace falta más O₂ | [B19] |
| Misma $p_{O_2}$ | **No** significa misma inflamabilidad | [INF][REQ] |
| Medición real | Saffire VI quemó tejido y PMMA a ≈54–55 kPa con 29–31 % de O₂ en una nave real | [B2] |

#### 6.4.3 Fuego dentro de un volumen cerrado: subida de presión y contaminación

En un recinto sellado y bien mezclado, si todo el calor se queda en el gas (cota superior, sin pérdidas a paredes) [T]:

$$\frac{dP}{dt} \approx \frac{(\gamma - 1)\,\dot Q}{V}$$

| Símbolo | Significado | Valor típico |
|---|---|---|
| $\gamma$ | cociente de calores específicos del aire | ≈1,4 |
| $\dot Q$ | potencia del fuego | W |
| $V$ | volumen libre | m³ |

Ejemplo [CALC]: un fuego de 3 kW en 16,7 m³ (Saffire VI) da una cota de ≈72 Pa/s. En la realidad las paredes absorben calor, y Saffire VI midió que **el aumento de temperatura y presión de la nave fue menos importante que el de CO₂ y CO**. [B2] En cambio, en el **Apolo 1** (volumen pequeño, O₂ puro, fuego muy intenso) la presión rompió el casco en menos de 20 s. [WEB]

#### 6.4.4 Casos históricos en atmósfera enriquecida

| Caso | Atmósfera | Gravedad | Lección física | Detalle |
|---|---|---|---|---|
| **Apolo 1** (1967) | 100 % O₂ a 16,7 psia en tierra ($p_{O_2}$ ≈5,4 veces la del aire) | 1 g | Sin diluyente, materiales comunes (nylon, Velcro, espuma) ardieron explosivamente; propagación ascendente acelerada | §16.1 |
| **Apolo 13** (1970) | O₂ puro a alta presión (~1000 psi) dentro de un tanque | Microgravedad | Un aislamiento de Teflon, poco inflamable en aire, ardió en O₂ a alta presión con una chispa pequeña; NASA lo considera el primer accidente con fuego registrado sin flujo de flotabilidad | §16.2 |
| **Mir** (1997) | Aire de cabina + fuente con oxidante propio | Microgravedad | Generador químico de O₂: no se apaga diluyendo ni cortando ventilación | §16.3 |

### 6.5 Tabla comparativa de entornos 🤖

| Atributo | Tierra 1 g | ISS / tránsito (µg) | Luna (0,165 g) | Marte (0,38 g) | Cabina con O₂ enriquecido |
|---|---|---|---|---|---|
| Transporte de O₂ | Convección natural fuerte | Difusión + ventilación forzada | Convección natural débil + ventilación | Convección natural moderada + ventilación | Depende de g; más O₂ por unidad de volumen de diluyente |
| Forma de llama | Gota, parpadeo | Esfera (aire quieto) o inclinada (con flujo) | Intermedia | Intermedia | Más brillante y rápida |
| Pérdida de calor dominante | Convección | Radiación | Mixta | Mixta | Igual que su g, con llama más caliente |
| Peor configuración conocida | Llama ascendente | Flujo bajo (~10 cm/s) | Posible MLOC ("Ricitos de Oro") | Posible MLOC | Más $x_{O_2}$ |
| Humo | Sube al techo | Se queda cerca o lo mueve el ECLSS | Capa débil que la ventilación dispersa en minutos | Intermedio | Más productos por fuego más intenso |
| Evidencia en PSI | Ensayos en tierra | **Directa** | **Ninguna directa** (vuelos, centrífugas, LUCI) | **Ninguna directa** (vuelos a 3/8 g) | Saffire VI (µg, ≈30 % O₂) |
| Nivel de evidencia por defecto | A | A | C/D | C/D | B (depende de la consulta) |
| Fuentes | [B4][T] | [WEB][B2][B10] | [B5][B7][B8][B14] | [B5][B8] | [B2][B19] |

---

## 7. Dinámica y comportamiento del hollín (soot)

### 7.1 Qué es el hollín

**Analogía.** El hollín es el "polvo de carbón" que queda cuando el combustible no alcanza a quemarse del todo, como el negro que deja una vela en un plato frío. Mientras está caliente dentro de la llama, **brilla**: es lo que hace que una vela sea amarilla. Una llama sin hollín (estufa de gas bien regulada) es azul.

**Definición técnica.** Partículas sólidas formadas casi solo por carbono (con algo de hidrógeno), de 10–50 nm cada una, que se unen en **agregados fractales** (cadenas ramificadas) de cientos de nanómetros. [T] Se miden con la **fracción volumétrica de hollín** $f_v$: volumen de hollín por volumen de gas (típicamente 0,1–10 ppm en llamas laminares). [T]

### 7.2 Ciclo de vida del hollín

```
combustible ──► pirólisis ──► acetileno (C₂H₂) y anillos aromáticos (PAH)
                                    │
                                    ▼
                        nucleación (~1–2 nm)
                                    │
                                    ▼
          crecimiento superficial (mecanismo HACA: H-abstraction, C₂H₂-addition)
                                    │
                                    ▼
             coagulación y agregación (agregados fractales)
                                    │
                                    ▼
     oxidación por OH· (dominante) y O₂ ──► CO / CO₂      o      escape como humo
```

| Etapa | Qué pasa | Rango de temperatura típico | Fuente |
|---|---|---|---|
| Pirólisis y precursores | El combustible se rompe en acetileno y moléculas aromáticas (PAH) | > 1000 K, en zonas con poco O₂ | [T] |
| Nucleación | Los PAH se apilan y forman las primeras partículas | ≈1300–1700 K | [T] |
| Crecimiento superficial | Las partículas engordan capturando acetileno | Igual | [T] |
| Coagulación / agregación | Las partículas chocan y se unen en cadenas | – | [T] |
| Oxidación | OH· y O₂ queman el hollín en la zona rica en O₂ | > ≈1300 K | [T] |

**Regla de oro** [T]: la cantidad de hollín que **sale** de una llama depende de la competencia entre **cuánto se forma** (crece con el **tiempo de residencia** en la zona caliente y rica en combustible) y **cuánto se oxida** (necesita temperatura y O₂). El **punto de humo** (*smoke point*) es el tamaño de llama a partir del cual el hollín escapa sin quemarse. El experimento SPICE de la ISS estudió precisamente cuándo una llama de gas empieza a soltar hollín. [REQ]

**Modelo mínimo para software** (dos ecuaciones, esquemático) [T]:

$$\frac{D(\rho Y_s)}{Dt} = \dot\omega_{nuc} + \dot\omega_{crec} - \dot\omega_{ox}, \qquad \frac{D(\rho N_s)}{Dt} = \dot N_{nuc} - \dot N_{coag}$$

$Y_s$ es la fracción másica de hollín y $N_s$ el número de partículas por unidad de masa; $f_v = \rho Y_s/\rho_{hollín}$ con $\rho_{hollín} \approx 1800$ kg/m³. Los parámetros dependen del combustible y deben calibrarse; **no** es un requisito del producto mínimo.

### 7.3 Hollín en la Tierra frente a microgravedad

| Aspecto | Tierra (1 g) | Microgravedad | Fuente |
|---|---|---|---|
| Velocidad del gas en la llama | Alta (la flotabilidad acelera el gas, ~1 m/s en una vela) | Baja | [WEB] |
| Tiempo de residencia | Corto | **Largo**: más tiempo para formar y hacer crecer hollín | [T] |
| Cantidad de hollín | Menor | En llamas de gas con mucho combustible, la fracción de hollín puede ser **varias veces mayor** (CLD Flame) | [B3] |
| Tamaño y forma de llama | Más pequeña | Más larga y ancha, con más hollín | [B3][WEB] |
| Dónde queda el hollín | Arrastrado hacia la punta, donde se oxida o escapa | **Atrapado dentro** de la llama azul; en gotas forma **cáscaras de hollín** | [WEB] |
| Fuerza que lo mueve | Arrastre por el gas que sube | **Termoforesis**: las partículas se alejan de las zonas calientes hacia las frías; sin flotabilidad, esta fuerza débil manda y concentra el hollín en capas | [T] |
| Pérdidas por radiación | Menores en proporción | **Mayores** | [WEB] |

#### Matiz importante: no toda llama en microgravedad es más hollinosa

- Las llamas cerca de su límite (flujo muy bajo, poco O₂) son **azules y tenues**: la pérdida de calor por radiación baja la temperatura por debajo de la ventana de formación de hollín. [WEB][T]
- El experimento **Flame Design** buscó precisamente "diseñar" llamas **sin hollín** cambiando dónde está el oxígeno (llama normal frente a inversa) y la estructura de la llama. [B3]
- Por tanto, la afirmación "las llamas en microgravedad son más radiantes por el mayor tiempo de residencia del hollín" es **correcta para llamas con mucho combustible lejos del límite**, y **no** se cumple en llamas débiles cerca de la extinción.

### 7.4 Radiación del hollín e impacto en la propagación del fuego

**Analogía.** El hollín caliente es como miles de brasas diminutas: cada una irradia calor en todas las direcciones, como una estufa eléctrica.

**Formalismo** [T]. En una llama ópticamente delgada, el coeficiente de absorción del hollín es aproximadamente:

$$\kappa_s \approx C\,f_v\,T, \qquad C \approx 1862\ \text{m}^{-1}\text{K}^{-1}$$

y la potencia radiada por unidad de volumen:

$$\dot q'''_{rad} \approx 4\,\kappa_s\,\sigma\,(T^4 - T_\infty^4)$$

Ejemplo [CALC]: $f_v$ = 1 ppm, $T$ = 1600 K → $\kappa_s \approx 3$ m⁻¹ y $\dot q'''_{rad} \approx 4{,}4$ MW/m³.

La **fracción radiante** $\chi_r = \dot Q_{rad}/\dot Q$ mide qué parte de la potencia del fuego sale como radiación. [T]

**Tres efectos del hollín sobre el fuego:**

| Efecto | Mecanismo | Resultado | Fuente |
|---|---|---|---|
| **Enfría la llama** | La radiación saca calor de la zona de reacción | Llamas grandes en microgravedad pueden **crecer hasta apagarse** por pérdida radiativa, pasando antes por un modo oscilante (se apagan parcialmente y se reforman) | [B3] |
| **Precalienta combustible cercano** | Parte de la radiación vuelve a la superficie del sólido o a otros materiales | Puede favorecer la propagación sobre sólidos gruesos y la ignición de materiales vecinos | [T][INF] |
| **Define la rama de flujo bajo de la curva en U** | Cerca del límite, la radiación del gas y la re-radiación del sólido son las pérdidas que apagan la llama | Extinción radiativa a flujo bajo | [B4][B8] |

> **Regla del informe** [INF]: ignorar la radiación cerca de los límites de microgravedad puede eliminar justo el mecanismo que se quiere estudiar. Un modelo de gas gris es una simplificación: H₂O, CO₂, combustible y hollín tienen respuestas espectrales distintas.

### 7.5 Hollín, humo y detección

El hollín que escapa de la llama, junto con los productos de pirólisis, forma el **humo**. Su tamaño y forma deciden qué detector lo ve (§10.1): SAME midió la morfología y el tamaño de las partículas de humo de materiales de nave, y encontró tamaños medios que a menudo estuvieron entre 200 y 400 nm. [B11][INF] Las llamas bien ventiladas producen partículas más pequeñas; el sobrecalentamiento y la combustión lenta, partículas más grandes. [B15]

### 7.6 Qué datos de hollín existen y cómo usarlos en el software 🤖

| Fuente | Variable | Estado | Uso |
|---|---|---|---|
| ACME · CLD Flame | Fracción volumétrica de hollín, temperatura del hollín, CH*, temperatura de llama | Mediciones en la ISS; disponibilidad de archivos en PSI **por confirmar** | Mapa de calor de $f_v$ (si hay campos 2D) |
| ACME · Flame Design | Hollín en llamas normales e inversas de etileno con O₂ variable | Por confirmar | Comparación "con / sin hollín" |
| SPICE | Punto de humo | Por confirmar | Curva de punto de humo vs. condición |
| SAME / SAME-2 | Tamaño y morfología del humo | Publicado [B11][B13] | Vista de detección |

**Reglas:**
1. El **mapa de calor de hollín** solo se muestra con datos reales de PSI (campos medidos). Si no existen, se muestra un esquema rotulado "cualitativo".
2. No inferir $f_v$ a partir del color de un video sin un método calibrado.
3. Guardar siempre el método de medida del hollín y su incertidumbre.

---

## 8. Propagación sobre sólidos y límites de inflamabilidad

### 8.1 Propagación de llama sobre sólidos

**Analogía.** Una llama que avanza sobre una tela es como una fila de fichas de dominó calientes: cada trozo de tela debe calentarse hasta "soltar vapores" antes de que la llama pase a él. La velocidad depende de cuánto calor recibe cada ficha y de cuánto le cuesta calentarse.

#### 8.1.1 Modelo de "tiempo de preparación" (el más útil para software)

$$V_f \simeq \frac{\ell_h}{t_{pir} + t_{ign}} \quad [\text{INF, Urban et al. 2025}]$$

| Símbolo | Significado | Unidad |
|---|---|---|
| $V_f$ | velocidad del frente de llama | m/s |
| $\ell_h$ | longitud de precalentamiento | m |
| $t_{pir}$ | tiempo para calentar y pirolizar | s |
| $t_{ign}$ | tiempo para que se establezca la reacción | s |

Para un sólido térmicamente delgado con flujo neto aproximadamente constante:

$$t_{pir} \sim \frac{\rho_s\,c_s\,\delta_s\,(T_p - T_0)}{q''_{neto}}, \qquad q''_{neto} > 0$$

Compara la **energía necesaria por unidad de área** con la **energía que entra por unidad de área y tiempo**. Para saber si un material es delgado o grueso se compara su espesor $\delta_s$ con la profundidad de penetración térmica $\delta_T \sim \sqrt{\alpha_s t}$. [INF]

#### 8.1.2 Fórmulas clásicas de de Ris (flujo opuesto) [T]

Térmicamente delgado ($\tau$ = semiespesor):

$$V_f = \frac{\sqrt{2}\,\lambda_g\,(T_f - T_v)}{\rho_s\,c_s\,\tau\,(T_v - T_\infty)}$$

Térmicamente grueso:

$$V_f = U_\infty\,\frac{\rho_g\,c_g\,\lambda_g}{\rho_s\,c_s\,\lambda_s}\left(\frac{T_f - T_v}{T_v - T_\infty}\right)^2$$

Lecturas para no físicos:
- Más temperatura de llama $T_f$ (más O₂) → más rápido.
- Material más grueso o con más capacidad calorífica → más lento.
- En material grueso, $V_f$ **crece con el flujo opuesto** $U_\infty$ porque el flujo acerca la llama a la superficie. Pero con flujo demasiado alto aparece el soplado (§8.2). Estas fórmulas no incluyen pérdidas radiativas ni límites cinéticos; son la **línea base física** con la que debe compararse cualquier modelo. [T][REQ]

#### 8.1.3 Modelo de Fernandez-Pello con flujo externo y química (Thomsen et al. 2017) [B19]

Forma esquemática (la expresión exacta, con su constante numérica $C$ y el término químico, está en el PDF B19, ec. 1; **transcribirla desde el PDF, no desde aquí**):

$$V_f \;\propto\; \frac{l_h\,\left[\dot q''_f + \dot q''_e - \dot q''_{rs}\right]}{\rho_s\,c_s\,\delta_s\,(T_p - T_0)} \quad\text{más un término cinético que depende de } U_\infty \text{ y } t_{chem}$$

La idea: el calor de la llama $\dot q''_f$ y el calor externo $\dot q''_e$ empujan la llama; la re-radiación del sólido $\dot q''_{rs}$ y un término químico la frenan. Más O₂ sube $\dot q''_f$. Si baja el O₂, una fuente radiante externa puede suplir el calor que falta.

#### 8.1.4 Llama opuesta vs. concurrente: resultados que contradicen la intuición

| Resultado | Detalle | Fuente |
|---|---|---|
| Concurrente **no** siempre acelera | En Saffire, la tela grande (94 × 40,6 cm) a 20 cm/s alcanzó propagación y longitud de llama **limitadas**; la placa gruesa de PMMA tendió a un estado casi estacionario | [INF][B10] |
| Velocidad medida (Saffire-1, SIBAL) | Concurrente: **1,8 mm/s**, potencia media 1.200 ± 300 W, 420 s de quema. Opuesta: **1,3 mm/s** | [B10] |
| Comparación con 1 g | Las mismas muestras en la Tierra ardieron **por completo y acelerando**; algunas siliconas que no propagaron en µg sí lo hicieron en 1 g | [B10] |
| PMMA grueso en Saffire VI | Creció **de forma continua** hasta que se redujo el flujo; SIBAL se estabilizó rápido | [B2] |
| Llama "limitada" | Con flujo concurrente lento en µg, las llamas alcanzan un largo constante: en sólidos delgados por agotamiento del combustible; en gruesos por balance entre calor de la llama y pérdidas en la zona de precalentamiento | [B4] |

#### 8.1.5 Longitud de precalentamiento y gravedad (Takahashi et al. 2026a) [B5]

Para llama **descendente** sobre sólidos delgados, la longitud de precalentamiento escala como:

$$L_g \propto g^{-1/6}\,p^{-1/3}$$

$L_g$ aumenta al bajar la gravedad y la presión, y responde rápido a las fluctuaciones de g, por lo que sirve como indicador en vuelos cortos. Para llama **ascendente**, otros autores correlacionan con el parámetro $p^{1{,}8}g$. [B5]

### 8.2 Límites de inflamabilidad: dónde el fuego deja de existir

#### 8.2.1 La curva en "U" (mapa de inflamabilidad)

**Analogía.** Una vela al aire libre: si no hay nada de viento en un cuarto cerrado y sin gravedad, se ahoga en sus propios gases; con una brisa suave arde feliz; con un ventilador fuerte, se apaga de un soplido. Hay un "punto dulce" de viento.

```
 x_O2 límite
   ▲
   │\                                   /
   │ \  extinción por                  /  soplado
   │  \ pérdidas (radiación)          /   (Da bajo)
   │   \                             /
   │    \___________________________/
   │          ↑ MLOC (zona más peligrosa)
   └──────────────────────────────────────────► velocidad del flujo U
        ~0          ~5–15 cm/s (µg)          alta
```

*Esquema ilustrativo; la posición real del mínimo depende del material, la geometría, la presión y la gravedad (ej.: propagación más rápida cerca de ≈10 cm/s en BASS; MLOC lunar ≈9,5 cm/s en el modelo de Nakaya). [WEB][B8]*

- **Rama izquierda (flujo bajo):** la llama se apaga porque pierde calor (radiación) y no llega suficiente O₂. [B4]
- **Rama derecha (flujo alto):** soplado; el tiempo de residencia es menor que el químico. [B4]
- **Fondo de la U = MLOC:** el O₂ más bajo con el que el material arde. Al subir el O₂, el límite de baja velocidad baja y el de soplado sube. [B4]

**Advertencia [INF]:** la U se ajustará **solo donde los datos la muestren**. La interfaz no debe imponer una U a todos los materiales.

#### 8.2.2 Gravedad parcial: la "zona Ricitos de Oro"

En gravedad lunar, algunos materiales tienen **límites de inflamabilidad más amplios que en la Tierra**: la flotabilidad trae suficiente O₂ fresco, pero no tanto como para enfriar la llama. [B7] Evidencia:

| Estudio | Material / configuración | Resultado | Fuente |
|---|---|---|---|
| Olson et al. (2024) | Varillas de PMMA, estancamiento concurrente, centrífuga 0,04–1 g, 57,6 kPa | Mínimo de la frontera de O₂ (13,2–15,2 %) **cerca de gravedad lunar** | [INF] |
| Takahashi et al. (2026a) | Papel de filtro y PMMA delgado, llama descendente | Índice de O₂ predicho para papel en base lunar (0,165 g, 56,5 kPa): **18,6 %**; MLOC cerca de **0,01 g** | [B5] |
| Nakaya et al. (2025) | Varillas de PMMA de 4 y 6 mm, flujo opuesto, centrífuga 1–4 g; modelo bayesiano | Perfil en U en µg; MLOC lunar a ≈9,5 cm/s, marciano a ≈4,5 cm/s; el **mínimo absoluto podría estar en gravedad parcial** (con incertidumbre grande) | [B8] |
| Liveretou et al. (2026) | PMMA grueso, flujo opuesto 10 cm/s, Tierra vs. ISS | Diferencia de LOC de **3–4 puntos porcentuales** entre 1 g y µg | [INF] |
| Urban et al. (2025) | Seis materiales en WSTF y centrífuga | "Factores de compensación" de O₂ (tabla siguiente) | [B6] |

**Factores de compensación de inflamabilidad lunar (Urban et al. 2025)** [B6]. Se tomó **35 cm/s como sustituto del flujo de flotabilidad en 1 g** y se usó la diferencia entre el límite extrapolado a 35 cm/s y a flujo cero como estimación conservadora del aumento de inflamabilidad en gravedad reducida:

| Material | Pendiente (s/cm) | Pendiente IC 95 % (s/cm) | ΔO₂ a 35 cm/s, IC 95 % (puntos) |
|---|---|---|---|
| PMMA | 0,00022 | 0,00056 | **1,9** |
| Policarbonato | 0,00040 | 0,00065 | **2,3** |
| Velcro Nomex | 0,000016 | 0,000090 | **0,32** |
| P 213 | 0,00030 | 0,00040 | **1,4** |
| Beefy-T (llama) | 0,00017 | 0,00023 | **0,82** |
| Beefy-T (rescoldo) | 0,00034 | 0,00050 | **1,8** |

> **Conexión con el requerimiento del equipo.** [REQ] propone restar un margen extra de 2–4 puntos en gravedad parcial. Los factores de B6 son de 0,3 a 2,3 puntos y **dependen del material**. El informe [INF] advierte que esa banda es una propuesta del equipo, no un resultado, y que debe usarse solo como análisis de sensibilidad etiquetado.

#### 8.2.3 Definiciones operativas que el software no debe mezclar

| Métrica | Definición | Protocolo | Fuente |
|---|---|---|---|
| **MOC (NASA-STD-6001B, Test 1)** | Máximo O₂ en el que **5 de 5** probetas pasan: ninguna arde > **15 cm** y ninguna gotea material encendido que prenda el papel de abajo | Probeta vertical 30 × 6,5 cm, ignición por abajo, **sin flujo de aire**, mezcla O₂/N₂ del peor caso; "ambiente" = 20,9 % O₂, 101,4 kPa, 23 ± 5 °C | [B9] |
| **OI (ASTM D2863)** | Mínimo O₂ en mezcla O₂/N₂ que sostiene la combustión tipo vela | Útil para comparar; no predice compatibilidad absoluta | [B9] |
| **LOC-FS** | Mínimo O₂ para que el frente siga avanzando | Depende del estudio (ej. Nakaya: éxito = 4 cm de propagación, pasos de 0,005 en fracción molar) | [INF][B8] |
| **LOC-FR** | Mínimo O₂ para la extinción completa | Rivera et al. (2026): LOC-FS > LOC-FR en PMMA | [INF] |

🤖 **Regla de software:** cada valor de LOC/MOC/OI se guarda **con su protocolo** (evento, criterio de éxito, geometría, flujo, presión, gravedad). Comparar un MOC de 15 cm con un LOC-FS de 4 cm es un error. [INF]


---

## 9. Gotas, llamas frías y supresión

### 9.1 Gotas: la ley d² y las llamas frías

**Analogía.** Un cubito de hielo en un vaso: se derrite desde la superficie, y como la superficie se achica, cada vez se derrite menos masa por segundo. Una gota que arde hace lo mismo y, sorprendentemente, el **área** (no el diámetro) baja a ritmo constante.

**Ley d²** [INF][T]:

$$D^2(t) = D_0^2 - K\,t, \qquad K = -\frac{d(D^2)}{dt}$$

**Tiempo de vida** (si no hay extinción antes ni rotura): $t_b \simeq D_0^2/K$. [INF]

**Teoría cuasiestacionaria clásica (Spalding)** [T]:

$$K = \frac{8\,\lambda_g}{\rho_l\,c_{p,g}}\,\ln(1 + B), \qquad B = \frac{c_{p,g}(T_\infty - T_s) + Y_{O,\infty}\,\Delta h_c/\nu}{L_v}$$

| Símbolo | Significado | Unidad |
|---|---|---|
| $\rho_l$ | densidad del líquido | kg/m³ |
| $B$ | número de transferencia de Spalding | – |
| $L_v$ | calor latente de vaporización | J/kg |
| $\Delta h_c$ | calor de combustión | J/kg |
| $Y_{O,\infty}$ | fracción másica de O₂ lejos de la gota | – |

**Posición de la llama** (teoría simple) [T]: $r_f/r_s = \ln(1+B)/\ln(1+Y_{O,\infty}/\nu)$. Los datos de µg muestran que, al principio, la llama y la velocidad de quemado crecen lentamente por efectos transitorios, y que pueden formarse **cáscaras de hollín**. [WEB]

**Reglas del informe para usar FLEX** [INF]:
- Ajustar $K$ en una ventana justificada **después del transitorio**, con residuos e incertidumbre.
- Con $D$ en mm y $t$ en s, $K$ en mm²/s.
- Las terminaciones **no** son todas "se apagó": puede haber extinción, rotura de la gota, salida del campo de visión, fin de la grabación o llama fría.

**Ejemplo verificable (PSI-69, ensayo 30CAL03)** [INF][CALC]: metanol, 760 mmHg, O₂/N₂ = 0,21/0,79, $D_0$ = 1,92 mm, diámetro de extinción visible 0,81 mm, duración 6,34 s, columna de "tasa" = 0,48.

$$\bar K = \frac{D_0^2 - D_{ext}^2}{t} = \frac{1{,}92^2 - 0{,}81^2}{6{,}34} = \frac{3{,}686 - 0{,}656}{6{,}34} \approx 0{,}478\ \text{mm}^2/\text{s}$$

El valor coincide con el 0,48 de la tabla, lo que **sugiere** que esa columna es una $K$ media en mm²/s entre ignición y extinción visible. El informe pide confirmar versión, definición y ventana de ajuste antes de darlo por hecho. [INF][CALC]

**Hallazgos de FLEX** [WEB]:
- La microgravedad **bajó el límite de inflamabilidad**: el índice de oxígeno límite es bastante menor que en 1 g. Las normas terrestres de supresión con gases inertes **podrían no dar el mismo margen** en baja gravedad.
- Tras la extinción radiativa de la llama visible, persisten **llamas frías** y la vaporización continúa un tiempo antes de detenerse con un diámetro finito.

### 9.2 Supresión: cómo se apaga un fuego sin gravedad

**Analogía.** Para apagar una fogata puedes quitarle aire (taparla), enfriarla (agua) o llenar el aire de algo que no arde (arena, CO₂). En el espacio hay un problema extra: el extintor mueve aire, y ese aire puede **traer** oxígeno a la llama.

#### 9.2.1 Gases diluyentes (CO₂, N₂, He)

Ruff et al. (2004) quemaron cilindros de PMMA de 19,1 mm en vuelos parabólicos KC-135 (≈20 s de baja gravedad), a 1 atm, con aire base de 21 % o 25 % O₂ y flujos de 1–10 cm/s. [B17]

| Hallazgo | Detalle | Fuente |
|---|---|---|
| Más flujo → más agente | En baja gravedad la concentración de supresor necesaria **aumentó con la velocidad** hasta ~10 cm/s | [B17] |
| A 10 cm/s ≈ 1 g | La entalpía efectiva necesaria a 10 cm/s es casi la de 1 g (63,2 kcal/mol O₂) | [B17] |
| Mecanismo pasivo | CO₂, N₂ y He actúan por **desplazamiento de O₂ y enfriamiento** | [B17] |
| Helio | Algo por debajo de CO₂ y N₂ por su alta conductividad térmica | [B17] |
| Procedimiento ISS | Tras una alarma de incendio se **corta la ventilación y la energía**; descargar un extintor induce flujo | [B17] |
| Espuma de agua | No "recomendada" en módulos de EE. UU. (2004) | [B17] |

**Correlación usada** [B17]:

$$\text{Entalpía efectiva por mol de O}_2 = \frac{\sum_i x_i\,\bar c_{p,i}\,\Delta T}{x_{O_2}} \quad [\text{kcal/mol O}_2]$$

Valores de referencia de estudios previos para extinguir [B17]:

| Agente | $x_{agente}/x_{O_2}$ crítico | Estudio citado |
|---|---|---|
| CO₂ | 0,62 | Prasad et al. |
| CO₂ | 1,12 | Takahashi et al. |
| He | 2,1 | Takahashi et al. |
| N₂ | 2,92 | Takahashi et al. |

> La variabilidad (0,62 vs 1,12 para CO₂) muestra que la **geometría importa**. Una concentración crítica de un quemador **no es una dosis para una cabina**. [B17][INF]

🤖 **Regla de mezcla** [INF]: añadir CO₂ a un aire base **cambia** la fracción de O₂. Las fracciones deben sumar 1. Un modelo no debe variar $x_{CO_2}$ manteniendo fijas todas las demás si eso da una mezcla imposible.

#### 9.2.2 Niebla de agua

**Experimento Mist (STS-107, 2003)** [B18]: tubo de 6,3 cm × 49,5 cm con mezcla propano-aire; 32 ensayos con riquezas φ = 0,6 / 0,7 / 1,0 / 1,3; fracción másica de agua de 0 a 0,40; gotas medias de 20 y 30 µm.

| Hallazgo | Fuente |
|---|---|
| Las llamas pobres frenan **más** con más agua y con gotas **más pequeñas**, hasta extinguirse a la carga máxima | [B18] |
| Simulación metano-aire: llama húmeda ≈34 cm/s vs. seca ≈39 cm/s; las nieblas muy finas son más eficaces, con un límite cerca de **10 µm** | [B18] |
| La microgravedad sin vibración fue imprescindible para tener una nube de gotas uniforme y quieta durante minutos | [B18] |
| Se observaron frentes rotos (celulares) y llamas pulsantes | [B18] |

**Física de la gota de agua** [INF]: en régimen de Stokes, el tiempo de respuesta de una gota es

$$\tau_p \sim \frac{\rho_l\,d_p^2}{18\,\mu_g}, \qquad St = \frac{\tau_p}{\tau_{flujo}}$$

Ejemplo [CALC]: $d_p$ = 20 µm, $\rho_l$ = 1000 kg/m³, $\mu_g$ = 1,8 × 10⁻⁵ Pa·s → $\tau_p \approx 1{,}2$ ms: la gota sigue al aire casi de inmediato ($St \ll 1$). En microgravedad **no** se deben dibujar gotas cayendo por defecto. [INF]

**Extintor de niebla fina (FWM)** [WEB][B16]: certificado para vuelo; se planearon nueve unidades y las dos primeras se enviaron en diciembre de 2015 para **reemplazar** los extintores de CO₂. TechPort declara pruebas representativas a **34 % O₂ y 8 psia** (declaración del proyecto, no una matriz de límites publicada). [INF]


---

## 10. Humo, detección y escala de cabina

### 10.1 Humo y detección

**Analogía.** Un detector es un "nariz electrónica" calibrada para cierto tamaño de partícula. Si el humo de un incendio espacial tiene partículas de otro tamaño, la nariz puede no olerlo.

#### 10.1.1 Tamaño de partícula y distribución lognormal [B11][B12]

$$D_p = D_g\,\exp\!\left(p\,\ln^2\sigma_g\right)$$

| Símbolo | Significado |
|---|---|
| $D_g$ | diámetro medio geométrico (por número) |
| $\sigma_g$ | desviación estándar geométrica |
| $p$ | orden del momento: $p$ = 0,5 → diámetro medio por número $D_{0.5}$; $p$ = 1,5 → diámetro de masa media $D_{1.5}$ |

Relación inversa: $\sigma_g = \exp\!\left[\sqrt{\ln(D_{1.5}/D_{0.5})}\right]$.

Ejemplo de la fuente, verificado [B12][CALC]: $D_g$ = 1,0 µm y $\sigma_g$ = 2,0 → $D_{0.5}$ = 1,27 µm y $D_{1.5}$ = 2,06 µm.

**Instrumentos de SAME (tres momentos)** [B11]:
- Momento 0: contador de núcleos de condensación P-Trak (20 nm–1 µm).
- Momento 1: cámara de ionización de un detector doméstico.
- Momento 3: dispersión de luz DustTrak (masa).

#### 10.1.2 Resultados y lecciones de detección

| Hallazgo | Fuente |
|---|---|
| El objetivo de detección en una nave es la fase temprana: **productos de pirólisis**, no hollín ni ceniza | [B12] |
| Los tamaños medios de humo en SAME-2 estuvieron a menudo entre **200 y 400 nm**; el conjunto, 100–600 nm | [INF][B11][B13] |
| El detector de la ISS (láser, dispersión frontal) es más sensible a partículas **> 1 µm**, con sensibilidad hasta 0,6 µm; alarma a **1 % obscuración/ft** | [B12][WEB] |
| El detector de la ISS **detectó** bien el humo grande de celulosa, silicona y Pyrell, pero **falló con frecuencia** con el humo pequeño de **Teflon y Kapton**, materiales muy usados en electrónica | [WEB][B13] |
| Ningún tipo de detector único sirve para todos los materiales y calentamientos | [WEB] |
| El detector del transbordador era de ionización (9 W, con bomba y separador de partículas > 1 µm, buscaba 0,4–0,7 µm); el de la ISS consume 1,5 W y no tiene piezas móviles | [B12] |
| Las llamas bien ventiladas producen partículas pequeñas (mejor ionización); el sobrecalentamiento y la combustión lenta, partículas grandes (mejor dispersión) | [B15] |
| La mezcla de la cabina por el ECLSS puede diluir el humo antes de que alcance el umbral del detector; el polvo suspendido puede causar falsas alarmas | [WEB] |
| En un hábitat lunar simulado, una corriente forzada de 5 cm/s puede dispersar en minutos la capa de humo que se formaría cerca del techo | [INF][B14] |

🤖 **Regla de software:** una media por número **no equivale** a una media por masa. Guardar siempre la **métrica** de tamaño. [INF]

### 10.2 Escala de cabina: calor, gases tóxicos y limpieza

#### 10.2.1 Calorimetría por consumo de oxígeno [B2]

$$\dot Q \simeq E_{O_2}\,\dot m_{O_2,consumido}, \qquad E_{O_2} \approx 13{,}1\ \text{kJ/g de O}_2$$

Ejemplo [CALC]: un pico de 3,217 kW (Saffire VI-2) equivale a consumir ≈0,25 g/s de O₂.

#### 10.2.2 Resultados de Saffire IV–VI (Cygnus, volumen libre 16,7–19,0 m³) [B2]

| Ensayo | Material | P (kPa) | O₂ (%) | Duración (s) | Pico HRR (W) | Energía total (kJ) | Aumento de CO₂ (ppm) | Aumento de CO (ppm) |
|---|---|---|---|---|---|---|---|---|
| IV-1 | SIBAL | 100,0 | 22,0 | 130 | 3.150 | 409 | 1.390 | 80 |
| V-2 | Algodón jersey | 70,7 | 26,2 | 200 | 2.800 | 560 | 2.360 | 83 |
| VI-2 | SIBAL | 54,1 | 31,0 | 112 | 3.217 | 580 | 2.800 | 120 |
| VI-3 | PMMA 2 caras (1 cm) | 54,6 | 30,3 | 780 | 3.080 | 1.280 | 8.539 | 308 |
| VI-4 | PMMA 1 cara (0,5 cm) | 55,2 | 28,8 | 1.200 | 1.507 | 830 | 8.117 | 320 |

Todos con flujo concurrente de 20 cm/s y muestras de 41 cm de ancho. [B2]

**Lectura clave:** los fuegos fueron de **1,5–3 kW**, pequeños para estándares terrestres, pero el aumento de temperatura y presión de la nave fue **menos significativo** que el aumento de CO₂ y CO. [B2] Comparado con los SMAC [CALC]: un solo fuego de PMMA de ~13 min (VI-3) subió el CO medio de la nave en **308 ppm**, por encima del límite de 24 h (100 ppm) y no lejos del límite de 1 h (425 ppm).

#### 10.2.3 Límites de exposición (JSC 20584 rev. C, 2024) [INF]

| Sustancia | 1 h (ppm) | 24 h (ppm) | Nota |
|---|---|---|---|
| CO | 425 | 100 | Riesgo por carboxihemoglobina |
| HCl | 5 | 2 | Gas ácido; se adhiere a superficies |
| HCN | 8 | 4 | Depende del combustible |
| HF | 3 | 3 | No sustituir por "humo" genérico |
| CO₂ | No es SMAC en esta revisión | – | Consultar NASA-STD-3001 |

Valores definidos para 14,7 psi, 21 % O₂ y 25 °C; no trasladarlos sin revisión a otra atmósfera. [INF]

#### 10.2.4 Modelo de cabina bien mezclada [INF]

$$\frac{dC_i}{dt} = \frac{\dot m_i}{V} + \frac{Q_{ext}}{V}(C_{i,ext} - C_i) - \left(\frac{\eta_i\,Q_{rec}}{V} + k_{i,dep}\right)C_i + k_{i,des}\,\frac{M_{i,s}}{V}$$

| Símbolo | Significado | Unidad |
|---|---|---|
| $C_i$ | concentración másica de la especie $i$ | kg/m³ |
| $\dot m_i$ | generación por el fuego | kg/s |
| $V$ | volumen libre de la cabina | m³ |
| $Q_{ext}$ | intercambio con aire exterior a la zona | m³/s |
| $Q_{rec}$ | caudal de recirculación | m³/s |
| $\eta_i$ | eficiencia de retirada del filtro **para esa especie** | – |
| $k_{i,dep}, k_{i,des}$ | depósito y liberación en superficies | 1/s |
| $M_{i,s}$ | masa depositada (necesita su propia ecuación) | kg |

Reglas: recircular sin filtrar **no** elimina masa; un filtro de partículas **no** retira CO; el modelo sirve para balances y sensibilidad, **no** para ubicar detectores ni picos locales. [INF]


---

## 11. Ecuaciones de gobierno y constantes

### 11.1 Ecuaciones de gobierno (modelo de bajo número de Mach) [INF]

Para el equipo que quiera simular (no es requisito del MVP):

$$\partial_t\rho + \nabla\cdot(\rho\mathbf{u}) = 0 \qquad (4.15\text{-}1)$$

$$\rho\frac{D\mathbf{u}}{Dt} = -\nabla\pi + \nabla\cdot\boldsymbol{\tau} + (\rho - \rho_{ref})\,\mathbf{g} + \mathbf{f}_e \qquad (4.15\text{-}2)$$

$$\partial_t(\rho Y_k) + \nabla\cdot(\rho\mathbf{u}Y_k) = -\nabla\cdot\mathbf{J}_k + \dot\omega_k \qquad (4.15\text{-}3)$$

$$\rho\frac{Dh_s}{Dt} = \frac{Dp_0}{Dt} + \nabla\cdot(\lambda_g\nabla T) - \nabla\cdot\sum_k h_{s,k}\mathbf{J}_k + \dot q'''_{chem} - \nabla\cdot\mathbf{q}_r \qquad (4.15\text{-}4)$$

| Ecuación | Qué conserva | Dónde entra la gravedad |
|---|---|---|
| 11.1-1 | masa | – |
| 11.1-2 | cantidad de movimiento | término $(\rho-\rho_{ref})\mathbf{g}$; $\mathbf{f}_e\approx\rho_e\mathbf{E}$ es la fuerza eléctrica de E-FIELD |
| 11.1-3 | cada especie química | indirecta (vía $\mathbf{u}$) |
| 11.1-4 | energía | indirecta (vía $\mathbf{u}$) |

$\pi$ es la presión dinámica; $p_0$ la presión termodinámica (puede variar en una cámara sellada); $\boldsymbol\tau$ el tensor de esfuerzos viscosos; $\dot\omega_k$ la producción química. La ecuación de estado cierra el sistema. **Bajo Mach no significa densidad constante.** Un esquema que quema el combustible instantáneamente puede describir transporte de humo con HRR impuesta, pero **no** predecir extinción cinética ni llamas frías. [INF]

**La fuerza eléctrica de E-FIELD no tiene la distribución espacial de la flotabilidad**, por lo que no existe una tabla de conversión voltios → gravedad lunar. [INF]

**Niveles de simulación recomendados** [INF]: (1) modelo reducido para barridos rápidos; (2) llama resuelta 2D/3D para una geometría; (3) cabina para transporte y limpieza. Una animación de interfaz es una cuarta categoría y se rotula como **cualitativa**.

### 11.2 Constantes y valores de referencia 🤖

| Constante | Símbolo | Valor | Unidad | Fuente |
|---|---|---|---|---|
| Gravedad estándar | $g_0$ | 9,80665 | m/s² | [INF] |
| Gravedad lunar | $g_L$ | 0,165 $g_0$ ≈ 1,62 | m/s² | [REQ] |
| Gravedad marciana | $g_M$ | 0,38 $g_0$ ≈ 3,73 | m/s² | [REQ] |
| Constante de los gases | $R$ | 8,314462618 | J/(mol·K) | [T] |
| Stefan–Boltzmann | $\sigma$ | 5,670374419 × 10⁻⁸ | W/(m²·K⁴) | [T] |
| Calor por O₂ consumido (Huggett) | $E_{O_2}$ | 13,1 | kJ/g O₂ | [B2] |
| Temperatura de pirólisis PMMA (modelo Nakaya) | $T_v$ | 593 | K | [B8] |
| O₂ del aire | $x_{O_2}$ | 0,209 | – | [B9] |
| Presión atmosférica estándar | $P_0$ | 101,325 | kPa | [INF] |
| Densidad superficial SIBAL | – | 18,05 | mg/cm² | [B2] |
| Ventilación típica de nave | $U$ | ≈10–20 | cm/s | [B4] |
| Flujo equivalente a flotabilidad 1 g (sustituto) | – | 35 | cm/s | [B6] |

---


---

## 12. Análisis de datos de la NASA y la PSI (Physical Sciences Informatics)

### 12.1 Qué es PSI y cómo está organizado

PSI da acceso abierto a datos de investigaciones en microgravedad y en tierra de seis disciplinas (biofísica, combustión, fluidos complejos, física de fluidos, física fundamental y ciencia de materiales) y sigue los principios **FAIR** (encontrable, accesible, interoperable, reutilizable). [WEB] Recientemente se inició un **Grupo de Trabajo de Análisis (AWG) de Combustión**. [WEB]

Según el video del reto, combustión tiene **24 investigaciones y ≈12 TB**; cada investigación tiene una carpeta por muestra y publicaciones enlazadas por DOI. [REQ] Según la guía oficial de PSI, cada página de investigación tiene filtros por área y tipo de proyecto, imágenes destacadas, una sección *Data Files and Documents*, la lista de publicaciones con enlaces externos y un **historial de versiones**. [WEB]

| Elemento de la página PSI | Qué contiene | Uso en el software |
|---|---|---|
| Resumen | Objetivos y enfoque | Fichas, ranking, asistente |
| *Data Files and Documents* | Subcarpetas por muestra: tablas, imágenes, video, documentos | Tablas curadas; evidencia visual |
| Publicaciones | Enlaces DOI | Citas y hallazgos |
| Historial de versiones | Versiones anteriores de la página | **Registrar la versión usada** (reproducibilidad) |
| DOI de la investigación | Ej.: BASS-II = `10.60555/4qc4-de67` (PSI-25, versión 4) | Cita obligatoria [INF] |

**Limitación práctica.** Las páginas de PSI se generan con JavaScript; una descarga automática simple de la página no devuelve contenido. La ingesta debe hacerse a mano o con un navegador automatizado, previa consulta a `msfc-psi-help@mail.nasa.gov` si se piensa automatizar. [WEB][REQ]

🤖 **Reglas de ingesta** [REQ]: no descargar los 12 TB; priorizar resúmenes, documentos y tablas; descargar imágenes o video solo de muestras seleccionadas; guardar la versión de cada página.

### 12.2 Inventario de investigaciones y su utilidad 🤖

> El inventario completo de las 24 investigaciones **no está verificado** (punto abierto A3). Las filas siguientes son las identificadas en las fuentes. No completar el resto con fichas inventadas. [INF]

| Investigación | Familia | Hardware / plataforma | ID PSI | Variables principales | Pilar | Uso en el producto |
|---|---|---|---|---|---|---|
| BASS / BASS-II | Sólidos (+ gas) | ISS, MSG | **PSI-25** (BASS-II) | Material, espesor, O₂, velocidad de flujo, video del frente | Prevención | Mapas de propagación; modelo 2 |
| Saffire I–VI | Sólidos a gran escala | Cygnus sin tripulación | Por confirmar | Material, P, O₂, flujo, V_f, HRR, CO, CO₂, aerosol | Prevención, detección, limpieza | Escala de nave; casos de cabina |
| SoFIE (MIST, GEL, SMµRF y otras) | Sólidos | ISS, CIR (2022–2025) | Por confirmar | Ignición, propagación, extinción, radiación externa | Prevención | Límites de materiales (cuando haya datos) |
| FLEX / FLEX-2 | Gotas líquidas | ISS, CIR/MDCA | **PSI-69** (FLEX) | Combustible, D₀, P, O₂, CO₂, He, D(t), K, modo final | Supresión | Modelo 1 (K y extinción) |
| CFI | Gotas, llamas frías | ISS, CIR/MDCA | Por confirmar | Combustible, O₂, P, régimen | Fundamental | Alerta de llama fría |
| ACME · CLD Flame | Gas | ISS, CIR | Por confirmar | Dilución, velocidad, hollín, T | Fundamental | Contexto |
| ACME · E-FIELD Flames | Gas + campo eléctrico | ISS, CIR | Por confirmar (datos ya publicados en PSI) [B3] | Voltaje, forma de llama, corriente iónica | Proxy de transporte | Nivel de evidencia C |
| ACME · BRE | Gas que emula sólidos | ISS, CIR | Por confirmar | Flujo de combustible, flujo de calor, O₂ (21–40 %), P (≈56–100 kPa); 59 ensayos | Prevención | Calor de retorno |
| ACME · Flame Design | Gas | ISS, CIR | Por confirmar | O₂, flujo, hollín, llama normal/inversa | Fundamental | Contexto |
| ACME · s-Flame | Gas esférico | ISS, CIR | Por confirmar | Combustible (H₂, CH₄, C₂H₄), diluyente N₂/He, extinción | Fundamental | Llama esférica real |
| ACME · CFI-G | Gas, llamas frías | ISS, CIR | Por confirmar | Hasta 85 % O₂ [REQ]; etano, propano, n-butano | Prevención (O₂ alto) | Modelo 3 |
| SPICE | Gas, punto de humo | ISS, MSG | Por confirmar | Hollín, flujo | Fundamental | Contexto |
| SLICE | Gas, despegue de llama | ISS, MSG (2012) | Por confirmar (usado en propuestas PSI C 2017) [WEB] | Velocidades, estabilidad | Fundamental | Contexto |
| SAME / SAME-2 | Humo | ISS, MSG | Por confirmar | Material, calentamiento, flujo (0–8 cm/s), envejecimiento (11–1800 s), tamaños | Detección | Modelo 4 |
| DAFT | Polvo / fondo | ISS | Por confirmar | Instrumentos, aerosol de fondo | Detección (indirecta) | Fondo de partículas |
| LUCI | Sólidos en g lunar simulada | New Shepard rotatorio | **No está en PSI** [REQ] | Tejido 5 × 30 cm, PMMA 4 mm, O₂, P, aceleración | Prevención | Evidencia parcial |
| FM2 | Sólidos en la Luna | HLS (futuro) | Sin datos aún | SIBAL, PMMA 4 mm; 21 %/101,3 kPa y 34 %/56,5 kPa | Prevención | Brecha que se cerrará |

### 12.3 Instalaciones y rangos de operación (límites físicos de los datos) 🤖

| Instalación | Volumen | Presión | O₂ | Flujo | Otros | Fuente |
|---|---|---|---|---|---|---|
| CIR | ≈100 L, 8 ventanas | – | – | – | Gases, líquidos y sólidos | [B3][WEB] |
| MDCA (en CIR) | – | 0–3 atm | ≤ 40 % (vol.) | – | Gotas de 1–5 mm | [WEB] |
| SoFIE (en CIR) | – | 0,2–1,5 atm | 10–40 % | 0–30 cm/s | Radiación externa | [WEB] |
| MSG | 255 L, presión negativa | – | – | – | 1.000 W de potencia y de refrigeración | [WEB] |
| Saffire (Cygnus) | 16,7–19,0 m³ libres | 54–100 kPa | 22–31 % | 20–25 cm/s en el túnel | Túnel 30 × 45 × 109 cm (IV–VI) | [B2][B10] |
| Ruff (KC-135) | Cámara 25,4 cm Ø × 51 cm | ≤ 3 atm | 21 / 25 % base | ≤ 17 cm/s | ≈20 s de baja g | [B17] |

🤖 **Uso:** estos rangos definen el **dominio de validez**. Una consulta fuera de ellos dispara la alerta ALR-09 (§13.7).

### 12.4 Datos cuantitativos clave ya extraídos 🤖

#### 12.4.1 Saffire I–II (Ferkul et al. 2017) [B10]

| Muestra | Material | Ancho × espesor × largo | Flujo | Dirección | O₂ (%) | Duración µg | Largo quemado µg | V_f µg | Resultado en 1 g |
|---|---|---|---|---|---|---|---|---|---|
| 1-1 | Algodón-fibra de vidrio | 40,6 cm × 0,37 mm × 94 cm | 20 cm/s | Concurrente | 21,7→21,5 | 420 s | ≈84 cm | 1,8 mm/s | Completo, acelerando |
| 1-2 | Algodón-fibra de vidrio | 40,6 cm × 0,37 mm × ≈10 cm | 20 cm/s | Opuesta | ≈21,5 | 70 s | ≈10 cm | 1,3 mm/s | ≈0 |
| 2-1 | Silicona | 5 cm × 0,27 mm × 29 cm | 20 cm/s | Concurrente | ≈22,1 | Insignificante | ≈0 | – | Completo, acelerando |
| 2-2 | Silicona | 5 cm × 0,61 mm × 29 cm | 20 cm/s | Concurrente | ≈22,1 | Insignificante | ≈0 | – | 7,6 cm; 1,2 mm/s |
| 2-3 | Silicona | 5 cm × 1,03 mm × 29 cm | 20 cm/s | Concurrente | ≈22,1 | Insignificante | ≈0 | – | ≈0 |
| 2-4 | Silicona | 5 cm × 0,37 mm × 29 cm | 20 cm/s | Opuesta | ≈22,1 | Insignificante | ≈0 | – | Completo; 0,6 mm/s |
| 2-5 | Algodón-fibra de vidrio | 5 cm × 0,37 mm × 29 cm | 20 cm/s | Concurrente | ≈22,1 | 145 s | 29 cm | 2,1 mm/s | Completo, acelerando |
| 2-6 | Algodón-fibra de vidrio | 5 cm × 0,37 mm × 29 cm | 25 cm/s | Concurrente | ≈22,1 | 115 s | 29 cm | 2,6 mm/s | Completo, acelerando |
| 2-7 | PMMA y Nomex | 5 cm × 0,85 / 0,37 mm | 20 cm/s | Concurrente | ≈22,1 | 140 s | PMMA 5 cm; Nomex 0 | – | Nomex ≈0 |
| 2-8 | PMMA | 5 cm × variable × 29 cm | 20 cm/s | Concurrente | 22,1→22,0 | 600 s | ≈10 cm (daño) | Llama anclada; regresión 0,01–0,04 mm/s | Completo, acelerando |
| 2-9 | PMMA | 5 cm × 1 cm × 29 cm | 20 cm/s | Concurrente | 22,0→21,9 | 900 s | ≈10 cm (daño) | Ídem | Completo, acelerando |

Notas: el O₂ se derivó del CO₂ producido referido al O₂ inicial reportado por la ISS. Potencia de ignición: 182 W (vuelo 1), 80 W (2-1 a 2-7), 97 W (2-8, 2-9). [B10]

**Lectura:** con 20–25 cm/s, más flujo concurrente → más velocidad (2,1 → 2,6 mm/s); la silicona y el Nomex no propagaron en µg; casi todo lo que propagó en µg ardió **por completo y acelerando** en 1 g. Es coherente con la idea de que el ensayo en 1 g es más severo **para estas condiciones de flujo**; no demuestra que lo sea para flujos bajos o gravedad parcial. [B10][INF]

#### 12.4.2 Supresión con gases (Ruff et al. 2004) [B17]

| Variable | Rango |
|---|---|
| Muestra | Cilindro de PMMA 19,1 mm Ø × 25,4 mm, con calentador interno |
| Presión | 1 atm |
| Oxidante base | 21 % O₂/79 % N₂ o 25 % O₂/75 % N₂ |
| Supresor | CO₂ 12,5 % y 25 %; He 12,5 % y 25 %; N₂ 25 % (vol.) |
| Flujo | 1–10 cm/s |
| Gravedad | Baja gravedad KC-135 (≈20 s); también datos de CO₂ a 0,1, 0,17, 0,38 y 0,5 g₀ pendientes de análisis en la fuente |

#### 12.4.3 Otros conjuntos de referencia

| Estudio | Datos clave | Fuente |
|---|---|---|
| BRE (Dehghani et al. 2021) | 59 ensayos; etileno puro o diluido; quemador de 25 mm; O₂ 21–40 %; ≈56–100 kPa; llamas azules; quemas de varios minutos | [INF] |
| BASS-II (PSI-25) | La vista consultada tiene **130 filas**; no equivalen necesariamente a 130 ensayos independientes; algunas columnas son lecturas del aparato, no velocidades calibradas | [INF] |
| Olson y Ferkul (2017) | PMMA negro/transparente, tres tamaños, O₂ 13,6–22,2 %, estancamiento concurrente 0–55 cm/s | [INF] |
| Thomsen et al. (2017) | Nomex y mezcla algodón/nylon/Nomex en la Tierra; 40–100 kPa; 10 cm/s; O₂ de Nomex 23–35 %; mezcla 14–25 % | [INF][B19] |
| Thomsen et al. (2019) | Nomex con calentamiento externo: propagación hasta ≈17 % O₂ vs. referencia ≈24 % | [INF] |
| Li et al. (2021) | Tejido entre paredes a 1–5 cm; paredes transparentes y metálicas | [INF] |
| Olson et al. (2023) | BASS y Saffire; 3 tamaños de ducto, 5 de muestra, 2 materiales, 2 atmósferas | [INF] |
| Takahashi et al. (2026a) | Papel 0,12 mm y PMMA 0,125/0,05 mm; 56,5 y 101,3 kPa; 1/12, 1/6, 1/3, 3/8 g; ventanas de 20–28 s | [B5][INF] |
| Nakaya et al. (2025) | PMMA 4 y 6 mm; centrífuga 1–4 g con brazos de 410 y 1000 mm; flujo opuesto 5–30 cm/s; éxito = 4 cm | [B8][INF] |
| Liveretou et al. (2026) | PMMA grueso; flujo opuesto 10 cm/s; 40/60/80/100 kPa; O₂ inicial 21 % | [INF] |
| Rivera et al. (2026) | PMMA negro cilíndrico; 1 g y µg; 40–100 kPa; O₂ decreciente a presión constante | [INF] |
| Urban et al. (2012) SAME-2 | Teflon, Kapton, algodón, silicona, Pyrell; flujo 0–8 cm/s; envejecimiento 11–1800 s | [INF][B11] |
| Fortenberry et al. (2023) | CFD de humo en hábitat lunar; 56,5 kPa; recinto 2 × 2 × 0,5 m | [INF][B14] |
| LUCI (Ferkul et al. 2025) | Tejido 5 × 30 cm y PMMA 4 mm; aire a presión normal; g lunar por rotación; >2,5 min | [INF] |
| FM2 (Zayac et al. 2024) | SIBAL y PMMA 4 mm; 21 %/101,3 kPa y 34 %/56,5 kPa previstos; cámaras a color, 4 ignitores | [B7][INF] |

### 12.5 Parámetros críticos que el software debe procesar (diccionario de datos) 🤖

| Campo | Símbolo | Unidad canónica | Unidades de origen frecuentes | Rango típico en el corpus | Nulo permitido | Notas |
|---|---|---|---|---|---|---|
| `gravity_g0` | $g/g_0$ | – | "micro-g", "1/6 g", "3/8 g" | 10⁻⁶ – 4 | No | Guardar también `gravity_source` (orbital, parabólico, centrífuga, rotación suborbital) |
| `pressure_kpa` | $P$ | kPa | psia, atm, mmHg | 20 – 300 | No | Absoluta |
| `x_o2` | $x_{O_2}$ | fracción 0–1 | %, % vol | 0,10 – 1,00 | No | Fracción **inicial**; si varía, guardar serie |
| `p_o2_kpa` | $p_{O_2}$ | kPa | psi | – | Calculado | $x_{O_2}\cdot P$ |
| `x_diluent_*` | $x_{CO_2}, x_{He}, x_{N_2}$ | fracción | % | 0 – 0,8 | Sí | $\sum x_i = 1$ (tolerancia 0,01) |
| `flow_velocity_m_s` | $U$ | m/s | cm/s, mm/s | 0 – 0,55 | Sí (si no aplica) | Velocidad **calibrada**, no la del ventilador |
| `flow_direction` | – | enum | – | `opposed`, `concurrent`, `stagnation`, `quiescent`, `mixed` | No | |
| `material` | – | catálogo | – | PMMA, SIBAL, algodón, Nomex, silicona, Teflon, Kapton, papel, metanol, heptano, etileno… | No | Guardar grado, color, lote |
| `geometry` | – | enum | – | `sheet`, `rod`, `sphere`, `droplet`, `porous_burner`, `fabric` | No | |
| `thickness_m` / `diameter_m` | $\delta_s$, $D_0$ | m | mm, cm | 5 × 10⁻⁵ – 0,02 | Sí | |
| `sample_width_m`, `sample_length_m` | – | m | cm | 0,05 – 0,94 | Sí | |
| `duct_width_m`, `wall_gap_m` | – | m | cm | – | Sí | Confinamiento [INF] |
| `ignition_power_w`, `ignition_time_s` | – | W, s | – | 80 – 182 W | Sí | Separar ignición asistida |
| `external_heat_flux_kw_m2` | $\dot q''_e$ | kW/m² | – | 0 – 5+ | Sí | |
| `event_label` | – | enum | – | `spread`, `no_spread`, `extinction`, `regression_end`, `breakup`, `out_of_view`, `end_of_acq`, `cool_flame`, `manual_stop` | No | **Manual stop = censurado**, no extinción [INF] |
| `success_criterion` | – | texto | – | "4 cm", "15 cm (Test 1)", "visible flame" | No | Define la etiqueta |
| `flame_spread_rate_m_s` | $V_f$ | m/s | mm/s, cm/s | 10⁻⁵ – 10⁻² | Sí | |
| `loc_fs`, `loc_fr` | – | fracción | % | 0,10 – 0,35 | Sí | Con protocolo |
| `burning_rate_k_mm2_s` | $K$ | mm²/s | – | ≈0,4 – 1 (orden de magnitud) [T] | Sí | Ventana de ajuste |
| `hrr_w`, `hrr_method` | $\dot Q$ | W | kW | 10² – 10⁴ | Sí | Método: O₂, combustible, modelo |
| `co_ppm`, `co2_ppm`, `hcl_ppm`, `hcn_ppm`, `hf_ppm` | – | ppm | – | – | Sí | **Vacío ≠ 0** (ej. HCN no medido) [INF] |
| `particle_d_count_um`, `particle_d_mass_um`, `sigma_g` | $D_{0.5}$, $D_{1.5}$, $\sigma_g$ | µm | nm | 0,1 – 2 | Sí | Guardar métrica |
| `value_origin` | – | enum | – | `measured`, `sensor_derived`, `digitized`, `simulated`, `predicted` | No | [INF] |
| `uncertainty` | – | misma unidad | – | – | Sí | Intervalo o desviación |
| `missing_reason` | – | enum | – | `not_measured`, `not_published`, `not_accessible`, `not_applicable` | Si hay vacío | [INF] |
| `source_doi`, `source_locator`, `psi_version` | – | texto | – | – | No | Tabla/figura/página |
| `license` | – | texto | – | – | No | Por activo [REQ] |

### 12.6 Conversiones obligatorias 🤖

```yaml
conversiones:
  atm_a_kPa: 101.325
  psi_a_kPa: 6.89476
  mmHg_a_kPa: 0.133322
  cm_s_a_m_s: 0.01
  mm_s_a_m_s: 0.001
  porcentaje_a_fraccion: 0.01
  kcal_a_kJ: 4.184
  F_a_C: "(F - 32) * 5/9"
reglas:
  - "Conservar el valor y la unidad originales junto al valor normalizado"
  - "Fracción molar ≠ fracción másica: no convertir sin propiedades de la mezcla"
  - "ppm es fracción molar × 1e6 (gases)"
  - "kW (potencia) ≠ kJ o Wh (energía)"
```

### 12.7 Modelo de datos (entidades) 🤖

Propuesta del informe [INF], expresada como esquema:

```
Fuente (DOI/NTRS, tipo, versión, licencia)
  └── Campaña (investigación, plataforma, años)
        └── Muestra (material, lote, geometría, dimensiones)
              └── Ensayo (ambiente, flujo, ignición, gravedad, protocolo)
                    ├── Medición (variable, valor, unidad, origen, incertidumbre, serie temporal)
                    ├── ActivoAudiovisual (video/imagen, licencia; un fotograma NO es una réplica)
                    └── Hallazgo (texto, nivel de evidencia, localizador en la fuente)
FronteraDerivada (LOC-FS/FR, MOC…) ──► referencia a los Ensayos que la originan
```

```json
{
  "test_id": "SAFFIRE-VI-3",
  "campaign": "Saffire VI",
  "platform": "Cygnus (uncrewed, orbital)",
  "gravity_g0": 1e-6,
  "gravity_source": "orbital",
  "pressure_kpa": 54.6,
  "x_o2": 0.303,
  "flow_velocity_m_s": 0.20,
  "flow_direction": "concurrent",
  "material": "PMMA cast, two-sided",
  "geometry": "sheet",
  "thickness_m": 0.01,
  "sample_width_m": 0.41,
  "sample_length_m": 0.18,
  "free_volume_m3": 16.7,
  "measurements": [
    {"var": "hrr_peak_w", "value": 3080, "method": "o2_consumption", "origin": "sensor_derived"},
    {"var": "burn_duration_s", "value": 780, "origin": "measured"},
    {"var": "co_increase_ppm", "value": 308, "location": "FFD inlet", "origin": "measured"},
    {"var": "co2_increase_ppm", "value": 8539, "location": "FFD inlet", "origin": "measured"}
  ],
  "source": {"ntrs": "20240002981", "locator": "Table 1 and Table 2"},
  "evidence_level_default": "A_for_spacecraft_microgravity"
}
```

### 12.8 Catálogo de ambientes 🤖

```yaml
ambientes:
  - id: earth_ref
    nombre: "Tierra (referencia)"
    g_g0: 1.0
    P_kPa: 101.325
    x_O2: 0.209
    evidencia_PSI: "ensayos en tierra"
  - id: iss
    nombre: "ISS / nave en tránsito"
    g_g0: 1.0e-6
    P_kPa: 101.3
    x_O2: 0.21
    nota: "Referencia de interfaz; no describe cada ensayo espacial [INF]"
    evidencia_PSI: "directa"
  - id: gateway
    nombre: "Gateway (escenario Liao et al. 2021)"
    g_g0: 1.0e-6
    P_kPa: 73.5
    x_O2: 0.265
    evidencia_PSI: "análoga"
  - id: lunar_sea
    nombre: "Base lunar · SEA / FM2"
    g_g0: 0.165
    P_kPa: 56.5
    x_O2: 0.34
    evidencia_PSI: "ninguna directa"
  - id: lunar_challenge
    nombre: "Base lunar · ejemplo del reto"
    g_g0: 0.165
    P_kPa: 70.3
    x_O2: 0.30
    nota: "Punto ilustrativo de la desigualdad P ≤ 70,3 kPa, O2 ≥ 30 % [INF]"
    evidencia_PSI: "ninguna directa"
  - id: lunar_rover
    nombre: "Rover lunar presurizado"
    g_g0: 0.165
    P_kPa: editable
    x_O2: editable
    nota: "Sin validación específica del rover; volumen pequeño [INF]"
  - id: mars_cabin
    nombre: "Cabina marciana"
    g_g0: 0.38
    P_kPa: null
    x_O2: null
    nota: "Por definir; NO usar la atmósfera exterior de Marte ni copiar la lunar [INF]"
  - id: suit
    nombre: "Traje (cota superior)"
    g_g0: variable
    P_kPa: 29.6
    x_O2: 1.0
    nota: "Fuera del alcance directo [REQ]"
reglas:
  - "Recalcular p_O2 = x_O2 · P al editar"
  - "Avisar si P, x_O2, U o g salen del dominio de los datos (ALR-09)"
```

### 12.9 Errores de datos que el software debe prevenir 🤖

| Trampa | Por qué es un error | Fuente |
|---|---|---|
| Tratar fotogramas como réplicas | Inflan el tamaño de muestra | [INF] |
| Digitalizar una figura repetida en otro artículo como caso nuevo | Duplica datos | [INF] |
| Llenar vacíos con 0 | "No medido" no es "cero" (ej. HCN) | [INF] |
| Usar la velocidad del ventilador como velocidad del gas | Falta calibración del campo de flujo | [INF] |
| Juntar concentraciones medidas en lugares distintos | Distinta variable física | [INF] |
| Llamar "extinción" a un apagado manual | Es un tiempo censurado | [INF] |
| Mezclar Wh (energía de batería) con kW (potencia de fuego) | Magnitudes distintas | [INF] |
| Asignar a PMMA el margen de 5–10 puntos de otro estudio de cables | Atribución errónea; el de PMMA es 3–4 puntos | [INF] |
| Interpolar linealmente entre 0 g y 1 g | La gravedad parcial puede ser el peor caso | [REQ][B7][B8] |
| Igualar $p_{O_2}$ = misma inflamabilidad | La llama responde a $x_{O_2}$ | [REQ][T] |

---

---

## 13. Especificación del modelo predictivo (aprendizaje automático y simulación)

### 13.0 Decisión de modelos: qué es "modelo predictivo" en este reto y cuál construir 🤖

#### 13.0.1 Qué pide el reto

El texto oficial pide **extraer datos útiles para modelos predictivos de inflamabilidad** (objetivo O2). [REQ] No obliga a entrenar un modelo, pero entregar uno funcionando es la mejor prueba de que los datos extraídos sirven y es el elemento que más diferencia la solución. **Decisión: se construye.**

#### 13.0.2 Definición operativa

Un **modelo predictivo de inflamabilidad** es una función que recibe las **condiciones de un ambiente habitable** y responde **si un material arde o no, y con qué margen**, con su incertidumbre:

$$f(\text{material, geometría},\ x_{O_2},\ P,\ U,\ g) \;\longrightarrow\; \big(P(\text{propaga}),\ x^*_{O_2},\ m\big) \pm \text{incertidumbre}$$

Su valor es responder combinaciones que **ningún experimento ensayó tal cual** (por ejemplo: PMMA a 34 % O₂, 56,5 kPa, 10 cm/s y 0,165 g), calibrado con ensayos reales de PSI y de la literatura.

| Sí es | No es |
|---|---|
| Un modelo calibrado con ensayos reales, con intervalo y dominio de validez | Un pronóstico de incendios en tiempo real |
| Interpretable y comparado con una línea base física | Una simulación CFD |
| Una herramienta para seleccionar materiales, atmósferas y agentes | Una red neuronal profunda (hay cientos de ensayos, no millones) |
| Una predicción etiquetada como tal | Una "predicción del fuego en Marte" presentada como hecho |

#### 13.0.3 ¿Uno o varios? Varios, pero solo dos con aprendizaje automático

No puede ser un único modelo: cada familia de datos mide una variable distinta (sólidos: propaga / no propaga; gotas: K en mm²/s; humo: tamaños de partícula). Mezclarlas en un solo modelo es físicamente incorrecto (§13.1, regla 5).

| Rol | Modelo | Predice | Datos | Tipo |
|---|---|---|---|---|
| **Principal (mayor impacto)** | **Frontera de inflamabilidad de sólidos**: varillas de PMMA con flujo opuesto (salidas P1–P3) | $P(\text{propaga})$ y $x^*_{O_2,FS}$ en función de $x_{O_2}$, $U$, $P$, $g$ y diámetro | Nakaya et al. 2025 (centrífuga 1–4 g, 5–30 cm/s, 4 y 6 mm, ≥3 réplicas por condición, criterio de 4 cm, pasos de 0,005 en $x_{O_2}$, acceso abierto) [B8]; Rivera et al. 2026 y Liveretou et al. 2026 (ISS y 1 g, 40–100 kPa) [INF]; BASS-II (PSI-25) si sus columnas lo permiten | Logística de frontera con censura por intervalo o bayesiano de pocos parámetros con base física (§13.5) |
| **Secundario (más viable)** | **Gotas FLEX** (salidas P4–P5) | $K$ y modo de terminación | Tabla PSI-69 + Dietrich et al. 2015 (NASA/TP, abierto en NTRS) | Regresión de $\log K$ frente a ley d² y Spalding + clasificador multinomial pequeño (§13.6) |
| Sin ML | Margen e índice de riesgo (P3) | Puntos de O₂ | Derivado del principal | Regla física (§13.7) |
| Sin ML | Contaminantes en cabina (P9) | CO y CO₂ frente a SMAC | Saffire IV–VI | Cabina bien mezclada (§10.2.4) |
| Sin ML | Humo (P8) y ranking (P11) | Firma por material; relevancia | SAME-2; metadatos PSI | Descriptivo; multicriterio (§13.8) |

**Por qué el modelo principal es viable:** el eje de gravedad queda **acotado por ambos lados con el mismo protocolo**: microgravedad (ISS) y 1–4 g (centrífuga). Luna y Marte quedan **entre** datos. Aun así, en este protocolo no hay mediciones en gravedad parcial (Olson 2024 midió entre 0,04 y 1 g, pero con estancamiento concurrente, otro protocolo), por lo que la predicción lunar se rotula **"predicción sin validación en gravedad parcial"** (nivel D).

#### 13.0.4 Cuál aporta más al reto

| Criterio | Frontera de sólidos | Gotas FLEX |
|---|---|---|
| Responde la pregunta central del reto (materiales en hábitats lunares con O₂ alto y gravedad parcial) | **Sí** | Parcial (supresión) |
| Genera la visualización principal (mapa O₂ vs. flujo por gravedad, §13.11) | **Sí** | No |
| Alimenta margen, alertas y Radar tecnológico | **Sí** | Supresión por diluyentes |
| Datos directamente en tablas de PSI | Parcial (PSI-25 por verificar) | **Sí (PSI-69)** |
| Riesgo de extracción | Medio-alto: límites en gráficas, protocolos distintos | **Bajo** |

**Decisión:** la frontera de sólidos es el modelo **principal** (mayor impacto) y FLEX es el modelo **seguro** (mayor viabilidad y uso directo de PSI). Se extraen datos para ambos en paralelo y se aplica el criterio de §13.0.5. Si los datos de sólidos **no** lo superan, FLEX pasa a ser el modelo principal y los límites de sólidos se muestran como **comparación de valores publicados**, sin ML.

#### 13.0.5 Plan para asegurar que el modelo se pueda construir

**Paso 1 · Obtener**
- Descargar la tabla y los archivos de PSI-69 y los datos de PSI-25 (navegador; las páginas usan JavaScript, §12.1).
- Extraer tablas de los PDF de NTRS (Dietrich 2015; Saffire).
- En los artículos, los límites suelen estar en **figuras**: digitalizarlas (p. ej., WebPlotDigitizer) y marcar cada punto con `value_origin = "digitized"`, figura y página.

**Paso 2 · Normalizar** al diccionario de datos (§12.5): unidades SI, protocolo, criterio de éxito (4 cm en Nakaya), evento, DOI, versión PSI y origen del valor.

**Paso 3 · Criterio de viabilidad antes de entrenar** (el informe no fija un número mínimo de ensayos; exige variación suficiente, réplicas identificables y validación independiente) [INF]:

| # | Criterio | Si no se cumple |
|---|---|---|
| V1 | Un solo protocolo por modelo (geometría, dirección de flujo, criterio de éxito) | Separar en modelos o descartar filas |
| V2 | Hay ensayos que **propagan y que no**, cerca del límite | No se puede ajustar una frontera: mostrar valores publicados |
| V3 | Cada variable a modelar tiene al menos dos valores | Fijar esa variable y declararla en el dominio |
| V4 | Réplicas identificables por condición | Tratar los puntos como límites publicados, no como ensayos |
| V5 | Al menos tres grupos (artículos, campañas o niveles de gravedad) | No hay validación por grupos: no anunciar métricas |
| V6 | El modelo supera a la línea base física en validación por grupos | Usar la línea base física y decirlo |

**Paso 4 · Riesgos de acceso a datos**
- Rivera 2026 y Liveretou 2026 pueden requerir suscripción (gestionar por la biblioteca universitaria).
- Nakaya 2025 tiene licencia CC BY-NC-ND: uso no comercial con cita.
- La columna de "tasa" de PSI-69 debe confirmarse como $K$ en mm²/s (§9.1).

#### 13.0.6 Qué muestra el modelo en la demo

1. **Mapa de inflamabilidad** O₂ vs. flujo, un panel por gravedad (µg · Luna · 1 g), con los ensayos reales, la frontera con su intervalo y el punto de la cabina elegida.
2. **Curva $D^2(t)$** de FLEX con la $K$ predicha para la mezcla de CO₂ o He que elija el usuario.
3. **Indicador de margen** con su intervalo, su nivel de evidencia y el DOI de los datos.

### 13.1 Principios de diseño [REQ][INF]

1. **Datos pequeños y de campañas** (cientos de ensayos, no millones): modelos simples, interpretables y apoyados en física. El aprendizaje profundo no aporta con tan pocos datos y no se puede explicar al jurado.
2. **Validación por grupos** (campaña o muestra): todos los fotogramas de un ensayo en la misma partición.
3. **Siempre** intervalo de incertidumbre y aviso de fuera de dominio.
4. Comparar contra una **línea base física** (§8.1.2, §9.1). Si el modelo no le gana, se dice.
5. **Una familia y un protocolo por modelo**: no mezclar estancamiento concurrente con flujo opuesto, ni un criterio de 4 cm con uno de 15 cm.
6. Las predicciones se rotulan **"predicción"**, nunca "medición".

### 13.2 ¿Qué debe predecir el modelo? (salidas objetivo) 🤖

| # | Salida | Símbolo y unidad | Familia de datos | Para qué sirve (objetivo) | Prioridad | Tipo de modelo |
|---|---|---|---|---|---|---|
| P1 | **Frontera de propagación** (oxígeno mínimo para que el frente avance) | $x^*_{O_2,FS}$ (fracción) con intervalo | Sólidos: BASS-II, varillas de PMMA (Rivera, Liveretou, Nakaya), Olson 2024 | Selección de materiales; margen de inflamabilidad (O2, O3) | **MVP** | Logística de frontera con censura por intervalo; bayesiano de pocos parámetros |
| P2 | **Probabilidad de propagación** | $P(y_{FS}=1)$ | Igual que P1 | Mapa de inflamabilidad | **MVP** | Igual que P1 |
| P3 | **Margen de inflamabilidad** | $m$ (puntos de O₂) con intervalo | Derivado de P1 | Índice de riesgo y alertas | **MVP** | Regla física (§13.7) |
| P4 | **Constante de combustión de gotas** | $K$ (mm²/s) | FLEX (PSI-69) | Supresión por diluyentes (O3) | **MVP** | Regresión de $\log K$ (GLM/GAM) frente a ley d² y Spalding |
| P5 | **Modo de terminación de gotas** | clase (extinción, rotura, salida de cámara, fin de grabación, llama fría si hay diagnóstico) | FLEX | Supresión; alerta de llama fría | S | Clasificador multinomial pequeño |
| P6 | **Evolución del diámetro y radio de llama** | $D^2(t)$, $r_f(t)$ (mm) | FLEX, s-Flame | Visualización de llama esférica | S | Física (ley d², §13.4) calibrada |
| P7 | **Velocidad de propagación** | $V_f$ (mm/s) | BASS-II, Saffire | Crecimiento del fuego | S | Correlación de de Ris / tiempo de preparación calibrada |
| P8 | **Firma de humo** | $D_{0.5}$, $D_{1.5}$, $\sigma_g$ por material | SAME, SAME-2 | Detección avanzada (O3) | S | Estadística descriptiva + agrupamiento |
| P9 | **Concentración de contaminantes en cabina** | $C_i(t)$ (ppm) | Saffire IV–VI | Limpieza posterior, SMAC | C | Modelo de cabina bien mezclada (§10.2.4), **sin ML** |
| P10 | **Hollín** | $f_v$ máximo o punto de humo | CLD Flame, SPICE (si hay datos) | Radiación y detección | C | Descriptivo; solo si PSI tiene datos |
| P11 | **Relevancia de investigaciones** | puntaje $d(q,e)$ | Metadatos de las 24 investigaciones | Identificar investigaciones (O1) | **MVP** | Multicriterio + búsqueda semántica |

### 13.3 ¿Con qué datos? (entradas requeridas) 🤖

| Variable de entrada | Símbolo / unidad canónica | P1–P3 | P4–P6 | P7 | P8 | P9 | Nota |
|---|---|---|---|---|---|---|---|
| Presión absoluta | $P$ (kPa) | ● | ● | ● | ○ | ● | |
| Fracción de O₂ | $x_{O_2}$ | ● | ● | ● | ○ | ● | Inicial; guardar serie si cambia |
| Diluyentes (CO₂, He, N₂) | $x_{CO_2}$, $x_{He}$, $x_{N_2}$ | ○ | ● | ○ | – | – | $\sum x_i = 1$ |
| Velocidad y dirección del flujo | $U$ (m/s), `flow_direction` | ● | ○ | ● | ● | ● | Calibrada, no la del ventilador |
| Temperatura inicial | $T_0$ (K) | ○ | ○ | ○ | – | ● | Rara vez varía en los datos |
| Gravedad efectiva | $g/g_0$ + `gravity_source` | ● | ○ | ● | – | – | Orbital, parabólico, centrífuga, rotación |
| Material y geometría | catálogo, `geometry` | ● | ● (combustible) | ● | ● | ● | |
| Espesor o diámetro | $\delta_s$ o $D_0$ (m) | ● | ● | ● | – | – | |
| Calentamiento externo / ignición | $\dot q''_e$ (kW/m²), potencia de ignición | ○ | – | ○ | ● (modo de calentamiento) | – | |
| Volumen libre y ventilación de cabina | $V$, $Q_{rec}$, $\eta_i$ | – | – | – | – | ● | |
| Potencia del fuego | $\dot Q$ (W) | – | – | – | – | ● | Medida, no predicha |

● requerida · ○ si varía en los datos · – no aplica

**Fuentes de datos por salida:** ver §12.2 (inventario) y §12.4 (datos ya extraídos). Antes de entrenar se deben cerrar los puntos abiertos A2–A4 (§19.4).

### 13.4 Arquitectura lógica del modelo 🤖

```
┌─────────────────────────────────────────────────────────────────────┐
│ CAPA 0 · Curación de datos                                          │
│ PSI + artículos → tablas en Parquet (unidades SI, protocolo,        │
│ origen del valor, motivo de vacío, DOI, versión PSI)                │
└───────────────┬─────────────────────────────────────────────────────┘
                ▼
┌─────────────────────────────────────────────────────────────────────┐
│ CAPA 1 · Línea base física (sin entrenamiento)                      │
│ de Ris (V_f) · ley d² y Spalding (K) · radio de llama esférica      │
│ · escalas de flotabilidad g^(1/3) · cabina bien mezclada            │
└───────────────┬─────────────────────────────────────────────────────┘
                ▼
┌─────────────────────────────────────────────────────────────────────┐
│ CAPA 2 · Modelos estadísticos calibrados (núcleo del MVP)           │
│ Logística de frontera con censura por intervalo (P1–P2)             │
│ Bayesiano de pocos parámetros (estilo Nakaya 2025)                  │
│ GLM/GAM para log K (P4) · multinomial pequeño (P5)                  │
└───────────────┬─────────────────────────────────────────────────────┘
                ▼
┌─────────────────────────────────────────────────────────────────────┐
│ CAPA 3 · ML de residuos (opcional)                                  │
│ Boosting pequeño (XGBoost) con restricciones monótonas,             │
│ SOLO si mejora a la capa 2 en validación por grupos                 │
└───────────────┬─────────────────────────────────────────────────────┘
                ▼
┌─────────────────────────────────────────────────────────────────────┐
│ CAPA 4 · Incertidumbre y dominio                                    │
│ Intervalos (posterior bayesiano o conformal por grupos)             │
│ Dominio de aplicabilidad: rangos + distancia a datos de entrenamiento│
└───────────────┬─────────────────────────────────────────────────────┘
                ▼
┌─────────────────────────────────────────────────────────────────────┐
│ CAPA 5 · Reglas de interpretación                                   │
│ Margen m (§13.7) · alertas ALR-01…09 · nivel de evidencia A–D/∅     │
└─────────────────────────────────────────────────────────────────────┘
```

**¿Y las redes neuronales?** Con datos de campañas pequeñas, una red entrenada con datos de PSI para predecir inflamabilidad **no** se recomienda: sobreajusta, no se puede explicar y no supera a la física. Usos razonables de redes:
- **Embeddings de texto** para la búsqueda semántica del asistente (P11).
- **Visión por computador** para medir la posición del frente de llama o el diámetro de la gota en los videos de PSI (preferir primero métodos clásicos: umbral y contornos).

**Ecuaciones de la capa 1 que no aparecen en otras secciones** [T]:

*Radio de una llama esférica estacionaria* (quemador poroso esférico, como en s-Flame), a partir de la solución de Burke–Schumann para una fuente esférica:

$$r_f = \frac{\dot m_F}{4\pi\,\rho D\,\ln\!\left[\dfrac{1}{1 - Z_{st}}\right]}, \qquad Z_{st} = \frac{1}{1 + \nu\,Y_{F,0}/Y_{O,\infty}}$$

| Símbolo | Significado | Unidad |
|---|---|---|
| $\dot m_F$ | caudal másico de combustible que sale del quemador | kg/s |
| $\rho D$ | producto densidad × difusividad (casi constante con la temperatura) | kg/(m·s) |
| $Z_{st}$ | fracción de mezcla estequiométrica | – |
| $Y_{F,0}$, $Y_{O,\infty}$ | fracción másica de combustible en el chorro y de O₂ lejos | – |

Ejemplo de orden de magnitud [CALC]: $\dot m_F = 10^{-6}$ kg/s, $\rho D = 3\times10^{-5}$ kg/(m·s), $Z_{st} = 0{,}055$ (metano en aire) → $r_f \approx 4{,}7$ cm. Más combustible → llama más grande; más O₂ (sube $Z_{st}$) → llama más pequeña, en línea con lo observado en Flame Design (la llama crece con el caudal y se encoge con más O₂). [B3]

*Radio de llama de una gota* (cuasiestacionario): $r_f/r_s = \ln(1+B)/\ln(1+Y_{O,\infty}/\nu)$, con $r_s = D/2$ y $D(t)$ de la ley d² (§9.1). [T] Combinando ambas se obtiene una curva $r_f(t)$ para visualizar; los datos de FLEX muestran que, al principio, llama y velocidad de quemado crecen despacio por efectos transitorios. [WEB]

### 13.5 Modelo de sólidos: frontera de propagación

Población inicial sugerida: **PMMA cilíndrico con flujo opuesto**. Entradas: $P$, $g$, $U$, diámetro, condición térmica (y composición si varía). Salida: $x^*_{O_2,FS}$ con intervalo y dominio, o probabilidad de propagación. [INF]

Con ensayos binarios repetidos a distintas concentraciones [INF]:

$$P(y_{FS}=1 \mid x_{O_2}, \mathbf{z}) = \text{logit}^{-1}\!\left[\frac{x_{O_2} - f_{FS}(\mathbf{z})}{s}\right], \qquad s > 0$$

- $f_{FS}(\mathbf{z})$ es la frontera ajustada (50 % del criterio binario), **no necesariamente el LOC publicado**.
- Si un ensayo no propaga a $x_L$ y otro sí a $x_U$, se guarda el **intervalo** $(x_L, x_U]$, no el punto medio; la verosimilitud debe reconocerlo (datos censurados por intervalo).
- Ampliación a extinción completa: $f_{FS} = f_{FR} + \text{softplus}(\Delta)$ para garantizar LOC-FS > LOC-FR **dentro del mismo protocolo** (decisión de modelado, no ecuación publicada).
- Línea base: correlación física reducida; si la cobertura lo permite, ajuste bayesiano de pocos parámetros (al estilo de Nakaya et al. 2025, sin usar sus predicciones lunares como etiquetas de verdad). Comparación: regresión logística o árbol pequeño.

### 13.6 Modelo de líquidos: K y modo de terminación

- Regresión de $\log K$ con $D_0$, $P$, $x_{O_2}$, $x_{CO_2}$, $x_{He}$ y combustible, dentro del dominio FLEX. Comparar con la ley d² y la teoría de Spalding (§9.1).
- Clasificador aparte para el modo final con las clases **realmente observadas**; si no hay diagnóstico de llama fría, esa clase queda sin etiquetar. [INF]
- Salida al usuario: curva $D^2(t)$, mapa de regímenes, ensayos análogos y rango admitido. **Nunca** "inyecte X de CO₂ en la nave". [INF]

### 13.7 Margen de inflamabilidad e índice de riesgo

$$m = 100\,\left[x_{O_2,escenario} - x^*_{O_2}\right] \quad \text{(puntos porcentuales)} \quad [\text{INF}]$$

Si $x^* \in [a, b]$: $m \in [100(x - b),\; 100(x - a)]$. Si el intervalo cruza cero, la posición es **incierta**.

```python
# Pseudocódigo de referencia (no implementación final)
def margen(escenario, frontera):
    if frontera is None or not compatible(escenario, frontera.protocolo):
        return Resultado(nivel="SIN_EVIDENCIA_COMPARABLE")      # nunca "bajo"
    m_lo = 100 * (escenario.x_o2 - frontera.x_hi)
    m_hi = 100 * (escenario.x_o2 - frontera.x_lo)
    if m_lo > 0:
        nivel = "ALTO"           # supera la frontera en todo el intervalo
    elif m_hi < 0 and abs(m_hi) > BANDA_PRECAUCION:  # BANDA = 2 pts [S], revisar con asesor
        nivel = "BAJO_CONDICIONAL"  # nunca "seguro"; mostrar protocolo y dominio
    else:
        nivel = "PRECAUCION_O_INCIERTO"
    if 0 < escenario.g_g0 < 1:
        alertas.append("ALR-04")  # gravedad parcial
    return Resultado(nivel, (m_lo, m_hi), frontera.doi, nivel_evidencia(escenario, frontera))
```

Reglas [INF]:
- Margen positivo = el escenario supera la frontera usada; **no** que la ignición sea inevitable.
- Margen negativo = por debajo bajo ese protocolo y dominio; **no** certifica ausencia de peligro.
- Elegir el menor límite de **otro** material o geometría **no** crea una cota conservadora demostrada.
- La banda de 2 puntos y la resta de 2–4 puntos en gravedad parcial son [S]: solo como sensibilidad etiquetada.

**Disparadores de alertas** [REQ] (con las correcciones del informe):

| ID | Condición | Nivel | Corrección [INF] |
|---|---|---|---|
| ALR-01 | $m_{lo} \ge 0$ | Alto | – |
| ALR-02 | Intervalo de $m$ dentro de la banda de precaución o cruza 0 | Precaución | Banda = [S] |
| ALR-03 | $x_{O_2} \ge 0{,}30$ | Información | – |
| ALR-04 | $0 < g/g_0 < 1$ | Evidencia | Mencionar LUCI y vuelos parciales como evidencia disponible |
| ALR-05 | Material sin frontera compatible | Sin evidencia | – |
| ALR-06 | Flujo cerca del MLOC **observado** para ese material | Precaución | Solo si la U está en los datos |
| ALR-07 | Combustible con química de llama fría documentada (heptano, n-butano…) y régimen respaldado | Fenómeno | **No** dispararla para cualquier gas o líquido solo por O₂ alto |
| ALR-08 | Material evaluado solo en 1 g | Fenómeno | – |
| ALR-09 | Consulta fuera del dominio (§12.3) | Dominio | Indicar la variable |

### 13.8 Ranking de investigaciones (O1)

Primero se filtra por material, régimen y tipo de variable; después [INF]:

$$d(q, e) = \frac{\sum_{j\in K} w_j\,|q_j - e_j|/s_j}{\sum_{j\in K} w_j}$$

$w_j$ (pesos) y $s_j$ (escalas) se publican; la **cobertura** de atributos se informa aparte para no premiar registros incompletos. **No es una probabilidad de incendio.**

### 13.9 Niveles de evidencia

| Nivel | Definición [REQ] | Precisión del informe [INF] |
|---|---|---|
| A · Directa | Mismo régimen de gravedad y atmósfera, dentro del rango ensayado | Se asigna **por consulta y variable**, no a todo un programa |
| B · Análoga | Régimen similar, otro material o escala | – |
| C · Proxy | Mecanismo sustituto (E-FIELD) | – |
| D · Extrapolación | Fuera del rango de los datos | Una consulta a 34 % O₂ no queda validada por un ensayo lunar simulado en aire (LUCI) |
| ∅ · Sin evidencia | Nada lo respalda | Nunca mostrar como "riesgo bajo" |

### 13.10 Métricas de validación [INF]

| Componente | Métricas |
|---|---|
| Frontera de sólidos | Error absoluto en puntos de O₂; calibración de intervalos; matriz de confusión, sensibilidad y calibración de probabilidad para la clasificación |
| K de gotas | Error en mm²/s; residuos de la recta D² |
| Asistente (RAG) | 30–50 preguntas citadas revisadas por el asesor (meta ≥ 90 % citas válidas); 10 sin respuesta (meta ≥ 80 % abstención); 10 numéricas exactas [REQ] — son **metas**, no resultados |
| Verificación numérica (si hay CFD) | Estudio de malla y paso temporal; balances de masa, especies y energía; sensibilidad a ignición, paredes y cinética |

### 13.11 Visualización del modelo 🤖

| Gráfico | Ejes / codificación | Datos | Qué entiende el usuario | Recomendación |
|---|---|---|---|---|
| **Diagrama de fases de inflamabilidad** | X: velocidad del flujo (cm/s); Y: $x_{O_2}$; puntos coloreados "propaga / no propaga"; banda de la frontera con su intervalo; punto del escenario elegido | P1–P2, ensayos reales | Si su cabina está dentro o fuera de la zona de fuego y con qué margen | **Imprescindible.** Un panel por gravedad (µg, Luna, 1 g) con los mismos ejes (*small multiples*) |
| **Curva $D^2(t)$** | X: tiempo (s); Y: $D^2$ (mm²); recta ajustada; residuos debajo | FLEX | Que la gota se encoge a ritmo constante y cuánto tarda | Sincronizar con el video de PSI |
| **Evolución de llama esférica $r_f(t)$** | X: tiempo; Y: radio de llama y de gota | P6, s-Flame, FLEX | Cómo crece y se apaga una llama esférica | Etiquetar "física calibrada" |
| **Gráfico de calibración** | X: probabilidad predicha; Y: frecuencia observada | Validación de P2 | Si el modelo es confiable | En la ficha del modelo |
| **Indicador de margen** | Barra horizontal con el intervalo de $m$ y el cero marcado | P3 | Riesgo de un vistazo, con incertidumbre | Color + ícono + texto; gris rayado si no hay evidencia |
| **Curvas de hollín** | X: tiempo o altura en la llama; Y: $f_v$ | CLD Flame (si hay datos) | Cuánto hollín se forma y dónde | Solo con datos reales |
| **Dispersión de temperatura y radio** | X: radio de llama; Y: temperatura; color: O₂ o diluyente | s-Flame, FLEX (si hay temperaturas) | Relación tamaño–temperatura–extinción | **Preferir 2D con color** a 3D: un gráfico 3D es difícil de leer en pantalla y en una presentación corta. Ofrecer 3D solo como vista opcional |
| **Importancia de variables** | Barras de efecto de cada entrada | Capa 2/3 | Qué variable pesa más | Mostrar el signo físico esperado junto al aprendido |

---

## 14. Interoperabilidad tecnológica: entrenamiento en R (RStudio) ↔ backend en Python (FastAPI)

> **Criterio rector:** la opción más rápida y fácil de poner en producción. El equipo no tiene tiempo para infraestructura compleja.

### 14.1 Decisión recomendada 🤖

| Prioridad | Tipo de modelo entrenado en R | Formato de exportación | Cómo se consume en Python | Dependencias en el backend |
|---|---|---|---|---|
| **1 (recomendada)** | Modelos paramétricos: logística de frontera, GLM/GAM, correlaciones físicas, bayesiano de pocos parámetros | **JSON con coeficientes** (y, si es bayesiano, **CSV/Parquet con las muestras del posterior**) | Se reescribe la fórmula en Python (5–20 líneas) | Ninguna especial |
| **2** | Boosting de árboles (XGBoost) | **`xgb.save(modelo, "model.json")`** en R | `xgboost.Booster().load_model("model.json")` | `xgboost` |
| 3 (solo si hace falta) | Redes neuronales o necesidad de un motor único | ONNX, convirtiendo **desde Python** | `onnxruntime` | `onnxruntime` + conversores |
| ✗ Evitar | Cualquiera | `.rds` | Requiere R dentro del contenedor | R + `rpy2` |

**Por qué esta decisión:**

- **JSON de coeficientes** es transparente, no depende de versiones de librerías y encaja con la política de modelos interpretables (§13.1). Además, la fórmula escrita en Python queda auditable para el jurado.
- **XGBoost entre lenguajes.** XGBoost guarda el modelo (árboles y función objetivo) en JSON o en JSON binario (UBJSON) con solo usar la extensión `.json` o `.ubj`, tanto desde Python como desde R, y garantiza compatibilidad hacia atrás para los modelos guardados así. [WEB] La propia documentación advierte que un modelo guardado con `saveRDS` (R) o `pickle` (Python) puede no abrirse en versiones posteriores de XGBoost. [WEB] El paquete de R recomienda `xgb.save()` para guardar el modelo como archivo independiente. [WEB] La vista oficial de CRAN sobre despliegue confirma que los paquetes xgboost y lightgbm de R serializan modelos en formatos de texto y binarios usables fuera de R. [WEB]
- **ONNX desde R no es el camino corto.** El paquete `onnx` de R (versión 0.0.3) es una interfaz para cargar, ejecutar y crear modelos ONNX, no un conversor general de modelos de R. [WEB] Los conversores habituales de XGBoost y LightGBM a ONNX (`onnxmltools`) se usan desde Python. [WEB] Por eso, si algún día se necesita ONNX, la ruta es R → JSON → Python → ONNX. **Para el hackathon no hace falta.**
- **`.rds` solo sirve dentro de R.** Usarlo obligaría a instalar R en el servidor y a llamar a R desde Python. Alternativa de respaldo si un modelo no puede portarse: exponerlo con `plumber` (API en R) como servicio separado; añade un segundo servicio, por eso queda como último recurso.

### 14.2 Contrato de artefactos entre R y Python 🤖

```
models/
├── solid_boundary/
│   ├── model.json          # coeficientes o modelo XGBoost
│   ├── posterior.parquet   # (opcional) muestras del posterior bayesiano
│   ├── model_card.json     # entradas, unidades, dominio, métricas, versión, DOIs
│   └── golden_tests.csv    # 20–50 entradas con la predicción calculada en R
└── droplet_k/
    ├── model.json
    ├── model_card.json
    └── golden_tests.csv
data/
└── curated/*.parquet       # tablas curadas (arrow::write_parquet ↔ pandas.read_parquet)
```

**Ficha del modelo (`model_card.json`)** — obligatoria (RF-PRD-03 de [REQ]):

```json
{
  "name": "solid_boundary_pmma_opposed",
  "version": "0.1.0",
  "target": "x_star_o2_fs",
  "inputs": {
    "x_o2":         {"unit": "fraction", "domain": [0.13, 0.40]},
    "pressure_kpa": {"unit": "kPa",      "domain": [40, 101.4]},
    "flow_cm_s":    {"unit": "cm/s",     "domain": [0, 30]},
    "gravity_g0":   {"unit": "g0",       "domain": [0, 4]}
  },
  "protocol": "opposed flow, PMMA rods, success = 4 cm",
  "validation": {"scheme": "group k-fold by campaign", "mae_pts_o2": null},
  "training_data_sha256": "…",
  "sources": ["10.1016/j.combustflame.2024.113828"],
  "limitations": "No validado en superficie lunar; extrapolación fuera del dominio"
}
```

**Pruebas doradas.** R calcula la predicción para 20–50 entradas y la guarda en `golden_tests.csv`; Python debe reproducirla (tolerancia ≤ 10⁻⁶ para fórmulas, ≤ 10⁻⁴ para XGBoost). Así se detecta cualquier error al reescribir la fórmula.

### 14.3 Código de exportación en R

> Fragmentos de referencia; ajustar nombres de columnas a las tablas curadas.

```r
library(jsonlite)
library(arrow)

# --- 1) Modelo paramétrico (ej.: logística de frontera con glm) ---
fit <- glm(spread ~ x_o2 + log10(flow_cm_s + 1) + I(pressure_kpa / 101.325) + gravity_g0,
           family = binomial(), data = train)
b <- unname(coef(fit))   # orden: intercepto, x_o2, log10(U+1), P/101.325, g
s <- 1 / b[2]            # ancho de la transición (fracción de O2)
# Reparametrización a la forma de frontera que usa Python:
#   x_star = b0 + b1*log10(U+1) + b2*P/101.325 + b3*g ;  p = 1/(1+exp(-(x_o2 - x_star)/s))
write_json(list(name    = "solid_boundary_pmma_opposed",
                type    = "logistic_boundary",
                version = "0.1.0",
                coef    = list(b0 = -b[1] * s, b1 = -b[3] * s, b2 = -b[4] * s, b3 = -b[5] * s, s = s),
                x_star_ci_halfwidth = hw,   # semiancho del intervalo de x_star (p. ej., bootstrap por campañas)
                domain  = list(x_o2 = range(train$x_o2), pressure_kpa = range(train$pressure_kpa),
                               flow_cm_s = range(train$flow_cm_s), gravity_g0 = range(train$gravity_g0)),
                sources = list("10.1016/j.combustflame.2024.113828")),
           "models/solid_boundary/model.json", auto_unbox = TRUE, digits = NA)

# --- 2) Modelo bayesiano (brms / rstan): exportar muestras del posterior ---
# draws <- posterior::as_draws_df(fit_bayes)
# write_parquet(as.data.frame(draws), "models/solid_boundary/posterior.parquet")

# --- 3) XGBoost ---
library(xgboost)
xgb.save(bst, "models/droplet_k/model.json")         # formato estable entre lenguajes

# --- 4) Pruebas doradas ---
golden <- head(test, 30)
golden$expected <- predict(fit, newdata = golden, type = "link")
write.csv(golden, "models/solid_boundary/golden_tests.csv", row.names = FALSE)

# --- 5) Tablas curadas ---
write_parquet(curated_tests, "data/curated/tests.parquet")
```

### 14.4 Backend mínimo en FastAPI (probado)

El siguiente servicio se probó en el entorno de trabajo con FastAPI 0.162 y XGBoost 3.4: carga al arrancar un modelo de coeficientes y un modelo XGBoost guardado en JSON, valida las entradas, calcula $p_{O_2}$, el margen con intervalo y las alertas, y supera 4 pruebas automáticas (salud, escenario lunar SEA, fuera de dominio y pruebas doradas). Los coeficientes del ejemplo son **ficticios**; solo prueban la integración.

```python
# main.py
import json, math
from pathlib import Path
import xgboost as xgb
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

MODELS = Path(__file__).parent / "models"
solid = json.loads((MODELS / "solid_boundary" / "model.json").read_text())
droplet = xgb.Booster()
droplet.load_model(str(MODELS / "droplet_k" / "model.json"))
DROPLET_FEATURES = ["x_o2", "pressure_kpa", "x_co2", "d0_mm"]

app = FastAPI(title="Flame in Freefall API", version="0.1.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

class SolidQuery(BaseModel):
    x_o2: float = Field(ge=0, le=1, description="Fracción molar de O2 (0-1)")
    pressure_kpa: float = Field(gt=0, description="Presión absoluta en kPa")
    flow_cm_s: float = Field(ge=0, description="Velocidad de flujo opuesto en cm/s")
    gravity_g0: float = Field(ge=0, description="Gravedad efectiva en múltiplos de g0")

class DropletQuery(BaseModel):
    x_o2: float = Field(ge=0, le=1)
    pressure_kpa: float = Field(gt=0)
    x_co2: float = Field(ge=0, le=1)
    d0_mm: float = Field(gt=0)

def out_of_domain(values: dict, domain: dict) -> list[str]:
    """Variables fuera del dominio de entrenamiento (alerta ALR-09)."""
    return [k for k, (lo, hi) in domain.items() if k in values and not lo <= values[k] <= hi]

@app.get("/health")
def health():
    return {"status": "ok", "models": [solid["name"], "droplet_k"]}

@app.post("/predict/solid-boundary")
def predict_solid(q: SolidQuery):
    c = solid["coef"]
    x_star = (c["b0"] + c["b1"] * math.log10(q.flow_cm_s + 1)
              + c["b2"] * q.pressure_kpa / 101.325 + c["b3"] * q.gravity_g0)
    p_spread = 1 / (1 + math.exp(-(q.x_o2 - x_star) / c["s"]))
    hw = solid["x_star_ci_halfwidth"]
    margin = (100 * (q.x_o2 - (x_star + hw)), 100 * (q.x_o2 - (x_star - hw)))
    values = q.model_dump()
    alerts = []
    if bad := out_of_domain(values, solid["domain"]):
        alerts.append({"id": "ALR-09", "vars": bad})
    if 1e-3 < q.gravity_g0 < 1:
        alerts.append({"id": "ALR-04"})
    if q.x_o2 >= 0.30:
        alerts.append({"id": "ALR-03"})
    return {"x_star": round(x_star, 4),
            "x_star_interval": [round(x_star - hw, 4), round(x_star + hw, 4)],
            "p_spread": round(p_spread, 3),
            "margin_pts_interval": [round(m, 2) for m in margin],
            "p_o2_kpa": round(q.x_o2 * q.pressure_kpa, 2),
            "alerts": alerts,
            "model_version": solid["version"],
            "sources": solid["sources"],
            "kind": "prediction"}

@app.post("/predict/droplet-k")
def predict_droplet(q: DropletQuery):
    row = [[getattr(q, f) for f in DROPLET_FEATURES]]
    log_k = float(droplet.predict(xgb.DMatrix(row, feature_names=DROPLET_FEATURES))[0])
    return {"k_mm2_s": round(math.exp(log_k), 4), "kind": "prediction"}
```

```python
# test_api.py  (ejecutar con: pytest -q)
import math, pandas as pd
from fastapi.testclient import TestClient
from main import app
client = TestClient(app)

def test_solid_lunar_sea():
    r = client.post("/predict/solid-boundary",
                    json={"x_o2": 0.34, "pressure_kpa": 56.5, "flow_cm_s": 10, "gravity_g0": 0.165}).json()
    assert r["p_o2_kpa"] == 19.21
    assert {a["id"] for a in r["alerts"]} >= {"ALR-03", "ALR-04"}

def test_golden_droplet():
    g = pd.read_csv("models/droplet_k/golden_tests.csv")
    for _, row in g.iterrows():
        r = client.post("/predict/droplet-k", json=row.drop("expected_log_k").to_dict()).json()
        assert abs(math.log(r["k_mm2_s"]) - row["expected_log_k"]) < 1e-3
```

**Contrato de la API:**

| Método | Ruta | Entrada | Salida |
|---|---|---|---|
| GET | `/health` | – | Estado y modelos cargados |
| POST | `/predict/solid-boundary` | $x_{O_2}$, $P$, $U$, $g$ | $x^*$ con intervalo, $P$(propaga), margen con intervalo, $p_{O_2}$, alertas, versión, DOIs |
| POST | `/predict/droplet-k` | $x_{O_2}$, $P$, $x_{CO_2}$, $D_0$ | $K$ (mm²/s) |
| POST | `/assistant/ask` *(propuesto)* | pregunta, ambiente | respuesta con citas o abstención |

### 14.5 Puesta en producción en tres niveles (del más simple al más completo)

| Nivel | Qué es | Cuándo usarlo | Esfuerzo |
|---|---|---|---|
| **0 · Sin backend** | R calcula las predicciones sobre una **rejilla** de condiciones (O₂ × flujo × presión × gravedad) y las guarda en JSON; el frontend interpola y dibuja | Si el tiempo es muy corto: la demo funciona incluso sin servidor (cumple RNF-02 de respaldo) | Mínimo |
| **1 · FastAPI en un contenedor** | `Dockerfile` con Python + `requirements.txt` + `uvicorn main:app`; desplegado en un servicio de contenedores (Render, Railway, Fly.io, Hugging Face Spaces u otro que el equipo ya use) | Lo recomendado para el demo: permite valores arbitrarios del simulador | Bajo |
| **2 · FastAPI + asistente RAG** | Añade la ruta del asistente, índice vectorial y proveedor de IA | Si se integra el asistente con citas | Medio |

```dockerfile
FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt   # fastapi uvicorn xgboost pandas pyarrow
COPY . .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

> Los precios y planes gratuitos de cada servicio cambian; comprobarlos el día del despliegue.

---

## 15. Arquitectura del producto software y UI/UX

> **Estado:** propuesta [S]. El documento de requerimientos deja la arquitectura y el stack para un documento posterior; esta sección fija la **estructura funcional** de la interfaz y una arquitectura técnica mínima compatible con §14. [REQ]

### 15.1 Módulos del producto y objetivos del reto

```
┌──────────────────────────────── PLATAFORMA WEB ────────────────────────────────┐
│                                                                                │
│  ┌─────────────────────────┐  ┌─────────────────────────┐                      │
│  │ O1 · CLASSROOM          │  │ O2 · LABORATORIO        │                      │
│  │ Centro de Inteligencia  │  │ Datos y simuladores     │                      │
│  │ y Divulgación           │  │ (mapas de inflamabilidad│                      │
│  │ (base de conocimiento)  │  │  gotas, cabina, modelos)│                      │
│  └───────────┬─────────────┘  └───────────┬─────────────┘                      │
│              │   Selector de ambiente (ISS · Luna · Marte · rover · Tierra)    │
│  ┌───────────┴─────────────┐  ┌───────────┴─────────────┐                      │
│  │ O3 · RADAR TECNOLÓGICO  │  │ O4 · VISTA TIERRA       │                      │
│  │ Niebla fina, detección, │  │ Spin-offs: bomberos e   │                      │
│  │ materiales, protección  │  │ industria               │                      │
│  └─────────────────────────┘  └─────────────────────────┘                      │
│                                                                                │
│  Transversal: asistente con citas · página "Datos y referencias" · alertas     │
└────────────────────────────────────────────────────────────────────────────────┘
```

| Módulo | Objetivo | Qué contiene | Sale de las secciones |
|---|---|---|---|
| **Classroom / Centro de Inteligencia y Divulgación** | **O1 — exclusivamente la base de conocimiento** | Rutas de aprendizaje, biblioteca de investigaciones PSI, casos históricos, glosario, asistente | §1, §3–§11, §12.2, §16 |
| Laboratorio de datos y simuladores | O2 | Tablas curadas, mapas de inflamabilidad, simulador de escenario, fichas de modelos, exportación | §12, §13, §14 |
| Radar tecnológico | O3 | Evidencia → hallazgo → brecha → tecnología; organizado por protocolos, supresión y selección de materiales | §9.2, §10, §17 |
| Vista Tierra | O4 | 3–5 casos de transferencia con enlace a NASA Spinoff y a la investigación relacionada | §17 |

### 15.2 Apartado "Classroom" — Centro de Inteligencia y Divulgación (Objetivo 1)

**Propósito.** El Classroom es **el módulo del Objetivo 1**: el conglomerado de conocimiento donde toda la información compleja de PSI, de los informes físicos del equipo y de las lecciones históricas de NASA se organiza como un **aula interactiva**. Cualquier operador, ingeniero, investigador o estudiante puede aprender la física del fuego en microgravedad de forma intuitiva **antes o durante** el uso de los simuladores, e identificar qué investigaciones son relevantes para su ambiente.

#### 15.2.1 Estructura del Classroom

| Componente | Qué es | Cómo ayuda a O1 |
|---|---|---|
| **Rutas de aprendizaje** | Módulos cortos ordenados por nivel y rol | Enseña a interpretar los datos |
| **Biblioteca PSI** | Una ficha por investigación (objetivo, combustible, condiciones, variables, sensores, hardware, plataforma, hallazgos, pilar, ambientes, limitaciones, DOI) + ranking por ambiente + comparador de 2–4 investigaciones + matriz de cobertura | **Identifica las investigaciones relevantes** (RF-INV-01, RF-RNK-01, RF-CMP-01/02 de [REQ]) |
| **Casos históricos** | Apolo 1, Apolo 13, Mir: línea de tiempo, física y lecciones | Conecta los datos con decisiones reales |
| **Glosario vivo** | Términos con analogía y fórmula, enlazados desde todo el sitio | Reduce la barrera de entrada |
| **Asistente con citas** | Responde con DOI y nivel de evidencia; se abstiene si no hay evidencia | Consulta en lenguaje natural sobre el corpus |

#### 15.2.2 Plan de estudios propuesto 🤖

| Módulo | Título | Contenido (sección del documento) | Mini-simulador interactivo | Evidencia real enlazada |
|---|---|---|---|---|
| 0 | ¿Por qué el fuego es distinto en el espacio? | §3, §4.4 | Vela en 1 g vs. µg (control deslizante de gravedad) | Imágenes de velas en µg; ScienceCasts |
| 1 | El tetraedro del fuego | §4.1–4.2 | Quitar una cara del tetraedro y ver qué pasa | – |
| 2 | Oxígeno y presión: respirar igual no es arder igual | §4.3, §6.4 | Calculadora de $p_{O_2}$ y $x_{O_2}$ por ambiente | Saffire VI (30 % O₂, 54 kPa) |
| 3 | Gravedad, flotabilidad y difusión | §5, §6.1–6.3 | Penacho vs. esfera; $Ri$ en vivo | E-FIELD (proxy) |
| 4 | Cómo avanza el fuego sobre un sólido | §8.1 | Llama opuesta vs. concurrente | Video BASS-II (PSI-25) |
| 5 | Límites de inflamabilidad y la curva en U | §8.2 | Mapa O₂ vs. flujo con punto de cabina | Datos Nakaya, Urban 2025 |
| 6 | Gotas, llamas frías y supresión | §9 | Gota que se encoge ($D^2$ lineal) | Video FLEX (PSI-69) |
| 7 | Hollín y radiación | §7 | Llama con más o menos tiempo de residencia | CLD Flame |
| 8 | Humo y detección | §10.1 | Distribución de tamaños vs. ventana del detector | SAME-2 |
| 9 | Después del fuego: CO, HCl y limpieza | §10.2 | Cabina bien mezclada con SMAC | Saffire IV–VI |
| 10 | Lecciones de la historia | §16 | Línea de tiempo interactiva | OCHMO-TB-008 |
| 11 | Cómo leer una investigación PSI | §12 | Recorrido guiado por una ficha | PSI-25, PSI-69 |

**Cada lección sigue el mismo patrón:**
1. **Analogía** (1 pantalla).
2. **Concepto y fórmula** con variables explicadas.
3. **Mini-simulador** (etiquetado "cualitativo" si no usa datos).
4. **Evidencia real** (video o tabla de PSI con DOI).
5. **Verificación**: 2–3 preguntas de opción múltiple.
6. **Puente a la herramienta**: botón que abre el Laboratorio con el escenario de la lección ya cargado.

#### 15.2.3 Gamificación (moderada y útil)

| Mecánica | Uso | Límite |
|---|---|---|
| Rutas por rol | Operador / ingeniero / investigador / estudiante | Mismo contenido, distinto orden y profundidad |
| Progreso y niveles | Barra por módulo; niveles "Cadete → Especialista → Investigador" | Sin bloquear el acceso a la biblioteca |
| Insignias | Por completar módulos o casos históricos | Nunca a cambio de datos personales (RNF-09: sin cuentas; progreso guardado solo en el navegador) |
| Retos de escenario | "Encuentra un material que no propague a 34 % O₂ con evidencia A o B" | El reto se resuelve usando la biblioteca y los datos reales |

#### 15.2.4 Modelo de contenido de una lección 🤖

```json
{
  "id": "lesson-05-u-curve",
  "module": 5,
  "title": "Límites de inflamabilidad y la curva en U",
  "roles": ["engineer", "researcher", "student"],
  "analogy": "Una vela con nada de viento se ahoga; con brisa suave arde mejor; con un ventilador fuerte se apaga.",
  "concepts": ["LOC", "MLOC", "blowoff", "radiative_extinction"],
  "equations": ["Da = tau_transport / tau_chem"],
  "simulator": {"type": "flammability_map", "preset": {"material": "PMMA", "env": "lunar_sea"}, "qualitative": false},
  "evidence": [{"source": "10.1016/j.combustflame.2024.113828", "locator": "Fig. 8"}],
  "quiz": [{"q": "¿Qué pasa con flujo muy alto?", "options": ["Arde más", "Soplado", "Nada"], "answer": 1}],
  "bridge": {"module": "lab", "scenario": "lunar_sea_pmma_10cms"},
  "doc_sections": ["8.2"]
}
```

### 15.3 Visualización de datos de PSI en el dashboard 🤖

| Panel | Tipo de gráfico | Datos | Interacción | Insignia de evidencia |
|---|---|---|---|---|
| **Evolución de llamas esféricas** | Curvas $D^2(t)$ y $r_f(t)$ con recta ajustada; video sincronizado | FLEX (PSI-69), s-Flame | Barra de tiempo que mueve curva y video a la vez | A (ISS) |
| **Mapa de calor de hollín** | Mapa de calor de $f_v$ sobre la geometría de la llama | CLD Flame (si PSI ofrece campos 2D) | Comparar condiciones lado a lado | A, o "sin datos" si no existen |
| **Comparativa 1 g vs. µg** | Gráfico de pesas (*dumbbell*): límite de O₂ por material en 1 g y en µg, unidos por una línea | Liveretou 2026, Rivera 2026, Saffire I–II (1 g vs. µg) | Filtro por material y protocolo | A/B según la fuente |
| **Mapa de inflamabilidad** | Diagrama de fases O₂ vs. flujo; un panel por gravedad | P1–P2 (§13.2) | Mover el punto de cabina; ver el margen | Según la consulta |
| **Crecimiento del fuego a escala de nave** | Series temporales de HRR, CO₂ y CO con líneas de SMAC | Saffire IV–VI | Elegir ensayo | A |
| **Firma de humo** | Curvas lognormales por material sobre la banda de sensibilidad del detector (ISS: > 0,6 µm) | SAME-2 | Elegir material y detector | A |
| **Matriz de cobertura** | Mapa de calor investigación × variable (medida / no medida / no aplica) | Inventario §12.2 | Clic → ficha | – |
| **Brechas** | Mapa de brechas (gravedad parcial, O₂ alto, escala, polvo) con la misión que las cerrará (LUCI, FM2) | §8.2, §19.4 | Clic → evidencia disponible | ∅ / C / D |

**Reglas de visualización:**
- Siempre **color + ícono + texto** (RNF-04).
- "Sin evidencia" en **gris rayado**, nunca verde.
- Extrapolaciones con **borde punteado** y la etiqueta "extrapolación".
- Animaciones de llama con la etiqueta **"representación cualitativa"** y, al lado, la evidencia real con DOI.
- Mismos ejes y escalas en los paneles que se comparan.
- Sin logo de NASA ni sugerencia de aval (RNF-08).

### 15.4 Arquitectura técnica mínima (propuesta)

```
 Navegador (SPA)
   ├── Contenido del Classroom (JSON/Markdown versionado en el repositorio)
   ├── Gráficos (librería de gráficos web)
   └── Rejillas precalculadas (nivel 0, §14.5) como respaldo
        │  HTTPS / JSON
        ▼
 FastAPI (Python)
   ├── /predict/*    ← modelos exportados desde R (§14)
   ├── /assistant/*  ← RAG: índice vectorial + proveedor de IA
   └── /data/*       ← consultas a tablas curadas
        │
        ▼
 Almacenamiento
   ├── Tablas curadas en Parquet (DuckDB para consultas) o Postgres
   ├── Índice vectorial del corpus (fragmentos con DOI y sección)
   └── Activos de PSI seleccionados (imágenes y video con licencia verificada)
```

### 15.5 Recorrido de demostración (alineado con los cuatro objetivos)

1. **O1 · Classroom:** el usuario completa el módulo 0 y, desde la Biblioteca PSI, filtra "Luna · SEA · sólidos". Aparecen BASS-II, Saffire VI y los estudios de gravedad parcial, con su nivel de evidencia.
2. **O2 · Laboratorio:** con el botón "Puente a la herramienta", abre el mapa de inflamabilidad con PMMA, 56,5 kPa, 34 % O₂ y 10 cm/s. Se disparan ALR-03 y ALR-04 y se muestra el margen con intervalo (o "sin evidencia comparable").
3. **O3 · Radar:** la brecha "gravedad parcial" enlaza con FM2 y LUCI; el panel de detección muestra por qué el detector de la ISS falla con humo de Teflon y Kapton.
4. **O4 · Tierra:** cierre con el tanque composite para bomberos y los textiles de PBI.

---

## 16. Lecciones históricas de seguridad aeroespacial

> **Por qué importa para el software.** Cada accidente enseña una **regla física** y una **regla de diseño de software**. Las tablas "Implicación para el software" de esta sección son requisitos derivados que la IA debe implementar.

### 16.1 Apolo 1 (27 de enero de 1967): el fuego en una atmósfera de oxígeno puro

**Qué pasó.** Durante una prueba en la plataforma 34 de Cabo Cañaveral (una prueba "plugs-out", con la nave sobre baterías internas), la cabina del módulo de mando se llenó de **oxígeno puro a 16,7 psi**, unos 2 psi por encima de la presión exterior. Se declaró un incendio que mató a Gus Grissom, Ed White y Roger Chaffee. [WEB]

| Factor | Detalle | Fuente |
|---|---|---|
| Atmósfera | 100 % O₂ a 16,7 psia (≈115 kPa); en vuelo se planeaba ≈5 psi | [WEB] |
| $p_{O_2}$ | ≈115 kPa, unas **5,4 veces** la del aire a nivel del mar | [CALC] |
| Ignición | Nunca identificada con certeza; lo más probable fue un **arco eléctrico** de cableado dañado; NASA consideró como fuentes más probables el cableado y las tuberías con refrigerante combustible y corrosivo | [WEB][B22] |
| Combustible | Redes de nylon, almohadillas de espuma y abundante Velcro, que ardió de forma explosiva en O₂ puro | [WEB] |
| Dinámica | La presión subió hasta romper el casco **en menos de 20 s**; luego el fuego se agotó en segundos | [WEB] |
| Causa de muerte | Asfixia tras la destrucción de trajes y mangueras de oxígeno | [WEB] |
| Escotilla | El diseño de la escotilla impidió una salida rápida; fue una de las cinco áreas de preocupación de la junta | [WEB] |
| Advertencias previas | La tripulación había expresado preocupación por la cantidad de material inflamable en la cabina | [WEB] |

**Física detrás.** Con $x_{O_2} = 1$ no hay diluyente que absorba calor: la temperatura de llama sube y la velocidad de propagación se dispara (§4.2, §4.3, §8.1). Además, en 1 g la flotabilidad acelera la propagación hacia arriba. Un material aceptable en aire puede ser explosivo en O₂ puro: **la aceptación de un material individual bajo una condición de ensayo no prueba que la disposición instalada sea segura en otra atmósfera**. [WEB]

**Qué cambió.** La atmósfera de lanzamiento pasó a **60 % O₂ / 40 % N₂**; se desarrollaron materiales nuevos no combustibles (fibra Beta de vidrio, PBI); se hicieron **ensayos de inflamabilidad de componentes en atmósfera enriquecida** y **más de 100 ensayos de crecimiento de fuego en maquetas a escala real**. [WEB][B22] Es el origen de la filosofía de materiales que hoy está en NASA-STD-6001. [B22]

| Lección | Implicación para el software 🤖 |
|---|---|
| La atmósfera (fracción y presión) cambia la inflamabilidad más que casi cualquier otro factor | El selector de ambiente debe ser el **eje central**; mostrar $x_{O_2}$, $P$ y $p_{O_2}$ por separado |
| Un material probado en una atmósfera no está probado en otra | Toda frontera lleva su atmósfera de ensayo; consulta fuera → ALR-09 |
| La configuración (cantidad y disposición de material) importa | Mostrar escala y confinamiento del ensayo; distinguir muestra pequeña de escala de nave (Saffire) |
| Las preocupaciones previas no se tradujeron en acción | El panel de brechas (O3) debe ser visible, no escondido |

### 16.2 Apolo 13 (13–14 de abril de 1970): la explosión del tanque de oxígeno

**Qué pasó.** Unas 56 horas después del lanzamiento (tiempo de misión 55:54:53), al encender los ventiladores del **tanque de oxígeno n.º 2** del módulo de servicio, un cortocircuito encendió el aislamiento de **Teflon** de los cables dentro del tanque de O₂. El fuego se propagó, la presión superó el límite nominal de ~1000 psi y el tanque o su cúpula fallaron. La explosión dañó el tanque n.º 1, voló el panel del compartimento 4 y se perdió todo el oxígeno en unas 3 horas, junto con la energía de las pilas de combustible. La tripulación usó el módulo lunar como bote salvavidas. [WEB][B22]

**Cadena de fallos** [WEB]:

```
Tanque retirado del Apolo 10 → cae ~5 cm → línea de llenado dañada
   → en tierra no se vacía bien → se usa el calentador 8 h a 65 V
   → termostatos diseñados para 28 V se sueldan → calentador llega a ~1000 °F (538 °C)
   → el indicador de temperatura solo marcaba hasta 85 °F: nadie lo vio
   → aislamiento de Teflon dañado
   → en vuelo, agitación del tanque → cortocircuito (~10 J) → Teflon arde en O₂ a alta presión
   → ruptura del tanque
```

**Física detrás.** NASA lo considera **el primer accidente con fuego registrado en ausencia de flujo de flotabilidad**. [B22] Un material que se considera poco inflamable en aire (Teflon) arde en oxígeno a alta presión; una energía de ignición pequeña bastó porque el oxidante estaba puro y comprimido. [WEB][T]

| Lección | Implicación para el software 🤖 |
|---|---|
| Fuego sin gravedad ≠ fuego débil | Nunca asociar "µg" con "riesgo bajo" en la interfaz |
| La compatibilidad con oxígeno depende de presión y pureza | Separar la inflamabilidad en cabina de la compatibilidad con sistemas de O₂ (otra parte de NASA-STD-6001) y declarar que el producto cubre la primera |
| Un sensor saturado (85 °F) ocultó la anomalía | **Marcar valores en el límite de un instrumento** como "saturado/censurado", nunca como medición normal |
| La suma de pequeños errores fue catastrófica | El asistente debe explicar cadenas causales, no solo valores puntuales |

### 16.3 Incendio de la estación Mir (23 de febrero de 1997): el fuego que traía su propio oxígeno

**Qué pasó.** Con seis personas a bordo, la estación necesitaba oxígeno adicional, que se generaba quemando "velas" de **perclorato de litio** (sistema TGK/Vika). Una vela en el módulo Kvant-1 se incendió y lanzó un chorro tipo soplete con metal fundido y chispas. [WEB][B22]

| Factor | Detalle | Fuente |
|---|---|---|
| Fuente | Generador químico de O₂ (perclorato de litio); cada vela da O₂ para una persona durante un día | [WEB] |
| Duración | Unos **14 minutos** según el astronauta Jerry Linenger (los primeros informes oficiales dijeron 90 s) | [WEB] |
| Apagado | El generador tuvo que **quedarse sin oxígeno** para que el fuego se extinguiera | [B22] |
| Supresión | Tres extintores con espuma de base agua expandida con Halón 1301; añadieron vapor al humo | [B22][WEB] |
| Humo | Muy denso, se extendió rápido; la tripulación usó respiradores | [WEB][B22] |
| Ruta de escape | El fuego bloqueó el camino a una de las dos naves Soyuz | [WEB] |
| Causa | No se determinó; ensayos posteriores mostraron que la contaminación de la vela (por ejemplo, un trozo de guante de látex) puede provocar un fuego similar | [WEB] |
| Detección | Detectores ópticos de humo | [B22] |

**Lecciones documentadas por NASA** [B22]:
- Un fuego pequeño puede generar **grandes cantidades de CO**; la tripulación necesita saber de inmediato si el ambiente es respirable, lo que exige monitorear **gases volátiles además del humo**.
- La espuma de base agua aplicada **directamente** sobre el cartucho fue el agente más eficaz, algo mejor que el agua sola.
- Rusia cambió el entrenamiento de la tripulación, la respuesta del control de tierra y la preparación de los cartuchos en tierra; para la ISS se añadió una pantalla resistente al fuego. [B22][WEB]

**Física detrás.** Un generador químico de oxígeno es un **combustible con su propio oxidante**: cortar la ventilación o diluir con gas inerte **no** lo apaga, porque no depende del O₂ de la cabina. [B22][T] Esto contrasta con los fuegos de materiales de cabina, donde reducir el flujo o diluir sí funciona (§9.2).

| Lección | Implicación para el software 🤖 |
|---|---|
| Hay fuentes autooxidantes (generadores de O₂, algunas químicas de baterías) | Clasificar fuentes por `oxidizer_source` (`cabin`, `internal`); la supresión por dilución no aplica a `internal` |
| El humo y el CO son el peligro principal tras el fuego | Vista de detección y limpieza con SMAC (§10.2.3) |
| Los informes iniciales pueden ser inexactos | Guardar fuente y versión de cada dato; permitir varias versiones del mismo hecho |
| El escape puede quedar bloqueado | Las recomendaciones (O3) deben considerar rutas de evacuación en el diseño de hábitats |

### 16.4 Otros antecedentes útiles

| Evento / sistema | Lección | Fuente |
|---|---|---|
| Skylab (1973–79): ~30 detectores UV | Limitados a línea de visión; problemas de falsas alarmas | [B12] |
| Transbordador: detectores de ionización | Diseñados con criterios terrestres sin datos de humo en µg | [B12] |
| ISS: detector de dispersión de luz | Falla con humo pequeño de Teflon y Kapton (SAME) | [WEB][B13] |
| Experimentos con velas en Mir | Llamas estables >45 min en µg: el fuego **sí** puede sostenerse sin ventilación | [WEB] |
| Alarma de humo de Artemis II | Mencionada en el texto del reto como antecedente reciente; **detalles por verificar** antes de citarla | [REQ] |

### 16.5 Síntesis: reglas de diseño derivadas de la historia 🤖

| # | Regla | Origen |
|---|---|---|
| H1 | La atmósfera (fracción, presión) es la primera variable de cualquier evaluación | Apolo 1 |
| H2 | No existe "material seguro" sin su atmósfera, configuración y gravedad de ensayo | Apolo 1, STD-6001 |
| H3 | µg no implica menor riesgo; la gravedad parcial puede ser peor | Apolo 13, B7, B8 |
| H4 | Valores saturados o fuera de rango se marcan, nunca se ocultan | Apolo 13 |
| H5 | Distinguir fuentes con oxidante propio | Mir |
| H6 | El peligro tras el fuego es tóxico (CO, HCl, HCN) | Mir, Saffire |
| H7 | Un solo tipo de detector no basta | SAME, Skylab |

---

---

## 17. Tecnologías derivadas (spin-offs) y aplicaciones terrestres

> **Regla de comunicación** [INF]: distinguir una **transferencia documentada** (con artículo de NASA Spinoff) de una **aplicación posible**. No afirmar que todo detector o traje terrestre "viene de NASA".

### 17.1 Tanques de aire ligeros para bomberos (transferencia documentada)

| Aspecto | Detalle | Fuente |
|---|---|---|
| Problema | En los años 70, los bomberos a menudo no usaban sus equipos de respiración porque eran pesados y restringían el movimiento | [WEB] |
| Origen | Proyecto NASA (Johnson) con la Oficina Nacional de Normas; experiencia en recipientes a presión para naves | [WEB] |
| Tecnología | **Recipiente a presión con envoltura de composite**: forro de aluminio envuelto en fibra de vidrio con resina | [WEB] |
| Resultado | Cilindro de 26 lb con el mismo aire que uno de acero de 41 lb, a 4.000–4.500 psig (≈el doble de los 2.215 psig típicos); una versión de 1976 ofrecía 30 min de aire con 20 lb, 13 lb menos que los equipos convencionales | [WEB] |
| Extras | Máscara rediseñada con mejor visión; alarma de aire bajo personalizada | [WEB] |
| Impacto | Ensayado en varias ciudades, redujo lesiones; según NASA Spinoff, los grandes fabricantes de equipos de respiración incorporaron tecnología de NASA en alguna forma | [WEB] |
| Derivados | Tanques de toboganes de evacuación de aviones (747), vehículos de gas natural, buceo, aplicaciones médicas | [WEB] |

**Conexión con el reto:** los mismos recipientes a presión que almacenan gases en naves son críticos en seguridad contra incendios (Apolo 13 fue un fallo de un recipiente de O₂).

### 17.2 Detectores de fuego y humo

| Tecnología | Detalle | Estado | Fuente |
|---|---|---|---|
| Detector de humo de ionización con sensibilidad ajustable (Skylab, con Honeywell) | Debía alertar de humo sin dispararse por las actividades normales de la estación | Influyó en detectores domésticos (fuente secundaria; NASA Spinoff 1979 documenta detectores Honeywell instalados en viviendas) | [WEB] |
| **Detector de fuego incipiente** (Brunswick, transbordador) | Muestrea el aire y distingue partículas de combustión; avisa **antes de que aparezcan llama y humo** | Evaluado para **operaciones mineras** (Spinoff 1978) | [WEB] |
| Detector UV de llamas de hidrógeno (instalaciones del transbordador) | Detecta una llama de hidrógeno (casi invisible) a 100 ft | Comercializado para instalaciones con hidrógeno (Spinoff 1986) | [WEB] |
| FIRESCAPE (Stennis) | Imagen infrarroja de llamas invisibles de hidrógeno y alcohol; ve a través del humo | Producto comercial para bomberos (Spinoff 1997) | [WEB] |
| Conocimiento de tamaños de humo (SAME) | Firma de humo por material y calentamiento | **Aplicación posible** para recintos cerrados; no es un producto acreditado | [INF][B13] |

### 17.3 Materiales para trajes de bomberos

| Material / programa | Detalle | Fuente |
|---|---|---|
| **PBI** (polibenzimidazol) | Fibra sintetizada a fines de los 50; tras el Apolo 1, NASA contrató en 1967 a Celanese para desarrollar textiles de PBI para trajes y naves. Casi no tiene punto de fusión y conserva resistencia y flexibilidad tras exponerse a la llama | [WEB] |
| PBI Gold | 40 % PBI + 60 % aramida; no se encoge ni se rompe con calor extremo; el Departamento de Bomberos de Nueva York lo especificó en 1994 para sus trajes | [WEB] |
| Fibra Beta | Tejido de fibra de vidrio usado en la capa exterior de los trajes Apolo y en el interior del módulo de mando | [WEB] |
| **Project FIRES** | Programa conjunto NASA–bomberos para actualizar los trajes con materiales de origen Apolo; materiales evaluados por 14 departamentos de bomberos; sus datos sirvieron de base para nuevos equipos de protección | [WEB] |
| Prototipos JSC | Trajes con PBO/Kevlar y sistemas de refrigeración por aire criogénico (SCAMP) | Prototipo; no producto [WEB] |

### 17.4 Otras transferencias y aplicaciones

| Ámbito | Detalle | Tipo | Fuente |
|---|---|---|---|
| Válvulas sin fugas | El desarrollo del extintor de niebla fina impulsó válvulas de cierre sin fuga usadas después en sistemas industriales | Documentada | [INF] |
| Niebla de agua | Alternativa a agentes químicos prohibidos por el Protocolo de Montreal; sin efectos ambientales ni para la salud | Aplicación (investigación) | [B18] |
| Motores | Las llamas frías podrían mejorar la eficiencia de motores; las herramientas de diseño de motores ignoran su química | Aplicación posible | [WEB][B3] |
| Combustión más limpia | ACME: hornos, centrales y calderas más eficientes y menos contaminantes | Aplicación posible | [WEB] |
| Normas terrestres | Entender el papel de la flotabilidad permite una teoría más completa del fuego en la Tierra | Conocimiento | [B4] |

🤖 **Vista "Tierra" del producto** [REQ RF-EAR-01]: 3–5 casos, cada uno con enlace a NASA Spinoff **y** a la investigación de combustión relacionada.

---

---

## 18. Enlaces de descarga directa y referencias bibliográficas

> 🤖 **Para el pipeline de datos.** Los enlaces `ntrs.nasa.gov/api/citations/<ID>/downloads/<ID>.pdf` son descargas directas del PDF. El patrón funciona para muchos registros, pero **no para todos**: si falla, abrir `ntrs.nasa.gov/citations/<ID>` y tomar el enlace de descarga. Los artículos de revista (DOI) pueden requerir suscripción; usar solo los de acceso abierto para texto completo. Verificar el campo *Copyright* de cada registro NTRS antes de redistribuir. [REQ]

### 18.1 Reto y documentos del equipo

| Recurso | Enlace |
|---|---|
| Reto oficial (enunciado) | https://www.spaceappschallenge.org/2026/challenges/flame-in-freefall/ |
| Reto (búsqueda de equipo) | https://www.spaceappschallenge.org/2026/find-a-team/flame-in-freefall/ |
| Requerimientos del equipo | Proyecto: `1 requerimientos-flame-in-freefall.md` |
| Informe técnico del físico del equipo | Proyecto: `Informe del reto NASA Space.pdf` |

### 18.2 Datos: PSI

| Recurso | Enlace | Formato |
|---|---|---|
| Buscador de investigaciones PSI | https://psi.nasa.gov/physci/repo/search?q=&data_source=psi&data_type=investigation | Web (JavaScript) |
| BASS-II (PSI-25, DOI 10.60555/4qc4-de67) | https://psi.nasa.gov/physci/repo/data/investigations/PSI-25 | Tablas, video |
| FLEX (PSI-69) | https://psi.nasa.gov/physci/repo/data/investigations/PSI-69 | Tablas, archivos |
| Qué es PSI (historia, misión, contacto) | https://science.nasa.gov/physical-sciences-informatics-psi/history-of-physical-science-informatics/ | Web |
| Guía de búsqueda en PSI | https://science.nasa.gov/wp-content/uploads/2024/11/psi-database-guide.pdf | PDF |
| *A Researcher's Guide to: Physical Sciences Informatics System* | https://www.nasa.gov/sites/default/files/atoms/files/psi_researchers_guide-tagged.pdf | PDF |
| Proyectos financiados que usaron datos PSI | https://science.nasa.gov/physical-sciences-informatics-psi/psi-nra-awarded-research-by-area/ | Web |
| Contacto PSI | `msfc-psi-help@mail.nasa.gov` · lista de usuarios: `psi-join@lists.nasa.gov` | Correo |

### 18.3 Divulgación y guías oficiales de NASA

| Recurso | Enlace |
|---|---|
| *A Researcher's Guide to: Combustion Science* (2015) — PDF | https://www.nasa.gov/sites/default/files/atoms/files/np-2015-10-034-jsc_combustion_in_reduced_gravity-iss-mini-book-011116-508.pdf |
| Ficha de la guía (también EPUB/MOBI) | https://www.nasa.gov/connect/ebooks/researchers_guide_combustion_science_detail.html |
| NASA Glenn: Combustion Science | https://www.nasa.gov/glenn/glenn-expertise-space-exploration/physical-sciences-program/combustion-science |
| Studying Combustion and Fire Safety (ISS) | https://www.nasa.gov/missions/station/iss-research/studying-combustion-and-fire-safety/ |
| NASA ScienceCasts: *The Power of Studying Combustion on the ISS* (2018) | https://www.issnationallab.org/blog/nasa-sciencecasts-the-power-of-studying-combustion-on-the-iss/ |
| NASA ScienceCasts: *Strange Flames on the ISS* (2013, llamas frías) | https://www.labxchange.org/library/items/lb:LabXchange:e0698362:video:1 |
| Space Station Research Explorer | https://www.nasa.gov/mission/station/research-explorer/ |
| FM2 (NASA Glenn) | https://www.nasa.gov/glenn/glenn-expertise-space-exploration/physical-sciences-program/combustion-science/flammability-of-materials-on-the-moon-fm2/ |
| SoFIE-MIST | https://science.nasa.gov/biological-physical/investigations/sofie-mist/ |
| ACME / BRE / s-Flame (NASA Science) | https://science.nasa.gov/biological-physical/investigations/acme/ · https://science.nasa.gov/biological-physical/investigations/bre/ · https://science.nasa.gov/biological-physical/investigations/s-flame |
| Extintor de niebla fina (TechPort 12180) | https://techport.nasa.gov/projects/12180 |
| Manuales de FDS (NIST) | https://pages.nist.gov/fds-smv/manuals.html |

### 18.4 Reportes NASA (NTRS) con descarga directa

| Código | Referencia | Ficha | PDF directo |
|---|---|---|---|
| B2 | Urban et al. (2024) *Preliminary Results from the Saffire VI Experiment* | https://ntrs.nasa.gov/citations/20240002981 | https://ntrs.nasa.gov/api/citations/20240002981/downloads/20240002981.pdf *(verificar)* |
| – | Saffire ICES 2024 (presentación) | – | https://ntrs.nasa.gov/api/citations/20240007488/downloads/Saffire%20ICES%202024%20Saffire%20presentation072124small.pdf |
| B3 | Stocker (2021) ACME | https://ntrs.nasa.gov/citations/20210021781 | patrón API |
| B4 | Liao et al. (2021) *Challenges and Research Needs* | https://ntrs.nasa.gov/citations/20210022403 | patrón API |
| B6 | Urban et al. (2025) *Solid Fuel Ignition Testing for Lunar Applications* | https://ntrs.nasa.gov/citations/20250006779 | patrón API |
| B7 | Zayac et al. (2024) FM2 | https://ntrs.nasa.gov/citations/20240015307 | patrón API |
| B10 | Ferkul et al. (2017) Saffire I–II | https://ntrs.nasa.gov/citations/20170008805 | patrón API |
| B11 | Urban et al. (2012) SAME-2 | https://ntrs.nasa.gov/citations/20130000422 | patrón API |
| B12 | Urban et al. (2008) detección | https://ntrs.nasa.gov/citations/20080012612 | patrón API |
| B14 | Fortenberry et al. (2023) | https://ntrs.nasa.gov/citations/20230013826 | patrón API |
| B15 | Urban et al. (2007) DAFT | https://ntrs.nasa.gov/citations/20070031686 | patrón API |
| B16 | Rodriguez et al. (2012) FWM | https://ntrs.nasa.gov/citations/20120018019 | patrón API |
| B17 | Ruff et al. (2004) CO₂, N₂, He | https://ntrs.nasa.gov/citations/20040161262 | patrón API |
| B18 | Abbud-Madrid et al. (2003) Mist | https://ntrs.nasa.gov/citations/20040053582 | patrón API |
| B20 | Abney (2026) NESC TB 26-03 | https://ntrs.nasa.gov/citations/20260001542 | patrón API |
| – | FLEX detallado (Dietrich et al. 2015) | https://ntrs.nasa.gov/citations/20150023456 | https://ntrs.nasa.gov/api/citations/20150023456/downloads/20150023456.pdf |
| – | Saffire IV–V (Urban et al. 2021) | https://ntrs.nasa.gov/citations/20210011521 | patrón API |
| – | LUCI (Ferkul et al. 2025) | https://ntrs.nasa.gov/citations/20250010653 | patrón API |
| – | Meyer (2016) detección en Glenn | https://ntrs.nasa.gov/citations/20170007283 | patrón API |
| – | Meyer et al. (2013) productos de combustión | https://ntrs.nasa.gov/citations/20140002231 | patrón API |
| – | Padilla et al. (2019) baterías | https://ntrs.nasa.gov/citations/20200000365 | patrón API |
| – | Niehaus et al. (2026) modelo Saffire | https://ntrs.nasa.gov/citations/20260001600 | patrón API |
| – | Langford (2024) SMAC, JSC 20584 rev. C | https://ntrs.nasa.gov/citations/20240007713 | patrón API |
| – | *Fire on the Moon* (hipótesis lunar) | https://ntrs.nasa.gov/citations/20210020516 | patrón API |
| – | Large-Scale Spacecraft Fire Safety Tests | https://ntrs.nasa.gov/citations/20150000894 | patrón API |
| – | Saffire: objetivos | https://ntrs.nasa.gov/citations/20170001636 | patrón API |
| – | SoFIE en ISS (Ferkul et al.) | https://ntrs.nasa.gov/citations/20200000361 | https://ntrs.nasa.gov/api/citations/20200000361/downloads/20200000361.pdf |
| – | ACME 2017–2022 (resumen) | https://ntrs.nasa.gov/citations/20220015583 | patrón API |
| – | Libro blanco de detección de incendios (2021) | – | https://ntrs.nasa.gov/api/citations/20210022143/downloads/Fire%20detection%20white%20paper%20final%20211031.pdf |
| – | Sensibilidad de detectores (NTRS 20170000248) | – | https://ntrs.nasa.gov/api/citations/20170000248/downloads/20170000248.pdf |

### 18.5 Artículos de revista (DOI)

| Código | Referencia | DOI |
|---|---|---|
| B5 | Takahashi et al. (2026a) *Downward flame spread ... partial-gravity* | https://doi.org/10.1016/j.proci.2026.106097 |
| B8 | Nakaya et al. (2025) *Bayesian approach ... PMMA* (acceso abierto CC BY-NC-ND) | https://doi.org/10.1016/j.combustflame.2024.113828 |
| B13 | Meyer et al. (2018) *Smoke Detector Performance* (PMC7918997) | https://doi.org/10.1016/j.firesaf.2018.04.004 |
| B19 | Thomsen et al. (2017) *Flame spread limits (LOC) of fire resistant fabrics* | https://doi.org/10.1016/j.firesaf.2017.03.072 |
| – | Urban et al. (2019) *Flame spread: Effects of microgravity and scale* | https://doi.org/10.1016/j.combustflame.2018.10.012 |
| – | Dehghani et al. (2021) *Burning in microgravity* (BRE) | https://doi.org/10.1016/j.combustflame.2021.01.035 |
| – | Olson et al. (2024) *Partial gravity flammability of cast PMMA rods* | https://doi.org/10.1016/j.firesaf.2024.104267 |
| – | Liveretou et al. (2026) *Flame extinction of thermally thick PMMA* | https://doi.org/10.1016/j.firesaf.2025.104625 |
| – | Li et al. (2021) *Concurrent-flow flame spread ... confined space* | https://doi.org/10.1016/j.combustflame.2020.12.042 |
| – | Rivera et al. (2026) *Opposed flame spread limit over PMMA rods* | https://doi.org/10.1016/j.firesaf.2026.104719 |
| – | Olson y Ferkul (2017) *Microgravity flammability boundary for PMMA rods* | https://doi.org/10.1016/j.combustflame.2017.03.001 |
| – | Olson et al. (2023) *Duct size, sample size ... cellulose* | https://doi.org/10.1016/j.combustflame.2022.112559 |
| – | Takahashi et al. (2026b) *Charring and non-charring materials ... Kibo* | https://doi.org/10.1016/j.combustflame.2026.114803 |
| – | Thomsen et al. (2019) *Externally heated Nomex* | https://doi.org/10.1016/j.proci.2018.05.055 |
| – | Katta et al. (2004) *Cup-burner flames using CO₂ in microgravity* | https://doi.org/10.1016/j.combustflame.2004.01.015 |
| – | Meleti et al. (2024) *Obscured Wildfire Flame Detection* (solo antecedente metodológico) | https://doi.org/10.1109/DCOSS-IoT61029.2024.00019 |

### 18.6 Normas

| Código | Norma | Enlace |
|---|---|---|
| B9 | NASA-STD-6001B Change 3 (2025) | https://standards.nasa.gov/standard/nasa/nasa-std-6001 |
| B21 | JSC-29353B (2014) | https://standards.nasa.gov/sites/default/files/standards/JSC/B/0/JSC-29353B.pdf |
| B22 | OCHMO-TB-008 Fire Protection (NASA-STD-3001) | https://www.nasa.gov/wp-content/uploads/2023/12/ochmo-tb-008-fire-protection.pdf |

### 18.7 Casos históricos

| Caso | Enlace |
|---|---|
| Apolo 1 (NASA History) | https://www.nasa.gov/?p=96288 |
| Apolo 1 (Smithsonian, *Apollo's Worst Day*) | https://www.smithsonianmag.com/air-space-magazine/apollo-fire-50-years-180960972/ |
| Apolo 13 (NSSDC) | https://nssdc.gsfc.nasa.gov/planetary/lunar/ap13acc.html |
| Apolo 13: informe de la junta (NASA History) | https://www.nasa.gov/history/50-years-ago-apollo-13-review-board-report |
| Apolo 13: caso de estudio (NTRS) | https://ntrs.nasa.gov/api/citations/20080042304/downloads/20080042304.pdf |
| Mir 1997 (NASA APPEL, generadores de O₂) | https://appel.nasa.gov/?p=279500 |
| Mir 1997 y SAME (NIST) | https://www.nist.gov/node/1335761 |

### 18.8 Spin-offs

| Tecnología | Enlace |
|---|---|
| Tanques composite (Spinoff 2019) | https://spinoff.nasa.gov/node/11031 |
| Fireman's Air Tanks (Spinoff 1976) | https://spinoff.nasa.gov/node/9582 |
| Space Technology for the Fire Department (1986) | https://spinoff.nasa.gov/node/9518 |
| Informe técnico del tanque (1973) | https://ntrs.nasa.gov/api/citations/19740022383/downloads/19740022383.pdf |
| Detector de fuego incipiente (1978) | https://spinoff.nasa.gov/node/9407 · minería: https://ntrs.nasa.gov/citations/20070018916 |
| Detector de humo Honeywell (1979) | https://ntrs.nasa.gov/citations/20070019744 |
| Detector UV de hidrógeno (1986) | https://spinoff.nasa.gov/node/9682 |
| FIRESCAPE (1997) | https://spinoff.nasa.gov/node/10045 |
| PBI (textiles para bomberos) | https://spinoff.nasa.gov/node/10564 |
| Project FIRES (resumen) | https://spinoff.nasa.gov/pdf/PV2009_6536.pdf |
| Historia de fibras resistentes a la llama (NTRS) | https://ntrs.nasa.gov/api/citations/20170008542/downloads/20170008542.pdf |
| Válvula sin fugas (niebla de agua) | https://spinoff.nasa.gov/node/11065 |

---

---

## 19. Anexo para la IA de software: reglas, prohibiciones y pendientes

### 19.1 Reglas que el código debe cumplir 🤖

1. **Todo número tiene fuente** (DOI/NTRS + localizador) y **origen** (`measured`, `sensor_derived`, `digitized`, `simulated`, `predicted`). [REQ][INF]
2. **Vacío ≠ cero.** Usar `missing_reason`. [INF]
3. **Una frontera = un protocolo.** No comparar LOC/MOC/OI de protocolos distintos. [INF]
4. **Gravedad parcial**: nunca interpolar entre 0 y 1 g sin aviso; mostrar la evidencia de vuelos parciales, centrífugas y LUCI con su origen. [REQ][INF]
5. **"Sin evidencia" nunca se pinta de verde.** [REQ]
6. **Alertas = avisos de análisis**, no alarmas de una nave real; no hay sensores en vivo. [REQ][INF]
7. **La animación de la llama es cualitativa** y va junto a evidencia real con DOI. [REQ][INF]
8. **Validar por campaña/muestra.** [REQ][INF]
9. **Las fracciones molares suman 1.** [INF]
10. **El asistente se abstiene** si no hay evidencia y responde números desde tablas curadas, no desde texto generado. [REQ][INF]

### 19.2 Frases prohibidas y su versión correcta

| ❌ Prohibido | ✅ Correcto |
|---|---|
| "Predice el fuego en la Luna" | "Extrapolación desde datos en 0 g, 1 g y gravedad parcial simulada; sin validación en la superficie lunar" [REQ][INF] |
| "Material seguro" | "Por debajo de la frontera X bajo el protocolo Y y el dominio Z" [INF] |
| "Inyecte N kg de CO₂" | "En FLEX, la llama se extinguió con estas fracciones de diluyente; la dosis de cabina requiere transporte y volumen" [INF] |
| "El fuego se apaga solo en el espacio" | "Una llama pequeña en aire quieto puede apagarse; una con ventilación puede crecer de forma sostenida" [WEB][B10] |
| "E-FIELD equivale a la gravedad lunar" | "E-FIELD es un análogo de un mecanismo de transporte (nivel C)" [INF] |
| "La llama en microgravedad es esférica" | "Es esférica en el caso ideal de aire quieto y combustible pequeño" [INF] |

### 19.3 Recorrido de demostración verificable (guion)

Basado en [INF] §7.2:

1. Usuario elige **PMMA**, **Luna**, **56,5 kPa**, **34 % O₂**, **flujo opuesto 10 cm/s**.
2. El sistema calcula $p_{O_2} = 0{,}34 \times 56{,}5 = 19{,}21$ kPa [CALC] y muestra que es **menor** que en la Tierra (21,2 kPa) pero con una fracción de O₂ **63 % mayor**.
3. Aparecen los análogos y sus diferencias: varillas orbitales (Rivera, Liveretou), centrífuga con otro régimen de flujo (Olson 2024, Nakaya 2025), películas en vuelos parabólicos (Takahashi 2026a) y LUCI en aire.
4. Se dispara **ALR-03** (O₂ ≥ 30 %) y **ALR-04** (gravedad parcial).
5. Si existe una frontera bayesiana compatible, se muestra **como predicción**, con intervalo; si no, **no se genera número**.
6. La llama animada aparece con la etiqueta "cualitativa" junto a un video real de PSI con DOI.
7. El asistente responde "¿Por qué la Luna podría ser peor que la ISS?" citando B7 y B8.

### 19.4 Puntos abiertos que bloquean o condicionan el desarrollo

| # | Tema | Estado | Responsable sugerido |
|---|---|---|---|
| A2 | Columnas reales de las tablas PSI (BASS-II, FLEX) | Pendiente; las páginas PSI requieren navegador | Equipo de datos |
| A3 | Inventario verificable de las 24 investigaciones | Pendiente | Equipo de datos |
| A4 | Fronteras de O₂ por material con DOI | Parcial (§12.4) | Asesor + datos |
| A6 | Margen extra en gravedad parcial | B6 da 0,3–2,3 puntos según material; [REQ] propone 2–4 | **Asesor** |
| A7 | Atmósfera interior de Marte | Sin definir; no usar la lunar por defecto | Equipo |
| – | Acceso a Rivera 2026 y Liveretou 2026; digitalización de figuras de Nakaya 2025 | Pendiente; condiciona el modelo principal (§13.0.5) | Equipo de datos |
| – | Definición de la columna de tasa en PSI-69 | El cálculo de §9.1 sugiere $K$ media en mm²/s; confirmar con el reporte FLEX | Datos + asesor |
| – | Primer dominio de sólidos (familia + protocolo) | Propuesta: PMMA cilíndrico, flujo opuesto | Asesor |
| – | Licencias por activo (imágenes, video) | Pendiente | Equipo |
| – | Detalles de la alarma de Artemis II | Por verificar | Equipo |

### 19.5 Lista de verificación antes de publicar el producto

- [ ] Cada ficha de investigación tiene DOI o registro NTRS y versión PSI.
- [ ] Ningún valor se muestra sin unidad, origen y fuente.
- [ ] Las conversiones de §12.6 tienen pruebas unitarias.
- [ ] El selector de ambiente recalcula $p_{O_2}$ y avisa fuera de dominio.
- [ ] Las alertas muestran causa y fuente.
- [ ] El asistente supera las pruebas de abstención y citas.
- [ ] Sin logo de NASA ni sugerencia de aval. [REQ]
- [ ] Página "Datos y referencias" con DOIs, licencias y declaración de uso de IA. [REQ]


