
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProjectWithPayments, PaymentStatus, ProjectStatus } from "@/types";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarDays, DollarSign, Users, FileText, CheckCircle, AlertCircle, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getProjectTeamMembers } from "@/data/mockData";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

interface ProjectDetailDialogProps {
  project: ProjectWithPayments;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ProjectDetailDialog({ 
  project, 
  open, 
  onOpenChange 
}: ProjectDetailDialogProps) {
  const [activeTab, setActiveTab] = useState("overview");
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            {project.name} 
            <Badge variant="outline" className={statusColors[project.status]}>
              {statusLabels[project.status]}
            </Badge>
          </DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="payments">Pagamentos</TabsTrigger>
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
      </DialogContent>
    </Dialog>
  );
}

import { Plus } from "lucide-react";
