/**
 * Strips SRT/ASS/VTT subtitle files down to raw Japanese text.
 * Returns a single string of all dialogue, newline-separated.
 */
export function parseSRT(content: string): string {
  // Remove BOM if present
  content = content.replace(/^﻿/, '');

  // Detect format
  if (content.includes('[Script Info]') || content.includes('Dialogue:')) {
    return parseASS(content);
  }
  if (content.startsWith('WEBVTT')) {
    return parseVTT(content);
  }
  return parseSRTFormat(content);
}

function parseSRTFormat(content: string): string {
  const lines: string[] = [];

  // SRT blocks: index\ntimestamp\ntext\n\n
  const blocks = content.split(/\n\n+/);
  for (const block of blocks) {
    const blockLines = block.trim().split('\n');
    // Skip index line (number) and timestamp line (-->)
    for (const line of blockLines) {
      if (/^\d+$/.test(line.trim())) continue;
      if (/-->/.test(line)) continue;
      const clean = stripHTMLTags(line.trim());
      if (clean) lines.push(clean);
    }
  }
  return lines.join('\n');
}

function parseASS(content: string): string {
  const lines: string[] = [];
  for (const line of content.split('\n')) {
    if (!line.startsWith('Dialogue:')) continue;
    // Format: Dialogue: Layer,Start,End,Style,Name,MarginL,MarginR,MarginV,Effect,Text
    const parts = line.split(',');
    if (parts.length < 10) continue;
    const text = parts.slice(9).join(',');
    // Remove ASS override tags like {\an8}, {\blur10}, etc.
    const clean = text.replace(/\{[^}]*\}/g, '').replace(/\\N/g, ' ').trim();
    if (clean) lines.push(clean);
  }
  return lines.join('\n');
}

function parseVTT(content: string): string {
  const lines: string[] = [];
  for (const line of content.split('\n')) {
    if (line.startsWith('WEBVTT')) continue;
    if (/-->/.test(line)) continue;
    if (/^\d+$/.test(line.trim())) continue;
    const clean = stripHTMLTags(line.trim());
    if (clean) lines.push(clean);
  }
  return lines.join('\n');
}

function stripHTMLTags(str: string): string {
  return str.replace(/<[^>]+>/g, '').trim();
}
