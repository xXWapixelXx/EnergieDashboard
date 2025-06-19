import React, { useEffect, useState } from 'react';
import { FiSun, FiCloud } from 'react-icons/fi';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const TemperatureWidget = () => {
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
        <FiSun className="text-yellow-300" /> Temperatuur
      </div>
      {loading && <div className="text-primary-200">Laden...</div>}
      {error && <div className="text-red-400">Fout: {error}</div>}
      {data && (
        <div className="flex-1 flex flex-col items-center justify-center gap-2">
          <div className="flex items-center gap-2 text-2xl font-bold text-orange-400">
            <FiSun /> Binnen: {parseFloat(data.inside_temperature).toFixed(1)}°C
          </div>
          <div className="flex items-center gap-2 text-2xl font-bold text-blue-400">
            <FiCloud /> Buiten: {parseFloat(data.outside_temperature).toFixed(1)}°C
          </div>
        </div>
      )}
    </div>
  );
};

export default TemperatureWidget; 