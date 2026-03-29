/** Browse URLs aligned with production, e.g. ?categories=AC,Refrigerator,Washing Machine */

export const BROWSE_CATEGORY = {
  AC: 'AC',
  REFRIGERATOR: 'Refrigerator',
  WASHING_MACHINE: 'Washing Machine',
};

/** Default catalog query: all main categories (comma-separated). */
export const DEFAULT_BROWSE_CATEGORIES = 'AC,Refrigerator,Washing Machine';

export const browsePath = (category = BROWSE_CATEGORY.AC) =>
  `/browse?category=${encodeURIComponent(category)}`;

export const defaultBrowsePath = () =>
  `/browse?categories=${encodeURIComponent(DEFAULT_BROWSE_CATEGORIES)}`;

export const browsePathAllCategories = () => defaultBrowsePath();

/** `?category=` query value → internal filter slug (ac | refrigerator | washing-machine | all). */
export const categoryParamToSlug = (param) => {
  if (!param) return 'ac';
  const p = String(param).trim();
  if (p === 'AC' || p.toLowerCase() === 'ac') return 'ac';
  if (p === 'Refrigerator' || p.toLowerCase() === 'refrigerator') return 'refrigerator';
  if (
    p === 'Washing Machine' ||
    p.toLowerCase() === 'washing machine' ||
    p === 'washing-machine'
  ) {
    return 'washing-machine';
  }
  return 'ac';
};

/** Internal slug → `?category=` value for the address bar. */
export const slugToCategoryParam = (slug) => {
  const map = {
    ac: BROWSE_CATEGORY.AC,
    refrigerator: BROWSE_CATEGORY.REFRIGERATOR,
    'washing-machine': BROWSE_CATEGORY.WASHING_MACHINE,
  };
  return map[slug] || BROWSE_CATEGORY.AC;
};
