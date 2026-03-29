import React, { useState, useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PasswordInput from '../components/PasswordInput';
import { AlertCircle, CheckCircle, Loader2, ArrowLeft } from 'lucide-react';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = useMemo(
    () => searchParams.get('token') || searchParams.get('resetToken') || '',
    [searchParams]
  );
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const { resetPassword } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!token) {
      setError('Reset link is invalid or expired. Request a new link from Forgot password.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    const r = await resetPassword(token, password);
    setLoading(false);
    if (r.success) {
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
    } else {
      setError(r.message || 'Could not reset password');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full space-y-6 bg-white p-8 rounded-2xl shadow border border-gray-100">
        <Link
          to="/login"
          className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-sky-600"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to login
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">Set new password</h1>
        {!token && (
          <div className="flex items-start gap-2 text-amber-800 bg-amber-50 p-3 rounded-lg text-sm">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>Open this page from the link in your email (it should include ?token=...).</span>
          </div>
        )}
        {success ? (
          <div className="flex items-center gap-2 text-green-700 bg-green-50 p-4 rounded-lg">
            <CheckCircle className="w-5 h-5" />
            <span>Password updated. Redirecting to login…</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 text-red-700 bg-red-50 p-3 rounded-lg text-sm">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{error}</span>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">New password</label>
              <PasswordInput
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Confirm password</label>
              <PasswordInput
                name="confirmPassword"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                placeholder="Confirm password"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !token}
              className="w-full py-3 rounded-xl bg-sky-600 text-white font-semibold hover:bg-sky-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Update password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
