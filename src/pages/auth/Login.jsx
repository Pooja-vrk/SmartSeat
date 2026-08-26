// Login page
import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Card, CardHeader, CardBody, Button, Input } from '../../components/common';
import { useAuth } from '../../context/AuthContext';
import { Bus, User, Lock, AlertCircle } from 'lucide-react';

const Login = () => {
  const [userType, setUserType] = useState('passenger');
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const from = location.state?.from || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await login(formData.email, formData.password, userType);
      if (response.success) {
        navigate(userType === 'admin' ? '/admin' : from, { replace: true });
      } else {
        setError(response.message || 'Login failed');
      }
    } catch (err) {
      setError('An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
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
          <p className="text-gray-600">Sign in to your account</p>
        </div>

        {/* User Type Toggle */}
        <div className="flex mb-6 bg-white rounded-lg p-1 shadow-sm">
          <button
            onClick={() => setUserType('passenger')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
              userType === 'passenger'
                ? 'bg-primary-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Passenger
          </button>
          <button
            onClick={() => setUserType('admin')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
              userType === 'admin'
                ? 'bg-primary-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Admin
          </button>
        </div>

        {/* Login Form */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-gray-900">
              {userType === 'passenger' ? 'Passenger Login' : 'Admin Login'}
            </h2>
          </CardHeader>
          <CardBody>
            <form onSubmit={handleSubmit}>
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              <div className="space-y-4">
                <Input
                  label="Email Address"
                  placeholder="your.email@example.com"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  icon={User}
                />

                <Input
                  label="Password"
                  placeholder="••••••••"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  icon={Lock}
                  showPasswordToggle
                  showPassword={showPassword}
                  onPasswordToggle={() => setShowPassword(prev => !prev)}
                />

                <div className="flex items-center justify-between">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      className="rounded text-primary-600"
                    />
                    <span className="text-sm text-gray-600">Remember me</span>
                  </label>
                  <Link to="/forgot-password" className="text-sm text-primary-600 hover:text-primary-700">
                    Forgot password?
                  </Link>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  className="w-full"
                  loading={loading}
                >
                  Sign In
                </Button>
              </div>
            </form>

            {/* Demo Credentials Notice */}
            {userType === 'passenger' && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-xs text-blue-800">
                  <strong>Demo:</strong> Use any email and password to test
                </p>
              </div>
            )}
          </CardBody>
        </Card>

        {/* Register Link */}
        {userType === 'passenger' && (
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary-600 hover:text-primary-700 font-medium">
                Sign up
              </Link>
            </p>
          </div>
        )}

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

export default Login;
