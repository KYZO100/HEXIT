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

    // Prioritize specific swatches that often give good results
    const prioritizedSwatches = [
        palette.Vibrant,
        palette.Muted,
        palette.DarkVibrant,
        palette.LightVibrant,
        palette.DarkMuted,
        palette.LightMuted,
    ];

    for (const swatch of prioritizedSwatches) {
        if (swatch && colors.length < 2) {
            const hex = swatch.getHex();
            if (!colors.includes(hex)) {
                colors.push(hex);
            }
        }
    }

    // If we still don't have enough colors, fall back to the most populous ones
    if (colors.length < 2) {
        const sortedSwatches = Object.values(palette)
            .filter((swatch): swatch is NonNullable<typeof swatch> => !!swatch)
            .sort((a, b) => (b.population || 0) - (a.population || 0));

        for(const swatch of sortedSwatches) {
            if (colors.length < 2) {
                const hex = swatch.getHex();
                if (!colors.includes(hex)) {
                    colors.push(hex);
                }
            }
        }
    }
    
    if (colors.length === 0) {
        // This case should be rare, but it's good practice to handle it.
        return NextResponse.json({ error: 'Could not extract any dominant colors from the image.' }, { status: 422 });
    }

    return NextResponse.json({
      imageUrl,
      colors,
    });
  } catch (error: any) {
    console.error('[COLOR_API_ERROR]', error);
    let errorMessage = 'Failed to process image from URL.';
    // Provide more specific error messages for common issues
    if (error && error.message) {
      if (error.message.toLowerCase().includes('unsupported image type')) {
        errorMessage = 'Unsupported image format. Please try a different image (e.g., JPEG, PNG).';
      } else if (error.message.toLowerCase().includes('invalid image response')) {
        errorMessage = 'Could not fetch the image from the provided URL. Please check the link and try again.';
      }
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
