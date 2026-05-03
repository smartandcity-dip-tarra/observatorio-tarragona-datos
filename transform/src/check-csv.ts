import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runIntegrityChecks } from './integrity/runner.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

interface CliArgs {
  input: string;
  reportDir: string;
}

function parseArgs(): CliArgs {
  const args = process.argv.slice(2);
  let input = resolve(__dirname, '../../dataset');
  let reportDir = resolve(__dirname, '../../docs/csv-integrity');

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--input' && args[i + 1]) {
      input = resolve(args[++i]);
    } else if (arg === '--outdir' && args[i + 1]) {
      reportDir = resolve(args[++i]);
    }
  }

  return { input, reportDir };
}

function writeJsonReport(reportDir: string, data: unknown): void {
  mkdirSync(reportDir, { recursive: true });
  const jsonPath = resolve(reportDir, 'results.json');
  writeFileSync(jsonPath, JSON.stringify(data, null, 2), 'utf8');
}

function writeHtmlReport(reportDir: string, data: ReturnType<typeof runIntegrityChecks>): void {
  mkdirSync(reportDir, { recursive: true });
  const htmlPath = resolve(reportDir, 'index.html');

  const { summary, results } = data;

  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>CSV Integrity Report</title>
  <style>
    body { font-family: system-ui, -apple-system, BlinkMacSystemFont, sans-serif; padding: 1.5rem; max-width: 960px; margin: 0 auto; background: #f6f6f6; }
    h1 { margin-bottom: 0.25rem; }
    .summary { background: #ffffff; border-radius: 8px; padding: 1rem; margin-bottom: 1.5rem; box-shadow: 0 1px 3px rgba(15, 23, 42, 0.1); }
    .summary-grid { display: flex; flex-wrap: wrap; gap: 1rem; }
    .summary-item { flex: 1 1 120px; padding: 0.5rem 0.75rem; border-radius: 6px; background: #f9fafb; }
    .summary-label { font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.06em; color: #6b7280; }
    .summary-value { font-size: 1.25rem; font-weight: 600; margin-top: 0.15rem; }
    .summary-value.pass { color: #15803d; }
    .summary-value.fail { color: #b91c1c; }
    .summary-value.error { color: #b45309; }
    table { width: 100%; border-collapse: collapse; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(15, 23, 42, 0.08); }
    thead { background: #f3f4f6; }
    th, td { padding: 0.55rem 0.75rem; text-align: left; font-size: 0.9rem; vertical-align: top; }
    th { font-weight: 600; color: #374151; border-bottom: 1px solid #e5e7eb; }
    tr:nth-child(even) td { background: #f9fafb; }
    .status-badge { display: inline-flex; align-items: center; padding: 0.15rem 0.5rem; border-radius: 999px; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; }
    .status-pass { background: #dcfce7; color: #166534; }
    .status-fail { background: #fee2e2; color: #991b1b; }
    .status-error { background: #fef3c7; color: #92400e; }
    .status-warn { background: #e0e7ff; color: #3730a3; }
    .details { white-space: pre-wrap; color: #4b5563; }
    footer { margin-top: 1.5rem; font-size: 0.75rem; color: #6b7280; text-align: right; }
  </style>
</head>
<body>
  <h1>CSV Integrity Report</h1>
  <p>Resumen de las comprobaciones de integridad sobre los ficheros CSV del dataset.</p>

  <section class="summary">
    <div class="summary-grid">
      <div class="summary-item">
        <div class="summary-label">Total tests</div>
        <div class="summary-value">${summary.total}</div>
      </div>
      <div class="summary-item">
        <div class="summary-label">Passed</div>
        <div class="summary-value pass">${summary.passed}</div>
      </div>
      <div class="summary-item">
        <div class="summary-label">Failed</div>
        <div class="summary-value fail">${summary.failed}</div>
      </div>
      <div class="summary-item">
        <div class="summary-label">Errored</div>
        <div class="summary-value error">${summary.errored}</div>
      </div>
      <div class="summary-item">
        <div class="summary-label">Warned</div>
        <div class="summary-value">${summary.warned}</div>
      </div>
    </div>
  </section>

  <table>
    <thead>
      <tr>
        <th style="width: 18%;">Test ID</th>
        <th style="width: 32%;">Description</th>
        <th style="width: 10%;">Status</th>
        <th>Details</th>
      </tr>
    </thead>
    <tbody>
      ${results
        .map(result => {
          const statusClass =
            result.status === 'pass'
              ? 'status-pass'
              : result.status === 'fail'
                ? 'status-fail'
                : result.status === 'warn'
                  ? 'status-warn'
                  : 'status-error';
          const statusLabel = result.status.toUpperCase();
          const safeDetails = result.details ? result.details.replace(/</g, '&lt;').replace(/>/g, '&gt;') : '';
          return `<tr>
        <td><code>${result.id}</code></td>
        <td>${result.description}</td>
        <td><span class="status-badge ${statusClass}">${statusLabel}</span></td>
        <td class="details">${safeDetails}</td>
      </tr>`;
        })
        .join('\n')}
    </tbody>
  </table>

  <footer>
    Generated by csv-integrity check CLI. <a href="pipeline-logs.html">Logs del último pipeline</a>
  </footer>
</body>
</html>
`;

  writeFileSync(htmlPath, html, 'utf8');
}

function main(): void {
  const { input, reportDir } = parseArgs();

  console.log('=== CSV Integrity Checks ===');
  console.log(`Dataset directory: ${input}`);
  console.log(`Report directory: ${reportDir}\n`);

  const result = runIntegrityChecks({ inputDir: input });

  writeJsonReport(reportDir, result);
  writeHtmlReport(reportDir, result);

  console.log(`Total tests: ${result.summary.total}`);
  console.log(`Passed:      ${result.summary.passed}`);
  console.log(`Failed:      ${result.summary.failed}`);
  console.log(`Errored:     ${result.summary.errored}`);
  console.log(`Warned:      ${result.summary.warned}`);

  if (result.summary.failed > 0 || result.summary.errored > 0) {
    console.error('\nSome integrity checks failed or errored. See report for details.');
    process.exit(1);
  }

  console.log('\nAll integrity checks passed.');
}

main();

