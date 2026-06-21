import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../../services/api';
import {
  Loader2,
  Wrench,
  Droplets,
  Sparkles,
  Wind,
  ShieldCheck,
  Clock,
  Snowflake,
  Users,
  Zap,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../../hooks/useToast';
import { ToastContainer } from '../../components/Toast';
import ServiceCard from '../../components/ServiceCard';
import ServiceBookingModal from '../../components/ServiceBookingModal';
import ServiceDetailsModal from '../../components/ServiceDetailsModal';

/** Tabs — English chip labels; filter by keywords in title + description. */
const SERVICE_TABS = [
  {
    id: 'all',
    label: 'All Services',
    Icon: Wrench,
    match: () => true,
  },
  {
    id: 'water_leakage',
    label: 'Water Leakage Repair',
    Icon: Droplets,
    keywords: [
      'water leak',
      'water leakage',
      'leakage repair',
      'leak repair',
      'condensate',
      'drain leakage',
    ],
  },
  {
    id: 'gas_refill',
    label: 'AC Gas Refilling',
    Icon: Wind,
    keywords: ['gas refill', 'gas refilling', 'gas filling', 'refilling', 'refrigerant refill', 'ton gas'],
  },
  {
    id: 'foam_wash',
    label: 'AC Foam Wash',
    Icon: Sparkles,
    match: (s) => {
      const t = serviceText(s);
      if (/\bjet\b/.test(t)) return false;
      return t.includes('foam wash') || t.includes('foam');
    },
  },
  {
    id: 'jet_wash',
    label: 'AC Jet Wash Service',
    Icon: Sparkles,
    match: (s) => {
      const t = serviceText(s);
      return (
        t.includes('jet wash') ||
        t.includes('jet service') ||
        t.includes('jet cleaning') ||
        /\bjets?\s+wash\b/.test(t)
      );
    },
  },
  {
    id: 'repair_inspection',
    label: 'AC Repair Inspection',
    Icon: Wrench,
    match: (s) => {
      const t = serviceText(s);
      if (/\binstall|uninstall|installation|dismantl/i.test(t)) return false;
      return ['repair inspection', 'inspection', 'inspect', 'diagnostic', 'diagnostics'].some((k) =>
        t.includes(k.toLowerCase())
      );
    },
  },
  {
    id: 'split_install',
    label: 'Split AC Installation',
    Icon: Wrench,
    keywords: [
      'split ac installation',
      'installation',
      'install',
      'uninstall',
      'uninstallation',
      'dismantle',
      'mount',
    ],
  },
];

function serviceText(s) {
  return `${s.title || ''} ${s.description || ''}`.toLowerCase();
}

function matchesTab(service, tab) {
  if (tab.match) return tab.match(service);
  const text = serviceText(service);
  return tab.keywords.some((k) => text.includes(k.toLowerCase()));
}

const ServiceRequest = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [selectedService, setSelectedService] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const { toasts, removeToast, error: showError } = useToast();

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    setLoading(true);
    const response = await apiService.getServices();
    if (response.success) {
      const raw = response.data || [];
      const list = Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? raw.data : [];
      setServices(list);
    } else {
      showError('Failed to load services');
    }
    setLoading(false);
  };

  const activeTabConfig = useMemo(
    () => SERVICE_TABS.find((t) => t.id === activeTab) || SERVICE_TABS[0],
    [activeTab]
  );

  const filteredServices = useMemo(() => {
    return services.filter((s) => matchesTab(s, activeTabConfig));
  }, [services, activeTabConfig]);

  const tabCounts = useMemo(() => {
    const counts = { all: services.length };
    SERVICE_TABS.forEach((tab) => {
      if (tab.id === 'all') return;
      counts[tab.id] = services.filter((s) => matchesTab(s, tab)).length;
    });
    return counts;
  }, [services]);

  const handleAddClick = (service) => {
    setSelectedService(service);
    setShowBookingModal(true);
  };

  const handleViewDetails = (service) => {
    setSelectedService(service);
    setShowDetailsModal(true);
  };

  const handleBookingSubmit = async (bookingData) => {
    const response = await apiService.addCartService({
      serviceId: bookingData.serviceId,
      bookingDetails: {
        date: bookingData.date,
        time: bookingData.time,
        address: bookingData.address,
        addressType: bookingData.addressType,
        contactName: bookingData.contactName,
        contactPhone: bookingData.contactPhone,
        paymentOption: bookingData.paymentOption,
      },
    });
    if (!response.success) {
      throw new Error(response.message || 'Could not add to cart');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white">
        <Loader2 className="w-10 h-10 animate-spin text-sky-400 mb-4" aria-hidden />
        <p className="text-slate-400 text-sm">Loading services…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 pb-24 sm:pb-16">
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      {/* Hero — stacks on mobile; two columns on lg */}
      <section className="relative overflow-hidden bg-gradient-to-br from-sky-500 via-sky-600 to-sky-800 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_70%_-10%,rgba(255,255,255,0.22),transparent)]" />
        <div className="absolute inset-0 opacity-[0.15]" aria-hidden>
          <div
            className="h-full w-full"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 20v10h10V20H20zm10-20v10h10V0h-10zM0 20v10h10V20H0zm0-20v10h10V0H0z' fill='%23ffffff' fill-opacity='0.4'/%3E%3C/svg%3E")`,
            }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-12 sm:pt-14 sm:pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12 lg:items-center">
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-medium ring-1 ring-white/25">
                  <Snowflake className="h-3.5 w-3.5 shrink-0" aria-hidden />
                  AC experts
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-medium ring-1 ring-white/25">
                  <Droplets className="h-3.5 w-3.5 shrink-0" aria-hidden />
                  Leaks &amp; gas care
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-medium ring-1 ring-white/25">
                  <Wrench className="h-3.5 w-3.5 shrink-0" aria-hidden />
                  Repairs &amp; installs
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-3">
                AC Repair &amp; Maintenance Services
              </h1>
              <p className="text-base sm:text-lg text-sky-100/95 leading-relaxed max-w-xl">
                Professional AC services with certified technicians. Use the filters below to find gas refill, jet or
                foam wash, leak repair, inspection, or installation packages.
              </p>

              <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4">
                {[
                  { Icon: Clock, label: '1 hour service', sub: 'Quick visit' },
                  { Icon: ShieldCheck, label: 'Certified tech', sub: 'Trusted work' },
                  { Icon: Users, label: '10K+ customers', sub: 'Happy homes' },
                  { Icon: Zap, label: 'All AC types', sub: 'Split & window' },
                ].map(({ Icon: F, label, sub }) => (
                  <div
                    key={label}
                    className="rounded-2xl bg-white/12 backdrop-blur-sm px-4 py-3 ring-1 ring-white/20"
                  >
                    <F className="h-6 w-6 text-white mb-2" strokeWidth={2} aria-hidden />
                    <p className="text-sm font-semibold text-white leading-tight">{label}</p>
                    <p className="text-xs text-sky-100/80 mt-0.5">{sub}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.05 }}
              className="relative rounded-2xl overflow-hidden shadow-2xl shadow-sky-900/30 ring-2 ring-white/30"
            >
              <img
                src="/bannerright.png"
                alt="AC technician at work"
                className="w-full h-[220px] min-[400px]:h-[260px] sm:h-[320px] lg:h-[380px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/75 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6 pointer-events-none">
                <p className="text-lg sm:text-xl font-bold text-white flex items-center gap-2 drop-shadow-md">
                  <Droplets className="h-6 w-6 text-sky-200 shrink-0" aria-hidden />
                  Get service within 1 hour
                </p>
                <p className="text-sm text-slate-200 mt-1">Certified technicians at your doorstep</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Fixed filter bar — single scrollable row below navbar */}
      <div className="fixed top-16 md:top-20 left-0 right-0 z-40 bg-white border-b border-slate-200 shadow-sm">
        <div
          className="flex gap-2 overflow-x-auto px-4 py-2.5 [&::-webkit-scrollbar]:hidden"
          role="tablist"
          aria-label="Service categories"
          style={{ scrollbarWidth: 'none' }}
        >
          {SERVICE_TABS.map((tab) => {
            const Icon = tab.Icon;
            const isActive = activeTab === tab.id;
            const count = tab.id === 'all' ? tabCounts.all : tabCounts[tab.id] ?? 0;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-semibold whitespace-nowrap flex-shrink-0 transition-all ${
                  isActive
                    ? 'bg-sky-500 text-white shadow-sm shadow-sky-500/30'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 ring-1 ring-slate-200'
                }`}
              >
                <Icon className="h-3.5 w-3.5 shrink-0" strokeWidth={2} aria-hidden />
                {tab.label}
                <span className="tabular-nums opacity-75">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-4 relative z-10">
        {/* Service grid */}
        <div className="mt-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-neutral-900">
              Available Services
              <span className="text-sky-600 tabular-nums"> ({filteredServices.length})</span>
            </h2>
            {activeTab !== 'all' && (
              <button
                type="button"
                onClick={() => setActiveTab('all')}
                className="self-start text-sm font-semibold text-sky-600 hover:text-sky-700"
              >
                Show all
              </button>
            )}
          </div>

          <AnimatePresence mode="wait">
            {filteredServices.length > 0 ? (
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 sm:gap-6"
              >
                {filteredServices.map((service, index) => (
                  <motion.div
                    key={service._id || service.id}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(index * 0.04, 0.2) }}
                  >
                    <ServiceCard service={service} onAddClick={handleAddClick} onView={handleViewDetails} />
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-300 bg-white py-14 px-6 text-center"
              >
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
                  {React.createElement(activeTabConfig.Icon, {
                    className: 'h-8 w-8 text-slate-400',
                    'aria-hidden': true,
                  })}
                </div>
                <p className="text-lg font-semibold text-neutral-900">No packages in this category</p>
                <p className="mt-2 max-w-md text-sm text-slate-500">
                  Try another tab or view all services.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab('all')}
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-sky-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-sky-500/25 hover:bg-sky-600 transition-colors"
                >
                  <Wrench className="h-4 w-4" aria-hidden />
                  All services
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {selectedService && showDetailsModal && (
        <ServiceDetailsModal
          service={selectedService}
          isOpen={showDetailsModal}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedService(null);
          }}
          onAdd={() => {
            setShowDetailsModal(false);
            setShowBookingModal(true);
          }}
        />
      )}

      {selectedService && showBookingModal && (
        <ServiceBookingModal
          service={selectedService}
          isOpen={showBookingModal}
          onClose={() => {
            setShowBookingModal(false);
            setSelectedService(null);
          }}
          onSubmit={handleBookingSubmit}
        />
      )}
    </div>
  );
};

export default ServiceRequest;
