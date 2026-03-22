"use client";

import { useEffect, useState } from "react";

interface RenderCarouselProps {
  jobId: string | null;
  iterationCount: number;
}

interface RenderImage {
  iteration: number;
  url: string;
}

export function RenderCarousel({ jobId, iterationCount }: RenderCarouselProps) {
  const [images, setImages] = useState<RenderImage[]>([]);
  const [open, setOpen] = useState(true);

  useEffect(() => {
    if (!jobId) return;

    async function loadRenders() {
      const found: RenderImage[] = [];
      for (let i = 0; i < Math.max(iterationCount, 1); i++) {
        const url = `http://localhost:8000/jobs/${jobId}/artifacts/v${i}/render.png`;
        try {
          const res = await fetch(url, { method: "GET" });
          if (res.ok) found.push({ iteration: i, url });
          // consume body to avoid leaking connections
          await res.blob();
        } catch { /* skip */ }
      }
      setImages(found);
    }

    loadRenders();
    const interval = setInterval(loadRenders, 5000);
    return () => clearInterval(interval);
  }, [jobId, iterationCount]);

  if (!jobId || images.length === 0) return null;

  return (
    <div className="border-t border-slate-200">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-4 py-2 text-xs font-medium text-slate-500 hover:text-slate-700 transition-colors"
      >
        <span>PyMOL Renders ({images.length})</span>
        <span>{open ? "▾" : "▸"}</span>
      </button>
      {open && (
        <div className="flex gap-2 overflow-x-auto px-4 pb-3">
          {images.map((img) => (
            <div key={img.iteration} className="shrink-0">
              <div className="relative group">
                <img
                  src={img.url}
                  alt={`v${img.iteration} render`}
                  className="h-28 w-auto rounded-lg border border-slate-200 bg-white object-contain shadow-sm"
                />
                <span className="absolute bottom-1 left-1 rounded bg-slate-800/70 px-1.5 py-0.5 text-[10px] font-mono text-white">
                  v{img.iteration}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
