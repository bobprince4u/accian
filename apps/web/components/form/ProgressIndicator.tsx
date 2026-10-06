"use client";

import { useEffect, useRef } from "react";
import { Check } from "lucide-react";

export interface ProgressIndicatorProps {
  steps: { id: string; shortTitle: string }[];
  current: number;
  furthest: number;
  onJump: (index: number) => void;
  disabled?: boolean;
}

export default function ProgressIndicator({ steps, current, furthest, onJump, disabled = false }: ProgressIndicatorProps) {
  const total = steps.length + 1;
  const stops = [...steps, { id: "review", shortTitle: "Review" }];
  const currentRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const button = currentRef.current;
    const strip = button?.parentElement?.parentElement;
    if (button && strip) strip.scrollTo({ left: Math.max(0, button.offsetLeft - strip.clientWidth / 2), behavior: "auto" });
  }, [current]);
  return (
    <nav aria-label="Form progress">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-sm">
        <p aria-live="polite" className="font-semibold">Step {current + 1} of {total}: {stops[current]?.shortTitle}</p>
        <span className="text-[#666666]">{current === steps.length ? "Ready to review" : "Review before you submit"}</span>
      </div>
      <div className="mb-4 h-1.5 overflow-hidden rounded-full bg-[#E0DBD2]" aria-hidden="true"><div className="progress-fill h-full origin-left bg-[#1B4FFF]" style={{ transform: `scaleX(${(current + 1) / total})` }} /></div>
      <label className="block text-sm font-medium sm:hidden" htmlFor="form-step">Go to a section</label>
      <select id="form-step" value={current} disabled={disabled} onChange={(event) => onJump(Number(event.target.value))} className="input mt-2 sm:hidden">
        {stops.map((stop, index) => <option key={stop.id} value={index} disabled={index > furthest}>{index + 1}. {stop.shortTitle}</option>)}
      </select>
      <ol className="relative hidden gap-2 overflow-x-auto py-1 sm:flex">
        {stops.map((stop, index) => <li key={stop.id} className="shrink-0">
          <button ref={index === current ? currentRef : undefined} type="button" disabled={disabled || index > furthest}
            onClick={() => onJump(index)} aria-current={index === current ? "step" : undefined}
            aria-label={`${index + 1}. ${stop.shortTitle}${index < current ? " (completed)" : ""}`}
            className={`inline-flex min-h-11 items-center gap-2 rounded-lg border px-3 text-xs font-semibold disabled:cursor-not-allowed ${index === current ? "border-[#1B4FFF] bg-[#1B4FFF] text-white" : index < current ? "border-[#1B4FFF]/30 bg-white text-[#1B4FFF]" : "border-[#D8D3C9] bg-white text-[#666666]"}`}>
            {index < current ? <Check size={14} aria-hidden="true" /> : <span aria-hidden="true">{index + 1}</span>}{stop.shortTitle}
          </button>
        </li>)}
      </ol>
    </nav>
  );
}
