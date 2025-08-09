import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export const DatabaseMonitoringScreen: React.FC = () => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-12 pb-6 bg-white dark:bg-gray-800 shadow-sm">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/settings')}
          className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center"
        >
          <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
        </motion.button>
        
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">
          Database Monitoring
        </h1>
        
        <div className="w-10 h-10" />
      </div>

      <div className="flex-1 px-6 pb-24 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 dark:text-gray-400">
            Database monitoring has been removed for simplicity.
          </p>
        </div>
      </div>
    </motion.div>
  );
};