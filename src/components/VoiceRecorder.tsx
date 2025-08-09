import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mic, MicOff, Loader2 } from 'lucide-react';
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
  const [audioLevel, setAudioLevel] = useState(0);
  const [recordingDuration, setRecordingDuration] = useState(0);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const MAX_RECORDING_TIME = 60000; // 60 seconds max

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (durationIntervalRef.current) clearInterval(durationIntervalRef.current);
      stopAudioAnalysis();
    };
  }, []);

  const startAudioAnalysis = (stream: MediaStream) => {
    try {
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      
      analyserRef.current.fftSize = 256;
      source.connect(analyserRef.current);
      
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      
      const checkAudioLevel = () => {
        if (!analyserRef.current || !isRecording) return;
        
        analyserRef.current.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
        const normalizedLevel = average / 255;
        
        setAudioLevel(normalizedLevel);
        
        if (isRecording) {
          requestAnimationFrame(checkAudioLevel);
        }
      };
      
      checkAudioLevel();
    } catch (error) {
      console.warn('Audio analysis not available:', error);
    }
  };

  const stopAudioAnalysis = () => {
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    analyserRef.current = null;
    setAudioLevel(0);
  };

  const startRecording = useCallback(async () => {
    try {
      setIsRecording(false);
      setIsProcessing(false);
      setRecordingDuration(0);
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 16000, // Optimal for Whisper
          channelCount: 1, // Mono
        }
      });
      
      streamRef.current = stream;
      
      // Start audio level analysis
      startAudioAnalysis(stream);
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus',
        audioBitsPerSecond: 16000 // Optimize for speech
      });
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        handleTranscription(audioBlob);
        
        // Clean up stream
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
        stopAudioAnalysis();
      };

      mediaRecorder.start(100); // Collect data every 100ms
      setIsRecording(true);
      
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
      console.error('Microphone access error:', error);
      onError('Failed to access microphone. Please check permissions and try again.');
    }
  }, [onError]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsProcessing(true);
      
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
        durationIntervalRef.current = null;
      }
    }
  }, [isRecording]);

  const handleTranscription = async (audioBlob: Blob) => {
    try {
      const result = await transcribeAudio(audioBlob);
      
      // Check confidence threshold
      if (result.confidence < 0.90) {
        onError(`Low confidence transcription (${(result.confidence * 100).toFixed(0)}%). Please speak more clearly and try again.`);
        setIsProcessing(false);
        return;
      }
      
      onTranscription(result);
    } catch (error) {
      console.error('Transcription error:', error);
      onError(`Failed to process audio: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
      setRecordingDuration(0);
    }
  };

  const handleClick = () => {
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
    <div className="flex flex-col items-center space-y-6">
      <div className="relative">
        <motion.div
          onClick={handleClick}
          disabled={disabled || isProcessing}
          whileHover={{ scale: disabled || isProcessing ? 1 : 1.05 }}
          whileTap={{ scale: disabled || isProcessing ? 1 : 0.95 }}
          className={`relative w-36 h-36 rounded-3xl flex items-center justify-center transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-opacity-50 cursor-pointer touch-target ${
            isRecording
              ? 'bg-gradient-to-br from-red-500 via-pink-500 to-red-600 hover:from-red-600 hover:via-pink-600 hover:to-red-700 shadow-2xl shadow-red-500/40 focus:ring-red-500'
              : 'bg-gradient-to-br from-emerald-500 via-green-500 to-teal-500 hover:from-emerald-600 hover:via-green-600 hover:to-teal-600 shadow-2xl shadow-emerald-500/40 focus:ring-emerald-500'
          } ${disabled || isProcessing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          {/* Glow Effect */}
          <div className={`absolute inset-0 rounded-3xl blur-xl opacity-30 animate-pulse ${
            isRecording ? 'bg-gradient-to-br from-red-500 to-pink-500' : 'bg-gradient-to-br from-emerald-500 to-green-500'
          }`}></div>
          
          {isProcessing ? (
            <Loader2 className="w-14 h-14 text-white animate-spin z-10" />
          ) : isRecording ? (
            <MicOff className="w-14 h-14 text-white z-10" />
          ) : (
            <Mic className="w-14 h-14 text-white z-10" />
          )}
          
          {/* Audio level visualization */}
          {isRecording && (
            <motion.div
              animate={{ scale: 1 + audioLevel * 0.5 }}
              className="absolute inset-0 rounded-3xl bg-red-500/20"
            />
          )}
          
          {/* Recording pulse animation */}
          {isRecording && (
            <>
              <motion.div
                animate={{ scale: [1, 1.5, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="absolute inset-0 bg-red-500/30 rounded-3xl"
              />
              <motion.div
                animate={{ scale: [1, 1.8, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="absolute inset-0 bg-red-500/20 rounded-3xl"
              />
            </>
          )}
        </motion.div>
        
        {/* Recording duration */}
        {isRecording && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded-2xl text-base font-semibold shadow-xl"
          >
            {formatDuration(recordingDuration)}
          </motion.div>
        )}
      </div>

      {/* Status and instructions */}
      <div className="text-center max-w-sm mt-8">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
          {isProcessing
            ? t('processingWithAI')
            : isRecording
            ? t('recording')
            : t('tapToRecordExpense')}
        </h2>
        
        {isRecording && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-2"
          >
            <p className="text-lg text-gray-600 dark:text-gray-300">
              {t('tapWhenFinished')}
            </p>
          </motion.div>
        )}
        
        {isProcessing && (
          <p className="text-base text-gray-600 dark:text-gray-300">
            {t('usingOpenAI')}
          </p>
        )}
      </div>
    </div>
  );
};