import React from 'react';
import * as FiIcons from 'react-icons/fi';
import { motion } from 'framer-motion';
import { FiCpu } from 'react-icons/fi';

interface DeviceWidgetProps {
  device: {
    id: string;
    label: string;
    icon: string;
    usage: number | null;
    unit: string;
  };
}

const DeviceWidget: React.FC<DeviceWidgetProps> = ({ device }) => {
  const Icon = (FiIcons as any)[device.icon] || FiCpu;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="w-full h-full bg-gradient-to-br from-sky-700/40 to-purple-700/30 rounded-3xl shadow-2xl p-6 flex flex-col min-h-[180px] border border-white/20 relative overflow-hidden hover:scale-[1.03] hover:shadow-2xl transition-transform"
    >
      <div className="font-bold text-xl text-primary-100 mb-2 flex items-center gap-2">
        <Icon className="text-sky-300" /> {device.label}
      </div>
      <div className="flex-1 flex flex-col items-center justify-center w-full">
        <div className="text-4xl font-extrabold text-sky-400 mb-2">
          {device.usage !== null ? device.usage.toLocaleString(undefined, { maximumFractionDigits: 2 }) : 'n.v.t.'}
          {device.usage !== null && <span className="text-lg font-bold text-primary-200 ml-1">{device.unit}</span>}
        </div>
        <div className="text-primary-200 text-base">Huidig gebruik</div>
      </div>
    </motion.div>
  );
};

export default DeviceWidget; 