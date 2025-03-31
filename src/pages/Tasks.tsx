
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PlusCircle, Calendar } from "lucide-react";
import { Task, User } from "@/types";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { fetchTasks, fetchUsers, updateTaskStatus } from "@/services/supabaseService";
import TaskDetailDialog from "@/components/tasks/TaskDetailDialog";
import CreateTaskDialog from "@/components/tasks/CreateTaskDialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    loadTasks();
    loadUsers();
  }, []);

  const loadTasks = async () => {
    setLoading(true);
    try {
      const fetchedTasks = await fetchTasks();
      setTasks(fetchedTasks);
    } catch (error) {
      console.error("Error loading tasks:", error);
      toast.error("Erro ao carregar tarefas");
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const usersData = await fetchUsers();
      setUsers(usersData);
    } catch (error) {
      console.error("Error loading users:", error);
      toast.error("Erro ao carregar usuários");
    }
  };

  const handleCreateTask = (newTask: Task) => {
    setTasks(prev => [...prev, newTask]);
    setIsCreateOpen(false);
    toast.success("Tarefa criada com sucesso");
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsDetailOpen(true);
  };

  const handleTaskUpdate = (updatedTask: Task) => {
    setTasks(prev => prev.map(task => 
      task.id === updatedTask.id ? updatedTask : task
    ));
    toast.success("Tarefa atualizada com sucesso");
  };

  const handleToggleTaskStatus = async (taskId: string, completed: boolean) => {
    try {
      await updateTaskStatus(taskId, completed);
      setTasks(prev => prev.map(task => 
        task.id === taskId ? { ...task, completed } : task
      ));
      toast.success(completed ? "Tarefa concluída" : "Tarefa marcada como pendente");
    } catch (error) {
      console.error("Error updating task status:", error);
      toast.error("Erro ao atualizar status da tarefa");
    }
  };

  const completedTasks = tasks.filter(task => task.completed);
  const pendingTasks = tasks.filter(task => !task.completed);

  const getUserById = (userId: string): User | undefined => {
    return users.find(user => user.id === userId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-xl text-muted-foreground">Carregando tarefas...</div>
      </div>
    );
  }

  const TaskCard = ({ task }: { task: Task }) => {
    const assignedUser = task.assignedTo ? getUserById(task.assignedTo) : undefined;
    
    return (
      <Card 
        className="mb-4 hover:shadow-md transition-shadow cursor-pointer"
        onClick={() => handleTaskClick(task)}
      >
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <h3 className="font-medium">{task.title}</h3>
                {task.dueDate && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {format(new Date(task.dueDate), "dd/MM/yyyy")}
                  </Badge>
                )}
                <Badge variant={task.completed ? "success" : "secondary"}>
                  {task.completed ? "Concluído" : "Pendente"}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{task.description}</p>
            </div>
            
            {assignedUser && (
              <Avatar className="h-8 w-8">
                <AvatarImage src={assignedUser.avatarUrl} alt={assignedUser.name} />
                <AvatarFallback>{assignedUser.name?.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tarefas</h1>
          <p className="text-muted-foreground">Gerencie as tarefas de todos os projetos</p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Nova Tarefa
        </Button>
      </div>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="pending">
            Pendentes ({pendingTasks.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Concluídas ({completedTasks.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="pending" className="mt-4">
          {pendingTasks.length > 0 ? (
            pendingTasks.map(task => (
              <TaskCard key={task.id} task={task} />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center h-48 bg-muted/20 rounded-lg">
              <p className="text-muted-foreground">Não há tarefas pendentes</p>
              <Button variant="link" onClick={() => setIsCreateOpen(true)}>
                Criar nova tarefa
              </Button>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="completed" className="mt-4">
          {completedTasks.length > 0 ? (
            completedTasks.map(task => (
              <TaskCard key={task.id} task={task} />
            ))
          ) : (
            <div className="flex items-center justify-center h-48 bg-muted/20 rounded-lg">
              <p className="text-muted-foreground">Não há tarefas concluídas</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {selectedTask && (
        <TaskDetailDialog
          task={selectedTask}
          open={isDetailOpen}
          onOpenChange={setIsDetailOpen}
          onTaskUpdate={handleTaskUpdate}
          onStatusToggle={handleToggleTaskStatus}
          users={users}
        />
      )}

      <CreateTaskDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSubmit={handleCreateTask}
        users={users}
      />
    </div>
  );
}
