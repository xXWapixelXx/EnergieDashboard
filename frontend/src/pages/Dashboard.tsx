import { FiHome, FiBarChart2, FiSettings, FiAlertTriangle, FiUser, FiBattery, FiSun, FiTrendingUp, FiEye, FiEyeOff, FiInfo, FiLogOut, FiCpu, FiZap, FiLoader } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { widgetRegistry } from '../components/widgets';
import React from 'react';
import type { DropResult, DraggableProvided, DroppableProvided, DraggableStateSnapshot } from 'react-beautiful-dnd';
import authService from '../services/auth';
import { useNavigate, useLocation } from 'react-router-dom';
import Layout from '../components/Layout';
import { useDeviceVisibility } from '../context/DeviceVisibilityContext';
import axios from 'axios';
import * as FiIcons from 'react-icons/fi';

// Import widgets directly
import PowerHistoryChartWidget from '../components/widgets/PowerHistoryChartWidget';
import LiveUsageWidget from '../components/widgets/LiveUsageWidget';
import BatteryWidget from '../components/widgets/BatteryWidget';
import TemperatureWidget from '../components/widgets/TemperatureWidget';
import AIAlertsWidget from '../components/widgets/AIAlertsWidget';
import DeviceWidget from '../components/widgets/DeviceWidget';

const navItems = [
  { icon: <FiHome />, label: 'Dashboard', path: '/dashboard' },
  { icon: <FiBarChart2 />, label: 'Historiek', path: '/historiek' },
  { icon: <FiSettings />, label: 'Instellingen', path: '/instellingen' },
  { icon: <FiAlertTriangle />, label: 'Alerts', path: '/alerts', hasAlert: true },
];

const WIDGETS_STORAGE_KEY = 'dashboard_widgets_v1';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const Dashboard = () => {
  const { deviceVisibility, setDeviceVisibility } = useDeviceVisibility();
  const [showSettings, setShowSettings] = React.useState(false);
  // Get logged-in user
  const user = authService.getUser();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = React.useState(true);

  // Smart caching for devices
  const CACHE_KEY = 'dashboard_devices_cache';
  const CACHE_TIME_KEY = 'dashboard_devices_cache_time';
  const CACHE_MAX_AGE = 5 * 60 * 1000; // 5 minutes

  const [devices, setDevices] = React.useState<any[]>(() => {
    const cached = localStorage.getItem(CACHE_KEY);
    return cached ? JSON.parse(cached) : [];
  });
  const [devicesLoading, setDevicesLoading] = React.useState(false);

  // Helper to fetch and cache devices
  const fetchAndCacheDevices = () => {
    setDevicesLoading(true);
    fetch(`${API_URL}/api/devices/usage`)
      .then(res => res.json())
      .then(data => {
        setDevices(data);
        localStorage.setItem(CACHE_KEY, JSON.stringify(data));
        localStorage.setItem(CACHE_TIME_KEY, Date.now().toString());
      })
      .finally(() => setDevicesLoading(false));
  };

  // On mount, only fetch if cache is missing or stale
  React.useEffect(() => {
    const cacheTime = localStorage.getItem(CACHE_TIME_KEY);
    const isStale = !cacheTime || (Date.now() - parseInt(cacheTime, 10) > CACHE_MAX_AGE);
    if (!localStorage.getItem(CACHE_KEY) || isStale) {
      fetchAndCacheDevices();
    }
  }, []);

  React.useEffect(() => {
    // Wait for both devices and widgets to be ready
    if (!devicesLoading && devices.length >= 0) {
      setLoading(false);
    }
  }, [devicesLoading, devices.length]);

  // Merge widgets and devices for dashboard and selection
  const deviceWidgets = devices.map((device: any) => ({
    id: `device-${device.id}`,
    name: device.label,
    component: () => <DeviceWidget device={device} />,
    isDevice: true,
  }));
  const allWidgets = [
    ...widgetRegistry,
    ...deviceWidgets,
  ];

  // Widget visibility state (persisted)
  const [widgetState, setWidgetState] = React.useState(() => {
    const saved = localStorage.getItem(WIDGETS_STORAGE_KEY);
    let order = allWidgets.map(w => w.id);
    let hidden: string[] = [];
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const savedOrder: string[] = parsed.order || [];
        order = [
          ...savedOrder.filter(id => order.includes(id)),
          ...order.filter(id => !savedOrder.includes(id)),
        ];
        hidden = parsed.hidden || [];
      } catch {}
    }
    return { order, hidden };
  });

  React.useEffect(() => {
    localStorage.setItem(WIDGETS_STORAGE_KEY, JSON.stringify(widgetState));
  }, [widgetState]);

  // Only show these widgets (no device widgets in main grid)
  const allowedWidgetIds = ['ai-prediction', 'history', 'live-usage'];
  const visibleWidgets = widgetState.order.filter(id => !widgetState.hidden.includes(id) && allowedWidgetIds.includes(id));
  // Only show toggles for allowed widgets and device cards
  const deviceWidgetIds = devices.map((device: any) => `device-${device.id}`);
  const allowedWidgets = [
    ...allWidgets.filter(w => allowedWidgetIds.includes(w.id)),
    ...devices.map(device => ({ id: `device-${device.id}`, name: device.label }))
  ];

  // After fetching devices, update widgetState.order to include all device widgets
  React.useEffect(() => {
    if (devices.length === 0) return;
    setWidgetState(prev => {
      // Build the new device widget IDs
      const deviceWidgetIds = devices.map((device: any) => `device-${device.id}`);
      // Remove device widgets that no longer exist
      let newOrder = prev.order.filter(id => !id.startsWith('device-') || deviceWidgetIds.includes(id));
      // Add any new device widgets to the end
      deviceWidgetIds.forEach(id => {
        if (!newOrder.includes(id)) newOrder.push(id);
      });
      return { ...prev, order: newOrder };
    });
  }, [devices.length]);

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const newOrder = Array.from(widgetState.order);
    const [removed] = newOrder.splice(result.source.index, 1);
    newOrder.splice(result.destination.index, 0, removed);
    setWidgetState((ws: typeof widgetState) => ({ ...ws, order: newOrder }));
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  // Calculate stats for top bar
  const liveUsage = devices.find(d => d.label?.toLowerCase().includes('energieverbruik'))?.usage ?? '--';
  const deviceCount = devices.length;
  const aiPrediction = localStorage.getItem('ai_prediction_cache') ?? '--';

  return (
    <Layout>
      {/* Dynamic animated background */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-sky-900 via-purple-900 to-indigo-900 animate-gradient-x" style={{ backgroundSize: '400% 400%' }} />
      {loading ? (
        <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-sky-900/80 to-purple-900/80 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center gap-4"
          >
            <FiLoader className="animate-spin text-5xl text-sky-400" />
            <div className="text-xl text-primary-100 font-bold">Dashboard laden...</div>
          </motion.div>
        </div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
          <div className="px-2 sm:px-4 md:px-8 ml-8 mr-8 w-full">
            {/* Floating widget settings and refresh button, bottom right */}
            <div className="fixed right-8 bottom-8 z-40 flex flex-col gap-4 items-end">
              <button
                className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-white/30 backdrop-blur-2xl border border-white/30 shadow-2xl text-primary-900 hover:bg-primary-600/80 hover:text-white transition-all text-lg font-semibold"
                onClick={() => setShowSettings(s => !s)}
              >
                <FiSettings className="text-xl" /> Widgets
              </button>
              <button
                className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-sky-500/80 text-white border border-sky-400 shadow-2xl hover:bg-sky-600 transition-all text-lg font-semibold"
                onClick={fetchAndCacheDevices}
                disabled={devicesLoading}
              >
                {devicesLoading ? <FiLoader className="animate-spin" /> : <FiLoader />} Vernieuwen
              </button>
            </div>
            {showSettings && (
              <div className="mb-6 p-4 bg-white/20 rounded-2xl shadow-lg flex flex-wrap gap-3">
                {allowedWidgets.map(w => (
                  <button
                    key={w.id}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition ${widgetState.hidden.includes(w.id) ? 'bg-primary-700/20 text-primary-200 border-primary-700' : 'bg-primary-400/10 text-primary-100 border-primary-400'}`}
                    onClick={() => widgetState.hidden.includes(w.id) ? setWidgetState(ws => ({ ...ws, hidden: ws.hidden.filter(h => h !== w.id) })) : setWidgetState(ws => ({ ...ws, hidden: [...ws.hidden, w.id] }))}
                  >
                    {widgetState.hidden.includes(w.id) ? <FiEyeOff /> : <FiEye />} {w.name}
                  </button>
                ))}
              </div>
            )}
            {/* Section header for widgets */}
            <h2 className="text-3xl font-extrabold text-primary-100 mb-6 flex items-center gap-3"><FiBarChart2 className="text-purple-400" /> Dashboard Widgets</h2>
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="dashboard-widgets" direction="horizontal">
                {(provided: DroppableProvided) => (
                  <div
                    className="w-full grid gap-8 mb-12"
                    style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))' }}
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                  >
                    <AnimatePresence>
                      {visibleWidgets.map((id: string, idx: number) => {
                        const widget = allWidgets.find(w => w.id === id);
                        if (!widget) return null;
                        const WidgetComp = widget.component;
                        const isChart = id === 'power-history-chart';
                        return (
                          <motion.div
                            key={id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                            className={isChart ? 'col-span-2' : ''}
                            style={isChart ? { minHeight: 400, gridColumn: 'span 2' } : { minHeight: 180 }}
                          >
                            <Draggable key={id} draggableId={id} index={idx}>
                              {(provided: DraggableProvided, snapshot: DraggableStateSnapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className={isChart ? 'col-span-2' : ''}
                                  style={{
                                    ...(isChart ? { minHeight: 400, gridColumn: 'span 2' } : { minHeight: 180 }),
                                    ...provided.draggableProps.style,
                                    transition: 'box-shadow 0.2s, transform 0.2s',
                                    boxShadow: snapshot.isDragging ? '0 8px 32px 0 rgba(56,189,248,0.25)' : '0 4px 16px 0 rgba(56,189,248,0.10)',
                                    borderRadius: 24,
                                    background: 'linear-gradient(135deg, rgba(56,189,248,0.15) 0%, rgba(168,85,247,0.10) 100%)',
                                  }}
                                >
                                  {isChart && (
                                    <div className="absolute top-4 right-4 z-10 flex items-center gap-2 text-primary-200">
                                      <FiInfo title="De grafiek toont het gemiddelde verbruik per dag. De live waarde is het actuele verbruik op dit moment." />
                                    </div>
                                  )}
                                  <WidgetComp />
                                </div>
                              )}
                            </Draggable>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
            {/* Section header for Apparaten */}
            {devices.length > 0 && (
              <div className="mt-12">
                <h2 className="text-3xl font-extrabold text-primary-100 mb-6 flex items-center gap-3"><FiCpu className="text-sky-400" /> Apparaten</h2>
                <div className="w-full grid gap-8" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))' }}>
                  {devices.filter(device => !widgetState.hidden.includes(`device-${device.id}`)).map(device => (
                    <motion.div
                      key={device.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <DeviceWidget device={device} />
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
            {/* Alerts section at the bottom */}
            <div className="w-full bg-white/10 rounded-2xl shadow-lg p-6 mt-12">
              <div className="font-bold text-lg text-primary-100 mb-4 flex items-center gap-2">
                <FiAlertTriangle className="text-yellow-300" /> Alerts
              </div>
              <AIAlertsWidget />
            </div>
          </div>
        </motion.div>
      )}
    </Layout>
  );
};

export default Dashboard; 