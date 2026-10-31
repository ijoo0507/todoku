import { ImageResponse } from 'next/og';
import { getShare } from '@/lib/shares';

export const runtime = 'nodejs';
export const alt = 'Todoku comprehension score';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

// The default OG font has no CJK glyphs; fetch a Noto Sans JP subset with only
// the characters we render. Returns null on failure so the card still renders.
async function loadJapaneseFont(text: string): Promise<ArrayBuffer | null> {
  try {
    const cssUrl = `https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@700&text=${encodeURIComponent(text)}`;
    const css = await (await fetch(cssUrl, { signal: AbortSignal.timeout(3000) })).text();
    const src = css.match(/src: url\((.+?)\) format\('(opentype|truetype)'\)/)?.[1];
    if (!src) return null;
    const res = await fetch(src, { signal: AbortSignal.timeout(3000) });
    return res.ok ? await res.arrayBuffer() : null;
  } catch {
    return null;
  }
}

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const share = await getShare(id).catch(() => null);
  const score = share?.score ?? 0;
  const title = share?.title ?? '';
  const color = score >= 90 ? '#22c55e' : score >= 75 ? '#3b82f6' : score >= 60 ? '#f59e0b' : '#ef4444';

  const headline = share ? `I understand ${score}% of this` : 'How much Japanese can you understand?';
  const font = await loadJapaneseFont(`${headline}${title}届く Todoku todoku unique words known 0123456789 of`);

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#0f172a',
          padding: '72px 80px',
          fontFamily: font ? 'Noto Sans JP' : 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, color: '#94a3b8', fontSize: 36 }}>
          {font ? '届く Todoku' : 'Todoku'}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={{ display: 'flex', color: 'white', fontSize: 76, fontWeight: 700, lineHeight: 1.1 }}>
            {share ? (
              <>
                I understand&nbsp;<span style={{ color }}>{score}%</span>&nbsp;of this
              </>
            ) : (
              headline
            )}
          </div>
          {title && font && (
            <div style={{ display: 'flex', color: '#cbd5e1', fontSize: 44 }}>
              {title.length > 60 ? `${title.slice(0, 57)}...` : title}
            </div>
          )}
        </div>
        <div style={{ display: 'flex', color: '#64748b', fontSize: 30 }}>
          {share ? `${share.known} of ${share.totalUnique} unique words known` : ''}
        </div>
      </div>
    ),
    {
      ...size,
      fonts: font ? [{ name: 'Noto Sans JP', data: font, weight: 700, style: 'normal' }] : undefined,
    }
  );
}
