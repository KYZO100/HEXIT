"use client";

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Image as ImageIcon, Palette, Copy } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Separator } from '@/components/ui/separator';
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
    <div className="w-full max-w-2xl">
      <Card className="w-full shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
                <Palette className="w-8 h-8 text-primary" />
            </div>
            <div className="flex flex-col">
              <CardTitle className="text-3xl font-headline tracking-tight text-primary">ColorEye</CardTitle>
              <CardDescription>Extract dominant colors from any image.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
            <Input
              type="url"
              placeholder="e.g., https://images.unsplash.com/..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={isPending}
              required
              className="flex-grow"
            />
            <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
              {isPending ? <Loader2 className="animate-spin" /> : "Extract Colors"}
            </Button>
          </form>

          <Separator className="my-6" />

          <div className="min-h-[300px] flex items-center justify-center rounded-lg bg-background p-4">
            {isPending && (
              <div className="w-full space-y-4 animate-pulse">
                  <div className="flex justify-center items-center h-48 bg-muted rounded-md">
                      <ImageIcon className="w-12 h-12 text-muted-foreground" />
                  </div>
                  <div className="flex justify-center gap-4">
                      <div className="w-32 h-32 bg-muted rounded-md"></div>
                      <div className="w-32 h-32 bg-muted rounded-md"></div>
                  </div>
              </div>
            )}
            
            {!isPending && result && (
              <div className="w-full">
                <div data-ai-hint="abstract background" className="relative aspect-video w-full overflow-hidden rounded-lg mb-6 border bg-muted/30">
                  {result.imageUrl && !imageError ? (
                    <Image
                      src={result.imageUrl}
                      alt="Analyzed image"
                      className="h-full w-full object-contain"
                      fill
                      onError={() => setImageError(true)}
                    />
                  ) : (
                     <div className="flex items-center justify-center h-full text-muted-foreground">
                      <ImageIcon className="w-12 h-12" />
                      <span className="ml-2">Could not load image</span>
                    </div>
                  )}
                </div>
                <div className="flex justify-center items-start gap-4 sm:gap-8">
                  {result.colors.map((color) => (
                    <div key={color} className="flex flex-col items-center gap-2 group">
                      <div
                        className="w-24 h-24 sm:w-32 sm:h-32 rounded-lg shadow-md transition-transform hover:scale-105 border"
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
            )}

            {!isPending && !result && (
              <div className="text-center text-muted-foreground">
                <Palette size={48} className="mx-auto mb-4" />
                <p className="font-medium">Your extracted colors will appear here.</p>
                <p className="text-sm">Enter an image URL above to get started.</p>
              </div>
            )}
          </div>
        </CardContent>
        {result && !isPending && (
          <CardFooter className="justify-center pt-4">
            <p className="text-xs text-muted-foreground">Click on a hex code to copy.</p>

          </CardFooter>
        )}
      </Card>
    </div>
  );
}
