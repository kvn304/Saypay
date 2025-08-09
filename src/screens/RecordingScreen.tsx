import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Check, 
  Edit3, 
  Calendar,
  DollarSign,
  Tag,
  FileText,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { extractExpenseData, ExtractedExpenseData, TranscriptionResult } from '../utils/openai';
import { EXPENSE_CATEGORIES } from '../types/expense';
import { VoiceRecorder } from '../components/VoiceRecorder';
import { useOpenAI } from '../hooks/useOpenAI';
import { useLanguage } from '../contexts/LanguageContext';

interface RecordingScreenProps {
  onAddExpense: (expense: any) => Promise<any>;
  onBack: () => void;
}

export const RecordingScreen: React.FC<RecordingScreenProps> = ({ 
  onAddExpense, 
  onBack 
}) => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [transcription, setTranscription] = useState<TranscriptionResult | null>(null);
  const [extractedData, setExtractedData] = useState<ExtractedExpenseData | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [expenseData, setExpenseData] = useState({
    amount: '',
    currency: 'USD',
    description: '',
    category: 'Misc',
    date: new Date().toISOString().split('T')[0],
  });
  const [showEditForm, setShowEditForm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { isConfigured } = useOpenAI();
  const handleTranscription = async (result: TranscriptionResult) => {
    try {
      setError(null);
      setTranscription(result);
      setIsExtracting(true);
      
      const extracted = await extractExpenseData(result.text);
      setExtractedData(extracted);
      
      // Check extraction confidence
      if (extracted.confidence < 0.85) {
        setError(`Low extraction confidence (${(extracted.confidence * 100).toFixed(0)}%). Please review the details below.`);
      }
      
      setExpenseData({
        amount: extracted.amount.toString(),
        currency: extracted.currency,
        description: extracted.description,
        category: extracted.category,
        date: extracted.date,
      });
      
      setShowEditForm(true);
    } catch (error) {
      console.error('Extraction error:', error);
      setError('Failed to extract expense data. Please try recording again or enter manually.');
    } finally {
      setIsExtracting(false);
    }
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
  };

  const handleSaveExpense = async () => {
    try {
      if (!expenseData.amount || parseFloat(expenseData.amount) <= 0) {
        setError('Please enter a valid amount');
        return;
      }
      
      if (!expenseData.description.trim()) {
        setError('Please enter a description');
        return;
      }
      
      const expense = {
        amount: parseFloat(expenseData.amount),
        description: expenseData.description.trim(),
        category: expenseData.category,
        date: expenseData.date,
      };

      await onAddExpense(expense);
      navigate('/');
    } catch (error) {
      console.error('Save error:', error);
      setError('Failed to save expense. Please try again.');
    }
  };

  const handleBack = () => {
    onBack();
    navigate('/');
  };

  const handleRetry = () => {
    setTranscription(null);
    setExtractedData(null);
    setShowEditForm(false);
    setError(null);
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.95) return 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400';
    if (confidence >= 0.90) return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400';
    if (confidence >= 0.80) return 'text-orange-600 bg-orange-100 dark:bg-orange-900/20 dark:text-orange-400';
    return 'text-red-600 bg-red-100 dark:bg-red-900/20 dark:text-red-400';
  };

  const getConfidenceText = (confidence: number) => {
    if (confidence >= 0.95) return 'Excellent';
    if (confidence >= 0.90) return 'Good';
    if (confidence >= 0.80) return 'Fair';
    return 'Poor';
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="flex flex-col h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-emerald-900"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-12 pb-6">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleBack}
          className="w-11 h-11 bg-white/80 dark:bg-gray-700/80 backdrop-blur-xl rounded-2xl flex items-center justify-center shadow-lg border border-white/20"
        >
          <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
        </motion.button>
        
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          {t('voiceExpense')}
        </h1>
        
        {showEditForm && (
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleRetry}
            className="w-11 h-11 bg-blue-500 rounded-2xl flex items-center justify-center shadow-lg"
          >
            <RefreshCw className="w-5 h-5 text-white" />
          </motion.button>
        )}
        
        {!showEditForm && <div className="w-11 h-11" />}
      </div>

      {/* Error Display */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mx-6 mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-5"
          >
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-red-700 dark:text-red-400 text-base">{error}</p>
                <button
                  onClick={() => setError(null)}
                  className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-sm mt-2 font-medium"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recording Interface */}
      {!showEditForm && (
        <div className="flex-1 flex flex-col items-center justify-center px-6">
          <VoiceRecorder
            onTranscription={handleTranscription}
            onError={handleError}
            disabled={isExtracting}
          />
          
          {/* Transcription Display */}
          {transcription && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 bg-white/80 dark:bg-gray-700/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl max-w-md w-full border border-white/20"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-semibold text-gray-700 dark:text-gray-300">
                  {t('transcription')}
                </h3>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${getConfidenceColor(transcription.confidence)}`}>
                  {getConfidenceText(transcription.confidence)} ({(transcription.confidence * 100).toFixed(0)}%)
                </div>
              </div>
              <p className="text-gray-800 dark:text-white font-semibold text-lg">
                "{transcription.text}"
              </p>
              {isExtracting && (
                <div className="mt-4 flex items-center space-x-2 text-base text-gray-500 dark:text-gray-400">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <RefreshCw className="w-4 h-4" />
                  </motion.div>
                  <span>Extracting expense data with AI...</span>
                </div>
              )}
            </motion.div>
          )}
        </div>
      )}

      {/* Edit Form */}
      <AnimatePresence>
        {showEditForm && extractedData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex-1 px-6 pb-6"
          >
            <div className="bg-white/80 dark:bg-gray-700/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-2">
                  <Edit3 className="w-5 h-5 text-purple-500" />
                  <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                    {t('reviewAndEdit')}
                  </h2>
                </div>
                <div className={`px-4 py-2 rounded-full text-sm font-semibold ${getConfidenceColor(extractedData.confidence)}`}>
                  {t('aiConfidence')}: {(extractedData.confidence * 100).toFixed(0)}%
                </div>
              </div>

              {/* Original transcription */}
              {transcription && (
                <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-600 rounded-2xl">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 font-medium">{t('original')}:</p>
                  <p className="text-base text-gray-700 dark:text-gray-300 font-medium">"{transcription.text}"</p>
                </div>
              )}

              <div className="space-y-6">
                {/* Amount & Currency */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <label className="flex items-center space-x-2 text-base font-semibold text-gray-700 dark:text-gray-300 mb-3">
                      <DollarSign className="w-4 h-4" />
                      <span>{t('amount')}</span>
                    </label>
                    <input
                      type="number"
                      value={expenseData.amount}
                      onChange={(e) => setExpenseData({ ...expenseData, amount: e.target.value })}
                      className="w-full px-4 py-4 bg-gray-50 dark:bg-gray-600 border border-gray-200 dark:border-gray-500 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800 dark:text-white font-semibold text-lg"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="block text-base font-semibold text-gray-700 dark:text-gray-300 mb-3">
                      {t('currency')}
                    </label>
                    <select
                      value={expenseData.currency}
                      onChange={(e) => setExpenseData({ ...expenseData, currency: e.target.value })}
                      className="w-full px-4 py-4 bg-gray-50 dark:bg-gray-600 border border-gray-200 dark:border-gray-500 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800 dark:text-white font-semibold"
                    >
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                    </select>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="flex items-center space-x-2 text-base font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    <FileText className="w-4 h-4" />
                    <span>{t('description')}</span>
                  </label>
                  <input
                    type="text"
                    value={expenseData.description}
                    onChange={(e) => setExpenseData({ ...expenseData, description: e.target.value })}
                    className="w-full px-4 py-4 bg-gray-50 dark:bg-gray-600 border border-gray-200 dark:border-gray-500 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800 dark:text-white font-medium text-lg"
                    placeholder="What did you spend on?"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="flex items-center space-x-2 text-base font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    <Tag className="w-4 h-4" />
                    <span>{t('category')}</span>
                  </label>
                  <select
                    value={expenseData.category}
                    onChange={(e) => setExpenseData({ ...expenseData, category: e.target.value })}
                    className="w-full px-4 py-4 bg-gray-50 dark:bg-gray-600 border border-gray-200 dark:border-gray-500 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800 dark:text-white font-semibold"
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
                  <label className="flex items-center space-x-2 text-base font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    <Calendar className="w-4 h-4" />
                    <span>{t('date')}</span>
                  </label>
                  <input
                    type="date"
                    value={expenseData.date}
                    onChange={(e) => setExpenseData({ ...expenseData, date: e.target.value })}
                    className="w-full px-4 py-4 bg-gray-50 dark:bg-gray-600 border border-gray-200 dark:border-gray-500 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800 dark:text-white font-semibold"
                  />
                </div>
              </div>

              <div className="flex space-x-4 mt-8">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleRetry}
                  className="flex-1 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 py-4 px-6 rounded-2xl font-semibold hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors"
                >
                  {t('recordAgain')}
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSaveExpense}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 px-6 rounded-2xl font-semibold flex items-center justify-center space-x-2 hover:from-purple-600 hover:to-pink-600 transition-colors shadow-xl"
                >
                  <Check className="w-5 h-5" />
                  <span>{t('saveExpense')}</span>
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};