import type { MetadataRecord, MetadataCatRecord } from '../parse/index.js';
import { mapDirectionEs, mapDirectionCat } from './direction.js';

export interface MetadataRow {
  id_indicador: string;
  tipo: string;
  direction: 'asc' | 'desc' | 'neutral' | null;
  unidad: string | null;
  tipo_dato: string | null;
  formula: string | null;
  umbral_optimo: number | null;
  umbral_malo: number | null;
  fuente: string | null;
  actualizacion: string | null;
  corte_muestra: string | null;
  muestra_ods: string | null;
  muestra_aue: string | null;
}

export interface MetadataEsRow {
  id_indicador: string;
  nombre: string | null;
  descripcion: string | null;
}

export interface MetadataCatRow {
  id_indicador: string;
  nombre: string | null;
  descripcion: string | null;
  unidad: string | null;
}

export function normalizeTipo(clase: string): string {
  if (clase === 'agendas') return 'agenda';
  return clase;
}

/** Maps ES/CAT display labels to one key so translated clase strings do not false-positive as mismatches. */
const CLASE_SEMANTIC: Record<string, string> = {
  'Descriptivo AUE': 'descriptivo_aue',
  'Descriptiu AUE': 'descriptivo_aue',
  AUE: 'aue',
  'Agenda 2030': 'agenda_2030',
  'Agenda 2030 y AUE': 'agenda_2030_y_aue',
  'Agenda 2030 i AUE': 'agenda_2030_y_aue',
};

export function semanticClaseKey(clase: string): string {
  const k = clase.trim();
  return CLASE_SEMANTIC[k] ?? k;
}

export function transformMetadata(records: MetadataRecord[]): {
  metadata: MetadataRow[];
  metadataEs: MetadataEsRow[];
  unknownFormulaSentinels: { id_indicador: string; text: string }[];
} {
  const metadata: MetadataRow[] = [];
  const metadataEs: MetadataEsRow[] = [];
  const unknownFormulaSentinels: { id_indicador: string; text: string }[] = [];

  for (const r of records) {
    const direction = mapDirectionEs(r.formula);
    if (r.formula != null && r.formula.trim() !== '' && direction == null) {
      unknownFormulaSentinels.push({ id_indicador: r.indicador, text: r.formula.trim() });
    }

    metadata.push({
      id_indicador: r.indicador,
      tipo: normalizeTipo(r.clase),
      direction,
      unidad: r.unidad,
      tipo_dato: r.tipo,
      formula: r.formula,
      umbral_optimo: r.umbral_optimo,
      umbral_malo: r.umbral_malo,
      fuente: r.fuente,
      actualizacion: r.actualizacion,
      corte_muestra: r.corte_muestra,
      muestra_ods: r.muestra_ods,
      muestra_aue: r.muestra_aue,
    });

    metadataEs.push({
      id_indicador: r.indicador,
      nombre: r.nombre,
      descripcion: r.detalle,
    });
  }

  return { metadata, metadataEs, unknownFormulaSentinels };
}

export function transformMetadataCat(
  catRecords: MetadataCatRecord[],
  esByIndicador: Map<string, MetadataRecord>,
): {
  rows: MetadataCatRow[];
  warnings: {
    droppedUnknownIds: string[];
    missingTranslations: string[];
    unknownCatFormulas: { id: string; text: string }[];
    claseMismatch: { id: string; claseCat: string; claseEs: string }[];
  };
} {
  const rowMap = new Map<string, MetadataCatRow>();
  const droppedUnknownIds: string[] = [];
  const unknownCatFormulas: { id: string; text: string }[] = [];
  const claseMismatch: { id: string; claseCat: string; claseEs: string }[] = [];

  for (const r of catRecords) {
    const es = esByIndicador.get(r.indicador);
    if (!es) {
      droppedUnknownIds.push(r.indicador);
      continue;
    }

    const tipoEs = semanticClaseKey(es.clase);
    const tipoCat = semanticClaseKey(r.clase);
    if (tipoCat !== tipoEs) {
      claseMismatch.push({ id: r.indicador, claseCat: r.clase, claseEs: es.clase });
    }

    if (r.formula != null && r.formula.trim() !== '' && mapDirectionCat(r.formula) == null) {
      unknownCatFormulas.push({ id: r.indicador, text: r.formula.trim() });
    }

    let unidadCat: string | null = null;
    if (r.unidad != null && r.unidad.trim() !== '') {
      const esU = es.unidad ?? '';
      if (r.unidad.trim() !== esU.trim()) {
        unidadCat = r.unidad.trim();
      }
    }

    rowMap.set(r.indicador, {
      id_indicador: r.indicador,
      nombre: r.nombre,
      descripcion: r.detalle,
      unidad: unidadCat,
    });
  }

  const rows = Array.from(rowMap.values());
  const loadedIds = new Set(rowMap.keys());
  const missingSet = new Set<string>();

  for (const id of esByIndicador.keys()) {
    if (!loadedIds.has(id)) {
      missingSet.add(id);
      continue;
    }
    const es = esByIndicador.get(id)!;
    const catRow = rowMap.get(id);
    if (
      catRow &&
      es.nombre != null &&
      es.nombre.trim() !== '' &&
      !catRow.nombre?.trim()
    ) {
      missingSet.add(id);
    }
  }

  return {
    rows,
    warnings: {
      droppedUnknownIds,
      missingTranslations: [...missingSet],
      unknownCatFormulas,
      claseMismatch,
    },
  };
}
