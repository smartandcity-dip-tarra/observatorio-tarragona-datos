/**
 * Slug for `REGIONES.id_especial2` — see change `integrate-en-proyectos-slug-regiones` / data-transformation spec.
 */
export function slugifyTypologyLabel(raw: string): string | null {
  const trimmed = raw.trim();
  if (trimmed === '') return null;

  const decomposed = trimmed.normalize('NFKD');
  const ascii = decomposed.replace(/\p{M}/gu, '');

  let s = ascii.toLowerCase();
  s = s.replace(/[^a-z0-9]+/g, '-');
  s = s.replace(/-{2,}/g, '-');
  s = s.replace(/^-+|-+$/g, '');

  return s === '' ? null : s;
}

/**
 * Ensures no two distinct non-empty source labels map to the same slug.
 * @throws Error listing slug and conflicting labels when violated.
 */
export function assertDistinctTypologySlugSources(
  pairs: { codigo_ine: string; label: string }[],
): void {
  const slugToLabels = new Map<string, Set<string>>();

  for (const { label } of pairs) {
    const t = label.trim();
    if (t === '') continue;
    const slug = slugifyTypologyLabel(t);
    if (slug == null) continue;
    const set = slugToLabels.get(slug) ?? new Set<string>();
    set.add(t);
    slugToLabels.set(slug, set);
  }

  for (const [slug, labels] of slugToLabels) {
    if (labels.size > 1) {
      const list = [...labels].sort().join('", "');
      throw new Error(
        `REGIONES id_especial2 slug collision: slug "${slug}" produced from distinct labels: "${list}"`,
      );
    }
  }
}
