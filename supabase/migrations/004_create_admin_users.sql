-- Criar tabela admin_users se não existir
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('super_admin', 'admin', 'moderator', 'support')),
  permissions JSONB DEFAULT '{"users": false, "analytics": false, "settings": false}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Policy: Usuários podem ver seus próprios registros de admin
CREATE POLICY IF NOT EXISTS "Users can view own admin record"
ON admin_users FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Policy: Apenas service role pode inserir/atualizar/deletar
-- (Isso garante que apenas o backend pode gerenciar admins)
CREATE POLICY IF NOT EXISTS "Service role can manage admin_users"
ON admin_users FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Policy: Permitir que usuários autenticados vejam se são admin
-- (Necessário para verificação no frontend)
CREATE POLICY IF NOT EXISTS "Authenticated users can check if they are admin"
ON admin_users FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Criar índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_admin_users_user_id ON admin_users(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_users_role ON admin_users(role);

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_admin_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at
DROP TRIGGER IF EXISTS update_admin_users_updated_at_trigger ON admin_users;
CREATE TRIGGER update_admin_users_updated_at_trigger
  BEFORE UPDATE ON admin_users
  FOR EACH ROW
  EXECUTE FUNCTION update_admin_users_updated_at();

