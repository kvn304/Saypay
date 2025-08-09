import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  Edit3, 
  Trash2, 
  Check, 
  X,
  Calendar,
  DollarSign,
  Tag,
  FileText
} from 'lucide-react';
import { Expense, EXPENSE_CATEGORIES } from '../types/expense';

interface ExpenseDetailScreenProps {
  expenses: Expense[];
  onEditExpense: (id: string, expense: Partial<Expense>) => void;
  onDeleteExpense: (id: string) => void;
}

export const ExpenseDetailScreen: React.FC<ExpenseDetailScreenProps> = ({
  expenses,
  onEditExpense,
  onDeleteExpense,
}) => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const expense = expenses.find(exp => exp.id === id);

  const [editForm, setEditForm] = useState({
    amount: expense?.amount.toString() || '',
    description: expense?.description || '',
    category: expense?.category || 'Misc',
    date: expense?.date || '',
  });

  if (!expense) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500">Expense not found</p>
      </div>
    );
  }

  const getCategoryIcon = (category: string) => {
    const cat = EXPENSE_CATEGORIES.find(c => c.name === category);
    return cat ? cat.icon : '📦';
  };

  const getCategoryColor = (category: string) => {
    const cat = EXPENSE_CATEGORIES.find(c => c.name === category);
    return cat ? cat.color : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
  };

  const handleSave = () => {
    onEditExpense(expense.id, {
      amount: parseFloat(editForm.amount),
      description: editForm.description,
      category: editForm.category,
      date: editForm.date,
    });
    setIsEditing(false);
  };

  const handleDelete = () => {
    onDeleteExpense(expense.id);
    navigate('/');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900"
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
          Expense Details
        </h1>
        
        <div className="flex space-x-2">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsEditing(!isEditing)}
            className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center shadow-lg"
          >
            <Edit3 className="w-5 h-5 text-white" />
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowDeleteConfirm(true)}
            className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center shadow-lg"
          >
            <Trash2 className="w-5 h-5 text-white" />
          </motion.button>
        </div>
      </div>

      <div className="flex-1 px-6 pb-24">
        {isEditing ? (
          /* Edit Form */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-700 rounded-2xl p-6 shadow-xl"
          >
            <div className="space-y-4">
              {/* Amount */}
              <div>
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <DollarSign className="w-4 h-4" />
                  <span>Amount</span>
                </label>
                <input
                  type="number"
                  value={editForm.amount}
                  onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-600 border border-gray-200 dark:border-gray-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 dark:text-white"
                />
              </div>

              {/* Description */}
              <div>
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <FileText className="w-4 h-4" />
                  <span>Description</span>
                </label>
                <input
                  type="text"
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-600 border border-gray-200 dark:border-gray-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 dark:text-white"
                />
              </div>

              {/* Category */}
              <div>
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Tag className="w-4 h-4" />
                  <span>Category</span>
                </label>
                <select
                  value={editForm.category}
                  onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-600 border border-gray-200 dark:border-gray-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 dark:text-white"
                >
                  {EXPENSE_CATEGORIES.map((cat) => (
                    <option key={cat.name} value={cat.name}>
                      {cat.icon} {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date */}
              <div>
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Calendar className="w-4 h-4" />
                  <span>Date</span>
                </label>
                <input
                  type="date"
                  value={editForm.date}
                  onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-600 border border-gray-200 dark:border-gray-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 dark:text-white"
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsEditing(false)}
                className="flex-1 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 py-3 px-4 rounded-xl font-medium"
              >
                Cancel
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleSave}
                className="flex-1 bg-blue-500 text-white py-3 px-4 rounded-xl font-medium flex items-center justify-center space-x-2"
              >
                <Check className="w-5 h-5" />
                <span>Save</span>
              </motion.button>
            </div>
          </motion.div>
        ) : (
          /* Detail View */
          <div className="space-y-6">
            {/* Main Card */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-white dark:bg-gray-700 rounded-2xl p-8 shadow-xl text-center"
            >
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-full flex items-center justify-center">
                <span className="text-3xl">{getCategoryIcon(expense.category)}</span>
              </div>
              
              <h2 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">
                ${expense.amount.toFixed(2)}
              </h2>
              
              <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${getCategoryColor(expense.category)}`}>
                {expense.category}
              </span>
            </motion.div>

            {/* Details */}
            <div className="bg-white dark:bg-gray-700 rounded-2xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                Details
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <FileText className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Description</p>
                    <p className="text-gray-800 dark:text-white font-medium">
                      {expense.description}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Date</p>
                    <p className="text-gray-800 dark:text-white font-medium">
                      {formatDate(expense.date)}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Tag className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Created</p>
                    <p className="text-gray-800 dark:text-white font-medium">
                      {new Date(expense.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
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
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                <Trash2 className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                Delete Expense?
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                This action cannot be undone. The expense will be permanently removed.
              </p>
            </div>
            
            <div className="flex space-x-3">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 py-3 px-4 rounded-xl font-medium"
              >
                Cancel
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleDelete}
                className="flex-1 bg-red-500 text-white py-3 px-4 rounded-xl font-medium"
              >
                Delete
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
};