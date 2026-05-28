/**
 * Tiny markdown helpers — not a full renderer. Just enough to support
 * comment previews and task descriptions.
 */

export function extractFirstLine(md: string): string {
  const lines = md.split(/\r?\n/);
  return (lines[0] ?? '').replace(/^#+\s*/, '').trim();
}

export function stripMarkdown(md: string): string {
  return md
    .replace(/```[\s\S]*?```/g, '') // code fences
    .replace(/`[^`]*`/g, '')        // inline code
    .replace(/!\[[^\]]*\]\([^)]+\)/g, '') // images
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // links
    .replace(/[*_~]+/g, '')         // emphasis
    .replace(/^>\s?/gm, '')         // blockquotes
    .replace(/^#{1,6}\s*/gm, '')    // headings
    .trim();
}

export function previewOf(md: string, maxChars = 140): string {
  const plain = stripMarkdown(md).replace(/\s+/g, ' ');
  if (plain.length <= maxChars) return plain;
  return plain.slice(0, maxChars - 1).trimEnd() + '…';
}

export function countMentions(md: string): number {
  return (md.match(/(^|[^a-zA-Z0-9_])@[a-zA-Z0-9_.-]+/g) || []).length;
}
