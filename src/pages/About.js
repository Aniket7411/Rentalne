import React from 'react';
import { motion } from 'framer-motion';
import { Target, Eye, Users, Award } from 'lucide-react';

const About = () => {
  return (
    <div className="min-h-screen bg-background-light py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-text-dark mb-4">
            About ASH Enterprise
          </h1>
          <p className="text-xl text-text-light max-w-3xl mx-auto">
            Your Comfort, Our Priority - Rent & Repair
          </p>
        </motion.div>

        <img
          src="/about.png"
          alt="About"
          className="w-full h-full object-cover rounded-2xl shadow-lg md:hidden"
        />

        {/* Mission & Vision */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white p-8 rounded-lg shadow-md"
          >
            <Target className="w-12 h-12 text-primary-blue mb-4" />
            <h2 className="text-2xl font-bold text-text-dark mb-4">Our Mission</h2>
            <p className="text-text-light">
              To provide accessible, reliable, and affordable AC rental and repair services
              to customers across India. We connect users with trusted vendors, making
              comfort and convenience accessible to everyone.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white p-8 rounded-lg shadow-md"
          >
            <Eye className="w-12 h-12 text-primary-blue mb-4" />
            <h2 className="text-2xl font-bold text-text-dark mb-4">Our Vision</h2>
            <p className="text-text-light">
              To become India's leading platform for AC rentals and services,
              revolutionizing how people access cooling solutions. We envision a future
              where quality AC services are just a click away for every household.
            </p>
          </motion.div>
        </div>

        {/* Values */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-text-dark mb-12">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <Users className="w-16 h-16 text-primary-blue mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-text-dark mb-2">Customer First</h3>
              <p className="text-text-light">
                Your comfort and satisfaction are our top priorities. We go the extra mile
                to ensure you have the best experience.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-center"
            >
              <Award className="w-16 h-16 text-primary-blue mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-text-dark mb-2">Quality Assurance</h3>
              <p className="text-text-light">
                We partner with verified vendors and ensure all services meet our
                high standards of quality and reliability.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-center"
            >
              <Target className="w-16 h-16 text-primary-blue mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-text-dark mb-2">Transparency</h3>
              <p className="text-text-light">
                Clear pricing, honest communication, and transparent processes.
                No hidden fees, no surprises.
              </p>
            </motion.div>
          </div>
        </div>

        {/* How We Work */}
        <div className="bg-white p-8 rounded-lg shadow-md mb-16">
          <h2 className="text-3xl font-bold text-center text-text-dark mb-8">How We Work</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold text-text-dark mb-4">For Customers</h3>
              <ul className="space-y-3 text-text-light">
                <li className="flex items-start">
                  <span className="text-primary-blue mr-2">✓</span>
                  Browse through our extensive catalog of ACs
                </li>
                <li className="flex items-start">
                  <span className="text-primary-blue mr-2">✓</span>
                  Filter by location, capacity, brand, and price
                </li>
                <li className="flex items-start">
                  <span className="text-primary-blue mr-2">✓</span>
                  Connect directly with vendors for rentals
                </li>
                <li className="flex items-start">
                  <span className="text-primary-blue mr-2">✓</span>
                  Book repair and maintenance services easily
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-text-dark mb-4">For Vendors</h3>
              <ul className="space-y-3 text-text-light">
                <li className="flex items-start">
                  <span className="text-primary-blue mr-2">✓</span>
                  List your ACs and reach more customers
                </li>
                <li className="flex items-start">
                  <span className="text-primary-blue mr-2">✓</span>
                  Receive service leads in your area
                </li>
                <li className="flex items-start">
                  <span className="text-primary-blue mr-2">✓</span>
                  Manage all your listings from one dashboard
                </li>
                <li className="flex items-start">
                  <span className="text-primary-blue mr-2">✓</span>
                  Grow your business with our platform
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* CTA */}
        {/* <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-primary-blue text-white p-8 rounded-lg text-center"
        >
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-blue-100 mb-6">
            Join thousands of satisfied customers and vendors
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/browse"
              className="bg-white text-primary-blue px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition"
            >
              Browse ACs
            </a>
            <a
              href="/signup"
              className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-primary-blue transition"
            >
              Sign Up
            </a>
          </div>
        </motion.div> */}
      </div>
    </div>
  );
};

export default About;

