'use client'

import React, { useState, useRef, useEffect } from 'react'
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
} from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/components/atoms/Button'
import { Badge } from '@/shared/components/atoms/Badge'
import { Avatar } from '@/shared/components/atoms/Avatar'
import { ZedLogo } from '@/shared/components/atoms/ZedLogo'
import { Card } from '@/shared/components/molecules/Card'
import { useSupabaseAuth } from '@/shared/hooks/useSupabaseAuth'
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

const initialMessages: Message[] = [
  {
    id: '1',
    role: 'assistant',
    content: 'Olá! 👋 Eu sou o ZED, seu assistente virtual pessoal. Estou aqui para ajudar você a organizar sua rotina, finanças, agenda e muito mais. Como posso ajudar você hoje?',
    type: 'text',
    timestamp: new Date(Date.now() - 60000),
  },
]

const suggestions = [
  'Quais são minhas tarefas de hoje?',
  'Quanto gastei esse mês?',
  'Criar um lembrete para amanhã',
  'Resumir minha agenda da semana',
]

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [inputValue, setInputValue] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [attachedFile, setAttachedFile] = useState<File | null>(null)
  const [showAttachMenu, setShowAttachMenu] = useState(false)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)
  
  const { user } = useSupabaseAuth()

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!inputValue.trim() && !attachedFile) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue || (attachedFile ? `Arquivo: ${attachedFile.name}` : ''),
      type: attachedFile 
        ? (attachedFile.type.startsWith('image/') ? 'image' : attachedFile.type.startsWith('video/') ? 'video' : 'text')
        : 'text',
      attachmentUrl: attachedFile ? URL.createObjectURL(attachedFile) : undefined,
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    const messageContent = inputValue
    setInputValue('')
    setAttachedFile(null)
    setIsLoading(true)

    // Enviar para API do Gemini
    await sendToGemini(messageContent)
  }

  const sendToGemini = async (userInput: string) => {
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
      // Preparar histórico (excluir a mensagem inicial e a de typing)
      const history = messages
        .filter(m => m.id !== '1' && m.id !== 'typing')
        .map(m => ({
          role: m.role,
          content: m.content,
        }))

      // Chamar a API com userId para ações
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userInput,
          history,
          userId: user?.id, // Enviar userId para executar ações
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

  const toggleRecording = () => {
    setIsRecording(!isRecording)
    // In a real app, implement audio recording here
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video' | 'file') => {
    const file = e.target.files?.[0]
    if (file) {
      setAttachedFile(file)
    }
    setShowAttachMenu(false)
  }

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion)
  }

  const speakMessage = (content: string) => {
    if ('speechSynthesis' in window) {
      if (isSpeaking) {
        window.speechSynthesis.cancel()
        setIsSpeaking(false)
      } else {
        const utterance = new SpeechSynthesisUtterance(content)
        utterance.lang = 'pt-BR'
        utterance.onend = () => setIsSpeaking(false)
        window.speechSynthesis.speak(utterance)
        setIsSpeaking(true)
      }
    }
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
            </div>
            <p className="text-xs text-emerald-400 flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Online e pronto para ajudar
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSpeaking(!isSpeaking)}
            className="text-slate-400 hover:text-white"
          >
            {isSpeaking ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
          </Button>
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
      {attachedFile && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-2 py-2"
        >
          <div className={cn(
            "flex items-center gap-3 p-3 rounded-xl",
            "bg-blue-500/10 border border-blue-500/20"
          )}>
            {attachedFile.type.startsWith('image/') ? (
              <ImageIcon className="h-5 w-5 text-blue-400" />
            ) : attachedFile.type.startsWith('video/') ? (
              <Video className="h-5 w-5 text-blue-400" />
            ) : (
              <Paperclip className="h-5 w-5 text-blue-400" />
            )}
            <span className="flex-1 text-sm text-slate-300 truncate">
              {attachedFile.name}
            </span>
            <button
              onClick={() => setAttachedFile(null)}
              className="text-slate-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      )}

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
                    "shadow-xl"
                  )}
                >
                  <button
                    onClick={() => imageInputRef.current?.click()}
                    className="flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-white/5 text-slate-300 hover:text-white"
                  >
                    <ImageIcon className="h-4 w-4 text-emerald-400" />
                    <span className="text-sm">Imagem</span>
                  </button>
                  <button
                    onClick={() => videoInputRef.current?.click()}
                    className="flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-white/5 text-slate-300 hover:text-white"
                  >
                    <Video className="h-4 w-4 text-blue-400" />
                    <span className="text-sm">Vídeo</span>
                  </button>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-white/5 text-slate-300 hover:text-white"
                  >
                    <Paperclip className="h-4 w-4 text-amber-400" />
                    <span className="text-sm">Arquivo</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Hidden file inputs */}
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFileSelect(e, 'image')}
          />
          <input
            ref={videoInputRef}
            type="file"
            accept="video/*"
            className="hidden"
            onChange={(e) => handleFileSelect(e, 'video')}
          />
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={(e) => handleFileSelect(e, 'file')}
          />

          {/* Text Input */}
          <div className="flex-1">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Digite sua mensagem..."
              rows={1}
              className={cn(
                "w-full resize-none bg-transparent",
                "text-white placeholder:text-slate-500",
                "focus:outline-none",
                "max-h-32"
              )}
              style={{ minHeight: '24px' }}
            />
          </div>

          {/* Voice Input */}
          <Button
            variant={isRecording ? "destructive" : "ghost"}
            size="icon"
            onClick={toggleRecording}
            className={cn(
              !isRecording && "text-slate-400 hover:text-white",
              isRecording && "animate-pulse"
            )}
          >
            {isRecording ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          </Button>

          {/* Send Button */}
          <Button
            variant="gold"
            size="icon"
            onClick={handleSend}
            disabled={(!inputValue.trim() && !attachedFile) || isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </div>

        {/* Recording indicator */}
        <AnimatePresence>
          {isRecording && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center justify-center gap-2 py-2 text-red-400"
            >
              <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-sm">Gravando áudio...</span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}

// Message Bubble Component
interface MessageBubbleProps {
  message: Message
  onSpeak: (content: string) => void
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, onSpeak }) => {
  const [copied, setCopied] = useState(false)
  const isUser = message.role === 'user'

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(message.content)
    setCopied(true)
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
        <Avatar size="sm" fallback="U" variant="silver" />
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
          {/* Attachment Preview */}
          {message.attachmentUrl && (
            <div className="mb-3">
              {message.type === 'image' && (
                <img 
                  src={message.attachmentUrl} 
                  alt="Attachment" 
                  className="max-w-full rounded-lg"
                />
              )}
              {message.type === 'video' && (
                <video 
                  src={message.attachmentUrl} 
                  controls 
                  className="max-w-full rounded-lg"
                />
              )}
            </div>
          )}
          
          {/* Text Content */}
          <p className={cn(
            "text-sm whitespace-pre-wrap",
            isUser ? "text-white" : "text-slate-200"
          )}>
            {message.content}
          </p>
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
                className="p-1 rounded hover:bg-white/5 text-slate-500 hover:text-slate-300"
              >
                <Volume2 className="h-3 w-3" />
              </button>
              <button
                onClick={copyToClipboard}
                className="p-1 rounded hover:bg-white/5 text-slate-500 hover:text-slate-300"
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

