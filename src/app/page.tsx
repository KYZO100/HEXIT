import ColorExtractor from '@/components/color-extractor';
import { Card, CardContent } from '@/components/ui/card';

export default function Home() {
  return (
    <main className="relative flex min-h-screen w-full flex-col items-center justify-start py-24 overflow-hidden bg-background">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-black [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
        <div className="absolute bottom-auto left-auto right-0 top-0 h-[500px] w-[500px] -translate-x-[30%] translate-y-[20%] rounded-full bg-[rgba(0,128,255,0.5)] opacity-50 blur-[80px]"></div>
      </div>
      <ColorExtractor />

      <div className="w-full max-w-5xl z-10 p-4 mt-20">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-b from-neutral-50 to-neutral-400 bg-clip-text text-transparent">
            API Documentation
          </h2>
          <p className="mt-4 text-lg text-neutral-300 max-w-2xl mx-auto">
            Integrate HEXIT's color extraction directly into your application.
          </p>
        </div>

        <Card className="w-full bg-black/30 backdrop-blur-sm border-white/10 text-neutral-300">
          <CardContent className="p-8 space-y-8">
            <div>
              <h3 className="text-2xl font-semibold text-white mb-3">Endpoint</h3>
              <p className="mb-4">
                Make a <code className="font-mono bg-neutral-800/80 border border-neutral-700 text-amber-300 px-2 py-1 rounded-md">GET</code> request to the following URL:
              </p>
              <pre className="bg-neutral-900/80 p-4 rounded-lg border border-neutral-700 text-white overflow-x-auto">
                <code>/v2?url=&lt;your_image_url&gt;</code>
              </pre>
            </div>

            <div>
              <h3 className="text-2xl font-semibold text-white mb-3">Query Parameters</h3>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <code className="font-mono bg-neutral-800/80 border border-neutral-700 text-amber-300 px-2 py-1 rounded-md">url</code> (required): The direct, publicly accessible URL of the image to analyze.
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-2xl font-semibold text-white mb-3">Example Request</h3>
              <pre className="bg-neutral-900/80 p-4 rounded-lg border border-neutral-700 text-white overflow-x-auto">
                <code>{`fetch('/v2?url=https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d')`}</code>
              </pre>
            </div>

            <div>
              <h3 className="text-2xl font-semibold text-white mb-3">Success Response (200 OK)</h3>
              <pre className="bg-neutral-900/80 p-4 rounded-lg border border-neutral-700 text-white overflow-x-auto">
                <code>
{`{
  "imageUrl": "https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d",
  "colors": [
    "#384350",
    "#788390"
  ]
}`}
                </code>
              </pre>
            </div>
             <div>
              <h3 className="text-2xl font-semibold text-white mb-3">Error Response (4xx/5xx)</h3>
              <pre className="bg-neutral-900/80 p-4 rounded-lg border border-neutral-700 text-white overflow-x-auto">
                <code>
{`{
  "error": "Descriptive error message about what went wrong."
}`}
                </code>
              </pre>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
