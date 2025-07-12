import React, { useState, useRef } from 'react';
import { View, TouchableOpacity, StyleSheet, Platform, Alert } from 'react-native';
import { Mic, MicOff } from 'lucide-react-native';
import { Audio } from 'expo-av';
import { useThemeStore } from '@/stores/theme-store';

interface VoiceSearchProps {
  onTranscription: (text: string) => void;
  size?: number;
  color?: string;
}

const VoiceSearch: React.FC<VoiceSearchProps> = ({ 
  onTranscription, 
  size = 24, 
  color 
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const recordingRef = useRef<Audio.Recording | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const { isDarkMode } = useThemeStore();

  const iconColor = color || (isDarkMode ? '#FFFFFF' : '#000000');

  const startRecording = async () => {
    try {
      if (Platform.OS === 'web') {
        await startWebRecording();
      } else {
        await startMobileRecording();
      }
      setIsRecording(true);
    } catch (error) {
      console.error('Failed to start recording:', error);
      Alert.alert('Error', 'Failed to start recording. Please check microphone permissions.');
    }
  };

  const startWebRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    streamRef.current = stream;
    
    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;
    
    const audioChunks: Blob[] = [];
    
    mediaRecorder.ondataavailable = (event) => {
      audioChunks.push(event.data);
    };
    
    mediaRecorder.onstop = async () => {
      const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
      await transcribeAudio(audioBlob);
    };
    
    mediaRecorder.start();
  };

  const startMobileRecording = async () => {
    const { status } = await Audio.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Please grant microphone permission to use voice search.');
      return;
    }

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });

    const recording = new Audio.Recording();
    recordingRef.current = recording;

    try {
      await recording.prepareToRecordAsync({
        android: {
          extension: '.m4a',
          outputFormat: Audio.AndroidOutputFormat.MPEG_4,
          audioEncoder: Audio.AndroidAudioEncoder.AAC,
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
        },
        ios: {
          extension: '.wav',
          outputFormat: Audio.IOSOutputFormat.LINEARPCM,
          audioQuality: Audio.IOSAudioQuality.HIGH,
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
        web: {
          mimeType: 'audio/webm',
          bitsPerSecond: 128000,
        },
      });

      await recording.startAsync();
    } catch (error) {
      console.error('Recording setup error:', error);
      // Fallback to simpler configuration
      await recording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      await recording.startAsync();
    }
  };

  const stopRecording = async () => {
    try {
      setIsRecording(false);
      setIsProcessing(true);

      if (Platform.OS === 'web') {
        await stopWebRecording();
      } else {
        await stopMobileRecording();
      }
    } catch (error) {
      console.error('Failed to stop recording:', error);
      Alert.alert('Error', 'Failed to process recording.');
      setIsProcessing(false);
    }
  };

  const stopWebRecording = async () => {
    if (mediaRecorderRef.current && streamRef.current) {
      mediaRecorderRef.current.stop();
      streamRef.current.getTracks().forEach(track => track.stop());
    }
  };

  const stopMobileRecording = async () => {
    if (recordingRef.current) {
      await recordingRef.current.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false });
      
      const uri = recordingRef.current.getURI();
      if (uri) {
        const uriParts = uri.split('.');
        const fileType = uriParts[uriParts.length - 1];

        const audioFile = {
          uri,
          name: `recording.${fileType}`,
          type: `audio/${fileType}`,
        };

        await transcribeAudio(audioFile);
      }
    }
  };

  const transcribeAudio = async (audioData: any) => {
    try {
      const formData = new FormData();
      formData.append('audio', audioData);

      const response = await fetch('https://toolkit.rork.com/stt/transcribe/', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Transcription failed');
      }

      const result = await response.json();
      onTranscription(result.text);
    } catch (error) {
      console.error('Transcription error:', error);
      Alert.alert('Error', 'Failed to transcribe audio. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePress = () => {
    if (isRecording) {
      stopRecording();
    } else if (!isProcessing) {
      startRecording();
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        isRecording && styles.recording,
        isProcessing && styles.processing,
      ]}
      onPress={handlePress}
      disabled={isProcessing}
    >
      {isRecording ? (
        <MicOff size={size} color={iconColor} />
      ) : (
        <Mic size={size} color={iconColor} />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 8,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recording: {
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
  },
  processing: {
    opacity: 0.6,
  },
});

export { VoiceSearch };