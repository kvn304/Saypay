import React, { createContext, useContext, useState, useEffect } from 'react';

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
    
    // Categories
    food: 'Food',
    transport: 'Transport',
    rent: 'Rent',
    shopping: 'Shopping',
    health: 'Health',
    entertainment: 'Entertainment',
    utilities: 'Utilities',
    misc: 'Misc',
    
    // Settings
    account: 'Account',
    profile: 'Profile',
    notifications: 'Notifications',
    enabled: 'Enabled',
    appearance: 'Appearance',
    darkMode: 'Dark Mode',
    themeColor: 'Theme Color',
    dataPrivacy: 'Data & Privacy',
    exportData: 'Export Data',
    clearAllData: 'Clear All Data',
    privacyPolicy: 'Privacy Policy',
    support: 'Support',
    helpFAQ: 'Help & FAQ',
    language: 'Language',
    signOut: 'Sign Out',
    
    // Auth
    expenseVoice: 'ExpenseVoice',
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
    
    // Recording Screen
    voiceExpense: 'आवाज़ खर्च',
    tapToRecordExpense: 'खर्च रिकॉर्ड करने के लिए टैप करें',
    recording: 'रिकॉर्डिंग... रोकने के लिए टैप करें',
    tapWhenFinished: 'समाप्त होने पर बटन को फिर से टैप करें',
    processingWithAI: 'AI के साथ प्रोसेसिंग...',
    usingOpenAI: 'अधिकतम सटीकता के लिए OpenAI Whisper और GPT-4o का उपयोग',
    transcription: 'ट्रांसक्रिप्शन',
    reviewAndEdit: 'समीक्षा और संपादन',
    aiConfidence: 'AI विश्वास',
    original: 'मूल',
    amount: 'राशि',
    currency: 'मुद्रा',
    description: 'विवरण',
    category: 'श्रेणी',
    date: 'तारीख',
    recordAgain: 'फिर से रिकॉर्ड करें',
    saveExpense: 'खर्च सेव करें',
    
    // Categories
    food: 'भोजन',
    transport: 'परिवहन',
    rent: 'किराया',
    shopping: 'खरीदारी',
    health: 'स्वास्थ्य',
    entertainment: 'मनोरंजन',
    utilities: 'उपयोगिताएं',
    misc: 'विविध',
    
    // Settings
    account: 'खाता',
    profile: 'प्रोफ़ाइल',
    notifications: 'सूचनाएं',
    enabled: 'सक्षम',
    appearance: 'दिखावट',
    darkMode: 'डार्क मोड',
    themeColor: 'थीम रंग',
    dataPrivacy: 'डेटा और गोपनीयता',
    exportData: 'डेटा निर्यात',
    clearAllData: 'सभी डेटा साफ़ करें',
    privacyPolicy: 'गोपनीयता नीति',
    support: 'सहायता',
    helpFAQ: 'सहायता और FAQ',
    language: 'भाषा',
    signOut: 'साइन आउट',
    
    // Auth
    expenseVoice: 'एक्सपेंस वॉइस',
    login: 'लॉगिन',
    register: 'रजिस्टर',
    email: 'ईमेल',
    password: 'पासवर्ड',
    fullName: 'पूरा नाम',
    signIn: 'साइन इन',
    createAccount: 'खाता बनाएं',
    
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
    
    // Recording Screen
    voiceExpense: 'Gasto por Voz',
    tapToRecordExpense: 'Toca para grabar gasto',
    recording: 'Grabando... Toca para parar',
    tapWhenFinished: 'Toca el botón nuevamente cuando termines',
    processingWithAI: 'Procesando con IA...',
    usingOpenAI: 'Usando OpenAI Whisper y GPT-4o para máxima precisión',
    transcription: 'Transcripción',
    reviewAndEdit: 'Revisar y Editar',
    aiConfidence: 'Confianza IA',
    original: 'Original',
    amount: 'Cantidad',
    currency: 'Moneda',
    description: 'Descripción',
    category: 'Categoría',
    date: 'Fecha',
    recordAgain: 'Grabar de Nuevo',
    saveExpense: 'Guardar Gasto',
    
    // Categories
    food: 'Comida',
    transport: 'Transporte',
    rent: 'Alquiler',
    shopping: 'Compras',
    health: 'Salud',
    entertainment: 'Entretenimiento',
    utilities: 'Servicios',
    misc: 'Varios',
    
    // Settings
    account: 'Cuenta',
    profile: 'Perfil',
    notifications: 'Notificaciones',
    enabled: 'Habilitado',
    appearance: 'Apariencia',
    darkMode: 'Modo Oscuro',
    themeColor: 'Color del Tema',
    dataPrivacy: 'Datos y Privacidad',
    exportData: 'Exportar Datos',
    clearAllData: 'Borrar Todos los Datos',
    privacyPolicy: 'Política de Privacidad',
    support: 'Soporte',
    helpFAQ: 'Ayuda y FAQ',
    language: 'Idioma',
    signOut: 'Cerrar Sesión',
    
    // Auth
    expenseVoice: 'ExpenseVoice',
    login: 'Iniciar Sesión',
    register: 'Registrarse',
    email: 'Correo',
    password: 'Contraseña',
    fullName: 'Nombre Completo',
    signIn: 'Iniciar Sesión',
    createAccount: 'Crear Cuenta',
    
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
    
    // Recording Screen
    voiceExpense: 'Dépense Vocale',
    tapToRecordExpense: 'Appuyez pour enregistrer la dépense',
    recording: 'Enregistrement... Appuyez pour arrêter',
    tapWhenFinished: 'Appuyez à nouveau sur le bouton quand vous avez terminé',
    processingWithAI: 'Traitement avec IA...',
    usingOpenAI: 'Utilisation d\'OpenAI Whisper et GPT-4o pour une précision maximale',
    transcription: 'Transcription',
    reviewAndEdit: 'Réviser et Modifier',
    aiConfidence: 'Confiance IA',
    original: 'Original',
    amount: 'Montant',
    currency: 'Devise',
    description: 'Description',
    category: 'Catégorie',
    date: 'Date',
    recordAgain: 'Enregistrer à Nouveau',
    saveExpense: 'Sauvegarder la Dépense',
    
    // Categories
    food: 'Nourriture',
    transport: 'Transport',
    rent: 'Loyer',
    shopping: 'Achats',
    health: 'Santé',
    entertainment: 'Divertissement',
    utilities: 'Services',
    misc: 'Divers',
    
    // Settings
    account: 'Compte',
    profile: 'Profil',
    notifications: 'Notifications',
    enabled: 'Activé',
    appearance: 'Apparence',
    darkMode: 'Mode Sombre',
    themeColor: 'Couleur du Thème',
    dataPrivacy: 'Données et Confidentialité',
    exportData: 'Exporter les Données',
    clearAllData: 'Effacer Toutes les Données',
    privacyPolicy: 'Politique de Confidentialité',
    support: 'Support',
    helpFAQ: 'Aide et FAQ',
    language: 'Langue',
    signOut: 'Se Déconnecter',
    
    // Auth
    expenseVoice: 'ExpenseVoice',
    login: 'Connexion',
    register: 'S\'inscrire',
    email: 'Email',
    password: 'Mot de passe',
    fullName: 'Nom Complet',
    signIn: 'Se Connecter',
    createAccount: 'Créer un Compte',
    
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
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('app-language') as Language;
    return saved || 'en';
  });

  useEffect(() => {
    localStorage.setItem('app-language', language);
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['en']] || key;
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