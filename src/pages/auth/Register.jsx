// Register page
// SmartSeat premium dark-theme redesign
// Registration/authentication logic is unchanged. UI only.

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  Phone,
  Lock,
  AlertCircle,
  CheckCircle,
  Bus,
  ArrowRight,
  Eye,
  EyeOff,
} from 'lucide-react';

import { useAuth } from '../../context/AuthContext';
import './Register.css';

const Register = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    passengerCategory: 'general',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\+?[\d\s-]{10,}$/.test(formData.phone)) {
      newErrors.phone = 'Invalid phone number format';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      const response = await register({
        name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        passengerCategory: formData.passengerCategory,
      });

      if (response.success) {
        setSuccess(true);

        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      } else {
        setErrors({
          general: response.message || 'Registration failed',
        });
      }
    } catch (err) {
      setErrors({
        general: 'An error occurred during registration',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    if (errors[e.target.name]) {
      setErrors((prev) => ({
        ...prev,
        [e.target.name]: '',
      }));
    }
  };

  /* =========================================================
     SUCCESS SCREEN
     ========================================================= */

  if (success) {
    return (
      <div className="rp-root">
        <div className="rp-overlay" />

        <div className="rp-success-wrapper">
          <div className="rp-success-card">

            <div className="rp-success-icon">
              <CheckCircle size={34} />
            </div>

            <h1>Registration Successful!</h1>

            <p>
              Your SmartSeat account has been created successfully.
            </p>

            <span>
              Redirecting to dashboard...
            </span>

          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rp-root">

      {/* =====================================================
          BACKGROUND OVERLAY
          ===================================================== */}
      <div className="rp-overlay" aria-hidden="true" />

      {/* =====================================================
          TRANSPARENT HEADER
          ===================================================== */}
      <header className="rp-header">

        <Link to="/" className="rp-brand">

          <div className="rp-brand-icon">
            <Bus size={21} />
          </div>

          <div className="rp-brand-text">
            <span className="rp-brand-name">
              SMART<span>SEAT</span>
            </span>

            <small>SMART MOBILITY</small>
          </div>

        </Link>

        <nav className="rp-nav">

          <Link to="/">Home</Link>

          <Link to="/search">
            Search Buses
          </Link>

          <Link to="/about">
            About
          </Link>

          <Link to="/contact">
            Contact
          </Link>

        </nav>

        <div className="rp-header-actions">

          <Link
            to="/login"
            className="rp-login-button"
          >
            Login
          </Link>

        </div>

      </header>

      {/* =====================================================
          REGISTER CONTENT
          ===================================================== */}
      <main className="rp-content">

        <div className="rp-card">

          {/* Card heading */}

          <div className="rp-card-heading">

            <div className="rp-card-logo">
              <div className="rp-card-logo-icon">
                <Bus size={21} />
              </div>

              <span>
                SMART<span>SEAT</span>
              </span>
            </div>

            <h1>
              Create your account
            </h1>

            <p>
              Join SmartSeat and make your journeys smarter.
            </p>

          </div>

          {/* General error */}

          {errors.general && (
            <div
              className="rp-error"
              role="alert"
            >
              <AlertCircle size={17} />

              <span>
                {errors.general}
              </span>
            </div>
          )}

          {/* =================================================
              FORM
              ================================================= */}

          <form
            onSubmit={handleSubmit}
            className="rp-form"
            noValidate
          >

            {/* Full Name */}

            <div className="rp-field">

              <label htmlFor="rp-fullName">
                Full Name
              </label>

              <div className="rp-input-wrapper">

                <User className="rp-input-icon" />

                <input
                  id="rp-fullName"
                  name="fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="John Doe"
                  autoComplete="name"
                  className={errors.fullName ? 'rp-input rp-input-error' : 'rp-input'}
                />

              </div>

              {errors.fullName && (
                <span className="rp-field-error">
                  {errors.fullName}
                </span>
              )}

            </div>

            {/* Email */}

            <div className="rp-field">

              <label htmlFor="rp-email">
                Email Address
              </label>

              <div className="rp-input-wrapper">

                <Mail className="rp-input-icon" />

                <input
                  id="rp-email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your.email@example.com"
                  autoComplete="email"
                  className={errors.email ? 'rp-input rp-input-error' : 'rp-input'}
                />

              </div>

              {errors.email && (
                <span className="rp-field-error">
                  {errors.email}
                </span>
              )}

            </div>

            {/* Phone */}

            <div className="rp-field">

              <label htmlFor="rp-phone">
                Phone Number
              </label>

              <div className="rp-input-wrapper">

                <Phone className="rp-input-icon" />

                <input
                  id="rp-phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+91 98765 43210"
                  autoComplete="tel"
                  className={errors.phone ? 'rp-input rp-input-error' : 'rp-input'}
                />

              </div>

              {errors.phone ? (
                <span className="rp-field-error">
                  {errors.phone}
                </span>
              ) : (
                <span className="rp-helper">
                  Include country code for international numbers
                </span>
              )}

            </div>

            {/* Passenger Category */}

            <div className="rp-field">

              <label htmlFor="rp-category">
                Passenger Category
                <span className="rp-optional">
                  Optional
                </span>
              </label>

              <div className="rp-select-wrapper">

                <select
                  id="rp-category"
                  name="passengerCategory"
                  value={formData.passengerCategory}
                  onChange={handleChange}
                  className="rp-select"
                >

                  <option value="general">
                    General
                  </option>

                  <option value="senior_citizen">
                    Senior Citizen (60+)
                  </option>

                  <option value="student">
                    Student
                  </option>

                  <option value="woman">
                    Woman
                  </option>

                  <option value="person_with_disability">
                    Person with Disability
                  </option>

                </select>

              </div>

              <span className="rp-helper">
                Helps us provide better service and recommendations
              </span>

            </div>

            {/* Password */}

            <div className="rp-field">

              <label htmlFor="rp-password">
                Password
              </label>

              <div className="rp-input-wrapper">

                <Lock className="rp-input-icon" />

                <input
                  id="rp-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  className={errors.password ? 'rp-input rp-password-input rp-input-error' : 'rp-input rp-password-input'}
                />

                <button
                  type="button"
                  className="rp-password-toggle"
                  onClick={() =>
                    setShowPassword((prev) => !prev)
                  }
                  aria-label={
                    showPassword
                      ? 'Hide password'
                      : 'Show password'
                  }
                >
                  {showPassword ? (
                    <EyeOff size={17} />
                  ) : (
                    <Eye size={17} />
                  )}
                </button>

              </div>

              {errors.password ? (
                <span className="rp-field-error">
                  {errors.password}
                </span>
              ) : (
                <span className="rp-helper">
                  Minimum 6 characters
                </span>
              )}

            </div>

            {/* Confirm Password */}

            <div className="rp-field">

              <label htmlFor="rp-confirmPassword">
                Confirm Password
              </label>

              <div className="rp-input-wrapper">

                <Lock className="rp-input-icon" />

                <input
                  id="rp-confirmPassword"
                  name="confirmPassword"
                  type={
                    showConfirmPassword
                      ? 'text'
                      : 'password'
                  }
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  className={errors.confirmPassword ? 'rp-input rp-password-input rp-input-error' : 'rp-input rp-password-input'}
                />

                <button
                  type="button"
                  className="rp-password-toggle"
                  onClick={() =>
                    setShowConfirmPassword((prev) => !prev)
                  }
                  aria-label={
                    showConfirmPassword
                      ? 'Hide password'
                      : 'Show password'
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff size={17} />
                  ) : (
                    <Eye size={17} />
                  )}
                </button>

              </div>

              {errors.confirmPassword && (
                <span className="rp-field-error">
                  {errors.confirmPassword}
                </span>
              )}

            </div>

            {/* Terms */}

            <label className="rp-terms">

              <input
                type="checkbox"
                required
              />

              <span>
                I agree to the{' '}
                <a href="#">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="#">
                  Privacy Policy
                </a>
              </span>

            </label>

            {/* Submit */}

            <button
              type="submit"
              disabled={loading}
              className="rp-submit"
            >

              {loading ? (
                <>
                  <span className="rp-spinner" />
                  Creating account...
                </>
              ) : (
                <>
                  Create Account
                  <ArrowRight size={17} />
                </>
              )}

            </button>

          </form>

          {/* Login */}

          <p className="rp-login-text">

            Already have an account?

            <Link to="/login">
              Sign in
            </Link>

          </p>

          {/* Back */}

          <Link
            to="/"
            className="rp-back"
          >
            ← Back to Home
          </Link>

        </div>

      </main>

    </div>
  );
};

export default Register;