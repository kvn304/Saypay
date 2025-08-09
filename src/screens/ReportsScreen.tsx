import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, TrendingUp, PieChart as PieChartIcon, BarChart3 } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { Expense, EXPENSE_CATEGORIES } from '../types/expense';

interface ReportsScreenProps {
  expenses: Expense[];
}

export const ReportsScreen: React.FC<ReportsScreenProps> = ({ expenses }) => {
  const navigate = useNavigate();
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [viewType, setViewType] = useState<'pie' | 'bar'>('pie');

  const monthExpenses = expenses.filter(expense => 
    expense.date.startsWith(selectedMonth)
  );

  const totalAmount = monthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  
  const categoryData = EXPENSE_CATEGORIES.map(category => {
    const amount = monthExpenses
      .filter(expense => expense.category === category.name)
      .reduce((sum, expense) => sum + expense.amount, 0);
    
    return {
      name: category.name,
      value: amount,
      icon: category.icon,
      color: category.color,
      percentage: totalAmount > 0 ? (amount / totalAmount) * 100 : 0
    };
  }).filter(item => item.value > 0);

  const COLORS = [
    '#8B5CF6', '#EC4899', '#10B981', '#F59E0B', 
    '#EF4444', '#3B82F6', '#6366F1', '#84CC16'
  ];

  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const monthKey = date.toISOString().slice(0, 7);
    const monthExpenses = expenses.filter(expense => expense.date.startsWith(monthKey));
    const total = monthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    
    return {
      month: date.toLocaleDateString('en-US', { month: 'short' }),
      amount: total
    };
  }).reverse();

  const selectedMonthName = new Date(selectedMonth + '-01').toLocaleDateString('en-US', { 
    month: 'long', 
    year: 'numeric' 
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-12 pb-6">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/')}
          className="w-10 h-10 bg-white dark:bg-gray-700 rounded-full flex items-center justify-center shadow-lg"
        >
          <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
        </motion.button>
        
        <h1 className="text-xl font-bold text-gray-800 dark:text-white">
          Reports & Analytics
        </h1>
        
        <div className="w-10 h-10" />
      </div>

      <div className="flex-1 px-6 pb-24 overflow-y-auto">
        {/* Month Selector */}
        <div className="mb-6">
          <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <Calendar className="w-4 h-4" />
            <span>Select Month</span>
          </label>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800 dark:text-white"
          />
        </div>

        {/* Summary Card */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-r from-purple-500 to-pink-500 dark:from-purple-600 dark:to-pink-600 rounded-2xl p-6 text-white shadow-xl mb-6"
        >
          <div className="flex items-center space-x-2 mb-2">
            <TrendingUp className="w-6 h-6" />
            <span className="font-semibold">{selectedMonthName}</span>
          </div>
          <p className="text-3xl font-bold mb-2">${totalAmount.toFixed(2)}</p>
          <p className="text-white/80">
            {monthExpenses.length} transaction{monthExpenses.length !== 1 ? 's' : ''}
          </p>
        </motion.div>

        {/* Chart Type Toggle */}
        <div className="flex bg-gray-100 dark:bg-gray-700 rounded-xl p-1 mb-6">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setViewType('pie')}
            className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-lg transition-colors ${
              viewType === 'pie' 
                ? 'bg-white dark:bg-gray-600 text-purple-600 dark:text-purple-400 shadow-sm' 
                : 'text-gray-600 dark:text-gray-300'
            }`}
          >
            <PieChartIcon className="w-4 h-4" />
            <span className="text-sm font-medium">Pie Chart</span>
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setViewType('bar')}
            className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-lg transition-colors ${
              viewType === 'bar' 
                ? 'bg-white dark:bg-gray-600 text-purple-600 dark:text-purple-400 shadow-sm' 
                : 'text-gray-600 dark:text-gray-300'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span className="text-sm font-medium">Bar Chart</span>
          </motion.button>
        </div>

        {/* Charts */}
        {categoryData.length > 0 ? (
          <div className="bg-white dark:bg-gray-700 rounded-2xl p-6 shadow-lg mb-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              Spending by Category
            </h3>
            
            <div className="h-64 mb-6">
              <ResponsiveContainer width="100%" height="100%">
                {viewType === 'pie' ? (
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                ) : (
                  <BarChart data={categoryData}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Bar dataKey="value" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>

            {/* Category Breakdown */}
            <div className="space-y-3">
              {categoryData.map((category, index) => (
                <div key={category.name} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-lg">{category.icon}</span>
                    <span className="font-medium text-gray-800 dark:text-white">
                      {category.name}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-800 dark:text-white">
                      ${category.value.toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {category.percentage.toFixed(1)}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-700 rounded-2xl p-8 shadow-lg mb-6 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-600 rounded-full flex items-center justify-center">
              <PieChartIcon className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 dark:text-gray-400">No expenses for this month</p>
          </div>
        )}

        {/* Monthly Trend */}
        <div className="bg-white dark:bg-gray-700 rounded-2xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
            6-Month Trend
          </h3>
          
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <XAxis dataKey="month" />
                <YAxis />
                <Bar dataKey="amount" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </motion.div>
  );
};