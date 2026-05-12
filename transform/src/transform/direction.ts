/**
 * Single source of truth for mapping spreadsheet `formula` sentinel strings to a
 * language-neutral `direction` enum stored in `METADATA.direction`.
 *
 * When Google Sheets adds a new sentinel (ES or CAT), add it here and re-run
 * the transform. Unknown sentinels log `[catalan] WARN: unknown formula sentinel`
 * and produce `direction = NULL`.
 */
export type Direction = 'asc' | 'desc' | 'neutral';

/** Spanish sentinels from `metadatos_agendas.csv` → direction */
export const DIRECTION_MAP_ES: Record<string, Direction> = {
  '↑ Ascendente (más = mejor)': 'asc',
  '↓ Descendente (menos = mejor)': 'desc',
};

/** Catalan sentinels from `metadatos_agendas_cat.csv` (integrity validation only) */
export const DIRECTION_MAP_CAT: Record<string, Direction> = {
  '↑ Ascendent (més = millor)': 'asc',
  '↓ Descendent (menys = millor)': 'desc',
};

/** English sentinels from `metadatos_agendas_en.csv` (integrity validation only) */
export const DIRECTION_MAP_EN: Record<string, Direction> = {
  '↑ Ascending (higher = better)': 'asc',
  '↓ Descending (lower = better)': 'desc',
};

export function mapDirectionEs(formula: string | null): Direction | null {
  if (formula == null || formula.trim() === '') return null;
  const mapped = DIRECTION_MAP_ES[formula.trim()];
  return mapped ?? null;
}

export function mapDirectionCat(formula: string | null): Direction | null {
  if (formula == null || formula.trim() === '') return null;
  const mapped = DIRECTION_MAP_CAT[formula.trim()];
  return mapped ?? null;
}

export function mapDirectionEn(formula: string | null): Direction | null {
  if (formula == null || formula.trim() === '') return null;
  const mapped = DIRECTION_MAP_EN[formula.trim()];
  return mapped ?? null;
}

/** True if non-empty and recognized in ES map */
export function isKnownFormulaEs(formula: string | null | undefined): boolean {
  if (formula == null || formula.trim() === '') return true;
  return formula.trim() in DIRECTION_MAP_ES;
}

/** True if empty or recognized in CAT map */
export function isKnownFormulaCat(formula: string | null | undefined): boolean {
  if (formula == null || formula.trim() === '') return true;
  return formula.trim() in DIRECTION_MAP_CAT;
}

/** True if empty or recognized in EN map */
export function isKnownFormulaEn(formula: string | null | undefined): boolean {
  if (formula == null || formula.trim() === '') return true;
  return formula.trim() in DIRECTION_MAP_EN;
}
