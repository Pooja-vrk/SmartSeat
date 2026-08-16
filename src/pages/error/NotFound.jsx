// 404 Not Found page
import { Link } from 'react-router-dom';
import { Button } from '../../components/common';
import { Home, Search, ArrowLeft } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-primary-600 mb-4">404</h1>
          <div className="w-24 h-1 bg-primary-600 mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Page Not Found</h2>
          <p className="text-gray-600 mb-8">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        <div className="space-y-4">
          <Link to="/">
            <Button variant="primary" className="w-full" icon={Home}>
              Go to Home
            </Button>
          </Link>
          
          <Link to="/search">
            <Button variant="outline" className="w-full" icon={Search}>
              Search Buses
            </Button>
          </Link>

          <button
            onClick={() => window.history.back()}
            className="w-full text-gray-600 hover:text-gray-900 font-medium flex items-center justify-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go Back</span>
          </button>
        </div>

        <div className="mt-12 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            If you believe this is an error, please contact our support team at
            <a href="mailto:support@smartseat.com" className="text-primary-600 hover:underline ml-1">
              support@smartseat.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
