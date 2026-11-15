"""Inventario de dataset_clean: cabeceras, claves, primeras líneas y candidatos sin ingestar."""
import json
import re
import sys
from collections import Counter
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.config import settings  # noqa: E402
from app.ingest.registry import resolve  # noqa: E402

CANDIDATOS = {
    "incidents_txt": "contexto histórico de accidentes",
    "spinoffs_txt": "beneficio terrestre",
    "json": "metadatos de misión o de instalación",
    "docs": "guía oficial y referencia",
}


def leer_texto(path: Path) -> tuple[str, str]:
    crudo = path.read_bytes()
    for codificacion in ("utf-8-sig", "utf-8", "cp1252", "latin-1"):
        try:
            return crudo.decode(codificacion), codificacion
        except UnicodeDecodeError:
            continue
    return "", "binario"


def main() -> int:
    base = settings().dataset_dir
    if not base.exists():
        print(f"no existe {base}")
        return 1

    lineas: list[str] = []
    extensiones: Counter = Counter()
    sin_esquema: list[str] = []

    for path in sorted(base.rglob("*")):
        if not path.is_file():
            continue
        extensiones[path.suffix.lower()] += 1
        relativa = path.relative_to(base).as_posix()
        tamano = path.stat().st_size
        carpetas = path.parent.name
        etiqueta = CANDIDATOS.get(carpetas, "")
        cabecera = f"\n### {relativa}  ({tamano} bytes)"
        if etiqueta:
            cabecera += f"  [{etiqueta}]"
        lineas.append(cabecera)

        sufijo = path.suffix.lower()
        if sufijo == ".csv":
            texto, codificacion = leer_texto(path)
            filas = [f for f in texto.splitlines() if f.strip()]
            columnas = filas[0] if filas else ""
            separador = ";" if columnas.count(";") > columnas.count(",") else ","
            esquema = resolve(path.name, columnas.split(separador))
            lineas.append(f"  codificación: {codificacion} · filas: {max(0, len(filas) - 1)} · separador: {separador!r}")
            lineas.append(f"  cabecera: {columnas[:300]}")
            lineas.append(f"  esquema: {esquema.key if esquema else 'SIN ESQUEMA'}")
            if esquema is None:
                sin_esquema.append(relativa)
        elif sufijo == ".json":
            texto, _ = leer_texto(path)
            try:
                datos = json.loads(texto)
            except json.JSONDecodeError as exc:
                lineas.append(f"  JSON inválido: {exc}")
                continue
            if isinstance(datos, dict):
                lineas.append(f"  claves: {list(datos)[:20]}")
                for clave in list(datos)[:6]:
                    lineas.append(f"    {clave}: {json.dumps(datos[clave], ensure_ascii=False)[:160]}")
            elif isinstance(datos, list):
                lineas.append(f"  lista de {len(datos)} elementos")
                if datos:
                    lineas.append(f"    primero: {json.dumps(datos[0], ensure_ascii=False)[:200]}")
        elif sufijo in {".txt", ".md"}:
            texto, codificacion = leer_texto(path)
            utiles = [l.strip() for l in texto.splitlines() if l.strip()]
            lineas.append(f"  codificación: {codificacion} · líneas con texto: {len(utiles)} · caracteres: {len(texto)}")
            for l in utiles[:4]:
                lineas.append(f"    | {l[:150]}")
        elif sufijo == ".pdf":
            crudo = path.read_bytes()
            paginas = len(re.findall(rb"/Type\s*/Page[^s]", crudo))
            lineas.append(f"  PDF · páginas aproximadas: {paginas}")
        else:
            lineas.append("  binario")

    resumen = ["# Inventario de dataset_clean", "",
               "## Totales por extensión", ""]
    resumen += [f"- {ext or '(sin extensión)'}: {n}" for ext, n in extensiones.most_common()]
    resumen += ["", "## Archivos sin esquema reconocido", ""]
    resumen += [f"- {r}" for r in sin_esquema] or ["- ninguno"]
    resumen += ["", "## Detalle", ""]

    destino = Path("docs")
    destino.mkdir(exist_ok=True)
    (destino / "inventario.md").write_text("\n".join(resumen + lineas), encoding="utf-8")

    print("\n".join(resumen))
    print(f"\nDetalle completo en docs/inventario.md")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
