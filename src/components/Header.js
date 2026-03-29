import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AlignJustify, X, LogOut, User, Wrench, Plus, List, Users, ShoppingCart } from 'lucide-react';
import { defaultBrowsePath } from '../utils/browseUrls';
import { useCart } from '../context/CartContext';

const Header = () => {
  const { user, logout, isAdmin } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  return (
    <header className="bg-white/95 backdrop-blur-md shadow-lg fixed top-0 z-50 w-full border-b border-gray-100">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 flex-shrink-0 group">
            <img
              src="/ashlogo.png"
              alt="ASH Enterprise logo"
              className="h-16 w-20 md:h-14 rounded-md md:w-24 object-contain  flex-shrink-0"
              style={{ maxWidth: '100%', height: 'auto' }}
              onError={(e) => {
                console.error('Logo image not found at /ashlogo.png');
                e.target.style.display = 'none';
              }}
            />
            {/* <div className="text-xl md:text-2xl lg:text-3xl font-bold text-neutral-900 group-hover:text-sky-500 transition-colors whitespace-nowrap">
              ASH Enterprise
            </div> */}
          </Link>
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {!user ? (
              <>
                <Link to="/" className="px-4 py-2 text-neutral-900 hover:text-sky-500 transition-all rounded-lg hover:bg-slate-50 font-medium">Home</Link>
                <Link to={defaultBrowsePath()} className="px-4 py-2 text-neutral-900 hover:text-sky-500 transition-all rounded-lg hover:bg-slate-50 font-medium">Rent Now</Link>
                <Link to="/about" className="px-4 py-2 text-neutral-900 hover:text-sky-500 transition-all rounded-lg hover:bg-slate-50 font-medium">About</Link>
                <Link to="/contact" className="px-4 py-2 text-neutral-900 hover:text-sky-500 transition-all rounded-lg hover:bg-slate-50 font-medium">Contact</Link>
                <Link to="/service-request" className="px-4 py-2 text-neutral-900 hover:text-sky-500 transition-all rounded-lg hover:bg-slate-50 font-medium">Book Services</Link>
                <Link
                  to="/cart"
                  className="relative p-2 rounded-lg text-neutral-900 hover:text-sky-500 hover:bg-slate-50"
                  aria-label="Cart"
                >
                  <ShoppingCart className="w-5 h-5" />
                </Link>
                <Link to="/login" className="px-4 py-2 text-neutral-900 hover:text-sky-500 transition-all rounded-lg hover:bg-slate-50 font-medium">Login</Link>
                <Link to="/admin/login" className="ml-2 px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-700 transition-all font-semibold shadow-md hover:shadow-lg">Admin</Link>
              </>
            ) : isAdmin ? (
              <>
                <Link to="/admin/dashboard" className="flex items-center space-x-2 px-4 py-2 text-neutral-900 hover:text-sky-500 transition-all rounded-lg hover:bg-slate-50 font-medium">
                  <User className="w-4 h-4" />
                  <span>Dashboard</span>
                </Link>
                <Link to="/admin/add-ac" className="flex items-center space-x-2 px-4 py-2 text-neutral-900 hover:text-sky-500 transition-all rounded-lg hover:bg-slate-50 font-medium">
                  <Plus className="w-4 h-4" />
                  <span>Add AC</span>
                </Link>
                <Link to="/admin/manage-acs" className="flex items-center space-x-2 px-4 py-2 text-neutral-900 hover:text-sky-500 transition-all rounded-lg hover:bg-slate-50 font-medium">
                  <List className="w-4 h-4" />
                  <span>Manage ACs</span>
                </Link>
                <Link to="/admin/leads" className="flex items-center space-x-2 px-4 py-2 text-neutral-900 hover:text-sky-500 transition-all rounded-lg hover:bg-slate-50 font-medium">
                  <Users className="w-4 h-4" />
                  <span>Leads</span>
                </Link>
                <Link to="/admin/manage-services" className="flex items-center space-x-2 px-4 py-2 text-neutral-900 hover:text-sky-500 transition-all rounded-lg hover:bg-slate-50 font-medium">
                  <Wrench className="w-4 h-4" />
                  <span>Services</span>
                </Link>
                <button onClick={handleLogout} className="ml-2 flex items-center space-x-2 px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 transition-all rounded-lg font-medium">
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </>
            ) : user?.role === 'user' ? (
              <>
                <Link to="/" className="px-4 py-2 text-neutral-900 hover:text-sky-500 transition-all rounded-lg hover:bg-slate-50 font-medium">Home</Link>
                <Link to={defaultBrowsePath()} className="px-4 py-2 text-neutral-900 hover:text-sky-500 transition-all rounded-lg hover:bg-slate-50 font-medium">Rent Now</Link>
                <Link
                  to="/cart"
                  className="relative flex items-center justify-center p-2 rounded-lg text-neutral-900 hover:text-sky-500 hover:bg-slate-50"
                  aria-label={`Cart${itemCount ? `, ${itemCount} items` : ''}`}
                >
                  <ShoppingCart className="w-5 h-5" />
                  {itemCount > 0 ? (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[1.125rem] h-[1.125rem] px-1 flex items-center justify-center text-[10px] font-bold bg-sky-500 text-white rounded-full">
                      {itemCount > 9 ? '9+' : itemCount}
                    </span>
                  ) : null}
                </Link>
                <Link to="/user/dashboard" className="flex items-center space-x-2 px-4 py-2 text-neutral-900 hover:text-sky-500 transition-all rounded-lg hover:bg-slate-50 font-medium">
                  <User className="w-4 h-4" />
                  <span>Dashboard</span>
                </Link>
                <button onClick={handleLogout} className="ml-2 flex items-center space-x-2 px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 transition-all rounded-lg font-medium">
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </>
            ) : null}
          </nav>

          {/* Mobile Menu Button - Always on the right */}

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-xl border border-gray-200 text-neutral-900 hover:text-sky-500 hover:border-sky-500 transition-colors"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <AlignJustify className="w-7 h-7" />
            )}
          </button>

        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t bg-white/95 backdrop-blur-md">
            <nav className="flex flex-col space-y-1">
              {!user ? (
                <>
                  <Link to="/" onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 rounded-lg hover:bg-slate-50 text-neutral-900 font-medium transition-all">Home</Link>
                  <Link to={defaultBrowsePath()} onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 rounded-lg hover:bg-slate-50 text-neutral-900 font-medium transition-all">Rent Now</Link>
                  <Link to="/about" onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 rounded-lg hover:bg-slate-50 text-neutral-900 font-medium transition-all">About</Link>
                  <Link to="/contact" onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 rounded-lg hover:bg-slate-50 text-neutral-900 font-medium transition-all">Contact</Link>
                  <Link to="/service-request" onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 rounded-lg hover:bg-slate-50 text-neutral-900 font-medium transition-all">Service Request</Link>
                  <Link to="/cart" onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 rounded-lg hover:bg-slate-50 text-neutral-900 font-medium transition-all flex items-center gap-2">
                    <ShoppingCart className="w-4 h-4" />
                    Cart{itemCount > 0 ? ` (${itemCount})` : ''}
                  </Link>
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 rounded-lg hover:bg-slate-50 text-neutral-900 font-medium transition-all">Login</Link>
                  <Link to="/admin/login" onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 rounded-lg bg-sky-500 text-white font-semibold text-center hover:bg-sky-700 transition-all">Admin</Link>
                </>
              ) : isAdmin ? (
                <>
                  <Link to="/admin/dashboard" onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 rounded-lg hover:bg-slate-50 text-neutral-900 font-medium transition-all">Dashboard</Link>
                  <Link to="/admin/add-ac" onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 rounded-lg hover:bg-slate-50 text-neutral-900 font-medium transition-all">Add AC</Link>
                  <Link to="/admin/manage-acs" onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 rounded-lg hover:bg-slate-50 text-neutral-900 font-medium transition-all">Manage ACs</Link>
                  <Link to="/admin/leads" onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 rounded-lg hover:bg-slate-50 text-neutral-900 font-medium transition-all">Leads</Link>
                  <Link to="/admin/manage-services" onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 rounded-lg hover:bg-slate-50 text-neutral-900 font-medium transition-all">Services</Link>
                  <button onClick={handleLogout} className="px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 text-left font-medium transition-all">Logout</button>
                </>
              ) : user?.role === 'user' ? (
                <>
                  <Link to="/" onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 rounded-lg hover:bg-slate-50 text-neutral-900 font-medium transition-all">Home</Link>
                  <Link to={defaultBrowsePath()} onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 rounded-lg hover:bg-slate-50 text-neutral-900 font-medium transition-all">Rent Now</Link>
                  <Link to="/cart" onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 rounded-lg hover:bg-slate-50 text-neutral-900 font-medium transition-all flex items-center gap-2">
                    <ShoppingCart className="w-4 h-4" />
                    Cart{itemCount > 0 ? ` (${itemCount})` : ''}
                  </Link>
                  <Link to="/user/dashboard" onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 rounded-lg hover:bg-slate-50 text-neutral-900 font-medium transition-all">Dashboard</Link>
                  <button onClick={handleLogout} className="px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 text-left font-medium transition-all">Logout</button>
                </>
              ) : null}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
