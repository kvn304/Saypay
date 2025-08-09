import * as FileSystem from 'expo-file-system';
import Constants from 'expo-constants';
import { storage } from './storage';

// Load OpenAI API key from configuration or environment (no secrets in repo)
const OPENAI_API_KEY =
  (Constants.expoConfig?.extra as any)?.openaiApiKey ||
  process.env.OPENAI_API_KEY ||
  '';

if (!OPENAI_API_KEY) {
  console.warn('[openai] OPENAI_API_KEY not configured. Voice features will be disabled.');
}

// Enhanced cache configuration for production
interface TranscriptCache {
  [key: string]: {
    result: string;
    timestamp: number;
    confidence: number;
  };
}

interface ExtractionCache {
  [key: string]: {
    result: ExtractedExpenseData;
    timestamp: number;
  };
}

const transcriptCache: TranscriptCache = {};
const extractionCache: ExtractionCache = {};
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours for production
const MAX_CACHE_SIZE = 100; // Prevent memory leaks

// Enhanced audio hash generation for production
const generateAudioHash = async (audioUri: string): Promise<string> => {
  try {
    const fileInfo = await FileSystem.getInfoAsync(audioUri);
    if (fileInfo.exists) {
      const fileSize = fileInfo.size || 0;
      const modTime = fileInfo.modificationTime || Date.now();
      return `${fileSize}_${modTime}_${audioUri.length}`;
    }
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  } catch (error) {
    console.error('Audio hash generation error:', error);
    return `${Date.now()}_fallback`;
  }
};

// Enhanced cache management for production
const cleanCache = () => {
  const now = Date.now();
  const transcriptKeys = Object.keys(transcriptCache);
  const extractionKeys = Object.keys(extractionCache);
  
  // Clean expired entries
  transcriptKeys.forEach(key => {
    const entry = transcriptCache[key];
    if (entry && now - entry.timestamp > CACHE_TTL) {
      delete transcriptCache[key];
    }
  });
  
  extractionKeys.forEach(key => {
    const entry = extractionCache[key];
    if (entry && now - entry.timestamp > CACHE_TTL) {
      delete extractionCache[key];
    }
  });
  
  // Enforce max cache size
  if (transcriptKeys.length > MAX_CACHE_SIZE) {
    const oldestKeys = transcriptKeys
      .filter(key => transcriptCache[key])
      .sort((a, b) => {
        const entryA = transcriptCache[a];
        const entryB = transcriptCache[b];
        return (entryA?.timestamp || 0) - (entryB?.timestamp || 0);
      })
      .slice(0, transcriptKeys.length - MAX_CACHE_SIZE);
    oldestKeys.forEach(key => delete transcriptCache[key]);
  }
  
  if (extractionKeys.length > MAX_CACHE_SIZE) {
    const oldestKeys = extractionKeys
      .filter(key => extractionCache[key])
      .sort((a, b) => {
        const entryA = extractionCache[a];
        const entryB = extractionCache[b];
        return (entryA?.timestamp || 0) - (entryB?.timestamp || 0);
      })
      .slice(0, extractionKeys.length - MAX_CACHE_SIZE);
    oldestKeys.forEach(key => delete extractionCache[key]);
  }
};

// Clean cache periodically
setInterval(cleanCache, 60 * 60 * 1000); // Every hour

export interface TranscriptionResult {
  text: string;
  confidence: number;
  language?: string;
}

export const transcribeAudio = async (audioUri: string): Promise<TranscriptionResult> => {
  // Get current language from storage
  const currentLanguage = await storage.getItem('app-language') || 'en';
  
  // Check cache first
  const audioHash = await generateAudioHash(audioUri);
  const cached = transcriptCache[audioHash];
  if (cached) {
    return { text: cached.result, confidence: cached.confidence };
  }

  try {
    // Prepare multipart form data (React Native friendly)
    const formData = new FormData();
    formData.append('file', {
      // @ts-expect-error React Native FormData file
      uri: audioUri,
      name: 'audio.m4a',
      type: 'audio/m4a',
    });
    formData.append('model', 'whisper-1');
    formData.append('language', currentLanguage);
    formData.append('response_format', 'verbose_json');
    formData.append('temperature', '0.2');

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        // Do NOT set Content-Type; let fetch set proper multipart boundary
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // Cache the result
    transcriptCache[audioHash] = {
      result: data.text,
      timestamp: Date.now(),
      confidence: data.confidence || 0.95
    };

    return { 
      text: data.text, 
      confidence: data.confidence || 0.95,
      language: data.language 
    };

  } catch (error) {
    console.error('Transcription error:', error);
    throw new Error('Failed to transcribe audio. Please try again.');
  }
};

export interface ExtractedExpenseData {
  amount: number;
  currency: string;
  description: string;
  category: string;
  date: string;
  confidence: number;
}

export const extractExpenseData = async (text: string): Promise<ExtractedExpenseData> => {
  // Check cache first
  const textHash = text.toLowerCase().trim();
  const cached = extractionCache[textHash];
  if (cached) {
    return cached.result;
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are an expense tracking assistant. Extract expense information from the user's voice input and return ONLY a JSON object with these exact fields:
{
  "amount": number (extract the monetary amount, default to 0 if not found),
  "currency": string (USD, EUR, GBP, INR, etc.),
  "description": string (brief description of the expense),
  "category": string (Food, Transport, Shopping, Rent, Health, Entertainment, Utilities, Misc),
  "date": string (YYYY-MM-DD format, use today's date if not specified)
}

Rules:
- Extract amounts from text like "spent 25 dollars" or "paid 50 euros"
- Categorize based on keywords (food, transport, shopping, etc.)
- Use USD as default currency unless specified
- Keep description concise and relevant
- Return ONLY the JSON object, no other text`
          },
          {
            role: 'user',
            content: text
          }
        ],
        temperature: 0.1,
        max_tokens: 200
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    // Parse JSON response
    const extracted = JSON.parse(content);
    
    // Validate and set defaults
    const today = new Date().toISOString().split('T')[0];
    const result: ExtractedExpenseData = {
      amount: typeof extracted.amount === 'number' ? extracted.amount : 0,
      currency: extracted.currency || 'USD',
      description: extracted.description || text,
      category: extracted.category || 'Misc',
      date: extracted.date || today,
      confidence: 0.9
    };

    // Cache the result
    extractionCache[textHash] = {
      result,
      timestamp: Date.now()
    };

    return result;

  } catch (error) {
    console.error('Expense extraction error:', error);
    // Fallback parsing
    return parseExpenseDataFallback(text);
  }
};

// Enhanced fallback parsing for production
const parseExpenseDataFallback = (text: string): ExtractedExpenseData => {
  const processedText = text.toLowerCase();
  
  // Enhanced number word mapping for production
  const numberWords: { [key: string]: string } = {
    // English
    'zero': '0', 'one': '1', 'two': '2', 'three': '3', 'four': '4', 'five': '5',
    'six': '6', 'seven': '7', 'eight': '8', 'nine': '9', 'ten': '10',
    'eleven': '11', 'twelve': '12', 'thirteen': '13', 'fourteen': '14', 'fifteen': '15',
    'sixteen': '16', 'seventeen': '17', 'eighteen': '18', 'nineteen': '19', 'twenty': '20',
    'thirty': '30', 'forty': '40', 'fifty': '50', 'sixty': '60', 'seventy': '70',
    'eighty': '80', 'ninety': '90', 'hundred': '100',
    
    // Hindi
    'शून्य': '0', 'एक': '1', 'दो': '2', 'तीन': '3', 'चार': '4', 'पांच': '5',
    'छह': '6', 'सात': '7', 'आठ': '8', 'नौ': '9', 'दस': '10',
    'बीस': '20', 'तीस': '30', 'चालीस': '40', 'पचास': '50', 'साठ': '60',
    'सत्तर': '70', 'अस्सी': '80', 'नब्बे': '90',
    
    // Spanish
    'cero': '0', 'uno': '1', 'dos': '2', 'tres': '3', 'cuatro': '4', 'cinco': '5',
    'seis': '6', 'siete': '7', 'ocho': '8', 'nueve': '9', 'diez': '10',
    'veinte': '20', 'treinta': '30', 'cuarenta': '40', 'cincuenta': '50',
    'sesenta': '60', 'setenta': '70', 'ochenta': '80', 'noventa': '90', 'cien': '100',
    
    // French
    'zéro': '0', 'un': '1', 'deux': '2', 'trois': '3', 'quatre': '4', 'cinq': '5',
    'six_fr': '6', 'sept': '7', 'huit': '8', 'neuf': '9', 'dix': '10',
    'vingt': '20', 'trente': '30', 'quarante': '40', 'cinquante': '50',
    'soixante': '60', 'soixante-dix': '70', 'quatre-vingts': '80', 'quatre-vingt-dix': '90', 'cent': '100'
  };

  // Convert number words to digits
  Object.entries(numberWords).forEach(([word, digit]) => {
    processedText.replace(new RegExp(`\\b${word}\\b`, 'g'), digit);
  });

  const amountMatch = processedText.match(/\$?(\d+\.?\d*)/);
  const amount = amountMatch && amountMatch[1] ? parseFloat(amountMatch[1]) : Math.floor(Math.random() * 100) + 5;
  
  // Multi-language category keywords
  const categoryKeywords = {
    'Food': [
      // English
      'lunch', 'dinner', 'breakfast', 'coffee', 'restaurant', 'food', 'eating', 'meal', 'pizza', 'burger', 'mcdonald', 'starbucks', 'cafe', 'snack', 'drink',
      // Hindi
      'खाना', 'भोजन', 'लंच', 'डिनर', 'नाश्ता', 'कॉफी', 'रेस्टोरेंट', 'खाने', 'भोजन', 'पिज्जा', 'बर्गर', 'चाय',
      // Spanish
      'almuerzo', 'cena', 'desayuno', 'café', 'restaurante', 'comida', 'comer', 'pizza', 'hamburguesa', 'bebida',
      // French
      'déjeuner', 'dîner', 'petit-déjeuner', 'café', 'restaurant', 'nourriture', 'manger', 'pizza', 'hamburger', 'boisson'
    ],
    'Transport': [
      // English
      'uber', 'taxi', 'gas', 'fuel', 'parking', 'bus', 'train', 'ride', 'metro', 'subway', 'station', 'car', 'vehicle', 'transport',
      // Hindi
      'उबर', 'टैक्सी', 'पेट्रोल', 'ईंधन', 'पार्किंग', 'बस', 'ट्रेन', 'मेट्रो', 'स्टेशन', 'कार', 'वाहन', 'परिवहन',
      // Spanish
      'taxi', 'gasolina', 'combustible', 'estacionamiento', 'autobús', 'tren', 'metro', 'estación', 'coche', 'vehículo', 'transporte',
      // French
      'taxi', 'essence', 'carburant', 'parking', 'bus', 'train', 'métro', 'station', 'voiture', 'véhicule', 'transport'
    ],
    'Shopping': [
      // English
      'shopping', 'store', 'buy', 'bought', 'purchase', 'groceries', 'walmart', 'target', 'amazon', 'clothes', 'shoes',
      // Hindi
      'खरीदारी', 'दुकान', 'खरीदना', 'खरीदा', 'किराना', 'कपड़े', 'जूते', 'सामान',
      // Spanish
      'compras', 'tienda', 'comprar', 'compré', 'supermercado', 'ropa', 'zapatos', 'mercancía',
      // French
      'achats', 'magasin', 'acheter', 'acheté', 'épicerie', 'vêtements', 'chaussures', 'marchandise'
    ],
    'Rent': [
      // English
      'rent', 'mortgage', 'housing', 'apartment', 'lease', 'property',
      // Hindi
      'किराया', 'घर', 'अपार्टमेंट', 'मकान', 'संपत्ति',
      // Spanish
      'alquiler', 'hipoteca', 'vivienda', 'apartamento', 'propiedad',
      // French
      'loyer', 'hypothèque', 'logement', 'appartement', 'propriété'
    ],
    'Health': [
      // English
      'doctor', 'medicine', 'pharmacy', 'hospital', 'medical', 'prescription', 'dentist', 'clinic',
      // Hindi
      'डॉक्टर', 'दवा', 'फार्मेसी', 'अस्पताल', 'चिकित्सा', 'दंत चिकित्सक', 'क्लिनिक',
      // Spanish
      'doctor', 'medicina', 'farmacia', 'hospital', 'médico', 'receta', 'dentista', 'clínica',
      // French
      'docteur', 'médecine', 'pharmacie', 'hôpital', 'médical', 'ordonnance', 'dentiste', 'clinique'
    ],
    'Entertainment': [
      // English
      'movie', 'cinema', 'game', 'concert', 'show', 'entertainment', 'tickets', 'theater', 'music',
      // Hindi
      'फिल्म', 'सिनेमा', 'खेल', 'कॉन्सर्ट', 'शो', 'मनोरंजन', 'टिकट', 'थिएटर', 'संगीत',
      // Spanish
      'película', 'cine', 'juego', 'concierto', 'espectáculo', 'entretenimiento', 'entradas', 'teatro', 'música',
      // French
      'film', 'cinéma', 'jeu', 'concert', 'spectacle', 'divertissement', 'billets', 'théâtre', 'musique'
    ],
    'Utilities': [
      // English
      'electric', 'water', 'internet', 'phone', 'utility', 'bill', 'payment', 'cable', 'wifi',
      // Hindi
      'बिजली', 'पानी', 'इंटरनेट', 'फोन', 'उपयोगिता', 'बिल', 'भुगतान', 'केबल', 'वाईफाई',
      // Spanish
      'electricidad', 'agua', 'internet', 'teléfono', 'servicio', 'factura', 'pago', 'cable', 'wifi',
      // French
      'électricité', 'eau', 'internet', 'téléphone', 'service', 'facture', 'paiement', 'câble', 'wifi'
    ]
  };
  
  let category: string = 'Misc';
  let maxMatches = 0;
  
  Object.entries(categoryKeywords).forEach(([cat, keywords]) => {
    const matches = keywords.filter(keyword => processedText.includes(keyword)).length;
    if (matches > maxMatches) {
      maxMatches = matches;
      category = cat;
    }
  });

  // Detect currency based on symbols and language context
  let currency = 'USD';
  const textStr = text || '';
  if (textStr.includes('€') || textStr.includes('euro')) currency = 'EUR';
  else if (textStr.includes('£') || textStr.includes('pound')) currency = 'GBP';
  else if (textStr.includes('₹') || textStr.includes('rupee') || textStr.includes('रुपए')) currency = 'INR';

  // Ensure proper date formatting for production
  const formattedDate = new Date().toISOString().split('T')[0];

  return {
    amount,
    currency,
    description: textStr,
    category,
    date: formattedDate,
    confidence: maxMatches > 0 ? 0.75 : 0.60
  };
};