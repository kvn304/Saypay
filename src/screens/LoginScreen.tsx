import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Smartphone, User, Loader2 } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../hooks/useToast';
import { ToastContainer } from '../components/Toast';
import { useLanguage } from '../contexts/LanguageContext';

const LoginScreen: React.FC = () => {
  const { isDark, colorTheme } = useTheme();
  const { signIn, signUp, loading } = useAuth();
  const { toasts, removeToast, success, error } = useToast();
  const { t } = useLanguage();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<{
    email?: string;
    password?: string;
    fullName?: string;
  }>({});

  const getThemeColors = () => {
    const colors = {
      purple: 'from-purple-500 to-pink-500',
      blue: 'from-blue-500 to-indigo-500',
      green: 'from-green-500 to-emerald-500',
      pink: 'from-pink-500 to-rose-500',
      orange: 'from-orange-500 to-amber-500'
    };
    return colors[colorTheme];
  };

  const validateForm = () => {
    const errors: typeof formErrors = {};

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      errors.email = 'Email is required';
    } else if (!emailRegex.test(email)) {
      errors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    // Full name validation (for signup)
    if (!isLogin && !fullName.trim()) {
      errors.fullName = 'Full name is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      if (isLogin) {
        const { error: signInError } = await signIn(email, password);
        
        if (signInError) {
          if (signInError.message.includes('Invalid login credentials')) {
            error('Login Failed', 'Invalid email or password. Please try again.');
          } else if (signInError.message.includes('Email not confirmed')) {
            error('Email Not Verified', 'Please check your email and click the verification link.');
          } else {
            error('Login Failed', signInError.message);
          }
        } else {
          success('Welcome Back!', 'You have been successfully logged in.');
        }
      } else {
        const { error: signUpError, needsVerification } = await signUp(email, password, fullName);
        
        if (signUpError) {
          if (signUpError.message.includes('already registered')) {
            error('Account Exists', 'An account with this email already exists. Try logging in instead.');
          } else {
            error('Registration Failed', signUpError.message);
          }
        } else {
          if (needsVerification) {
            success(
              'Account Created!', 
              'Please check your email and click the verification link to complete your registration.'
            );
            // Switch to login mode after successful signup
            setIsLogin(true);
            setPassword('');
          } else {
            success('Welcome!', 'Your account has been created successfully.');
          }
        }
      }
    } catch (err) {
      console.error('Authentication error:', err);
      error('Unexpected Error', 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    // Clear field-specific error when user starts typing
    if (formErrors[field as keyof typeof formErrors]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }));
    }

    switch (field) {
      case 'email':
        setEmail(value);
        break;
      case 'password':
        setPassword(value);
        break;
      case 'fullName':
        setFullName(value);
        break;
    }
  };

  const switchMode = () => {
    setIsLogin(!isLogin);
    setFormErrors({});
    setPassword('');
    if (isLogin) {
      setFullName('');
    }
  };

  return (
    <>
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-900">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20"
        >
          {/* Logo */}
          <div className="text-center mb-8">
            <div className={`w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br ${getThemeColors()} flex items-center justify-center shadow-xl`}>
              <Smartphone className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {t('expenseVoice')}
            </h1>
            <p className="text-base text-gray-600 dark:text-gray-400 mt-3">
              {t('trackExpenses')}
            </p>
          </div>

          {/* Toggle Login/Register */}
          <div className="flex bg-gray-100 dark:bg-gray-700 rounded-2xl p-1 mb-8">
            <button
              onClick={() => isLogin || switchMode()}
              className={`flex-1 py-4 px-6 rounded-2xl text-base font-semibold transition-all touch-target ${
                isLogin
                  ? `bg-gradient-to-r ${getThemeColors()} text-white shadow-lg`
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {t('login')}
            </button>
            <button
              onClick={() => !isLogin || switchMode()}
              className={`flex-1 py-4 px-6 rounded-2xl text-base font-semibold transition-all touch-target ${
                !isLogin
                  ? `bg-gradient-to-r ${getThemeColors()} text-white shadow-lg`
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {t('register')}
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name (Register only) */}
            {!isLogin && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <label className="block text-base font-semibold mb-3 text-gray-700 dark:text-gray-300">
                  {t('fullName')}
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    className={`input-field pl-10 pr-4 ${
                      formErrors.fullName
                        ? 'border-red-500 focus:ring-red-500'
                        : 'focus:ring-blue-500'
                    } py-4 text-lg font-medium rounded-2xl`}
                    placeholder={`Enter your ${t('fullName').toLowerCase()}`}
                    required={!isLogin}
                  />
                </div>
                {formErrors.fullName && (
                  <p className="mt-2 text-base text-red-500 font-medium">{formErrors.fullName}</p>
                )}
              </motion.div>
            )}

            {/* Email Input */}
            <div>
              <label className="block text-base font-semibold mb-3 text-gray-700 dark:text-gray-300">
                {t('email')}
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`input-field pl-10 pr-4 ${
                    formErrors.email
                      ? 'border-red-500 focus:ring-red-500'
                      : 'focus:ring-blue-500'
                  } py-4 text-lg font-medium rounded-2xl`}
                  placeholder={`Enter your ${t('email').toLowerCase()}`}
                  required
                />
              </div>
              {formErrors.email && (
                <p className="mt-2 text-base text-red-500 font-medium">{formErrors.email}</p>
              )}
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-base font-semibold mb-3 text-gray-700 dark:text-gray-300">
                {t('password')}
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className={`input-field pl-10 pr-12 ${
                    formErrors.password
                      ? 'border-red-500 focus:ring-red-500'
                      : 'focus:ring-blue-500'
                  } py-4 text-lg font-medium rounded-2xl`}
                  placeholder={`Enter your ${t('password').toLowerCase()}`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {formErrors.password && (
                <p className="mt-2 text-base text-red-500 font-medium">{formErrors.password}</p>
              )}
            </div>

            {/* Submit Button */}
            <motion.button
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isSubmitting || loading}
              className="w-full py-4 px-6 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 text-white font-bold text-lg rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>{isLogin ? `${t('signIn')}...` : `${t('createAccount')}...`}</span>
                </>
              ) : (
                <span>{isLogin ? t('signIn') : t('createAccount')}</span>
              )}
            </motion.button>
          </form>

          {/* Supabase Info */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Powered by Supabase • Secure & Real-time
            </p>
          </div>
        </motion.div>
      </div>

      {/* Toast Container */}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </>
  );
};

export default LoginScreen;