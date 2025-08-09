import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useAuth } from '../src/contexts/AuthContext';
import { useUser } from '../src/contexts/UserContext';
import { useLanguage } from '../src/contexts/LanguageContext';
import { useExpenses } from '../src/hooks/useExpenses';
import { EXPENSE_CATEGORIES } from '../src/types/expense';

export default function HomeScreen() {
  const { user: authUser } = useAuth();
  const { user } = useUser();
  const { t } = useLanguage();
  const { expenses, isLoading } = useExpenses();
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(true);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authUser && !isLoading) {
      router.replace('/login');
    }
  }, [authUser, isLoading]);

  if (!authUser) {
    return null; // Will redirect to login
  }

  const currentMonth = new Date().toISOString().slice(0, 7);
  const currentMonthExpenses = expenses.filter(expense => 
    expense.date.startsWith(currentMonth)
  );

  const totalAmount = currentMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  
  const recentExpenses = [...expenses]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const getCategoryIcon = (category: string) => {
    const cat = EXPENSE_CATEGORIES.find(c => c.name === category);
    return cat ? cat.icon : '📦';
  };

  const handleRecordExpense = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/record');
  };

  const currentMonthName = new Date().toLocaleDateString('en-US', { 
    month: 'long', 
    year: 'numeric' 
  });

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.logoContainer}>
              <Ionicons name="mic" size={24} color="white" />
            </View>
            <View style={styles.headerText}>
              <Text style={styles.appName}>SayPay</Text>
              <Text style={styles.greeting}>
                {t('hello')}, {user?.name?.split(' ')[0] || 'User'}!
              </Text>
              <Text style={styles.subtitle}>{t('trackExpenses')}</Text>
            </View>
          </View>
          
          <View style={styles.headerActions}>
            <View style={styles.statusIndicator}>
              <Ionicons name="wifi" size={16} color="#10B981" />
            </View>
          </View>
        </View>

        {/* Monthly Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <Ionicons name="trending-up" size={20} color="white" />
            <Text style={styles.summaryMonth}>{currentMonthName}</Text>
          </View>
          
          <View style={styles.summaryAmount}>
            <Text style={styles.summaryLabel}>{t('totalSpent')}</Text>
            <Text style={styles.summaryValue}>${totalAmount.toFixed(2)}</Text>
          </View>
        </View>

        {/* Voice Recording Button */}
        <View style={styles.recordingSection}>
          <TouchableOpacity
            style={styles.recordButton}
            onPress={handleRecordExpense}
          >
            <Ionicons name="mic" size={32} color="white" />
          </TouchableOpacity>
          
          <View style={styles.recordingInstructions}>
            <Text style={styles.recordingTitle}>{t('tapToRecord')}</Text>
            <Text style={styles.recordingSubtitle}>{t('voiceYourExpense')}</Text>
          </View>

          {/* Manual Entry Button */}
          <TouchableOpacity
            style={styles.manualButton}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              router.push('/manual-entry');
            }}
          >
            <Ionicons name="add" size={24} color="#10B981" />
            <Text style={styles.manualButtonText}>Add Manually</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Expenses */}
        <View style={styles.recentSection}>
          <View style={styles.recentHeader}>
            <Text style={styles.recentTitle}>{t('recentExpenses')}</Text>
            <TouchableOpacity onPress={() => router.push('/reports')}>
              <Text style={styles.viewAllButton}>{t('viewAll')}</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.expensesList}>
            {recentExpenses.length > 0 ? (
              recentExpenses.map((expense) => (
                <TouchableOpacity
                  key={expense.id}
                  style={styles.expenseItem}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    router.push(`/expense/${expense.id}`);
                  }}
                >
                  <View style={styles.expenseIcon}>
                    <Text style={styles.expenseEmoji}>{getCategoryIcon(expense.category)}</Text>
                  </View>
                  <View style={styles.expenseDetails}>
                    <View style={styles.expenseHeader}>
                      <Text style={styles.expenseAmount}>${expense.amount.toFixed(2)}</Text>
                      <View style={styles.categoryBadge}>
                        <Text style={styles.categoryText}>{expense.category}</Text>
                      </View>
                    </View>
                    <Text style={styles.expenseDescription} numberOfLines={1}>
                      {expense.description}
                    </Text>
                    <Text style={styles.expenseDate}>
                      {new Date(expense.date).toLocaleDateString()}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="add-circle-outline" size={64} color="#D1D5DB" />
                <Text style={styles.emptyTitle}>{t('noExpensesYet')}</Text>
                <Text style={styles.emptySubtitle}>{t('startRecording')}</Text>
              </View>
            )}
          </ScrollView>
        </View>

        {/* Bottom Navigation */}
        <View style={styles.bottomNav}>
          <TouchableOpacity style={[styles.navItem, styles.activeNavItem]} onPress={() => router.push('/')}>
            <Ionicons name="home" size={24} color="#10B981" />
            <Text style={[styles.navLabel, styles.activeNavLabel]}>{t('home')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem} onPress={() => router.push('/record')}>
            <Ionicons name="mic" size={24} color="#6B7280" />
            <Text style={styles.navLabel}>{t('record')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem} onPress={() => router.push('/reports')}>
            <Ionicons name="bar-chart" size={24} color="#6B7280" />
            <Text style={styles.navLabel}>{t('reports')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem} onPress={() => router.push('/settings')}>
            <Ionicons name="settings" size={24} color="#6B7280" />
            <Text style={styles.navLabel}>{t('settings')}</Text>
          </TouchableOpacity>
        </View>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: 'white',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoContainer: {
    width: 48,
    height: 48,
    backgroundColor: '#10B981', // SayPay green
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  appName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#10B981',
    marginBottom: 2,
  },
  logoEmoji: {
    fontSize: 24,
  },
  headerText: {
    flex: 1,
  },
  greeting: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 32,
    height: 32,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryCard: {
    margin: 24,
    padding: 24,
    backgroundColor: '#10B981', // SayPay green
    borderRadius: 16,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  summaryMonth: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  summaryAmount: {
    marginBottom: 16,
  },
  summaryLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
  },
  summaryValue: {
    color: 'white',
    fontSize: 32,
    fontWeight: 'bold',
  },
  recordingSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  recordButton: {
    width: 96,
    height: 96,
    backgroundColor: '#10B981',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  recordingInstructions: {
    marginTop: 24,
    alignItems: 'center',
  },
  recordingTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  recordingSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  manualButton: {
    marginTop: 24,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  manualButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#10B981',
    marginLeft: 8,
  },
  recentSection: {
    paddingHorizontal: 24,
    paddingBottom: 100, // Space for bottom nav
    backgroundColor: 'white',
  },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  recentTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  viewAllButton: {
    fontSize: 14,
    fontWeight: '500',
    color: '#8B5CF6',
  },
  expensesList: {
    maxHeight: 300,
  },
  expenseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  expenseIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  expenseEmoji: {
    fontSize: 18,
  },
  expenseDetails: {
    flex: 1,
  },
  expenseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  expenseAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  categoryBadge: {
    backgroundColor: '#EDE9FE',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#7C3AED',
  },
  expenseDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  expenseDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyTitle: {
    fontSize: 16,
    color: '#9CA3AF',
    marginTop: 16,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#D1D5DB',
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingVertical: 8,
    paddingHorizontal: 24,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  activeNavItem: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
  },
  navLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
    marginTop: 4,
  },
  activeNavLabel: {
    color: '#10B981', // SayPay green
  },
});