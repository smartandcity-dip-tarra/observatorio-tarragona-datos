import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parse as csvParseSync } from 'csv-parse/sync';
import type { TestResult } from '../runner.js';
import { isKnownFormulaCat, isKnownFormulaEs } from '../../transform/direction.js';
import { semanticClaseKey } from '../../transform/metadata.js';

const SUPPORTED_AGENDAS = new Set(['2030', 'TARRAGONA']);

function parseCsv<T extends Record<string, string>>(filePath: string): T[] {
  const content = readFileSync(filePath, 'utf8').replace(/^\uFEFF/, '');
  return csvParseSync(content, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    bom: true,
    relax_quotes: true,
    relax_column_count: true,
  }) as T[];
}

/** Catalan alignment checks — never fail the pipeline; only `warn` or `pass`. */
export function runCatalanChecks(inputDir: string): TestResult[] {
  const metaCatPath = join(inputDir, 'metadatos_agendas_cat.csv');
  const dicCatPath = join(inputDir, 'diccionario_cat.csv');
  const metaEsPath = join(inputDir, 'metadatos_agendas.csv');
  const dicEsPath = join(inputDir, 'diccionario.csv');

  if (!existsSync(metaCatPath) || !existsSync(dicCatPath)) {
    return [
      {
        id: 'catalan-csv-alignment',
        description:
          'Catalan CSV alignment (metadatos_agendas_cat / diccionario_cat vs Spanish sources)',
        status: 'pass',
        details:
          'Optional CAT files missing — skipping alignment checks (transform emits its own [catalan] WARN).',
      },
    ];
  }

  const lines: string[] = [];

  try {
    const metaEs = parseCsv<{ indicador: string; clase: string; formula?: string }>(metaEsPath);
    const metaCat = parseCsv<{ indicador: string; clase: string; formula?: string }>(metaCatPath);
    const esIds = new Set(metaEs.map(r => r.indicador.trim()).filter(Boolean));
    const catById = new Map(metaCat.map(r => [r.indicador.trim(), r]));

    for (const row of metaCat) {
      const id = row.indicador?.trim();
      if (!id) continue;
      if (!esIds.has(id)) {
        lines.push(`CAT indicator "${id}" has no row in metadatos_agendas.csv`);
      }
    }

    for (const row of metaEs) {
      const id = row.indicador?.trim();
      if (!id) continue;
      if (!catById.has(id)) {
        lines.push(`ES indicator "${id}" has no row in metadatos_agendas_cat.csv`);
      } else {
        const cat = catById.get(id)!;
        if (semanticClaseKey(cat.clase) !== semanticClaseKey(row.clase)) {
          lines.push(
            `Indicator "${id}": clase semantic mismatch (ES: ${row.clase}, CAT: ${cat.clase})`,
          );
        }
      }
    }

    for (const row of metaEs) {
      const f = row.formula?.trim();
      if (f && !isKnownFormulaEs(f)) {
        lines.push(`ES indicator "${row.indicador}": unknown formula sentinel`);
      }
    }

    for (const row of metaCat) {
      const f = row.formula?.trim();
      if (f && !isKnownFormulaCat(f)) {
        lines.push(`CAT indicator "${row.indicador}": unknown formula sentinel`);
      }
    }

    const dicEs = parseCsv<{ agenda: string; nivel: string; dimension: string }>(dicEsPath);
    const esDictIds = new Set<string>();
    for (const row of dicEs) {
      const agenda = row.agenda?.trim();
      if (!SUPPORTED_AGENDAS.has(agenda ?? '')) continue;
      const dim = row.dimension?.trim();
      if (!dim) continue;
      esDictIds.add(`${agenda}-${dim}`);
    }

    const dicCat = parseCsv<{ agenda: string; dimension: string }>(dicCatPath);
    for (const row of dicCat) {
      const agenda = row.agenda?.trim();
      if (!SUPPORTED_AGENDAS.has(agenda ?? '')) continue;
      const dim = row.dimension?.trim();
      if (!dim) continue;
      const idDict = `${agenda}-${dim}`;
      if (!esDictIds.has(idDict)) {
        lines.push(`CAT diccionario id_dict "${idDict}" not found in diccionario.csv`);
      }
    }
  } catch (err) {
    return [
      {
        id: 'catalan-csv-alignment',
        description:
          'Catalan CSV alignment (metadatos_agendas_cat / diccionario_cat vs Spanish sources)',
        status: 'warn',
        details: `Could not complete checks: ${(err as Error).message}`,
      },
    ];
  }

  const status: TestResult['status'] = lines.length > 0 ? 'warn' : 'pass';
  return [
    {
      id: 'catalan-csv-alignment',
      description:
        'Catalan CSV alignment (metadatos_agendas_cat / diccionario_cat vs Spanish sources)',
      status,
      details:
        lines.length === 0
          ? 'All alignment checks passed.'
          : `${lines.length} note(s):\n${lines.slice(0, 80).join('\n')}${lines.length > 80 ? '\n…' : ''}`,
    },
  ];
}
