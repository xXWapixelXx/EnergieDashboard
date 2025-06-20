import React, { useEffect, useState } from 'react';
import { FiBarChart2, FiDownload, FiFilter, FiChevronDown, FiCalendar, FiPieChart, FiTrendingUp, FiBarChart, FiBattery, FiSun, FiCloud, FiHome, FiSettings, FiAlertTriangle, FiUser, FiLogOut } from 'react-icons/fi';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar, PieChart, Pie, Cell, Legend } from 'recharts';
import { useNavigate, useLocation } from 'react-router-dom';
import authService from '../services/auth';
import { motion } from 'framer-motion';
import Layout from '../components/Layout';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const dataTypes = [
  { value: 'power', label: 'Energieverbruik' },
  { value: 'solar', label: 'Zonnepaneel opbrengst' },
  { value: 'battery', label: 'Batterij niveau' },
];

type PeriodType = 'today' | 'yesterday' | 14;
const periods: { value: PeriodType; label: string }[] = [
  { value: 'today', label: 'Vandaag' },
  { value: 'yesterday', label: 'Gisteren' },
  { value: 14, label: 'Laatste 14 dagen' },
];

const chartTabs = [
  { value: 'line', label: 'Lijn', icon: <FiTrendingUp /> },
  { value: 'bar', label: 'Staaf', icon: <FiBarChart /> },
  { value: 'donut', label: 'Donut', icon: <FiPieChart /> },
];

const COLORS = ['#38bdf8', '#a21caf', '#fbbf24'];

const navItems = [
  { icon: <FiHome />, label: 'Dashboard', path: '/dashboard' },
  { icon: <FiBarChart2 />, label: 'Historiek', path: '/historiek' },
  { icon: <FiSettings />, label: 'Instellingen', path: '/instellingen' },
  { icon: <FiAlertTriangle />, label: 'Alerts', path: '/alerts', hasAlert: true },
];

const dataTypeConfig = {
  power: {
    dataKey: 'avg_power_consumption',
    label: 'Energieverbruik',
    unit: 'kWh',
    statLabels: {
      total: 'Totaal verbruik',
      avg: 'Gemiddeld per dag',
      peak: 'Piek verbruik',
      co2: 'CO₂ bespaard',
    },
    getStats: (json: any[]) => {
      const total = json.reduce((a, b) => a + (b.avg_power_consumption || 0), 0);
      const peak = json.length > 0 ? Math.max(...json.map(b => b.avg_power_consumption || 0)) : 0;
      const avg = json.length > 0 ? total / json.length : 0;
      const co2 = total * 0.115;
      return {
        total: Number.isFinite(total) ? total.toFixed(1) : '0.0',
        avg: Number.isFinite(avg) ? avg.toFixed(1) : '0.0',
        peak: Number.isFinite(peak) ? peak.toFixed(1) : '0.0',
        co2: Number.isFinite(co2) ? co2.toFixed(1) : '0.0',
      };
    },
    exportHeader: 'Datum,Gemiddeld verbruik (kWh)',
    exportRow: (d: any) => `${d.date},${d.avg_power_consumption}`,
  },
  battery: {
    dataKey: 'avg_battery_level',
    label: 'Batterij niveau',
    unit: '%',
    statLabels: {
      total: 'Gemiddeld batterij niveau',
      avg: 'Gemiddeld per dag',
      peak: 'Piek niveau',
      co2: '',
    },
    getStats: (json: any[]) => {
      const total = json.reduce((a, b) => a + (b.avg_battery_level || 0), 0);
      const peak = json.length > 0 ? Math.max(...json.map(b => b.avg_battery_level || 0)) : 0;
      const avg = json.length > 0 ? total / json.length : 0;
      return {
        total: Number.isFinite(avg) ? avg.toFixed(1) : '0.0', // For battery, show average as 'total'
        avg: Number.isFinite(avg) ? avg.toFixed(1) : '0.0',
        peak: Number.isFinite(peak) ? peak.toFixed(1) : '0.0',
        co2: '',
      };
    },
    exportHeader: 'Datum,Gemiddeld batterij niveau (%)',
    exportRow: (d: any) => `${d.date},${d.avg_battery_level}`,
  },
  solar: {
    dataKey: 'solar_yield',
    label: 'Zonnepaneel opbrengst',
    unit: 'kWh (geschat)',
    statLabels: {
      total: 'Totale opbrengst',
      avg: 'Gemiddeld per dag',
      peak: 'Piek opbrengst',
      co2: '',
    },
    getStats: (json: any[]) => {
      // Estimate daily kWh: voltage * current * 24 / 1000
      const yields = json.map(b => ((b.avg_solar_voltage || 0) * (b.avg_solar_current || 0) * 24 / 1000));
      const total = yields.reduce((a, b) => a + b, 0);
      const peak = yields.length > 0 ? Math.max(...yields) : 0;
      const avg = yields.length > 0 ? total / yields.length : 0;
      return {
        total: Number.isFinite(total) ? total.toFixed(2) : '0.00',
        avg: Number.isFinite(avg) ? avg.toFixed(2) : '0.00',
        peak: Number.isFinite(peak) ? peak.toFixed(2) : '0.00',
        co2: '',
      };
    },
    exportHeader: 'Datum,Geschatte opbrengst (kWh)',
    exportRow: (d: any) => {
      const yieldKwh = ((d.avg_solar_voltage || 0) * (d.avg_solar_current || 0) * 24 / 1000).toFixed(2);
      return `${d.date},${yieldKwh}`;
    },
  },
};

const Historiek = () => {
  const [period, setPeriod] = useState<PeriodType>(periods[0].value);
  const [dataType, setDataType] = useState(dataTypes[0].value);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [chartTab, setChartTab] = useState('line');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<any>({});
  const user = authService.getUser();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, [period, dataType, fromDate, toDate]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      let url = `${API_URL}/api/measurements/daily`;
      if (period === 'today') {
        url += '?days=1';
      } else if (period === 'yesterday') {
        url += '?days=2';
      } else {
        url += `?days=${period}`;
      }
      const res = await fetch(url);
      if (!res.ok) throw new Error('Fout bij ophalen data');
      const json = await res.json();
      // Convert numeric fields from string to number
      const numericFields = [
        'avg_solar_voltage', 'avg_solar_current', 'avg_hydrogen_production',
        'avg_power_consumption', 'avg_hydrogen_consumption', 'avg_outside_temperature',
        'avg_inside_temperature', 'avg_air_pressure', 'avg_humidity', 'avg_battery_level',
        'avg_co2_level', 'avg_hydrogen_storage_house', 'avg_hydrogen_storage_car'
      ];
      let dataWithNumbers = json.map((row: any) => {
        const newRow = { ...row };
        numericFields.forEach(field => {
          if (newRow[field] !== undefined) newRow[field] = Number(newRow[field]);
        });
        return newRow;
      });
      // If 'yesterday', only keep the second-to-last day
      if (period === 'yesterday' && dataWithNumbers.length > 1) {
        dataWithNumbers = [dataWithNumbers[1]];
      }
      // If 'today', only keep the most recent day
      if (period === 'today' && dataWithNumbers.length > 0) {
        dataWithNumbers = [dataWithNumbers[0]];
      }
      setData(dataWithNumbers);
      setStats(dataTypeConfig[dataType as keyof typeof dataTypeConfig].getStats(dataWithNumbers));
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    // Export as CSV
    const config = dataTypeConfig[dataType as keyof typeof dataTypeConfig];
    const csv = [
      config.exportHeader,
      ...data.map(config.exportRow),
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `historiek_${dataType}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  return (
    <Layout>
      <div className="px-2 sm:px-4 md:px-8 w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-white/90">Historiek</h1>
          <button onClick={handleExport} className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white/30 backdrop-blur-2xl border border-white/30 shadow-2xl text-primary-900 hover:bg-primary-600/80 hover:text-white transition-all text-lg font-semibold">
            <FiDownload className="text-xl" /> Export Data
          </button>
        </div>
        {/* Filters */}
        <div className="mb-8 p-6 bg-white/20 rounded-2xl shadow-lg flex flex-wrap gap-6 items-end border border-white/20 max-w-4xl backdrop-blur-2xl">
          <div className="flex flex-col gap-2 min-w-[180px]">
            <label className="text-primary-100 font-semibold">Periode</label>
            <select className="glass-input px-4 py-2 rounded-xl bg-white/60 border border-primary-200 focus:ring-2 focus:ring-primary-400 transition" value={period} onChange={e => setPeriod(e.target.value as PeriodType)}>
              {periods.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-2 min-w-[180px]">
            <label className="text-primary-100 font-semibold">Van datum</label>
            <input
              type="date"
              className="glass-input px-4 py-2 rounded-xl bg-white/60 border border-primary-200 focus:ring-2 focus:ring-primary-400 transition"
              value={fromDate}
              onChange={e => setFromDate(e.target.value)}
              placeholder="dd-mm-jjjj"
            />
          </div>
          <div className="flex flex-col gap-2 min-w-[180px]">
            <label className="text-primary-100 font-semibold">Tot datum</label>
            <input
              type="date"
              className="glass-input px-4 py-2 rounded-xl bg-white/60 border border-primary-200 focus:ring-2 focus:ring-primary-400 transition"
              value={toDate}
              onChange={e => setToDate(e.target.value)}
              placeholder="dd-mm-jjjj"
            />
          </div>
          <div className="flex flex-col gap-2 min-w-[200px]">
            <label className="text-primary-100 font-semibold">Data type</label>
            <select className="glass-input px-4 py-2 rounded-xl bg-white/60 border border-primary-200 focus:ring-2 focus:ring-primary-400 transition" value={dataType} onChange={e => setDataType(e.target.value)}>
              {dataTypes.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
            </select>
          </div>
        </div>
        {/* Chart Card */}
        <div className="bg-white/20 rounded-2xl shadow-2xl p-6 border border-white/20 mb-8">
          <div className="flex items-center gap-4 mb-4">
            {chartTabs.map(tab => (
              <button key={tab.value} onClick={() => setChartTab(tab.value)} className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all ${chartTab === tab.value ? 'bg-primary-600/80 text-white shadow' : 'bg-white/10 text-primary-100 hover:bg-primary-700/20'}`}>{tab.icon} {tab.label}</button>
            ))}
          </div>
          {loading && <div className="text-primary-200">Laden...</div>}
          {error && <div className="text-red-400">Fout: {error}</div>}
          {!loading && !error && data && data.length > 0 && (
            <div className="w-full h-80">
              {chartTab === 'line' && (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.map(d => ({ ...d, solar_yield: (d.avg_solar_voltage || 0) * (d.avg_solar_current || 0) * 24 / 1000 }))} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#8882" />
                    <XAxis dataKey="date" tick={{ fill: '#a5b4fc', fontSize: 12 }} />
                    <YAxis tick={{ fill: '#a5b4fc', fontSize: 12 }} domain={[0, 'dataMax + 0.2']} unit={dataTypeConfig[dataType as keyof typeof dataTypeConfig].unit} />
                    <Tooltip contentStyle={{ background: '#222', borderRadius: 8, color: '#fff' }} formatter={(value: any) => `${value} ${dataTypeConfig[dataType as keyof typeof dataTypeConfig].unit}`} />
                    <Line type="monotone" dataKey={dataTypeConfig[dataType as keyof typeof dataTypeConfig].dataKey} stroke="#38bdf8" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
              {chartTab === 'bar' && (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.map(d => ({ ...d, solar_yield: (d.avg_solar_voltage || 0) * (d.avg_solar_current || 0) * 24 / 1000 }))} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#8882" />
                    <XAxis dataKey="date" tick={{ fill: '#a5b4fc', fontSize: 12 }} />
                    <YAxis tick={{ fill: '#a5b4fc', fontSize: 12 }} unit={dataTypeConfig[dataType as keyof typeof dataTypeConfig].unit} />
                    <Tooltip contentStyle={{ background: '#222', borderRadius: 8, color: '#fff' }} formatter={(value: any) => `${value} ${dataTypeConfig[dataType as keyof typeof dataTypeConfig].unit}`} />
                    <Bar dataKey={dataTypeConfig[dataType as keyof typeof dataTypeConfig].dataKey} fill="#38bdf8" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
              {chartTab === 'donut' && (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={data.map(d => ({ ...d, solar_yield: (d.avg_solar_voltage || 0) * (d.avg_solar_current || 0) * 24 / 1000 }))} dataKey={dataTypeConfig[dataType as keyof typeof dataTypeConfig].dataKey} nameKey="date" cx="50%" cy="50%" innerRadius={60} outerRadius={100} fill="#38bdf8" label>
                      {data.map((entry, idx) => (
                        <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                      ))}
                    </Pie>
                    <Legend />
                    <Tooltip contentStyle={{ background: '#222', borderRadius: 8, color: '#fff' }} formatter={(value: any) => `${value} ${dataTypeConfig[dataType as keyof typeof dataTypeConfig].unit}`} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          )}
          {!loading && !error && (!data || data.length === 0) && <div className="text-primary-200">Geen data beschikbaar voor deze periode.</div>}
        </div>
        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <div className="glass-card stat-card">
            <div className="stat-value text-3xl font-bold text-primary-100">{stats.total} {dataTypeConfig[dataType as keyof typeof dataTypeConfig].unit}</div>
            <div className="stat-label text-primary-200">{dataTypeConfig[dataType as keyof typeof dataTypeConfig].statLabels.total}</div>
          </div>
          <div className="glass-card stat-card">
            <div className="stat-value text-3xl font-bold text-primary-100">{stats.avg} {dataTypeConfig[dataType as keyof typeof dataTypeConfig].unit}</div>
            <div className="stat-label text-primary-200">{dataTypeConfig[dataType as keyof typeof dataTypeConfig].statLabels.avg}</div>
          </div>
          <div className="glass-card stat-card">
            <div className="stat-value text-3xl font-bold text-primary-100">{stats.peak} {dataTypeConfig[dataType as keyof typeof dataTypeConfig].unit}</div>
            <div className="stat-label text-primary-200">{dataTypeConfig[dataType as keyof typeof dataTypeConfig].statLabels.peak}</div>
          </div>
          {dataType === 'power' && (
            <div className="glass-card stat-card">
              <div className="stat-value text-3xl font-bold text-primary-100">{stats.co2} kg</div>
              <div className="stat-label text-primary-200">{dataTypeConfig[dataType as keyof typeof dataTypeConfig].statLabels.co2}</div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Historiek; 