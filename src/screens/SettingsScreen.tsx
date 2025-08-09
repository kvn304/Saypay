import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Moon, 
  Sun, 
  User, 
  Download, 
  Trash2,
  LogOut,
  Shield,
  HelpCircle,
  Palette,
  Globe,
  X,
  Check,
  ChevronRight,
  Database
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useUser } from '../contexts/UserContext';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage, languageOptions } from '../contexts/LanguageContext';
import { ColorThemeModal } from '../components/ColorThemeModal';

interface SettingsScreenProps {
  onClearAllData?: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ 
  onClearAllData 
}) => {
  const navigate = useNavigate();
  const { isDark, toggleTheme, colorTheme } = useTheme();
  const { user } = useUser();
  const { signOut, user: authUser } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showClearDataConfirm, setShowClearDataConfirm] = useState(false);
  const [showColorThemeModal, setShowColorThemeModal] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  const handleLogout = async () => {
    try {
      setShowLogoutConfirm(false);
      await signOut();
      localStorage.removeItem('onboarding-complete');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleClearData = async () => {
    try {
      setShowClearDataConfirm(false);
      
      // Clear all expenses from Supabase
      if (onClearAllData) {
        onClearAllData();
      }
    } catch (error) {
      console.error('Error clearing data:', error);
    }
  };

  // Trendy gender-neutral emojis
  const trendyEmojis = ['✨', '🌟', '💫', '🎯', '🚀', '💎', '🔥', '⚡', '🌈', '🎨', '🦄', '🎪', '🌺', '🍀'];
  const randomEmoji = trendyEmojis[Math.floor(Math.random() * trendyEmojis.length)];

  const settingsGroups = [
    {
      title: t('account'),
      items: [
        {
          icon: User,
          label: t('profile'),
          value: user?.name,
          action: () => {},
        },
      ]
    },
    {
      title: t('appearance'),
      items: [
        {
          icon: isDark ? Moon : Sun,
          label: t('darkMode'),
          value: isDark ? 'On' : 'Off',
          action: toggleTheme,
          toggle: true,
        },
        {
          icon: Palette,
          label: t('themeColor'),
          value: colorTheme.charAt(0).toUpperCase() + colorTheme.slice(1),
          action: () => setShowColorThemeModal(true),
        },
        {
          icon: Globe,
          label: t('language'),
          value: languageOptions.find(lang => lang.code === language)?.name || 'English',
          action: () => setShowLanguageModal(true),
        },
      ]
    },
    {
      title: t('dataPrivacy'),
      items: [
        {
          icon: Shield,
          label: t('privacyPolicy'),
          value: '',
          action: () => setShowPrivacyModal(true),
        },
      ]
    },
    {
      title: t('support'),
      items: [
        {
          icon: HelpCircle,
          label: t('helpFAQ'),
          value: '',
          action: () => setShowHelpModal(true),
        },
      ]
    }
  ];

  const faqData = [
    {
      question: "How does voice recognition work?",
      answer: "Simply tap the record button and speak your expense. Our AI will automatically transcribe and categorize it for you."
    },
    {
      question: "Which languages are supported?",
      answer: "We support English, Hindi, Spanish, and French for voice recognition and categorization."
    },
    {
      question: "Is my data secure?",
      answer: "Yes, all your data is encrypted and stored securely. We use industry-standard security practices."
    },
    {
      question: "Can I edit expenses after recording?",
      answer: "Absolutely! Tap on any expense to edit the amount, description, category, or date."
    },
    {
      question: "How do I export my data?",
      answer: "Go to Settings > Export Data to download your expenses as a CSV file."
    }
  ];

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
          onClick={() => navigate('/')}
          className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center"
        >
          <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
        </motion.button>
        
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">
          {t('settings')}
        </h1>
        
        <div className="w-10 h-10" />
      </div>

      <div className="flex-1 px-6 pb-24 overflow-y-auto">
        {/* Profile Card */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-br from-purple-500 to-pink-500 dark:from-purple-600 dark:to-pink-600 rounded-2xl p-6 text-white shadow-lg mb-6 mt-4"
        >
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-2xl">
              {randomEmoji}
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold">{user?.name}</h2>
              <p className="text-white/80 text-sm">{user?.email}</p>
            </div>
          </div>
          
          {/* Real Stats */}
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="text-center">
              <p className="text-2xl font-bold">0</p>
              <p className="text-white/70 text-sm">Expenses</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">0</p>
              <p className="text-white/70 text-sm">Categories</p>
            </div>
          </div>
        </motion.div>

        {/* Settings Groups */}
        {settingsGroups.map((group, groupIndex) => (
          <div key={group.title} className="mb-6">
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 px-2">
              {group.title}
            </h3>
            
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden">
              {group.items.map((item, index) => (
                <motion.button
                  key={item.label}
                  whileTap={{ scale: 0.98 }}
                  onClick={item.action}
                  className={`w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                    index !== group.items.length - 1 ? 'border-b border-gray-100 dark:border-gray-700' : ''
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      item.destructive 
                        ? 'bg-red-100 dark:bg-red-900/30' 
                        : 'bg-gray-100 dark:bg-gray-700'
                    }`}>
                      <item.icon className={`w-5 h-5 ${
                        item.destructive 
                          ? 'text-red-500' 
                          : 'text-gray-600 dark:text-gray-300'
                      }`} />
                    </div>
                    <div className="text-left">
                      <p className={`font-medium ${
                        item.destructive 
                          ? 'text-red-600 dark:text-red-400' 
                          : 'text-gray-900 dark:text-white'
                      }`}>
                        {item.label}
                      </p>
                      {item.value && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {item.value}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {item.toggle ? (
                      <div className={`relative w-12 h-6 rounded-full transition-colors ${
                        isDark ? 'bg-purple-500' : 'bg-gray-300'
                      }`}>
                        <motion.div 
                          animate={{ x: isDark ? 24 : 2 }}
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                          className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
                        />
                      </div>
                    ) : (
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        ))}

        {/* Logout Button */}
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowLogoutConfirm(true)}
          className="w-full bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm flex items-center justify-center space-x-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">{t('signOut')}</span>
        </motion.button>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
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
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-sm w-full"
          >
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center">
                <LogOut className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                {t('signOut')}?
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                You'll need to sign in again to access your expenses.
              </p>
            </div>
            
            <div className="flex space-x-3">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-3 px-4 rounded-xl font-medium"
              >
                {t('cancel')}
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
                className="flex-1 bg-red-500 text-white py-3 px-4 rounded-xl font-medium"
              >
                {t('signOut')}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Color Theme Modal */}
      <ColorThemeModal 
        isOpen={showColorThemeModal}
        onClose={() => setShowColorThemeModal(false)}
      />

      {/* Language Selection Modal */}
      {showLanguageModal && (
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
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-sm w-full"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {t('language')}
              </h3>
              <button
                onClick={() => setShowLanguageModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              {languageOptions.map((option) => (
                <motion.button
                  key={option.code}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setLanguage(option.code);
                    setShowLanguageModal(false);
                  }}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border transition-colors ${
                    language === option.code
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{option.flag}</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {option.name}
                    </span>
                  </div>
                  
                  {language === option.code && (
                    <Check className="w-5 h-5 text-purple-500" />
                  )}
                </motion.button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Help & FAQ Modal */}
      {showHelpModal && (
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
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Help & FAQ
              </h3>
              <button
                onClick={() => setShowHelpModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {faqData.map((faq, index) => (
                <div key={index} className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-b-0">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                    {faq.question}
                  </h4>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Privacy Policy Modal */}
      {showPrivacyModal && (
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
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Privacy Policy
              </h3>
              <button
                onClick={() => setShowPrivacyModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-sm text-gray-600 dark:text-gray-300">
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Data Collection</h4>
                <p>We collect only the expense data you provide through voice recordings and manual entries. This includes amounts, descriptions, categories, and dates.</p>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Data Usage</h4>
                <p>Your data is used solely for providing expense tracking services. We use OpenAI's services for voice transcription and categorization.</p>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Data Security</h4>
                <p>All data is encrypted in transit and at rest. We use industry-standard security practices to protect your information.</p>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Data Sharing</h4>
                <p>We do not sell or share your personal data with third parties except as required for service functionality (OpenAI for AI processing).</p>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Your Rights</h4>
                <p>You can export or delete your data at any time through the app settings. Contact us for any privacy-related questions.</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
};