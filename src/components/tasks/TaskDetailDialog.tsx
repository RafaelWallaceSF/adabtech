import { useState, useEffect } from "react";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CheckCircle, AlertTriangle } from 'lucide-react';
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Task } from "@/types";

interface TaskDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task | null;
  onTaskUpdated?: () => void;
  onTaskDeleted?: () => void;
}

export function TaskDetailDialog({ open, onOpenChange, task, onTaskUpdated, onTaskDeleted }: TaskDetailDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'Sem data definida';
    try {
      const date = new Date(dateString);
      return format(date, 'dd \'de\' MMMM \'de\' yyyy', { locale: ptBR });
    } catch (error) {
      console.error("Erro ao formatar a data:", error);
      return 'Data inválida';
    }
  };

  const handleDeleteTask = async () => {
    if (!task) return;

    setIsDeleting(true);

    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', task.id);

      if (error) {
        throw error;
      }

      toast.success("Tarefa excluída com sucesso!");

      if (onTaskDeleted) {
        onTaskDeleted();
      }

      onOpenChange(false);
    } catch (error: any) {
      toast.error("Erro ao excluir tarefa: " + (error.message || "Erro desconhecido"));
      console.error(error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleActionSelected = (actionId: string) => {
    if (actionId === 'delete' && task) {
      handleDeleteTask();
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{task?.title}</DialogTitle>
          <DialogDescription>
            Detalhes da tarefa.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium leading-none">Status:</p>
            {task?.completed ? (
              <Badge variant="outline">
                <CheckCircle className="mr-2 h-4 w-4" />
                Concluída
              </Badge>
            ) : (
              <Badge variant="destructive">
                <AlertTriangle className="mr-2 h-4 w-4" />
                Pendente
              </Badge>
            )}
          </div>

          <div className="space-y-1">
            <p className="text-sm font-medium leading-none">Descrição:</p>
            <p className="text-sm text-muted-foreground">{task?.description || "Nenhuma descrição fornecida."}</p>
          </div>

          <div className="space-y-1">
            <p className="text-sm font-medium leading-none">Data de entrega:</p>
            <p className="text-sm text-muted-foreground">{formatDate(task?.dueDate)}</p>
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
          <Button
            variant="destructive"
            disabled={isDeleting}
            onClick={() => handleActionSelected('delete')}
          >
            {isDeleting ? "Excluindo..." : "Excluir Tarefa"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
