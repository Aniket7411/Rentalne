import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MessageCircle, Search, X, Phone, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';
import { apiService } from '../services/api';

const WHATSAPP_NUMBER = '918169535736';
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}`;

const HelpWidget = () => {
  const [open, setOpen] = useState(false);
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const widgetRef = useRef(null);

  const fetchFaqs = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const r = await apiService.getFaqs();
      if (r.success) {
        setFaqs(r.data || []);
      } else {
        setError(r.message || 'Could not load FAQs');
      }
    } catch (e) {
      setError('Network error — please try again');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) fetchFaqs();
  }, [open, fetchFaqs]);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (widgetRef.current && !widgetRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const filtered = faqs.filter((f) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      (f.question || '').toLowerCase().includes(q) ||
      (f.answer || '').toLowerCase().includes(q)
    );
  });

  return (
    <div ref={widgetRef} className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* Popup */}
      {open && (
        <div
          className="w-80 sm:w-96 bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col"
          style={{ maxHeight: '78vh' }}
        >
          {/* Header */}
          <div className="bg-sky-500 px-5 py-4 flex items-center gap-3 flex-shrink-0">
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-bold text-base leading-tight">Help Center</p>
              <p className="text-sky-100 text-xs">Ask us anything</p>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="p-1 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>

          {/* Search */}
          <div className="px-4 py-3 border-b border-gray-100 flex-shrink-0">
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2">
              <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <input
                type="text"
                placeholder="Search for questions..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none"
              />
              {query && (
                <button onClick={() => setQuery('')} className="text-gray-400 hover:text-gray-600">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* FAQ list */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-10 gap-3">
                <div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-gray-400">Loading FAQs…</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-10 text-center gap-3">
                <MessageCircle className="w-12 h-12 text-gray-200" />
                <p className="text-sm text-red-500">{error}</p>
                <button
                  onClick={fetchFaqs}
                  className="flex items-center gap-2 px-4 py-2 bg-sky-100 hover:bg-sky-200 text-sky-700 rounded-lg text-sm font-medium transition-colors"
                >
                  <RefreshCw className="w-4 h-4" /> Retry
                </button>
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <MessageCircle className="w-14 h-14 text-gray-200 mb-3" />
                <p className="font-semibold text-gray-700 mb-1">
                  {query ? 'No results found' : 'No FAQs available'}
                </p>
                <p className="text-sm text-gray-500 mb-5">
                  {query ? 'Try a different search' : 'Contact us directly for assistance'}
                </p>
                {!query && (
                  <a
                    href={WHATSAPP_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-5 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl transition-colors text-sm shadow"
                  >
                    <Phone className="w-4 h-4" />
                    Contact on WhatsApp
                  </a>
                )}
              </div>
            ) : (
              filtered.map((faq) => {
                const id = faq._id || faq.id;
                const isExpanded = expandedId === id;
                return (
                  <div key={id} className="border border-gray-100 rounded-xl overflow-hidden">
                    <button
                      className="w-full flex items-center justify-between gap-2 px-4 py-3 text-left text-sm font-medium text-gray-800 hover:bg-gray-50 transition-colors"
                      onClick={() => setExpandedId(isExpanded ? null : id)}
                    >
                      <span className="flex-1">{faq.question}</span>
                      {isExpanded
                        ? <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        : <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />}
                    </button>
                    {isExpanded && (
                      <div className="px-4 pb-3 pt-2 text-sm text-gray-600 leading-relaxed border-t border-gray-100 bg-gray-50">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-gray-100 flex-shrink-0">
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl transition-colors text-sm shadow"
            >
              <Phone className="w-4 h-4" />
              Chat on WhatsApp
            </a>
          </div>
        </div>
      )}

      {/* Trigger button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 px-5 py-3 bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all text-sm"
      >
        <MessageCircle className="w-4 h-4" />
        Need Help
      </button>
    </div>
  );
};

export default HelpWidget;
