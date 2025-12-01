-- ZED Assistant - Update Goals Types
-- Adiciona novos tipos de metas financeiras
-- NOTA: Esta migration já foi aplicada ao banco de dados

-- =====================================================
-- ATUALIZAÇÃO DA TABELA GOALS
-- =====================================================

-- Adicionar coluna type para categorizar tipos de metas
ALTER TABLE goals ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'savings';

-- Adicionar constraint para os tipos permitidos
ALTER TABLE goals ADD CONSTRAINT goals_type_check 
  CHECK (type IN ('savings', 'habit', 'milestone', 'debt', 'investment', 'emergency'));

-- Adicionar coluna color para personalização visual
ALTER TABLE goals ADD COLUMN IF NOT EXISTS color TEXT DEFAULT '#f59e0b';

-- Criar índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_goals_type ON goals(type);

