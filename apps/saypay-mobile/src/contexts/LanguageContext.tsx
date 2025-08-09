import React, { createContext, useContext, useState, useEffect } from 'react';
import { storage } from '../utils/storage';

type Language = 'en' | 'hi' | 'es' | 'fr';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// Translation dictionaries
const translations = {
  en: {
    // Navigation
    home: 'Home',
    record: 'Record',
    reports: 'Reports',
    settings: 'Settings',
    
    // Home Screen
    hello: 'Hello',
    trackExpenses: 'Track your expenses with voice',
    totalSpent: 'Total Spent',
    tapToRecord: 'Tap to Record',
    voiceYourExpense: 'Voice your expense',
    recentExpenses: 'Recent Expenses',
    viewAll: 'View All',
    noExpensesYet: 'No expenses yet',
    startRecording: 'Start recording your first expense!',
    
    // Recording Screen
    voiceExpense: 'Voice Expense',
    tapToRecordExpense: 'Tap to record expense',
    recording: 'Recording... Tap to stop',
    tapWhenFinished: 'Tap the button again when finished',
    processingWithAI: 'Processing with AI...',
    usingOpenAI: 'Using OpenAI Whisper & GPT-4o for max accuracy',
    transcription: 'Transcription',
    reviewAndEdit: 'Review & Edit',
    aiConfidence: 'AI Confidence',
    original: 'Original',
    amount: 'Amount',
    currency: 'Currency',
    description: 'Description',
    category: 'Category',
    date: 'Date',
    recordAgain: 'Record Again',
    saveExpense: 'Save Expense',
    
    // Auth
    login: 'Login',
    register: 'Register',
    email: 'Email',
    password: 'Password',
    fullName: 'Full Name',
    signIn: 'Sign In',
    createAccount: 'Create Account',
    
    // Common
    cancel: 'Cancel',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    back: 'Back',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
  },
  
  hi: {
    // Navigation
    home: 'होम',
    record: 'रिकॉर्ड',
    reports: 'रिपोर्ट',
    settings: 'सेटिंग्स',
    
    // Home Screen
    hello: 'नमस्ते',
    trackExpenses: 'आवाज़ से अपने खर्च को ट्रैक करें',
    totalSpent: 'कुल खर्च',
    tapToRecord: 'रिकॉर्ड करने के लिए टैप करें',
    voiceYourExpense: 'अपना खर्च बोलें',
    recentExpenses: 'हाल के खर्च',
    viewAll: 'सभी देखें',
    noExpensesYet: 'अभी तक कोई खर्च नहीं',
    startRecording: 'अपना पहला खर्च रिकॉर्ड करना शुरू करें!',
    
    // Common
    cancel: 'रद्द करें',
    save: 'सेव करें',
    delete: 'डिलीट करें',
    edit: 'संपादित करें',
    back: 'वापस',
    loading: 'लोड हो रहा है...',
    error: 'त्रुटि',
    success: 'सफलता',
  },
  
  es: {
    // Navigation
    home: 'Inicio',
    record: 'Grabar',
    reports: 'Informes',
    settings: 'Configuración',
    
    // Home Screen
    hello: 'Hola',
    trackExpenses: 'Rastrea tus gastos con voz',
    totalSpent: 'Total Gastado',
    tapToRecord: 'Toca para Grabar',
    voiceYourExpense: 'Di tu gasto',
    recentExpenses: 'Gastos Recientes',
    viewAll: 'Ver Todo',
    noExpensesYet: 'Aún no hay gastos',
    startRecording: '¡Comienza a grabar tu primer gasto!',
    
    // Common
    cancel: 'Cancelar',
    save: 'Guardar',
    delete: 'Eliminar',
    edit: 'Editar',
    back: 'Atrás',
    loading: 'Cargando...',
    error: 'Error',
    success: 'Éxito',
  },
  
  fr: {
    // Navigation
    home: 'Accueil',
    record: 'Enregistrer',
    reports: 'Rapports',
    settings: 'Paramètres',
    
    // Home Screen
    hello: 'Bonjour',
    trackExpenses: 'Suivez vos dépenses avec la voix',
    totalSpent: 'Total Dépensé',
    tapToRecord: 'Appuyez pour Enregistrer',
    voiceYourExpense: 'Dites votre dépense',
    recentExpenses: 'Dépenses Récentes',
    viewAll: 'Voir Tout',
    noExpensesYet: 'Aucune dépense pour le moment',
    startRecording: 'Commencez à enregistrer votre première dépense!',
    
    // Common
    cancel: 'Annuler',
    save: 'Sauvegarder',
    delete: 'Supprimer',
    edit: 'Modifier',
    back: 'Retour',
    loading: 'Chargement...',
    error: 'Erreur',
    success: 'Succès',
  },
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    loadLanguage();
  }, []);

  const loadLanguage = async () => {
    try {
      const saved = await storage.getItem('app-language') as Language;
      if (saved) {
        setLanguageState(saved);
      }
    } catch (error) {
      console.error('Error loading language:', error);
    }
  };

  const setLanguage = async (lang: Language) => {
    setLanguageState(lang);
    await storage.setItem('app-language', lang);
  };

  const t = (key: string): string => {
    const translation = translations[language];
    return translation[key as keyof typeof translation] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const languageOptions = [
  { code: 'en' as Language, name: 'English', flag: '🇺🇸' },
  { code: 'hi' as Language, name: 'हिंदी', flag: '🇮🇳' },
  { code: 'es' as Language, name: 'Español', flag: '🇪🇸' },
  { code: 'fr' as Language, name: 'Français', flag: '🇫🇷' },
];