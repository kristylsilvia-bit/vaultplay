import { ImageResponse } from 'next/og';
import { totalGames } from '@/lib/games';

export const alt = 'Gamejet — Play 700+ free browser games';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const gradientText = {
  display: 'flex',
  fontSize: 86,
  fontWeight: 800,
  lineHeight: 1.08,
  backgroundImage: 'linear-gradient(120deg, #a78bfa, #e879f9, #22d3ee)',
  backgroundClip: 'text',
  color: 'transparent',
} as const;

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '80px',
          background: 'linear-gradient(135deg, #0c0c12 0%, #1a1030 55%, #07232b 100%)',
          color: 'white',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            fontSize: 34,
            fontWeight: 600,
            letterSpacing: 2,
            color: '#c4b5fd',
          }}
        >
          GAMEJET
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', marginTop: 24 }}>
          <div style={gradientText}>{totalGames}+ free browser games,</div>
          <div style={gradientText}>instantly playable.</div>
        </div>
        <div style={{ display: 'flex', fontSize: 34, marginTop: 32, color: '#cbd5e1' }}>
          No sign-up · No downloads · Just play
        </div>
      </div>
    ),
    size,
  );
}
