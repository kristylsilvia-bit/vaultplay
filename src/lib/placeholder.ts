/** Deterministic visual placeholder for games without a thumbnail. */

function hash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

/** A stable two-stop gradient derived from the slug. */
export function placeholderGradient(slug: string): string {
  const h = hash(slug);
  const hue1 = h % 360;
  const hue2 = (hue1 + 40 + (h % 80)) % 360;
  return `linear-gradient(135deg, hsl(${hue1} 70% 52%), hsl(${hue2} 72% 42%))`;
}

/** Up to two initials for the placeholder glyph. */
export function initials(title: string): string {
  const words = title.replace(/[^a-zA-Z0-9 ]/g, ' ').trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return '?';
  if (words.length === 1) return words[0]!.slice(0, 2).toUpperCase();
  return (words[0]![0]! + words[1]![0]!).toUpperCase();
}
