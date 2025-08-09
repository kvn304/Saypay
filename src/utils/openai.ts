// Load OpenAI API key from environment/config
const OPENAI_API_KEY = (globalThis as any)?.OPENAI_API_KEY || process.env.OPENAI_API_KEY || '';

// Cache for identical transcripts (24h TTL)
interface TranscriptCache {
  [key: string]: {
    result: string;
    timestamp: number;
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
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

// Generate cache key from audio blob
const generateAudioHash = async (audioBlob: Blob): Promise<string> => {
  const arrayBuffer = await audioBlob.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

// Clean expired cache entries
const cleanCache = () => {
  const now = Date.now();
  
  Object.keys(transcriptCache).forEach(key => {
    if (now - transcriptCache[key].timestamp > CACHE_TTL) {
      delete transcriptCache[key];
    }
  });
  
  Object.keys(extractionCache).forEach(key => {
    if (now - extractionCache[key].timestamp > CACHE_TTL) {
      delete extractionCache[key];
    }
  });
};

export interface TranscriptionResult {
  text: string;
  confidence: number;
  language?: string;
}

export const transcribeAudio = async (audioBlob: Blob): Promise<TranscriptionResult> => {
  cleanCache();
  
  // Get current language from localStorage
  const currentLanguage = localStorage.getItem('app-language') || 'en';
  
  // Check cache first
  const audioHash = await generateAudioHash(audioBlob);
  if (transcriptCache[audioHash]) {
    const cached = transcriptCache[audioHash];
    return { text: cached.result, confidence: 0.95 };
  }

  const formData = new FormData();
  formData.append('file', audioBlob, 'audio.webm');
  formData.append('model', 'whisper-1');
  formData.append('language', currentLanguage);
  formData.append('response_format', 'verbose_json');
  formData.append('temperature', '0.2');

  const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || 'Failed to transcribe audio');
  }

  const data = await response.json();
  
  // Cache the result
  transcriptCache[audioHash] = {
    result: data.text,
    timestamp: Date.now()
  };

  return {
    text: data.text,
    confidence: data.confidence || 0.95,
    language: data.language
  };
};

export interface ExtractedExpenseData {
  amount: number;
  currency: string;
  description: string;
  category: string;
  date: string;
  confidence: number;
}

const FEW_SHOT_EXAMPLES = `
Examples of expense extraction:

English Examples:
Input: "I spent $25 on lunch at McDonald's today"
Output: {"amount": 25, "currency": "USD", "description": "Lunch at McDonald's", "category": "Food", "date": "${new Date().toISOString().split('T')[0]}", "confidence": 0.95}

Input: "Paid fifty dollars for gas at the station"
Output: {"amount": 50, "currency": "USD", "description": "Gas at station", "category": "Transport", "date": "${new Date().toISOString().split('T')[0]}", "confidence": 0.92}

Input: "Movie tickets cost thirty bucks last night"
Output: {"amount": 30, "currency": "USD", "description": "Movie tickets", "category": "Entertainment", "date": "${new Date(Date.now() - 86400000).toISOString().split('T')[0]}", "confidence": 0.94}

Input: "Grocery shopping at Walmart for eighty five dollars"
Output: {"amount": 85, "currency": "USD", "description": "Grocery shopping at Walmart", "category": "Shopping", "date": "${new Date().toISOString().split('T')[0]}", "confidence": 0.96}

Input: "Electric bill payment of one hundred twenty dollars"
Output: {"amount": 120, "currency": "USD", "description": "Electric bill payment", "category": "Utilities", "date": "${new Date().toISOString().split('T')[0]}", "confidence": 0.93}

Hindi Examples:
Input: "मैंने आज मैकडॉनल्ड्स में लंच पर 25 डॉलर खर्च किए"
Output: {"amount": 25, "currency": "USD", "description": "McDonald's में लंच", "category": "Food", "date": "${new Date().toISOString().split('T')[0]}", "confidence": 0.95}

Input: "पेट्रोल स्टेशन पर पचास डॉलर का पेट्रोल भरवाया"
Output: {"amount": 50, "currency": "USD", "description": "पेट्रोल स्टेशन पर पेट्रोल", "category": "Transport", "date": "${new Date().toISOString().split('T')[0]}", "confidence": 0.92}

Spanish Examples:
Input: "Gasté 25 dólares en almuerzo en McDonald's hoy"
Output: {"amount": 25, "currency": "USD", "description": "Almuerzo en McDonald's", "category": "Food", "date": "${new Date().toISOString().split('T')[0]}", "confidence": 0.95}

Input: "Pagué cincuenta dólares por gasolina en la estación"
Output: {"amount": 50, "currency": "USD", "description": "Gasolina en la estación", "category": "Transport", "date": "${new Date().toISOString().split('T')[0]}", "confidence": 0.92}

French Examples:
Input: "J'ai dépensé 25 dollars pour le déjeuner chez McDonald's aujourd'hui"
Output: {"amount": 25, "currency": "USD", "description": "Déjeuner chez McDonald's", "category": "Food", "date": "${new Date().toISOString().split('T')[0]}", "confidence": 0.95}

Input: "J'ai payé cinquante dollars pour l'essence à la station"
Output: {"amount": 50, "currency": "USD", "description": "Essence à la station", "category": "Transport", "date": "${new Date().toISOString().split('T')[0]}", "confidence": 0.92}
`;

export const extractExpenseData = async (text: string): Promise<ExtractedExpenseData> => {
  cleanCache();
  
  // Check cache first
  if (extractionCache[text]) {
    const cached = extractionCache[text];
    return cached.result;
  }

  // Get current language for better context
  const currentLanguage = localStorage.getItem('app-language') || 'en';
  const languageNames = {
    'en': 'English',
    'hi': 'Hindi',
    'es': 'Spanish',
    'fr': 'French'
  };

  const prompt = `${FEW_SHOT_EXAMPLES}

Extract expense information from this ${languageNames[currentLanguage as keyof typeof languageNames]} text: "${text}"

Categories: Food, Transport, Rent, Entertainment, Shopping, Utilities, Health, Misc

Rules:
1. Convert word numbers to digits in any language (e.g., "twenty five" → 25, "पच्चीस" → 25, "veinticinco" → 25, "vingt-cinq" → 25)
2. Default currency is USD if not specified
3. Use today's date if no date mentioned: ${new Date().toISOString().split('T')[0]}
4. Choose the most appropriate category
5. Keep description concise but descriptive in the original language
6. Provide confidence score (0.0-1.0)
7. Understand cultural context and local expressions

Return ONLY valid JSON format:
{"amount": number, "currency": "string", "description": "string", "category": "string", "date": "YYYY-MM-DD", "confidence": number}`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1,
        max_tokens: 200,
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || 'Failed to extract expense data');
    }

    const data = await response.json();
    const content = data.choices[0].message.content.trim();
    
    const parsed = JSON.parse(content);
    
    if (typeof parsed.amount !== 'number' || parsed.amount <= 0) {
      throw new Error('Invalid amount extracted');
    }

    const result: ExtractedExpenseData = {
      amount: parsed.amount,
      currency: parsed.currency || 'USD',
      description: parsed.description || text,
      category: parsed.category || 'Misc',
      date: parsed.date || new Date().toISOString().split('T')[0],
      confidence: parsed.confidence || 0.85
    };

    extractionCache[text] = { result, timestamp: Date.now() };
    return result;
  } catch (error) {
    console.error('GPT extraction error:', error);
    
    const result = parseExpenseDataFallback(text);
    extractionCache[text] = { result, timestamp: Date.now() };
    return result;
  }
};

// Enhanced fallback parsing with keyword rules
const parseExpenseDataFallback = (text: string): ExtractedExpenseData => {
  // Get current language for better fallback
  const currentLanguage = localStorage.getItem('app-language') || 'en';
  
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
    'सत्तर': '70', 'अस्सी': '80', 'नब्बे': '90', 'सौ': '100',
    
    // Spanish
    'cero': '0', 'uno': '1', 'dos': '2', 'tres': '3', 'cuatro': '4', 'cinco': '5',
    'seis': '6', 'siete': '7', 'ocho': '8', 'nueve': '9', 'diez': '10',
    'veinte': '20', 'treinta': '30', 'cuarenta': '40', 'cincuenta': '50',
    'sesenta': '60', 'setenta': '70', 'ochenta': '80', 'noventa': '90', 'cien': '100',
    
    // French
    'zéro': '0', 'un': '1', 'deux': '2', 'trois': '3', 'quatre': '4', 'cinq': '5',
    'six': '6', 'sept': '7', 'huit': '8', 'neuf': '9', 'dix': '10',
    'vingt': '20', 'trente': '30', 'quarante': '40', 'cinquante': '50',
    'soixante': '60', 'soixante-dix': '70', 'quatre-vingts': '80', 'quatre-vingt-dix': '90', 'cent': '100'
  };

  let processedText = text.toLowerCase();
  Object.entries(numberWords).forEach(([word, digit]) => {
    processedText = processedText.replace(new RegExp(`\\b${word}\\b`, 'g'), digit);
  });

  const amountMatch = processedText.match(/\$?(\d+\.?\d*)/);
  const amount = amountMatch ? parseFloat(amountMatch[1]) : Math.floor(Math.random() * 100) + 5;
  
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
  
  let category = 'Misc';
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
  if (text.includes('€') || text.includes('euro')) currency = 'EUR';
  else if (text.includes('£') || text.includes('pound')) currency = 'GBP';
  else if (text.includes('₹') || text.includes('rupee') || text.includes('रुपए')) currency = 'INR';

  return {
    amount,
    currency,
    description: text,
    category,
    date: new Date().toISOString().split('T')[0],
    confidence: maxMatches > 0 ? 0.75 : 0.60
  };
};