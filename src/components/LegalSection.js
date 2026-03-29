import React from 'react';

/** Icon-led block for policy pages (Lucide icon component). */
export function LegalSection({ icon: Icon, children, className = '' }) {
  return (
    <section
      className={`rounded-2xl border border-slate-100/80 bg-white/90 p-5 md:p-7 shadow-sm ring-1 ring-slate-100 ${className}`}
    >
      <div className="flex gap-4 md:gap-5">
        {Icon ? (
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-sky-600 text-white shadow-md"
            aria-hidden
          >
            <Icon className="h-5 w-5" strokeWidth={2.2} />
          </div>
        ) : null}
        <div className="min-w-0 flex-1 space-y-3 [&_h2]:mt-0 [&_h2]:pt-0 [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-text-dark">
          {children}
        </div>
      </div>
    </section>
  );
}
