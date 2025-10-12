-- Habilitar RLS nas tabelas existentes que não têm
ALTER TABLE public."Bengo" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Disparos" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Nacional" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Nacional_Cob" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Nacional_Estoque" ENABLE ROW LEVEL SECURITY;

-- Criar políticas permissivas para as tabelas existentes (pode ajustar depois conforme necessidade)
CREATE POLICY "Permitir todas as operações em Bengo"
ON public."Bengo" FOR ALL
USING (true)
WITH CHECK (true);

CREATE POLICY "Permitir todas as operações em Disparos"
ON public."Disparos" FOR ALL
USING (true)
WITH CHECK (true);

CREATE POLICY "Permitir todas as operações em Nacional"
ON public."Nacional" FOR ALL
USING (true)
WITH CHECK (true);

CREATE POLICY "Permitir todas as operações em Nacional_Cob"
ON public."Nacional_Cob" FOR ALL
USING (true)
WITH CHECK (true);

CREATE POLICY "Permitir todas as operações em Nacional_Estoque"
ON public."Nacional_Estoque" FOR ALL
USING (true)
WITH CHECK (true);