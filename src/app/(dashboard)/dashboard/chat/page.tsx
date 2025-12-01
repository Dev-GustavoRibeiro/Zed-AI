'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Send, 
  Mic, 
  MicOff, 
  Image as ImageIcon, 
  Video, 
  Paperclip,
  MoreVertical,
  Volume2,
  VolumeX,
  Sparkles,
  Bot,
  User,
  X,
  Play,
  Pause,
  Trash2,
  Download,
  Copy,
  Check,
  Loader2,
  CheckCircle2,
  Calendar,
  Wallet,
  Target,
  History,
  RefreshCw,
  Camera,
  FileAudio,
  StopCircle,
  Receipt,
} from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/components/atoms/Button'
import { Badge } from '@/shared/components/atoms/Badge'
import { Avatar } from '@/shared/components/atoms/Avatar'
import { ZedLogo } from '@/shared/components/atoms/ZedLogo'
import { Card } from '@/shared/components/molecules/Card'
import { useSupabaseAuth } from '@/shared/hooks/useSupabaseAuth'
import { useMessages, Message as DbMessage } from '@/shared/hooks/useMessages'
import { useVoice } from '@/shared/hooks/useVoice'
import { useMediaUpload } from '@/shared/hooks/useMediaUpload'
import { useUserProfile } from '@/shared/hooks/useUserProfile'
import toast from 'react-hot-toast'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  type: 'text' | 'audio' | 'image' | 'video'
  attachmentUrl?: string
  timestamp: Date
  isTyping?: boolean
}

const welcomeMessage: Message = {
  id: 'welcome',
  role: 'assistant',
  content: 'Olá! 👋 Eu sou o ZED, seu assistente virtual pessoal. Estou aqui para ajudar você a organizar sua rotina, finanças, agenda e muito mais.\n\n🎤 **Novidade!** Você pode falar comigo usando o microfone ou enviar fotos de recibos que eu analiso automaticamente!\n\nComo posso ajudar você hoje?',
  type: 'text',
  timestamp: new Date(),
}

const suggestions = [
  'Quais são minhas tarefas de hoje?',
  'Quanto gastei esse mês?',
  'Criar um lembrete para amanhã',
  'Resumir minha agenda da semana',
]

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [attachedFile, setAttachedFile] = useState<File | null>(null)
  const [attachedPreview, setAttachedPreview] = useState<string | null>(null)
  const [showAttachMenu, setShowAttachMenu] = useState(false)
  const [showHistoryMenu, setShowHistoryMenu] = useState(false)
  const [autoSpeak, setAutoSpeak] = useState(true) // Ativado por padrão
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)
  
  const { user } = useSupabaseAuth()
  const { profile } = useUserProfile()
  const { 
    messages: dbMessages, 
    isLoading: isLoadingMessages, 
    addMessage: saveMessage,
    clearHistory,
    getFormattedHistory 
  } = useMessages()

  // Hook de voz
  const {
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
  } = useVoice({
    useElevenLabs: true, // Usar voz do ElevenLabs
  })

  // Hook de upload
  const {
    uploadMedia,
    isUploading,
    progress: uploadProgress,
  } = useMediaUpload()

  // Converter mensagens do banco para o formato local
  const convertDbMessages = useCallback((dbMsgs: DbMessage[]): Message[] => {
    return dbMsgs.map(m => ({
      id: m.id,
      role: m.role,
      content: m.content,
      type: m.type,
      attachmentUrl: m.attachment_url || undefined,
      timestamp: new Date(m.created_at),
    }))
  }, [])

  // Carregar mensagens do histórico
  useEffect(() => {
    if (!isLoadingMessages) {
      if (dbMessages.length > 0) {
        setMessages(convertDbMessages(dbMessages))
      } else {
        setMessages([welcomeMessage])
      }
    }
  }, [dbMessages, isLoadingMessages, convertDbMessages])

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])


  // Formatar tempo de gravação
  const formatRecordingTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Limpar histórico de conversas
  const handleClearHistory = async () => {
    const success = await clearHistory()
    if (success) {
      setMessages([welcomeMessage])
      toast.success('Histórico limpo com sucesso!')
    } else {
      toast.error('Erro ao limpar histórico')
    }
    setShowHistoryMenu(false)
  }

  // Processar arquivo selecionado
  const processFile = (file: File) => {
    setAttachedFile(file)
    
    // Criar preview
    if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
      const url = URL.createObjectURL(file)
      setAttachedPreview(url)
    } else {
      setAttachedPreview(null)
    }
  }

  const handleSend = async () => {
    // Áudio é enviado por sendAudioMessage, não por aqui
    if (!inputValue.trim() && !attachedFile) return

    const messageContent = inputValue.trim()
    let mediaUrl: string | null = null
    let mediaType: Message['type'] = 'text'

    // Upload de mídia se houver arquivo anexado (não áudio - áudio vai por sendAudioMessage)
    if (attachedFile) {
      setIsLoading(true)
      const result = await uploadMedia(attachedFile)
      if (result) {
        mediaUrl = result.url
        mediaType = result.type
      }
    }

    // Determinar conteúdo da mensagem
    const displayContent = messageContent || (mediaType === 'image' ? '📷 Imagem enviada' : mediaType === 'video' ? '🎬 Vídeo enviado' : '')
    
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: displayContent,
      type: mediaType, // 'text' para texto, 'image'/'video' para mídia
      attachmentUrl: mediaUrl || (attachedPreview || undefined),
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setAttachedFile(null)
    setAttachedPreview(null)
    setIsLoading(true)

    // Salvar mensagem do usuário no banco
    await saveMessage({
      role: 'user',
      content: messageContent || (mediaType !== 'text' ? `[${mediaType.toUpperCase()}]` : ''),
      type: mediaType,
      attachment_url: mediaUrl,
    })

    // Enviar para API do Gemini
    await sendToGemini(messageContent, mediaUrl ? { type: mediaType, url: mediaUrl } : undefined)
  }

  const sendToGemini = async (userInput: string, media?: { type: Message['type']; url: string; base64?: string; mimeType?: string }) => {
    // Typing indicator
    const typingMessage: Message = {
      id: 'typing',
      role: 'assistant',
      content: '',
      type: 'text',
      timestamp: new Date(),
      isTyping: true,
    }
    setMessages(prev => [...prev, typingMessage])

    try {
      // Usar histórico do banco de dados
      const history = getFormattedHistory()

      // Chamar a API com userId e mídia
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userInput,
          history,
          userId: user?.id,
          media: media,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao processar mensagem')
      }

      // Remover typing indicator
      setMessages(prev => prev.filter(m => m.id !== 'typing'))
      
      // Mostrar toast se uma ação foi executada
      if (data.action) {
        const actionType = data.action.type
        const actionMessages: Record<string, { icon: string; text: string }> = {
          task: { icon: '✅', text: 'Tarefa criada com sucesso!' },
          event: { icon: '📅', text: 'Evento agendado com sucesso!' },
          expense: { icon: '💰', text: 'Despesa registrada com sucesso!' },
          income: { icon: '💵', text: 'Receita registrada com sucesso!' },
          goal: { icon: '🎯', text: 'Meta criada com sucesso!' },
        }
        const actionMsg = actionMessages[actionType]
        if (actionMsg) {
          toast.success(`${actionMsg.icon} ${actionMsg.text}`)
        }
      }
      
      // Adicionar resposta do ZED
      const aiMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: data.response,
        type: 'text',
        timestamp: new Date(),
      }
      
      setMessages(prev => [...prev, aiMessage])

      // Salvar resposta do assistente no banco
      await saveMessage({
        role: 'assistant',
        content: data.response,
        type: 'text',
      })

      // Auto-speak se habilitado
      if (autoSpeak && hasSupport.speechSynthesis) {
        speak(data.response)
      }
    } catch (error: any) {
      console.error('Erro ao enviar mensagem:', error)
      
      // Remover typing indicator
      setMessages(prev => prev.filter(m => m.id !== 'typing'))
      
      // Mostrar mensagem de erro amigável
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `😔 Desculpe, ocorreu um erro: ${error.message}\n\nPor favor, tente novamente em alguns instantes.`,
        type: 'text',
        timestamp: new Date(),
      }
      
      setMessages(prev => [...prev, errorMessage])

      await saveMessage({
        role: 'assistant',
        content: errorMessage.content,
        type: 'text',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // Converter Blob para Base64
  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result as string
        // Remover o prefixo "data:audio/xxx;base64,"
        const base64 = result.split(',')[1]
        resolve(base64)
      }
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  }

  const handleVoiceToggle = async () => {
    if (isRecording) {
      // Parar gravação e enviar áudio para o Gemini
      try {
        const blob = await stopRecording()
        console.log('[Chat] Áudio gravado:', blob?.size, 'bytes')
        if (blob && blob.size > 0) {
          await sendAudioMessage(blob)
        } else {
          toast.error('Nenhum áudio foi gravado')
        }
      } catch (error: any) {
        console.error('[Chat] Erro ao parar gravação:', error)
        toast.error('Erro ao processar áudio')
      }
    } else {
      try {
        await startRecording()
        toast.success('🎤 Gravando... Clique novamente para enviar')
      } catch (error: any) {
        toast.error(error.message || 'Erro ao iniciar gravação')
      }
    }
  }

  // Enviar áudio diretamente para o Gemini
  const sendAudioMessage = async (blob: Blob) => {
    setIsLoading(true)
    
    try {
      // Converter blob para base64
      const base64 = await blobToBase64(blob)
      const mimeType = blob.type || 'audio/webm'
      
      // Fazer upload do áudio para ter URL persistente
      const uploadResult = await uploadMedia(blob, `audio_${Date.now()}.webm`)
      const audioUrl = uploadResult?.url || URL.createObjectURL(blob)
      
      console.log('[Chat] Enviando áudio:', { mimeType, base64Length: base64.length, audioUrl })
      
      const userMessage: Message = {
        id: Date.now().toString(),
        role: 'user',
        content: '', // Sem texto, apenas o player de áudio
        type: 'audio',
        attachmentUrl: audioUrl,
        timestamp: new Date(),
      }

      setMessages(prev => [...prev, userMessage])

      // Salvar mensagem do usuário no banco com URL do áudio
      await saveMessage({
        role: 'user',
        content: '[AUDIO]',
        type: 'audio',
        attachment_url: audioUrl,
      })

      // Enviar para API com áudio em base64
      await sendToGemini('', { type: 'audio', url: audioUrl, base64, mimeType })
    } catch (error: any) {
      console.error('[Chat] Erro ao enviar áudio:', error)
      toast.error('Erro ao enviar áudio')
      setIsLoading(false)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      processFile(file)
    }
    setShowAttachMenu(false)
    // Reset input value
    e.target.value = ''
  }

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion)
  }

  const speakMessage = (content: string) => {
    if (isSpeaking) {
      stopSpeaking()
    } else {
      speak(content)
    }
  }

  const removeAttachment = () => {
    if (attachedPreview) {
      URL.revokeObjectURL(attachedPreview)
    }
    setAttachedFile(null)
    setAttachedPreview(null)
  }

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col">
      {/* Chat Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "flex items-center justify-between p-4",
          "bg-gradient-to-br from-[#0A101F]/95 to-[#111827]/90",
          "border border-white/10 rounded-2xl mb-4"
        )}
      >
        <div className="flex items-center gap-3">
          <ZedLogo size="lg" showPulse />
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="gold" size="sm" icon={<Sparkles className="h-3 w-3" />}>
                AI
              </Badge>
              {hasSupport.audioRecording && (
                <Badge variant="outline" size="sm" icon={<Mic className="h-3 w-3" />}>
                  Voz
                </Badge>
              )}
            </div>
            <p className="text-xs text-emerald-400 flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Online e pronto para ajudar
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Toggle Auto-Speak */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setAutoSpeak(!autoSpeak)}
            className={cn(
              "text-slate-400 hover:text-white",
              autoSpeak && "text-blue-400 bg-blue-500/10"
            )}
            title={autoSpeak ? "Desativar leitura automática" : "Ativar leitura automática"}
          >
            {autoSpeak ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
          </Button>
          
          {/* Menu de Histórico */}
          <div className="relative">
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-slate-400 hover:text-white"
              onClick={() => setShowHistoryMenu(!showHistoryMenu)}
            >
              <History className="h-5 w-5" />
            </Button>
            
            <AnimatePresence>
              {showHistoryMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: -10 }}
                  className={cn(
                    "absolute top-full right-0 mt-2 p-2 min-w-[180px]",
                    "bg-slate-800 border border-white/10 rounded-xl",
                    "shadow-xl z-50"
                  )}
                >
                  <div className="px-3 py-2 border-b border-white/10 mb-2">
                    <p className="text-xs text-slate-400">Histórico de Conversas</p>
                    <p className="text-sm font-medium text-white">
                      {dbMessages.length} mensagem{dbMessages.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <button
                    onClick={handleClearHistory}
                    className="flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-red-500/10 text-red-400 hover:text-red-300 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="text-sm">Limpar Histórico</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
            <MoreVertical className="h-5 w-5" />
          </Button>
        </div>
      </motion.div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto scrollbar-zed px-2 space-y-4">
        <AnimatePresence initial={false}>
          {messages.map((message) => (
            <MessageBubble 
              key={message.id} 
              message={message}
              onSpeak={speakMessage}
              isSpeaking={isSpeaking}
              isLoadingTTS={isLoadingTTS}
              userAvatar={profile?.avatar_url}
              userName={profile?.name || user?.email?.split('@')[0]}
            />
          ))}
        </AnimatePresence>
        
        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions */}
      {messages.length <= 2 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-2 py-3"
        >
          <p className="text-xs text-slate-500 mb-2">Sugestões:</p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs",
                  "bg-white/5 border border-white/10",
                  "text-slate-300 hover:text-white",
                  "hover:bg-white/10 hover:border-white/20",
                  "transition-all duration-200"
                )}
              >
                {suggestion}
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Attached File Preview */}
      <AnimatePresence>
        {attachedFile && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="px-2 py-2"
          >
            <div className={cn(
              "relative flex items-center gap-3 p-3 rounded-xl",
              "bg-blue-500/10 border border-blue-500/20"
            )}>
              {attachedPreview && attachedFile.type.startsWith('image/') ? (
                <div className="relative w-16 h-16 rounded-lg overflow-hidden">
                  <img 
                    src={attachedPreview} 
                    alt="Preview" 
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : attachedPreview && attachedFile.type.startsWith('video/') ? (
                <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-slate-800 flex items-center justify-center">
                  <Video className="h-6 w-6 text-blue-400" />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-lg bg-slate-800 flex items-center justify-center">
                  {attachedFile.type.startsWith('image/') ? (
                    <ImageIcon className="h-5 w-5 text-emerald-400" />
                  ) : attachedFile.type.startsWith('video/') ? (
                    <Video className="h-5 w-5 text-blue-400" />
                  ) : (
                    <Paperclip className="h-5 w-5 text-amber-400" />
                  )}
                </div>
              )}
              
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white truncate">{attachedFile.name}</p>
                <p className="text-xs text-slate-400">
                  {(attachedFile.size / 1024).toFixed(1)} KB
                </p>
              </div>
              
              <button
                onClick={removeAttachment}
                className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
              
              {isUploading && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-700 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-blue-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${uploadProgress}%` }}
                  />
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recording Indicator */}
      <AnimatePresence>
        {isRecording && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="px-2 py-2"
          >
            <div className={cn(
              "flex items-center justify-between p-4 rounded-xl",
              "bg-gradient-to-r from-red-500/20 to-orange-500/20",
              "border border-red-500/30"
            )}>
              <div className="flex items-center gap-3">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
                </span>
                <div>
                  <p className="text-sm font-medium text-white">Gravando áudio</p>
                  <p className="text-xs text-slate-400">{formatRecordingTime(recordingTime)}</p>
                </div>
              </div>
              
              <p className="text-xs text-slate-300 italic">
                O áudio será enviado para o ZED analisar
              </p>
              
              <Button
                variant="destructive"
                size="sm"
                onClick={stopRecording}
                className="gap-2"
              >
                <StopCircle className="h-4 w-4" />
                Parar
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input Area */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-auto"
      >
        <div className={cn(
          "relative flex items-end gap-2 p-3",
          "bg-gradient-to-br from-[#0A101F]/95 to-[#111827]/90",
          "border border-white/10 rounded-2xl"
        )}>
          {/* Attachment Menu */}
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowAttachMenu(!showAttachMenu)}
              className="text-slate-400 hover:text-white"
              disabled={isRecording}
            >
              <Paperclip className="h-5 w-5" />
            </Button>
            
            <AnimatePresence>
              {showAttachMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 10 }}
                  className={cn(
                    "absolute bottom-full left-0 mb-2 p-2",
                    "bg-slate-800 border border-white/10 rounded-xl",
                    "shadow-xl min-w-[160px]"
                  )}
                >
                  <button
                    onClick={() => cameraInputRef.current?.click()}
                    className="flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-white/5 text-slate-300 hover:text-white"
                  >
                    <Camera className="h-4 w-4 text-cyan-400" />
                    <span className="text-sm">Tirar Foto</span>
                  </button>
                  <button
                    onClick={() => imageInputRef.current?.click()}
                    className="flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-white/5 text-slate-300 hover:text-white"
                  >
                    <ImageIcon className="h-4 w-4 text-emerald-400" />
                    <span className="text-sm">Galeria</span>
                  </button>
                  <button
                    onClick={() => videoInputRef.current?.click()}
                    className="flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-white/5 text-slate-300 hover:text-white"
                  >
                    <Video className="h-4 w-4 text-blue-400" />
                    <span className="text-sm">Vídeo</span>
                  </button>
                  <div className="border-t border-white/10 my-1" />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-white/5 text-slate-300 hover:text-white"
                  >
                    <Receipt className="h-4 w-4 text-amber-400" />
                    <span className="text-sm">Recibo/Documento</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Hidden file inputs */}
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleFileSelect}
          />
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileSelect}
          />
          <input
            ref={videoInputRef}
            type="file"
            accept="video/*"
            className="hidden"
            onChange={handleFileSelect}
          />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,.pdf"
            className="hidden"
            onChange={handleFileSelect}
          />

          {/* Text Input */}
          <div className="flex-1">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder={isRecording ? "Fale agora..." : "Digite sua mensagem ou use o microfone..."}
              rows={1}
              disabled={isRecording}
              className={cn(
                "w-full resize-none bg-transparent",
                "text-white placeholder:text-slate-500",
                "focus:outline-none",
                "max-h-32",
                isRecording && "opacity-50"
              )}
              style={{ minHeight: '24px' }}
            />
          </div>

          {/* Voice Input Button */}
          {hasSupport.audioRecording && (
            <Button
              variant={isRecording ? "destructive" : "ghost"}
              size="icon"
              onClick={handleVoiceToggle}
              disabled={isLoading}
              className={cn(
                !isRecording && "text-slate-400 hover:text-white",
                isRecording && "animate-pulse"
              )}
              title={isRecording ? "Parar gravação" : "Gravar áudio"}
            >
              {isRecording ? (
                <MicOff className="h-5 w-5" />
              ) : (
                <Mic className="h-5 w-5" />
              )}
            </Button>
          )}

          {/* Send Button */}
          <Button
            variant="gold"
            size="icon"
            onClick={handleSend}
            disabled={(!inputValue.trim() && !attachedFile) || isLoading || isRecording}
          >
            {isLoading || isUploading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </div>

        {/* Voice support message */}
        {!hasSupport.audioRecording && (
          <p className="text-xs text-center text-slate-500 mt-2">
            Seu navegador não suporta gravação de áudio
          </p>
        )}
      </motion.div>
    </div>
  )
}

// Audio Player Component
interface AudioPlayerProps {
  src: string
  isUser: boolean
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ src, isUser }) => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isLoaded, setIsLoaded] = useState(false)
  const [error, setError] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)

  const togglePlay = async () => {
    if (audioRef.current) {
      try {
        if (isPlaying) {
          audioRef.current.pause()
          setIsPlaying(false)
        } else {
          await audioRef.current.play()
          setIsPlaying(true)
        }
      } catch (err) {
        console.error('Erro ao reproduzir áudio:', err)
        setError(true)
      }
    }
  }

  const handleTimeUpdate = () => {
    if (audioRef.current && !isNaN(audioRef.current.currentTime)) {
      setCurrentTime(audioRef.current.currentTime)
    }
  }

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      const dur = audioRef.current.duration
      if (!isNaN(dur) && isFinite(dur)) {
        setDuration(dur)
        setIsLoaded(true)
      }
    }
  }

  const handleCanPlay = () => {
    if (audioRef.current) {
      const dur = audioRef.current.duration
      if (!isNaN(dur) && isFinite(dur)) {
        setDuration(dur)
        setIsLoaded(true)
      } else {
        // Para áudios sem duração definida, estimar baseado no progresso
        setIsLoaded(true)
      }
    }
  }

  const handleEnded = () => {
    setIsPlaying(false)
    setCurrentTime(0)
    if (audioRef.current) {
      audioRef.current.currentTime = 0
    }
  }

  const handleError = () => {
    console.error('Erro ao carregar áudio')
    setError(true)
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value)
    if (audioRef.current && !isNaN(time)) {
      audioRef.current.currentTime = time
      setCurrentTime(time)
    }
  }

  const formatTime = (time: number) => {
    if (isNaN(time) || !isFinite(time) || time < 0) return '0:00'
    const mins = Math.floor(time / 60)
    const secs = Math.floor(time % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }
  
  // Mostrar duração ou tempo decorrido
  const displayDuration = duration > 0 && isFinite(duration) ? formatTime(duration) : (isLoaded ? formatTime(currentTime) : '--:--')

  // Se houve erro, mostrar mensagem
  if (error) {
    return (
      <div className={cn(
        "flex items-center gap-3 p-3 rounded-xl min-w-[200px]",
        isUser ? "bg-white/10" : "bg-red-500/10 border border-red-500/20"
      )}>
        <div className="text-red-400 text-sm">⚠️ Erro ao carregar áudio</div>
      </div>
    )
  }

  return (
    <div className={cn(
      "flex items-center gap-3 p-3 rounded-xl min-w-[200px]",
      isUser 
        ? "bg-white/10" 
        : "bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/20"
    )}>
      <audio
        ref={audioRef}
        src={src}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onCanPlay={handleCanPlay}
        onEnded={handleEnded}
        onError={handleError}
        preload="auto"
      />
      
      {/* Play/Pause Button */}
      <button
        onClick={togglePlay}
        className={cn(
          "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all",
          isUser
            ? "bg-white/20 hover:bg-white/30 text-white"
            : "bg-blue-500/30 hover:bg-blue-500/40 text-blue-300"
        )}
      >
        {isPlaying ? (
          <Pause className="h-5 w-5" />
        ) : (
          <Play className="h-5 w-5 ml-0.5" />
        )}
      </button>
      
      {/* Progress and Time */}
      <div className="flex-1 min-w-0">
        {/* Progress Bar */}
        <input
          type="range"
          min="0"
          max={duration || 100}
          value={currentTime}
          onChange={handleSeek}
          disabled={!isLoaded || duration === 0}
          className={cn(
            "w-full h-1.5 rounded-full appearance-none cursor-pointer",
            isUser
              ? "bg-white/20 [&::-webkit-slider-thumb]:bg-white"
              : "bg-slate-600 [&::-webkit-slider-thumb]:bg-blue-400",
            "[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full",
            (!isLoaded || duration === 0) && "opacity-50"
          )}
          style={{
            background: duration > 0 
              ? `linear-gradient(to right, ${isUser ? 'rgba(255,255,255,0.6)' : 'rgb(96, 165, 250)'} 0%, ${isUser ? 'rgba(255,255,255,0.6)' : 'rgb(96, 165, 250)'} ${(currentTime / duration) * 100}%, ${isUser ? 'rgba(255,255,255,0.2)' : 'rgb(71, 85, 105)'} ${(currentTime / duration) * 100}%, ${isUser ? 'rgba(255,255,255,0.2)' : 'rgb(71, 85, 105)'} 100%)`
              : undefined
          }}
        />
        
        {/* Time Display */}
        <div className="flex justify-between mt-1">
          <span className={cn(
            "text-xs",
            isUser ? "text-white/70" : "text-slate-400"
          )}>
            {formatTime(currentTime)}
          </span>
          <span className={cn(
            "text-xs",
            isUser ? "text-white/70" : "text-slate-400"
          )}>
            {displayDuration}
          </span>
        </div>
      </div>
      
      {/* Waveform Icon */}
      <div className={cn(
        "flex-shrink-0",
        isUser ? "text-white/50" : "text-blue-400/50"
      )}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <rect x="2" y="9" width="2" height="6" rx="1" fill="currentColor" className={isPlaying ? "animate-[bounce_0.5s_ease-in-out_infinite]" : ""} />
          <rect x="6" y="6" width="2" height="12" rx="1" fill="currentColor" className={isPlaying ? "animate-[bounce_0.5s_ease-in-out_infinite_0.1s]" : ""} />
          <rect x="10" y="4" width="2" height="16" rx="1" fill="currentColor" className={isPlaying ? "animate-[bounce_0.5s_ease-in-out_infinite_0.2s]" : ""} />
          <rect x="14" y="6" width="2" height="12" rx="1" fill="currentColor" className={isPlaying ? "animate-[bounce_0.5s_ease-in-out_infinite_0.3s]" : ""} />
          <rect x="18" y="8" width="2" height="8" rx="1" fill="currentColor" className={isPlaying ? "animate-[bounce_0.5s_ease-in-out_infinite_0.4s]" : ""} />
          <rect x="22" y="10" width="2" height="4" rx="1" fill="currentColor" className={isPlaying ? "animate-[bounce_0.5s_ease-in-out_infinite_0.5s]" : ""} />
        </svg>
      </div>
    </div>
  )
}

// Message Bubble Component
interface MessageBubbleProps {
  message: Message
  onSpeak: (content: string) => void
  isSpeaking: boolean
  isLoadingTTS: boolean
  userAvatar?: string
  userName?: string
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, onSpeak, isSpeaking, isLoadingTTS, userAvatar, userName }) => {
  const [copied, setCopied] = useState(false)
  const isUser = message.role === 'user'
  
  // Mostrar texto apenas para mensagens do tipo 'text' que tenham conteúdo
  const shouldShowText = message.content && 
    message.content.trim() !== '' &&
    message.type === 'text' && 
    !message.content.includes('[AUDIO]')
  
  // Mostrar player apenas para mensagens de áudio com URL
  const shouldShowAudioPlayer = message.type === 'audio' && message.attachmentUrl

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(message.content)
    setCopied(true)
    toast.success('Copiado!')
    setTimeout(() => setCopied(false), 2000)
  }

  if (message.isTyping) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start gap-3"
      >
        <ZedLogo size="sm" />
        <div className={cn(
          "px-4 py-3 rounded-2xl rounded-tl-md",
          "bg-gradient-to-br from-blue-500/10 to-blue-600/5",
          "border border-blue-500/20"
        )}>
          <div className="flex gap-1">
            <span className="h-2 w-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="h-2 w-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="h-2 w-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex items-start gap-3",
        isUser && "flex-row-reverse"
      )}
    >
      {/* Avatar */}
      {isUser ? (
        <Avatar 
          size="sm" 
          src={userAvatar} 
          fallback={userName?.charAt(0).toUpperCase() || 'U'} 
          variant="silver" 
        />
      ) : (
        <ZedLogo size="sm" />
      )}

      {/* Message Content */}
      <div className={cn(
        "group max-w-[80%] sm:max-w-[70%]"
      )}>
        <div className={cn(
          "px-4 py-3 rounded-2xl",
          isUser 
            ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-tr-md" 
            : "bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-white/10 rounded-tl-md"
        )}>
          {/* Attachment Preview - Imagens e Vídeos */}
          {message.attachmentUrl && (message.type === 'image' || message.type === 'video') && (
            <div className="mb-3">
              {message.type === 'image' && (
                <img 
                  src={message.attachmentUrl} 
                  alt="Attachment" 
                  className="max-w-full rounded-lg max-h-64 object-cover"
                  loading="lazy"
                />
              )}
              {message.type === 'video' && (
                <video 
                  src={message.attachmentUrl} 
                  controls 
                  className="max-w-full rounded-lg max-h-64"
                />
              )}
            </div>
          )}
          
          {/* Audio Player - Apenas para mensagens de áudio */}
          {shouldShowAudioPlayer && (
            <div className="mb-2">
              <AudioPlayer src={message.attachmentUrl!} isUser={isUser} />
            </div>
          )}
          
          {/* Text Content */}
          {shouldShowText && (
            <p className={cn(
              "text-sm whitespace-pre-wrap",
              isUser ? "text-white" : "text-slate-200"
            )}>
              {message.content}
            </p>
          )}
        </div>

        {/* Message Actions */}
        <div className={cn(
          "flex items-center gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity",
          isUser && "justify-end"
        )}>
          <span className="text-[10px] text-slate-500 px-1">
            {message.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
          </span>
          
          {!isUser && (
            <>
              <button
                onClick={() => onSpeak(message.content)}
                disabled={isLoadingTTS}
                className={cn(
                  "p-1 rounded hover:bg-white/5 transition-colors",
                  isSpeaking ? "text-blue-400" : "text-slate-500 hover:text-slate-300",
                  isLoadingTTS && "opacity-50 cursor-wait"
                )}
                title={isLoadingTTS ? "Carregando..." : isSpeaking ? "Parar" : "Ouvir (ElevenLabs)"}
              >
                {isLoadingTTS ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : isSpeaking ? (
                  <VolumeX className="h-3 w-3" />
                ) : (
                  <Volume2 className="h-3 w-3" />
                )}
              </button>
              <button
                onClick={copyToClipboard}
                className="p-1 rounded hover:bg-white/5 text-slate-500 hover:text-slate-300"
                title="Copiar"
              >
                {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
              </button>
            </>
          )}
        </div>
      </div>
    </motion.div>
  )
}
