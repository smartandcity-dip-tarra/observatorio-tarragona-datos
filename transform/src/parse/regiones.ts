/**
 * Only `regiones.csv` is loaded. `regiones_cat.csv` exists in dataset/ but is intentionally ignored here —
 * translate `id_especial2` via frontend i18n (planned change `catalan-frontend-i18n-keys`).
 */
import { readCsv, toNullable } from './csv-utils.js';

export interface RegionRecord {
  codigo_ine: string;
  nombre: string;
  poblacion: number | null;
  id_poblacion: string | null;
  id_especial: string | null;
  id_especial2: string | null;
  id_especial3: string | null;
}

export function parseRegiones(inputDir: string): RegionRecord[] {
  const rows = readCsv(inputDir, 'regiones.csv');
  return rows.map(row => ({
    codigo_ine: row.codigo_ine,
    nombre: row.nombre,
    poblacion: row.poblacion ? Number(row.poblacion) : null,
    id_poblacion: toNullable(row.id_poblacion),
    id_especial: toNullable(row.id_especial),
    id_especial2: toNullable(row.id_especial2),
    id_especial3: toNullable(row.id_especial3),
  }));
}
