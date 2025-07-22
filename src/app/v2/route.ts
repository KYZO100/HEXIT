import { NextRequest, NextResponse } from 'next/server';
import Vibrant from 'node-vibrant';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const imageUrl = searchParams.get('url');

  if (!imageUrl) {
    return NextResponse.json({ error: 'Image URL is required.' }, { status: 400 });
  }

  try {
    const palette = await Vibrant.from(imageUrl).getPalette();
    const colors: string[] = [];

    const swatches = [
        palette.Vibrant,
        palette.DarkVibrant,
        palette.LightVibrant,
        palette.Muted,
        palette.DarkMuted,
        palette.LightMuted,
    ];

    for (const swatch of swatches) {
        if (swatch && colors.length < 2) {
            const hex = swatch.getHex();
            if (!colors.includes(hex)) {
                colors.push(hex);
            }
        }
    }

    if (colors.length < 2) {
        const sortedSwatches = Object.values(palette).filter(Boolean).sort((a, b) => b.population - a.population);
        for(const swatch of sortedSwatches) {
            if (swatch && colors.length < 2) {
                const hex = swatch.getHex();
                if (!colors.includes(hex)) {
                    colors.push(hex);
                }
            }
        }
    }
    
    if (colors.length === 0) {
        return NextResponse.json({ error: 'Could not extract any dominant colors from the image.' }, { status: 422 });
    }

    return NextResponse.json({
      imageUrl,
      colors,
    });
  } catch (error) {
    console.error('[COLOR_API_ERROR]', error);
    let errorMessage = 'Failed to process image from URL.';
    if (error instanceof Error && error.message.includes('file type')) {
        errorMessage = 'Invalid or unsupported image type.'
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
