import React, { createContext, useContext, useState, useEffect } from 'react';

// Type for device visibility: { [deviceId: string]: boolean }
type DeviceVisibility = Record<string, boolean>;

type DeviceVisibilityContextType = {
  deviceVisibility: DeviceVisibility;
  setDeviceVisibility: (vis: DeviceVisibility) => void;
  toggleDeviceVisibility: (deviceId: string) => void;
};

const DeviceVisibilityContext = createContext<DeviceVisibilityContextType | undefined>(undefined);

const DEVICE_VIS_KEY = 'deviceVisibility';

export const DeviceVisibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [deviceVisibility, setDeviceVisibility] = useState<DeviceVisibility>(() => {
    const stored = localStorage.getItem(DEVICE_VIS_KEY);
    return stored ? JSON.parse(stored) : {};
  });

  useEffect(() => {
    localStorage.setItem(DEVICE_VIS_KEY, JSON.stringify(deviceVisibility));
  }, [deviceVisibility]);

  const toggleDeviceVisibility = (deviceId: string) => {
    setDeviceVisibility((prev) => ({ ...prev, [deviceId]: !prev[deviceId] }));
  };

  return (
    <DeviceVisibilityContext.Provider value={{ deviceVisibility, setDeviceVisibility, toggleDeviceVisibility }}>
      {children}
    </DeviceVisibilityContext.Provider>
  );
};

export const useDeviceVisibility = () => {
  const ctx = useContext(DeviceVisibilityContext);
  if (!ctx) throw new Error('useDeviceVisibility must be used within DeviceVisibilityProvider');
  return ctx;
}; 