import { FiHome, FiBarChart2, FiSettings, FiAlertTriangle, FiUser, FiBattery, FiSun, FiTrendingUp, FiEye, FiEyeOff, FiInfo, FiLogOut } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { widgetRegistry } from '../components/widgets';
import React from 'react';
import type { DropResult, DraggableProvided, DroppableProvided, DraggableStateSnapshot } from 'react-beautiful-dnd';
import authService from '../services/auth';
import { useNavigate, useLocation } from 'react-router-dom';
import Layout from '../components/Layout';

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
    <Layout>
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
    </Layout>
  );
};

export default Dashboard; 