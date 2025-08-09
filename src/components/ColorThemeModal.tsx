import React from 'react';
import { motion } from 'framer-motion';
import { X, Check } from 'lucide-react';
import { ColorTheme, useTheme, colorThemes } from '../contexts/ThemeContext';

interface ColorThemeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const themeOptions: { name: string; value: ColorTheme; color: string }[] = [
  { name: 'Purple', value: 'purple', color: 'bg-purple-500' },
  { name: 'Blue', value: 'blue', color: 'bg-blue-500' },
  { name: 'Green', value: 'green', color: 'bg-green-500' },
  { name: 'Pink', value: 'pink', color: 'bg-pink-500' },
  { name: 'Orange', value: 'orange', color: 'bg-orange-500' },
];

export const ColorThemeModal: React.FC<ColorThemeModalProps> = ({ isOpen, onClose }) => {
  const { colorTheme, setColorTheme } = useTheme();

  const handleThemeSelect = (theme: ColorTheme) => {
    setColorTheme(theme);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white dark:bg-gray-700 rounded-2xl p-6 max-w-sm w-full"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
            Choose Theme Color
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {themeOptions.map((option) => (
            <motion.button
              key={option.value}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleThemeSelect(option.value)}
              className={`relative p-4 rounded-xl border-2 transition-colors ${
                colorTheme === option.value
                  ? 'border-gray-400 dark:border-gray-500 bg-gray-50 dark:bg-gray-600'
                  : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
              }`}
            >
              <div className="flex flex-col items-center space-y-2">
                <div className={`w-8 h-8 rounded-full ${option.color}`} />
                <span className="text-sm font-medium text-gray-800 dark:text-white">
                  {option.name}
                </span>
              </div>
              
              {colorTheme === option.value && (
                <div className="absolute top-2 right-2">
                  <Check className="w-4 h-4 text-green-500" />
                </div>
              )}
            </motion.button>
          ))}
        </div>

        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-600 rounded-xl">
          <p className="text-sm text-gray-600 dark:text-gray-300 text-center">
            Theme color will be applied to buttons, highlights, and accent elements throughout the app.
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
};