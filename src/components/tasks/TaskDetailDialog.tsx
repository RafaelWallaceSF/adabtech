
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Task, User } from "@/types";
import { toast } from "sonner";
import { format } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { updateTask, fetchProjects } from "@/services/supabaseService";

interface TaskDetailDialogProps {
  task: Task;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTaskUpdate: (task: Task) => void;
  onStatusToggle: (taskId: string, completed: boolean) => Promise<void>;
  users: User[];
}

export default function TaskDetailDialog({
  task,
  open,
  onOpenChange,
  onTaskUpdate,
  onStatusToggle,
  users
}: TaskDetailDialogProps) {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || "");
  const [dueDate, setDueDate] = useState<Date | undefined>(
    task.dueDate ? new Date(task.dueDate) : undefined
  );
  const [projectId, setProjectId] = useState<string>(task.projectId);
  const [assignedTo, setAssignedTo] = useState<string | undefined>(task.assignedTo);
  const [completed, setCompleted] = useState(task.completed || false);
  const [projects, setProjects] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingProjects, setLoadingProjects] = useState(false);

  useEffect(() => {
    if (open) {
      loadProjects();
    }
  }, [open]);

  useEffect(() => {
    // Reset form when task changes
    setTitle(task.title);
    setDescription(task.description || "");
    setDueDate(task.dueDate ? new Date(task.dueDate) : undefined);
    setProjectId(task.projectId);
    setAssignedTo(task.assignedTo);
    setCompleted(task.completed || false);
  }, [task]);

  const loadProjects = async () => {
    setLoadingProjects(true);
    try {
      const projectsData = await fetchProjects();
      setProjects(projectsData.map(p => ({ id: p.id, name: p.name })));
    } catch (error) {
      console.error("Error loading projects:", error);
      toast.error("Erro ao carregar projetos");
    } finally {
      setLoadingProjects(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !projectId) {
      toast.error("Preencha os campos obrigatórios");
      return;
    }

    setLoading(true);
    try {
      const updatedTask: Task = {
        ...task,
        title,
        description,
        dueDate: dueDate?.toISOString(),
        projectId,
        assignedTo,
        completed
      };

      const success = await updateTask(task.id, updatedTask);
      if (success) {
        onTaskUpdate(updatedTask);
        toast.success("Tarefa atualizada com sucesso");
        onOpenChange(false);
      } else {
        toast.error("Erro ao atualizar tarefa");
      }
    } catch (error) {
      console.error("Error updating task:", error);
      toast.error("Erro ao atualizar tarefa");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    try {
      const newStatus = !completed;
      await onStatusToggle(task.id, newStatus);
      setCompleted(newStatus);
    } catch (error) {
      console.error("Error toggling task status:", error);
    }
  };

  const getProjectName = (id: string): string => {
    const project = projects.find(p => p.id === id);
    return project ? project.name : "Projeto não encontrado";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">Detalhes da Tarefa</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Switch 
                id="completed" 
                checked={completed} 
                onCheckedChange={handleToggleStatus}
              />
              <Label htmlFor="completed" className="text-sm font-medium">
                {completed ? "Concluída" : "Pendente"}
              </Label>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Título da tarefa"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descrição da tarefa"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dueDate">Data de Vencimento</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  id="dueDate"
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

          <div className="space-y-2">
            <Label htmlFor="project">Projeto *</Label>
            <Select 
              value={projectId} 
              onValueChange={(value) => setProjectId(value)}
              disabled={loadingProjects}
            >
              <SelectTrigger id="project">
                <SelectValue placeholder={loadingProjects ? "Carregando..." : "Selecione um projeto"}>
                  {projectId ? getProjectName(projectId) : "Selecione um projeto"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {loadingProjects ? (
                  <div className="flex items-center justify-center p-2">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    <span>Carregando projetos...</span>
                  </div>
                ) : (
                  projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="assignedTo">Desenvolvedor Responsável</Label>
            <Select 
              value={assignedTo || ""} 
              onValueChange={(value) => setAssignedTo(value || undefined)}
            >
              <SelectTrigger id="assignedTo">
                <SelectValue placeholder="Selecione um desenvolvedor">
                  {assignedTo 
                    ? users.find(user => user.id === assignedTo)?.name || "Desenvolvedor não encontrado" 
                    : "Selecione um desenvolvedor"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Nenhum</SelectItem>
                {users.filter(user => user.role === 'developer').map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
