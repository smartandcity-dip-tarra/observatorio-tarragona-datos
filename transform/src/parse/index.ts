import { parseMetadata, type MetadataRecord } from './metadata.js';
import { parseDiccionario, type DiccionarioRecord } from './diccionario.js';
import { parseDiccionarioCat } from './diccionario-cat.js';
import { parseMetadataCat, type MetadataCatRecord } from './metadata-cat.js';
import { parseIndicadoresAgendas, type IndicadorAgendaRecord } from './indicadores.js';
import { parseDescriptivos, type DescriptivoRecord } from './descriptivos.js';
import { parseRegiones, type RegionRecord } from './regiones.js';
import { parseUmbrales, type UmbralRecord } from './umbrales.js';
import {
  parsePromediosMetaOds,
  parsePromediosObjetivoAue,
  parsePromediosOdsObjetivo,
  type PromedioMetaOdsRecord,
  type PromedioObjetivoAueRecord,
  type PromedioOdsObjetivoRecord,
} from './promedios.js';
import { parseRangosDescriptivos, type RangoDescriptivoRecord } from './rangos.js';

export interface ParsedData {
  metadata: MetadataRecord[];
  metadataCat: MetadataCatRecord[];
  diccionario: DiccionarioRecord[];
  diccionarioCat: DiccionarioRecord[];
  indicadoresAgendas: IndicadorAgendaRecord[];
  descriptivos: DescriptivoRecord[];
  regiones: RegionRecord[];
  umbrales: UmbralRecord[];
  promediosMetaOds: PromedioMetaOdsRecord[];
  promediosObjetivoAue: PromedioObjetivoAueRecord[];
  promediosOdsObjetivo: PromedioOdsObjetivoRecord[];
  rangosDescriptivos: RangoDescriptivoRecord[];
}

export function parseAll(inputDir: string): ParsedData {
  console.log(`Parsing CSV files from: ${inputDir}`);

  const metadata = parseMetadata(inputDir);
  console.log(`  metadatos_agendas.csv: ${metadata.length} records`);

  const metadataCat = parseMetadataCat(inputDir);
  console.log(`  metadatos_agendas_cat.csv: ${metadataCat.length} records`);

  const diccionario = parseDiccionario(inputDir);
  console.log(`  diccionario.csv: ${diccionario.length} records`);

  const diccionarioCat = parseDiccionarioCat(inputDir);
  console.log(`  diccionario_cat.csv: ${diccionarioCat.length} records`);

  const indicadoresAgendas = parseIndicadoresAgendas(inputDir);
  console.log(`  indicadores_agendas.csv: ${indicadoresAgendas.length} records`);

  const descriptivos = parseDescriptivos(inputDir);
  console.log(`  descriptivos.csv: ${descriptivos.length} records`);

  const regiones = parseRegiones(inputDir);
  console.log(`  regiones.csv: ${regiones.length} records`);

  const umbrales = parseUmbrales(inputDir);
  console.log(`  umbrales.csv: ${umbrales.length} records`);

  const promediosMetaOds = parsePromediosMetaOds(inputDir);
  console.log(`  promedios_municipio_meta_ods.csv: ${promediosMetaOds.length} records`);

  const promediosObjetivoAue = parsePromediosObjetivoAue(inputDir);
  console.log(`  promedios_municipio_objetivo_aue.csv: ${promediosObjetivoAue.length} records`);

  const promediosOdsObjetivo = parsePromediosOdsObjetivo(inputDir);
  console.log(`  promedios_municipio_ods_objetivo.csv: ${promediosOdsObjetivo.length} records`);

  const rangosDescriptivos = parseRangosDescriptivos(inputDir);
  console.log(`  rangos_descriptivos.csv: ${rangosDescriptivos.length} records`);

  console.log(`Parsing complete: 12 files processed\n`);

  return {
    metadata,
    metadataCat,
    diccionario,
    diccionarioCat,
    indicadoresAgendas,
    descriptivos,
    regiones,
    umbrales,
    promediosMetaOds,
    promediosObjetivoAue,
    promediosOdsObjetivo,
    rangosDescriptivos,
  };
}

export type {
  MetadataRecord,
  MetadataCatRecord,
  DiccionarioRecord,
  IndicadorAgendaRecord,
  DescriptivoRecord,
  RegionRecord,
  UmbralRecord,
  PromedioMetaOdsRecord,
  PromedioObjetivoAueRecord,
  PromedioOdsObjetivoRecord,
  RangoDescriptivoRecord,
};
