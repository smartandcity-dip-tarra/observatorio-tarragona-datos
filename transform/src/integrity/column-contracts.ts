/**
 * Canonical CSV header sets for full parity checks (no extra / missing columns).
 * Keep in sync with parse + SQLite schema + loader for each file.
 */
export const CSV_HEADER_CONTRACTS: Record<string, readonly string[]> = {
  'regiones.csv': [
    'codigo_ine',
    'nombre',
    'poblacion',
    'id_poblacion',
    'id_especial',
    'id_especial2',
    'id_especial3',
  ],
  'proyectos.csv': ['linea', 'objetivo', 'codigo', 'nombre', 'descripcion', 'logro'],
} as const;
