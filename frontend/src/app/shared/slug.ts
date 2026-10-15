/** "Volta River Authority" -> "volta-river-authority": used as the anchor id for a role on the experience page. */
export const slug = (text: string): string =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
