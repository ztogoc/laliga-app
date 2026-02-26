#!/usr/bin/env python3
"""Actualiza el historial real de pronósticos y sus métricas."""
from __future__ import annotations

import argparse
import json
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List

BASE_DIR = Path(__file__).resolve().parents[1]
DATA_DIR = BASE_DIR / "data"
HISTORIAL_PATH = DATA_DIR / "pronosticos_historial.json"
DEFAULT_SOURCE = DATA_DIR / "pronosticos_actualizacion.json"

DEFAULT_DATA = {
    "historial": [],
    "resumen": {
        "partidosAnalizados": 0,
        "aciertos": 0,
        "errores": 0,
        "beneficio": 0.0,
    },
}


def load_json(path: Path, default: Any = None) -> Any:
    if not path.exists():
        return json.loads(json.dumps(default)) if default is not None else None
    with path.open("r", encoding="utf-8") as fh:
        return json.load(fh)


def save_json(payload: Any, path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as fh:
        json.dump(payload, fh, ensure_ascii=False, indent=4)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description=(
            "Agrega resultados reales de la jornada al historial de pronósticos.\n"
            "Por defecto lee los datos nuevos desde data/pronosticos_actualizacion.json."
        )
    )
    parser.add_argument(
        "--source",
        type=Path,
        default=DEFAULT_SOURCE,
        help="Ruta del archivo JSON con los resultados de pronósticos de la jornada",
    )
    parser.add_argument(
        "--jornada",
        type=int,
        default=None,
        help="Número de jornada a aplicar a todos los registros (opcional si viene en el JSON)",
    )
    parser.add_argument(
        "--clear-source",
        action="store_true",
        help="Vacía el archivo de origen después de procesarlo",
    )
    return parser.parse_args()


def obtener_signo(result_str: str | None) -> str | None:
    """Devuelve '1', 'X' o '2' según el marcador indicado en una cadena."""
    if not result_str or "-" not in result_str:
        return None
    try:
        local_raw, visitante_raw = result_str.split("-", maxsplit=1)
        goles_local = int(local_raw.strip())
        goles_visitante = int(visitante_raw.strip())
    except (ValueError, TypeError):
        return None

    if goles_local > goles_visitante:
        return "1"
    if goles_local < goles_visitante:
        return "2"
    return "X"


def evaluar_acierto_quiniela(registro: Dict[str, Any]) -> Dict[str, Any]:
    """Evalúa si el pronóstico acierta según la lógica 1-X-2."""
    pronostico_resultado = registro.get("pronostico_resultado") or registro.get("resultado_estimado")
    signo_pronosticado = registro.get("pronostico_signo") or obtener_signo(pronostico_resultado)
    signo_real = obtener_signo(registro.get("resultado_real"))

    if signo_pronosticado and signo_real:
        acertado = signo_pronosticado == signo_real
    else:
        # Mantener compatibilidad con datos que ya indiquen 'acertado'
        acertado = bool(registro.get("acertado"))

    return {
        "acertado": acertado,
        "signo_pronosticado": signo_pronosticado,
        "signo_resultado": signo_real,
        "pronostico_resultado": pronostico_resultado,
    }


def normalizar_registro(registro: Dict[str, Any], jornada_por_cli: int | None) -> Dict[str, Any]:
    if "resultado_real" not in registro:
        raise ValueError("Cada registro debe incluir 'resultado_real' (ej. '2-1').")

    jornada = registro.get("jornada") or jornada_por_cli
    if jornada is None:
        raise ValueError("Indica la jornada en el JSON o mediante --jornada.")

    evaluacion = evaluar_acierto_quiniela(registro)
    beneficio = float(registro.get("beneficio", 0))
    timestamp = datetime.utcnow().isoformat(timespec="seconds") + "Z"

    return {
        "id": registro.get("match_id") or f"j{jornada}-{timestamp}",
        "jornada": jornada,
        "match_id": registro.get("match_id"),
        "fecha_partido": registro.get("fecha_partido"),
        "local": registro.get("local"),
        "visitante": registro.get("visitante"),
        "pronostico": registro.get("pronostico"),
        "pronostico_resultado": evaluacion["pronostico_resultado"],
        "signo_pronosticado": evaluacion["signo_pronosticado"],
        "resultado_real": registro["resultado_real"],
        "signo_resultado": evaluacion["signo_resultado"],
        "acertado": evaluacion["acertado"],
        "beneficio": beneficio,
        "comentario": registro.get("comentario"),
        "timestamp": timestamp,
    }


def cargar_nuevos_registros(path: Path) -> List[Dict[str, Any]]:
    if not path.exists():
        raise FileNotFoundError(
            f"No se encontró el archivo de entrada {path}. Crea el JSON con los resultados de la jornada."
        )

    payload = load_json(path)
    if not payload:
        raise ValueError("El archivo de entrada está vacío.")

    if isinstance(payload, dict) and "resultados" in payload:
        registros = payload["resultados"]
    elif isinstance(payload, list):
        registros = payload
    else:
        raise ValueError("El formato del archivo debe ser lista o incluir la clave 'resultados'.")

    if not isinstance(registros, list) or not registros:
        raise ValueError("No hay resultados para procesar.")
    return registros


def actualizar_resumen(historial: Dict[str, Any], nuevos: List[Dict[str, Any]]) -> None:
    resumen = historial.setdefault("resumen", DEFAULT_DATA["resumen"].copy())
    for registro in nuevos:
        resumen["partidosAnalizados"] += 1
        if registro["acertado"]:
            resumen["aciertos"] += 1
        else:
            resumen["errores"] += 1
        resumen["beneficio"] = round(resumen.get("beneficio", 0) + registro["beneficio"], 2)


def main() -> None:
    args = parse_args()

    historial = load_json(HISTORIAL_PATH, default=DEFAULT_DATA)
    if "historial" not in historial:
        historial = DEFAULT_DATA.copy()

    registros_raw = cargar_nuevos_registros(args.source)
    nuevos_registros: List[Dict[str, Any]] = []

    for registro in registros_raw:
        normalizado = normalizar_registro(registro, args.jornada)
        nuevos_registros.append(normalizado)

    historial.setdefault("historial", []).extend(nuevos_registros)
    actualizar_resumen(historial, nuevos_registros)
    save_json(historial, HISTORIAL_PATH)

    if args.clear_source:
        save_json([], args.source)

    print(f"✅ {len(nuevos_registros)} registros añadidos a {HISTORIAL_PATH.relative_to(BASE_DIR)}")
    print(
        "Resumen actual:"
        f" Analizados={historial['resumen']['partidosAnalizados']} |"
        f" Aciertos={historial['resumen']['aciertos']} |"
        f" Errores={historial['resumen']['errores']} |"
        f" Beneficio={historial['resumen']['beneficio']}%"
    )


if __name__ == "__main__":
    main()
