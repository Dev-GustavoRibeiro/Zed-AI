'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
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
  MoreVertical,
  Search,
  ShoppingCart,
  Car,
  Home,
  Utensils,
  Gamepad2,
  Briefcase,
  Loader2,
  Trash2,
} from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/shared/components/molecules/Card'
import { Button } from '@/shared/components/atoms/Button'
import { Badge } from '@/shared/components/atoms/Badge'
import { Input } from '@/shared/components/atoms/Input'
import { Modal, ModalFooter } from '@/shared/components/molecules/Modal'
import { useTransactions, Transaction } from '@/shared/hooks/useTransactions'

const categoryIcons: Record<string, React.ElementType> = {
  'Alimentação': Utensils,
  'Transporte': Car,
  'Moradia': Home,
  'Assinaturas': Gamepad2,
  'Receita': Briefcase,
  'Saúde': PiggyBank,
  'Outros': ShoppingCart,
}

const categoryColors: Record<string, string> = {
  'Alimentação': 'text-orange-400 bg-orange-500/10',
  'Transporte': 'text-blue-400 bg-blue-500/10',
  'Moradia': 'text-purple-400 bg-purple-500/10',
  'Assinaturas': 'text-pink-400 bg-pink-500/10',
  'Receita': 'text-emerald-400 bg-emerald-500/10',
  'Saúde': 'text-red-400 bg-red-500/10',
  'Lazer': 'text-cyan-400 bg-cyan-500/10',
  'Educação': 'text-indigo-400 bg-indigo-500/10',
  'Outros': 'text-slate-400 bg-slate-500/10',
}

// Helper para obter cor da categoria com fallback
const getCategoryColor = (category: string): string => {
  return categoryColors[category] || categoryColors['Outros']
}

export default function FinancesPage() {
  const { 
    transactions, 
    isLoading, 
    addTransaction, 
    deleteTransaction,
    totalIncome, 
    totalExpenses, 
    balance, 
    expensesByCategory 
  } = useTransactions()
  
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all')
  const [newTransaction, setNewTransaction] = useState({
    title: '',
    amount: '',
    category: 'Outros',
    type: 'expense' as 'income' | 'expense',
  })

  const filteredTransactions = transactions.filter(t => {
    if (filter === 'all') return true
    return t.type === filter
  })

  const handleSaveTransaction = async () => {
    if (!newTransaction.title || !newTransaction.amount) return
    
    const amount = parseFloat(newTransaction.amount)
    await addTransaction({
      title: newTransaction.title,
      amount: newTransaction.type === 'expense' ? -Math.abs(amount) : Math.abs(amount),
      category: newTransaction.category,
      type: newTransaction.type,
      date: new Date().toISOString().split('T')[0],
    })
    
    setIsModalOpen(false)
    setNewTransaction({ title: '', amount: '', category: 'Outros', type: 'expense' })
  }

  const handleDeleteTransaction = async (id: string) => {
    await deleteTransaction(id)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-black text-white">Financeiro</h1>
          <p className="text-slate-400">Controle seus gastos e receitas</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" leftIcon={<Download className="h-4 w-4" />}>
            Exportar
          </Button>
          <Button 
            variant="gold" 
            leftIcon={<Plus className="h-4 w-4" />}
            onClick={() => setIsModalOpen(true)}
          >
            Nova Transação
          </Button>
        </div>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          icon={Wallet}
          label="Saldo Atual"
          value={balance}
          color="blue"
        />
        <SummaryCard
          icon={TrendingUp}
          label="Receitas"
          value={totalIncome}
          change="+12%"
          color="emerald"
        />
        <SummaryCard
          icon={TrendingDown}
          label="Despesas"
          value={totalExpenses}
          change="-8%"
          color="red"
        />
        <SummaryCard
          icon={PiggyBank}
          label="Economizado"
          value={balance > 0 ? balance : 0}
          color="amber"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Transactions List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader
              icon={<CreditCard className="h-5 w-5 text-blue-400" />}
              action={
                <div className="flex gap-2">
                  <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value as 'all' | 'income' | 'expense')}
                    className={cn(
                      "h-8 px-3 rounded-lg text-sm",
                      "bg-white/5 border border-white/10",
                      "text-white focus:outline-none"
                    )}
                  >
                    <option value="all">Todos</option>
                    <option value="income">Receitas</option>
                    <option value="expense">Despesas</option>
                  </select>
                </div>
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
                ) : filteredTransactions.length > 0 ? (
                  filteredTransactions.map((transaction, index) => (
                    <TransactionItem 
                      key={transaction.id} 
                      transaction={transaction} 
                      index={index}
                      onDelete={handleDeleteTransaction}
                    />
                  ))
                ) : (
                  <div className="py-12 text-center text-slate-500">
                    Nenhuma transação registrada
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="ghost" size="sm" className="w-full">
                Ver todas as transações
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Expenses by Category */}
        <div>
          <Card>
            <CardHeader icon={<Filter className="h-5 w-5 text-amber-400" />}>
              <CardTitle>Gastos por Categoria</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(expensesByCategory)
                .sort(([,a], [,b]) => b - a)
                .map(([category, amount]) => {
                  const Icon = categoryIcons[category] || ShoppingCart
                  const percentage = (amount / totalExpenses) * 100
                  
                  return (
                    <div key={category} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={cn(
                            "p-1.5 rounded-lg",
                            getCategoryColor(category)
                          )}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <span className="text-sm text-white">{category}</span>
                        </div>
                        <span className="text-sm font-semibold text-white">
                          {amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </span>
                      </div>
                      <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ duration: 0.5, delay: 0.1 }}
                          className={cn(
                            "h-full rounded-full",
                            getCategoryColor(category).includes('orange') && "bg-orange-500",
                            getCategoryColor(category).includes('blue') && "bg-blue-500",
                            getCategoryColor(category).includes('purple') && "bg-purple-500",
                            getCategoryColor(category).includes('pink') && "bg-pink-500",
                            getCategoryColor(category).includes('red') && "bg-red-500",
                            getCategoryColor(category).includes('cyan') && "bg-cyan-500",
                            getCategoryColor(category).includes('indigo') && "bg-indigo-500",
                            getCategoryColor(category).includes('slate') && "bg-slate-500",
                          )}
                        />
                      </div>
                      <p className="text-xs text-slate-500 text-right">
                        {percentage.toFixed(1)}% do total
                      </p>
                    </div>
                  )
                })}
            </CardContent>
          </Card>

          {/* Budget Alert */}
          <Card variant="gold" className="mt-4">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-amber-500/20">
                  <TrendingUp className="h-5 w-5 text-amber-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-white">Dica do ZED</h4>
                  <p className="text-sm text-slate-300 mt-1">
                    Você gastou 36% do seu orçamento em alimentação. Considere preparar mais refeições em casa!
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add Transaction Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Nova Transação"
      >
        <div className="space-y-4">
          {/* Type Toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => setNewTransaction({ ...newTransaction, type: 'expense' })}
              className={cn(
                "flex-1 py-3 rounded-xl font-semibold transition-all",
                newTransaction.type === 'expense'
                  ? "bg-red-500/20 text-red-400 border border-red-500/30"
                  : "bg-white/5 text-slate-400 border border-transparent"
              )}
            >
              Despesa
            </button>
            <button
              onClick={() => setNewTransaction({ ...newTransaction, type: 'income' })}
              className={cn(
                "flex-1 py-3 rounded-xl font-semibold transition-all",
                newTransaction.type === 'income'
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  : "bg-white/5 text-slate-400 border border-transparent"
              )}
            >
              Receita
            </button>
          </div>

          <Input
            label="Descrição"
            placeholder="Ex: Supermercado, Salário..."
            value={newTransaction.title}
            onChange={(e) => setNewTransaction({ ...newTransaction, title: e.target.value })}
          />

          <Input
            label="Valor"
            type="number"
            placeholder="0,00"
            value={newTransaction.amount}
            onChange={(e) => setNewTransaction({ ...newTransaction, amount: e.target.value })}
          />

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Categoria
            </label>
            <select
              value={newTransaction.category}
              onChange={(e) => setNewTransaction({ ...newTransaction, category: e.target.value })}
              className={cn(
                "w-full h-10 px-3 rounded-xl",
                "bg-slate-900/50 border border-white/10",
                "text-white",
                "focus:outline-none focus:border-blue-500/50"
              )}
            >
              <option value="Alimentação">Alimentação</option>
              <option value="Transporte">Transporte</option>
              <option value="Moradia">Moradia</option>
              <option value="Assinaturas">Assinaturas</option>
              <option value="Saúde">Saúde</option>
              <option value="Receita">Receita</option>
              <option value="Outros">Outros</option>
            </select>
          </div>
        </div>

        <ModalFooter>
          <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
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
    </div>
  )
}

// Summary Card Component
interface SummaryCardProps {
  icon: React.ElementType
  label: string
  value: number
  change?: string
  color: 'blue' | 'emerald' | 'red' | 'amber'
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

const SummaryCard: React.FC<SummaryCardProps> = ({ icon: Icon, label, value, change, color }) => (
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
          {value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
        </p>
      </CardContent>
    </Card>
  </motion.div>
)

// Transaction Item Component
interface TransactionItemProps {
  transaction: Transaction
  index: number
  onDelete: (id: string) => void
}

const TransactionItem: React.FC<TransactionItemProps> = ({ transaction, index, onDelete }) => {
  const Icon = categoryIcons[transaction.category] || ShoppingCart
  
  // Formatar data
  const formattedDate = new Date(transaction.date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="flex items-center gap-4 p-4 hover:bg-white/5 transition-colors group"
    >
      <div className={cn(
        "p-2.5 rounded-xl",
        getCategoryColor(transaction.category)
      )}>
        <Icon className="h-5 w-5" />
      </div>
      
      <div className="flex-1 min-w-0">
        <p className="font-medium text-white truncate">{transaction.title}</p>
        <p className="text-xs text-slate-500">{transaction.category} • {formattedDate}</p>
      </div>
      
      <p className={cn(
        "font-semibold shrink-0",
        transaction.type === 'income' ? "text-emerald-400" : "text-red-400"
      )}>
        {transaction.type === 'income' ? '+' : ''}
        {transaction.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
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

