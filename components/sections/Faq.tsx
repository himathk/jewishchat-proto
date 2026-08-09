"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { FAQS } from "@/lib/data/faqs";
import { cn } from "@/lib/utils/cn";

export function Faq() {
  const [open, setOpen] = useState<string | null>(FAQS[0].id);

  return (
    <section className="py-24 lg:py-32">
      <div className="mx-auto grid max-w-[1400px] gap-14 px-5 md:px-8 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-24">
        <SectionHeading
          eyebrow="Questions"
          title="The things people ask first."
          description="Everything else lives in the help centre."
        />

        <div className="border-surface-line border-t">
          {FAQS.map((faq) => {
            const isOpen = open === faq.id;
            return (
              <div key={faq.id} className="border-surface-line border-b">
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : faq.id)}
                  aria-expanded={isOpen}
                  className="group flex w-full items-center justify-between gap-6 py-6 text-left"
                >
                  <span
                    className={cn(
                      "font-display text-[17px] leading-snug transition-colors duration-300",
                      isOpen ? "text-brand-deep" : "text-ink-1 group-hover:text-brand-deep",
                    )}
                  >
                    {faq.question}
                  </span>
                  <span
                    className={cn(
                      "grid size-8 shrink-0 place-items-center rounded-full border transition-all duration-500 ease-[var(--ease-out-expo)]",
                      isOpen
                        ? "border-brand-green bg-brand-green rotate-45 text-white"
                        : "border-surface-line-strong text-ink-3 group-hover:border-brand-green/50",
                    )}
                  >
                    <Plus size={15} strokeWidth={2.1} />
                  </span>
                </button>

                <div
                  className={cn(
                    "grid transition-[grid-template-rows,opacity] duration-500 ease-[var(--ease-out-expo)]",
                    isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
                  )}
                >
                  <div className="overflow-hidden">
                    <p className="text-ink-3 max-w-xl pr-12 pb-7 text-[14.5px] leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
