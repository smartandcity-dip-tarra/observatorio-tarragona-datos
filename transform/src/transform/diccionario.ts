import type { DiccionarioRecord } from '../parse/index.js';

export interface DiccionarioRow {
  id_dict: string;
  nivel: number;
  agenda: string;
  logo: string | null;
}

export interface DiccionarioEsRow {
  id_dict: string;
  nombre: string | null;
  descripcion: string | null;
}

/** Same columns as `DICCIONARIO_ES`; populated from `diccionario_cat.csv`. */
export type DiccionarioCatRow = DiccionarioEsRow;

const SUPPORTED_AGENDAS: ReadonlySet<string> = new Set(['2030', 'TARRAGONA']);

export function transformDiccionario(records: DiccionarioRecord[]): {
  diccionario: DiccionarioRow[];
  diccionarioEs: DiccionarioEsRow[];
} {
  const dictMap = new Map<string, DiccionarioRow>();
  const esMap = new Map<string, DiccionarioEsRow>();
  const skippedAgendas = new Map<string, number>();

  for (const r of records) {
    if (!SUPPORTED_AGENDAS.has(r.agenda)) {
      skippedAgendas.set(r.agenda, (skippedAgendas.get(r.agenda) ?? 0) + 1);
      continue;
    }
    const id_dict = `${r.agenda}-${r.dimension}`;

    if (dictMap.has(id_dict)) {
      console.error(`Warning: duplicate diccionario entry "${id_dict}", keeping first occurrence`);
      continue;
    }

    dictMap.set(id_dict, {
      id_dict,
      nivel: r.nivel,
      agenda: r.agenda,
      logo: r.logo,
    });

    esMap.set(id_dict, {
      id_dict,
      nombre: r.nombre,
      descripcion: r.detalle,
    });
  }

  if (skippedAgendas.size > 0) {
    const detail = [...skippedAgendas.entries()]
      .map(([agenda, count]) => `${agenda} (${count})`)
      .join(', ');
    console.log(`  DICCIONARIO: skipped ${detail} — agenda not supported in the Tarragona pipeline`);
  }

  return {
    diccionario: Array.from(dictMap.values()),
    diccionarioEs: Array.from(esMap.values()),
  };
}

export function transformDiccionarioCat(
  records: DiccionarioRecord[],
  esIds: Set<string>,
): { rows: DiccionarioCatRow[]; warnings: { droppedUnknownIds: string[] } } {
  const rowMap = new Map<string, DiccionarioCatRow>();
  const droppedUnknownIds: string[] = [];

  for (const r of records) {
    if (!SUPPORTED_AGENDAS.has(r.agenda)) {
      continue;
    }
    const id_dict = `${r.agenda}-${r.dimension}`;
    if (!esIds.has(id_dict)) {
      droppedUnknownIds.push(id_dict);
      continue;
    }
    if (!rowMap.has(id_dict)) {
      rowMap.set(id_dict, {
        id_dict,
        nombre: r.nombre,
        descripcion: r.detalle,
      });
    }
  }

  return { rows: Array.from(rowMap.values()), warnings: { droppedUnknownIds } };
}
