'use client'

import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  CreditCard,
  PiggyBank,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  Download,
  ChevronLeft,
  ChevronRight,
  Search,
  ShoppingCart,
  Car,
  Home,
  Utensils,
  Gamepad2,
  Briefcase,
  Loader2,
  Trash2,
  Edit3,
  Target,
  AlertTriangle,
  CheckCircle2,
  Circle,
  Heart,
  GraduationCap,
  Receipt,
  Banknote,
  Gift,
  RotateCcw,
  Calendar,
  BarChart3,
  PieChart,
  Sparkles,
  Shield,
  Zap,
  DollarSign,
  Percent,
  Clock,
  TrendingDown as TrendingDownIcon,
  X,
  ChevronDown,
  MoreHorizontal,
  Smartphone,
  Building2,
} from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/shared/components/molecules/Card'
import { Button } from '@/shared/components/atoms/Button'
import { Badge } from '@/shared/components/atoms/Badge'
import { Input } from '@/shared/components/atoms/Input'
import { Modal, ModalFooter } from '@/shared/components/molecules/Modal'
import { 
  useFinances, 
  Transaction, 
  Budget, 
  FinancialGoal,
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  PAYMENT_METHODS,
  GOAL_TYPES,
} from '@/shared/hooks/useFinances'

// ========================================
// ICONS & COLORS CONFIG
// ========================================

const categoryIcons: Record<string, React.ElementType> = {
  'Alimentação': Utensils,
  'Transporte': Car,
  'Moradia': Home,
  'Assinaturas': Gamepad2,
  'Salário': Briefcase,
  'Freelance': Briefcase,
  'Saúde': Heart,
  'Educação': GraduationCap,
  'Lazer': Gamepad2,
  'Compras': ShoppingCart,
  'Investimentos': TrendingUp,
  'Impostos': Receipt,
  'Vendas': Banknote,
  'Presente': Gift,
  'Reembolso': RotateCcw,
  'Pets': Heart,
  'Beleza': Sparkles,
  'Aluguel': Building2,
  'Outros': Circle,
}

const categoryColors: Record<string, { bg: string; text: string; bar: string }> = {
  'Alimentação': { bg: 'bg-orange-500/10', text: 'text-orange-400', bar: 'bg-orange-500' },
  'Transporte': { bg: 'bg-blue-500/10', text: 'text-blue-400', bar: 'bg-blue-500' },
  'Moradia': { bg: 'bg-purple-500/10', text: 'text-purple-400', bar: 'bg-purple-500' },
  'Assinaturas': { bg: 'bg-pink-500/10', text: 'text-pink-400', bar: 'bg-pink-500' },
  'Salário': { bg: 'bg-emerald-500/10', text: 'text-emerald-400', bar: 'bg-emerald-500' },
  'Freelance': { bg: 'bg-teal-500/10', text: 'text-teal-400', bar: 'bg-teal-500' },
  'Saúde': { bg: 'bg-red-500/10', text: 'text-red-400', bar: 'bg-red-500' },
  'Educação': { bg: 'bg-indigo-500/10', text: 'text-indigo-400', bar: 'bg-indigo-500' },
  'Lazer': { bg: 'bg-cyan-500/10', text: 'text-cyan-400', bar: 'bg-cyan-500' },
  'Compras': { bg: 'bg-amber-500/10', text: 'text-amber-400', bar: 'bg-amber-500' },
  'Investimentos': { bg: 'bg-green-500/10', text: 'text-green-400', bar: 'bg-green-500' },
  'Impostos': { bg: 'bg-slate-500/10', text: 'text-slate-400', bar: 'bg-slate-500' },
  'Vendas': { bg: 'bg-lime-500/10', text: 'text-lime-400', bar: 'bg-lime-500' },
  'Presente': { bg: 'bg-rose-500/10', text: 'text-rose-400', bar: 'bg-rose-500' },
  'Reembolso': { bg: 'bg-sky-500/10', text: 'text-sky-400', bar: 'bg-sky-500' },
  'Pets': { bg: 'bg-fuchsia-500/10', text: 'text-fuchsia-400', bar: 'bg-fuchsia-500' },
  'Beleza': { bg: 'bg-violet-500/10', text: 'text-violet-400', bar: 'bg-violet-500' },
  'Aluguel': { bg: 'bg-yellow-500/10', text: 'text-yellow-400', bar: 'bg-yellow-500' },
  'Outros': { bg: 'bg-slate-500/10', text: 'text-slate-400', bar: 'bg-slate-500' },
}

const getCategoryStyle = (category: string) => {
  return categoryColors[category] || categoryColors['Outros']
}

// ========================================
// MAIN PAGE COMPONENT
// ========================================

export default function FinancesPage() {
  const { 
    transactions, 
    budgets,
    goals,
    isLoading, 
    dateRange,
    summary,
    budgetsWithSpent,
    healthScore,
    addTransaction, 
    deleteTransaction,
    addBudget,
    updateBudget,
    deleteBudget,
    addGoal,
    updateGoal,
    deleteGoal,
    addToGoal,
    setMonth,
    exportTransactions,
  } = useFinances()
  
  // Modal states
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false)
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false)
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false)
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false)
  const [selectedGoal, setSelectedGoal] = useState<FinancialGoal | null>(null)
  
  // Filters
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'budgets' | 'goals'>('overview')
  
  // Form states
  const [newTransaction, setNewTransaction] = useState({
    title: '',
    amount: '',
    category: 'Outros',
    type: 'expense' as 'income' | 'expense',
    payment_method: 'PIX',
    notes: '',
    date: new Date().toISOString().split('T')[0],
  })
  
  const [newBudget, setNewBudget] = useState({
    category: 'Alimentação',
    amount: '',
    period: 'monthly' as 'weekly' | 'monthly' | 'yearly',
  })
  
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    target_value: '',
    current_value: '0',
    type: 'savings' as 'savings' | 'debt' | 'investment' | 'emergency',
    deadline: '',
  })
  
  const [depositAmount, setDepositAmount] = useState('')

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const matchesFilter = filter === 'all' || t.type === filter
      const matchesSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           t.category.toLowerCase().includes(searchTerm.toLowerCase())
      return matchesFilter && matchesSearch
    })
  }, [transactions, filter, searchTerm])

  // Format currency
  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  }

  // Format date
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  // Month name
  const monthName = dateRange.start.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })

  // Handlers
  const handleSaveTransaction = async () => {
    if (!newTransaction.title || !newTransaction.amount) return
    
    const amount = parseFloat(newTransaction.amount)
    await addTransaction({
      title: newTransaction.title,
      amount: newTransaction.type === 'expense' ? -Math.abs(amount) : Math.abs(amount),
      category: newTransaction.category,
      type: newTransaction.type,
      payment_method: newTransaction.payment_method,
      notes: newTransaction.notes || null,
      date: newTransaction.date,
    })
    
    setIsTransactionModalOpen(false)
    setNewTransaction({ 
      title: '', 
      amount: '', 
      category: 'Outros', 
      type: 'expense',
      payment_method: 'PIX',
      notes: '',
      date: new Date().toISOString().split('T')[0],
    })
  }

  const handleSaveBudget = async () => {
    if (!newBudget.amount) return
    
    await addBudget({
      category: newBudget.category,
      amount: parseFloat(newBudget.amount),
      period: newBudget.period,
    })
    
    setIsBudgetModalOpen(false)
    setNewBudget({ category: 'Alimentação', amount: '', period: 'monthly' })
  }

  const handleSaveGoal = async () => {
    if (!newGoal.title || !newGoal.target_value) return
    
    await addGoal({
      title: newGoal.title,
      description: newGoal.description || null,
      target_value: parseFloat(newGoal.target_value),
      current_value: parseFloat(newGoal.current_value) || 0,
      type: newGoal.type,
      deadline: newGoal.deadline || null,
      completed: false,
    })
    
    setIsGoalModalOpen(false)
    setNewGoal({ 
      title: '', 
      description: '', 
      target_value: '', 
      current_value: '0', 
      type: 'savings',
      deadline: '',
    })
  }

  const handleDeposit = async () => {
    if (!selectedGoal || !depositAmount) return
    
    await addToGoal(selectedGoal.id, parseFloat(depositAmount))
    setIsDepositModalOpen(false)
    setSelectedGoal(null)
    setDepositAmount('')
  }

  const openDepositModal = (goal: FinancialGoal) => {
    setSelectedGoal(goal)
    setIsDepositModalOpen(true)
  }

  // Get health score color
  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return { bg: 'from-emerald-500 to-green-500', text: 'text-emerald-400', label: 'Excelente' }
    if (score >= 60) return { bg: 'from-blue-500 to-cyan-500', text: 'text-blue-400', label: 'Bom' }
    if (score >= 40) return { bg: 'from-amber-500 to-yellow-500', text: 'text-amber-400', label: 'Regular' }
    return { bg: 'from-red-500 to-orange-500', text: 'text-red-400', label: 'Precisa melhorar' }
  }

  const healthScoreStyle = getHealthScoreColor(healthScore)

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-black text-white">Finanças</h1>
          <p className="text-slate-400">Controle total da sua vida financeira</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="outline" 
            leftIcon={<Download className="h-4 w-4" />}
            onClick={() => exportTransactions('csv')}
          >
            Exportar
          </Button>
          <Button 
            variant="gold" 
            leftIcon={<Plus className="h-4 w-4" />}
            onClick={() => setIsTransactionModalOpen(true)}
          >
            Nova Transação
          </Button>
        </div>
      </motion.div>

      {/* Month Navigation */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-center gap-4"
      >
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setMonth(-1)}
          className="hover:bg-white/10"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10">
          <Calendar className="h-4 w-4 text-slate-400" />
          <span className="text-white font-semibold capitalize">{monthName}</span>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setMonth(1)}
          className="hover:bg-white/10"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-white/5 rounded-xl border border-white/10 overflow-x-auto">
        {[
          { id: 'overview', label: 'Visão Geral', icon: PieChart },
          { id: 'transactions', label: 'Transações', icon: CreditCard },
          { id: 'budgets', label: 'Orçamentos', icon: Wallet },
          { id: 'goals', label: 'Metas', icon: Target },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={cn(
              "flex-1 min-w-[120px] flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all",
              activeTab === tab.id
                ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/20"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            )}
          >
            <tab.icon className="h-4 w-4" />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content based on active tab */}
      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Summary Cards */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <SummaryCard
                icon={Wallet}
                label="Saldo do Mês"
                value={summary.balance}
                color={summary.balance >= 0 ? 'emerald' : 'red'}
              />
              <SummaryCard
                icon={TrendingUp}
                label="Receitas"
                value={summary.totalIncome}
                color="emerald"
              />
              <SummaryCard
                icon={TrendingDown}
                label="Despesas"
                value={summary.totalExpenses}
                color="red"
              />
              <SummaryCard
                icon={PiggyBank}
                label="Taxa de Poupança"
                value={summary.savingsRate}
                suffix="%"
                color="amber"
                isPercentage
              />
            </div>

            {/* Health Score + Quick Stats */}
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Health Score */}
              <Card className="lg:col-span-1">
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="relative w-32 h-32 mx-auto mb-4">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle
                          cx="64"
                          cy="64"
                          r="56"
                          stroke="currentColor"
                          strokeWidth="12"
                          fill="none"
                          className="text-slate-800"
                        />
                        <circle
                          cx="64"
                          cy="64"
                          r="56"
                          stroke="url(#healthGradient)"
                          strokeWidth="12"
                          fill="none"
                          strokeLinecap="round"
                          strokeDasharray={`${(healthScore / 100) * 351.86} 351.86`}
                          className="transition-all duration-1000"
                        />
                        <defs>
                          <linearGradient id="healthGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" className={cn(
                              healthScore >= 60 ? "stop-color: rgb(16, 185, 129)" : "stop-color: rgb(239, 68, 68)"
                            )} style={{ stopColor: healthScore >= 60 ? '#10b981' : '#ef4444' }} />
                            <stop offset="100%" className={cn(
                              healthScore >= 60 ? "stop-color: rgb(34, 197, 94)" : "stop-color: rgb(249, 115, 22)"
                            )} style={{ stopColor: healthScore >= 60 ? '#22c55e' : '#f97316' }} />
                          </linearGradient>
                        </defs>
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-3xl font-black text-white">{healthScore}</span>
                        <span className="text-xs text-slate-400">pontos</span>
                      </div>
                    </div>
                    <h3 className="text-lg font-bold text-white">Saúde Financeira</h3>
                    <p className={cn("text-sm font-medium", healthScoreStyle.text)}>
                      {healthScoreStyle.label}
                    </p>
                    <div className="mt-4 pt-4 border-t border-white/10">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-slate-400">Média diária</p>
                          <p className="text-white font-semibold">{formatCurrency(summary.dailyAverage)}</p>
                        </div>
                        <div>
                          <p className="text-slate-400">Projeção mensal</p>
                          <p className="text-white font-semibold">{formatCurrency(summary.projectedMonthlyExpenses)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Expenses by Category Chart */}
              <Card className="lg:col-span-2">
                <CardHeader icon={<PieChart className="h-5 w-5 text-amber-400" />}>
                  <CardTitle>Gastos por Categoria</CardTitle>
                </CardHeader>
                <CardContent>
                  {summary.topExpenseCategories.length > 0 ? (
                    <div className="space-y-4">
                      {summary.topExpenseCategories.map((cat, index) => {
                        const Icon = categoryIcons[cat.category] || Circle
                        const style = getCategoryStyle(cat.category)
                        
                        return (
                          <motion.div 
                            key={cat.category}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="space-y-2"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className={cn("p-2 rounded-lg", style.bg)}>
                                  <Icon className={cn("h-4 w-4", style.text)} />
                                </div>
                                <span className="text-sm text-white font-medium">{cat.category}</span>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-semibold text-white">{formatCurrency(cat.amount)}</p>
                                <p className="text-xs text-slate-500">{cat.percentage.toFixed(1)}%</p>
                              </div>
                            </div>
                            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${cat.percentage}%` }}
                                transition={{ duration: 0.8, delay: index * 0.1 }}
                                className={cn("h-full rounded-full", style.bar)}
                              />
                            </div>
                          </motion.div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="py-8 text-center text-slate-500">
                      Nenhuma despesa registrada neste período
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Budget Alerts */}
            {budgetsWithSpent.filter(b => b.isOverBudget).length > 0 && (
              <Card variant="gold">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-amber-500/20">
                      <AlertTriangle className="h-5 w-5 text-amber-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-white">Atenção aos seus gastos!</h4>
                      <p className="text-sm text-slate-300 mt-1">
                        Você excedeu o orçamento em {budgetsWithSpent.filter(b => b.isOverBudget).length} categoria(s): {' '}
                        {budgetsWithSpent.filter(b => b.isOverBudget).map(b => b.category).join(', ')}.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recent Transactions Preview */}
            <Card>
              <CardHeader 
                icon={<CreditCard className="h-5 w-5 text-blue-400" />}
                action={
                  <Button variant="ghost" size="sm" onClick={() => setActiveTab('transactions')}>
                    Ver todas
                  </Button>
                }
              >
                <CardTitle>Transações Recentes</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-white/5">
                  {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                    </div>
                  ) : transactions.slice(0, 5).length > 0 ? (
                    transactions.slice(0, 5).map((transaction, index) => (
                      <TransactionItem 
                        key={transaction.id} 
                        transaction={transaction} 
                        index={index}
                        onDelete={deleteTransaction}
                      />
                    ))
                  ) : (
                    <div className="py-12 text-center text-slate-500">
                      <CreditCard className="h-12 w-12 mx-auto mb-3 opacity-20" />
                      <p>Nenhuma transação registrada</p>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="mt-2"
                        onClick={() => setIsTransactionModalOpen(true)}
                      >
                        Adicionar primeira transação
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {activeTab === 'transactions' && (
          <motion.div
            key="transactions"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card>
              <CardHeader
                icon={<CreditCard className="h-5 w-5 text-blue-400" />}
                action={
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Buscar..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="h-9 pl-9 pr-3 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-blue-500/50 w-40"
                      />
                    </div>
                    <select
                      value={filter}
                      onChange={(e) => setFilter(e.target.value as typeof filter)}
                      className="h-9 px-3 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none"
                    >
                      <option value="all">Todos</option>
                      <option value="income">Receitas</option>
                      <option value="expense">Despesas</option>
                    </select>
                  </div>
                }
              >
                <CardTitle>Todas as Transações</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-white/5 max-h-[600px] overflow-y-auto">
                  {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                    </div>
                  ) : filteredTransactions.length > 0 ? (
                    filteredTransactions.map((transaction, index) => (
                      <TransactionItem 
                        key={transaction.id} 
                        transaction={transaction} 
                        index={index}
                        onDelete={deleteTransaction}
                        showFullInfo
                      />
                    ))
                  ) : (
                    <div className="py-12 text-center text-slate-500">
                      <Search className="h-12 w-12 mx-auto mb-3 opacity-20" />
                      <p>Nenhuma transação encontrada</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {activeTab === 'budgets' && (
          <motion.div
            key="budgets"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-white">Orçamentos por Categoria</h2>
                <p className="text-slate-400 text-sm">Defina limites de gastos para cada categoria</p>
              </div>
              <Button 
                variant="gold" 
                leftIcon={<Plus className="h-4 w-4" />}
                onClick={() => setIsBudgetModalOpen(true)}
              >
                Novo Orçamento
              </Button>
            </div>

            {budgetsWithSpent.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {budgetsWithSpent.map((budget, index) => (
                  <BudgetCard 
                    key={budget.id} 
                    budget={budget} 
                    index={index}
                    onDelete={deleteBudget}
                  />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <Wallet className="h-12 w-12 mx-auto mb-3 text-slate-600" />
                  <p className="text-slate-400 mb-4">Nenhum orçamento definido</p>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsBudgetModalOpen(true)}
                  >
                    Criar primeiro orçamento
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Spending Overview */}
            <Card>
              <CardHeader icon={<BarChart3 className="h-5 w-5 text-purple-400" />}>
                <CardTitle>Resumo de Gastos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <p className="text-sm text-slate-400">Total Orçado</p>
                    <p className="text-2xl font-bold text-white mt-1">
                      {formatCurrency(budgets.reduce((sum, b) => sum + b.amount, 0))}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <p className="text-sm text-slate-400">Total Gasto</p>
                    <p className="text-2xl font-bold text-red-400 mt-1">
                      {formatCurrency(summary.totalExpenses)}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <p className="text-sm text-slate-400">Disponível</p>
                    <p className={cn(
                      "text-2xl font-bold mt-1",
                      budgets.reduce((sum, b) => sum + b.amount, 0) - summary.totalExpenses >= 0
                        ? "text-emerald-400"
                        : "text-red-400"
                    )}>
                      {formatCurrency(budgets.reduce((sum, b) => sum + b.amount, 0) - summary.totalExpenses)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {activeTab === 'goals' && (
          <motion.div
            key="goals"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-white">Metas Financeiras</h2>
                <p className="text-slate-400 text-sm">Acompanhe seu progresso rumo aos seus objetivos</p>
              </div>
              <Button 
                variant="gold" 
                leftIcon={<Plus className="h-4 w-4" />}
                onClick={() => setIsGoalModalOpen(true)}
              >
                Nova Meta
              </Button>
            </div>

            {/* Goals Summary */}
            <div className="grid sm:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-emerald-500/10">
                      <Target className="h-5 w-5 text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-400">Metas Ativas</p>
                      <p className="text-2xl font-bold text-white">{goals.filter(g => !g.completed).length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-blue-500/10">
                      <DollarSign className="h-5 w-5 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-400">Total Guardado</p>
                      <p className="text-2xl font-bold text-white">
                        {formatCurrency(goals.reduce((sum, g) => sum + g.current_value, 0))}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-amber-500/10">
                      <CheckCircle2 className="h-5 w-5 text-amber-400" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-400">Metas Concluídas</p>
                      <p className="text-2xl font-bold text-white">{goals.filter(g => g.completed).length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Goals List */}
            {goals.length > 0 ? (
              <div className="grid sm:grid-cols-2 gap-4">
                {goals.map((goal, index) => (
                  <GoalCard 
                    key={goal.id} 
                    goal={goal} 
                    index={index}
                    onDeposit={openDepositModal}
                    onDelete={deleteGoal}
                  />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <Target className="h-12 w-12 mx-auto mb-3 text-slate-600" />
                  <p className="text-slate-400 mb-4">Nenhuma meta definida</p>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsGoalModalOpen(true)}
                  >
                    Criar primeira meta
                  </Button>
                </CardContent>
              </Card>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Transaction Modal */}
      <Modal
        isOpen={isTransactionModalOpen}
        onClose={() => setIsTransactionModalOpen(false)}
        title="Nova Transação"
      >
        <div className="space-y-4">
          {/* Type Toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => setNewTransaction({ ...newTransaction, type: 'expense', category: 'Outros' })}
              className={cn(
                "flex-1 py-3 rounded-xl font-semibold transition-all",
                newTransaction.type === 'expense'
                  ? "bg-red-500/20 text-red-400 border border-red-500/30"
                  : "bg-white/5 text-slate-400 border border-transparent hover:bg-white/10"
              )}
            >
              <TrendingDown className="h-4 w-4 inline mr-2" />
              Despesa
            </button>
            <button
              onClick={() => setNewTransaction({ ...newTransaction, type: 'income', category: 'Salário' })}
              className={cn(
                "flex-1 py-3 rounded-xl font-semibold transition-all",
                newTransaction.type === 'income'
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  : "bg-white/5 text-slate-400 border border-transparent hover:bg-white/10"
              )}
            >
              <TrendingUp className="h-4 w-4 inline mr-2" />
              Receita
            </button>
          </div>

          <Input
            label="Descrição"
            placeholder="Ex: Supermercado, Salário..."
            value={newTransaction.title}
            onChange={(e) => setNewTransaction({ ...newTransaction, title: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Valor"
              type="number"
              placeholder="0,00"
              leftIcon={DollarSign}
              value={newTransaction.amount}
              onChange={(e) => setNewTransaction({ ...newTransaction, amount: e.target.value })}
            />
            <Input
              label="Data"
              type="date"
              value={newTransaction.date}
              onChange={(e) => setNewTransaction({ ...newTransaction, date: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Categoria
              </label>
              <select
                value={newTransaction.category}
                onChange={(e) => setNewTransaction({ ...newTransaction, category: e.target.value })}
                className="w-full h-10 px-3 rounded-xl bg-slate-900/50 border border-white/10 text-white focus:outline-none focus:border-blue-500/50"
              >
                {(newTransaction.type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES).map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Método de Pagamento
              </label>
              <select
                value={newTransaction.payment_method}
                onChange={(e) => setNewTransaction({ ...newTransaction, payment_method: e.target.value })}
                className="w-full h-10 px-3 rounded-xl bg-slate-900/50 border border-white/10 text-white focus:outline-none focus:border-blue-500/50"
              >
                {PAYMENT_METHODS.map(method => (
                  <option key={method} value={method}>{method}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Notas (opcional)
            </label>
            <textarea
              value={newTransaction.notes}
              onChange={(e) => setNewTransaction({ ...newTransaction, notes: e.target.value })}
              placeholder="Adicione observações..."
              className="w-full h-20 px-3 py-2 rounded-xl bg-slate-900/50 border border-white/10 text-white focus:outline-none focus:border-blue-500/50 resize-none"
            />
          </div>
        </div>

        <ModalFooter>
          <Button variant="ghost" onClick={() => setIsTransactionModalOpen(false)}>
            Cancelar
          </Button>
          <Button 
            variant={newTransaction.type === 'income' ? 'success' : 'destructive'}
            onClick={handleSaveTransaction}
          >
            Adicionar {newTransaction.type === 'income' ? 'Receita' : 'Despesa'}
          </Button>
        </ModalFooter>
      </Modal>

      {/* Budget Modal */}
      <Modal
        isOpen={isBudgetModalOpen}
        onClose={() => setIsBudgetModalOpen(false)}
        title="Novo Orçamento"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Categoria
            </label>
            <select
              value={newBudget.category}
              onChange={(e) => setNewBudget({ ...newBudget, category: e.target.value })}
              className="w-full h-10 px-3 rounded-xl bg-slate-900/50 border border-white/10 text-white focus:outline-none focus:border-blue-500/50"
            >
              {EXPENSE_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <Input
            label="Limite de Gastos"
            type="number"
            placeholder="0,00"
            leftIcon={DollarSign}
            value={newBudget.amount}
            onChange={(e) => setNewBudget({ ...newBudget, amount: e.target.value })}
          />

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Período
            </label>
            <select
              value={newBudget.period}
              onChange={(e) => setNewBudget({ ...newBudget, period: e.target.value as typeof newBudget.period })}
              className="w-full h-10 px-3 rounded-xl bg-slate-900/50 border border-white/10 text-white focus:outline-none focus:border-blue-500/50"
            >
              <option value="weekly">Semanal</option>
              <option value="monthly">Mensal</option>
              <option value="yearly">Anual</option>
            </select>
          </div>
        </div>

        <ModalFooter>
          <Button variant="ghost" onClick={() => setIsBudgetModalOpen(false)}>
            Cancelar
          </Button>
          <Button variant="gold" onClick={handleSaveBudget}>
            Criar Orçamento
          </Button>
        </ModalFooter>
      </Modal>

      {/* Goal Modal */}
      <Modal
        isOpen={isGoalModalOpen}
        onClose={() => setIsGoalModalOpen(false)}
        title="Nova Meta Financeira"
      >
        <div className="space-y-4">
          <Input
            label="Nome da Meta"
            placeholder="Ex: Reserva de emergência, Viagem..."
            value={newGoal.title}
            onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
          />

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Descrição (opcional)
            </label>
            <textarea
              value={newGoal.description}
              onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
              placeholder="Descreva sua meta..."
              className="w-full h-20 px-3 py-2 rounded-xl bg-slate-900/50 border border-white/10 text-white focus:outline-none focus:border-blue-500/50 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Tipo de Meta
            </label>
            <div className="grid grid-cols-2 gap-2">
              {GOAL_TYPES.map((type) => (
                <button
                  key={type.value}
                  onClick={() => setNewGoal({ ...newGoal, type: type.value as typeof newGoal.type })}
                  className={cn(
                    "flex items-center gap-2 p-3 rounded-xl border transition-all",
                    newGoal.type === type.value
                      ? "bg-amber-500/20 border-amber-500/30 text-amber-400"
                      : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10"
                  )}
                >
                  {type.icon === 'piggy-bank' && <PiggyBank className="h-4 w-4" />}
                  {type.icon === 'credit-card' && <CreditCard className="h-4 w-4" />}
                  {type.icon === 'trending-up' && <TrendingUp className="h-4 w-4" />}
                  {type.icon === 'shield' && <Shield className="h-4 w-4" />}
                  <span className="text-sm font-medium">{type.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Valor Alvo"
              type="number"
              placeholder="0,00"
              leftIcon={Target}
              value={newGoal.target_value}
              onChange={(e) => setNewGoal({ ...newGoal, target_value: e.target.value })}
            />
            <Input
              label="Já guardado"
              type="number"
              placeholder="0,00"
              leftIcon={DollarSign}
              value={newGoal.current_value}
              onChange={(e) => setNewGoal({ ...newGoal, current_value: e.target.value })}
            />
          </div>

          <Input
            label="Prazo (opcional)"
            type="date"
            value={newGoal.deadline}
            onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
          />
        </div>

        <ModalFooter>
          <Button variant="ghost" onClick={() => setIsGoalModalOpen(false)}>
            Cancelar
          </Button>
          <Button variant="gold" onClick={handleSaveGoal}>
            Criar Meta
          </Button>
        </ModalFooter>
      </Modal>

      {/* Deposit Modal */}
      <Modal
        isOpen={isDepositModalOpen}
        onClose={() => {
          setIsDepositModalOpen(false)
          setSelectedGoal(null)
          setDepositAmount('')
        }}
        title={`Depositar em "${selectedGoal?.title}"`}
      >
        <div className="space-y-4">
          {selectedGoal && (
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="flex justify-between items-center mb-2">
                <span className="text-slate-400">Progresso atual</span>
                <span className="text-white font-semibold">
                  {formatCurrency(selectedGoal.current_value)} / {formatCurrency(selectedGoal.target_value)}
                </span>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"
                  style={{ width: `${Math.min(100, (selectedGoal.current_value / selectedGoal.target_value) * 100)}%` }}
                />
              </div>
            </div>
          )}

          <Input
            label="Valor a depositar"
            type="number"
            placeholder="0,00"
            leftIcon={DollarSign}
            value={depositAmount}
            onChange={(e) => setDepositAmount(e.target.value)}
          />
        </div>

        <ModalFooter>
          <Button variant="ghost" onClick={() => {
            setIsDepositModalOpen(false)
            setSelectedGoal(null)
            setDepositAmount('')
          }}>
            Cancelar
          </Button>
          <Button variant="success" onClick={handleDeposit}>
            Depositar
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  )
}

// ========================================
// SUB-COMPONENTS
// ========================================

interface SummaryCardProps {
  icon: React.ElementType
  label: string
  value: number
  change?: string
  color: 'blue' | 'emerald' | 'red' | 'amber'
  suffix?: string
  isPercentage?: boolean
}

const colorStyles = {
  blue: {
    iconBg: 'from-blue-500/20 to-blue-600/10',
    icon: 'text-blue-400',
    value: 'text-white',
  },
  emerald: {
    iconBg: 'from-emerald-500/20 to-emerald-600/10',
    icon: 'text-emerald-400',
    value: 'text-emerald-400',
  },
  red: {
    iconBg: 'from-red-500/20 to-red-600/10',
    icon: 'text-red-400',
    value: 'text-red-400',
  },
  amber: {
    iconBg: 'from-amber-500/20 to-amber-600/10',
    icon: 'text-amber-400',
    value: 'text-amber-400',
  },
}

const SummaryCard: React.FC<SummaryCardProps> = ({ 
  icon: Icon, 
  label, 
  value, 
  change, 
  color,
  suffix = '',
  isPercentage = false,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
  >
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className={cn(
            "p-2 rounded-xl bg-gradient-to-br border border-white/10",
            colorStyles[color].iconBg
          )}>
            <Icon className={cn("h-5 w-5", colorStyles[color].icon)} />
          </div>
          {change && (
            <Badge
              variant={change.startsWith('+') ? 'success' : 'destructive'} 
              size="sm"
              icon={change.startsWith('+') ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            >
              {change}
            </Badge>
          )}
        </div>
        <p className="mt-3 text-xs text-slate-400">{label}</p>
        <p className={cn("text-2xl font-black mt-1", colorStyles[color].value)}>
          {isPercentage 
            ? `${value.toFixed(1)}${suffix}`
            : value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
          }
        </p>
      </CardContent>
    </Card>
  </motion.div>
)

interface TransactionItemProps {
  transaction: Transaction
  index: number
  onDelete: (id: string) => void
  showFullInfo?: boolean
}

const TransactionItem: React.FC<TransactionItemProps> = ({ 
  transaction, 
  index, 
  onDelete,
  showFullInfo = false,
}) => {
  const Icon = categoryIcons[transaction.category] || Circle
  const style = getCategoryStyle(transaction.category)
  
  const formattedDate = new Date(transaction.date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
  })
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.03 }}
      className="flex items-center gap-4 p-4 hover:bg-white/5 transition-colors group"
    >
      <div className={cn("p-2.5 rounded-xl", style.bg)}>
        <Icon className={cn("h-5 w-5", style.text)} />
      </div>
      
      <div className="flex-1 min-w-0">
        <p className="font-medium text-white truncate">{transaction.title}</p>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span>{transaction.category}</span>
          <span>•</span>
          <span>{formattedDate}</span>
          {showFullInfo && transaction.payment_method && (
            <>
              <span>•</span>
              <span>{transaction.payment_method}</span>
            </>
          )}
        </div>
      </div>
      
      <p className={cn(
        "font-semibold shrink-0 tabular-nums",
        transaction.type === 'income' ? "text-emerald-400" : "text-red-400"
      )}>
        {transaction.type === 'income' ? '+' : '-'}
        {Math.abs(transaction.amount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
      </p>
      
      <button
        onClick={() => onDelete(transaction.id)}
        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-500/20 text-red-400 transition-all"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </motion.div>
  )
}

interface BudgetCardProps {
  budget: Budget & { spent: number; remaining: number; percentage: number; isOverBudget: boolean }
  index: number
  onDelete: (id: string) => void
}

const BudgetCard: React.FC<BudgetCardProps> = ({ budget, index, onDelete }) => {
  const Icon = categoryIcons[budget.category] || Circle
  const style = getCategoryStyle(budget.category)
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className={budget.isOverBudget ? "border-red-500/30" : ""}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className={cn("p-2 rounded-xl", style.bg)}>
                <Icon className={cn("h-5 w-5", style.text)} />
              </div>
              <div>
                <p className="font-semibold text-white">{budget.category}</p>
                <p className="text-xs text-slate-500 capitalize">{budget.period === 'monthly' ? 'Mensal' : budget.period === 'weekly' ? 'Semanal' : 'Anual'}</p>
              </div>
            </div>
            <button
              onClick={() => onDelete(budget.id)}
              className="p-1.5 rounded-lg hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-all"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">
                {budget.spent.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </span>
              <span className="text-white font-medium">
                {budget.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </span>
            </div>
            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, budget.percentage)}%` }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                className={cn(
                  "h-full rounded-full",
                  budget.isOverBudget ? "bg-red-500" : style.bar
                )}
              />
            </div>
            <div className="flex justify-between items-center">
              <span className={cn(
                "text-xs font-medium",
                budget.isOverBudget ? "text-red-400" : "text-slate-400"
              )}>
                {budget.percentage.toFixed(0)}% usado
              </span>
              {budget.isOverBudget ? (
                <Badge variant="destructive" size="sm" icon={<AlertTriangle className="h-3 w-3" />}>
                  Excedido
                </Badge>
              ) : budget.percentage >= 80 ? (
                <Badge variant="warning" size="sm">
                  Atenção
                </Badge>
              ) : null}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

interface GoalCardProps {
  goal: FinancialGoal
  index: number
  onDeposit: (goal: FinancialGoal) => void
  onDelete: (id: string) => void
}

const GoalCard: React.FC<GoalCardProps> = ({ goal, index, onDeposit, onDelete }) => {
  const progress = goal.target_value > 0 ? (goal.current_value / goal.target_value) * 100 : 0
  const remaining = goal.target_value - goal.current_value
  
  const typeIcons = {
    savings: PiggyBank,
    debt: CreditCard,
    investment: TrendingUp,
    emergency: Shield,
  }
  
  const typeColors = {
    savings: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', bar: 'from-emerald-500 to-green-500' },
    debt: { bg: 'bg-red-500/10', text: 'text-red-400', bar: 'from-red-500 to-orange-500' },
    investment: { bg: 'bg-blue-500/10', text: 'text-blue-400', bar: 'from-blue-500 to-cyan-500' },
    emergency: { bg: 'bg-amber-500/10', text: 'text-amber-400', bar: 'from-amber-500 to-yellow-500' },
  }
  
  const Icon = typeIcons[goal.type] || Target
  const style = typeColors[goal.type] || typeColors.savings
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className={goal.completed ? "border-emerald-500/30" : ""}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={cn("p-2.5 rounded-xl", style.bg)}>
                <Icon className={cn("h-5 w-5", style.text)} />
              </div>
              <div>
                <p className="font-semibold text-white">{goal.title}</p>
                {goal.deadline && (
                  <p className="text-xs text-slate-500 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {new Date(goal.deadline).toLocaleDateString('pt-BR')}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1">
              {goal.completed && (
                <Badge variant="success" size="sm" icon={<CheckCircle2 className="h-3 w-3" />}>
                  Concluída
                </Badge>
              )}
              <button
                onClick={() => onDelete(goal.id)}
                className="p-1.5 rounded-lg hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-all"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
          
          {goal.description && (
            <p className="text-sm text-slate-400 mb-4 line-clamp-2">{goal.description}</p>
          )}
          
          <div className="space-y-3">
            <div className="flex justify-between items-end">
              <div>
                <p className="text-2xl font-bold text-white">
                  {goal.current_value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>
                <p className="text-xs text-slate-500">
                  de {goal.target_value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>
              </div>
              <p className={cn("text-lg font-bold", style.text)}>
                {progress.toFixed(0)}%
              </p>
            </div>
            
            <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, progress)}%` }}
                transition={{ duration: 1, delay: index * 0.1 }}
                className={cn("h-full rounded-full bg-gradient-to-r", style.bar)}
              />
            </div>
            
            {!goal.completed && (
              <div className="flex items-center justify-between pt-2">
                <p className="text-xs text-slate-400">
                  Faltam {remaining.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>
                <Button 
                  variant="outline" 
                  size="sm"
                  leftIcon={<Plus className="h-3 w-3" />}
                  onClick={() => onDeposit(goal)}
                >
                  Depositar
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
