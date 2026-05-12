import type { RegionRecord } from '../parse/index.js';
import { assertDistinctTypologySlugSources, slugifyTypologyLabel } from '../slugifyTypology.js';

export function transformRegionesIdEspecial2Slugs(regiones: RegionRecord[]): RegionRecord[] {
  const pairs: { codigo_ine: string; label: string }[] = [];
  for (const r of regiones) {
    if (r.id_especial2 != null && r.id_especial2.trim() !== '') {
      pairs.push({ codigo_ine: r.codigo_ine, label: r.id_especial2 });
    }
  }
  assertDistinctTypologySlugSources(pairs);

  return regiones.map((r) => {
    const raw = r.id_especial2;
    if (raw == null || raw.trim() === '') {
      return { ...r, id_especial2: null };
    }
    const slug = slugifyTypologyLabel(raw);
    if (slug == null) {
      console.warn(
        `[regiones] WARN: id_especial2 slug empty after normalize for codigo_ine=${r.codigo_ine} — storing NULL`,
      );
      return { ...r, id_especial2: null };
    }
    return { ...r, id_especial2: slug };
  });
}
