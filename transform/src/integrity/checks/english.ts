import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parse as csvParseSync } from 'csv-parse/sync';
import type { TestResult } from '../runner.js';
import { isKnownFormulaEn, isKnownFormulaEs } from '../../transform/direction.js';
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

/** English alignment checks — never fail the pipeline; only `warn` or `pass`. */
export function runEnglishChecks(inputDir: string): TestResult[] {
  const metaEnPath = join(inputDir, 'metadatos_agendas_en.csv');
  const dicEnPath = join(inputDir, 'diccionario_en.csv');
  const metaEsPath = join(inputDir, 'metadatos_agendas.csv');
  const dicEsPath = join(inputDir, 'diccionario.csv');

  if (!existsSync(metaEnPath) || !existsSync(dicEnPath)) {
    return [
      {
        id: 'english-csv-alignment',
        description:
          'English CSV alignment (metadatos_agendas_en / diccionario_en vs Spanish sources)',
        status: 'pass',
        details:
          'Optional EN files missing — skipping alignment checks (transform emits its own [english] WARN).',
      },
    ];
  }

  const lines: string[] = [];

  try {
    const metaEs = parseCsv<{ indicador: string; clase?: string; formula?: string }>(metaEsPath);
    const metaEn = parseCsv<{ indicador: string; clase?: string; formula?: string }>(metaEnPath);
    const esIds = new Set(metaEs.map(r => r.indicador?.trim()).filter(Boolean));
    const enById = new Map(metaEn.map(r => [r.indicador?.trim(), r]).filter(([id]) => !!id));

    const enHasClase = metaEn.length > 0 && 'clase' in metaEn[0];

    for (const row of metaEn) {
      const id = row.indicador?.trim();
      if (!id) continue;
      if (!esIds.has(id)) {
        lines.push(`EN indicator "${id}" has no row in metadatos_agendas.csv`);
      }
    }

    for (const row of metaEs) {
      const id = row.indicador?.trim();
      if (!id) continue;
      if (!enById.has(id)) {
        lines.push(`ES indicator "${id}" has no row in metadatos_agendas_en.csv`);
      } else if (enHasClase) {
        const en = enById.get(id)!;
        if (semanticClaseKey(en.clase) !== semanticClaseKey(row.clase)) {
          lines.push(
            `Indicator "${id}": clase semantic mismatch (ES: ${row.clase}, EN: ${en.clase})`,
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

    for (const row of metaEn) {
      const f = row.formula?.trim();
      if (f && !isKnownFormulaEn(f)) {
        lines.push(`EN indicator "${row.indicador}": unknown formula sentinel`);
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

    const dicEn = parseCsv<{ agenda: string; dimension: string }>(dicEnPath);
    for (const row of dicEn) {
      const agenda = row.agenda?.trim();
      if (!SUPPORTED_AGENDAS.has(agenda ?? '')) continue;
      const dim = row.dimension?.trim();
      if (!dim) continue;
      const idDict = `${agenda}-${dim}`;
      if (!esDictIds.has(idDict)) {
        lines.push(`EN diccionario id_dict "${idDict}" not found in diccionario.csv`);
      }
    }
  } catch (err) {
    return [
      {
        id: 'english-csv-alignment',
        description:
          'English CSV alignment (metadatos_agendas_en / diccionario_en vs Spanish sources)',
        status: 'warn',
        details: `Could not complete checks: ${(err as Error).message}`,
      },
    ];
  }

  const status: TestResult['status'] = lines.length > 0 ? 'warn' : 'pass';
  return [
    {
      id: 'english-csv-alignment',
      description:
        'English CSV alignment (metadatos_agendas_en / diccionario_en vs Spanish sources)',
      status,
      details:
        lines.length === 0
          ? 'All alignment checks passed.'
          : `${lines.length} note(s):\n${lines.slice(0, 80).join('\n')}${lines.length > 80 ? '\n…' : ''}`,
    },
  ];
}
