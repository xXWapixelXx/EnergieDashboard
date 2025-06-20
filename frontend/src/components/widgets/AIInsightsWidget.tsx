import React, { useEffect, useState } from 'react';
import { FiCpu } from 'react-icons/fi';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const MISTRAL_API_KEY = import.meta.env.VITE_MISTRAL_API_KEY;

const AIPredictionWidget = () => {
  const [prediction, setPrediction] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPrediction = async () => {
      setLoading(true);
      setError(null);
      try {
        // 1. Fetch recent daily data
        const res = await fetch(`${API_URL}/api/measurements/daily`);
        if (!res.ok) throw new Error('Failed to fetch data');
        const data = await res.json();
        // Convert numeric fields from string to number
        const numericFields = [
          'avg_solar_voltage', 'avg_solar_current', 'avg_hydrogen_production',
          'avg_power_consumption', 'avg_hydrogen_consumption', 'avg_outside_temperature',
          'avg_inside_temperature', 'avg_air_pressure', 'avg_humidity', 'avg_battery_level',
          'avg_co2_level', 'avg_hydrogen_storage_house', 'avg_hydrogen_storage_car'
        ];
        const dataWithNumbers = Array.isArray(data) ? data.map((row: any) => {
          const newRow = { ...row };
          numericFields.forEach(field => {
            if (newRow[field] !== undefined) newRow[field] = Number(newRow[field]);
          });
          return newRow;
        }) : [];
        const last7 = dataWithNumbers.slice(0, 7);
        if (!last7.length) throw new Error('No data available');
        // Only send avg_power_consumption to the AI for clarity
        const powerData = last7.map(d => d.avg_power_consumption);
        const prompt = `Je bent een slimme energie-assistent. Voorspel het verwachte energieverbruik voor morgen in kWh, gebaseerd op deze dagelijkse verbruiksdata: ${JSON.stringify(powerData)}. Geef alleen een getal terug, bijvoorbeeld: 24.8`;

        // 3. Call Mistral API
        const aiRes = await fetch('https://api.mistral.ai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${MISTRAL_API_KEY}`,
          },
          body: JSON.stringify({
            model: 'mistral-tiny',
            messages: [
              { role: 'system', content: 'Je bent een slimme energie-assistent.' },
              { role: 'user', content: prompt },
            ],
            max_tokens: 16,
            temperature: 0.2,
          }),
        });
        if (!aiRes.ok) throw new Error('AI API error');
        const aiJson = await aiRes.json();
        let aiMsg = aiJson.choices?.[0]?.message?.content || '';
        // Extract number from AI response
        const match = aiMsg.match(/([0-9]+([.,][0-9]+)?)/);
        aiMsg = match ? match[1].replace(',', '.') : '—';
        setPrediction(aiMsg);
      } catch (err: any) {
        setError(err.message || 'Fout bij ophalen AI-voorspelling');
      } finally {
        setLoading(false);
      }
    };
    fetchPrediction();
  }, []);

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