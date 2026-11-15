import json
from pathlib import Path

from app.main import app

esquema = app.openapi()
destino = Path("docs")
destino.mkdir(exist_ok=True)
(destino / "openapi.json").write_text(json.dumps(esquema, indent=2, ensure_ascii=False), encoding="utf-8")

lineas = ["# Contrato de API", "",
          "Generado desde el propio FastAPI. No editar a mano.", ""]
for ruta, metodos in esquema["paths"].items():
    for metodo, op in metodos.items():
        lineas.append(f"## `{metodo.upper()} {ruta}`")
        lineas.append(op.get("summary", ""))
        if op.get("tags"):
            lineas.append(f"Etiqueta: {', '.join(op['tags'])}")
        for param in op.get("parameters", []):
            tipo = param["schema"].get("type", param["schema"].get("anyOf", "?"))
            lineas.append(f"- parametro `{param['name']}` en {param['in']} tipo {tipo} requerido {param['required']}")
        cuerpo = op.get("requestBody", {}).get("content", {}).get("application/json", {}).get("schema", {})
        if cuerpo.get("$ref"):
            lineas.append(f"- cuerpo: {cuerpo['$ref'].split('/')[-1]}")
        for codigo, resp in op["responses"].items():
            contenido = resp.get("content", {}).get("application/json", {}).get("schema", {})
            forma = contenido.get("$ref", "").split("/")[-1] or contenido.get("type", "sin esquema")
            lineas.append(f"- respuesta {codigo}: {forma}")
        lineas.append("")

(destino / "api.md").write_text("\n".join(lineas), encoding="utf-8")
print(f"{sum(len(m) for m in esquema['paths'].values())} operaciones documentadas en docs/api.md")
