/**
 * Integration test for integrity checks related to the Tarragona taxonomy migration.
 *
 * Run with: `pnpm exec tsx src/integrity/checks/data.test.ts`
 *
 * The script builds a temporary dataset directory with crafted CSVs and calls
 * `runDataChecks`. It asserts:
 *   - a `le` value that does NOT appear in diccionario.csv (agenda=TARRAGONA, nivel=1)
 *     produces a `data-tarragona-le-orphans` failure
 *   - a `le2` value that does NOT appear in diccionario.csv (agenda=TARRAGONA, nivel=2)
 *     produces the same failure
 *   - a fully-matching dataset produces a `pass`
 */
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { runDataChecks } from './data.js';

const REQUIRED_FILES: Record<string, string> = {
  'regiones.csv': 'codigo_ine,nombre,poblacion,id_poblacion,id_especial,id_especial2,id_especial3\n43001,Alpha,100,s,,,aue\n',
  'proyectos.csv': 'linea,objetivo,codigo,nombre,descripcion,logro\n1,1.1,1.1.1,Test project,Description,1\n',
  'promedios_municipio_meta_ods.csv': 'codigo_ine,meta_ods,promedio_indice,n_indicadores,periodo_max\n43001,1.1,0.5,1,2024\n',
  'promedios_municipio_objetivo_aue.csv': 'codigo_ine,objetivo_aue,promedio_indice,n_indicadores,periodo_max\n43001,1,0.5,1,2024\n',
  'promedios_municipio_ods_objetivo.csv': 'codigo_ine,ods_objetivo,promedio_metas,n_metas\n43001,1,0.5,1\n',
};

function writeScenario(
  baseDir: string,
  overrides: Record<string, string>,
): void {
  mkdirSync(baseDir, { recursive: true });
  for (const [name, body] of Object.entries({ ...REQUIRED_FILES, ...overrides })) {
    writeFileSync(join(baseDir, name), body, 'utf8');
  }
}

function assert(cond: boolean, message: string): void {
  if (!cond) {
    console.error(`ASSERTION FAILED: ${message}`);
    process.exit(1);
  }
}

function findResult(results: ReturnType<typeof runDataChecks>, id: string) {
  return results.find((r) => r.id === id);
}

function runScenario(name: string, files: Record<string, string>): ReturnType<typeof runDataChecks> {
  const tmp = mkdtempSync(join(tmpdir(), 'tarragona-le-check-'));
  try {
    writeScenario(tmp, files);
    console.log(`\n[${name}] inputDir=${tmp}`);
    return runDataChecks(tmp);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
}

function main(): void {
  // Scenario 1: all references known → pass
  {
    const results = runScenario('valid', {
      'metadatos_agendas.csv':
        'indicador,clase,nombre,detalle,fuente,fuente_link,actualizacion,corte_muestra,unidad,tipo,formula,umbral_optimo,umbral_malo,ods,meta,aue1,aue2,muestra_ods,muestra_aue,le,le2\n' +
        'A-1,agendas,Foo,,,,,,% ,QT,a,,,,,,,,,1,1.2\n',
      'indicadores_agendas.csv': 'codigo_ine,indicador,periodo,valor\n43001,A-1,2024,0.5\n',
      'descriptivos.csv': 'codigo_ine,indicador,periodo,valor\n',
      'diccionario.csv':
        'agenda,nivel,dimension,nombre,detalle,logo\n' +
        'TARRAGONA,1,1,"L1",,\n' +
        'TARRAGONA,2,1.2,"L1.2",,\n',
    });
    const res = findResult(results, 'data-tarragona-le-orphans');
    console.log('  →', res);
    assert(!!res, 'valid: tarragona orphan result missing');
    assert(res!.status === 'pass', `valid: expected pass, got ${res!.status}`);
  }

  // Scenario 2: orphan le=99 → fail with value and indicator listed
  {
    const results = runScenario('orphan-le', {
      'metadatos_agendas.csv':
        'indicador,clase,nombre,detalle,fuente,fuente_link,actualizacion,corte_muestra,unidad,tipo,formula,umbral_optimo,umbral_malo,ods,meta,aue1,aue2,muestra_ods,muestra_aue,le,le2\n' +
        'A-1,agendas,Foo,,,,,,%,QT,a,,,,,,,,,99,1.2\n',
      'indicadores_agendas.csv': 'codigo_ine,indicador,periodo,valor\n43001,A-1,2024,0.5\n',
      'descriptivos.csv': 'codigo_ine,indicador,periodo,valor\n',
      'diccionario.csv':
        'agenda,nivel,dimension,nombre,detalle,logo\n' +
        'TARRAGONA,1,1,"L1",,\n' +
        'TARRAGONA,2,1.2,"L1.2",,\n',
    });
    const res = findResult(results, 'data-tarragona-le-orphans');
    console.log('  →', res);
    assert(!!res, 'orphan-le: tarragona orphan result missing');
    assert(res!.status === 'fail', `orphan-le: expected fail, got ${res!.status}`);
    assert(!!res!.details && res!.details.includes('99'), 'orphan-le: details should mention 99');
    assert(!!res!.details && res!.details.includes('A-1'), 'orphan-le: details should mention indicator A-1');
  }

  // Scenario 3: orphan le2=9.9 → fail with value and indicator listed
  {
    const results = runScenario('orphan-le2', {
      'metadatos_agendas.csv':
        'indicador,clase,nombre,detalle,fuente,fuente_link,actualizacion,corte_muestra,unidad,tipo,formula,umbral_optimo,umbral_malo,ods,meta,aue1,aue2,muestra_ods,muestra_aue,le,le2\n' +
        'A-2,agendas,Bar,,,,,,%,QT,a,,,,,,,,,1,9.9\n',
      'indicadores_agendas.csv': 'codigo_ine,indicador,periodo,valor\n43001,A-2,2024,0.5\n',
      'descriptivos.csv': 'codigo_ine,indicador,periodo,valor\n',
      'diccionario.csv':
        'agenda,nivel,dimension,nombre,detalle,logo\n' +
        'TARRAGONA,1,1,"L1",,\n' +
        'TARRAGONA,2,1.2,"L1.2",,\n',
    });
    const res = findResult(results, 'data-tarragona-le-orphans');
    console.log('  →', res);
    assert(!!res, 'orphan-le2: tarragona orphan result missing');
    assert(res!.status === 'fail', `orphan-le2: expected fail, got ${res!.status}`);
    assert(!!res!.details && res!.details.includes('9.9'), 'orphan-le2: details should mention 9.9');
    assert(!!res!.details && res!.details.includes('A-2'), 'orphan-le2: details should mention indicator A-2');
  }

  console.log('\nAll assertions passed.');
}

main();
