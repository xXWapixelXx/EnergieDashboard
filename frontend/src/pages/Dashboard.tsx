import { FiHome, FiBarChart2, FiSettings, FiBell, FiAlertTriangle, FiUser, FiBattery, FiSun, FiTrendingUp, FiChevronRight } from 'react-icons/fi';
import { motion } from 'framer-motion';

const navItems = [
  { icon: <FiHome />, label: 'Dashboard', active: true },
  { icon: <FiBarChart2 />, label: 'Historiek' },
  { icon: <FiSettings />, label: 'Instellingen' },
  { icon: <FiAlertTriangle />, label: 'Alerts' },
  { icon: <FiUser />, label: 'Admin' },
];

const alerts = [
  { icon: <FiAlertTriangle className="text-yellow-500" />, title: 'Hoog energieverbruik gedetecteerd', desc: 'Verbruik 15% hoger dan gemiddeld · 10:34' },
  { icon: <FiTrendingUp className="text-blue-500" />, title: 'Zonnepaneel efficiency gedaald', desc: 'Paneel 3 presteert onder verwachting · 09:15' },
  { icon: <FiBattery className="text-green-500" />, title: 'Batterij volledig opgeladen', desc: 'Automatisch overgeschakeld naar netvoeding · 08:45' },
];

const Dashboard = () => {
  return (
    <div className="relative min-h-screen w-screen overflow-x-hidden bg-gradient-to-br from-primary-900 via-purple-900 to-gray-900 flex items-stretch">
      {/* Animated, glassy floating sidebar */}
      <motion.aside
        initial={{ x: -80, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 80, damping: 18 }}
        className="fixed top-0 left-0 z-30 h-screen flex flex-col gap-6 bg-white/10 backdrop-blur-2xl border border-white/20 shadow-2xl rounded-3xl px-6 py-8 w-24 items-center"
        style={{ boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)' }}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 18, delay: 0.2 }}
          className="w-14 h-14 rounded-2xl gradient-bg flex items-center justify-center shadow-xl mb-4"
        >
          <span className="text-3xl" role="img" aria-label="lightning">⚡</span>
        </motion.div>
        {navItems.map((item, i) => (
          <motion.button
            key={item.label}
            whileHover={{ scale: 1.15 }}
            className={`flex flex-col items-center gap-1 w-12 h-12 rounded-xl text-xl transition-all ${item.active ? 'bg-primary-600/80 text-white shadow-lg' : 'text-primary-200 hover:bg-primary-700/30 hover:text-white'}`}
          >
            {item.icon}
            <span className="text-[10px] font-bold tracking-wide uppercase mt-1">{item.label[0]}</span>
            {item.label === 'Alerts' && <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>}
          </motion.button>
        ))}
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
        <div className="px-4 sm:px-8 w-full">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, type: 'spring' }}
            className="w-full grid gap-8 mb-10 justify-stretch"
            style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}
          >
            {/* Live Energy Usage */}
            <motion.div
              whileHover={{ scale: 1.02, boxShadow: '0 8px 32px 0 rgba(56,189,248,0.18)' }}
              className="w-full h-full bg-white/20 backdrop-blur-2xl rounded-3xl shadow-2xl p-10 flex flex-col min-h-[320px] border border-white/20 relative overflow-hidden"
            >
              <div className="font-bold text-2xl text-primary-100 mb-2 flex items-center gap-2">
                <FiTrendingUp className="text-primary-400" /> Live Energieverbruik
              </div>
              <div className="flex-1 flex items-center justify-center text-primary-200 text-lg">Line Chart - Energieverbruik per uur</div>
              <div className="absolute right-6 top-6 w-16 h-16 bg-primary-400/10 rounded-full blur-2xl"></div>
            </motion.div>
            {/* AI Prediction */}
            <motion.div
              whileHover={{ scale: 1.04, boxShadow: '0 8px 32px 0 rgba(162,28,175,0.18)' }}
              className="bg-white/20 backdrop-blur-2xl rounded-3xl shadow-2xl p-10 flex flex-col items-center justify-center border border-white/20 relative overflow-hidden"
            >
              <div className="font-bold text-xl text-primary-100 mb-2 flex items-center gap-2">
                <FiBell className="text-pink-400" /> AI Voorspelling
              </div>
              <div className="text-4xl font-extrabold text-primary-400 mb-1 drop-shadow">24.8 kWh</div>
              <div className="text-primary-200 text-base mb-2">Verwacht verbruik morgen</div>
              <div className="w-full flex justify-center"><span className="text-primary-400 text-xs">AI Trend Grafiek</span></div>
              <div className="absolute left-6 bottom-6 w-12 h-12 bg-pink-400/10 rounded-full blur-2xl"></div>
            </motion.div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, type: 'spring', delay: 0.2 }}
            className="w-full grid gap-8 mb-10 justify-stretch"
            style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}
          >
            {/* Solar Panel */}
            <motion.div
              whileHover={{ scale: 1.04, boxShadow: '0 8px 32px 0 rgba(253,224,71,0.18)' }}
              className="w-full h-full bg-white/20 backdrop-blur-2xl rounded-3xl shadow-2xl p-10 flex flex-col border border-white/20 relative overflow-hidden"
            >
              <div className="flex items-center gap-2 mb-2 text-lg font-bold text-yellow-300"><FiSun /> Zonnepanelen</div>
              <div className="text-base text-primary-100 mb-1">Status: <span className="text-green-400 font-bold">Actief</span></div>
              <div className="text-base text-primary-100 mb-1">Opbrengst vandaag: <span className="font-bold text-yellow-200">18.2 kWh</span></div>
              <div className="text-base text-primary-100">Efficiency: <span className="font-bold text-primary-400">94%</span></div>
              <div className="absolute right-6 top-6 w-10 h-10 bg-yellow-300/10 rounded-full blur-2xl"></div>
            </motion.div>
            {/* Battery Storage */}
            <motion.div
              whileHover={{ scale: 1.04, boxShadow: '0 8px 32px 0 rgba(34,197,94,0.18)' }}
              className="w-full h-full bg-white/20 backdrop-blur-2xl rounded-3xl shadow-2xl p-10 flex flex-col border border-white/20 relative overflow-hidden"
            >
              <div className="flex items-center gap-2 mb-2 text-lg font-bold text-green-300"><FiBattery /> Batterij Opslag</div>
              <div className="text-base text-primary-100 mb-1">76% geladen</div>
              <div className="text-base text-primary-100 mb-1">7.6 / 10 kWh</div>
              <div className="text-base text-primary-100">Geschatte tijd tot vol: <span className="font-bold text-green-200">2u 51m</span></div>
              <div className="absolute left-6 bottom-6 w-10 h-10 bg-green-400/10 rounded-full blur-2xl"></div>
            </motion.div>
            {/* CO2 Savings */}
            <motion.div
              whileHover={{ scale: 1.04, boxShadow: '0 8px 32px 0 rgba(56,189,248,0.18)' }}
              className="w-full h-full bg-white/20 backdrop-blur-2xl rounded-3xl shadow-2xl p-10 flex flex-col items-center justify-center border border-white/20 relative overflow-hidden"
            >
              <div className="font-bold text-lg text-primary-100 mb-2">CO2 Besparing</div>
              <div className="w-24 h-24 rounded-full bg-primary-50 flex items-center justify-center mb-2 text-primary-400 text-3xl font-bold shadow-inner">Donut Chart</div>
              <div className="text-3xl font-extrabold text-primary-400 mb-1">2.4 kg</div>
              <div className="text-primary-200 text-base">CO2 bespaard vandaag</div>
              <div className="absolute right-6 top-6 w-10 h-10 bg-primary-400/10 rounded-full blur-2xl"></div>
            </motion.div>
          </motion.div>
          {/* Recent Alerts */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, type: 'spring', delay: 0.3 }}
            className="w-full"
          >
            <div className="bg-white/20 backdrop-blur-2xl rounded-3xl shadow-2xl p-10 border border-white/20">
              <div className="font-bold text-xl text-yellow-200 mb-6 flex items-center gap-2"><FiAlertTriangle className="text-yellow-400" />Recente Alerts</div>
              <div className="space-y-4">
                {alerts.map((a, i) => (
                  <motion.div
                    key={i}
                    whileHover={{ scale: 1.02 }}
                    className="flex items-center gap-4 p-4 rounded-xl bg-white/10 hover:bg-primary-700/20 transition border border-white/10"
                  >
                    {a.icon}
                    <div>
                      <div className="font-bold text-primary-100 text-lg">{a.title}</div>
                      <div className="text-xs text-primary-200">{a.desc}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
              <div className="mt-6 text-right">
                <button className="text-primary-300 hover:underline text-base font-semibold">Alle alerts bekijken</button>
              </div>
            </div>
          </motion.div>
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