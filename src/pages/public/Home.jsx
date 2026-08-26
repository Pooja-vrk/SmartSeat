// Home page
import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button, Input, Card, CardHeader, CardBody } from '../../components/common';
import { 
  Bus, 
  MapPin, 
  Calendar, 
  Search, 
  Shield, 
  Bell,
  Armchair,
  Users,
  Star,
  ArrowRight,
  CheckCircle,
  TrendingUp
} from 'lucide-react';

import { busService } from '../../services/busService';

const Home = () => {
  const [searchParams, setSearchParams] = useState({
    from: '',
    to: '',
    date: ''
  });
  const [routes, setRoutes] = useState([]);

  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        const response = await busService.getRoutes();
        if (response.success && Array.isArray(response.data)) {
          setRoutes(response.data);
        }
      } catch (err) {
        console.error('Error fetching routes for search dropdowns:', err);
      }
    };
    fetchRoutes();
  }, []);

  // Compute unique source cities for From dropdown
  const fromCities = Array.from(
    new Set(routes.map(r => r.source).filter(Boolean))
  ).sort();

  // Compute available destination cities based on selected From city
  const toCities = searchParams.from
    ? Array.from(
        new Set(
          routes
            .filter(r => r.source === searchParams.from)
            .map(r => r.destination)
            .filter(Boolean)
        )
      ).sort()
    : [];

  const handleFromChange = (e) => {
    const newFrom = e.target.value;
    const newToCities = newFrom
      ? Array.from(
          new Set(
            routes
              .filter(r => r.source === newFrom)
              .map(r => r.destination)
              .filter(Boolean)
          )
        )
      : [];

    const isToValid = newToCities.includes(searchParams.to);

    setSearchParams(prev => ({
      ...prev,
      from: newFrom,
      to: isToValid ? prev.to : ''
    }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // Navigate to search results with params
    window.location.href = `/search?from=${encodeURIComponent(searchParams.from)}&to=${encodeURIComponent(searchParams.to)}&date=${encodeURIComponent(searchParams.date)}`;
  };

  const features = [
    {
      icon: Armchair,
      title: 'Smart Seat Selection',
      description: 'Choose your preferred seat with an interactive seat map'
    },
    {
      icon: Bell,
      title: 'Real-time Alerts',
      description: 'Get notified when your adjacent seat status changes'
    },
    {
      icon: Shield,
      title: 'Personalized Recommendations',
      description: 'AI-powered seat suggestions based on your preferences'
    },
    {
      icon: Users,
      title: 'Easy Seat Changes',
      description: 'Switch to better seats with one-click confirmation'
    },
    {
      icon: Star,
      title: 'Secure Booking',
      description: 'Safe and reliable payment processing'
    },
    {
      icon: TrendingUp,
      title: 'Preference-Driven',
      description: 'Travel your way with customizable options'
    }
  ];

  const howItWorks = [
    {
      step: 1,
      title: 'Search Buses',
      description: 'Enter your travel details to find available buses'
    },
    {
      step: 2,
      title: 'Select Seat',
      description: 'Choose your preferred seat from the interactive layout'
    },
    {
      step: 3,
      title: 'Enable SmartSeat',
      description: 'Turn on adjacent seat monitoring for real-time updates'
    },
    {
      step: 4,
      title: 'Book & Travel',
      description: 'Complete payment and receive your digital ticket'
    }
  ];

  const testimonials = [
    {
      name: 'Priya Sharma',
      role: 'Frequent Traveler',
      content: 'SmartSeat has revolutionized my bus travel experience. The real-time alerts are incredibly helpful!',
      rating: 5
    },
    {
      name: 'Rahul Kumar',
      role: 'Business Professional',
      content: 'The seat recommendations are spot on. I always get seats that match my preferences perfectly.',
      rating: 5
    },
    {
      name: 'Anita Patel',
      role: 'Student',
      content: 'Finally, a booking platform that cares about passenger comfort and preferences. Highly recommended!',
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-secondary-600 text-white py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
              Travel Smarter. Choose Better. Stay Informed.
            </h1>
            <p className="text-xl md:text-2xl text-primary-100 max-w-3xl mx-auto">
              Experience the future of bus travel with intelligent seat selection and real-time passenger awareness
            </p>
          </div>

          {/* Search Form */}
          <Card className="max-w-4xl mx-auto bg-white/95 backdrop-blur-sm shadow-2xl">
            <CardBody>
              <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">From</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 z-10 pointer-events-none" />
                    <select
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 bg-white appearance-none cursor-pointer"
                      value={searchParams.from}
                      onChange={handleFromChange}
                      required
                    >
                      <option value="">Select departure city</option>
                      {fromCities.map(city => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">To</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 z-10 pointer-events-none" />
                    <select
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 bg-white appearance-none cursor-pointer disabled:bg-gray-100 disabled:cursor-not-allowed"
                      value={searchParams.to}
                      onChange={(e) => setSearchParams(prev => ({ ...prev, to: e.target.value }))}
                      disabled={!searchParams.from}
                      required
                    >
                      <option value="">
                        {!searchParams.from ? 'Select departure city first' : 'Select destination city'}
                      </option>
                      {toCities.map(city => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Travel Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="date"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900"
                      value={searchParams.date}
                      onChange={(e) => setSearchParams({...searchParams, date: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className="flex items-end">
                  <Button type="submit" variant="primary" className="w-full" icon={Search}>
                    Search Buses
                  </Button>
                </div>
              </form>
            </CardBody>
          </Card>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose SmartSeat?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Experience a smarter way to travel with our innovative features designed for your comfort and peace of mind
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} hover className="text-center">
                  <CardBody>
                    <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-primary-100 flex items-center justify-center">
                      <Icon className="w-7 h-7 text-primary-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600">
                      {feature.description}
                    </p>
                  </CardBody>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How SmartSeat Works
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Book your journey in four simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorks.map((step) => (
              <div key={step.step} className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white text-2xl font-bold">
                  {step.step}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {step.title}
                </h3>
                <p className="text-gray-600">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What Our Passengers Say
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Join thousands of satisfied travelers who trust SmartSeat
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-gradient-to-br from-primary-50 to-secondary-50">
                <CardBody>
                  <div className="flex items-center space-x-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-4 italic">
                    "{testimonial.content}"
                  </p>
                  <div>
                    <p className="font-semibold text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-primary-600 to-secondary-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Travel Smarter?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Join thousands of passengers who have upgraded their travel experience with SmartSeat
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/search">
              <Button variant="secondary" size="lg" icon={Search}>
                Search Buses Now
              </Button>
            </Link>
            <Link to="/about">
              <Button variant="outline" size="lg" className="bg-white/10 text-white border-white/30 hover:bg-white/20">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
