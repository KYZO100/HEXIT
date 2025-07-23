import ColorExtractor from '@/components/color-extractor';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-8 bg-background dark:bg-grid-white/[0.05] bg-grid-black/[0.02]">
      <div className="absolute pointer-events-none inset-0 flex items-center justify-center bg-background [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
      <ColorExtractor />
    </main>
  );
}
