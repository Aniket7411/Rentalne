import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const PasswordInput = ({
  value,
  onChange,
  placeholder = 'Password',
  className,
  required = false,
  name = 'password',
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const inputClasses =
    className ||
    'w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-xl text-text-dark placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-primary-blue transition-all duration-300 bg-gray-50 focus:bg-white';

  return (
    <div className="relative">
      <input
        type={showPassword ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        name={name}
        required={required}
        autoComplete={name === 'password' ? 'current-password' : 'on'}
        className={inputClasses}
      />
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-light hover:text-text-dark transition p-1 rounded-md"
        aria-label={showPassword ? 'Hide password' : 'Show password'}
      >
        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
      </button>
    </div>
  );
};

export default PasswordInput;
