import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { readCsv, toNullable } from './csv-utils.js';
import type { DiccionarioRecord } from './diccionario.js';

const FILENAME = 'diccionario_cat.csv';

export function parseDiccionarioCat(inputDir: string): DiccionarioRecord[] {
  const path = join(inputDir, FILENAME);
  if (!existsSync(path)) {
    console.warn(
      `[catalan] WARN: dataset/${FILENAME} not found — Catalan tables left empty`,
    );
    return [];
  }
  const rows = readCsv(inputDir, FILENAME);
  return rows.map(row => ({
    agenda: row.agenda,
    nivel: Number(row.nivel),
    dimension: String(row.dimension),
    nombre: toNullable(row.nombre),
    detalle: toNullable(row.detalle),
    logo: toNullable(row.logo),
  }));
}
