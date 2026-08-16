// Booking Context for managing booking state
import { createContext, useContext, useState, useCallback } from 'react';

const BookingContext = createContext(null);

export const BookingProvider = ({ children }) => {
  const [selectedBus, setSelectedBus] = useState(null);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [searchParams, setSearchParams] = useState(null);
  const [bookingData, setBookingData] = useState(null);
  const [currentBooking, setCurrentBooking] = useState(null);

  const selectBus = useCallback((bus) => {
    setSelectedBus(bus);
  }, []);

  const selectSeat = useCallback((seat) => {
    setSelectedSeat(seat);
  }, []);

  const setSearchParameters = useCallback((params) => {
    setSearchParams(params);
  }, []);

  const setBookingInformation = useCallback((data) => {
    setBookingData(data);
  }, []);

  const setCurrentBookingData = useCallback((booking) => {
    setCurrentBooking(booking);
  }, []);

  const clearBooking = useCallback(() => {
    setSelectedBus(null);
    setSelectedSeat(null);
    setSearchParams(null);
    setBookingData(null);
    setCurrentBooking(null);
  }, []);

  const value = {
    selectedBus,
    selectedSeat,
    searchParams,
    bookingData,
    currentBooking,
    selectBus,
    selectSeat,
    setSearchParameters,
    setBookingInformation,
    setCurrentBookingData,
    clearBooking
  };

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
};

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
};
