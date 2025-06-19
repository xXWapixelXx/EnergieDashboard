import React, { useEffect, useState } from 'react';
import { FiDroplet } from 'react-icons/fi';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const HumidityHistoryWidget = () => {
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
        setData(json.slice(0, 7).reverse()); // oldest to newest
        setError(null);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const max = Math.max(...data.map(d => parseFloat(d.avg_humidity || 0)), 100);

  return (
    <div className="w-full h-full bg-white/20 backdrop-blur-2xl rounded-3xl shadow-2xl p-6 flex flex-col min-h-[180px] border border-white/20 relative overflow-hidden">
      <div className="font-bold text-xl text-primary-100 mb-2 flex items-center gap-2">
        <FiDroplet className="text-blue-300" /> Gemiddelde Luchtvochtigheid
      </div>
      {loading && <div className="text-primary-200">Laden...</div>}
      {error && <div className="text-red-400">Fout: {error}</div>}
      {data && data.length > 0 && (
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="flex items-end gap-2 h-24 w-full justify-center">
            {data.map((item, idx) => {
              const val = parseFloat(item.avg_humidity || 0);
              return (
                <div key={idx} className="flex flex-col items-center">
                  <span className="text-xs text-primary-200 mb-1">{val.toFixed(0)}%</span>
                  <div className="w-6 rounded bg-blue-400" style={{ height: `${(val / max) * 80 + 10}px` }}></div>
                  <span className="text-[10px] text-primary-300 mt-1">{item.date.slice(5)}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default HumidityHistoryWidget; 