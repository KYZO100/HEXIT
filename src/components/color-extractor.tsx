"use client";

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Image as ImageIcon, Palette, Copy, Link as LinkIcon } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import Image from 'next/image';

interface ColorResult {
  imageUrl: string;
  colors: string[];
}

export default function ColorExtractor() {
  const [url, setUrl] = useState('');
  const [result, setResult] = useState<ColorResult | null>(null);
  const [isPending, startTransition] = useTransition();
  const [imageError, setImageError] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!url) {
        toast({
            title: "Error",
            description: "Please enter an image URL.",
            variant: "destructive",
        });
        return;
    }
    
    startTransition(async () => {
      setResult(null);
      setImageError(false);
      try {
        const response = await fetch(`/v2?url=${encodeURIComponent(url)}`);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch colors.');
        }

        const data: ColorResult = await response.json();
        setResult(data);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        toast({
            title: "Error",
            description: errorMessage,
            variant: "destructive",
        });
        console.error(error);
        setResult(null);
      }
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        description: `Copied "${text}" to clipboard.`,
      });
    });
  };
  
  return (
    <div className="w-full max-w-3xl font-body z-10">
      <Card className="w-full shadow-2xl rounded-xl border-black/[0.1] dark:border-white/[0.1] bg-white/60 dark:bg-black/60 backdrop-blur-md">
        <CardHeader className="text-center">
            <div className="flex justify-center items-center gap-2 mb-2">
                <Palette className="w-8 h-8 text-primary" />
                <CardTitle className="text-4xl font-extrabold tracking-tight bg-gradient-to-br from-slate-900 to-slate-600 dark:from-slate-200 dark:to-slate-400 bg-clip-text text-transparent">HEXIT</CardTitle>
            </div>
            <CardDescription className="text-muted-foreground text-lg">
                Extract dominant colors from any image on the web.
            </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex gap-2">
             <div className="relative flex-grow">
                <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="url"
                  placeholder="Paste any image URL here..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  disabled={isPending}
                  required
                  className="pl-10 w-full text-base"
                />
            </div>
            <Button type="submit" disabled={isPending} size="lg" className="font-semibold">
              {isPending ? <Loader2 className="animate-spin" /> : "Extract"}
            </Button>
          </form>

          <div className="mt-6 min-h-[350px] flex items-center justify-center rounded-lg bg-background/50 dark:bg-secondary/20 p-4 border-dashed border-2">
            {isPending && (
              <div className="w-full flex flex-col items-center justify-center text-muted-foreground">
                  <Loader2 className="w-10 h-10 animate-spin mb-4" />
                  <p className="text-lg font-medium">Analyzing your image...</p>
                  <p className="text-sm">This might take a moment.</p>
              </div>
            )}
            
            {!isPending && result && (
              <div className="w-full grid md:grid-cols-2 gap-6 items-center">
                <div data-ai-hint="abstract background" className="relative aspect-video w-full overflow-hidden rounded-lg border-2 border-dashed">
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
                     <div className="flex flex-col items-center justify-center h-full text-muted-foreground bg-secondary/30 p-4">
                      <ImageIcon className="w-12 h-12 mb-2" />
                      <span className="text-center font-medium">Could not load image preview</span>
                    </div>
                  )}
                </div>
                <div className="flex flex-col justify-center items-center gap-4">
                   <h3 className="text-lg font-semibold text-foreground">Dominant Colors</h3>
                   <div className="flex justify-center items-start gap-4 sm:gap-6">
                    {result.colors.map((color) => (
                      <div key={color} className="flex flex-col items-center gap-2 group">
                        <button onClick={() => copyToClipboard(color)}
                          className="w-24 h-24 rounded-full shadow-lg transition-transform hover:scale-110 border-4 border-background"
                          style={{ backgroundColor: color }}
                        />
                        <button
                          onClick={() => copyToClipboard(color)}
                          className="font-mono text-sm text-muted-foreground hover:text-foreground flex items-center gap-1.5"
                        >
                          {color}
                          <Copy className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                      </div>
                    ))}
                    </div>
                </div>
              </div>
            )}

            {!isPending && !result && (
              <div className="text-center text-muted-foreground">
                <ImageIcon size={48} className="mx-auto mb-4" />
                <p className="font-medium text-lg">Your extracted color palette will appear here.</p>
                <p className="text-sm">Just paste an image URL above to get started.</p>
              </div>
            )}
          </div>
        </CardContent>
        {result && !isPending && (
          <CardFooter className="justify-center pt-4">
            <p className="text-xs text-muted-foreground">Tip: Click on a color swatch or hex code to copy.</p>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
