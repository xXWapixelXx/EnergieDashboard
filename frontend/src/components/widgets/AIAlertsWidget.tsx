import React, { useEffect, useState } from 'react';
import { FiAlertTriangle } from 'react-icons/fi';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const MISTRAL_API_KEY = import.meta.env.VITE_MISTRAL_API_KEY;

const AIAlertsWidget = () => {
  const [alerts, setAlerts] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAlerts = async () => {
      setLoading(true);
      setError(null);
      try {
        // 1. Fetch latest measurement
        const res = await fetch(`${API_URL}/api/measurements/latest`);
        if (!res.ok) throw new Error('Failed to fetch data');
        const data = await res.json();
        const latest = Array.isArray(data) && data.length > 0 ? data[0] : null;
        if (!latest) throw new Error('No data available');

        // 2. Prepare prompt for AI
        const prompt = `Bekijk deze energiegegevens en geef maximaal 3 duidelijke, volledige waarschuwingen of tips voor de gebruiker. Antwoord volledig in het Nederlands. Gebruik voor elke alert een aparte regel en maak elke alert een volledige, begrijpelijke zin. Geef het antwoord als een genummerde lijst, bijvoorbeeld:\n1. Uw verbruik is hoger dan normaal.\n2. De batterij is bijna leeg.\n3. Zet apparaten uit om energie te besparen.\nData: ${JSON.stringify(latest)}`;

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
            max_tokens: 120,
            temperature: 0.5,
          }),
        });
        if (!aiRes.ok) throw new Error('AI API error');
        const aiJson = await aiRes.json();
        const aiMsg = aiJson.choices?.[0]?.message?.content || '';
        // Parse numbered list from AI response
        const lines = aiMsg.split(/\n|\r/).map(l => l.replace(/^\d+\.?\s*/, '').trim()).filter(Boolean);
        setAlerts(lines.slice(0, 3));
      } catch (err: any) {
        setError(err.message || 'Fout bij ophalen AI-alerts');
      } finally {
        setLoading(false);
      }
    };
    fetchAlerts();
  }, []);

  return (
    <div className="w-full h-full bg-white/20 backdrop-blur-2xl rounded-3xl shadow-2xl p-6 flex flex-col min-h-[180px] border border-white/20 relative overflow-hidden">
      <div className="font-bold text-xl text-primary-100 mb-2 flex items-center gap-2">
        <FiAlertTriangle className="text-yellow-300" /> AI Alerts
      </div>
      {loading && <div className="text-primary-200">AI analyseert je data...</div>}
      {error && <div className="text-red-400">Fout: {error}</div>}
      {!loading && !error && alerts.length > 0 && (
        <div className="flex-1 flex flex-col gap-3">
          {alerts.map((alert, idx) => (
            <div key={idx} className="flex items-center gap-3 bg-white/10 rounded-xl px-4 py-3 text-primary-100">
              <FiAlertTriangle className="text-yellow-300 text-xl" />
              <span className="flex-1 text-base">{alert}</span>
            </div>
          ))}
        </div>
      )}
      {!loading && !error && alerts.length === 0 && (
        <div className="text-primary-200">Geen AI-alerts op basis van je data.</div>
      )}
    </div>
  );
};

export default AIAlertsWidget; 