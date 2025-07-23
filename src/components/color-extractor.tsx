"use client";

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Palette, Copy, Link as LinkIcon, AlertTriangle } from 'lucide-react';
import Image from 'next/image';

interface ColorResult {
  imageUrl: string;
  colors: string[];
}

export default function ColorExtractor() {
  const [url, setUrl] = useState('');
  const [result, setResult] = useState<ColorResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [imageError, setImageError] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!url) {
        setError("Please enter an image URL.");
        return;
    }
    
    startTransition(async () => {
      setResult(null);
      setError(null);
      setImageError(false);
      try {
        const response = await fetch(`/v2?url=${encodeURIComponent(url)}`);
        
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch colors.');
        }

        setResult(data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
        setError(errorMessage);
        setResult(null);
      }
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };
  
  return (
    <div className="w-full max-w-5xl z-10 p-4">
      <div className="text-center mb-12">
        <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-b from-neutral-50 to-neutral-400 bg-clip-text text-transparent">
          HEXIT
        </h1>
        <p className="mt-4 text-lg text-neutral-300 max-w-2xl mx-auto">
          The ultimate color toolkit. Instantly extract dominant colors and generate stunning palettes from any image URL.
        </p>
      </div>

      <Card className="w-full bg-black/30 backdrop-blur-sm border-white/10">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
             <div className="relative flex-grow">
                <LinkIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
                <Input
                  type="url"
                  placeholder="Paste any image URL (e.g., from Unsplash, a logo, etc.)"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  disabled={isPending}
                  required
                  className="pl-11 w-full h-14 text-lg bg-neutral-900/80 border-neutral-700 focus:ring-primary focus:border-primary"
                />
            </div>
            <Button type="submit" disabled={isPending} size="lg" className="font-semibold h-14 text-lg px-8 bg-primary hover:bg-primary/90 text-white">
              {isPending ? <Loader2 className="animate-spin" /> : "Extract Colors"}
            </Button>
          </form>

          {error && (
            <div className="mt-4 text-center text-destructive bg-destructive/20 border border-destructive/50 p-3 rounded-md flex items-center justify-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                <span>{error}</span>
            </div>
           )}

          <div className="mt-8 min-h-[400px] flex items-center justify-center rounded-xl bg-black/20 p-4 border-dashed border-2 border-neutral-800">
            {isPending && (
              <div className="w-full flex flex-col items-center justify-center text-neutral-400">
                  <Loader2 className="w-12 h-12 animate-spin mb-4 text-primary" />
                  <p className="text-xl font-medium">Analyzing your image...</p>
                  <p className="text-sm text-neutral-500">This might take a moment.</p>
              </div>
            )}
            
            {!isPending && result && (
              <div className="w-full grid md:grid-cols-5 gap-8 items-center">
                <div data-ai-hint="abstract background" className="md:col-span-2 relative aspect-video w-full overflow-hidden rounded-lg border-2 border-dashed border-neutral-700">
                  {result.imageUrl && !imageError ? (
                    <Image
                      src={result.imageUrl}
                      alt="Analyzed image"
                      className="object-contain"
                      fill
                      unoptimized
                      onError={() => setImageError(true)}
                    />
                  ) : (
                     <div className="flex flex-col items-center justify-center h-full text-neutral-400 bg-neutral-900/50 p-4">
                      <AlertTriangle className="w-12 h-12 mb-2 text-destructive" />
                      <span className="text-center font-medium">Could not load image preview.</span>
                    </div>
                  )}
                </div>
                <div className="md:col-span-3 flex flex-col justify-center items-center gap-6">
                   <h3 className="text-2xl font-semibold text-white">Dominant Colors</h3>
                   <div className="flex flex-wrap justify-center items-start gap-4 sm:gap-6">
                    {result.colors.map((color) => (
                      <div key={color} className="flex flex-col items-center gap-3 group">
                        <button onClick={() => copyToClipboard(color)}
                          className="w-28 h-28 rounded-full shadow-lg transition-transform hover:scale-110 border-4 border-neutral-800/50"
                          style={{ backgroundColor: color }}
                          aria-label={`Copy color ${color}`}
                        />
                        <button
                          onClick={() => copyToClipboard(color)}
                          className="font-mono text-lg text-neutral-400 hover:text-white flex items-center gap-2"
                        >
                          {color}
                          <Copy className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                      </div>
                    ))}
                    </div>
                    <p className="text-xs text-neutral-500 mt-4">Tip: Click on a color swatch or hex code to copy.</p>
                </div>
              </div>
            )}

            {!isPending && !result && !error && (
              <div className="text-center text-neutral-500 p-8">
                <Palette size={64} className="mx-auto mb-6 text-neutral-600" />
                <p className="font-medium text-2xl text-neutral-300">Your color palette appears here</p>
                <p className="mt-2 text-base">Paste an image URL above to get started.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
