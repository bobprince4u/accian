import { ChevronDown } from "lucide-react";

/** Native disclosure keeps keyboard interaction and visibility in sync. */
export default function FaqItem({ question, answer }: { question: string; answer: string }) {
  return (
    <details className="group rounded-xl border border-[#D8D3C9] bg-white open:border-[#1B4FFF]/40">
      <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 rounded-xl px-5 py-4 text-sm font-semibold text-[#0D0D0D]">
        {question}
        <ChevronDown size={18} aria-hidden="true" className="shrink-0 text-[#1B4FFF] transition-transform group-open:rotate-180" />
      </summary>
      <p className="mx-5 mb-5 border-t border-[#E8E4DC] pt-4 text-sm text-[#555555]">{answer}</p>
    </details>
  );
}
