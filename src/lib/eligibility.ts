export type AgeRange = { ageMin: number | null; ageMax: number | null };

/** Whether a single category accepts a given age. Null bound = unrestricted on that side. */
export function categoryAcceptsAge(category: AgeRange, age: number) {
  if (category.ageMin != null && age < category.ageMin) return false;
  if (category.ageMax != null && age > category.ageMax) return false;
  return true;
}

/** Whether at least one of an ASD's categories accepts a given age. */
export function anyCategoryAcceptsAge(categories: AgeRange[], age: number) {
  if (categories.length === 0) return true;
  return categories.some((c) => categoryAcceptsAge(c, age));
}

/** Compact age-range label spanning all of an ASD's categories, for list/card display. */
export function summarizeAgeRange(categories: AgeRange[]): string {
  if (categories.length === 0) return "";
  if (categories.some((c) => c.ageMin == null && c.ageMax == null)) return "Tutte le età";

  const mins = categories.map((c) => c.ageMin).filter((v): v is number => v != null);
  const maxs = categories.map((c) => c.ageMax).filter((v): v is number => v != null);
  const lo = mins.length ? Math.min(...mins) : null;
  const hi = maxs.length ? Math.max(...maxs) : null;

  if (lo != null && hi != null) return `${lo}-${hi} anni`;
  if (lo != null) return `Dai ${lo} anni`;
  if (hi != null) return `Fino a ${hi} anni`;
  return "Tutte le età";
}

/** Lowest annual fee across an ASD's categories, for "da X €/anno" display. */
export function summarizeMinFee(categories: { annualFee: number }[]): number | null {
  if (categories.length === 0) return null;
  return Math.min(...categories.map((c) => c.annualFee));
}
