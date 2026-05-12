import { existsSync } from 'node:fs';
import { join as pathJoin } from 'node:path';
import { readCsv, toNullable } from './csv-utils.js';

export interface MetadataEnRecord {
  indicador: string;
  clase: string;
  nombre: string | null;
  detalle: string | null;
  unidad: string | null;
  formula: string | null;
}

const FILENAME = 'metadatos_agendas_en.csv';

export function parseMetadataEn(inputDir: string): MetadataEnRecord[] {
  const path = pathJoin(inputDir, FILENAME);
  if (!existsSync(path)) {
    console.warn(
      `[english] WARN: dataset/${FILENAME} not found — English tables left empty`,
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
