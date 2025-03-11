
import React, { useState } from "react";
import { format } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { CalendarIcon, FileText, Search } from "lucide-react";
import { projects, getProjectsWithPayments, payments } from "@/data/mockData";
import { Project, ProjectStatus, ProjectWithPayments, Payment, PaymentStatus } from "@/types";
import { cn } from "@/lib/utils";

export default function Reports() {
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined,
  });
  
  const [selectedProject, setSelectedProject] = useState<string>("all");
  const projectsWithPayments = getProjectsWithPayments();
  
  // Get filtered data for reports
  const getFilteredData = () => {
    let filteredPayments = [...payments];
    let filteredProjects = [...projectsWithPayments];
    
    // Filter by project
    if (selectedProject !== "all") {
      filteredPayments = filteredPayments.filter(payment => payment.projectId === selectedProject);
      filteredProjects = filteredProjects.filter(project => project.id === selectedProject);
    }
    
    // Filter by date range
    if (dateRange.from) {
      filteredPayments = filteredPayments.filter(payment => {
        const paymentDate = payment.paidDate || payment.dueDate;
        return paymentDate >= dateRange.from!;
      });
    }
    
    if (dateRange.to) {
      filteredPayments = filteredPayments.filter(payment => {
        const paymentDate = payment.paidDate || payment.dueDate;
        return paymentDate <= dateRange.to!;
      });
    }
    
    return { filteredPayments, filteredProjects };
  };
  
  const { filteredPayments, filteredProjects } = getFilteredData();
  
  // Calculate summary data
  const totalProjectValue = filteredProjects.reduce((sum, project) => sum + project.totalValue, 0);
  const totalPaidAmount = filteredPayments
    .filter(payment => payment.status === PaymentStatus.PAID)
    .reduce((sum, payment) => sum + payment.amount, 0);
  const totalPendingAmount = filteredPayments
    .filter(payment => payment.status === PaymentStatus.PENDING)
    .reduce((sum, payment) => sum + payment.amount, 0);
  const totalOverdueAmount = filteredPayments
    .filter(payment => payment.status === PaymentStatus.OVERDUE)
    .reduce((sum, payment) => sum + payment.amount, 0);
  
  // Calculate task completion rate
  const taskCompletionRate = () => {
    const allTasks = filteredProjects.flatMap(project => project.tasks || []);
    if (allTasks.length === 0) return 0;
    
    const completedTasks = allTasks.filter(task => task.completed);
    return (completedTasks.length / allTasks.length) * 100;
  };

  const projectStatusCounts = filteredProjects.reduce((counts, project) => {
    counts[project.status] = (counts[project.status] || 0) + 1;
    return counts;
  }, {} as Record<ProjectStatus, number>);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Relatórios</h1>
      </div>
      
      <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
        {/* Date Range Selector */}
        <Card className="flex-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <CalendarIcon className="h-4 w-4" />
              Intervalo de Datas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dateRange.from && "text-muted-foreground"
                    )}
                  >
                    {dateRange.from ? (
                      format(dateRange.from, "dd/MM/yyyy")
                    ) : (
                      "Data inicial"
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateRange.from}
                    onSelect={(date) =>
                      setDateRange(prev => ({ ...prev, from: date }))
                    }
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
              
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dateRange.to && "text-muted-foreground"
                    )}
                  >
                    {dateRange.to ? (
                      format(dateRange.to, "dd/MM/yyyy")
                    ) : (
                      "Data final"
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateRange.to}
                    onSelect={(date) =>
                      setDateRange(prev => ({ ...prev, to: date }))
                    }
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </CardContent>
        </Card>
        
        {/* Project Selector */}
        <Card className="flex-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Projeto
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select 
              value={selectedProject} 
              onValueChange={setSelectedProject}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um projeto" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os projetos</SelectItem>
                {projects.map(project => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Valor Total dos Projetos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {totalProjectValue.toLocaleString('pt-BR')}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Valor Pago
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              R$ {totalPaidAmount.toLocaleString('pt-BR')}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pagamentos Pendentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-500">
              R$ {totalPendingAmount.toLocaleString('pt-BR')}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pagamentos Atrasados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              R$ {totalOverdueAmount.toLocaleString('pt-BR')}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Project Status and Progress */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Status dos Projetos</CardTitle>
            <CardDescription>
              Distribuição de projetos por status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(projectStatusCounts).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "w-3 h-3 rounded-full",
                      status === ProjectStatus.NEW ? "bg-blue-500" :
                      status === ProjectStatus.IN_PROGRESS ? "bg-amber-500" :
                      status === ProjectStatus.IN_PRODUCTION ? "bg-purple-500" :
                      "bg-green-500"
                    )} />
                    <span>
                      {status === ProjectStatus.NEW ? "Novo" :
                       status === ProjectStatus.IN_PROGRESS ? "Em Andamento" :
                       status === ProjectStatus.IN_PRODUCTION ? "Em Produção" :
                       "Ativo"}
                    </span>
                  </div>
                  <span className="font-medium">{count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Conclusão de Tarefas</CardTitle>
            <CardDescription>
              Taxa de conclusão de tarefas dos projetos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Taxa de conclusão</span>
                <span className="font-medium">{Math.round(taskCompletionRate())}%</span>
              </div>
              <Progress 
                value={taskCompletionRate()} 
                className="h-2"
                indicatorClassName={taskCompletionRate() === 100 ? "bg-green-500" : undefined}
              />
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Pagamentos</CardTitle>
          <CardDescription>
            Lista de pagamentos no período selecionado
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Projeto</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Data de Vencimento</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPayments.length > 0 ? filteredPayments.map(payment => {
                const project = projects.find(p => p.id === payment.projectId);
                return (
                  <TableRow key={payment.id}>
                    <TableCell className="font-medium">{project?.name}</TableCell>
                    <TableCell>{payment.description}</TableCell>
                    <TableCell>{format(payment.dueDate, "dd/MM/yyyy")}</TableCell>
                    <TableCell>R$ {payment.amount.toLocaleString('pt-BR')}</TableCell>
                    <TableCell>
                      <div className={cn(
                        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                        payment.status === PaymentStatus.PAID ? "bg-green-100 text-green-800" :
                        payment.status === PaymentStatus.PENDING ? "bg-amber-100 text-amber-800" :
                        "bg-red-100 text-red-800"
                      )}>
                        {payment.status === PaymentStatus.PAID ? "Pago" :
                         payment.status === PaymentStatus.PENDING ? "Pendente" :
                         "Atrasado"}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              }) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                    Nenhum pagamento encontrado para os filtros selecionados.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
