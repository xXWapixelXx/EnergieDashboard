import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { FiTrendingUp } from 'react-icons/fi';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const PowerHistoryChartWidget = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`${API_URL}/api/measurements/daily`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch');
        return res.json();
      })
      .then((json) => {
        setData(json.slice(0, 14).reverse()); // last 14 days, oldest to newest
        setError(null);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="w-full h-full bg-white/20 backdrop-blur-2xl rounded-3xl shadow-2xl p-6 flex flex-col min-h-[240px] border border-white/20 relative overflow-hidden">
      <div className="font-bold text-xl text-primary-100 mb-2 flex items-center gap-2">
        <FiTrendingUp className="text-blue-300" /> Energieverbruik (laatste 14 dagen)
      </div>
      {loading && <div className="text-primary-200">Laden...</div>}
      {error && <div className="text-red-400">Fout: {error}</div>}
      {data && data.length > 0 && (
        <ResponsiveContainer width="100%" height={160}>
          <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#8882" />
            <XAxis dataKey="date" tick={{ fill: '#a5b4fc', fontSize: 12 }} />
            <YAxis tick={{ fill: '#a5b4fc', fontSize: 12 }} domain={[0, 'dataMax + 0.2']} />
            <Tooltip contentStyle={{ background: '#222', borderRadius: 8, color: '#fff' }} />
            <Line type="monotone" dataKey="avg_power_consumption" stroke="#38bdf8" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default PowerHistoryChartWidget; 