'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

interface UseVoiceOptions {
  onAudioReady?: (blob: Blob) => void;
  useElevenLabs?: boolean;
}

interface UseVoiceReturn {
  isRecording: boolean;
  isSpeaking: boolean;
  isLoadingTTS: boolean;
  audioBlob: Blob | null;
  audioUrl: string | null;
  recordingTime: number;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<Blob | null>;
  speak: (text: string) => Promise<void>;
  stopSpeaking: () => Promise<void>;
  hasSupport: {
    audioRecording: boolean;
    speechSynthesis: boolean;
  };
}

export const useVoice = (options: UseVoiceOptions = {}): UseVoiceReturn => {
  const { onAudioReady, useElevenLabs = true } = options;
  
  // Estados
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoadingTTS, setIsLoadingTTS] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [hasSupport, setHasSupport] = useState({
    audioRecording: false,
    speechSynthesis: false,
  });
  
  // Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const ttsAudioRef = useRef<HTMLAudioElement | null>(null);
  const ttsAudioUrlRef = useRef<string | null>(null);
  const resolveRecordingRef = useRef<((blob: Blob | null) => void) | null>(null);
  const ttsPlayPromiseRef = useRef<Promise<void> | null>(null);
  
  // Verificar suporte apenas no cliente
  useEffect(() => {
    if (typeof window !== 'undefined' && typeof navigator !== 'undefined') {
      // Verificar suporte a gravação de áudio de várias formas
      const hasGetUserMedia = !!(
        navigator.mediaDevices?.getUserMedia ||
        (navigator as any).getUserMedia ||
        (navigator as any).webkitGetUserMedia ||
        (navigator as any).mozGetUserMedia ||
        (navigator as any).msGetUserMedia
      );
      
      const hasMediaRecorder = 'MediaRecorder' in window;
      
      setHasSupport({
        audioRecording: hasGetUserMedia && hasMediaRecorder,
        speechSynthesis: 'speechSynthesis' in window,
      });
    }
  }, []);
  
  // Cleanup
  useEffect(() => {
    return () => {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
      if (ttsAudioUrlRef.current) {
        URL.revokeObjectURL(ttsAudioUrlRef.current);
      }
      if (ttsAudioRef.current) {
        ttsAudioRef.current.pause();
        ttsAudioRef.current = null;
      }
    };
  }, [audioUrl]);

  // Função para obter getUserMedia com fallbacks
  const getUserMedia = useCallback(async (constraints: MediaStreamConstraints): Promise<MediaStream> => {
    if (navigator.mediaDevices?.getUserMedia) {
      return navigator.mediaDevices.getUserMedia(constraints);
    }
    
    // Fallback para navegadores mais antigos
    const legacyGetUserMedia = 
      (navigator as any).getUserMedia ||
      (navigator as any).webkitGetUserMedia ||
      (navigator as any).mozGetUserMedia ||
      (navigator as any).msGetUserMedia;
    
    if (legacyGetUserMedia) {
      return new Promise((resolve, reject) => {
        legacyGetUserMedia.call(navigator, constraints, resolve, reject);
      });
    }
    
    throw new Error('getUserMedia não suportado');
  }, []);

  // Obter o melhor mimeType suportado
  const getSupportedMimeType = useCallback((): string => {
    const mimeTypes = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/mp4',
      'audio/ogg;codecs=opus',
      'audio/ogg',
      'audio/wav',
      'audio/mpeg',
      '', // Fallback para o padrão do navegador
    ];
    
    for (const mimeType of mimeTypes) {
      if (mimeType === '' || MediaRecorder.isTypeSupported(mimeType)) {
        return mimeType;
      }
    }
    
    return '';
  }, []);

  // Iniciar gravação de áudio
  const startRecording = useCallback(async () => {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') {
      console.error('Ambiente não suporta gravação de áudio');
      return;
    }
    
    if (!hasSupport.audioRecording) {
      console.error('Navegador não suporta gravação de áudio');
      return;
    }
    
    try {
      // Solicitar permissão e obter stream de áudio
      const stream = await getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 16000, // Taxa de amostragem comum para speech
        } 
      });
      
      streamRef.current = stream;
      
      // Obter melhor mimeType suportado
      const mimeType = getSupportedMimeType();
      
      // Criar MediaRecorder com opções
      const recorderOptions: MediaRecorderOptions = {};
      if (mimeType) {
        recorderOptions.mimeType = mimeType;
      }
      
      const mediaRecorder = new MediaRecorder(stream, recorderOptions);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const finalMimeType = mimeType || 'audio/webm';
        const blob = new Blob(audioChunksRef.current, { type: finalMimeType });
        setAudioBlob(blob);
        
        // Criar URL para preview
        if (audioUrl) {
          URL.revokeObjectURL(audioUrl);
        }
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        
        // Callback
        if (onAudioReady) {
          onAudioReady(blob);
        }
        
        // Resolver a Promise do stopRecording
        if (resolveRecordingRef.current) {
          resolveRecordingRef.current(blob);
          resolveRecordingRef.current = null;
        }
        
        // Parar todas as tracks
        stream.getTracks().forEach(track => track.stop());
        
        // Limpar timer
        if (recordingIntervalRef.current) {
          clearInterval(recordingIntervalRef.current);
        }
        setRecordingTime(0);
      };
      
      mediaRecorder.onerror = (event) => {
        console.error('Erro no MediaRecorder:', event);
        setIsRecording(false);
        if (resolveRecordingRef.current) {
          resolveRecordingRef.current(null);
          resolveRecordingRef.current = null;
        }
      };
      
      // Iniciar gravação (coleta dados a cada 250ms para melhor compatibilidade)
      mediaRecorder.start(250);
      setIsRecording(true);
      
      // Timer de gravação
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
    } catch (error: any) {
      console.error('Erro ao acessar microfone:', error);
      
      // Mensagens de erro mais amigáveis
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        throw new Error('Permissão para acessar o microfone foi negada. Por favor, permita o acesso ao microfone.');
      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        throw new Error('Nenhum microfone foi encontrado. Conecte um microfone e tente novamente.');
      } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
        throw new Error('O microfone está sendo usado por outra aplicação.');
      } else {
        throw new Error('Erro ao acessar o microfone: ' + error.message);
      }
    }
  }, [hasSupport.audioRecording, audioUrl, onAudioReady, getUserMedia, getSupportedMimeType]);

  // Parar gravação e retornar o blob
  const stopRecording = useCallback(async (): Promise<Blob | null> => {
    return new Promise((resolve) => {
      if (mediaRecorderRef.current && isRecording) {
        resolveRecordingRef.current = resolve;
        mediaRecorderRef.current.stop();
        setIsRecording(false);
      } else {
        resolve(audioBlob);
      }
    });
  }, [isRecording, audioBlob]);

  // Text-to-Speech com ElevenLabs
  const speakWithElevenLabs = useCallback(async (text: string) => {
    setIsLoadingTTS(true);
    
    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Erro ao gerar áudio');
      }
      
      const audioBlob = await response.blob();
      
      // Limpar áudio anterior
      if (ttsAudioUrlRef.current) {
        URL.revokeObjectURL(ttsAudioUrlRef.current);
      }
      if (ttsAudioRef.current) {
        // Se há uma promessa de play pendente, aguardar antes de pausar
        if (ttsPlayPromiseRef.current) {
          try {
            await ttsPlayPromiseRef.current;
          } catch (err) {
            // Ignorar erros de play interrompido
          }
          ttsPlayPromiseRef.current = null;
        }
        ttsAudioRef.current.pause();
      }
      
      // Criar novo áudio
      const audioUrl = URL.createObjectURL(audioBlob);
      ttsAudioUrlRef.current = audioUrl;
      
      const audio = new Audio(audioUrl);
      ttsAudioRef.current = audio;
      
      audio.onplay = () => setIsSpeaking(true);
      audio.onended = () => {
        setIsSpeaking(false);
        ttsPlayPromiseRef.current = null;
        if (ttsAudioUrlRef.current) {
          URL.revokeObjectURL(ttsAudioUrlRef.current);
          ttsAudioUrlRef.current = null;
        }
      };
      audio.onerror = () => {
        setIsSpeaking(false);
        ttsPlayPromiseRef.current = null;
        console.error('Erro ao reproduzir áudio');
        // Fallback para speechSynthesis nativo
        if (hasSupport.speechSynthesis) {
          speakWithNative(text);
        }
      };
      
      // Armazenar a promessa de play e tratar erros
      ttsPlayPromiseRef.current = audio.play();
      try {
        await ttsPlayPromiseRef.current;
      } catch (err: any) {
        // Ignorar erros de play interrompido (AbortError)
        if (err.name !== 'AbortError') {
          throw err;
        }
      } finally {
        ttsPlayPromiseRef.current = null;
      }
      
    } catch (error) {
      console.error('Erro no TTS ElevenLabs:', error);
      // Fallback para speechSynthesis nativo
      if (hasSupport.speechSynthesis) {
        speakWithNative(text);
      }
    } finally {
      setIsLoadingTTS(false);
    }
  }, [hasSupport.speechSynthesis]);

  // Text-to-Speech nativo (fallback)
  const speakWithNative = useCallback((text: string) => {
    if (!hasSupport.speechSynthesis || typeof window === 'undefined') return;
    
    // Cancelar qualquer fala em andamento
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'pt-BR';
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.volume = 1;
    
    // Tentar usar uma voz brasileira
    const voices = window.speechSynthesis.getVoices();
    const ptVoice = voices.find(voice => 
      voice.lang.includes('pt-BR') || voice.lang.includes('pt_BR')
    );
    if (ptVoice) {
      utterance.voice = ptVoice;
    }
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    window.speechSynthesis.speak(utterance);
  }, [hasSupport.speechSynthesis]);

  // Função speak principal
  const speak = useCallback(async (text: string) => {
    if (useElevenLabs) {
      await speakWithElevenLabs(text);
    } else if (hasSupport.speechSynthesis) {
      speakWithNative(text);
    }
  }, [useElevenLabs, speakWithElevenLabs, speakWithNative, hasSupport.speechSynthesis]);

  // Parar TTS
  const stopSpeaking = useCallback(async () => {
    // Parar ElevenLabs audio
    if (ttsAudioRef.current) {
      // Se há uma promessa de play pendente, aguardar antes de pausar
      if (ttsPlayPromiseRef.current) {
        try {
          await ttsPlayPromiseRef.current;
        } catch (err) {
          // Ignorar erros de play interrompido (AbortError)
        }
        ttsPlayPromiseRef.current = null;
      }
      ttsAudioRef.current.pause();
      ttsAudioRef.current.currentTime = 0;
    }
    
    // Parar speechSynthesis nativo
    if (hasSupport.speechSynthesis && typeof window !== 'undefined') {
      window.speechSynthesis.cancel();
    }
    
    setIsSpeaking(false);
  }, [hasSupport.speechSynthesis]);

  return {
    isRecording,
    isSpeaking,
    isLoadingTTS,
    audioBlob,
    audioUrl,
    recordingTime,
    startRecording,
    stopRecording,
    speak,
    stopSpeaking,
    hasSupport,
  };
};
