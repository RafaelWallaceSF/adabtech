import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ProjectStatus, ProjectWithPayments, Task, User } from "@/types";
import { format } from "date-fns";
import { CalendarIcon, Copy, Plus, Trash2, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { createTask, deleteTask, fetchTasks, updateTask } from "@/services/supabaseService";
import CreateTaskDialog from "@/components/tasks/CreateTaskDialog";
import { Checkbox } from "@/components/ui/checkbox";

interface ProjectDetailDialogProps {
  project: ProjectWithPayments;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProjectUpdate: (updatedProject: ProjectWithPayments) => void;
}

export default function ProjectDetailDialog({
  project,
  open,
  onOpenChange,
  onProjectUpdate
}: ProjectDetailDialogProps) {
  const [name, setName] = useState(project.name);
  const [client, setClient] = useState(project.client);
  const [totalValue, setTotalValue] = useState(project.totalValue.toString());
  const [status, setStatus] = useState(project.status);
  const [deadline, setDeadline] = useState<Date | undefined>(project.deadline);
  const [description, setDescription] = useState(project.description);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);

  useEffect(() => {
    loadTasks();
    fetchUsers();
  }, [project.id]);

  const loadTasks = async () => {
    setLoadingTasks(true);
    try {
      const tasksData = await fetchTasks(project.id);
      setTasks(tasksData);
    } catch (error) {
      toast.error("Erro ao carregar tarefas");
      console.error("Error loading tasks:", error);
    } finally {
      setLoadingTasks(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*');

      if (error) {
        toast.error("Erro ao carregar usuários");
        console.error("Error fetching users:", error);
      } else {
        setUsers(data as User[]);
      }
    } catch (error) {
      toast.error("Erro ao carregar usuários");
      console.error("Error fetching users:", error);
    }
  };

  const handleUpdateProject = async () => {
    try {
      const updatedProject = {
        ...project,
        name,
        client,
        totalValue: parseFloat(totalValue),
        status,
        deadline,
        description
      };

      const { error } = await supabase
        .from('projects')
        .update(updatedProject)
        .eq('id', project.id);

      if (error) {
        toast.error("Erro ao atualizar projeto");
        console.error("Error updating project:", error);
      } else {
        toast.success("Projeto atualizado com sucesso");
        onProjectUpdate(updatedProject);
        onOpenChange(false);
      }
    } catch (error) {
      toast.error("Erro ao atualizar projeto");
      console.error("Error updating project:", error);
    }
  };

  const handleStatusChange = (newStatus: ProjectStatus) => {
    setStatus(newStatus);
  };

  const handleTaskCreate = (newTask: Task) => {
    setTasks(prevTasks => [...prevTasks, newTask]);
  };

  const handleTaskUpdate = async (task: Task) => {
    try {
      const success = await updateTask(task);
      
      if (success) {
        setTasks(prevTasks => 
          prevTasks.map(t => t.id === task.id ? task : t)
        );
        toast.success("Tarefa atualizada com sucesso");
        setIsTaskDialogOpen(false);
      } else {
        toast.error("Erro ao atualizar tarefa");
      }
    } catch (error) {
      console.error("Error updating task:", error);
      toast.error("Erro ao atualizar tarefa");
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      const success = await deleteTask(taskId);
      
      if (success) {
        setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
        toast.success("Tarefa excluída com sucesso");
      } else {
        toast.error("Erro ao excluir tarefa");
      }
    } catch (error) {
      console.error("Error deleting task:", error);
      toast.error("Erro ao excluir tarefa");
    }
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsTaskDialogOpen(true);
  };

  const handleTaskCompleteToggle = async (task: Task) => {
    try {
      const updatedTask = { ...task, completed: !task.completed };
      const success = await updateTask(updatedTask);
      
      if (success) {
        setTasks(prevTasks => 
          prevTasks.map(t => t.id === task.id ? updatedTask : t)
        );
        toast.success("Status da tarefa atualizado");
      } else {
        toast.error("Erro ao atualizar status da tarefa");
      }
    } catch (error) {
      console.error("Error updating task status:", error);
      toast.error("Erro ao atualizar status da tarefa");
    }
  };

  const getAssignedUserName = (userId: string | undefined): string => {
    if (!userId) return 'Não atribuído';
    const user = users.find(u => u.id === userId);
    return user ? user.name || user.email : 'Usuário Desconhecido';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Detalhes do Projeto</DialogTitle>
          <DialogDescription>
            Visualize e edite os detalhes do projeto.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Nome do Projeto</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="client">Cliente</Label>
              <Input
                id="client"
                value={client}
                onChange={(e) => setClient(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="totalValue">Valor Total (R$)</Label>
              <Input
                id="totalValue"
                type="number"
                value={totalValue}
                onChange={(e) => setTotalValue(e.target.value)}
              />
            </div>

            <div>
              <Label>Status</Label>
              <Select value={status} onValueChange={handleStatusChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ProjectStatus.NEW}>Novo</SelectItem>
                  <SelectItem value={ProjectStatus.IN_PROGRESS}>Em Andamento</SelectItem>
                  <SelectItem value={ProjectStatus.IN_PRODUCTION}>Em Produção</SelectItem>
                  <SelectItem value={ProjectStatus.ACTIVE}>Ativo</SelectItem>
                  <SelectItem value={ProjectStatus.COMPLETED}>Concluído</SelectItem>
                  <SelectItem value={ProjectStatus.CANCELLED}>Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Prazo</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !deadline && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {deadline ? format(deadline, "dd/MM/yyyy") : <span>Selecione uma data</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={deadline}
                    onSelect={setDeadline}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="mt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">Tarefas</h3>
            <Button onClick={() => setIsCreateTaskOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Tarefa
            </Button>
          </div>

          {loadingTasks ? (
            <div className="text-center text-muted-foreground">Carregando tarefas...</div>
          ) : (
            <div className="space-y-2">
              {tasks.map(task => (
                <div key={task.id} className="border rounded-md p-3 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`task-${task.id}`}
                      checked={task.completed}
                      onCheckedChange={() => handleTaskCompleteToggle(task)}
                    />
                    <Label htmlFor={`task-${task.id}`} className="text-sm line-clamp-1">
                      {task.title}
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-muted-foreground">
                      {getAssignedUserName(task.assignedTo)}
                    </span>
                    <Button variant="ghost" size="icon" onClick={() => handleTaskClick(task)}>
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteTask(task.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {tasks.length === 0 && (
                <div className="text-center text-muted-foreground">Nenhuma tarefa encontrada.</div>
              )}
            </div>
          )}
        </div>

        <div className="mt-8 flex justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleUpdateProject} className="ml-2">
            Salvar
          </Button>
        </div>
      </DialogContent>

      <CreateTaskDialog
        open={isCreateTaskOpen}
        onOpenChange={setIsCreateTaskOpen}
        projectId={project.id}
        onSubmit={handleTaskCreate}
        users={users}
      />

      {selectedTask && (
        <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Editar Tarefa</DialogTitle>
              <DialogDescription>
                Atualize os detalhes da tarefa.
              </DialogDescription>
            </DialogHeader>

            <TaskDialogContent
              task={selectedTask}
              onUpdate={handleTaskUpdate}
              onClose={() => setIsTaskDialogOpen(false)}
              users={users}
            />
          </DialogContent>
        </Dialog>
      )}
    </Dialog>
  );
}

interface TaskDialogContentProps {
  task: Task;
  onUpdate: (task: Task) => void;
  onClose: () => void;
  users: User[];
}

const TaskDialogContent = ({ task, onUpdate, onClose, users }: TaskDialogContentProps) => {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || '');
  const [dueDate, setDueDate] = useState<Date | undefined>(task.dueDate ? new Date(task.dueDate) : undefined);
  const [assignedTo, setAssignedTo] = useState(task.assignedTo || '');

  const handleSubmit = async () => {
    const updatedTask = {
      ...task,
      title,
      description,
      dueDate: dueDate ? dueDate.toISOString() : undefined,
      assignedTo: assignedTo || undefined
    };
    onUpdate(updatedTask);
    onClose();
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="title">Título</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      <div>
        <Label htmlFor="description">Descrição</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div>
        <Label>Data de Vencimento</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-full justify-start text-left font-normal",
                !dueDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dueDate ? format(dueDate, "dd/MM/yyyy") : <span>Selecione uma data</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={dueDate}
              onSelect={setDueDate}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <div>
        <Label>Atribuir a</Label>
        <Select value={assignedTo} onValueChange={setAssignedTo}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione um usuário" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Ninguém</SelectItem>
            {users.map(user => (
              <SelectItem key={user.id} value={user.id}>
                {user.name || user.email}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end">
        <Button variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button onClick={handleSubmit} className="ml-2">
          Salvar
        </Button>
      </div>
    </div>
  );
};
