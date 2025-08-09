import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Mic, Sparkles, BarChart3 } from 'lucide-react';

interface OnboardingScreenProps {
  onComplete: () => void;
}

const onboardingSteps = [
  {
    icon: Mic,
    title: 'Voice Recording',
    description: 'Simply speak your expenses and let AI do the rest. No typing required!',
    color: 'from-emerald-500 to-green-600',
    bgColor: 'from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20'
  },
  {
    icon: Sparkles,
    title: 'Smart Categorization',
    description: 'AI automatically categorizes your expenses and extracts amounts, dates, and descriptions.',
    color: 'from-purple-500 to-pink-600',
    bgColor: 'from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20'
  },
  {
    icon: BarChart3,
    title: 'Insightful Reports',
    description: 'Get detailed analytics and beautiful charts to understand your spending patterns.',
    color: 'from-blue-500 to-indigo-600',
    bgColor: 'from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20'
  }
];

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  const currentStepData = onboardingSteps[currentStep];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900 flex flex-col">
      <div className="max-w-md mx-auto w-full flex flex-col h-screen">
        {/* Skip Button */}
        <div className="flex justify-end pt-12 px-6">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleSkip}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 font-medium"
          >
            Skip
          </motion.button>
        </div>

        {/* Progress Indicators */}
        <div className="flex justify-center space-x-2 px-6 mt-8">
          {onboardingSteps.map((_, index) => (
            <div
              key={index}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentStep 
                  ? 'w-8 bg-purple-500' 
                  : index < currentStep 
                    ? 'w-2 bg-purple-300' 
                    : 'w-2 bg-gray-200 dark:bg-gray-700'
              }`}
            />
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col justify-center px-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
              className="text-center"
            >
              {/* Icon */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.4 }}
                className={`w-32 h-32 mx-auto mb-8 bg-gradient-to-br ${currentStepData.bgColor} rounded-full flex items-center justify-center`}
              >
                <div className={`w-20 h-20 bg-gradient-to-br ${currentStepData.color} rounded-full flex items-center justify-center shadow-xl`}>
                  <currentStepData.icon className="w-10 h-10 text-white" />
                </div>
              </motion.div>

              {/* Title */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.4 }}
                className="text-3xl font-bold text-gray-800 dark:text-white mb-4"
              >
                {currentStepData.title}
              </motion.h1>

              {/* Description */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.4 }}
                className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed px-4"
              >
                {currentStepData.description}
              </motion.p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="px-6 pb-12">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleNext}
            className={`w-full bg-gradient-to-r ${currentStepData.color} text-white py-4 px-6 rounded-2xl font-semibold text-lg shadow-xl flex items-center justify-center space-x-2 hover:shadow-2xl transition-shadow`}
          >
            <span>
              {currentStep === onboardingSteps.length - 1 ? 'Get Started' : 'Next'}
            </span>
            <ChevronRight className="w-5 h-5" />
          </motion.button>
        </div>
      </div>
    </div>
  );
};