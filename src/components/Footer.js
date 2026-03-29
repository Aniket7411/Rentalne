import React from 'react';
import { Link } from 'react-router-dom';
import { defaultBrowsePath } from '../utils/browseUrls';
import { Mail, Phone, MapPin } from 'lucide-react';

const legal = [
  { label: 'Terms & Conditions', to: '/legal/terms-and-conditions' },
  { label: 'Privacy Policy', to: '/legal/privacy-policy' },
  { label: 'Cancellation & Refund', to: '/legal/cancellation-refund' },
  { label: 'Delivery & Service', to: '/legal/delivery-service' },
  { label: 'Shipping Policy', to: '/legal/shipping-policy' },
];

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-b from-text-dark to-gray-900 text-white mt-20 border-t border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link to="/" className="inline-flex flex-col gap-3 group">
              <img
                src="/ashlogo.png"
                alt="ASH Enterprises"
                className="h-12 w-auto max-w-[180px] object-contain rounded-md drop-shadow-sm"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
              <span className="text-lg font-bold text-white tracking-tight group-hover:text-sky-300 transition-colors">
                ASH Enterprises
              </span>
            </Link>
            <p className="text-gray-300 text-sm leading-relaxed mt-3 max-w-sm">
              Your Comfort, Our Priority - Rent & Repair
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wide">Quick Links</h4>
            <ul className="space-y-2.5 text-sm text-gray-300">
              <li>
                <Link to="/" className="hover:text-sky-300 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to={defaultBrowsePath()} className="hover:text-sky-300 transition-colors">
                  Rent
                </Link>
              </li>
              <li>
                <Link to="/service-request" className="hover:text-sky-300 transition-colors">
                  Services
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-sky-300 transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-sky-300 transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-sky-300 transition-colors">
                  Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wide">Legal</h4>
            <ul className="space-y-2.5 text-sm text-gray-300">
              {legal.map((item) => (
                <li key={item.to}>
                  <Link to={item.to} className="hover:text-sky-300 transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wide">Contact Info</h4>
            <ul className="space-y-4 text-sm text-gray-300">
              <li className="flex items-start gap-3">
                <Phone className="w-4 h-4 mt-0.5 flex-shrink-0 text-sky-400" />
                <a href="tel:+918169535736" className="hover:text-sky-300 transition-colors">
                  +91 8169535736
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="w-4 h-4 mt-0.5 flex-shrink-0 text-sky-400" />
                <a
                  href="mailto:support@ashenterprises.in"
                  className="hover:text-sky-300 transition-colors break-all"
                >
                  support@ashenterprises.in
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 mt-1 flex-shrink-0 text-sky-400" />
                <span className="leading-relaxed">
                  Shop No 3 Sai Prasad Building, Hanuman Nagar, Goregaon West 400104
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700/60 mt-12 pt-8 text-center text-sm text-gray-400">
          <p>
            © {year} ASH Enterprises. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
