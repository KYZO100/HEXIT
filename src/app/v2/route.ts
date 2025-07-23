import { NextRequest, NextResponse } from 'next/server';
import Vibrant from 'node-vibrant';
import { Swatch } from 'node-vibrant/lib/color';

export const dynamic = 'force-dynamic';

// Custom fetch with a user-agent to avoid some HTTP 403 errors
async function fetchImage(url: string) {
    const response = await fetch(url, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        },
    });
    if (!response.ok) {
        throw new Error(`Failed to fetch image with status: ${response.status}`);
    }
    return response.arrayBuffer();
}

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
    const imageBuffer = await fetchImage(imageUrl);
    const palette = await Vibrant.from(Buffer.from(imageBuffer)).getPalette();
    
    const colors: string[] = [];
    const prioritizedSwatches = [
        palette.Vibrant,
        palette.Muted,
        palette.DarkVibrant,
        palette.LightVibrant,
        palette.DarkMuted,
        palette.LightMuted,
    ];

    for (const swatch of prioritizedSwatches) {
        if (isValidSwatch(swatch) && colors.length < 2) {
            const hex = swatch.getHex();
            if (!colors.includes(hex)) {
                colors.push(hex);
            }
        }
    }
    
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
        return NextResponse.json({ error: 'Could not extract any dominant colors from the image.' }, { status: 422 });
    }

    return NextResponse.json({
      imageUrl,
      colors,
    });

  } catch (error: any) {
    console.error('[COLOR_API_ERROR]', { message: error.message, url: imageUrl });
    
    let errorMessage = 'Failed to process image. The URL may be invalid or the image format is not supported.';
    if (error && error.message) {
        if (error.message.toLowerCase().includes('unsupported image type')) {
            errorMessage = 'Unsupported image format. Please use formats like JPEG, PNG, or GIF.';
        } else if (error.message.toLowerCase().includes('failed to fetch')) {
            errorMessage = 'Could not download the image from the URL. Please check the link and ensure it is publicly accessible.';
        }
    }

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
