import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Mic, Plus, TrendingUp, Wifi, WifiOff } from 'lucide-react';
import { Expense, EXPENSE_CATEGORIES } from '../types/expense';
import { useTheme } from '../contexts/ThemeContext';
import { useUser } from '../contexts/UserContext';
import { useLanguage } from '../contexts/LanguageContext';

interface HomeScreenProps {
  expenses: Expense[];
  isOnline: boolean;
  onStartRecording: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ 
  expenses, 
  isOnline, 
  onStartRecording 
}) => {
  const navigate = useNavigate();
  const { isDark, colorTheme } = useTheme();
  const { user } = useUser();
  const { t } = useLanguage();

  const currentMonth = new Date().toISOString().slice(0, 7);
  const currentMonthExpenses = expenses.filter(expense => 
    expense.date.startsWith(currentMonth)
  );

  const totalAmount = currentMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  
  const categoryTotals = currentMonthExpenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {} as Record<string, number>);

  const sortedCategories = Object.entries(categoryTotals)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 4);

  const recentExpenses = [...expenses]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const getCategoryIcon = (category: string) => {
    const cat = EXPENSE_CATEGORIES.find(c => c.name === category);
    return cat ? cat.icon : '📦';
  };

  const getCategoryColor = (category: string) => {
    const cat = EXPENSE_CATEGORIES.find(c => c.name === category);
    return cat ? cat.color : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
  };

  const handleRecordExpense = () => {
    onStartRecording();
    navigate('/record');
  };

  const currentMonthName = new Date().toLocaleDateString('en-US', { 
    month: 'long', 
    year: 'numeric' 
  });

  // Clean, professional logo
  const logoEmoji = '💰';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900"
    >
      {/* Header */}
      <div className="px-6 pt-12 pb-6 bg-white dark:bg-gray-800 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-xl shadow-lg">
              {logoEmoji}
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                {t('hello')}, {user?.name?.split(' ')[0] || 'User'}!
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('trackExpenses')}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
            {isOnline ? (
                <Wifi className="w-4 h-4 text-emerald-500" />
            ) : (
              <WifiOff className="w-4 h-4 text-red-500" />
            )}
            </div>
          </div>
        </div>

        {/* Monthly Summary Card */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className={`bg-gradient-to-br rounded-2xl p-6 text-white shadow-lg ${
            colorTheme === 'purple' ? 'from-purple-500 to-pink-500' :
            colorTheme === 'blue' ? 'from-blue-500 to-indigo-500' :
            colorTheme === 'green' ? 'from-green-500 to-emerald-500' :
            colorTheme === 'pink' ? 'from-pink-500 to-rose-500' :
            'from-orange-500 to-amber-500'
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5" />
              <span className="font-medium">{currentMonthName}</span>
            </div>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/reports')}
              className="bg-white/20 rounded-full p-1.5 hover:bg-white/30 transition-colors"
            >
              <Plus className="w-3 h-3 rotate-45" />
            </motion.button>
          </div>
          
          <div className="mb-4">
            <p className="text-white/80 text-xs">{t('totalSpent')}</p>
            <p className="text-2xl font-bold">${totalAmount.toFixed(2)}</p>
          </div>

          {sortedCategories.length > 0 && (
            <div className="flex space-x-2 overflow-x-auto pb-1">
              {sortedCategories.map(([category, amount]) => (
                <div key={category} className="flex-shrink-0 bg-white/20 rounded-lg px-2 py-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm">{getCategoryIcon(category)}</span>
                    <div>
                      <p className="text-xs text-white/80 font-medium">{category}</p>
                      <p className="text-xs font-bold">${amount.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Voice Recording Button */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 bg-gray-50 dark:bg-gray-900">
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleRecordExpense}
          className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-green-500 rounded-2xl shadow-lg flex items-center justify-center cursor-pointer transition-all duration-300"
        >
          <Mic className="w-8 h-8 text-white" />
        </motion.div>
        
        <div className="mt-6 text-center">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
            Tap to Record
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Voice your expense
          </p>
        </div>
      </div>

      {/* Recent Expenses */}
      <div className="px-6 pb-24 bg-white dark:bg-gray-800">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            {t('recentExpenses')}
          </h2>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/reports')}
            className={`text-sm font-medium ${
              colorTheme === 'purple' ? 'text-purple-500 dark:text-purple-400' :
              colorTheme === 'blue' ? 'text-blue-500 dark:text-blue-400' :
              colorTheme === 'green' ? 'text-green-500 dark:text-green-400' :
              colorTheme === 'pink' ? 'text-pink-500 dark:text-pink-400' :
              'text-orange-500 dark:text-orange-400'
            }`}
          >
            {t('viewAll')}
          </motion.button>
        </div>

        {recentExpenses.length > 0 ? (
          <div className="space-y-3">
            {recentExpenses.map((expense, index) => (
              <motion.div
                key={expense.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate(`/expense/${expense.id}`)}
                className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-200 dark:bg-gray-600 rounded-xl flex items-center justify-center">
                    <span className="text-lg">{getCategoryIcon(expense.category)}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-gray-900 dark:text-white">
                        ${expense.amount.toFixed(2)}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(expense.category)}`}>
                        {expense.category}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 truncate">
                      {expense.description}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(expense.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 dark:bg-gray-700 rounded-2xl flex items-center justify-center">
              <Plus className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-gray-500 dark:text-gray-400 mb-1">No expenses yet</p>
            <p className="text-sm text-gray-400 dark:text-gray-500">Start recording your first expense!</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};