// Forgot password page
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardBody, Button, Input } from '../../components/common';
import { authService } from '../../services/authService';
import { Bus, Mail, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authService.forgotPassword(email);
      if (response.success) {
        setSuccess(true);
      } else {
        setError(response.message || 'Failed to send reset link');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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
          <p className="text-gray-600">Reset your password</p>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-gray-900">Forgot Password</h2>
          </CardHeader>
          <CardBody>
            {success ? (
              <div className="text-center py-6">
                <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-600" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Reset Link Sent
                </h3>
                <p className="text-gray-600 mb-4">
                  We've sent a password reset link to your email address. Please check your inbox and follow the instructions.
                </p>
                <Link to="/login">
                  <Button variant="primary" className="w-full">
                    Back to Login
                  </Button>
                </Link>
              </div>
            ) : (
              <>
                <p className="text-sm text-gray-600 mb-4">
                  Enter your email address and we'll send you a link to reset your password.
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
                      label="Email Address"
                      placeholder="your.email@example.com"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      icon={Mail}
                    />

                    <Button
                      type="submit"
                      variant="primary"
                      className="w-full"
                      loading={loading}
                    >
                      Send Reset Link
                    </Button>
                  </div>
                </form>
              </>
            )}
          </CardBody>
        </Card>

        {/* Back to Login */}
        <div className="mt-6 text-center">
          <Link to="/login" className="text-sm text-gray-600 hover:text-gray-900 flex items-center justify-center space-x-2">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Login</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
