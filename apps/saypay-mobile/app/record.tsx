import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { VoiceRecorder } from '../src/components/VoiceRecorder';
import { extractExpenseData, ExtractedExpenseData, TranscriptionResult } from '../src/utils/openai';
import { EXPENSE_CATEGORIES } from '../src/types/expense';
import { useExpenses } from '../src/hooks/useExpenses';
import { useLanguage } from '../src/contexts/LanguageContext';

export default function RecordScreen() {
  const { addExpense } = useExpenses();
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
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }).start();
  }, []);

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
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      if (!expenseData.amount || parseFloat(expenseData.amount) <= 0) {
        Alert.alert(t('error'), 'Please enter a valid amount');
        return;
      }
      
      if (!expenseData.description.trim()) {
        Alert.alert(t('error'), 'Please enter a description');
        return;
      }
      
      const expense = {
        amount: parseFloat(expenseData.amount),
        description: expenseData.description.trim(),
        category: expenseData.category,
        date: expenseData.date,
      };

      await addExpense(expense);
      Alert.alert(t('success'), 'Expense saved successfully!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      console.error('Save error:', error);
      Alert.alert(t('error'), 'Failed to save expense. Please try again.');
    }
  };

  const handleRetry = () => {
    setTranscription(null);
    setExtractedData(null);
    setShowEditForm(false);
    setError(null);
  };

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.back();
            }}
          >
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </TouchableOpacity>
          
          <View style={styles.headerTitleContainer}>
            <View style={styles.headerLogo}>
              <Ionicons name="mic" size={16} color="white" />
            </View>
            <Text style={styles.headerTitle}>{t('voiceExpense')}</Text>
          </View>
          
          {showEditForm && (
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                handleRetry();
              }}
            >
              <Ionicons name="refresh" size={24} color="white" />
            </TouchableOpacity>
          )}
          
          {!showEditForm && <View style={styles.headerSpacer} />}
        </View>

        {/* Error Display */}
        {error && (
          <View style={styles.errorContainer}>
            <Ionicons name="warning" size={20} color="#EF4444" />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={() => setError(null)}>
              <Text style={styles.dismissButton}>Dismiss</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Recording Interface */}
        {!showEditForm && (
          <View style={styles.recordingContainer}>
            <VoiceRecorder
              onTranscription={handleTranscription}
              onError={handleError}
              disabled={isExtracting}
            />
            
            {/* Transcription Display */}
            {transcription && (
              <View style={styles.transcriptionContainer}>
                <View style={styles.transcriptionHeader}>
                  <Text style={styles.transcriptionTitle}>{t('transcription')}</Text>
                  <View style={styles.confidenceBadge}>
                    <Text style={styles.confidenceText}>
                      {(transcription.confidence * 100).toFixed(0)}%
                    </Text>
                  </View>
                </View>
                <Text style={styles.transcriptionText}>
                  "{transcription.text}"
                </Text>
                {isExtracting && (
                  <View style={styles.extractingContainer}>
                    <Ionicons name="hourglass" size={16} color="#6B7280" />
                    <Text style={styles.extractingText}>Extracting expense data with AI...</Text>
                  </View>
                )}
              </View>
            )}
          </View>
        )}

        {/* Edit Form */}
        {showEditForm && extractedData && (
          <ScrollView style={styles.editForm}>
            <View style={styles.formContainer}>
              <View style={styles.formHeader}>
                <Ionicons name="create" size={20} color="#10B981" />
                <Text style={styles.formTitle}>{t('reviewAndEdit')}</Text>
                <View style={styles.confidenceBadge}>
                  <Text style={styles.confidenceText}>
                    {t('aiConfidence')}: {(extractedData.confidence * 100).toFixed(0)}%
                  </Text>
                </View>
              </View>

              {/* Original transcription */}
              {transcription && (
                <View style={styles.originalContainer}>
                  <Text style={styles.originalLabel}>{t('original')}:</Text>
                  <Text style={styles.originalText}>"{transcription.text}"</Text>
                </View>
              )}

              {/* Amount & Currency */}
              <View style={styles.inputRow}>
                <View style={styles.amountContainer}>
                  <Text style={styles.inputLabel}>{t('amount')}</Text>
                  <TextInput
                    style={styles.textInput}
                    value={expenseData.amount}
                    onChangeText={(text) => setExpenseData({ ...expenseData, amount: text })}
                    placeholder="0.00"
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.currencyContainer}>
                  <Text style={styles.inputLabel}>{t('currency')}</Text>
                  <View style={styles.pickerContainer}>
                    <Text style={styles.pickerText}>{expenseData.currency}</Text>
                  </View>
                </View>
              </View>

              {/* Description */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>{t('description')}</Text>
                <TextInput
                  style={styles.textInput}
                  value={expenseData.description}
                  onChangeText={(text) => setExpenseData({ ...expenseData, description: text })}
                  placeholder="What did you spend on?"
                  multiline
                />
              </View>

              {/* Category */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>{t('category')}</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
                  {EXPENSE_CATEGORIES.map((cat) => (
                    <TouchableOpacity
                      key={cat.name}
                      style={[
                        styles.categoryButton,
                        expenseData.category === cat.name && styles.selectedCategory
                      ]}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setExpenseData({ ...expenseData, category: cat.name });
                      }}
                    >
                      <Text style={styles.categoryEmoji}>{cat.icon}</Text>
                      <Text style={[
                        styles.categoryName,
                        expenseData.category === cat.name && styles.selectedCategoryName
                      ]}>
                        {cat.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Date */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>{t('date')}</Text>
                <TextInput
                  style={styles.textInput}
                  value={expenseData.date}
                  onChangeText={(text) => setExpenseData({ ...expenseData, date: text })}
                  placeholder="YYYY-MM-DD"
                />
              </View>

              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={styles.secondaryButton}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    handleRetry();
                  }}
                >
                  <Text style={styles.secondaryButtonText}>{t('recordAgain')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={handleSaveExpense}
                >
                  <Ionicons name="checkmark" size={20} color="white" />
                  <Text style={styles.primaryButtonText}>{t('saveExpense')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        )}
      </SafeAreaView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: 'white',
  },
  backButton: {
    width: 44,
    height: 44,
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerLogo: {
    width: 24,
    height: 24,
    backgroundColor: '#10B981',
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#10B981',
  },
  retryButton: {
    width: 44,
    height: 44,
    backgroundColor: '#10B981',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerSpacer: {
    width: 44,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    margin: 24,
  },
  errorText: {
    flex: 1,
    color: '#DC2626',
    fontSize: 16,
    marginLeft: 12,
  },
  dismissButton: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  recordingContainer: {
    flex: 1,
    paddingHorizontal: 24,
  },
  transcriptionContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    margin: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  transcriptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  transcriptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  confidenceBadge: {
    backgroundColor: '#EDE9FE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  confidenceText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#7C3AED',
  },
  transcriptionText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  extractingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  extractingText: {
    fontSize: 16,
    color: '#6B7280',
    marginLeft: 8,
  },
  editForm: {
    flex: 1,
  },
  formContainer: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 32,
    margin: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  formHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginLeft: 8,
  },
  originalContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  originalLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    marginBottom: 8,
  },
  originalText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },
  inputRow: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  amountContainer: {
    flex: 2,
    marginRight: 12,
  },
  currencyContainer: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  textInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: '#1F2937',
  },
  pickerContainer: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickerText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  categoryScroll: {
    flexDirection: 'row',
  },
  categoryButton: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginRight: 12,
    minWidth: 80,
  },
  selectedCategory: {
    backgroundColor: '#ECFDF5',
    borderColor: '#10B981',
  },
  categoryEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  categoryName: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
  },
  selectedCategoryName: {
    color: '#059669',
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: 32,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginRight: 16,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#10B981',
    paddingVertical: 16,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 8,
  },
});