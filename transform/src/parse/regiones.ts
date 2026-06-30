/**
 * Only `regiones.csv` is loaded. `id_especial2` is slugified at transform time for stable i18n keys
 * (see `slugifyTypologyLabel`); display labels are resolved by consumers via locale-specific i18n.
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
