import { FiHome, FiBarChart2, FiSettings, FiAlertTriangle, FiUser, FiBattery, FiSun, FiTrendingUp, FiEye, FiEyeOff, FiInfo, FiLogOut } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { widgetRegistry } from '../components/widgets';
import React from 'react';
import type { DropResult, DraggableProvided, DroppableProvided, DraggableStateSnapshot } from 'react-beautiful-dnd';
import authService from '../services/auth';
import { useNavigate, useLocation } from 'react-router-dom';

// Import widgets directly
import PowerHistoryChartWidget from '../components/widgets/PowerHistoryChartWidget';
import LiveUsageWidget from '../components/widgets/LiveUsageWidget';
import BatteryWidget from '../components/widgets/BatteryWidget';
import TemperatureWidget from '../components/widgets/TemperatureWidget';
import AIAlertsWidget from '../components/widgets/AIAlertsWidget';

const navItems = [
  { icon: <FiHome />, label: 'Dashboard', path: '/dashboard' },
  { icon: <FiBarChart2 />, label: 'Historiek', path: '/historiek' },
  { icon: <FiSettings />, label: 'Instellingen', path: '/instellingen' },
  { icon: <FiAlertTriangle />, label: 'Alerts', path: '/alerts', hasAlert: true },
];

const WIDGETS_STORAGE_KEY = 'dashboard_widgets_v1';

function getInitialWidgetState() {
  const saved = localStorage.getItem(WIDGETS_STORAGE_KEY);
  let order = widgetRegistry.map(w => w.id);
  let hidden: string[] = [];
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      // Merge: keep existing order, append any new widgets at the end
      const savedOrder: string[] = parsed.order || [];
      order = [
        ...savedOrder.filter(id => order.includes(id)),
        ...order.filter(id => !savedOrder.includes(id)),
      ];
      hidden = parsed.hidden || [];
    } catch {}
  }
  return {
    order,
    hidden,
  };
}

const Dashboard = () => {
  const [widgetState, setWidgetState] = React.useState(getInitialWidgetState());
  const [showSettings, setShowSettings] = React.useState(false);
  // Get logged-in user
  const user = authService.getUser();
  const navigate = useNavigate();
  const location = useLocation();

  React.useEffect(() => {
    localStorage.setItem(WIDGETS_STORAGE_KEY, JSON.stringify(widgetState));
  }, [widgetState]);

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const newOrder = Array.from(widgetState.order);
    const [removed] = newOrder.splice(result.source.index, 1);
    newOrder.splice(result.destination.index, 0, removed);
    setWidgetState((ws: typeof widgetState) => ({ ...ws, order: newOrder }));
  };

  const hideWidget = (id: string) => {
    setWidgetState((ws: typeof widgetState) => ({ ...ws, hidden: [...ws.hidden, id] }));
  };

  const showWidget = (id: string) => {
    setWidgetState((ws: typeof widgetState) => ({ ...ws, hidden: ws.hidden.filter((h: string) => h !== id) }));
  };

  const visibleWidgets = widgetState.order.filter(id => !widgetState.hidden.includes(id));

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  return (
    <div className="relative min-h-screen w-screen overflow-x-hidden bg-gradient-to-br from-primary-900 via-purple-900 to-gray-900 flex items-stretch">
      {/* Sidebar */}
      <motion.aside
        initial={{ x: -80, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 80, damping: 18 }}
        className="fixed top-8 left-8 z-30 flex flex-col gap-4 bg-white/10 backdrop-blur-2xl border border-white/20 shadow-2xl rounded-3xl px-2 py-10 w-24 items-center min-h-[600px]"
        style={{ boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)' }}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 18, delay: 0.2 }}
          className="w-14 h-14 rounded-2xl gradient-bg flex items-center justify-center shadow-xl mb-8"
        >
          <span className="text-3xl" role="img" aria-label="lightning">⚡</span>
        </motion.div>
        <nav className="flex flex-col gap-4 w-full items-center">
          {navItems.map((item, i) => (
            <motion.button
              key={item.label}
              whileHover={{ scale: 1.15 }}
              onClick={() => navigate(item.path)}
              className={`relative flex flex-col items-center justify-center w-16 h-16 rounded-2xl text-3xl transition-all duration-150
                ${location.pathname === item.path ? 'bg-primary-600/80 text-white shadow-lg' : 'text-primary-200 hover:bg-primary-700/30 hover:text-white'}`}
              title={item.label}
            >
              {item.icon}
              {item.hasAlert && (
                <span className="absolute top-3 right-3 w-3 h-3 bg-red-500 rounded-full border-2 border-white/40"></span>
              )}
            </motion.button>
          ))}
          {/* Only show Admin button if user is admin or superadmin */}
          {(user?.role === 'admin' || user?.role === 'superadmin') && (
            <motion.button
              whileHover={{ scale: 1.15 }}
              onClick={() => navigate('/admin')}
              className={`relative flex flex-col items-center justify-center w-16 h-16 rounded-2xl text-3xl transition-all duration-150
                ${location.pathname === '/admin' ? 'bg-primary-600/80 text-white shadow-lg' : 'text-primary-200 hover:bg-primary-700/30 hover:text-white'}`}
              title="Admin"
            >
              <FiUser />
            </motion.button>
          )}
          {/* Always show logout button at the bottom */}
          <motion.button
            whileHover={{ scale: 1.15 }}
            className="relative flex flex-col items-center justify-center w-16 h-16 rounded-2xl text-3xl transition-all duration-150 text-primary-200 hover:bg-red-600/80 hover:text-white mt-2"
            onClick={handleLogout}
            title="Uitloggen"
          >
            <FiLogOut />
          </motion.button>
        </nav>
      </motion.aside>

      {/* Main content grid */}
      <main className="flex-1 flex flex-col py-12 ml-32">
        <div className="px-2 sm:px-4 md:px-8 w-full">
          {/* Floating widget settings button, bottom right */}
          <div className="fixed right-8 bottom-8 z-40">
            <button
              className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-white/30 backdrop-blur-2xl border border-white/30 shadow-2xl text-primary-900 hover:bg-primary-600/80 hover:text-white transition-all text-lg font-semibold"
              onClick={() => setShowSettings(s => !s)}
            >
              <FiSettings className="text-xl" /> Widgets
            </button>
          </div>
          {showSettings && (
            <div className="mb-6 p-4 bg-white/20 rounded-2xl shadow-lg flex flex-wrap gap-3">
              {widgetRegistry.map(w => (
                <button
                  key={w.id}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition ${widgetState.hidden.includes(w.id) ? 'bg-primary-700/20 text-primary-200 border-primary-700' : 'bg-primary-400/10 text-primary-100 border-primary-400'}`}
                  onClick={() => widgetState.hidden.includes(w.id) ? showWidget(w.id) : hideWidget(w.id)}
                >
                  {widgetState.hidden.includes(w.id) ? <FiEyeOff /> : <FiEye />} {w.name}
                </button>
              ))}
            </div>
          )}
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="dashboard-widgets" direction="horizontal">
              {(provided: DroppableProvided) => (
                <div
                  className="w-full grid gap-6 mb-10"
                  style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))' }}
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                >
                  {visibleWidgets.map((id: string, idx: number) => {
                    const widget = widgetRegistry.find(w => w.id === id);
                    if (!widget) return null;
                    const WidgetComp = widget.component;
                    // Make the PowerHistoryChartWidget bigger
                    const isChart = id === 'power-history-chart';
                    return (
                      <Draggable key={id} draggableId={id} index={idx}>
                        {(provided: DraggableProvided, snapshot: DraggableStateSnapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={isChart ? 'col-span-2 row-span-2' : ''}
                            style={isChart ? { minHeight: 400, gridColumn: 'span 2', ...provided.draggableProps.style } : provided.draggableProps.style}
                          >
                            {/* Info icon for chart */}
                            {isChart && (
                              <div className="absolute top-4 right-4 z-10 flex items-center gap-2 text-primary-200">
                                <FiInfo title="De grafiek toont het gemiddelde verbruik per dag. De live waarde is het actuele verbruik op dit moment." />
                              </div>
                            )}
                            <WidgetComp />
                          </div>
                        )}
                      </Draggable>
                    );
                  })}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
          {/* Alerts section at the bottom */}
          <div className="w-full bg-white/10 rounded-2xl shadow-lg p-6 mt-8">
            <div className="font-bold text-lg text-primary-100 mb-4 flex items-center gap-2">
              <FiAlertTriangle className="text-yellow-300" /> Alerts
            </div>
            <AIAlertsWidget />
          </div>
        </div>
      </main>

      {/* Floating user/profile button */}
      <motion.button
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1, type: 'spring' }}
        className="fixed top-8 right-8 z-40 bg-white/20 backdrop-blur-2xl border border-white/30 shadow-2xl rounded-full p-2 flex items-center gap-3 hover:bg-primary-600/80 hover:text-white transition-all opacity-50 hover:opacity-100 transition-opacity"
      >
        <span className="w-10 h-10 rounded-full border-2 border-primary-400 bg-primary-800 flex items-center justify-center">
          <FiUser className="text-2xl text-primary-200" />
        </span>
        <span className="font-bold text-primary-100 pr-4 pl-2 hidden md:inline">
          {user?.email || user?.sub || 'Gebruiker'}
        </span>
      </motion.button>
    </div>
  );
};

export default Dashboard; 