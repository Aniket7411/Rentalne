import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Star, Loader2 } from 'lucide-react';
import { apiService } from '../services/api';
import ServiceCard from '../components/ServiceCard';
import ServiceBookingModal from '../components/ServiceBookingModal';
import SingleScreen from './SingleScreen/SingleScreen';
import { browsePath, BROWSE_CATEGORY } from '../utils/browseUrls';

const brands = [
  { src: '/blustarlogo.png', alt: 'Blue Star' },
  { src: '/daikinlogo.png', alt: 'Daikin' },
  { src: '/samsung.png', alt: 'Samsung' },
  { src: '/hitachilogo.png', alt: 'Hitachi' },
  { src: '/whirlphoollogo.png', alt: 'Whirlpool' },
  { src: '/voltaslogo.png', alt: 'Voltas' },
  { src: '/carrierlogo.png', alt: 'Carrier' },
];

const Home = () => {
  const [, setFeaturedACs] = useState([]);
  const [services, setServices] = useState([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [selectedService, setSelectedService] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [brandsPaused, setBrandsPaused] = useState(false);
  const appliancesGridRef = useRef(null);
  const [cursorRatio, setCursorRatio] = useState(0.5);

  const handleAppliancesMouseMove = useCallback((e) => {
    const rect = appliancesGridRef.current?.getBoundingClientRect();
    if (!rect) return;
    setCursorRatio(Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)));
  }, []);

  const handleAppliancesMouseLeave = useCallback(() => setCursorRatio(0.5), []);

  useEffect(() => {
    const loadData = async () => {
      const [acsResponse, servicesResponse] = await Promise.all([
        apiService.getACs(),
        apiService.getServices(),
      ]);

      if (acsResponse.success) {
        const acs = Array.isArray(acsResponse.data) ? acsResponse.data : (Array.isArray(acsResponse.data?.data) ? acsResponse.data.data : []);
        setFeaturedACs(acs.slice(0, 6));
      }

      if (servicesResponse.success) {
        const svcs = Array.isArray(servicesResponse.data) ? servicesResponse.data : (Array.isArray(servicesResponse.data?.data) ? servicesResponse.data.data : []);
        setServices(svcs.slice(0, 3));
      }
      setLoadingServices(false);
    };
    loadData();
  }, []);


  const handleServiceAdd = (service) => {
    setSelectedService(service);
    setShowBookingModal(true);
  };

  const handleBookingSubmit = async (bookingData) => {
    try {
      const response = await apiService.createServiceBooking(bookingData);
      if (response.success) {
        setShowBookingModal(false);
        setSelectedService(null);
        // Show success message or navigate
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error('Booking error:', error);
    }
  };


  const testimonials = [
    {
      name: 'Rajesh Kumar',
      location: 'Mumbai',
      rating: 5,
      text: 'Great service! Found the perfect AC for my home. The rental process was smooth and hassle-free.',
    },
    {
      name: 'Priya Sharma',
      location: 'Delhi',
      rating: 5,
      text: 'Excellent repair service. The technician was professional and fixed my AC quickly.',
    },
    {
      name: 'Amit Patel',
      location: 'Bangalore',
      rating: 5,
      text: 'Best AC rental platform. Affordable prices and reliable vendors. Highly recommended!',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Banner Section — full-bleed under global main padding */}
      <div className="-mx-4 w-auto sm:-mx-6 lg:-mx-8" style={{ minHeight: '100vh' }}>
        <SingleScreen />
      </div>

      {/* Brand Logos Infinite Carousel */}
      <style>{`
        @keyframes brandScroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .brand-track {
          animation: brandScroll 22s linear infinite;
        }
      `}</style>
      <section className="py-8 sm:py-10 bg-white border-t border-b border-gray-100">
        <div className="text-center mb-6 px-4">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800">Brands We Work With</h2>
        </div>
        <div
          className="overflow-hidden cursor-pointer"
          onMouseEnter={() => setBrandsPaused(true)}
          onMouseLeave={() => setBrandsPaused(false)}
        >
          <div
            className="brand-track flex items-center"
            style={{
              width: 'max-content',
              animationPlayState: brandsPaused ? 'paused' : 'running',
              gap: '3rem',
            }}
          >
            {[...brands, ...brands].map((brand, i) => (
              <div
                key={i}
                className="flex-shrink-0 flex items-center justify-center px-4 sm:px-6"
              >
                <img
                  src={brand.src}
                  alt={brand.alt}
                  className="h-10 sm:h-12 md:h-14 w-auto object-contain transition-all duration-300"
                  style={{ maxWidth: '120px' }}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Appliances on Rent */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8 md:mb-12"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">Appliances on rent</h2>
            <p className="text-sm sm:text-base text-gray-500">Checkout our huge collection of appliances on rent</p>
          </motion.div>

          <div
            ref={appliancesGridRef}
            onMouseMove={handleAppliancesMouseMove}
            onMouseLeave={handleAppliancesMouseLeave}
            className="flex flex-col md:flex-row gap-6 md:gap-8"
          >

            {/* ── Air Conditioners ── */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="flex flex-col gap-3"
              style={{ flex: 1.5 - cursorRatio, minWidth: 0, transition: 'flex 0.4s cubic-bezier(0.25,0.46,0.45,0.94)' }}
            >
              {/* Main hero card */}
              <Link to={browsePath(BROWSE_CATEGORY.AC)} className="group block relative overflow-hidden rounded-2xl shadow-md hover:shadow-xl transition-all duration-300">
                <div className="relative h-44 sm:h-52 md:h-56">
                  <motion.img
                    src="/acnewimage.jpeg" alt="Air Conditioners"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    initial={{ scale: 1.08 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.7, ease: 'easeOut' }}
                  />
                  <div className="absolute bottom-0 left-0 p-4 text-white">
                    <h3 className="text-lg sm:text-xl font-bold mb-0.5 drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">Air Conditioners</h3>
                    <p className="text-xs text-gray-100 mb-2 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">Stay cool &amp; comfortable</p>
                    <ArrowRight className="w-5 h-5 drop-shadow-md" />
                  </div>
                </div>
              </Link>
              {/* Subcategory cards */}
              <div className="grid grid-cols-2 gap-3">
                <Link to={`${browsePath(BROWSE_CATEGORY.AC)}&type=Split`} className="group block relative overflow-hidden rounded-xl shadow hover:shadow-lg transition-all duration-300">
                  <div className="relative h-24 sm:h-28">
                    <motion.img
                      src="/splitacnew.png" alt="Split AC"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      initial={{ scale: 1.08 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.7, ease: 'easeOut' }}
                    />
                    <span className="absolute bottom-2 left-3 text-white text-xs font-semibold drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">Split AC</span>
                  </div>
                </Link>
                <Link to={`${browsePath(BROWSE_CATEGORY.AC)}&type=Window`} className="group block relative overflow-hidden rounded-xl shadow hover:shadow-lg transition-all duration-300">
                  <div className="relative h-24 sm:h-28">
                    <motion.img
                      src="/windowacnew.png" alt="Window AC"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      initial={{ scale: 1.08 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.7, ease: 'easeOut' }}
                    />
                    <span className="absolute bottom-2 left-3 text-white text-xs font-semibold drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">Window AC</span>
                  </div>
                </Link>
              </div>
            </motion.div>

            {/* ── Refrigerators ── */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="flex flex-col gap-3"
              style={{ flex: 1, minWidth: 0 }}
            >
              <Link to={browsePath(BROWSE_CATEGORY.REFRIGERATOR)} className="group block relative overflow-hidden rounded-2xl shadow-md hover:shadow-xl transition-all duration-300">
                <div className="relative h-44 sm:h-52 md:h-56">
                  <motion.img
                    src="/refrigeratorneww.png" alt="Refrigerators"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    initial={{ scale: 1.08 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.7, ease: 'easeOut' }}
                  />
                  <div className="absolute bottom-0 left-0 p-4 text-white">
                    <h3 className="text-lg sm:text-xl font-bold mb-0.5 drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">Refrigerators</h3>
                    <p className="text-xs text-gray-100 mb-2 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">Fresh storage solutions</p>
                    <ArrowRight className="w-5 h-5 drop-shadow-md" />
                  </div>
                </div>
              </Link>
              <div className="grid grid-cols-2 gap-3">
                <Link to={`${browsePath(BROWSE_CATEGORY.REFRIGERATOR)}&type=Single+Door`} className="group block relative overflow-hidden rounded-xl shadow hover:shadow-lg transition-all duration-300">
                  <div className="relative h-24 sm:h-28">
                    <motion.img
                      src="/singledoor.jfif" alt="Single Door"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      initial={{ scale: 1.08 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.7, ease: 'easeOut' }}
                    />
                    <span className="absolute bottom-2 left-3 text-white text-xs font-semibold drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">Single Door</span>
                  </div>
                </Link>
                <Link to={`${browsePath(BROWSE_CATEGORY.REFRIGERATOR)}&type=Double+Door`} className="group block relative overflow-hidden rounded-xl shadow hover:shadow-lg transition-all duration-300">
                  <div className="relative h-24 sm:h-28">
                    <motion.img
                      src="/doublerefridgenew.png" alt="Double Door"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      initial={{ scale: 1.08 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.7, ease: 'easeOut' }}
                    />
                    <span className="absolute bottom-2 left-3 text-white text-xs font-semibold drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">Double Door</span>
                  </div>
                </Link>
              </div>
            </motion.div>

            {/* ── Washing Machines ── */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex flex-col gap-3"
              style={{ flex: 0.5 + cursorRatio, minWidth: 0, transition: 'flex 0.4s cubic-bezier(0.25,0.46,0.45,0.94)' }}
            >
              <Link to={browsePath(BROWSE_CATEGORY.WASHING_MACHINE)} className="group block relative overflow-hidden rounded-2xl shadow-md hover:shadow-xl transition-all duration-300">
                <div className="relative h-44 sm:h-52 md:h-56">
                  <motion.img
                    src="/washingmahineee.png" alt="Washing Machines"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    initial={{ scale: 1.08 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.7, ease: 'easeOut' }}
                  />
                  <div className="absolute bottom-0 left-0 p-4 text-white">
                    <h3 className="text-lg sm:text-xl font-bold mb-0.5 drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">Washing Machines</h3>
                    <p className="text-xs text-gray-100 mb-2 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">Clean clothes effortlessly</p>
                    <ArrowRight className="w-5 h-5 drop-shadow-md" />
                  </div>
                </div>
              </Link>
              <div className="grid grid-cols-2 gap-3">
                <Link to={`${browsePath(BROWSE_CATEGORY.WASHING_MACHINE)}&type=Automatic`} className="group block relative overflow-hidden rounded-xl shadow hover:shadow-lg transition-all duration-300">
                  <div className="relative h-24 sm:h-28">
                    <motion.img
                      src="/fullywashingnew.png" alt="Fully Automatic"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      initial={{ scale: 1.08 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.7, ease: 'easeOut' }}
                    />
                    <span className="absolute bottom-2 left-3 text-white text-xs font-semibold drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">Fully Automatic</span>
                  </div>
                </Link>
                <Link to={`${browsePath(BROWSE_CATEGORY.WASHING_MACHINE)}&type=Semi+automatic`} className="group block relative overflow-hidden rounded-xl shadow hover:shadow-lg transition-all duration-300">
                  <div className="relative h-24 sm:h-28">
                    <motion.img
                      src="/semiwahingnew.png" alt="Semi-Automatic"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      initial={{ scale: 1.08 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.7, ease: 'easeOut' }}
                    />
                    <span className="absolute bottom-2 left-3 text-white text-xs font-semibold drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">Semi-Automatic</span>
                  </div>
                </Link>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* Featured ACs */}
      {/* <section className="py-12 sm:py-16 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 md:mb-12"
          >
            <div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-text-dark mb-2">Featured ACs</h2>
              <p className="text-sm sm:text-base text-text-light">Discover our premium collection of air conditioners</p>
            </div>
            <Link
              to={defaultBrowsePath()}
              className="mt-4 sm:mt-0 text-primary-blue hover:text-primary-blue-light flex items-center space-x-2 font-semibold group transition-all"
            >
              <span>View All</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 lg:gap-8">
            {featuredACs.map((ac) => (
              <ACCard key={ac.id || ac._id} ac={ac} />
            ))}
          </div>
        </div>
      </section> */}


      {/* <InstallCard /> */}





      {/* Why Mumbai Trusts ASH Enterprises */}
      <section className="py-12 sm:py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 text-center mb-8 md:mb-12"
          >
            Why Mumbai Trusts ASH Enterprises
          </motion.h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {[
              {
                title: 'Zero Hidden Costs',
                desc: 'Fixed prices. You pay exactly what you see. ₹149 for visits, ₹449 for service. No surprises.',
                bg: 'bg-blue-50',
              },
              {
                title: 'Free Maintenance on Rentals',
                desc: 'Renting? If it stops cooling, we fix or replace it within 24 hours for free.',
                bg: 'bg-cyan-50',
              },
              {
                title: 'Lab-Grade Hygiene',
                desc: 'We use industrial Foam Wash technology to remove 99.9% of hidden dust and mold.',
                bg: 'bg-purple-50',
              },
              {
                title: 'Same-Day Service',
                desc: 'We prioritize breakdowns. Our tech-enabled dispatch gets an expert to you fast.',
                bg: 'bg-yellow-50',
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className={`${item.bg} rounded-2xl p-6 shadow-sm`}
              >
                <h3 className="text-lg font-bold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="pt-12 sm:pt-16 pb-4 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8 md:mb-12"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">AC Repair &amp; Maintenance Services</h2>
            <p className="text-gray-500 mb-4">Professional AC services at your doorstep</p>
            <Link
              to="/service-request"
              className="inline-flex items-center gap-2 text-primary-blue hover:text-primary-blue-light font-semibold group transition-all"
            >
              <span>View All Services</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>

          {loadingServices ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary-blue" />
            </div>
          ) : (() => {
            const fallbackServices = [
              {
                _id: 'fb1',
                title: 'AC Gas Refill',
                description: 'Recharge your AC with the correct refrigerant gas for optimal cooling performance.',
                price: 999,
                originalPrice: 1299,
                badge: 'Most Booked',
                features: ['Refrigerant top-up', 'Leak check included', 'Cooling test after refill'],
                image: null,
              },
              {
                _id: 'fb2',
                title: 'AC Deep Cleaning (Foam Wash)',
                description: 'Industrial-grade foam wash that removes 99.9% of hidden dust, mold and bacteria.',
                price: 599,
                originalPrice: 799,
                badge: 'Visit Within 1 Hour',
                features: ['Filter & coil deep clean', 'Foam wash technology', 'Improves air quality'],
                image: null,
              },
              {
                _id: 'fb3',
                title: 'AC Service & Checkup',
                description: 'Full diagnostic service to ensure your AC runs smoothly and efficiently.',
                price: 449,
                originalPrice: null,
                badge: null,
                features: ['20-point inspection', 'Electrical check', 'Performance report'],
                image: null,
              },
            ];
            const displayServices = services.length > 0 ? services : fallbackServices;
            return (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 items-stretch">
                {displayServices.map((service, index) => (
                  <motion.div className="flex w-full"
                    key={service._id || service.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <ServiceCard service={service} onAddClick={handleServiceAdd} />
                  </motion.div>
                ))}
              </div>
            );
          })()}
        </div>
      </section>

      {/* Features Section */}
      {/* <section className="py-12 sm:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-text-dark mb-4">Why Choose Us?</h2>
            <p className="text-lg text-text-light max-w-2xl mx-auto">
              Experience premium AC rental and service solutions tailored to your needs
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {[
              {
                icon: Shield,
                title: 'Trusted & Reliable',
                description: 'Verified vendors and certified technicians for your peace of mind',
                color: 'from-blue-500 to-blue-600',
              },
              {
                icon: Zap,
                title: 'Quick Service',
                description: 'Fast installation and repair services at your convenience',
                color: 'from-yellow-500 to-orange-500',
              },
              {
                icon: Users,
                title: '24/7 Support',
                description: 'Round-the-clock customer support whenever you need us',
                color: 'from-green-500 to-emerald-600',
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:-translate-y-2"
              >
                <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 shadow-lg`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-text-dark mb-2">{feature.title}</h3>
                <p className="text-text-light">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section> */}

      {/* Service Booking Modal */}
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

      {/* Testimonials */}
      <section className="py-12 sm:py-16 bg-gradient-to-b from-white via-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-text-dark mb-4">What Our Customers Say</h2>
            <p className="text-lg text-text-light max-w-2xl mx-auto">
              Don't just take our word for it - hear from our satisfied customers
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white p-6 md:p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:-translate-y-2"
              >
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-text-light mb-6 italic text-base leading-relaxed">"{testimonial.text}"</p>
                <div className="border-t border-gray-100 pt-4">
                  <p className="font-semibold text-text-dark text-lg">{testimonial.name}</p>
                  <p className="text-sm text-text-light">{testimonial.location}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;

