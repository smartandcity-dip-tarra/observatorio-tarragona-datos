import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { readCsv, toNullable } from './csv-utils.js';

export interface MetadataCatRecord {
  indicador: string;
  clase: string;
  nombre: string | null;
  detalle: string | null;
  unidad: string | null;
  formula: string | null;
}

const FILENAME = 'metadatos_agendas_cat.csv';

export function parseMetadataCat(inputDir: string): MetadataCatRecord[] {
  const path = join(inputDir, FILENAME);
  if (!existsSync(path)) {
    console.warn(
      `[catalan] WARN: dataset/${FILENAME} not found — Catalan tables left empty`,
    );
    return [];
  }
  const rows = readCsv(inputDir, FILENAME);
  return rows.map(row => ({
    indicador: String(row.indicador),
    clase: String(row.clase ?? ''),
    nombre: toNullable(row.nombre),
    detalle: toNullable(row.detalle),
    unidad: toNullable(row.unidad),
    formula: toNullable(row.formula),
  }));
}
