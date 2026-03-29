import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { defaultBrowsePath } from '../utils/browseUrls';

const HeroCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const slides = [
    {
      id: 1,
      title: 'Premium AC Rentals',
      subtitle: 'Stay Cool, Stay Comfortable',
      description: 'Find the perfect AC for your home or office. Wide selection of premium brands available.',
      image: 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=1920&q=80',
      buttonText: 'Browse ACs',
      buttonLink: defaultBrowsePath(),
      gradient: 'from-blue-600/90 to-blue-800/90',
    },
    {
      id: 2,
      title: 'Expert AC Services',
      subtitle: 'Professional Repair & Maintenance',
      description: 'Get your AC serviced by certified technicians. Quick, reliable, and affordable.',
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1920&q=80',
      buttonText: 'Book Service',
      buttonLink: '/service-request',
      gradient: 'from-indigo-600/90 to-purple-800/90',
    },
    {
      id: 3,
      title: '24/7 Support',
      subtitle: 'We Are Here For You',
      description: 'Round-the-clock customer support. Your comfort is our priority.',
      image: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=1920&q=80',
      buttonText: 'Contact Us',
      buttonLink: '/contact',
      gradient: 'from-cyan-600/90 to-blue-800/90',
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  return (
    <div className="relative w-full h-[500px] sm:h-[600px] md:h-[700px] overflow-hidden rounded-2xl md:rounded-3xl shadow-2xl">
      <AnimatePresence mode="wait">
        {slides.map((slide, index) => {
          if (index !== currentIndex) return null;
          return (
            <motion.div
              key={slide.id}
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.7 }}
              className="absolute inset-0"
            >
              {/* Background Image with Blur Overlay */}
              <div className="absolute inset-0">
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=1920&q=80';
                  }}
                />
                <div className={`absolute inset-0 bg-gradient-to-r ${slide.gradient} backdrop-blur-sm`}></div>
              </div>

              {/* Content */}
              <div className="relative z-10 h-full flex items-center">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                  <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                    className="max-w-2xl text-white"
                  >
                    <p className="text-base sm:text-lg md:text-xl font-medium mb-2 text-blue-100">
                      {slide.subtitle}
                    </p>
                    <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold mb-4 leading-tight">
                      {slide.title}
                    </h1>
                    <p className="text-base sm:text-lg md:text-xl mb-6 md:mb-8 text-gray-100 leading-relaxed">
                      {slide.description}
                    </p>
                    <Link to={slide.buttonLink}>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-white text-primary-blue px-6 py-3 md:px-8 md:py-4 rounded-xl font-semibold text-base md:text-lg shadow-xl hover:shadow-2xl transition-all duration-300 backdrop-blur-sm bg-white/95"
                      >
                        {slide.buttonText}
                      </motion.button>
                    </Link>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* Navigation Arrows */}
      <button
        onClick={goToPrevious}
        className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 backdrop-blur-md text-white p-2 sm:p-3 rounded-full hover:bg-white/30 transition-all duration-300 shadow-lg hover:shadow-xl"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>
      <button
        onClick={goToNext}
        className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 backdrop-blur-md text-white p-2 sm:p-3 rounded-full hover:bg-white/30 transition-all duration-300 shadow-lg hover:shadow-xl"
        aria-label="Next slide"
      >
        <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-20 flex space-x-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`transition-all duration-300 rounded-full ${
              index === currentIndex
                ? 'w-8 h-2 sm:h-3 bg-white shadow-lg'
                : 'w-2 h-2 sm:w-3 sm:h-3 bg-white/50 hover:bg-white/70'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroCarousel;

