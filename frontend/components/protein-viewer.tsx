"use client";

import { useEffect, useRef } from "react";
import Script from "next/script";

interface ProteinViewerProps {
  jobId: string | null;
  iteration: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const $3Dmol: any;

export function ProteinViewer({ jobId, iteration }: ProteinViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const viewerRef = useRef<any>(null);

  useEffect(() => {
    if (!jobId || !containerRef.current) return;
    if (typeof $3Dmol === "undefined") return;

    const url = `http://localhost:8000/jobs/${jobId}/artifacts/v${iteration}/design_0.pdb`;

    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error("PDB not found");
        return res.text();
      })
      .then((pdbData) => {
        if (!containerRef.current) return;

        if (viewerRef.current) {
          viewerRef.current.removeAllModels();
        } else {
          viewerRef.current = $3Dmol.createViewer(containerRef.current, {
            backgroundColor: "white",
          });
        }

        viewerRef.current.addModel(pdbData, "pdb");
        viewerRef.current.setStyle({}, { cartoon: { color: "spectrum" } });
        viewerRef.current.zoomTo();
        viewerRef.current.render();
      })
      .catch(() => {});
  }, [jobId, iteration]);

  if (!jobId) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 bg-gradient-to-br from-blue-50/30 to-indigo-50/30">
        <div className="text-4xl opacity-20">🧬</div>
        <p className="text-sm text-muted-foreground">
          No protein loaded. Start a design to visualize.
        </p>
      </div>
    );
  }

  return (
    <>
      <Script src="https://3Dmol.org/build/3Dmol-min.js" strategy="beforeInteractive" />
      <div ref={containerRef} className="flex-1 min-h-0 relative" />
    </>
  );
}
