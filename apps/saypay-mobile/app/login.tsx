import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useAuth } from '../src/contexts/AuthContext';
import { useLanguage } from '../src/contexts/LanguageContext';

export default function LoginScreen() {
  const { signIn, signUp, loading, resendVerificationEmail, sendEmailOtp, verifyEmailOtp, resetPassword } = useAuth();
  const { t } = useLanguage();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [useOtp, setUseOtp] = useState(false);
  const [otp, setOtp] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 1000, useNativeDriver: true }).start();
  }, []);

  const handleSubmit = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    if (!email || !password || (!isLogin && !fullName)) {
      Alert.alert(t('error'), 'Please fill in all fields');
      return;
    }

    setIsSubmitting(true);

    try {
      if (isLogin) {
        if (useOtp) {
          if (!otp) {
            Alert.alert(t('error'), 'Enter the code sent to your email');
            return;
          }
          const { error } = await verifyEmailOtp(email, otp);
          if (error) {
            Alert.alert('Login Failed', error.message || 'Invalid code');
          } else {
            router.replace('/');
          }
          return;
        }
        const { error } = await signIn(email, password);
        
        if (error) {
          Alert.alert('Login Failed', error.message || 'Login failed. Please try again.');
        } else {
          router.replace('/');
        }
      } else {
        const { error, needsVerification } = await signUp(email, password, fullName);
        
        if (error) {
          Alert.alert('Registration Failed', error.message || 'Registration failed. Please try again.');
        } else {
          if (needsVerification) {
            Alert.alert(
              t('success'),
              'Please verify your email. We just sent a link to your inbox.',
              [
                { text: 'Resend Email', onPress: async () => { await resendVerificationEmail(email); } },
                { text: 'OK', onPress: () => { setIsLogin(true); setPassword(''); } },
              ]
            );
          } else {
            router.replace('/');
          }
        }
      }
    } catch (err) {
      console.error('Authentication error:', err);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView 
          style={styles.content}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          {/* Logo */}
          <View style={styles.logoSection}>
            <View style={styles.logoContainer}>
              <Ionicons name="mic" size={40} color="white" />
            </View>
            <Text style={styles.appName}>SayPay</Text>
            <Text style={styles.tagline}>{t('trackExpenses')}</Text>
          </View>

          {/* Toggle Login/Register */}
          <View style={styles.toggleContainer}>
            <TouchableOpacity
              style={[styles.toggleButton, isLogin && styles.activeToggle]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setIsLogin(true);
              }}
            >
              <Text style={[styles.toggleText, isLogin && styles.activeToggleText]}>
                {t('login')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleButton, !isLogin && styles.activeToggle]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setIsLogin(false);
              }}
            >
              <Text style={[styles.toggleText, !isLogin && styles.activeToggleText]}>
                {t('register')}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Login method toggle */}
          {isLogin && (
            <View style={[styles.toggleContainer, { marginTop: -16 }]}>
              <TouchableOpacity
                style={[styles.toggleButton, !useOtp && styles.activeToggle]}
                onPress={() => { setUseOtp(false); setOtp(''); }}
              >
                <Text style={[styles.toggleText, !useOtp && styles.activeToggleText]}>Password</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.toggleButton, useOtp && styles.activeToggle]}
                onPress={async () => {
                  if (!email) { Alert.alert(t('error'), 'Enter your email first'); return; }
                  setUseOtp(true);
                  await sendEmailOtp(email);
                  Alert.alert('Check Email', 'We sent you a 6-digit code.');
                }}
              >
                <Text style={[styles.toggleText, useOtp && styles.activeToggleText]}>Email Code</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Form */}
          <View style={styles.form}>
            {/* Full Name (Register only) */}
            {!isLogin && (
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>{t('fullName')}</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="person" size={20} color="#9CA3AF" style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    value={fullName}
                    onChangeText={setFullName}
                    placeholder={`Enter your ${t('fullName').toLowerCase()}`}
                    autoCapitalize="words"
                  />
                </View>
              </View>
            )}

            {/* Email Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>{t('email')}</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="mail" size={20} color="#9CA3AF" style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  value={email}
                  onChangeText={setEmail}
                  placeholder={`Enter your ${t('email').toLowerCase()}`}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            {/* Password or OTP Input */}
            {(!isLogin || !useOtp) ? (
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>{t('password')}</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="lock-closed" size={20} color="#9CA3AF" style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    value={password}
                    onChangeText={setPassword}
                    placeholder={`Enter your ${t('password').toLowerCase()}`}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <TouchableOpacity
                    style={styles.passwordToggle}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setShowPassword(!showPassword);
                    }}
                  >
                    <Ionicons 
                      name={showPassword ? "eye-off" : "eye"} 
                      size={20} 
                      color="#9CA3AF" 
                    />
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Email Code</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="key" size={20} color="#9CA3AF" style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    value={otp}
                    onChangeText={setOtp}
                    placeholder="Enter 6-digit code"
                    keyboardType="number-pad"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
              </View>
            )}

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.submitButton, (isSubmitting || loading) && styles.disabledButton]}
              onPress={handleSubmit}
              disabled={isSubmitting || loading}
            >
              <Text style={styles.submitButtonText}>
                {isSubmitting ? (isLogin ? `${t('signIn')}...` : `${t('createAccount')}...`) : (isLogin ? t('signIn') : t('createAccount'))}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Powered by Supabase • Secure & Real-time
            </Text>
          </View>
        </KeyboardAvoidingView>
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
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoContainer: {
    width: 80,
    height: 80,
    backgroundColor: '#10B981', // SayPay green
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    padding: 4,
    marginBottom: 32,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderRadius: 12,
  },
  activeToggle: {
    backgroundColor: '#10B981', // SayPay green
  },
  toggleText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  activeToggleText: {
    color: 'white',
  },
  form: {
    marginBottom: 32,
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
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
  },
  passwordToggle: {
    padding: 4,
  },
  submitButton: {
    backgroundColor: '#10B981', // SayPay green
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  disabledButton: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
});