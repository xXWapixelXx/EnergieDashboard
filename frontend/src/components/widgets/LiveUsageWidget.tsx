import React, { useEffect, useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const LiveUsageWidget = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`${API_URL}/api/measurements/latest`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch');
        return res.json();
      })
      .then((json) => {
        if (Array.isArray(json) && json.length > 0) {
          setData(json[0]);
        } else {
          setData(null);
        }
        setError(null);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="w-full h-full bg-white/20 backdrop-blur-2xl rounded-3xl shadow-2xl p-6 flex flex-col min-h-[180px] border border-white/20 relative overflow-hidden">
      <div className="font-bold text-xl text-primary-100 mb-2 flex items-center gap-2">
        ⚡ Live Energieverbruik
      </div>
      {loading && <div className="text-primary-200">Laden...</div>}
      {error && <div className="text-red-400">Fout: {error}</div>}
      {data && (
        <div className="flex-1 flex flex-col items-center justify-center text-primary-200 text-lg">
          <div className="text-4xl font-extrabold text-primary-400 mb-1">{data.power_consumption} kWh</div>
          <div className="text-xs text-primary-300">Gemeten op: {data.timestamp}</div>
        </div>
      )}
    </div>
  );
};

export default LiveUsageWidget; 