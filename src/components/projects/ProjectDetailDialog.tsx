
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProjectWithPayments, PaymentStatus, ProjectStatus, Task } from "@/types";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  CalendarDays, DollarSign, Users, FileText, CheckCircle, 
  AlertCircle, Clock, List, Plus, Square, CheckSquare, 
  Trash2, CreditCard, Percent, Repeat, Edit 
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getProjectTeamMembers } from "@/data/mockData";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { updateProject } from "@/services/supabaseService";
import { Textarea } from "@/components/ui/textarea";

interface ProjectDetailDialogProps {
  project: ProjectWithPayments;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProjectUpdate?: (updatedProject: ProjectWithPayments) => void;
}

export default function ProjectDetailDialog({ 
  project, 
  open, 
  onOpenChange,
  onProjectUpdate
}: ProjectDetailDialogProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [tasks, setTasks] = useState<Task[]>(project.tasks || []);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: project.name,
    client: project.client,
    description: project.description || "",
    totalValue: project.totalValue,
    deadline: project.deadline
  });
  
  const teamMembers = getProjectTeamMembers(project);
  
  const progressPercentage = Math.round((project.paidAmount / project.totalValue) * 100);
  const isOverdue = project.deadline < new Date() && project.status !== ProjectStatus.ACTIVE;
  
  const statusLabels = {
    [ProjectStatus.NEW]: "Novo",
    [ProjectStatus.IN_PROGRESS]: "Em Andamento",
    [ProjectStatus.IN_PRODUCTION]: "Em Produção",
    [ProjectStatus.ACTIVE]: "Ativo",
  };
  
  const statusColors = {
    [ProjectStatus.NEW]: "bg-kanban-new",
    [ProjectStatus.IN_PROGRESS]: "bg-kanban-progress",
    [ProjectStatus.IN_PRODUCTION]: "bg-kanban-production",
    [ProjectStatus.ACTIVE]: "bg-kanban-active",
  };
  
  const paymentStatusIcon = {
    [PaymentStatus.PAID]: <CheckCircle className="h-4 w-4 text-green-500" />,
    [PaymentStatus.PENDING]: <Clock className="h-4 w-4 text-yellow-500" />,
    [PaymentStatus.OVERDUE]: <AlertCircle className="h-4 w-4 text-destructive" />,
  };
  
  const paymentStatusLabel = {
    [PaymentStatus.PAID]: "Pago",
    [PaymentStatus.PENDING]: "Pendente",
    [PaymentStatus.OVERDUE]: "Em Atraso",
  };

  const taskCompletionRate = tasks.length 
    ? Math.round((tasks.filter(task => task.completed).length / tasks.length) * 100) 
    : 0;

  const handleAddTask = () => {
    if (!newTaskTitle.trim()) {
      toast.error("O título da tarefa não pode estar vazio");
      return;
    }

    const newTask: Task = {
      id: crypto.randomUUID(),
      title: newTaskTitle,
      completed: false,
      projectId: project.id
    };

    setTasks([...tasks, newTask]);
    setNewTaskTitle("");
    toast.success("Tarefa adicionada com sucesso");
  };

  const toggleTaskCompletion = (taskId: string) => {
    setTasks(tasks.map(task => 
      task.id === taskId
        ? { ...task, completed: !task.completed }
        : task
    ));
    toast.success("Status da tarefa atualizado");
  };

  const deleteTask = (taskId: string) => {
    setTasks(tasks.filter(task => task.id !== taskId));
    toast.success("Tarefa removida com sucesso");
  };

  const handleEditClick = () => {
    setEditing(true);
    setActiveTab("overview");
  };

  const handleCancelEdit = () => {
    setEditing(false);
    setEditForm({
      name: project.name,
      client: project.client,
      description: project.description || "",
      totalValue: project.totalValue,
      deadline: project.deadline
    });
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: name === 'totalValue' ? parseFloat(value) : value
    }));
  };

  const handleSaveEdit = async () => {
    if (!editForm.name.trim() || !editForm.client.trim() || editForm.totalValue <= 0) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    try {
      // If it's a temporary project (client-side only)
      if (typeof project.id === 'string' && project.id.startsWith('temp-')) {
        const updatedProject = {
          ...project,
          name: editForm.name,
          client: editForm.client,
          description: editForm.description,
          totalValue: editForm.totalValue,
          deadline: editForm.deadline
        };
        
        if (onProjectUpdate) {
          onProjectUpdate(updatedProject);
        }
        
        setEditing(false);
        toast.success("Projeto atualizado com sucesso");
        return;
      }
      
      // If it's a database project
      const success = await updateProject(String(project.id), {
        name: editForm.name,
        client: editForm.client,
        description: editForm.description,
        total_value: editForm.totalValue,
        deadline: editForm.deadline
      });
      
      if (success) {
        const updatedProject = {
          ...project,
          name: editForm.name,
          client: editForm.client,
          description: editForm.description,
          totalValue: editForm.totalValue,
          deadline: editForm.deadline
        };
        
        if (onProjectUpdate) {
          onProjectUpdate(updatedProject);
        }
        
        setEditing(false);
        toast.success("Projeto atualizado com sucesso");
      } else {
        toast.error("Erro ao atualizar o projeto");
      }
    } catch (error) {
      console.error("Error updating project:", error);
      toast.error("Erro ao atualizar o projeto");
    }
  };

  const monthlyValue = project.isRecurring ? project.totalValue : undefined;
  const installmentValue = project.isInstallment && project.installmentCount 
    ? (project.totalValue / project.installmentCount) 
    : undefined;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              {project.name} 
              <Badge variant="outline" className={statusColors[project.status]}>
                {statusLabels[project.status]}
              </Badge>
            </div>
            <Button onClick={handleEditClick} variant="outline" size="sm" className="flex items-center gap-1">
              <Edit className="h-4 w-4" />
              Editar Projeto
            </Button>
          </DialogTitle>
        </DialogHeader>
        
        {editing ? (
          <div className="space-y-4 py-4">
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium">Nome do Projeto</label>
                  <Input 
                    id="name"
                    name="name"
                    value={editForm.name}
                    onChange={handleFormChange}
                    placeholder="Nome do projeto"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="client" className="text-sm font-medium">Cliente</label>
                  <Input 
                    id="client"
                    name="client"
                    value={editForm.client}
                    onChange={handleFormChange}
                    placeholder="Nome do cliente"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="totalValue" className="text-sm font-medium">Valor Total</label>
                  <Input 
                    id="totalValue"
                    name="totalValue"
                    type="number"
                    value={editForm.totalValue}
                    onChange={handleFormChange}
                    min={0}
                    step={0.01}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="deadline" className="text-sm font-medium">Prazo Final</label>
                  <Input 
                    id="deadline"
                    name="deadline"
                    type="date"
                    value={editForm.deadline ? new Date(editForm.deadline).toISOString().split('T')[0] : ''}
                    onChange={(e) => {
                      if (e.target.value) {
                        setEditForm(prev => ({
                          ...prev,
                          deadline: new Date(e.target.value)
                        }));
                      }
                    }}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="description" className="text-sm font-medium">Descrição</label>
                <Textarea 
                  id="description"
                  name="description"
                  value={editForm.description}
                  onChange={handleFormChange}
                  placeholder="Descrição do projeto"
                  rows={4}
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleCancelEdit}>Cancelar</Button>
              <Button onClick={handleSaveEdit}>Salvar Alterações</Button>
            </div>
          </div>
        ) : (
          <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Visão Geral</TabsTrigger>
              <TabsTrigger value="payments">Pagamentos</TabsTrigger>
              <TabsTrigger value="tasks">Tarefas</TabsTrigger>
              <TabsTrigger value="team">Equipe</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <CalendarDays className="h-4 w-4" />
                      Prazo
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className={`font-medium ${isOverdue ? 'text-destructive' : ''}`}>
                      {format(project.deadline, 'dd MMMM yyyy', { locale: ptBR })}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {isOverdue ? 'Em atraso' : 'No prazo'}
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Valor Total
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="font-medium">
                      {new Intl.NumberFormat('pt-BR', { 
                        style: 'currency', 
                        currency: 'BRL' 
                      }).format(project.totalValue)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Cliente: {project.client}
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Descrição
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{project.description}</p>
                  <div className="text-xs text-muted-foreground mt-2">
                    Criado em {format(project.createdAt, 'dd MMMM yyyy', { locale: ptBR })}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Progresso de Pagamento
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Progresso</span>
                    <span>{progressPercentage}%</span>
                  </div>
                  <Progress value={progressPercentage} className="h-2" />
                  <div className="flex justify-between text-sm">
                    <span>Pago: {new Intl.NumberFormat('pt-BR', { 
                      style: 'currency', 
                      currency: 'BRL' 
                    }).format(project.paidAmount)}</span>
                    <span>Restante: {new Intl.NumberFormat('pt-BR', { 
                      style: 'currency', 
                      currency: 'BRL' 
                    }).format(project.remainingAmount)}</span>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="payments" className="space-y-4 py-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Pagamentos</h3>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Pagamento
                </Button>
              </div>
              
              {project.payments.length > 0 ? (
                <div className="space-y-3">
                  {project.payments.map(payment => (
                    <Card key={payment.id}>
                      <CardContent className="p-4 flex items-center justify-between">
                        <div>
                          <div className="font-medium">{payment.description}</div>
                          <div className="text-sm text-muted-foreground">
                            Vencimento: {format(payment.dueDate, 'dd MMM yyyy', { locale: ptBR })}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">
                            {new Intl.NumberFormat('pt-BR', { 
                              style: 'currency', 
                              currency: 'BRL' 
                            }).format(payment.amount)}
                          </div>
                          <div className="flex items-center justify-end mt-1">
                            {paymentStatusIcon[payment.status]}
                            <span className="text-xs ml-1">{paymentStatusLabel[payment.status]}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhum pagamento registrado para este projeto.
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="tasks" className="space-y-4 py-4">
              <div className="flex flex-col space-y-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <List className="h-4 w-4" />
                      Taxa de Conclusão
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Progresso</span>
                      <span>{taskCompletionRate}%</span>
                    </div>
                    <Progress value={taskCompletionRate} className="h-2" />
                    <div className="text-sm">
                      {tasks.filter(task => task.completed).length} de {tasks.length} tarefas concluídas
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <List className="h-4 w-4" />
                      Tarefas do Projeto
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex gap-2">
                      <Input 
                        placeholder="Adicionar nova tarefa" 
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
                      />
                      <Button onClick={handleAddTask} size="icon">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>

                    {tasks.length > 0 ? (
                      <div className="space-y-2">
                        {tasks.map(task => (
                          <div key={task.id} className="flex items-center justify-between p-2 border rounded-md hover:bg-accent/10 group">
                            <div className="flex items-center gap-2">
                              <button 
                                onClick={() => toggleTaskCompletion(task.id)}
                                className="focus:outline-none"
                              >
                                {task.completed ? (
                                  <CheckSquare className="h-5 w-5 text-primary" />
                                ) : (
                                  <Square className="h-5 w-5 text-muted-foreground" />
                                )}
                              </button>
                              <span className={task.completed ? "line-through text-muted-foreground" : ""}>
                                {task.title}
                              </span>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => deleteTask(task.id)}
                              className="opacity-0 group-hover:opacity-100"
                            >
                              <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        Nenhuma tarefa cadastrada para este projeto.
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="team" className="space-y-4 py-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Membros da Equipe</h3>
                <Button size="sm">
                  <Users className="h-4 w-4 mr-2" />
                  Gerenciar Equipe
                </Button>
              </div>
              
              {teamMembers.length > 0 ? (
                <div className="space-y-3">
                  {teamMembers.map(member => (
                    <Card key={member.id}>
                      <CardContent className="p-4 flex items-center gap-4">
                        <Avatar>
                          <AvatarImage src={member.avatarUrl} alt={member.name} />
                          <AvatarFallback>
                            {member.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{member.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {member.email}
                          </div>
                        </div>
                        <Badge variant="outline" className="ml-auto">
                          {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                        </Badge>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhum membro atribuído a este projeto.
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}
