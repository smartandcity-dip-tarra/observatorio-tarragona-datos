import { readCsv, toNullable } from './csv-utils.js';

export interface ProyectoRecord {
  linea: string;
  objetivo: string;
  codigo: string;
  nombre: string;
  descripcion: string | null;
}

const FILENAME = 'proyectos.csv';

export function parseProyectos(inputDir: string): ProyectoRecord[] {
  const rows = readCsv(inputDir, FILENAME);
  return rows.map(row => ({
    linea: String(row.linea ?? '').trim(),
    objetivo: String(row.objetivo ?? '').trim(),
    codigo: String(row.codigo ?? '').trim(),
    nombre: String(row.nombre ?? '').trim(),
    descripcion: toNullable(row.descripcion),
  }));
}
