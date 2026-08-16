// Reset password page
import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardHeader, CardBody, Button, Input } from '../../components/common';
import { authService } from '../../services/authService';
import { Bus, Lock, CheckCircle, AlertCircle } from 'lucide-react';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const validateForm = () => {
    const newErrors = {};

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
    setError('');

    try {
      const response = await authService.resetPassword(token, formData.password);
      if (response.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setError(response.message || 'Failed to reset password');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
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

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-primary-50 to-secondary-50">
        <Card className="max-w-md w-full">
          <CardBody>
            <div className="text-center py-8">
              <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-600" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Invalid Reset Link</h2>
              <p className="text-gray-600 mb-4">
                The password reset link is invalid or has expired.
              </p>
              <Link to="/forgot-password">
                <Button variant="primary" className="w-full">
                  Request New Link
                </Button>
              </Link>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-primary-50 to-secondary-50">
        <Card className="max-w-md w-full">
          <CardBody>
            <div className="text-center py-8">
              <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-600" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Password Reset Successful</h2>
              <p className="text-gray-600 mb-4">
                Your password has been reset successfully. You can now login with your new password.
              </p>
              <p className="text-sm text-gray-500">
                Redirecting to login...
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
          <p className="text-gray-600">Set your new password</p>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-gray-900">Reset Password</h2>
          </CardHeader>
          <CardBody>
            <p className="text-sm text-gray-600 mb-4">
              Please enter your new password below.
            </p>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <Input
                  label="New Password"
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
                  label="Confirm New Password"
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

                <Button
                  type="submit"
                  variant="primary"
                  className="w-full"
                  loading={loading}
                >
                  Reset Password
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>

        {/* Back to Login */}
        <div className="mt-6 text-center">
          <Link to="/login" className="text-sm text-gray-600 hover:text-gray-900">
            ← Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
