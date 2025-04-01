import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Task } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { CreateTaskDialog } from '@/components/tasks/CreateTaskDialog';
import { TaskDetailDialog } from '@/components/tasks/TaskDetailDialog';

const Tasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        toast.error("Erro ao carregar as tarefas");
        console.error("Error fetching tasks:", error);
      } else {
        setTasks(data as Task[]);
      }
    } catch (error) {
      toast.error("Erro ao carregar as tarefas");
      console.error("Error fetching tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleTaskCreated = () => {
    fetchTasks();
    toast.success("Tarefa criada com sucesso!");
  };

  const handleTaskUpdated = () => {
    fetchTasks();
    toast.success("Tarefa atualizada com sucesso!");
  };

  const handleTaskDeleted = () => {
    fetchTasks();
    toast.success("Tarefa excluída com sucesso!");
  };

  const handleOpenTaskDetail = (task: Task) => {
    setSelectedTask(task);
    setIsDetailDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tarefas</h1>
          <p className="text-muted-foreground">
            Gerencie suas tarefas e projetos
          </p>
        </div>
        <Button className="flex items-center gap-2" onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4" />
          Adicionar Tarefa
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center p-8">
          <p>Carregando tarefas...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tasks.map((task) => (
            <Card key={task.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center justify-between">
                  <span>{task.title || "Tarefa"}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div>
                  <div className="font-medium">{task.description}</div>
                  <div className="text-sm text-muted-foreground">
                    {task.dueDate && `Data de entrega: ${new Date(task.dueDate).toLocaleDateString()}`}
                  </div>
                  <Button variant="link" onClick={() => handleOpenTaskDetail(task)}>
                    Ver detalhes
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <CreateTaskDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onTaskCreated={handleTaskCreated}
      />

      {selectedTask && (
        <TaskDetailDialog
          open={isDetailDialogOpen}
          onOpenChange={setIsDetailDialogOpen}
          task={selectedTask}
          onTaskUpdated={handleTaskUpdated}
          onTaskDeleted={handleTaskDeleted}
        />
      )}
    </div>
  );
};

export default Tasks;
