-- Criar tabela de negócios
CREATE TABLE IF NOT EXISTS public.negocios (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo TEXT NOT NULL,
  cliente TEXT NOT NULL,
  valor NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'Em Prospecção',
  probabilidade INTEGER CHECK (probabilidade >= 0 AND probabilidade <= 100),
  data_criacao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  data_fechamento_prevista DATE,
  data_fechamento_real DATE,
  descricao TEXT,
  responsavel TEXT,
  origem TEXT,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.negocios ENABLE ROW LEVEL SECURITY;

-- Política para permitir todas as operações (pode ser ajustada depois conforme necessidade de autenticação)
CREATE POLICY "Permitir todas as operações em negocios"
ON public.negocios
FOR ALL
USING (true)
WITH CHECK (true);

-- Trigger para atualizar updated_at automaticamente
CREATE TRIGGER set_negocios_updated_at
BEFORE UPDATE ON public.negocios
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- Criar índices para melhor performance
CREATE INDEX idx_negocios_status ON public.negocios(status);
CREATE INDEX idx_negocios_cliente ON public.negocios(cliente);
CREATE INDEX idx_negocios_data_criacao ON public.negocios(data_criacao DESC);