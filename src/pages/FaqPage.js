import React, { useState, useEffect } from 'react';
import { ChevronDown, Loader2 } from 'lucide-react';
import { apiService } from '../services/api';

const FaqPage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState(null);

  useEffect(() => {
    (async () => {
      const r = await apiService.getFaqs();
      if (r.success) setItems(r.data || []);
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-sky-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Frequently asked questions</h1>
        <p className="text-slate-600 mb-8">Answers from our help centre.</p>
        <div className="space-y-3">
          {items.length === 0 ? (
            <p className="text-slate-500">No FAQs yet. Please check back later.</p>
          ) : (
            items.map((f) => {
              const id = f._id || f.id;
              const isOpen = openId === id;
              return (
                <div
                  key={id}
                  className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden"
                >
                  <button
                    type="button"
                    className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left font-semibold text-slate-900 hover:bg-slate-50"
                    onClick={() => setOpenId(isOpen ? null : id)}
                  >
                    <span>{f.question}</span>
                    <ChevronDown
                      className={`w-5 h-5 shrink-0 text-slate-400 transition ${isOpen ? 'rotate-180' : ''}`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-4 text-slate-600 text-sm leading-relaxed border-t border-slate-100 pt-3">
                      {f.answer}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default FaqPage;
