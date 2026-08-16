// Search buses page
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardBody, Button, Select, Badge, Loading, Skeleton, Input } from '../../components/common';
import { busService } from '../../services/busService';
import { 
  Bus, 
  Clock, 
  MapPin, 
  Users, 
  Star,
  Armchair,
  Filter,
  ArrowUpDown,
  Calendar,
  ArrowRight
} from 'lucide-react';

const Search = () => {
  const [searchParams] = useSearchParams();
  const [buses, setBuses] = useState([]);
  const [filteredBuses, setFilteredBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    busType: [],
    acType: '',
    seatType: '',
    minPrice: '',
    maxPrice: '',
    minSeats: ''
  });
  const [sortBy, setSortBy] = useState('departure');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const searchBuses = async () => {
      setLoading(true);
      const params = {
        from: searchParams.get('from') || '',
        to: searchParams.get('to') || '',
        date: searchParams.get('date') || ''
      };

      try {
        const response = await busService.searchBuses(params);
        if (response.success) {
          setBuses(response.data);
          setFilteredBuses(response.data);
        }
      } catch (error) {
        console.error('Error searching buses:', error);
      } finally {
        setLoading(false);
      }
    };

    searchBuses();
  }, [searchParams]);

  const applyFilters = async () => {
    setLoading(true);
    try {
      const response = await busService.filterBuses(buses, filters);
      if (response.success) {
        setFilteredBuses(response.data);
      }
    } catch (error) {
      console.error('Error filtering buses:', error);
    } finally {
      setLoading(false);
    }
  };

  const applySort = async () => {
    setLoading(true);
    try {
      const response = await busService.sortBuses(filteredBuses, sortBy);
      if (response.success) {
        setFilteredBuses(response.data);
      }
    } catch (error) {
      console.error('Error sorting buses:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (buses.length > 0) {
      applyFilters();
    }
  }, [filters]);

  useEffect(() => {
    if (filteredBuses.length > 0) {
      applySort();
    }
  }, [sortBy]);

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatDuration = (duration) => {
    return duration;
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardBody>
                <Skeleton count={4} className="h-4" />
              </CardBody>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Search Summary */}
      <div className="mb-6 p-4 bg-primary-50 rounded-lg border border-primary-200">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <MapPin className="w-5 h-5 text-primary-600" />
              <span className="font-medium text-primary-900">
                {searchParams.get('from')} → {searchParams.get('to')}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-primary-600" />
              <span className="text-primary-700">{searchParams.get('date')}</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-primary-700">{filteredBuses.length} buses found</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Filters Sidebar */}
        <div className="lg:w-64 flex-shrink-0">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Filters</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  icon={Filter}
                >
                  {showFilters ? 'Hide' : 'Show'}
                </Button>
              </div>
            </CardHeader>
            {showFilters && (
              <CardBody>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Bus Type</label>
                    <div className="space-y-2">
                      {['AC Sleeper', 'AC Seater', 'Non-AC Sleeper', 'Non-AC Seater'].map(type => (
                        <label key={type} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={filters.busType.includes(type)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFilters({...filters, busType: [...filters.busType, type]});
                              } else {
                                setFilters({...filters, busType: filters.busType.filter(t => t !== type)});
                              }
                            }}
                            className="rounded text-primary-600"
                          />
                          <span className="text-sm text-gray-700">{type}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <Select
                    label="AC Type"
                    placeholder="Any"
                    value={filters.acType}
                    onChange={(e) => setFilters({...filters, acType: e.target.value})}
                    options={[
                      { value: '', label: 'Any' },
                      { value: 'ac', label: 'AC Only' },
                      { value: 'non-ac', label: 'Non-AC Only' }
                    ]}
                  />

                  <Select
                    label="Seat Type"
                    placeholder="Any"
                    value={filters.seatType}
                    onChange={(e) => setFilters({...filters, seatType: e.target.value})}
                    options={[
                      { value: '', label: 'Any' },
                      { value: 'sleeper', label: 'Sleeper' },
                      { value: 'seater', label: 'Seater' }
                    ]}
                  />

                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      label="Min Price"
                      type="number"
                      placeholder="₹0"
                      value={filters.minPrice}
                      onChange={(e) => setFilters({...filters, minPrice: e.target.value})}
                    />
                    <Input
                      label="Max Price"
                      type="number"
                      placeholder="₹5000"
                      value={filters.maxPrice}
                      onChange={(e) => setFilters({...filters, maxPrice: e.target.value})}
                    />
                  </div>

                  <Input
                    label="Min Available Seats"
                    type="number"
                    placeholder="1"
                    value={filters.minSeats}
                    onChange={(e) => setFilters({...filters, minSeats: e.target.value})}
                  />

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setFilters({
                      busType: [],
                      acType: '',
                      seatType: '',
                      minPrice: '',
                      maxPrice: '',
                      minSeats: ''
                    })}
                    className="w-full"
                  >
                    Clear Filters
                  </Button>
                </div>
              </CardBody>
            )}
          </Card>
        </div>

        {/* Bus Results */}
        <div className="flex-1">
          {/* Sort Bar */}
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ArrowUpDown className="w-5 h-5 text-gray-500" />
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                options={[
                  { value: 'departure', label: 'Departure Time' },
                  { value: 'price', label: 'Price (Low to High)' },
                  { value: 'duration', label: 'Duration' },
                  { value: 'rating', label: 'Rating' }
                ]}
                className="w-48"
              />
            </div>
          </div>

          {/* Bus Cards */}
          <div className="space-y-4">
            {filteredBuses.length === 0 ? (
              <Card>
                <CardBody>
                  <div className="text-center py-8 text-gray-500">
                    <Bus className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                    <p>No buses found matching your criteria</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setFilters({
                        busType: [],
                        acType: '',
                        seatType: '',
                        minPrice: '',
                        maxPrice: '',
                        minSeats: ''
                      })}
                      className="mt-4"
                    >
                      Clear Filters
                    </Button>
                  </div>
                </CardBody>
              </Card>
            ) : (
              filteredBuses.map(bus => (
                <Card key={bus.id} hover>
                  <CardBody>
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      {/* Bus Info */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{bus.operator}</h3>
                            <p className="text-sm text-gray-600">{bus.busNumber}</p>
                          </div>
                          <Badge variant="info">{bus.busType}</Badge>
                        </div>

                        <div className="flex items-center space-x-1 mb-3">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < Math.floor(bus.rating)
                                  ? 'text-yellow-500 fill-yellow-500'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                          <span className="text-sm text-gray-600 ml-1">{bus.rating}</span>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-3">
                          {bus.amenities.slice(0, 4).map((amenity, index) => (
                            <span key={index} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                              {amenity}
                            </span>
                          ))}
                          {bus.amenities.length > 4 && (
                            <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                              +{bus.amenities.length - 4} more
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Schedule */}
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-center">
                            <p className="text-lg font-bold text-gray-900">{formatTime(bus.schedule?.departure)}</p>
                            <p className="text-xs text-gray-600">{bus.route?.source || bus.route?.from}</p>
                          </div>
                          <div className="flex-1 px-4">
                            <div className="flex items-center justify-center">
                              <div className="h-px bg-gray-300 flex-1" />
                              <Clock className="w-4 h-4 text-gray-500 mx-2" />
                              <div className="h-px bg-gray-300 flex-1" />
                            </div>
                            <p className="text-xs text-gray-500 text-center mt-1">{formatDuration(bus.schedule?.duration || bus.route?.estimatedDuration)}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-lg font-bold text-gray-900">{formatTime(bus.schedule?.arrival)}</p>
                            <p className="text-xs text-gray-600">{bus.route?.destination || bus.route?.to}</p>
                          </div>
                        </div>
                      </div>

                      {/* Price and Action */}
                      <div className="flex lg:flex-col items-center justify-between lg:justify-center gap-4">
                        <div className="text-center lg:text-right">
                          <p className="text-2xl font-bold text-primary-600">₹{bus.fare || bus.price}</p>
                          <p className="text-xs text-gray-500">per seat</p>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Users className="w-4 h-4" />
                          <span>{bus.availableSeats} seats left</span>
                        </div>
                        <Link to={`/bus/${bus.scheduleId}`}>
                          <Button variant="primary" size="sm" icon={Armchair}>
                            View Seats
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Search;
