// SmartSeat Context for managing SmartSeat preferences and monitoring
import { createContext, useContext, useState, useCallback } from 'react';

const SmartSeatContext = createContext(null);

export const SmartSeatProvider = ({ children }) => {
  const [preferences, setPreferences] = useState({
    adjacentSeatMonitoring: true,
    notifyOnAdjacentChange: true,
    showPassengerCategory: false,
    preferredAdjacentCondition: 'empty', // 'empty', 'any', 'same_category'
    allowRecommendations: true,
    sectionPreference: 'middle', // 'front', 'middle', 'rear'
    windowPreference: true,
    accessibilityPriority: false
  });

  const [monitoringStatus, setMonitoringStatus] = useState({});
  const [adjacentSeatInfo, setAdjacentSeatInfo] = useState(null);

  const updatePreferences = useCallback((newPreferences) => {
    setPreferences(prev => ({ ...prev, ...newPreferences }));
  }, []);

  const setSeatMonitoring = useCallback((bookingId, enabled) => {
    setMonitoringStatus(prev => ({
      ...prev,
      [bookingId]: enabled
    }));
  }, []);

  const updateAdjacentSeatInfo = useCallback((bookingId, seatInfo) => {
    setAdjacentSeatInfo(prev => ({
      ...prev,
      [bookingId]: seatInfo
    }));
  }, []);

  const isMonitoringEnabled = useCallback((bookingId) => {
    return monitoringStatus[bookingId] ?? preferences.adjacentSeatMonitoring;
  }, [monitoringStatus, preferences.adjacentSeatMonitoring]);

  const getAdjacentInfo = useCallback((bookingId) => {
    return adjacentSeatInfo[bookingId] || null;
  }, [adjacentSeatInfo]);

  const shouldNotifyOnAdjacentChange = useCallback(() => {
    return preferences.notifyOnAdjacentChange;
  }, [preferences.notifyOnAdjacentChange]);

  const shouldShowPassengerCategory = useCallback(() => {
    return preferences.showPassengerCategory;
  }, [preferences.showPassengerCategory]);

  const shouldAllowRecommendations = useCallback(() => {
    return preferences.allowRecommendations;
  }, [preferences.allowRecommendations]);

  const getPreferredSection = useCallback(() => {
    return preferences.sectionPreference;
  }, [preferences.sectionPreference]);

  const prefersWindowSeat = useCallback(() => {
    return preferences.windowPreference;
  }, [preferences.windowPreference]);

  const hasAccessibilityPriority = useCallback(() => {
    return preferences.accessibilityPriority;
  }, [preferences.accessibilityPriority]);

  const getPreferredAdjacentCondition = useCallback(() => {
    return preferences.preferredAdjacentCondition;
  }, [preferences.preferredAdjacentCondition]);

  const value = {
    preferences,
    monitoringStatus,
    adjacentSeatInfo,
    updatePreferences,
    setSeatMonitoring,
    updateAdjacentSeatInfo,
    isMonitoringEnabled,
    getAdjacentInfo,
    shouldNotifyOnAdjacentChange,
    shouldShowPassengerCategory,
    shouldAllowRecommendations,
    getPreferredSection,
    prefersWindowSeat,
    hasAccessibilityPriority,
    getPreferredAdjacentCondition
  };

  return <SmartSeatContext.Provider value={value}>{children}</SmartSeatContext.Provider>;
};

export const useSmartSeat = () => {
  const context = useContext(SmartSeatContext);
  if (!context) {
    throw new Error('useSmartSeat must be used within a SmartSeatProvider');
  }
  return context;
};
