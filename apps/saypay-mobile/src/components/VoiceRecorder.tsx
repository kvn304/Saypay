import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Animated } from 'react-native';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { transcribeAudio, TranscriptionResult } from '../utils/openai';
import { useLanguage } from '../contexts/LanguageContext';

interface VoiceRecorderProps {
  onTranscription: (result: TranscriptionResult) => void;
  onError: (error: string) => void;
  disabled?: boolean;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  onTranscription,
  onError,
  disabled = false,
}) => {
  const { t } = useLanguage();
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);
  
  const recordingRef = useRef<Audio.Recording | null>(null);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const MAX_RECORDING_TIME = 60000; // 60 seconds max

  // Pulse animation for recording state
  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const stopPulseAnimation = () => {
    pulseAnim.stopAnimation();
    Animated.timing(pulseAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const startRecording = async () => {
    try {
      // Haptic feedback
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      setIsRecording(false);
      setIsProcessing(false);
      setRecordingDuration(0);
      
      // Request permissions
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        onError('Microphone permission is required to record voice expenses');
        return;
      }

      // Configure audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      // Create recording with high-quality settings for production
      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync({
        android: {
          extension: '.m4a',
          outputFormat: 2, // MPEG_4
          audioEncoder: 3, // AAC
          sampleRate: 44100, // High quality sample rate
          numberOfChannels: 2, // Stereo for better quality
          bitRate: 256000, // Higher bitrate for better quality
        },
        ios: {
          extension: '.m4a',
          outputFormat: 1294020454, // MPEG4AAC
          audioQuality: 131072, // HIGH quality
          sampleRate: 44100, // High quality sample rate
          numberOfChannels: 2, // Stereo for better quality
          bitRate: 256000, // Higher bitrate for better quality
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
        web: {
          mimeType: 'audio/webm;codecs=opus',
          bitsPerSecond: 256000, // Higher bitrate for web
        },
      });

      recordingRef.current = recording;
      await recording.startAsync();
      setIsRecording(true);
      
      // Start animations
      startPulseAnimation();
      
      // Start duration timer
      durationIntervalRef.current = setInterval(() => {
        setRecordingDuration(prev => {
          const newDuration = prev + 100;
          if (newDuration >= MAX_RECORDING_TIME) {
            stopRecording();
          }
          return newDuration;
        });
      }, 100);
      
    } catch (error) {
      console.error('Recording start error:', error);
      onError('Failed to start recording. Please try again.');
    }
  };

  const stopRecording = async () => {
    if (!recordingRef.current || !isRecording) return;

    try {
      // Haptic feedback
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      setIsRecording(false);
      setIsProcessing(true);
      
      // Stop animations
      stopPulseAnimation();
      
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
        durationIntervalRef.current = null;
      }

      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI();
      
      if (uri) {
        await handleTranscription(uri);
      } else {
        onError('Failed to save recording');
      }
    } catch (error) {
      console.error('Recording stop error:', error);
      onError('Failed to stop recording');
    } finally {
      recordingRef.current = null;
    }
  };

  const handleTranscription = async (audioUri: string) => {
    try {
      const result = await transcribeAudio(audioUri);
      
      // Check confidence threshold
      if (result.confidence < 0.90) {
        onError(`Low confidence transcription (${(result.confidence * 100).toFixed(0)}%). Please speak more clearly and try again.`);
        setIsProcessing(false);
        return;
      }
      
      onTranscription(result);
    } catch (error) {
      console.error('Transcription error:', error);
      const message = (error instanceof Error ? error.message : 'Unknown error');
      if (/OPENAI_API_KEY/i.test(message) || message.includes('401')) {
        onError('Voice transcription unavailable. Please set OPENAI_API_KEY in your .env and restart the app.');
      } else {
        onError(`Failed to process audio: ${message}`);
      }
    } finally {
      setIsProcessing(false);
      setRecordingDuration(0);
    }
  };

  const handlePress = () => {
    if (disabled || isProcessing) return;
    
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    return `${seconds}s`;
  };

  return (
    <View style={styles.container}>
      <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
        <TouchableOpacity
          style={[
            styles.recordButton,
            isRecording ? styles.recordingButton : styles.idleButton,
            (disabled || isProcessing) && styles.disabledButton
          ]}
          onPress={handlePress}
          disabled={disabled || isProcessing}
        >
          {isProcessing ? (
            <Ionicons name="hourglass" size={40} color="white" />
          ) : isRecording ? (
            <Ionicons name="stop" size={40} color="white" />
          ) : (
            <Ionicons name="mic" size={40} color="white" />
          )}
        </TouchableOpacity>
      </Animated.View>
      
      {isRecording && (
        <View style={styles.durationContainer}>
          <Text style={styles.durationText}>
            {formatDuration(recordingDuration)}
          </Text>
        </View>
      )}

      <View style={styles.instructionContainer}>
        <Text style={styles.instructionTitle}>
          {isProcessing
            ? t('processingWithAI')
            : isRecording
            ? t('recording')
            : t('tapToRecordExpense')}
        </Text>
        
        {isRecording && (
          <Text style={styles.instructionSubtitle}>
            {t('tapWhenFinished')}
          </Text>
        )}
        
        {isProcessing && (
          <Text style={styles.instructionSubtitle}>
            {t('usingOpenAI')}
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  recordButton: {
    width: 144,
    height: 144,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  idleButton: {
    backgroundColor: '#10B981', // SayPay green
  },
  recordingButton: {
    backgroundColor: '#EF4444',
  },
  disabledButton: {
    opacity: 0.5,
  },
  durationContainer: {
    position: 'absolute',
    bottom: 80,
    backgroundColor: '#EF4444',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  durationText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  instructionContainer: {
    marginTop: 32,
    alignItems: 'center',
    maxWidth: 280,
  },
  instructionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#059669', // SayPay dark green
    textAlign: 'center',
    marginBottom: 16,
  },
  instructionSubtitle: {
    fontSize: 16,
    color: '#047857', // SayPay medium green
    textAlign: 'center',
  },
});