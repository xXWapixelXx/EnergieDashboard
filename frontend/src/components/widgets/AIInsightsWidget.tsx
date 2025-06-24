import React, { useEffect, useState } from 'react';
import { FiCpu } from 'react-icons/fi';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const LOCAL_STORAGE_KEY = 'ai_prediction_cache';

const AIPredictionWidget = ({ dailyData }: { dailyData?: any[] }) => {
  const [prediction, setPrediction] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Try to use cached prediction first
    const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (cached) {
      setPrediction(cached);
      setLoading(false);
    }
    // If dailyData is provided as prop, use it
    if (dailyData && dailyData.length > 0) {
      const predictionValue = dailyData[0]?.prediction;
      if (predictionValue !== undefined) {
        setPrediction(predictionValue);
        localStorage.setItem(LOCAL_STORAGE_KEY, predictionValue);
        setLoading(false);
        return;
      }
    }
    // Otherwise, fetch from API
    setLoading(true);
    setError(null);
    fetch(`${API_URL}/api/measurements/daily`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch');
        return res.json();
      })
      .then((json) => {
        // Use the prediction from the latest day, or fallback to avg_power_consumption
        const predictionValue = json[0]?.prediction ?? json[0]?.avg_power_consumption ?? '—';
        setPrediction(predictionValue);
        localStorage.setItem(LOCAL_STORAGE_KEY, predictionValue);
        setError(null);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [dailyData]);

  return (
    <div className="w-full h-full bg-white/20 backdrop-blur-2xl rounded-3xl shadow-2xl p-6 flex flex-col min-h-[180px] border border-white/20 relative overflow-hidden">
      <div className="font-bold text-xl text-primary-100 mb-2 flex items-center gap-2">
        <FiCpu className="text-blue-300" /> AI Voorspelling
      </div>
      {loading && <div className="text-primary-200">AI voorspelt je verbruik...</div>}
      {error && <div className="text-red-400">Fout: {error}</div>}
      {!loading && !error && (
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <div className="text-4xl font-extrabold text-blue-400 mb-1">{prediction} <span className="text-lg font-bold text-primary-200">kWh</span></div>
          <div className="text-primary-200 text-base">Verwacht verbruik morgen</div>
        </div>
      )}
    </div>
  );
};

export default AIPredictionWidget; 