import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Scale, Shield } from 'lucide-react';

const ADDRESS =
  'Shop No 3 Sai Prasad Building, Hanuman Nagar, Goregaon West, Mumbai 400104, India';

const LegalDocLayout = ({ title, lastUpdated, children, icon: TitleIcon = Scale }) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 py-10 md:py-14">
      <div className="mx-auto w-full max-w-3xl">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-sky-600 transition hover:text-sky-800"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>

        <header className="relative mt-8 overflow-hidden rounded-2xl bg-gradient-to-br from-sky-500 via-sky-600 to-blue-700 px-6 py-8 text-white shadow-xl md:px-10 md:py-10">
          <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-4 left-1/2 h-24 w-48 -translate-x-1/2 rounded-full bg-sky-300/20 blur-2xl" />
          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-6">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15 ring-2 ring-white/30 backdrop-blur-sm">
              <TitleIcon className="h-7 w-7 text-white" strokeWidth={2} />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight md:text-4xl">{title}</h1>
              {lastUpdated && (
                <p className="mt-2 flex items-center gap-2 text-sm text-sky-100">
                  <Shield className="h-4 w-4 shrink-0 opacity-90" />
                  Last updated: {lastUpdated}
                </p>
              )}
            </div>
          </div>
        </header>

        <div className="mt-8 space-y-6 md:space-y-8 rounded-2xl border border-slate-100 bg-white p-6 shadow-lg md:p-10 [&_a]:text-sky-600 [&_a]:hover:underline">
          {children}
        </div>

        <footer className="mt-10 rounded-2xl border border-slate-100 bg-slate-50/80 px-5 py-6 text-sm text-slate-600 shadow-sm md:px-8">
          <p className="font-semibold text-slate-800">ASH Enterprises</p>
          <p className="mt-2 leading-relaxed">{ADDRESS}</p>
          <p className="mt-3 flex flex-wrap gap-x-3 gap-y-1">
            <a href="mailto:support@ashenterprises.in" className="text-sky-600 hover:underline">
              support@ashenterprises.in
            </a>
            <span className="text-slate-300">·</span>
            <a href="tel:+918169535736" className="text-sky-600 hover:underline">
              +91 8169535736
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
};

export default LegalDocLayout;
export { ADDRESS };
