import { NextRequest, NextResponse } from 'next/server';
import Vibrant from 'node-vibrant';
import { Swatch } from 'node-vibrant/lib/color';

export const dynamic = 'force-dynamic';

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
    return !!swatch && typeof swatch.getHex === 'function' && typeof swatch.population === 'number';
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
    
    const validSwatches = Object.values(palette).filter(isValidSwatch);

    if (validSwatches.length === 0) {
        return NextResponse.json({ error: 'Could not extract any dominant colors from the image.' }, { status: 422 });
    }

    validSwatches.sort((a, b) => b.population - a.population);

    const totalPopulation = validSwatches.reduce((sum, s) => sum + s.population, 0);
    const mostDominant = validSwatches[0];

    let finalColors: string[];


    if (totalPopulation > 0 && (mostDominant.population / totalPopulation) > 0.8) {
        finalColors = [mostDominant.getHex()];
    } else {
        const uniqueColors = [...new Set(validSwatches.map(s => s.getHex()))];
        finalColors = uniqueColors.slice(0, 2);
    }

    return NextResponse.json({
      imageUrl,
      colors: finalColors,
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
