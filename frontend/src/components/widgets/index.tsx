import LiveUsageWidget from './LiveUsageWidget';
import HistoryWidget from './HistoryWidget';
import BatteryWidget from './BatteryWidget';
import TemperatureWidget from './TemperatureWidget';
import HumidityHistoryWidget from './HumidityHistoryWidget';
import PowerHistoryChartWidget from './PowerHistoryChartWidget';
import AIPredictionWidget from './AIInsightsWidget';

export const widgetRegistry = [
  {
    id: 'live-usage',
    name: 'Live Energieverbruik',
    component: LiveUsageWidget,
  },
  {
    id: 'history',
    name: 'Historiek',
    component: HistoryWidget,
  },
  {
    id: 'battery',
    name: 'Batterij Niveau',
    component: BatteryWidget,
  },
  {
    id: 'temperature',
    name: 'Temperatuur',
    component: TemperatureWidget,
  },
  {
    id: 'humidity-history',
    name: 'Luchtvochtigheid Historiek',
    component: HumidityHistoryWidget,
  },
  {
    id: 'power-history-chart',
    name: 'Energieverbruik Grafiek',
    component: PowerHistoryChartWidget,
  },
  {
    id: 'ai-prediction',
    name: 'AI Voorspelling',
    component: AIPredictionWidget,
  },
]; 