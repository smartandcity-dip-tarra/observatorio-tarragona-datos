import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parse as csvParseSync } from 'csv-parse/sync';
import type { TestResult } from '../runner.js';

interface RegionRow {
  codigo_ine: string;
}

interface IndicadorRow {
  indicador: string;
  codigo_ine: string;
}

interface MetadataRow {
  indicador: string;
}

interface CodigoIneRow {
  codigo_ine: string;
}

interface PromedioLeRow {
  codigo_ine: string;
  objetivo_aue: string;
}

interface MetadataLeRow {
  indicador: string;
  le: string;
  le2: string;
}

interface DiccionarioAgendaRow {
  agenda: string;
  nivel: string;
  dimension: string;
}

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

function splitSemicolonList(raw: string | undefined): string[] {
  if (!raw) return [];
  return raw
    .split(';')
    .map((v) => v.trim())
    .filter((v) => v.length > 0);
}

function checkTarragonaOrphanReferences(
  inputDir: string,
  results: TestResult[],
): void {
  const checkId = 'data-tarragona-le-orphans';
  const description =
    'Every le / le2 value in metadatos_agendas.csv exists in diccionario.csv (agenda=TARRAGONA)';

  try {
    const metadata = parseCsv<MetadataLeRow>(join(inputDir, 'metadatos_agendas.csv'));
    const dict = parseCsv<DiccionarioAgendaRow>(join(inputDir, 'diccionario.csv'));

    const knownLevel1 = new Set<string>();
    const knownLevel2 = new Set<string>();
    for (const row of dict) {
      if (row.agenda?.trim() !== 'TARRAGONA') continue;
      const nivel = row.nivel?.trim();
      const dim = row.dimension?.trim();
      if (!dim) continue;
      if (nivel === '1') knownLevel1.add(dim);
      else if (nivel === '2') knownLevel2.add(dim);
    }

    const orphansLevel1 = new Map<string, Set<string>>();
    const orphansLevel2 = new Map<string, Set<string>>();

    for (const row of metadata) {
      const indicador = row.indicador?.trim();
      if (!indicador) continue;

      for (const dim of splitSemicolonList(row.le)) {
        if (!knownLevel1.has(dim)) {
          const set = orphansLevel1.get(dim) ?? new Set<string>();
          set.add(indicador);
          orphansLevel1.set(dim, set);
        }
      }
      for (const dim of splitSemicolonList(row.le2)) {
        if (!knownLevel2.has(dim)) {
          const set = orphansLevel2.get(dim) ?? new Set<string>();
          set.add(indicador);
          orphansLevel2.set(dim, set);
        }
      }
    }

    if (orphansLevel1.size === 0 && orphansLevel2.size === 0) {
      results.push({ id: checkId, description, status: 'pass' });
      return;
    }

    const lines: string[] = [];
    if (orphansLevel1.size > 0) {
      lines.push('Unknown le (nivel=1) values:');
      for (const [dim, indicadores] of [...orphansLevel1.entries()].sort(([a], [b]) => a.localeCompare(b))) {
        const ids = [...indicadores].sort().join(', ');
        lines.push(`  - ${dim} (indicadores: ${ids})`);
      }
    }
    if (orphansLevel2.size > 0) {
      lines.push('Unknown le2 (nivel=2) values:');
      for (const [dim, indicadores] of [...orphansLevel2.entries()].sort(([a], [b]) => a.localeCompare(b))) {
        const ids = [...indicadores].sort().join(', ');
        lines.push(`  - ${dim} (indicadores: ${ids})`);
      }
    }

    results.push({
      id: checkId,
      description,
      status: 'fail',
      details: lines.join('\n'),
    });
  } catch (error) {
    results.push({
      id: checkId,
      description,
      status: 'error',
      details: error instanceof Error ? error.message : String(error),
    });
  }
}

function checkPromediosObjetivoIsTarragonaLe(
  inputDir: string,
  results: TestResult[],
): void {
  const checkId = 'data-promedios-objetivo-aue-is-tarragona-le';
  const description =
    'promedios_municipio_objetivo_aue.csv `objetivo_aue` values are Tarragona LE ids (1..6) present in diccionario.csv (agenda=TARRAGONA, nivel=1)';

  try {
    const promedios = parseCsv<PromedioLeRow>(
      join(inputDir, 'promedios_municipio_objetivo_aue.csv'),
    );
    const dict = parseCsv<DiccionarioAgendaRow>(join(inputDir, 'diccionario.csv'));

    const knownLevel1 = new Set<string>();
    for (const row of dict) {
      if (row.agenda?.trim() !== 'TARRAGONA') continue;
      if (row.nivel?.trim() !== '1') continue;
      const dim = row.dimension?.trim();
      if (dim) knownLevel1.add(dim);
    }

    const outOfRange = new Set<string>();
    const notInDict = new Set<string>();

    for (const row of promedios) {
      const raw = row.objetivo_aue?.trim();
      if (!raw) continue;
      if (!/^\d+$/.test(raw) || Number(raw) < 1 || Number(raw) > 6) {
        outOfRange.add(raw);
        continue;
      }
      if (!knownLevel1.has(raw)) {
        notInDict.add(raw);
      }
    }

    if (outOfRange.size === 0 && notInDict.size === 0) {
      results.push({ id: checkId, description, status: 'pass' });
      return;
    }

    const lines: string[] = [];
    if (outOfRange.size > 0) {
      lines.push(
        `objetivo_aue values outside Tarragona range 1..6: ${[...outOfRange].sort().join(', ')}.`,
      );
      lines.push(
        '  This usually means the upstream pull script (pullAndBuild/download_and_build.py) is still reading from the legacy `aue1` column instead of `le`.',
      );
    }
    if (notInDict.size > 0) {
      lines.push(
        `objetivo_aue values not found as TARRAGONA-{id} nivel=1 entries in diccionario.csv: ${[...notInDict].sort().join(', ')}.`,
      );
    }

    results.push({
      id: checkId,
      description,
      status: 'fail',
      details: lines.join('\n'),
    });
  } catch (error) {
    results.push({
      id: checkId,
      description,
      status: 'error',
      details: error instanceof Error ? error.message : String(error),
    });
  }
}

function checkCodigoIneConsistency(
  inputDir: string,
  results: TestResult[],
  regionesPath: string,
  checkFile: string,
  checkId: string,
  checkDescription: string,
): void {
  try {
    const regiones = parseCsv<RegionRow>(regionesPath);
    const rows = parseCsv<CodigoIneRow>(join(inputDir, checkFile));

    const validCodes = new Set(regiones.map(r => r.codigo_ine.trim()));
    const orphaned = new Set<string>();

    for (const row of rows) {
      const code = row.codigo_ine?.trim();
      if (code && !validCodes.has(code)) {
        orphaned.add(code);
      }
    }

    if (orphaned.size === 0) {
      results.push({ id: checkId, description: checkDescription, status: 'pass' });
    } else {
      results.push({
        id: checkId,
        description: checkDescription,
        status: 'fail',
        details: `codigo_ine not found in regiones.csv: ${[...orphaned].sort().join(', ')}`,
      });
    }
  } catch (error) {
    results.push({
      id: checkId,
      description: checkDescription,
      status: 'error',
      details: error instanceof Error ? error.message : String(error),
    });
  }
}

function checkProyectosCsv(inputDir: string, results: TestResult[]): void {
  const checkId = 'data-proyectos-unique-codigo';
  const description = 'proyectos.csv has unique non-empty codigo values';
  try {
    const proyectosPath = join(inputDir, 'proyectos.csv');
    const rows = parseCsv<{
      linea?: string;
      objetivo?: string;
      codigo?: string;
      nombre?: string;
    }>(proyectosPath);
    const counts = new Map<string, number>();
    let emptyCodigoRows = 0;
    for (const row of rows) {
      const c = row.codigo?.trim() ?? '';
      if (c === '') {
        emptyCodigoRows += 1;
        continue;
      }
      counts.set(c, (counts.get(c) ?? 0) + 1);
    }
    const dups = [...counts.entries()]
      .filter(([, n]) => n > 1)
      .map(([c]) => c)
      .sort();
    const problems: string[] = [];
    if (dups.length > 0) {
      problems.push(`duplicate codigo: ${dups.join(', ')}`);
    }
    if (emptyCodigoRows > 0) {
      problems.push(`empty codigo on ${emptyCodigoRows} row(s)`);
    }
    if (problems.length > 0) {
      results.push({
        id: checkId,
        description,
        status: 'fail',
        details: problems.join('; '),
      });
    } else {
      results.push({ id: checkId, description, status: 'pass' });
    }
  } catch (error) {
    results.push({
      id: checkId,
      description,
      status: 'error',
      details: error instanceof Error ? error.message : String(error),
    });
  }
}

export function runDataChecks(inputDir: string): TestResult[] {
  const results: TestResult[] = [];
  const regionesPath = join(inputDir, 'regiones.csv');

  try {
    const indicadoresPath = join(inputDir, 'indicadores_agendas.csv');

    const regiones = parseCsv<RegionRow>(regionesPath);
    const indicadores = parseCsv<IndicadorRow>(indicadoresPath);

    const indicatorsByRegion = new Map<string, number>();

    for (const region of regiones) {
      indicatorsByRegion.set(region.codigo_ine, 0);
    }

    for (const indicador of indicadores) {
      const current = indicatorsByRegion.get(indicador.codigo_ine) ?? 0;
      indicatorsByRegion.set(indicador.codigo_ine, current + 1);
    }

    const regionsWithoutIndicators = Array.from(indicatorsByRegion.entries())
      .filter(([, count]) => count === 0)
      .map(([codigo]) => codigo);

    if (regionsWithoutIndicators.length === 0) {
      results.push({
        id: 'data-one-indicator-per-region',
        description: 'Each region has at least one indicator',
        status: 'pass'
      });
    } else {
      results.push({
        id: 'data-one-indicator-per-region',
        description: 'Each region has at least one indicator',
        status: 'fail',
        details: `Regions without indicators: ${regionsWithoutIndicators.join(', ')}`
      });
    }
  } catch (error) {
    results.push({
      id: 'data-one-indicator-per-region',
      description: 'Each region has at least one indicator',
      status: 'error',
      details: error instanceof Error ? error.message : String(error)
    });
  }

  try {
    const indicadoresPath = join(inputDir, 'indicadores_agendas.csv');
    const metadataPath = join(inputDir, 'metadatos_agendas.csv');

    const indicadores = parseCsv<IndicadorRow>(indicadoresPath);
    const metadata = parseCsv<MetadataRow>(metadataPath);

    const indicadoresSet = new Set<string>();
    const metadataSet = new Set<string>();

    for (const indicador of indicadores) {
      if (indicador.indicador) {
        indicadoresSet.add(indicador.indicador);
      }
    }

    for (const meta of metadata) {
      if (meta.indicador) {
        metadataSet.add(meta.indicador);
      }
    }

    const missingInMetadata: string[] = [];
    for (const indicador of indicadoresSet) {
      if (!metadataSet.has(indicador)) {
        missingInMetadata.push(indicador);
      }
    }

    if (missingInMetadata.length === 0) {
      results.push({
        id: 'data-indicators-have-metadata',
        description: 'All indicators in indicadores_agendas.csv appear in metadatos_agendas.csv',
        status: 'pass'
      });
    } else {
      results.push({
        id: 'data-indicators-have-metadata',
        description: 'All indicators in indicadores_agendas.csv appear in metadatos_agendas.csv',
        status: 'fail',
        details: `Indicators missing in metadata: ${missingInMetadata.join(', ')}`
      });
    }
  } catch (error) {
    results.push({
      id: 'data-indicators-have-metadata',
      description: 'All indicators in indicadores_agendas.csv appear in metadatos_agendas.csv',
      status: 'error',
      details: error instanceof Error ? error.message : String(error)
    });
  }

  try {
    const descriptivosPath = join(inputDir, 'descriptivos.csv');
    const metadataPath = join(inputDir, 'metadatos_agendas.csv');

    const descriptivos = parseCsv<IndicadorRow>(descriptivosPath);
    const metadata = parseCsv<MetadataRow>(metadataPath);

    const metadataSet = new Set<string>();
    for (const meta of metadata) {
      if (meta.indicador) {
        metadataSet.add(meta.indicador.trim());
      }
    }

    const descriptivosIndicadores = new Set<string>();
    for (const row of descriptivos) {
      if (row.indicador) {
        descriptivosIndicadores.add(row.indicador.trim());
      }
    }

    const missingInMetadata: string[] = [];
    for (const indicador of descriptivosIndicadores) {
      if (!metadataSet.has(indicador)) {
        missingInMetadata.push(indicador);
      }
    }

    if (missingInMetadata.length === 0) {
      results.push({
        id: 'data-descriptivos-have-metadata',
        description: 'All indicators in descriptivos.csv appear in metadatos_agendas.csv',
        status: 'pass'
      });
    } else {
      results.push({
        id: 'data-descriptivos-have-metadata',
        description: 'All indicators in descriptivos.csv appear in metadatos_agendas.csv',
        status: 'fail',
        details: `Indicators missing in metadata: ${missingInMetadata.sort().join(', ')}`
      });
    }
  } catch (error) {
    results.push({
      id: 'data-descriptivos-have-metadata',
      description: 'All indicators in descriptivos.csv appear in metadatos_agendas.csv',
      status: 'error',
      details: error instanceof Error ? error.message : String(error)
    });
  }

  // codigo_ine consistency: all files that reference regions must use codes present in regiones.csv
  checkCodigoIneConsistency(
    inputDir,
    results,
    regionesPath,
    'indicadores_agendas.csv',
    'data-indicadores-agendas-codigo-ine',
    'All codigo_ine in indicadores_agendas.csv exist in regiones.csv',
  );

  checkCodigoIneConsistency(
    inputDir,
    results,
    regionesPath,
    'descriptivos.csv',
    'data-descriptivos-codigo-ine',
    'All codigo_ine in descriptivos.csv exist in regiones.csv',
  );

  checkCodigoIneConsistency(
    inputDir,
    results,
    regionesPath,
    'promedios_municipio_meta_ods.csv',
    'data-promedios-meta-ods-codigo-ine',
    'All codigo_ine in promedios_municipio_meta_ods.csv exist in regiones.csv',
  );

  checkCodigoIneConsistency(
    inputDir,
    results,
    regionesPath,
    'promedios_municipio_objetivo_aue.csv',
    'data-promedios-objetivo-aue-codigo-ine',
    'All codigo_ine in promedios_municipio_objetivo_aue.csv exist in regiones.csv',
  );

  checkCodigoIneConsistency(
    inputDir,
    results,
    regionesPath,
    'promedios_municipio_ods_objetivo.csv',
    'data-promedios-ods-objetivo-codigo-ine',
    'All codigo_ine in promedios_municipio_ods_objetivo.csv exist in regiones.csv',
  );

  checkProyectosCsv(inputDir, results);

  checkTarragonaOrphanReferences(inputDir, results);
  checkPromediosObjetivoIsTarragonaLe(inputDir, results);

  return results;
}

