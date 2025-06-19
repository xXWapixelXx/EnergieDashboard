import { FiHome, FiBarChart2, FiSettings, FiBell, FiAlertTriangle, FiUser, FiBattery, FiSun, FiTrendingUp, FiChevronRight, FiEye, FiEyeOff } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { widgetRegistry } from '../components/widgets';
import React from 'react';
import type { DropResult, DraggableProvided, DroppableProvided, DraggableStateSnapshot } from 'react-beautiful-dnd';

const navItems = [
  { icon: <FiHome />, label: 'Dashboard', active: true },
  { icon: <FiBarChart2 />, label: 'Historiek' },
  { icon: <FiSettings />, label: 'Instellingen' },
  { icon: <FiAlertTriangle />, label: 'Alerts', hasAlert: true },
  { icon: <FiUser />, label: 'Admin' },
];

const alerts = [
  { icon: <FiAlertTriangle className="text-yellow-500" />, title: 'Hoog energieverbruik gedetecteerd', desc: 'Verbruik 15% hoger dan gemiddeld · 10:34' },
  { icon: <FiTrendingUp className="text-blue-500" />, title: 'Zonnepaneel efficiency gedaald', desc: 'Paneel 3 presteert onder verwachting · 09:15' },
  { icon: <FiBattery className="text-green-500" />, title: 'Batterij volledig opgeladen', desc: 'Automatisch overgeschakeld naar netvoeding · 08:45' },
];

const WIDGETS_STORAGE_KEY = 'dashboard_widgets_v1';

function getInitialWidgetState() {
  const saved = localStorage.getItem(WIDGETS_STORAGE_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {}
  }
  // Default: all widgets visible, default order
  return {
    order: widgetRegistry.map(w => w.id),
    hidden: [],
  };
}

const Dashboard = () => {
  const [widgetState, setWidgetState] = React.useState(getInitialWidgetState());
  const [showSettings, setShowSettings] = React.useState(false);

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

  return (
    <div className="relative min-h-screen w-screen overflow-x-hidden bg-gradient-to-br from-primary-900 via-purple-900 to-gray-900 flex items-stretch">
      {/* Animated, glassy floating sidebar */}
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
              className={`relative flex flex-col items-center justify-center w-16 h-16 rounded-2xl text-3xl transition-all duration-150
                ${item.active ? 'bg-primary-600/80 text-white shadow-lg' : 'text-primary-200 hover:bg-primary-700/30 hover:text-white'}`}
            >
              {item.icon}
              {item.hasAlert && (
                <span className="absolute top-3 right-3 w-3 h-3 bg-red-500 rounded-full border-2 border-white/40"></span>
              )}
            </motion.button>
          ))}
        </nav>
      </motion.aside>

      {/* Animated background particles */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <svg className="absolute left-1/4 top-1/4 w-32 h-32 animate-pulse" viewBox="0 0 100 100" fill="none">
          <circle cx="50" cy="50" r="40" fill="#a21caf" opacity="0.08" />
        </svg>
        <svg className="absolute right-1/3 top-1/2 w-24 h-24 animate-pulse delay-1000" viewBox="0 0 100 100" fill="none">
          <circle cx="50" cy="50" r="30" fill="#38bdf8" opacity="0.07" />
        </svg>
        <svg className="absolute left-1/2 bottom-1/4 w-20 h-20 animate-pulse delay-2000" viewBox="0 0 100 100" fill="none">
          <circle cx="50" cy="50" r="20" fill="#f472b6" opacity="0.09" />
        </svg>
      </div>

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
                  className="w-full grid gap-4 mb-10 justify-stretch"
                  style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                >
                  {visibleWidgets.map((id: string, idx: number) => {
                    const widget = widgetRegistry.find(w => w.id === id);
                    if (!widget) return null;
                    const WidgetComp = widget.component;
                    return (
                      <Draggable key={id} draggableId={id} index={idx}>
                        {(provided: DraggableProvided, snapshot: DraggableStateSnapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="relative"
                          >
                            <WidgetComp />
                            <button
                              className="absolute top-3 right-3 z-10 bg-white/30 hover:bg-red-500/80 text-primary-900 hover:text-white rounded-full p-1 shadow transition"
                              onClick={() => hideWidget(id)}
                              title="Verberg widget"
                            >
                              <FiEyeOff />
                            </button>
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
        </div>
      </main>

      {/* Floating user/profile button */}
      <motion.button
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1, type: 'spring' }}
        className="fixed top-8 right-8 z-40 bg-white/20 backdrop-blur-2xl border border-white/30 shadow-2xl rounded-full p-2 flex items-center gap-3 hover:bg-primary-600/80 hover:text-white transition-all"
      >
        <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="User" className="w-10 h-10 rounded-full border-2 border-primary-400" />
        <span className="font-bold text-primary-100 pr-4 pl-2 hidden md:inline">Jan Janssen</span>
      </motion.button>
    </div>
  );
};

export default Dashboard; 