
import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { CalendarIcon, FileText, Search, Users } from "lucide-react";
import { Project, ProjectStatus, ProjectWithPayments, Payment, PaymentStatus, User } from "@/types";
import { cn } from "@/lib/utils";
import { fetchProjects, fetchUsers } from "@/services/supabaseService";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Reports() {
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined,
  });
  
  const [selectedProject, setSelectedProject] = useState<string>("all");
  const [selectedDeveloper, setSelectedDeveloper] = useState<string>("all");
  const [projects, setProjects] = useState<ProjectWithPayments[]>([]);
  const [developers, setDevelopers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("projects");
  
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const projectsData = await fetchProjects();
        
        // Convert to ProjectWithPayments format
        const projectsWithPayments = projectsData.map(project => ({
          ...project,
          payments: [],
          paidAmount: 0,
          remainingAmount: project.totalValue,
          tasks: []
        }));
        
        setProjects(projectsWithPayments);
        
        const usersData = await fetchUsers();
        setDevelopers(usersData.filter(user => user.role === 'developer'));
      } catch (error) {
        console.error("Error loading data for reports:", error);
        toast.error("Erro ao carregar dados para relatórios");
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);
  
  // Get filtered data for reports
  const getFilteredData = () => {
    let filteredProjects = [...projects];
    
    // Filter by project
    if (selectedProject !== "all") {
      filteredProjects = filteredProjects.filter(project => project.id === selectedProject);
    }
    
    // Filter by date range
    if (dateRange.from) {
      filteredProjects = filteredProjects.filter(project => {
        return project.createdAt >= dateRange.from!;
      });
    }
    
    if (dateRange.to) {
      filteredProjects = filteredProjects.filter(project => {
        return project.createdAt <= dateRange.to!;
      });
    }
    
    // Filter by developer (for developer tab)
    let filteredByDeveloper = filteredProjects;
    if (selectedDeveloper !== "all") {
      filteredByDeveloper = filteredProjects.filter(project => 
        project.teamMembers.includes(selectedDeveloper)
      );
    }
    
    return { filteredProjects, filteredByDeveloper };
  };
  
  const { filteredProjects, filteredByDeveloper } = getFilteredData();
  
  // Calculate summary data
  const totalProjectValue = filteredProjects.reduce((sum, project) => sum + project.totalValue, 0);
  
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
  
  // Developer-specific data
  const calculateDeveloperShareValue = (project: ProjectWithPayments, developerId: string): number => {
    if (!project.developerShares || !project.developerShares[developerId]) {
      return 0;
    }
    
    const share = project.developerShares[developerId];
    return (share / 100) * project.totalValue;
  };
  
  const getDeveloperProjectsData = () => {
    if (selectedDeveloper === 'all') {
      return developers.map(dev => {
        const devProjects = filteredProjects.filter(p => p.teamMembers.includes(dev.id));
        const totalValue = devProjects.reduce((sum, p) => sum + calculateDeveloperShareValue(p, dev.id), 0);
        const projectCount = devProjects.length;
        
        return {
          developer: dev,
          projectCount,
          totalValue
        };
      });
    } else {
      const dev = developers.find(d => d.id === selectedDeveloper);
      if (!dev) return [];
      
      const devProjects = filteredByDeveloper;
      const totalValue = devProjects.reduce((sum, p) => sum + calculateDeveloperShareValue(p, dev.id), 0);
      const projectCount = devProjects.length;
      
      return [{
        developer: dev,
        projectCount,
        totalValue
      }];
    }
  };
  
  const developerData = getDeveloperProjectsData();

  // Developer projects details
  const getDeveloperProjectDetails = () => {
    if (selectedDeveloper === 'all') return [];
    
    return filteredByDeveloper.map(project => {
      const shareValue = calculateDeveloperShareValue(project, selectedDeveloper);
      const sharePercentage = project.developerShares?.[selectedDeveloper] || 0;
      
      return {
        project,
        shareValue,
        sharePercentage
      };
    });
  };
  
  const developerProjectDetails = getDeveloperProjectDetails();
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-xl text-muted-foreground">Carregando relatórios...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Relatórios</h1>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="projects">Projetos</TabsTrigger>
          <TabsTrigger value="developers">Desenvolvedores</TabsTrigger>
        </TabsList>
        
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
          
          {/* Filter Selector */}
          <Card className="flex-1">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                {activeTab === "projects" ? (
                  <FileText className="h-4 w-4" />
                ) : (
                  <Users className="h-4 w-4" />
                )}
                {activeTab === "projects" ? "Projeto" : "Desenvolvedor"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {activeTab === "projects" ? (
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
              ) : (
                <Select 
                  value={selectedDeveloper} 
                  onValueChange={setSelectedDeveloper}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um desenvolvedor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os desenvolvedores</SelectItem>
                    {developers.map(dev => (
                      <SelectItem key={dev.id} value={dev.id}>
                        {dev.name || dev.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </CardContent>
          </Card>
        </div>
        
        <TabsContent value="projects" className="space-y-4">
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
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalProjectValue)}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Projetos Ativos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {filteredProjects.filter(p => p.status !== ProjectStatus.ACTIVE).length}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  De um total de {filteredProjects.length} projetos
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Conclusão de Projetos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {filteredProjects.length > 0 
                    ? Math.round((filteredProjects.filter(p => p.status === ProjectStatus.ACTIVE).length / filteredProjects.length) * 100)
                    : 0}%
                </div>
                <div className="mt-1">
                  <Progress 
                    value={filteredProjects.length > 0 
                      ? (filteredProjects.filter(p => p.status === ProjectStatus.ACTIVE).length / filteredProjects.length) * 100
                      : 0} 
                    className="h-2"
                  />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Média por Projeto
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {filteredProjects.length > 0 
                    ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalProjectValue / filteredProjects.length)
                    : 'R$ 0,00'}
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
                  {Object.entries(projectStatusCounts).length > 0 ? (
                    Object.entries(projectStatusCounts).map(([status, count]) => (
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
                    ))
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      Nenhum dado disponível
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Lista de Projetos</CardTitle>
                <CardDescription>
                  Projetos no período selecionado
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Projeto</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProjects.length > 0 ? filteredProjects.map(project => (
                      <TableRow key={project.id}>
                        <TableCell className="font-medium">{project.name}</TableCell>
                        <TableCell>{project.client}</TableCell>
                        <TableCell>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(project.totalValue)}</TableCell>
                        <TableCell>
                          <div className={cn(
                            "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                            project.status === ProjectStatus.NEW ? "bg-blue-100 text-blue-800" :
                            project.status === ProjectStatus.IN_PROGRESS ? "bg-amber-100 text-amber-800" :
                            project.status === ProjectStatus.IN_PRODUCTION ? "bg-purple-100 text-purple-800" :
                            "bg-green-100 text-green-800"
                          )}>
                            {project.status === ProjectStatus.NEW ? "Novo" :
                            project.status === ProjectStatus.IN_PROGRESS ? "Em Andamento" :
                            project.status === ProjectStatus.IN_PRODUCTION ? "Em Produção" :
                            "Ativo"}
                          </div>
                        </TableCell>
                      </TableRow>
                    )) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                          Nenhum projeto encontrado para os filtros selecionados.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="developers" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Relatório por Desenvolvedor</CardTitle>
                <CardDescription>
                  Participação de desenvolvedores nos projetos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Desenvolvedor</TableHead>
                      <TableHead>Projetos</TableHead>
                      <TableHead>Valor Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {developerData.length > 0 ? developerData.map(item => (
                      <TableRow key={item.developer.id}>
                        <TableCell className="font-medium">
                          {item.developer.name || item.developer.email}
                        </TableCell>
                        <TableCell>{item.projectCount}</TableCell>
                        <TableCell>
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.totalValue)}
                        </TableCell>
                      </TableRow>
                    )) : (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center py-4 text-muted-foreground">
                          Nenhum desenvolvedor encontrado para os filtros selecionados.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
            
            {selectedDeveloper !== 'all' && (
              <Card>
                <CardHeader>
                  <CardTitle>Detalhes dos Projetos</CardTitle>
                  <CardDescription>
                    Projetos do desenvolvedor selecionado
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Projeto</TableHead>
                        <TableHead>Percentual</TableHead>
                        <TableHead>Valor</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {developerProjectDetails.length > 0 ? developerProjectDetails.map(item => (
                        <TableRow key={item.project.id}>
                          <TableCell className="font-medium">{item.project.name}</TableCell>
                          <TableCell>{item.sharePercentage}%</TableCell>
                          <TableCell>
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.shareValue)}
                          </TableCell>
                        </TableRow>
                      )) : (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center py-4 text-muted-foreground">
                            Nenhum projeto encontrado para este desenvolvedor.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
