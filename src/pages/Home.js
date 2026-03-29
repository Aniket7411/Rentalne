import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle, Star, Snowflake, Wrench, Clock, Loader2, Shield, Zap, Users } from 'lucide-react';
import { apiService } from '../services/api';
import ACCard from '../components/ACCard';
import ServiceCard from '../components/ServiceCard';
import ServiceBookingModal from '../components/ServiceBookingModal';
import SingleScreen from './SingleScreen/SingleScreen';
import InstallCard from '../components/installcard';
import { browsePath, BROWSE_CATEGORY, defaultBrowsePath } from '../utils/browseUrls';

const Home = () => {
  const [featuredACs, setFeaturedACs] = useState([]);
  const [services, setServices] = useState([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [selectedService, setSelectedService] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);

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

  const steps = [
    { icon: '🔍', title: 'Browse', description: 'Search through our wide selection of ACs' },
    { icon: '✅', title: 'Select & Inquire', description: 'Choose your preferred AC and contact the vendor' },
    { icon: '🏠', title: 'Get Installed', description: 'Get your AC installed and enjoy cool comfort' },
  ];

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

      {/* Product Categories */}
      <section className="py-12 md:py-16 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8 md:mb-12"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-text-dark mb-2">Our Products</h2>
            <p className="text-sm sm:text-base text-text-light">Choose from our wide range of rental appliances</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {/* AC Category */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer"
            >
              <Link to={browsePath(BROWSE_CATEGORY.AC)}>
                <div className="relative h-64 md:h-80 bg-gradient-to-br from-blue-100 to-blue-200">
                  <img
                    src="/Ac.png"
                    alt="Air Conditioners"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=800&q=80';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <h3 className="text-2xl md:text-3xl font-bold mb-2">Air Conditioners</h3>
                    <p className="text-blue-100">Cool comfort for your home</p>
                  </div>
                  <div className="absolute inset-0 border-4 border-transparent group-hover:border-primary-blue transition-all duration-300 rounded-2xl" />
                </div>
              </Link>
            </motion.div>

            {/* Washing Machine Category */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer"
            >
              <Link to={browsePath(BROWSE_CATEGORY.WASHING_MACHINE)}>
                <div className="relative h-64 md:h-80 bg-gradient-to-br from-purple-100 to-purple-200">
                  <img
                    src="https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=800&q=80"
                    alt="Washing Machines"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <h3 className="text-2xl md:text-3xl font-bold mb-2">Washing Machines</h3>
                    <p className="text-purple-100">Clean clothes, hassle-free</p>
                  </div>
                  <div className="absolute inset-0 border-4 border-transparent group-hover:border-primary-blue transition-all duration-300 rounded-2xl" />
                </div>
              </Link>
            </motion.div>

            {/* Refrigerator Category */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer"
            >
              <Link to={browsePath(BROWSE_CATEGORY.REFRIGERATOR)}>
                <div className="relative h-64 md:h-80 bg-gradient-to-br from-green-100 to-green-200">
                  <img
                    src="https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=800&q=80"
                    alt="Refrigerators"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <h3 className="text-2xl md:text-3xl font-bold mb-2">Refrigerators</h3>
                    <p className="text-green-100">Keep your food fresh</p>
                  </div>
                  <div className="absolute inset-0 border-4 border-transparent group-hover:border-primary-blue transition-all duration-300 rounded-2xl" />
                </div>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured ACs */}
      <section className="py-12 md:py-16 bg-gradient-to-b from-white to-gray-50">
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
      </section>


      <InstallCard />





      {/* Services Section */}
      <section className="py-12 md:py-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 md:mb-12"
          >
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-text-dark mb-2">AC Repair & Maintenance Services</h2>
              <p className="text-text-light">Professional AC services at your doorstep</p>
            </div>
            <Link
              to="/service-request"
              className="mt-4 sm:mt-0 text-primary-blue hover:text-primary-blue-light flex items-center space-x-2 font-semibold group transition-all"
            >
              <span>View All Services</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>

          {loadingServices ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary-blue" />
            </div>
          ) : services.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service, index) => (
                <motion.div
                  key={service._id || service.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <ServiceCard service={service} onAddClick={handleServiceAdd} />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg">
              <Wrench className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No services available at the moment</p>
              <Link
                to="/service-request"
                className="inline-block mt-4 text-primary-blue hover:text-primary-blue-light"
              >
                View All Services
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 md:py-16 bg-white">
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
      </section>

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
      <section className="py-12 md:py-16 bg-gradient-to-b from-white via-gray-50 to-white">
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

