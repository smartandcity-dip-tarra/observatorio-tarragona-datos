import { existsSync } from 'node:fs';
import { join as pathJoin } from 'node:path';
import { readCsv, toNullable } from './csv-utils.js';
import type { DiccionarioRecord } from './diccionario.js';

const FILENAME = 'diccionario_en.csv';

export function parseDiccionarioEn(inputDir: string): DiccionarioRecord[] {
  const path = pathJoin(inputDir, FILENAME);
  if (!existsSync(path)) {
    console.warn(
      `[english] WARN: dataset/${FILENAME} not found — English tables left empty`,
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
