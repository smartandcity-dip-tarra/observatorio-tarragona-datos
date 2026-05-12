import type { ParsedData, ProyectoRecord, RegionRecord } from '../parse/index.js';
import {
  transformMetadata,
  transformMetadataCat,
  transformMetadataEn,
  type MetadataRow,
  type MetadataEsRow,
  type MetadataCatRow,
  type MetadataEnRow,
} from './metadata.js';
import { extractArquitecturaL2, type ArquitecturaL2Row } from './arquitectura.js';
import {
  transformDiccionario,
  transformDiccionarioCat,
  transformDiccionarioEn,
  type DiccionarioRow,
  type DiccionarioEsRow,
  type DiccionarioCatRow,
  type DiccionarioEnRow,
} from './diccionario.js';
import { mapIndicadores, transformDescriptivos, type IndicadorRow, type DescriptivoRow } from './indicadores.js';
import { transformPromedios, type PromedioOdsRow, type PromedioAgendaRow } from './promedios.js';
import { transformRegionesIdEspecial2Slugs } from './regionesSlug.js';

function assertUniqueProyectoCodigos(rows: ProyectoRecord[]): void {
  const counts = new Map<string, number>();
  for (const r of rows) {
    const c = r.codigo.trim();
    if (c === '') continue;
    counts.set(c, (counts.get(c) ?? 0) + 1);
  }
  const dups = [...counts.entries()]
    .filter(([, n]) => n > 1)
    .map(([c]) => c)
    .sort();
  if (dups.length > 0) {
    throw new Error(`proyectos.csv: duplicate codigo values: ${dups.join(', ')}`);
  }
}

export interface TransformedData {
  regiones: RegionRecord[];
  metadata: MetadataRow[];
  metadataEs: MetadataEsRow[];
  metadataCat: MetadataCatRow[];
  metadataEn: MetadataEnRow[];
  diccionario: DiccionarioRow[];
  diccionarioEs: DiccionarioEsRow[];
  diccionarioCat: DiccionarioCatRow[];
  diccionarioEn: DiccionarioEnRow[];
  arquitecturaL2: ArquitecturaL2Row[];
  indicadores: IndicadorRow[];
  indicadoresDescriptivos: DescriptivoRow[];
  promediosOds: PromedioOdsRow[];
  promediosAgendas: PromedioAgendaRow[];
  proyectos: ProyectoRecord[];
}

export function transformAll(data: ParsedData): TransformedData {
  console.log('Transforming data...');

  assertUniqueProyectoCodigos(data.proyectos);

  const esByIndicador = new Map(data.metadata.map(r => [r.indicador, r]));

  const { metadata, metadataEs, unknownFormulaSentinels } = transformMetadata(data.metadata);
  console.log(`  METADATA: ${metadata.length} rows`);
  console.log(`  METADATA_ES: ${metadataEs.length} rows`);

  for (const { id_indicador, text } of unknownFormulaSentinels) {
    console.warn(
      `[catalan] WARN: unknown formula sentinel "${text}" for indicator ${id_indicador} — direction = NULL`,
    );
  }

  const { diccionario, diccionarioEs } = transformDiccionario(data.diccionario);
  console.log(`  DICCIONARIO: ${diccionario.length} rows`);
  console.log(`  DICCIONARIO_ES: ${diccionarioEs.length} rows`);

  const dictIds = new Set(diccionario.map(d => d.id_dict));

  const { rows: diccionarioCat, warnings: dicCatWarn } = transformDiccionarioCat(
    data.diccionarioCat,
    dictIds,
  );
  const droppedDicUnique = [...new Set(dicCatWarn.droppedUnknownIds)];
  for (const id of droppedDicUnique) {
    console.warn(`[catalan] WARN: dropping CAT diccionario translation for unknown id_dict ${id}`);
  }

  const {
    rows: metadataCat,
    warnings: metaCatWarn,
  } = transformMetadataCat(data.metadataCat, esByIndicador);

  const droppedMetaUnique = [...new Set(metaCatWarn.droppedUnknownIds)];
  for (const id of droppedMetaUnique) {
    console.warn(`[catalan] WARN: dropping CAT translation for unknown id ${id}`);
  }
  for (const id of metaCatWarn.missingTranslations) {
    console.warn(`[catalan] WARN: missing CAT translation for ${id}`);
  }
  for (const { id, text } of metaCatWarn.unknownCatFormulas) {
    console.warn(`[catalan] WARN: unknown CAT formula sentinel "${text}" for indicator ${id}`);
  }
  for (const { id, claseCat, claseEs } of metaCatWarn.claseMismatch) {
    console.warn(
      `[catalan] WARN: CAT clase introduces unknown tipo mismatch for indicator ${id} (CAT: ${claseCat}, ES: ${claseEs})`,
    );
  }

  const directionMapped = metadata.filter(m => m.direction != null).length;
  const directionUnknown = metadata.length - directionMapped;

  console.log(
    `[catalan] METADATA_CAT: ${metadataCat.length} loaded, ${droppedMetaUnique.length} dropped, ${metaCatWarn.missingTranslations.length} missing — DICCIONARIO_CAT: ${diccionarioCat.length} loaded, ${droppedDicUnique.length} dropped — direction: ${directionMapped} mapped, ${directionUnknown} unknown (NULL)`,
  );

  const { rows: diccionarioEn, warnings: dicEnWarn } = transformDiccionarioEn(
    data.diccionarioEn,
    dictIds,
  );
  const droppedDicEnUnique = [...new Set(dicEnWarn.droppedUnknownIds)];
  for (const id of droppedDicEnUnique) {
    console.warn(`[english] WARN: dropping EN diccionario translation for unknown id_dict ${id}`);
  }

  const {
    rows: metadataEn,
    warnings: metaEnWarn,
  } = transformMetadataEn(data.metadataEn, esByIndicador);

  const droppedMetaEnUnique = [...new Set(metaEnWarn.droppedUnknownIds)];
  for (const id of droppedMetaEnUnique) {
    console.warn(`[english] WARN: dropping EN translation for unknown id ${id}`);
  }
  for (const id of metaEnWarn.missingTranslations) {
    console.warn(`[english] WARN: missing EN translation for ${id}`);
  }
  for (const { id, text } of metaEnWarn.unknownEnFormulas) {
    console.warn(`[english] WARN: unknown EN formula sentinel "${text}" for indicator ${id}`);
  }
  for (const { id, claseEn, claseEs } of metaEnWarn.claseMismatch) {
    console.warn(
      `[english] WARN: EN clase introduces unknown tipo mismatch for indicator ${id} (EN: ${claseEn}, ES: ${claseEs})`,
    );
  }

  console.log(
    `[english] METADATA_EN: ${metadataEn.length} loaded, ${droppedMetaEnUnique.length} dropped, ${metaEnWarn.missingTranslations.length} missing — DICCIONARIO_EN: ${diccionarioEn.length} loaded, ${droppedDicEnUnique.length} dropped`,
  );

  const metaIds = new Set(metadata.map(m => m.id_indicador));
  const rawArquitectura = extractArquitecturaL2(data.metadata);
  const arquitecturaL2 = rawArquitectura.filter(row => {
    if (!dictIds.has(row.parent)) {
      console.error(`Warning: ARQUITECTURA_L2 parent "${row.parent}" not found in DICCIONARIO, skipping (child: ${row.child})`);
      return false;
    }
    if (!metaIds.has(row.child)) {
      console.error(`Warning: ARQUITECTURA_L2 child "${row.child}" not found in METADATA, skipping (parent: ${row.parent})`);
      return false;
    }
    return true;
  });
  if (rawArquitectura.length !== arquitecturaL2.length) {
    console.log(`  ARQUITECTURA_L2: ${arquitecturaL2.length} rows (${rawArquitectura.length - arquitecturaL2.length} skipped — missing FK references)`);
  } else {
    console.log(`  ARQUITECTURA_L2: ${arquitecturaL2.length} rows`);
  }

  const { indicadores, skipped } = mapIndicadores(data.indicadoresAgendas, data.metadata);
  console.log(`  INDICADORES: ${indicadores.length} rows`);
  if (skipped > 0) {
    console.log(`  (${skipped} indicator rows skipped — missing metadata)`);
  }

  const descriptivos = transformDescriptivos(data.descriptivos);
  console.log(`  INDICADORES_DESCRIPTIVOS: ${descriptivos.length} rows`);

  const { promediosOds, promediosAgendas: rawPromediosAgendas } = transformPromedios(
    data.promediosMetaOds,
    data.promediosOdsObjetivo,
    data.promediosObjetivoAue,
  );
  console.log(`  PROMEDIOS_ODS: ${promediosOds.length} rows`);

  const skippedPromedios = new Map<string, number>();
  const promediosAgendas = rawPromediosAgendas.filter(row => {
    if (!dictIds.has(row.id_dict)) {
      skippedPromedios.set(row.id_dict, (skippedPromedios.get(row.id_dict) ?? 0) + 1);
      return false;
    }
    return true;
  });
  if (skippedPromedios.size > 0) {
    const detail = [...skippedPromedios.entries()]
      .map(([k, n]) => `${k} (${n})`)
      .join(', ');
    console.log(
      `  PROMEDIOS_AGENDAS: ${promediosAgendas.length} rows (${rawPromediosAgendas.length - promediosAgendas.length} skipped — unknown id_dict: ${detail})`,
    );
  } else {
    console.log(`  PROMEDIOS_AGENDAS: ${promediosAgendas.length} rows`);
  }

  const regiones = transformRegionesIdEspecial2Slugs(data.regiones);

  console.log(`  METADATA_CAT: ${metadataCat.length} rows`);
  console.log(`  DICCIONARIO_CAT: ${diccionarioCat.length} rows`);
  console.log(`  METADATA_EN: ${metadataEn.length} rows`);
  console.log(`  DICCIONARIO_EN: ${diccionarioEn.length} rows`);
  console.log(`  PROYECTOS: ${data.proyectos.length} rows`);

  console.log('Transformation complete\n');

  return {
    regiones,
    metadata,
    metadataEs,
    metadataCat,
    metadataEn,
    diccionario,
    diccionarioEs,
    diccionarioCat,
    diccionarioEn,
    arquitecturaL2,
    indicadores,
    indicadoresDescriptivos: descriptivos,
    promediosOds,
    promediosAgendas,
    proyectos: data.proyectos,
  };
}
