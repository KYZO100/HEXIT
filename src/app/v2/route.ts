import { NextRequest, NextResponse } from 'next/server';
import Vibrant from 'node-vibrant';
import { Swatch } from 'node-vibrant/lib/color';

export const dynamic = 'force-dynamic';

// Helper function to check if a swatch is valid
function isValidSwatch(swatch: Swatch | null | undefined): swatch is Swatch {
    return !!swatch && typeof swatch.getHex === 'function';
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const imageUrl = searchParams.get('url');

  if (!imageUrl) {
    return NextResponse.json({ error: 'Image URL is required.' }, { status: 400 });
  }

  try {
    const palette = await Vibrant.from(imageUrl).getPalette();
    const colors: string[] = [];

    // Create a prioritized list of swatches
    const prioritizedSwatches = [
        palette.Vibrant,
        palette.Muted,
        palette.DarkVibrant,
        palette.LightVibrant,
        palette.DarkMuted,
        palette.LightMuted,
    ];

    // Add colors from prioritized swatches first
    for (const swatch of prioritizedSwatches) {
        if (isValidSwatch(swatch) && colors.length < 2) {
            const hex = swatch.getHex();
            if (!colors.includes(hex)) {
                colors.push(hex);
            }
        }
    }
    
    // If we still don't have enough colors, fall back to any available swatch
    if (colors.length < 2) {
      const allSwatches = Object.values(palette).filter(isValidSwatch);
      for (const swatch of allSwatches) {
        if (colors.length < 2) {
          const hex = swatch.getHex();
          if (!colors.includes(hex)) {
            colors.push(hex);
          }
        }
      }
    }

    if (colors.length === 0) {
      return NextResponse.json({ error: 'Could not extract any dominant colors. The image may be empty or in an unsupported format.' }, { status: 422 });
    }

    return NextResponse.json({
      imageUrl,
      colors,
    });

  } catch (error: any) {
    console.error('[COLOR_API_ERROR]', {
      message: error.message,
      url: imageUrl,
    });
    
    let errorMessage = 'Failed to process image. The URL may be invalid or the image format is not supported.';

    if (error && error.message) {
      if (error.message.toLowerCase().includes('unsupported image type')) {
        errorMessage = 'Unsupported image format. Please use JPEG, PNG, or GIF.';
      } else if (error.message.toLowerCase().includes('invalid image response')) {
        errorMessage = 'Could not fetch the image from the URL. Please check the link.';
      }
    }

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
