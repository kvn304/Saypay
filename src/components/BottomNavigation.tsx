import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Mic, BarChart3, Settings } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';

export const BottomNavigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { colorTheme } = useTheme();
  const { t } = useLanguage();

  const navItems = [
    { icon: Home, label: t('home'), path: '/' },
    { icon: Mic, label: t('record'), path: '/record' },
    { icon: BarChart3, label: t('reports'), path: '/reports' },
    { icon: Settings, label: t('settings'), path: '/settings' },
  ];

  return (
    <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-6 py-2">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          
          return (
            <motion.button
              key={item.path}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center space-y-1 py-2 px-3 rounded-xl transition-colors ${
                isActive 
                  ? `${
                    colorTheme === 'purple' ? 'text-purple-600 dark:text-purple-400' :
                    colorTheme === 'blue' ? 'text-blue-600 dark:text-blue-400' :
                    colorTheme === 'green' ? 'text-green-600 dark:text-green-400' :
                    colorTheme === 'pink' ? 'text-pink-600 dark:text-pink-400' :
                    'text-orange-600 dark:text-orange-400'
                  }` 
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <div className={`p-2 rounded-full transition-colors ${
                isActive 
                  ? `${
                    colorTheme === 'purple' ? 'bg-purple-100 dark:bg-purple-900/30' :
                    colorTheme === 'blue' ? 'bg-blue-100 dark:bg-blue-900/30' :
                    colorTheme === 'green' ? 'bg-green-100 dark:bg-green-900/30' :
                    colorTheme === 'pink' ? 'bg-pink-100 dark:bg-pink-900/30' :
                    'bg-orange-100 dark:bg-orange-900/30'
                  }` 
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}>
                <item.icon className="w-5 h-5" />
              </div>
              <span className="text-xs font-medium">{item.label}</span>
              
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className={`absolute -top-0.5 left-1/2 transform -translate-x-1/2 w-8 h-1 rounded-full ${
                    colorTheme === 'purple' ? 'bg-purple-500' :
                    colorTheme === 'blue' ? 'bg-blue-500' :
                    colorTheme === 'green' ? 'bg-green-500' :
                    colorTheme === 'pink' ? 'bg-pink-500' :
                    'bg-orange-500'
                  }`}
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};