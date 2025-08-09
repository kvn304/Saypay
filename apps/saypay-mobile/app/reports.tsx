import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useExpenses } from '../src/hooks/useExpenses';
import { EXPENSE_CATEGORIES } from '../src/types/expense';

const { width } = Dimensions.get('window');

export default function ReportsScreen() {
  const { expenses } = useExpenses();
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

  const monthExpenses = expenses.filter(expense => 
    expense.date.startsWith(selectedMonth)
  );

  const totalAmount = monthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  
  const categoryData = EXPENSE_CATEGORIES.map(category => {
    const amount = monthExpenses
      .filter(expense => expense.category === category.name)
      .reduce((sum, expense) => sum + expense.amount, 0);
    
    return {
      name: category.name,
      value: amount,
      icon: category.icon,
      color: category.color,
      percentage: totalAmount > 0 ? (amount / totalAmount) * 100 : 0
    };
  }).filter(item => item.value > 0);

  const selectedMonthName = new Date(selectedMonth + '-01').toLocaleDateString('en-US', { 
    month: 'long', 
    year: 'numeric' 
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Reports & Analytics</Text>
        
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content}>
        {/* Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <Ionicons name="trending-up" size={24} color="white" />
            <Text style={styles.summaryMonth}>{selectedMonthName}</Text>
          </View>
          <Text style={styles.summaryAmount}>${totalAmount.toFixed(2)}</Text>
          <Text style={styles.summaryTransactions}>
            {monthExpenses.length} transaction{monthExpenses.length !== 1 ? 's' : ''}
          </Text>
        </View>

        {/* Category Breakdown */}
        {categoryData.length > 0 ? (
          <View style={styles.categoryCard}>
            <Text style={styles.cardTitle}>Spending by Category</Text>
            
            <View style={styles.categoryList}>
              {categoryData.map((category, index) => (
                <View key={category.name} style={styles.categoryItem}>
                  <View style={styles.categoryLeft}>
                    <View 
                      style={[styles.categoryColorDot, { backgroundColor: category.color }]}
                    />
                    <Text style={styles.categoryEmoji}>{category.icon}</Text>
                    <Text style={styles.categoryName}>{category.name}</Text>
                  </View>
                  <View style={styles.categoryRight}>
                    <Text style={styles.categoryAmount}>${category.value.toFixed(2)}</Text>
                    <Text style={styles.categoryPercentage}>
                      {category.percentage.toFixed(1)}%
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        ) : (
          <View style={styles.emptyCard}>
            <Ionicons name="pie-chart-outline" size={64} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>No expenses for this month</Text>
            <Text style={styles.emptySubtitle}>Start recording to see your spending breakdown</Text>
          </View>
        )}

        {/* Recent Transactions */}
        <View style={styles.transactionsCard}>
          <Text style={styles.cardTitle}>Recent Transactions</Text>
          
          {monthExpenses.length > 0 ? (
            <View style={styles.transactionsList}>
              {monthExpenses.slice(0, 10).map((expense) => (
                <TouchableOpacity
                  key={expense.id}
                  style={styles.transactionItem}
                  onPress={() => router.push(`/expense/${expense.id}`)}
                >
                  <View style={styles.transactionLeft}>
                    <View style={styles.transactionIcon}>
                      <Text style={styles.transactionEmoji}>
                        {EXPENSE_CATEGORIES.find(c => c.name === expense.category)?.icon || '📦'}
                      </Text>
                    </View>
                    <View style={styles.transactionDetails}>
                      <Text style={styles.transactionDescription} numberOfLines={1}>
                        {expense.description}
                      </Text>
                      <Text style={styles.transactionDate}>
                        {new Date(expense.date).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.transactionRight}>
                    <Text style={styles.transactionAmount}>
                      ${expense.amount.toFixed(2)}
                    </Text>
                    <Text style={styles.transactionCategory}>
                      {expense.category}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={styles.emptyTransactions}>
              <Text style={styles.emptyTransactionsText}>No transactions this month</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/')}>
          <Ionicons name="home" size={24} color="#6B7280" />
          <Text style={styles.navLabel}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/record')}>
          <Ionicons name="mic" size={24} color="#6B7280" />
          <Text style={styles.navLabel}>Record</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.navItem, styles.activeNavItem]} onPress={() => router.push('/reports')}>
          <Ionicons name="bar-chart" size={24} color="#8B5CF6" />
          <Text style={[styles.navLabel, styles.activeNavLabel]}>Reports</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/settings')}>
          <Ionicons name="settings" size={24} color="#6B7280" />
          <Text style={styles.navLabel}>Settings</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
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
    width: 40,
    height: 40,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingBottom: 100,
  },
  summaryCard: {
    backgroundColor: '#8B5CF6',
    margin: 24,
    padding: 24,
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
    fontWeight: '600',
    marginLeft: 8,
  },
  summaryAmount: {
    color: 'white',
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  summaryTransactions: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
  },
  categoryCard: {
    backgroundColor: 'white',
    marginHorizontal: 24,
    marginBottom: 24,
    padding: 24,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  categoryList: {
    gap: 12,
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryColorDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 12,
  },
  categoryEmoji: {
    fontSize: 18,
    marginRight: 12,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
    flex: 1,
  },
  categoryRight: {
    alignItems: 'flex-end',
  },
  categoryAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  categoryPercentage: {
    fontSize: 14,
    color: '#6B7280',
  },
  emptyCard: {
    backgroundColor: 'white',
    marginHorizontal: 24,
    marginBottom: 24,
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  emptyTitle: {
    fontSize: 16,
    color: '#9CA3AF',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#D1D5DB',
    textAlign: 'center',
  },
  transactionsCard: {
    backgroundColor: 'white',
    marginHorizontal: 24,
    marginBottom: 24,
    padding: 24,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  transactionsList: {
    gap: 12,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  transactionEmoji: {
    fontSize: 18,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: 14,
    color: '#6B7280',
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  transactionCategory: {
    fontSize: 12,
    color: '#6B7280',
  },
  emptyTransactions: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyTransactionsText: {
    fontSize: 16,
    color: '#9CA3AF',
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
    color: '#8B5CF6',
  },
});