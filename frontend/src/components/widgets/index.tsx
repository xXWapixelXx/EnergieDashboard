import LiveUsageWidget from './LiveUsageWidget';
import HistoryWidget from './HistoryWidget';

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
]; 