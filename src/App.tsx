import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HomeScreen } from './screens/HomeScreen';
import { RecordingScreen } from './screens/RecordingScreen';
import { ReportsScreen } from './screens/ReportsScreen';
import { ExpenseDetailScreen } from './screens/ExpenseDetailScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { OnboardingScreen } from './screens/OnboardingScreen';
import LoginScreen from './screens/LoginScreen';
import { DatabaseMonitoringScreen } from './screens/DatabaseMonitoringScreen';
import { BottomNavigation } from './components/BottomNavigation';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoadingSpinner } from './components/LoadingSpinner';
import { useExpenses } from './hooks/useExpenses';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { UserProvider } from './contexts/UserContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { MobileOptimizations } from './components/MobileOptimizations';

function AppContent() {
  const { user, loading: authLoading } = useAuth();
  const {
    expenses,
    isLoading,
    addExpense,
    updateExpense,
    deleteExpense,
    clearAllExpenses
  } = useExpenses();
  const [isRecording, setIsRecording] = useState(false);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [appInitialized, setAppInitialized] = useState(false);

  // Initialize app
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Check onboarding status
        const onboardingComplete = localStorage.getItem('onboarding-complete');
        setHasCompletedOnboarding(!!onboardingComplete);

        // Set up online/offline listeners
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);
        
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        setAppInitialized(true);

        return () => {
          window.removeEventListener('online', handleOnline);
          window.removeEventListener('offline', handleOffline);
        };
      } catch (error) {
        console.error('App initialization error:', error);
        setAppInitialized(true);
      }
    };

    initializeApp();
  }, []);

  const handleCompleteOnboarding = () => {
    localStorage.setItem('onboarding-complete', 'true');
    setHasCompletedOnboarding(true);
  };

  // Show loading screen while app is initializing or auth is loading
  if (!appInitialized || authLoading) {
    return <LoadingSpinner fullScreen text="Initializing app..." />;
  }

  // Show onboarding if not completed
  if (!hasCompletedOnboarding) {
    return <OnboardingScreen onComplete={handleCompleteOnboarding} />;
  }

  return (
    <Router>
      <MobileOptimizations>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
          <div className="max-w-md mx-auto bg-white dark:bg-gray-800 min-h-screen shadow-xl relative">
            <AnimatePresence mode="wait">
              <Routes>
                {/* Public Routes */}
                <Route 
                  path="/login" 
                  element={
                    <ProtectedRoute requireAuth={false}>
                      <LoginScreen />
                    </ProtectedRoute>
                  } 
                />
                
                {/* Protected Routes */}
                <Route 
                  path="/" 
                  element={
                    <ProtectedRoute>
                      {isLoading ? (
                        <LoadingSpinner fullScreen text="Loading your expenses..." />
                      ) : (
                        <HomeScreen 
                          expenses={expenses}
                          isOnline={isOnline}
                          onStartRecording={() => setIsRecording(true)}
                        />
                      )}
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/record" 
                  element={
                    <ProtectedRoute>
                      <RecordingScreen 
                        onAddExpense={addExpense}
                        onBack={() => setIsRecording(false)}
                      />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/reports" 
                  element={
                    <ProtectedRoute>
                      <ReportsScreen expenses={expenses} />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/expense/:id" 
                  element={
                    <ProtectedRoute>
                      <ExpenseDetailScreen 
                        expenses={expenses}
                        onEditExpense={updateExpense}
                        onDeleteExpense={deleteExpense}
                      />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/settings" 
                  element={
                    <ProtectedRoute>
                      <SettingsScreen 
                        expenses={expenses} 
                        onClearAllData={clearAllExpenses}
                      />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/database-monitoring" 
                  element={
                    <ProtectedRoute>
                      <DatabaseMonitoringScreen />
                    </ProtectedRoute>
                  } 
                />
                
                {/* Redirect unknown routes */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </AnimatePresence>
            
            {/* Show bottom navigation only for authenticated users */}
            {user && <BottomNavigation />}
          </div>
        </div>
      </MobileOptimizations>
    </Router>
  );
}

function App() {
  return (
    <LanguageProvider>
      <ThemeProvider>
        <AuthProvider>
          <UserProvider>
            <AppContent />
          </UserProvider>
        </AuthProvider>
      </ThemeProvider>
    </LanguageProvider>
  );
}

export default App;