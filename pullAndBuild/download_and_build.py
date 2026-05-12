"""
download_and_build.py
=====================
Descarga cada hoja del spreadsheet de Google Sheets (privado) como CSV
a la carpeta `dataset/` y luego calcula los tres archivos de agregados.

Uso:
    python pullAndBuild/download_and_build.py

Credenciales:
    Opción A (local):      coloca credentials.json junto a este archivo
    Opción B (CI/CD):      define la variable de entorno GOOGLE_CREDENTIALS_JSON
                           con el contenido JSON de la service account
"""

import io
import json
import os
import re
import sys
from pathlib import Path

import gspread
import pandas as pd
from google.oauth2.service_account import Credentials

# ============================================================
# CONFIGURACIÓN — ajusta los nombres de hoja si es necesario
# ============================================================

SPREADSHEET_ID = "1WmCDT509dAG4YAIeAnLH9GYiEWB2KnSac3mg-XEcEn8"

# Clave: nombre exacto de la pestaña en Google Sheets
# Valor: nombre del archivo CSV que se guardará en dataset/
SHEETS = {
    # regiones_cat is downloaded for upcoming frontend i18n (id_especial2); not ingested by transform.
    "regiones":             "regiones.csv",
    "indicadores_agendas":  "indicadores_agendas.csv",
    "descriptivos":         "descriptivos.csv",
    "diccionario":          "diccionario.csv",
    "metadatos_agendas":    "metadatos_agendas.csv",
    "rangos_descriptivos":  "rangos_descriptivos.csv",
    "umbrales":             "umbrales.csv",
    "regiones_cat":         "regiones_cat.csv",
    "diccionario_cat":      "diccionario_cat.csv",
    "diccionario_en":      "diccionario_en.csv",
    "metadatos_agendas_cat": "metadatos_agendas_cat.csv",
    "metadatos_agendas_en": "metadatos_agendas_en.csv",
    "proyectos":            "proyectos.csv",
}

DATASET_DIR   = Path(__file__).parent.parent / "dataset"
CREDENTIALS   = Path(__file__).parent / "credentials.json"

SCOPES = ["https://www.googleapis.com/auth/spreadsheets.readonly"]
# ============================================================


# ------------------------------------------------------------
# Autenticación
# ------------------------------------------------------------
def get_credentials() -> Credentials:
    env_json = os.environ.get("GOOGLE_CREDENTIALS_JSON")
    if env_json:
        info = json.loads(env_json)
        return Credentials.from_service_account_info(info, scopes=SCOPES)
    if CREDENTIALS.exists():
        return Credentials.from_service_account_file(str(CREDENTIALS), scopes=SCOPES)
    raise FileNotFoundError(
        "No se encontraron credenciales.\n"
        "  · Coloca credentials.json junto a este script, o\n"
        "  · Define la variable de entorno GOOGLE_CREDENTIALS_JSON"
    )


# ------------------------------------------------------------
# Descarga
# ------------------------------------------------------------
def download_sheets() -> dict[str, bytes]:
    """Devuelve {nombre_csv: bytes_csv} para cada hoja configurada."""
    print("🔐 Autenticando con Google Sheets API...")
    creds  = get_credentials()
    client = gspread.authorize(creds)

    print(f"📊 Abriendo spreadsheet {SPREADSHEET_ID}...")
    spreadsheet = client.open_by_key(SPREADSHEET_ID)

    raws: dict[str, bytes] = {}
    for sheet_name, csv_name in SHEETS.items():
        try:
            ws   = spreadsheet.worksheet(sheet_name)
            rows = ws.get_all_values()
            if not rows:
                print(f"   ⚠  Hoja vacía, se omite: {sheet_name!r}")
                continue
            df  = pd.DataFrame(rows[1:], columns=rows[0])
            buf = io.StringIO()
            df.to_csv(buf, index=False)
            raws[csv_name] = buf.getvalue().encode("utf-8")
            print(f"   ✔ Descargada: {sheet_name!r} → {csv_name}  ({len(df)} filas)")
        except gspread.WorksheetNotFound:
            print(f"   ⚠  Hoja no encontrada en el spreadsheet: {sheet_name!r}")

    return raws


def save_to_dataset(raws: dict[str, bytes]) -> None:
    DATASET_DIR.mkdir(parents=True, exist_ok=True)
    for csv_name, data in raws.items():
        dest = DATASET_DIR / csv_name
        dest.write_bytes(data)
        print(f"   💾 Guardado: dataset/{csv_name}")


# ------------------------------------------------------------
# Helpers de cálculo (misma lógica que exportador_agendas.py)
# ------------------------------------------------------------
def norm(s: str) -> str:
    return re.sub(r"\s+", "", str(s).strip().lower())


def pick_col(df, candidates, contains=True):
    cols  = list(df.columns)
    ncols = [norm(c) for c in cols]
    for cand in candidates:
        nc = norm(cand)
        for c, nc_c in zip(cols, ncols):
            if contains     and nc in nc_c: return c
            if not contains and nc == nc_c: return c
    return None


def explode_semicolon(df, id_col, list_col, new_col):
    x = df[[id_col, list_col]].copy()
    x = x.dropna(subset=[list_col])
    x[list_col] = x[list_col].astype(str).str.replace(" ", "", regex=False)
    x[new_col]  = x[list_col].str.split(";")
    x = x.explode(new_col)
    x[new_col] = x[new_col].astype(str).str.strip()
    x = x[(x[new_col] != "") & (x[new_col].str.lower() != "nan")]
    return x[[id_col, new_col]].drop_duplicates()


# ------------------------------------------------------------
# Cálculo de agregados
# ------------------------------------------------------------
def compute_agregados(raws: dict[str, bytes]) -> None:
    if "indicadores_agendas.csv" not in raws:
        raise FileNotFoundError("❌ 'indicadores_agendas.csv' no disponible.")
    if "metadatos_agendas.csv" not in raws:
        raise FileNotFoundError("❌ 'metadatos_agendas.csv' no disponible.")

    ind  = pd.read_csv(io.BytesIO(raws["indicadores_agendas.csv"]), dtype=str)
    meta = pd.read_csv(io.BytesIO(raws["metadatos_agendas.csv"]),   dtype=str)

    print("\n  indicadores_agendas columns :", list(ind.columns))
    print("  metadatos_agendas   columns :", list(meta.columns))

    # --- Detectar columnas ---
    COL_IND  = pick_col(ind,  ["indicador"],                                              contains=True)
    COL_INE  = pick_col(ind,  ["codigo_ine","cod_ine","ine","código_ine"],                contains=True)
    COL_PER  = pick_col(ind,  ["periodo","anio","año","year"],                            contains=True)
    COL_IDX  = pick_col(ind,  ["indice","índice","index"],                                contains=True)

    META_IND = pick_col(meta, ["indicador"],                                              contains=True)
    # Tarragona Línea Estratégica (Level 1) column. Must match exactly `le`
    # to avoid substring-drift to legacy `aue1` (which would silently produce
    # promedios keyed by the old AUE 1..10 taxonomy instead of LE 1..6).
    COL_LE   = pick_col(meta, ["le"],                                                     contains=False)
    COL_ODS  = pick_col(meta, ["meta_ods","metaods","meta","ods"],                        contains=True)

    missing = [name for name, col in [
        ("COL_IND",  COL_IND),  ("COL_INE", COL_INE), ("COL_PER", COL_PER), ("COL_IDX", COL_IDX),
        ("META_IND", META_IND), ("COL_LE",  COL_LE),  ("COL_ODS", COL_ODS),
    ] if col is None]

    if missing:
        # Integrity guard: if `le` is missing we must NOT fall back silently to
        # `aue1`, because that would produce promedios keyed by the legacy AUE
        # taxonomy (1..10) while the rest of the pipeline expects Tarragona LE
        # ids (1..6). Fail loudly instead.
        legacy_present = any(
            norm(c) in ("aue1", "aue2", "objetivo_aue", "aue")
            for c in meta.columns
        )
        hint = (
            "\n   · Se detectaron columnas legacy (aue1/aue2). A partir de la"
            " migración a Tarragona se requiere la columna `le` en"
            " metadatos_agendas.csv; no se aceptará `aue1` como sustituto."
            if legacy_present and "COL_LE" in missing
            else ""
        )
        raise ValueError(
            f"❌ No se encontraron las columnas: {missing}\n"
            "Revisa los nombres reales arriba y ajusta pick_col si es necesario."
            + hint
        )

    print("\n✅ Columnas detectadas:")
    print("  ind  :", {"indicador": COL_IND, "codigo_ine": COL_INE, "periodo": COL_PER, "indice": COL_IDX})
    print("  meta :", {"indicador": META_IND, "le": COL_LE, "meta_ods": COL_ODS})

    # --- Limpiar y convertir tipos ---
    ind[COL_IND]   = ind[COL_IND].astype(str).str.strip()
    ind[COL_INE]   = ind[COL_INE].astype(str).str.strip()
    meta[META_IND] = meta[META_IND].astype(str).str.strip()

    ind[COL_PER] = pd.to_numeric(ind[COL_PER], errors="coerce")
    ind[COL_IDX] = pd.to_numeric(ind[COL_IDX], errors="coerce")

    # --- Último valor por municipio + indicador (periodo máximo) ---
    latest = (
        ind.dropna(subset=[COL_INE, COL_IND, COL_PER, COL_IDX])
           .sort_values([COL_INE, COL_IND, COL_PER])
           .groupby([COL_INE, COL_IND], as_index=False)
           .tail(1)
           [[COL_INE, COL_IND, COL_PER, COL_IDX]]
           .rename(columns={COL_PER: "periodo_latest", COL_IDX: "indice_latest"})
    )

    # --- Explosión de relaciones múltiples (separador ";") ---
    # El nombre interno de la columna de salida se mantiene como
    # `objetivo_aue` por compatibilidad aguas abajo (el transform Node y el
    # frontend siguen leyendo ese nombre), aunque el contenido ya son ids de
    # Línea Estratégica Tarragona (1..6) extraídos de la columna `le`.
    le_long  = explode_semicolon(meta, META_IND, COL_LE,  "objetivo_aue")
    ods_long = explode_semicolon(meta, META_IND, COL_ODS, "meta_ods")

    # --- Integrity check: LE ids deben estar en 1..6 ---
    le_values = set(le_long["objetivo_aue"].astype(str))
    invalid_le = {v for v in le_values if not (v.isdigit() and 1 <= int(v) <= 6)}
    if invalid_le:
        raise ValueError(
            f"❌ Valores inválidos en la columna `le` de metadatos_agendas.csv: {sorted(invalid_le)}.\n"
            "   Se esperan ids de Línea Estratégica Tarragona en el rango 1..6."
        )

    # --- Promedios por municipio × Línea Estratégica (LE) ---
    aue_muni_avg = (
        latest.merge(le_long, left_on=COL_IND, right_on=META_IND, how="inner")
              .groupby([COL_INE, "objetivo_aue"], as_index=False)
              .agg(
                  promedio_indice = ("indice_latest",  "mean"),
                  n_indicadores   = (COL_IND,          "nunique"),
                  periodo_max     = ("periodo_latest",  "max"),
              )
              .sort_values([COL_INE, "objetivo_aue"])
    )

    # --- Promedios por municipio × meta ODS ---
    ods_meta_muni_avg = (
        latest.merge(ods_long, left_on=COL_IND, right_on=META_IND, how="inner")
              .groupby([COL_INE, "meta_ods"], as_index=False)
              .agg(
                  promedio_indice = ("indice_latest",  "mean"),
                  n_indicadores   = (COL_IND,          "nunique"),
                  periodo_max     = ("periodo_latest",  "max"),
              )
              .sort_values([COL_INE, "meta_ods"])
    )

    # --- Agregar metas → ODS objetivo (por municipio) ---
    ods_meta_muni_avg["ods_objetivo"] = (
        ods_meta_muni_avg["meta_ods"].astype(str).str.split(".").str[0]
    )

    ods_obj_muni_avg = (
        ods_meta_muni_avg.groupby([COL_INE, "ods_objetivo"], as_index=False)
                         .agg(
                             promedio_metas = ("promedio_indice", "mean"),
                             n_metas        = ("meta_ods",        "nunique"),
                         )
                         .sort_values([COL_INE, "ods_objetivo"])
    )

    # --- Guardar agregados ---
    agregados = {
        "promedios_municipio_objetivo_aue.csv" : aue_muni_avg,
        "promedios_municipio_meta_ods.csv"     : ods_meta_muni_avg,
        "promedios_municipio_ods_objetivo.csv" : ods_obj_muni_avg,
    }

    DATASET_DIR.mkdir(parents=True, exist_ok=True)
    for csv_name, df in agregados.items():
        dest = DATASET_DIR / csv_name
        df.to_csv(dest, index=False)
        print(f"   💾 Guardado: dataset/{csv_name}  ({len(df)} filas)")


# ------------------------------------------------------------
# Punto de entrada
# ------------------------------------------------------------
def main() -> None:
    print("=" * 60)
    print(" download_and_build.py")
    print("=" * 60)

    print("\n📥 PASO 1: Descargando hojas de Google Sheets...")
    raws = download_sheets()

    if not raws:
        print("❌ No se descargó ninguna hoja. Revisa la configuración.")
        sys.exit(1)

    print("\n💾 PASO 2: Guardando CSVs en dataset/...")
    save_to_dataset(raws)

    print("\n🔢 PASO 3: Calculando agregados...")
    compute_agregados(raws)

    total_orig = len(raws)
    total_agr  = 3
    print(f"\n✅ Proceso completado.")
    print(f"   Archivos originales guardados : {total_orig}")
    print(f"   Archivos de agregados         : {total_agr}")
    print(f"   Destino                       : {DATASET_DIR.resolve()}")


if __name__ == "__main__":
    main()
