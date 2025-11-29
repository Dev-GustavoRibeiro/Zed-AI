'use client'

import React from 'react'
import Link from 'next/link'
import { motion, useScroll, useTransform } from 'framer-motion'
import { 
  Bot, 
  Sparkles, 
  MessageSquare, 
  Mic, 
  Image, 
  Video,
  Calendar,
  Wallet,
  ListTodo,
  Shield,
  Zap,
  Globe,
  ArrowRight,
  Check,
  Crown,
  Play,
  Star,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/components/atoms/Button'
import { Badge } from '@/shared/components/atoms/Badge'
import { ZedLogo } from '@/shared/components/atoms/ZedLogo'
import { AnimatedGradientText } from '@/shared/components/ui/animated-gradient-text'
import { MagicCard } from '@/shared/components/ui/magic-card'
import { BorderBeam } from '@/shared/components/ui/border-beam'

export default function LandingPage() {
  const { scrollYProgress } = useScroll()
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95])

  return (
    <div className="min-h-screen bg-[hsl(222,47%,5%)] overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className={cn(
            "flex items-center justify-between h-16 mt-4 px-6",
            "bg-slate-900/60 backdrop-blur-xl",
            "border border-white/10 rounded-2xl"
          )}>
            {/* Logo */}
            <Link href="/" className="flex items-center">
              <ZedLogo size="md" />
            </Link>

            {/* Nav Links */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm text-slate-300 hover:text-white transition-colors">
                Recursos
              </a>
              <a href="#pricing" className="text-sm text-slate-300 hover:text-white transition-colors">
                Planos
              </a>
              <a href="#testimonials" className="text-sm text-slate-300 hover:text-white transition-colors">
                Depoimentos
              </a>
            </div>

            {/* Auth Buttons */}
            <div className="flex items-center gap-3">
              <Link href="/login">
                <Button variant="ghost" size="sm">Entrar</Button>
              </Link>
              <Link href="/signup">
                <Button variant="gold" size="sm">Começar Grátis</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-20">
        {/* Background Effects */}
        <div className="absolute inset-0 gradient-zed-mesh opacity-50" />
        <div className="absolute inset-0 pattern-grid opacity-30" />
        
        {/* Animated orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-breathe" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl animate-breathe" style={{ animationDelay: '2s' }} />

        <motion.div 
          style={{ opacity, scale }}
          className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20"
        >
          <div className="text-center">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Badge variant="gold" size="lg" icon={<Sparkles className="h-3 w-3" />}>
                Apresentando ZED 2.0
              </Badge>
            </motion.div>

            {/* Main Title */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mt-8 text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight"
            >
              <span className="text-white">Seu assistente </span>
              <AnimatedGradientText
                speed={1.5}
                colorFrom="#3b82f6"
                colorTo="#8b5cf6"
                className="text-5xl sm:text-6xl lg:text-7xl font-black"
              >
                virtual pessoal
              </AnimatedGradientText>
              <br />
              <span className="text-white">com </span>
              <AnimatedGradientText
                speed={1.5}
                colorFrom="#f59e0b"
                colorTo="#ef4444"
                className="text-5xl sm:text-6xl lg:text-7xl font-black"
              >
                IA avançada
              </AnimatedGradientText>
            </motion.h1>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-6 text-lg sm:text-xl text-slate-400 max-w-3xl mx-auto"
            >
              ZED é o assistente virtual mais avançado do mercado. Organize sua vida, 
              rotina, finanças e agenda através de conversas naturais por texto, voz, imagem ou vídeo.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link href="/signup">
                <Button size="xl" variant="gold" rightIcon={<ArrowRight className="h-5 w-5" />}>
                  Começar Gratuitamente
                </Button>
              </Link>
              <Button size="xl" variant="outline" leftIcon={<Play className="h-5 w-5" />}>
                Ver Demonstração
              </Button>
            </motion.div>

            {/* Trust badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="mt-12 flex items-center justify-center gap-8 text-slate-500"
            >
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-emerald-500" />
                <span className="text-sm">Dados Seguros</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-amber-500" />
                <span className="text-sm">IA de Última Geração</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-blue-500" />
                <span className="text-sm">100% em Português</span>
              </div>
            </motion.div>
          </div>

          {/* Hero Image/Preview */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-20"
          >
            <div className={cn(
              "relative mx-auto max-w-5xl rounded-3xl overflow-hidden",
              "bg-gradient-to-br from-slate-800/50 to-slate-900/50",
              "border border-white/10",
              "shadow-2xl shadow-blue-500/10"
            )}>
              <BorderBeam
                size={100}
                duration={8}
                colorFrom="#3b82f6"
                colorTo="#f59e0b"
                borderWidth={2}
              />
              {/* Mock Dashboard Preview */}
              <div className="aspect-video relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-amber-500/5" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <ZedLogo size="2xl" showPulse />
                    <p className="mt-4 text-lg text-slate-400">
                      &quot;Olá! Sou o ZED. Como posso ajudar você hoje?&quot;
                    </p>
                  </div>
                </div>
                
                {/* Floating feature cards */}
                <div className="absolute top-8 left-8 p-3 rounded-xl bg-slate-900/80 border border-white/10 backdrop-blur-sm">
                  <div className="flex items-center gap-2">
                    <Mic className="h-4 w-4 text-blue-400" />
                    <span className="text-xs text-slate-300">Comando de voz</span>
                  </div>
                </div>
                
                <div className="absolute top-8 right-8 p-3 rounded-xl bg-slate-900/80 border border-white/10 backdrop-blur-sm">
                  <div className="flex items-center gap-2">
                    <Image className="h-4 w-4 text-amber-400" />
                    <span className="text-xs text-slate-300">Análise de imagens</span>
                  </div>
                </div>
                
                <div className="absolute bottom-8 left-8 p-3 rounded-xl bg-slate-900/80 border border-white/10 backdrop-blur-sm">
                  <div className="flex items-center gap-2">
                    <Video className="h-4 w-4 text-emerald-400" />
                    <span className="text-xs text-slate-300">Suporte a vídeo</span>
                  </div>
                </div>
                
                <div className="absolute bottom-8 right-8 p-3 rounded-xl bg-slate-900/80 border border-white/10 backdrop-blur-sm">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-purple-400" />
                    <span className="text-xs text-slate-300">Chat inteligente</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <Badge variant="default" size="lg">Recursos</Badge>
            <h2 className="mt-6 text-4xl sm:text-5xl font-black text-white">
              Tudo que você precisa para
              <br />
              <span className="text-gradient-zed">organizar sua vida</span>
            </h2>
            <p className="mt-4 text-lg text-slate-400 max-w-2xl mx-auto">
              ZED combina o poder da IA com ferramentas práticas para sua produtividade
            </p>
          </motion.div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon={MessageSquare}
              title="Chat Inteligente"
              description="Converse naturalmente com ZED por texto, áudio, imagem ou vídeo. Ele entende contexto e aprende com você."
              color="blue"
              delay={0}
            />
            <FeatureCard
              icon={ListTodo}
              title="Gerenciador de Rotina"
              description="Organize suas tarefas diárias, crie hábitos e acompanhe seu progresso com insights personalizados."
              color="purple"
              delay={0.1}
            />
            <FeatureCard
              icon={Wallet}
              title="Controle Financeiro"
              description="Registre gastos, defina orçamentos e receba análises inteligentes sobre suas finanças pessoais."
              color="emerald"
              delay={0.2}
            />
            <FeatureCard
              icon={Calendar}
              title="Agenda Inteligente"
              description="Agende compromissos, receba lembretes e deixe ZED otimizar seu tempo automaticamente."
              color="amber"
              delay={0.3}
            />
            <FeatureCard
              icon={Mic}
              title="Comandos de Voz"
              description="Fale com ZED como falaria com um assistente real. Ele processa e responde em tempo real."
              color="cyan"
              delay={0.4}
            />
            <FeatureCard
              icon={Bot}
              title="IA Personalizada"
              description="ZED aprende suas preferências e se adapta ao seu estilo de vida para sugestões mais precisas."
              color="rose"
              delay={0.5}
            />
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="relative py-32 bg-slate-900/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <Badge variant="gold" size="lg">Planos</Badge>
            <h2 className="mt-6 text-4xl sm:text-5xl font-black text-white">
              Escolha o plano
              <br />
              <span className="text-gradient-gold">ideal para você</span>
            </h2>
          </motion.div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <PricingCard
              name="Free"
              price="R$ 0"
              description="Perfeito para começar"
              features={[
                "50 mensagens/mês com ZED",
                "Gerenciador de rotina básico",
                "Controle financeiro simples",
                "Agenda básica",
              ]}
              delay={0}
            />
            <PricingCard
              name="Pro"
              price="R$ 29"
              period="/mês"
              description="Para usuários avançados"
              features={[
                "Mensagens ilimitadas",
                "Comandos de voz",
                "Análise de imagens",
                "Todos os módulos completos",
                "Suporte prioritário",
                "Sincronização em nuvem",
              ]}
              popular
              delay={0.1}
            />
            <PricingCard
              name="Enterprise"
              price="R$ 99"
              period="/mês"
              description="Para equipes e empresas"
              features={[
                "Tudo do Pro",
                "Análise de vídeo",
                "API de integração",
                "Dashboard analytics",
                "Múltiplos usuários",
                "Suporte dedicado 24/7",
              ]}
              delay={0.2}
            />
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="relative py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <Badge variant="secondary" size="lg">Depoimentos</Badge>
            <h2 className="mt-6 text-4xl sm:text-5xl font-black text-white">
              O que nossos usuários
              <br />
              <span className="text-gradient-zed">estão dizendo</span>
            </h2>
          </motion.div>

          {/* Testimonials Grid */}
          <div className="grid md:grid-cols-3 gap-6">
            <TestimonialCard
              quote="ZED mudou completamente minha rotina. Agora consigo organizar meu dia em segundos conversando com ele!"
              author="Maria Silva"
              role="Empreendedora"
              delay={0}
            />
            <TestimonialCard
              quote="O controle financeiro é incrível. Basta eu dizer quanto gastei e ZED categoriza tudo automaticamente."
              author="João Santos"
              role="Desenvolvedor"
              delay={0.1}
            />
            <TestimonialCard
              quote="A funcionalidade de voz é fantástica. Uso ZED enquanto dirijo para organizar minha agenda."
              author="Ana Costa"
              role="Gerente de Projetos"
              delay={0.2}
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-32">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className={cn(
              "relative overflow-hidden rounded-3xl p-12",
              "bg-gradient-to-br from-blue-500/20 via-slate-900/50 to-amber-500/20",
              "border border-white/10"
            )}
          >
            <div className="absolute inset-0 pattern-dots opacity-20" />
            
            <ZedLogo size="xl" className="mx-auto" />
            
            <h2 className="mt-8 text-3xl sm:text-4xl font-black text-white">
              Pronto para transformar sua vida?
            </h2>
            <p className="mt-4 text-lg text-slate-400">
              Comece a usar ZED gratuitamente agora mesmo
            </p>
            
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/signup">
                <Button size="xl" variant="gold" rightIcon={<ArrowRight className="h-5 w-5" />}>
                  Criar Conta Grátis
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center">
              <ZedLogo size="md" animated={false} />
            </div>
            
            <div className="flex items-center gap-8 text-sm text-slate-400">
              <a href="#" className="hover:text-white transition-colors">Termos de Uso</a>
              <a href="#" className="hover:text-white transition-colors">Privacidade</a>
              <a href="#" className="hover:text-white transition-colors">Suporte</a>
            </div>
            
            <p className="text-sm text-slate-500">
              © 2024 ZED. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

// Feature Card Component
interface FeatureCardProps {
  icon: React.ElementType
  title: string
  description: string
  color: 'blue' | 'purple' | 'emerald' | 'amber' | 'cyan' | 'rose'
  delay: number
}

const colorMap = {
  blue: 'from-blue-500/20 to-blue-600/5 border-blue-500/20 text-blue-400',
  purple: 'from-purple-500/20 to-purple-600/5 border-purple-500/20 text-purple-400',
  emerald: 'from-emerald-500/20 to-emerald-600/5 border-emerald-500/20 text-emerald-400',
  amber: 'from-amber-500/20 to-amber-600/5 border-amber-500/20 text-amber-400',
  cyan: 'from-cyan-500/20 to-cyan-600/5 border-cyan-500/20 text-cyan-400',
  rose: 'from-rose-500/20 to-rose-600/5 border-rose-500/20 text-rose-400',
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon: Icon, title, description, color, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay }}
    className={cn(
      "relative overflow-hidden rounded-2xl p-6",
      "bg-gradient-to-br",
      colorMap[color].split(' ').slice(0, 2).join(' '),
      "border",
      colorMap[color].split(' ')[2]
    )}
  >
    <MagicCard
      className="absolute inset-0"
      gradientFrom={color === 'blue' ? '#3b82f6' : color === 'purple' ? '#8b5cf6' : color === 'emerald' ? '#10b981' : color === 'amber' ? '#f59e0b' : color === 'cyan' ? '#06b6d4' : '#f43f5e'}
      gradientTo={color === 'blue' ? '#8b5cf6' : color === 'purple' ? '#ec4899' : color === 'emerald' ? '#3b82f6' : color === 'amber' ? '#ef4444' : color === 'cyan' ? '#3b82f6' : '#f59e0b'}
      gradientSize={150}
    />
    <div className={cn(
      "p-3 rounded-xl w-fit relative z-10",
      "bg-gradient-to-br from-white/10 to-white/5",
      "border border-white/10"
    )}>
      <Icon className={cn("h-6 w-6", colorMap[color].split(' ')[3])} />
    </div>
    <h3 className="mt-4 text-lg font-bold text-white relative z-10">{title}</h3>
    <p className="mt-2 text-sm text-slate-400 relative z-10">{description}</p>
  </motion.div>
)

// Pricing Card Component
interface PricingCardProps {
  name: string
  price: string
  period?: string
  description: string
  features: string[]
  popular?: boolean
  delay: number
}

const PricingCard: React.FC<PricingCardProps> = ({ 
  name, 
  price, 
  period, 
  description, 
  features, 
  popular,
  delay 
}) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay }}
    className={cn(
      "relative overflow-hidden rounded-2xl p-6",
      "bg-gradient-to-br from-slate-800/50 to-slate-900/50",
      "border",
      popular ? "border-amber-500/30 shadow-lg shadow-amber-500/10" : "border-white/10"
    )}
  >
    {popular && (
      <BorderBeam
        size={80}
        duration={10}
        colorFrom="#f59e0b"
        colorTo="#ef4444"
        borderWidth={2}
      />
    )}
    <MagicCard
      className="absolute inset-0"
      gradientFrom={popular ? "#f59e0b" : "#3b82f6"}
      gradientTo={popular ? "#ef4444" : "#8b5cf6"}
      gradientSize={200}
    />
    {popular && (
      <div className="absolute top-4 right-4 z-20">
        <Badge variant="gold" size="sm" icon={<Crown className="h-3 w-3" />}>
          Popular
        </Badge>
      </div>
    )}
    
    <div className="relative z-10">
      <h3 className="text-xl font-bold text-white">{name}</h3>
      <p className="mt-1 text-sm text-slate-400">{description}</p>
      
      <div className="mt-6">
        <span className="text-4xl font-black text-white">{price}</span>
        {period && <span className="text-slate-400">{period}</span>}
      </div>
      
      <ul className="mt-6 space-y-3">
        {features.map((feature, i) => (
          <li key={i} className="flex items-center gap-3 text-sm text-slate-300">
            <Check className="h-4 w-4 text-emerald-400 shrink-0" />
            {feature}
          </li>
        ))}
      </ul>
      
      <Link href="/signup" className="block mt-8">
        <Button 
          variant={popular ? "gold" : "outline"} 
          className="w-full"
          rightIcon={<ChevronRight className="h-4 w-4" />}
        >
          Começar
        </Button>
      </Link>
    </div>
  </motion.div>
)

// Testimonial Card Component
interface TestimonialCardProps {
  quote: string
  author: string
  role: string
  delay: number
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({ quote, author, role, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay }}
    className={cn(
      "relative overflow-hidden rounded-2xl p-6",
      "bg-gradient-to-br from-slate-800/50 to-slate-900/50",
      "border border-white/10"
    )}
  >
    {/* Stars */}
    <div className="flex gap-1 mb-4">
      {[...Array(5)].map((_, i) => (
        <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
      ))}
    </div>
    
    <p className="text-slate-300 italic">&quot;{quote}&quot;</p>
    
    <div className="mt-6 flex items-center gap-3">
      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500/30 to-purple-500/30 flex items-center justify-center">
        <span className="text-sm font-bold text-white">
          {author.split(' ').map(n => n[0]).join('')}
        </span>
      </div>
      <div>
        <p className="text-sm font-semibold text-white">{author}</p>
        <p className="text-xs text-slate-400">{role}</p>
      </div>
    </div>
  </motion.div>
)

