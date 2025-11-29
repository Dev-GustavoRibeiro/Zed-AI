'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, 
  CheckSquare,
  Square,
  Trash2,
  Copy,
  Edit2,
  ShoppingCart,
  Plane,
  GraduationCap,
  FileText,
  Sparkles,
  X,
  Loader2,
} from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/shared/components/molecules/Card'
import { Button } from '@/shared/components/atoms/Button'
import { Badge } from '@/shared/components/atoms/Badge'
import { Input } from '@/shared/components/atoms/Input'
import { Modal, ModalFooter } from '@/shared/components/molecules/Modal'
import { useChecklists, Checklist, ChecklistItem } from '@/shared/hooks/useChecklists'

const TEMPLATE_CATEGORIES = {
  market: {
    name: 'Mercado',
    icon: ShoppingCart,
    defaultItems: [
      'Frutas e verduras',
      'Carnes e aves',
      'Laticínios',
      'Pães e massas',
      'Produtos de limpeza',
      'Higiene pessoal',
    ],
  },
  travel: {
    name: 'Viagem',
    icon: Plane,
    defaultItems: [
      'Passaporte/Identidade',
      'Passagens',
      'Roupas',
      'Itens de higiene',
      'Carregadores',
      'Medicamentos',
      'Documentos importantes',
    ],
  },
  exam: {
    name: 'Prova/Entrega',
    icon: GraduationCap,
    defaultItems: [
      'Revisar material',
      'Preparar canetas/lápis',
      'Levar documento',
      'Verificar horário',
      'Confirmar local',
      'Levar água',
    ],
  },
}

export default function ChecklistsPage() {
  const { 
    checklists, 
    isLoading, 
    createChecklist, 
    updateChecklist, 
    deleteChecklist, 
    addItem, 
    toggleItem, 
    deleteItem,
    duplicateChecklist,
  } = useChecklists()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false)
  const [editingChecklist, setEditingChecklist] = useState<Checklist | null>(null)
  const [newChecklist, setNewChecklist] = useState({
    title: '',
    description: '',
  })

  const handleToggleItem = async (itemId: string) => {
    await toggleItem(itemId)
  }

  const handleAddItem = async (checklistId: string, text: string) => {
    if (!text.trim()) return
    await addItem({ checklist_id: checklistId, title: text.trim() })
  }

  const handleDeleteItem = async (itemId: string) => {
    await deleteItem(itemId)
  }

  const handleDeleteChecklist = async (id: string) => {
    await deleteChecklist(id)
  }

  const handleDuplicateChecklist = async (id: string) => {
    await duplicateChecklist(id)
  }

  const createFromTemplate = async (templateCategory: keyof typeof TEMPLATE_CATEGORIES) => {
    const template = TEMPLATE_CATEGORIES[templateCategory]
    
    // Criar checklist
    const checklist = await createChecklist({
      title: `Lista de ${template.name}`,
      description: `Criada a partir do template ${template.name}`,
      template_name: templateCategory,
    })
    
    // Adicionar items padrão
    if (checklist) {
      for (let i = 0; i < template.defaultItems.length; i++) {
        await addItem({ 
          checklist_id: checklist.id, 
          title: template.defaultItems[i],
          order_index: i,
        })
      }
    }
    
    setIsTemplateModalOpen(false)
  }

  const handleSaveChecklist = async () => {
    if (!newChecklist.title) return

    if (editingChecklist) {
      await updateChecklist(editingChecklist.id, {
        title: newChecklist.title,
        description: newChecklist.description || undefined,
      })
    } else {
      await createChecklist({
        title: newChecklist.title,
        description: newChecklist.description || undefined,
      })
    }

    setIsModalOpen(false)
    setEditingChecklist(null)
    setNewChecklist({ title: '', description: '' })
  }

  const openEditModal = (checklist: Checklist) => {
    setEditingChecklist(checklist)
    setNewChecklist({
      title: checklist.title,
      description: checklist.description || '',
    })
    setIsModalOpen(true)
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white">Checklists</h1>
          <p className="text-sm sm:text-base text-slate-400">Listas recorrentes e templates</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Sparkles className="h-4 w-4" />}
            onClick={() => setIsTemplateModalOpen(true)}
          >
            Templates
          </Button>
          <Button
            variant="gold"
            size="sm"
            leftIcon={<Plus className="h-4 w-4" />}
            onClick={() => setIsModalOpen(true)}
          >
            Nova Lista
          </Button>
        </div>
      </motion.div>

      {/* Checklists Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <div className="col-span-full flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
          </div>
        ) : checklists.length > 0 ? (
          checklists.map((checklist) => {
            const items = checklist.items || []
            const completedCount = items.filter(i => i.completed).length
            const totalCount = items.length
            const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0

            return (
              <Card key={checklist.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-sm sm:text-base truncate">{checklist.title}</CardTitle>
                      {checklist.description && (
                        <p className="text-xs text-slate-500 mt-1 truncate">{checklist.description}</p>
                      )}
                    </div>
                    <div className="flex gap-1 ml-2">
                      <button
                        onClick={() => handleDuplicateChecklist(checklist.id)}
                        className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => openEditModal(checklist)}
                        className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteChecklist(checklist.id)}
                        className="p-1.5 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 mb-4">
                    {items.length > 0 ? (
                      items.map((item) => (
                        <ChecklistItemComponent
                          key={item.id}
                          item={item}
                          onToggle={() => handleToggleItem(item.id)}
                          onDelete={() => handleDeleteItem(item.id)}
                        />
                      ))
                    ) : (
                      <p className="text-sm text-slate-500 text-center py-4">
                        Nenhum item ainda
                      </p>
                    )}
                  </div>

                  {/* Add Item Input */}
                  <AddItemInput
                    onAdd={(text) => handleAddItem(checklist.id, text)}
                  />

                  {/* Progress */}
                  {totalCount > 0 && (
                    <div className="mt-4">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-slate-400">Progresso</span>
                        <span className="text-xs font-semibold text-white">
                          {completedCount}/{totalCount}
                        </span>
                      </div>
                      <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full transition-all duration-500"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })
        ) : (
          <div className="col-span-full py-12 text-center">
            <FileText className="h-12 w-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 mb-4">Nenhuma checklist criada</p>
            <Button
              variant="outline"
              onClick={() => setIsModalOpen(true)}
            >
              Criar primeira checklist
            </Button>
          </div>
        )}
      </div>

      {/* Create/Edit Checklist Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingChecklist(null)
          setNewChecklist({ title: '', description: '' })
        }}
        title={editingChecklist ? 'Editar Checklist' : 'Nova Checklist'}
      >
        <div className="space-y-4">
          <Input
            label="Nome"
            placeholder="Nome da checklist"
            value={newChecklist.title}
            onChange={(e) => setNewChecklist({ ...newChecklist, title: e.target.value })}
          />
          <Input
            label="Descrição (opcional)"
            placeholder="Descrição da checklist"
            value={newChecklist.description}
            onChange={(e) => setNewChecklist({ ...newChecklist, description: e.target.value })}
          />
        </div>
        <ModalFooter>
          <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
            Cancelar
          </Button>
          <Button variant="gold" onClick={handleSaveChecklist}>
            {editingChecklist ? 'Salvar' : 'Criar'}
          </Button>
        </ModalFooter>
      </Modal>

      {/* Template Modal */}
      <Modal
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        title="Criar a partir de Template"
      >
        <div className="space-y-3">
          {Object.entries(TEMPLATE_CATEGORIES).map(([key, template]) => {
            const Icon = template.icon
            return (
              <button
                key={key}
                onClick={() => createFromTemplate(key as keyof typeof TEMPLATE_CATEGORIES)}
                className={cn(
                  "w-full p-4 rounded-xl border text-left",
                  "bg-white/5 border-white/10 hover:border-blue-500/30 hover:bg-white/10",
                  "transition-all duration-200"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/20">
                    <Icon className="h-5 w-5 text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-white">{template.name}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {template.defaultItems.length} itens pré-configurados
                    </p>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
        <ModalFooter>
          <Button variant="ghost" onClick={() => setIsTemplateModalOpen(false)}>
            Fechar
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  )
}

// Checklist Item Component
interface ChecklistItemProps {
  item: ChecklistItem
  onToggle: () => void
  onDelete: () => void
}

const ChecklistItemComponent: React.FC<ChecklistItemProps> = ({ item, onToggle, onDelete }) => (
  <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/5 transition-colors">
    <button
      onClick={onToggle}
      className="shrink-0"
    >
      {item.completed ? (
        <CheckSquare className="h-4 w-4 text-emerald-400" />
      ) : (
        <Square className="h-4 w-4 text-slate-500 hover:text-slate-300" />
      )}
    </button>
    <p
      className={cn(
        "flex-1 text-sm",
        item.completed ? "text-slate-500 line-through" : "text-white"
      )}
    >
      {item.title}
    </p>
    <button
      onClick={onDelete}
      className="p-1 rounded hover:bg-red-500/10 text-slate-400 hover:text-red-400"
    >
      <X className="h-3 w-3" />
    </button>
  </div>
)

// Add Item Input Component
interface AddItemInputProps {
  onAdd: (text: string) => void
}

const AddItemInput: React.FC<AddItemInputProps> = ({ onAdd }) => {
  const [text, setText] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (text.trim()) {
      onAdd(text)
      setText('')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        placeholder="Adicionar item..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        className={cn(
          "flex-1 h-8 px-3 rounded-lg text-sm",
          "bg-slate-900/50 border border-white/10",
          "text-white placeholder:text-slate-500",
          "focus:outline-none focus:border-blue-500/50"
        )}
      />
      <Button
        type="submit"
        variant="ghost"
        size="sm"
        disabled={!text.trim()}
      >
        <Plus className="h-4 w-4" />
      </Button>
    </form>
  )
}
