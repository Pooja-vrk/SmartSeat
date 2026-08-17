// Register page
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardBody, Button, Input, Select } from '../../components/common';
import { useAuth } from '../../context/AuthContext';
import { Bus, User, Mail, Phone, Lock, AlertCircle, CheckCircle } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    passengerCategory: 'general'
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
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
        passengerCategory: formData.passengerCategory
      });

      if (response.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      } else {
        setErrors({ general: response.message || 'Registration failed' });
      }
    } catch (err) {
      setErrors({ general: 'An error occurred during registration' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear error for this field when user starts typing
    if (errors[e.target.name]) {
      setErrors(prev => ({
        ...prev,
        [e.target.name]: ''
      }));
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-primary-50 to-secondary-50">
        <Card className="max-w-md w-full">
          <CardBody>
            <div className="text-center py-8">
              <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-600" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Registration Successful!</h2>
              <p className="text-gray-600 mb-4">
                Your account has been created successfully.
              </p>
              <p className="text-sm text-gray-500">
                Redirecting to dashboard...
              </p>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-primary-50 to-secondary-50">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Bus className="w-10 h-10 text-primary-600" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
              SmartSeat
            </h1>
          </div>
          <p className="text-gray-600">Create your account</p>
        </div>

        {/* Register Form */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-gray-900">Sign Up</h2>
          </CardHeader>
          <CardBody>
            <form onSubmit={handleSubmit}>
              {errors.general && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                  <p className="text-sm text-red-800">{errors.general}</p>
                </div>
              )}

              <div className="space-y-4">
                <Input
                  label="Full Name"
                  placeholder="John Doe"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  error={errors.fullName}
                  required
                  icon={User}
                />

                <Input
                  label="Email Address"
                  placeholder="your.email@example.com"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  error={errors.email}
                  required
                  icon={Mail}
                />

                <Input
                  label="Phone Number"
                  placeholder="+91 98765 43210"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  error={errors.phone}
                  required
                  icon={Phone}
                  helperText="Include country code for international numbers"
                />

                <Select
                  label="Passenger Category (Optional)"
                  placeholder="Select category"
                  name="passengerCategory"
                  value={formData.passengerCategory}
                  onChange={handleChange}
                  options={[
                    { value: 'general', label: 'General' },
                    { value: 'senior_citizen', label: 'Senior Citizen (60+)' },
                    { value: 'student', label: 'Student' },
                    { value: 'woman', label: 'Woman' },
                    { value: 'person_with_disability', label: 'Person with Disability' }
                  ]}
                  helperText="This helps us provide better service and recommendations"
                />

                <Input
                  label="Password"
                  placeholder="••••••••"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  error={errors.password}
                  required
                  icon={Lock}
                  showPasswordToggle
                  helperText="Minimum 6 characters"
                />

                <Input
                  label="Confirm Password"
                  placeholder="••••••••"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  error={errors.confirmPassword}
                  required
                  icon={Lock}
                  showPasswordToggle
                />

                <div className="flex items-start space-x-2">
                  <input
                    type="checkbox"
                    required
                    className="rounded text-primary-600 mt-1"
                  />
                  <span className="text-sm text-gray-600">
                    I agree to the{' '}
                    <a href="#" className="text-primary-600 hover:underline">
                      Terms of Service
                    </a>{' '}
                    and{' '}
                    <a href="#" className="text-primary-600 hover:underline">
                      Privacy Policy
                    </a>
                  </span>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  className="w-full"
                  loading={loading}
                >
                  Create Account
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>

        {/* Login Link */}
        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
              Sign in
            </Link>
          </p>
        </div>

        {/* Back to Home */}
        <div className="mt-4 text-center">
          <Link to="/" className="text-sm text-gray-600 hover:text-gray-900">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
