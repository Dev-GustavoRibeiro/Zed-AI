-- ZED Assistant - Extended Features Schema
-- Funcionalidades completas do ZED

-- =====================================================
-- TASKS - Melhorias (Status Kanban, Esforço, Energia)
-- =====================================================

-- Adicionar colunas à tabela tasks
ALTER TABLE tasks 
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'todo' CHECK (status IN ('todo', 'doing', 'done')),
  ADD COLUMN IF NOT EXISTS effort TEXT DEFAULT 'medium' CHECK (effort IN ('low', 'medium', 'high')),
  ADD COLUMN IF NOT EXISTS energy_level TEXT CHECK (energy_level IN ('low', 'medium', 'high')),
  ADD COLUMN IF NOT EXISTS estimated_duration INTEGER, -- em minutos
  ADD COLUMN IF NOT EXISTS area TEXT DEFAULT 'Pessoal' CHECK (area IN ('Pessoal', 'Trabalho', 'Estudos', 'Saúde', 'Casa/Família'));

-- =====================================================
-- ROUTINES - Rotinas Diárias e Semanais
-- =====================================================

CREATE TABLE IF NOT EXISTS routines (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('morning', 'work', 'study', 'evening', 'custom')),
  time_of_day TIME,
  days_of_week INTEGER[] DEFAULT ARRAY[1,2,3,4,5,6,7], -- 1=domingo, 7=sábado
  tasks_order INTEGER[], -- IDs das tarefas na ordem
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- REMINDERS - Lembretes Inteligentes
-- =====================================================

CREATE TABLE IF NOT EXISTS reminders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  reminder_type TEXT NOT NULL CHECK (reminder_type IN ('deadline', 'habit', 'event', 'custom')),
  related_task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  related_event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  reminder_time TIMESTAMPTZ NOT NULL,
  is_recurring BOOLEAN DEFAULT false,
  recurring_pattern TEXT, -- daily, weekly, monthly
  is_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- POMODORO - Timer de Foco e Produtividade
-- =====================================================

CREATE TABLE IF NOT EXISTS pomodoro_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
  duration INTEGER NOT NULL, -- em minutos (25, 30, 50, etc)
  completed BOOLEAN DEFAULT false,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  break_duration INTEGER DEFAULT 5, -- pausa em minutos
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- GOALS - Metas por Área da Vida (Expandido)
-- =====================================================

-- Adicionar colunas à tabela goals
ALTER TABLE goals
  ADD COLUMN IF NOT EXISTS area TEXT DEFAULT 'Geral' CHECK (area IN ('Saúde', 'Financeiro', 'Estudos', 'Trabalho', 'Pessoal', 'Relacionamentos', 'Geral')),
  ADD COLUMN IF NOT EXISTS timeframe TEXT DEFAULT 'short' CHECK (timeframe IN ('short', 'medium', 'long')), -- curto, médio, longo prazo
  ADD COLUMN IF NOT EXISTS progress_percentage DECIMAL(5,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS milestones JSONB DEFAULT '[]', -- marcos intermediários
  ADD COLUMN IF NOT EXISTS suggested_actions JSONB DEFAULT '[]'; -- ações sugeridas pelo ZED

-- =====================================================
-- CHECKLISTS - Listas Recorrentes e Templates
-- =====================================================

CREATE TABLE IF NOT EXISTS checklists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  is_template BOOLEAN DEFAULT false,
  template_category TEXT, -- 'market', 'travel', 'exam', 'custom'
  items JSONB NOT NULL DEFAULT '[]', -- array de {id, text, completed, order}
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- JOURNAL - Diário e Coach Inteligente
-- =====================================================

CREATE TABLE IF NOT EXISTS journal_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  mood TEXT CHECK (mood IN ('excellent', 'good', 'neutral', 'bad', 'terrible')),
  daily_question TEXT, -- pergunta do dia
  answer TEXT,
  what_went_well TEXT,
  what_to_improve TEXT,
  focus_tomorrow TEXT,
  insights JSONB DEFAULT '[]', -- insights gerados pelo ZED
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- =====================================================
-- WEEKLY_SUMMARIES - Resumos Semanais
-- =====================================================

CREATE TABLE IF NOT EXISTS weekly_summaries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  week_start DATE NOT NULL,
  week_end DATE NOT NULL,
  tasks_completed INTEGER DEFAULT 0,
  tasks_postponed INTEGER DEFAULT 0,
  pomodoro_sessions INTEGER DEFAULT 0,
  focus_hours DECIMAL(5,2) DEFAULT 0,
  achievements JSONB DEFAULT '[]',
  improvements JSONB DEFAULT '[]',
  insights TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, week_start)
);

-- =====================================================
-- FINANCIAL RECEIPTS - Comprovantes e Notas
-- =====================================================

CREATE TABLE IF NOT EXISTS receipt_uploads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  transaction_id UUID REFERENCES transactions(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  extracted_data JSONB, -- dados extraídos pelo ZED (valor, data, estabelecimento, etc)
  is_processed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- FINANCIAL ALERTS - Alertas Financeiros
-- =====================================================

CREATE TABLE IF NOT EXISTS financial_alerts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('bill_due', 'over_budget', 'unusual_spending', 'goal_reminder')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  related_budget_id UUID REFERENCES budgets(id) ON DELETE CASCADE,
  related_transaction_id UUID REFERENCES transactions(id) ON DELETE CASCADE,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_area ON tasks(area);
CREATE INDEX IF NOT EXISTS idx_routines_user_id ON routines(user_id);
CREATE INDEX IF NOT EXISTS idx_routines_type ON routines(type);
CREATE INDEX IF NOT EXISTS idx_reminders_user_id ON reminders(user_id);
CREATE INDEX IF NOT EXISTS idx_reminders_time ON reminders(reminder_time);
CREATE INDEX IF NOT EXISTS idx_pomodoro_user_id ON pomodoro_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_pomodoro_date ON pomodoro_sessions(start_time);
CREATE INDEX IF NOT EXISTS idx_goals_area ON goals(area);
CREATE INDEX IF NOT EXISTS idx_checklists_user_id ON checklists(user_id);
CREATE INDEX IF NOT EXISTS idx_checklists_template ON checklists(is_template);
CREATE INDEX IF NOT EXISTS idx_journal_user_date ON journal_entries(user_id, date);
CREATE INDEX IF NOT EXISTS idx_weekly_summaries_user ON weekly_summaries(user_id, week_start);
CREATE INDEX IF NOT EXISTS idx_receipt_uploads_user ON receipt_uploads(user_id);
CREATE INDEX IF NOT EXISTS idx_financial_alerts_user ON financial_alerts(user_id, is_read);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE routines ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE pomodoro_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE receipt_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_alerts ENABLE ROW LEVEL SECURITY;

-- Routines policies
CREATE POLICY "Users can manage own routines" ON routines
  FOR ALL USING (auth.uid() = user_id);

-- Reminders policies
CREATE POLICY "Users can manage own reminders" ON reminders
  FOR ALL USING (auth.uid() = user_id);

-- Pomodoro policies
CREATE POLICY "Users can manage own pomodoro sessions" ON pomodoro_sessions
  FOR ALL USING (auth.uid() = user_id);

-- Checklists policies
CREATE POLICY "Users can manage own checklists" ON checklists
  FOR ALL USING (auth.uid() = user_id);

-- Journal policies
CREATE POLICY "Users can manage own journal entries" ON journal_entries
  FOR ALL USING (auth.uid() = user_id);

-- Weekly summaries policies
CREATE POLICY "Users can manage own weekly summaries" ON weekly_summaries
  FOR ALL USING (auth.uid() = user_id);

-- Receipt uploads policies
CREATE POLICY "Users can manage own receipt uploads" ON receipt_uploads
  FOR ALL USING (auth.uid() = user_id);

-- Financial alerts policies
CREATE POLICY "Users can manage own financial alerts" ON financial_alerts
  FOR ALL USING (auth.uid() = user_id);

-- =====================================================
-- TRIGGERS
-- =====================================================

CREATE TRIGGER update_routines_updated_at
  BEFORE UPDATE ON routines
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_checklists_updated_at
  BEFORE UPDATE ON checklists
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_journal_updated_at
  BEFORE UPDATE ON journal_entries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();


