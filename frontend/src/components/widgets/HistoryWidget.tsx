import React, { useEffect, useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const HistoryWidget = () => {
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
        setData(json);
        setError(null);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="w-full h-full bg-white/20 backdrop-blur-2xl rounded-3xl shadow-2xl p-6 flex flex-col min-h-[180px] border border-white/20 relative overflow-hidden">
      <div className="font-bold text-xl text-primary-100 mb-2 flex items-center gap-2">
        📊 Historiek
      </div>
      {loading && <div className="text-primary-200">Laden...</div>}
      {error && <div className="text-red-400">Fout: {error}</div>}
      {data && data.length > 0 && (
        <ul className="flex-1 overflow-y-auto text-primary-200 text-sm space-y-1">
          {data.slice(0, 7).map((item, idx) => (
            <li key={idx} className="flex justify-between">
              <span>{item.date}</span>
              <span className="font-bold text-primary-400">{item.avg_power_consumption ? Number(item.avg_power_consumption).toFixed(2) : '-'} kWh</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default HistoryWidget; 