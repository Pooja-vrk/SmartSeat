// Login page — SmartSeat dark-theme redesign
// Authentication logic is UNCHANGED. UI only.

import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Bus,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowRight,
  Mail,
  Lock,
} from 'lucide-react';
import './Login.css';

const Login = () => {
  const [userType, setUserType]         = useState('passenger');
  const [formData, setFormData]         = useState({ email: '', password: '' });
  const [error, setError]               = useState('');
  const [loading, setLoading]           = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { login }  = useAuth();
  const navigate   = useNavigate();
  const location   = useLocation();
  const from       = location.state?.from || '/dashboard';

  // ── Handlers — unchanged ─────────────────────────────────

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await login(formData.email, formData.password, userType);
      if (response.success) {
        navigate(userType === 'admin' ? '/admin' : from, { replace: true });
      } else {
        setError(response.message || 'Login failed. Please check your credentials.');
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const isPassenger = userType === 'passenger';

  return (
    // lp-root: full-page hero background; card floats on the right
    <div className="lp-root">

      {/* dark overlay over the entire background */}
      <div className="lp-overlay" aria-hidden="true" />

      {/* right-aligned card column */}
      <div className="lp-right">
        <div className="lp-card">

          {/* logo */}
          <div className="lp-card__logo">
            <div className="lp-card__logo-icon">
              <Bus className="w-5 h-5 text-white" aria-hidden="true" />
            </div>
            <span className="lp-card__logo-name">
              SMART<span className="lp-card__logo-accent">SEAT</span>
            </span>
          </div>

          {/* heading */}
          <div>
            <h1 className="lp-card__title">
              {isPassenger ? 'Welcome back' : 'Admin Portal'}
            </h1>
            <p className="lp-card__sub">
              {isPassenger
                ? 'Sign in to manage your journeys.'
                : 'Restricted to authorised administrators.'}
            </p>
          </div>

          {/* passenger / admin toggle */}
          <div className="lp-toggle" role="group" aria-label="Account type">
            {[
              { value: 'passenger', label: 'Passenger' },
              { value: 'admin',     label: 'Admin'     },
            ].map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => { setUserType(value); setError(''); }}
                className={`lp-toggle__btn${userType === value ? ' lp-toggle__btn--active' : ''}`}
                aria-pressed={userType === value}
              >
                {label}
              </button>
            ))}
          </div>

          {/* form */}
          <form onSubmit={handleSubmit} className="lp-form" noValidate>

            {error && (
              <div className="lp-error" role="alert">
                <AlertCircle className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                <span>{error}</span>
              </div>
            )}

            {/* email */}
            <div className="lp-field">
              <label htmlFor="lp-email" className="lp-field__label">Email address</label>
              <div className="lp-field__wrap">
                <Mail className="lp-field__icon" aria-hidden="true" />
                <input
                  id="lp-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="lp-field__input"
                />
              </div>
            </div>

            {/* password */}
            <div className="lp-field">
              <div className="lp-field__label-row">
                <label htmlFor="lp-password" className="lp-field__label">Password</label>
                <Link to="/forgot-password" className="lp-field__forgot">Forgot password?</Link>
              </div>
              <div className="lp-field__wrap">
                <Lock className="lp-field__icon" aria-hidden="true" />
                <input
                  id="lp-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="lp-field__input lp-field__input--pw"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(p => !p)}
                  className="lp-field__eye"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword
                    ? <EyeOff className="w-4 h-4" aria-hidden="true" />
                    : <Eye    className="w-4 h-4" aria-hidden="true" />}
                </button>
              </div>
            </div>

            {/* submit */}
            <button type="submit" disabled={loading} className="lp-submit">
              {loading ? (
                <>
                  <svg className="w-4 h-4 animate-spin flex-shrink-0" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path   className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Signing in…
                </>
              ) : (
                <>Sign In <ArrowRight className="w-4 h-4 flex-shrink-0" aria-hidden="true" /></>
              )}
            </button>

          </form>

          {/* register link */}
          {isPassenger && (
            <p className="lp-register">
              Don't have an account?&nbsp;
              <Link to="/register" className="lp-register__link">Create one</Link>
            </p>
          )}

          {/* back to home */}
          <p className="lp-back">
            <Link to="/" className="lp-back__link">← Back to Home</Link>
          </p>

        </div>
      </div>

    </div>
  );
};

export default Login;
