"use client";

import { Slider } from "@/components/ui/slider";

interface IterationSliderProps {
  value: number;
  max: number;
  onChange: (value: number) => void;
}

export function IterationSlider({ value, max, onChange }: IterationSliderProps) {
  return (
    <div className="flex items-center gap-3 border-t border-border bg-gradient-to-r from-blue-50/50 to-indigo-50/50 px-4 py-2.5">
      <span className="text-xs font-mono font-medium text-blue-600 whitespace-nowrap">
        v{value}
      </span>
      <Slider
        value={[value]}
        min={0}
        max={max}
        step={1}
        onValueChange={(v) => onChange(Array.isArray(v) ? v[0] : v)}
        className="flex-1"
      />
      <span className="text-xs font-mono font-medium text-blue-600 whitespace-nowrap">
        v{max}
      </span>
    </div>
  );
}
