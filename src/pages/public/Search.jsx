// Search buses page - SmartSeat Premium Bus Search Experience

import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardBody, Button, Select, Badge, Skeleton, Input } from '../../components/common';
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
  Sparkles,
  ArrowRight,
  Compass
} from 'lucide-react';

import './Search.css';

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
      // Don't run the search when there are no params yet
      const from = searchParams.get('from') || '';
      const to   = searchParams.get('to')   || '';
      const date = searchParams.get('date') || '';
      const boardingPoint = searchParams.get('boardingPoint') || '';
      const droppingPoint = searchParams.get('droppingPoint') || '';
      const passengers = searchParams.get('passengers') || '';

      if (!from && !to && !date) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setBuses([]);
      setFilteredBuses([]);
      const params = { from, to, date, boardingPoint, droppingPoint, passengers };

      try {
        const response = await busService.searchBuses(params);
        if (response.success) {
          setBuses(response.data);
          setFilteredBuses(response.data);
        } else {
          console.error('Search failed:', response.message);
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
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatDuration = (duration) => {
    return duration || 'N/A';
  };

  // ──────────────────────────────────────────────────────────
  // NO SEARCH CRITERIA — user navigated directly to /search
  // without from/to/date params (e.g. from the navbar link).
  // Show a helpful prompt instead of "0 buses available".
  // ──────────────────────────────────────────────────────────
  const hasSearchCriteria =
    searchParams.get('from') ||
    searchParams.get('to')   ||
    searchParams.get('date');

  if (!loading && !hasSearchCriteria) {
    return (
      <div className="search-page-container min-h-screen py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-3xl p-12 border border-slate-200 text-center shadow-sm">
            <Compass className="w-16 h-16 mx-auto mb-4 text-cyan-500" />
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-2">
              Plan Your Journey
            </h2>
            <p className="text-slate-500 text-sm mb-6 max-w-md mx-auto">
              Select a departure city, destination, and date on the home page to find available buses.
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 text-white font-bold text-sm uppercase tracking-wider shadow-md"
            >
              <ArrowRight className="w-4 h-4" />
              Go to Home Search
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="search-page-container min-h-screen py-8 px-4">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="h-24 rounded-2xl skeleton-shimmer bg-slate-800/40" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="bg-slate-900/80 border-slate-800">
                <CardBody>
                  <Skeleton count={4} className="h-4" />
                </CardBody>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="search-page-container min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* SEARCH SUMMARY HERO CARD */}
        <div className="search-summary-hero">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-cyan-400 animate-pulse" />
                <span className="font-black text-lg text-white uppercase tracking-wider">
                  {searchParams.get('from') || 'Origin'} <span className="text-cyan-400 font-normal">→</span> {searchParams.get('to') || 'Destination'}
                </span>
              </div>

              {(searchParams.get('boardingPoint') || searchParams.get('droppingPoint')) && (
                <div className="flex items-center gap-1.5 px-3 py-1 bg-cyan-950/70 border border-cyan-500/40 rounded-xl text-xs font-semibold text-cyan-300">
                  <span>Stops: <strong>{searchParams.get('boardingPoint') || searchParams.get('from')}</strong> → <strong>{searchParams.get('droppingPoint') || searchParams.get('to')}</strong></span>
                </div>
              )}
              
              {searchParams.get('date') && (
                <div className="flex items-center gap-2 px-3 py-1 bg-slate-900/80 rounded-xl border border-slate-700 text-xs font-mono text-cyan-300">
                  <Calendar className="w-4 h-4 text-cyan-400" />
                  <span>{searchParams.get('date')}</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 rounded-full text-xs font-bold font-mono uppercase">
                {filteredBuses.length} Buses Available
              </span>
              {searchParams.get('passengers') && Number(searchParams.get('passengers')) > 1 && (
                <span className="px-3 py-1 bg-slate-800 text-slate-300 border border-slate-700 rounded-full text-xs font-mono">
                  {searchParams.get('passengers')} passengers
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          
          {/* FILTERS SIDEBAR */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="filters-sidebar-card">
              <CardHeader className="border-b border-slate-100 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-cyan-600" />
                    <h3 className="font-black text-sm text-slate-900 uppercase tracking-wider">Filters</h3>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowFilters(!showFilters)}
                    icon={Filter}
                    className="text-xs text-slate-500 hover:text-cyan-600"
                  >
                    {showFilters ? 'Hide' : 'Show'}
                  </Button>
                </div>
              </CardHeader>

              {showFilters && (
                <CardBody className="p-4">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Bus Type</label>
                      <div className="space-y-2">
                        {['AC Sleeper', 'AC Seater', 'Non-AC Sleeper', 'Non-AC Seater'].map(type => (
                          <label key={type} className="flex items-center space-x-2 cursor-pointer">
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
                              className="rounded text-cyan-600 focus:ring-cyan-500"
                            />
                            <span className="text-xs text-slate-700 font-medium">{type}</span>
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
                      className="w-full text-xs font-bold uppercase tracking-wider"
                    >
                      Clear Filters
                    </Button>
                  </div>
                </CardBody>
              )}
            </div>
          </div>

          {/* BUS RESULTS FEED */}
          <div className="flex-1 space-y-4">
            
            {/* SORT CONTROL BAR */}
            <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ArrowUpDown className="w-4 h-4 text-cyan-600" />
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Sort By:</span>
                <Select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  options={[
                    { value: 'departure', label: 'Departure Time' },
                    { value: 'price', label: 'Price (Low to High)' },
                    { value: 'duration', label: 'Duration' },
                    { value: 'rating', label: 'Rating' }
                  ]}
                  className="w-48 text-xs font-semibold"
                />
              </div>
            </div>

            {/* RESULTS LIST */}
            {filteredBuses.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 border border-slate-200 text-center shadow-sm">
                <Bus className="w-14 h-14 mx-auto mb-4 text-slate-300" />
                <h3 className="text-lg font-bold text-slate-800 uppercase tracking-wider">No buses found</h3>
                <p className="text-xs text-slate-500 mt-1">
                  {buses.length > 0
                    ? 'No schedules match your current filters. Try clearing the filters.'
                    : `No buses found for ${searchParams.get('from') || '?'} → ${searchParams.get('to') || '?'} on ${searchParams.get('date') || 'this date'}.`}
                </p>
                {buses.length > 0 && (
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
                    className="mt-4 text-xs font-bold uppercase tracking-wider"
                  >
                    Clear Filters
                  </Button>
                )}
                {buses.length === 0 && (
                  <Link to="/" className="inline-block mt-4">
                    <Button variant="outline" size="sm" className="text-xs font-bold uppercase tracking-wider">
                      Search Again
                    </Button>
                  </Link>
                )}
              </div>
            ) : (
              filteredBuses.map(bus => (
                <div key={bus.id} className="bus-card-premium">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    
                    {/* BUS OPERATOR & TYPE */}
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-black text-slate-900 tracking-wide">{bus.operator}</h3>
                          <p className="text-xs font-mono font-bold text-cyan-600">{bus.busNumber}</p>
                        </div>
                        <Badge variant="info" className="bg-cyan-50 text-cyan-700 border-cyan-200 text-[10px] uppercase font-bold">
                          {bus.busType}
                        </Badge>
                      </div>

                      {/* RATING */}
                      <div className="flex items-center space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${
                              i < Math.floor(bus.rating)
                                ? 'text-amber-400 fill-amber-400'
                                : 'text-slate-200'
                            }`}
                          />
                        ))}
                        <span className="text-xs font-bold text-slate-700 ml-1">{bus.rating}</span>
                      </div>

                      {/* AMENITIES */}
                      {bus.amenities && bus.amenities.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {bus.amenities.slice(0, 4).map((amenity, index) => (
                            <span key={index} className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md border border-slate-200">
                              {amenity}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* SCHEDULE & ROUTE VISUALIZATION */}
                    <div className="flex-1 bg-slate-50/80 p-3 rounded-2xl border border-slate-100">
                      <div className="flex items-center justify-between">
                        <div className="text-center">
                          <p className="text-lg font-black text-slate-900">{formatTime(bus.schedule?.departure)}</p>
                          <p className="text-xs font-semibold text-slate-600">{bus.route?.source || bus.route?.from}</p>
                          {(bus.selectedBoardingPoint || searchParams.get('boardingPoint')) && (
                            <p className="text-[10px] text-cyan-600 font-bold mt-0.5">
                              Board: {bus.selectedBoardingPoint?.name || searchParams.get('boardingPoint')}
                            </p>
                          )}
                        </div>
                        
                        <div className="flex-1 px-4">
                          <div className="flex items-center justify-center relative">
                            <div className="w-full route-vis-line" />
                            <Clock className="w-4 h-4 text-cyan-600 bg-white rounded-full p-0.5 shadow-sm absolute" />
                          </div>
                          <p className="text-[10px] font-mono text-slate-400 text-center mt-1">
                            {formatDuration(bus.schedule?.duration || bus.route?.estimatedDuration)}
                          </p>
                        </div>

                        <div className="text-center">
                          <p className="text-lg font-black text-slate-900">{formatTime(bus.schedule?.arrival)}</p>
                          <p className="text-xs font-semibold text-slate-600">{bus.route?.destination || bus.route?.to}</p>
                          {(bus.selectedDroppingPoint || searchParams.get('droppingPoint')) && (
                            <p className="text-[10px] text-cyan-600 font-bold mt-0.5">
                              Drop: {bus.selectedDroppingPoint?.name || searchParams.get('droppingPoint')}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* PRICE & SEAT ACTION CTA */}
                    <div className="flex lg:flex-col items-center justify-between lg:justify-center gap-3 border-t lg:border-t-0 lg:border-l border-slate-100 pt-3 lg:pt-0 lg:pl-6">
                      <div className="text-left lg:text-right">
                        <p className="text-2xl bus-price-tag font-mono">₹{bus.fare || bus.price}</p>
                        <p className="text-[10px] text-slate-400 uppercase font-medium">per seat</p>
                      </div>

                      <div className="flex items-center space-x-1.5 text-xs text-emerald-600 font-bold bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                        <Users className="w-3.5 h-3.5" />
                        <span>{bus.availableSeats} seats left</span>
                      </div>

                      {(() => {
                        const linkParams = new URLSearchParams();
                        if (searchParams.get('from')) linkParams.set('from', searchParams.get('from'));
                        if (searchParams.get('to')) linkParams.set('to', searchParams.get('to'));
                        if (searchParams.get('date')) linkParams.set('date', searchParams.get('date'));
                        if (searchParams.get('boardingPoint')) linkParams.set('boardingPoint', searchParams.get('boardingPoint'));
                        if (searchParams.get('droppingPoint')) linkParams.set('droppingPoint', searchParams.get('droppingPoint'));
                        if (searchParams.get('passengers')) linkParams.set('passengers', searchParams.get('passengers'));
                        const queryString = linkParams.toString() ? `?${linkParams.toString()}` : '';

                        return (
                          <Link to={`/bus/${bus.scheduleId}${queryString}`}>
                            <Button 
                              variant="primary" 
                              size="sm" 
                              icon={Armchair} 
                              className="bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 font-black px-4 py-2 rounded-xl text-xs uppercase tracking-wider shadow-md hover:shadow-cyan-500/20"
                            >
                              View Seats
                            </Button>
                          </Link>
                        );
                      })()}
                    </div>

                  </div>
                </div>
              ))
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default Search;
