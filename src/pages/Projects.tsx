import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ProjectStatus, ProjectWithPayments, User } from "@/types";
import { toast } from "sonner";
import KanbanColumn from "@/components/projects/KanbanColumn";
import ProjectDetailDialog from "@/components/projects/ProjectDetailDialog";
import CreateProjectDialog from "@/components/projects/CreateProjectDialog";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { deleteProject, fetchProjects, updateProjectStatus } from "@/services/supabaseService";

export default function Projects() {
  const [projects, setProjects] = useState<ProjectWithPayments[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<ProjectWithPayments | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    loadProjects();
    fetchUsers();
  }, []);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const projectsData = await fetchProjects();
      const projectsWithPayments = projectsData.map(project => ({
        ...project,
        payments: [],
        paidAmount: 0,
        remainingAmount: project.totalValue,
        tasks: project.id.includes('1') ? [
          { id: crypto.randomUUID(), title: 'Configuração inicial', completed: true, projectId: project.id },
          { id: crypto.randomUUID(), title: 'Desenvolvimento de funcionalidades', completed: false, projectId: project.id },
          { id: crypto.randomUUID(), title: 'Testes e validação', completed: false, projectId: project.id }
        ] : []
      }));
      
      setProjects(projectsWithPayments);
    } catch (error) {
      console.error("Error loading projects:", error);
      toast.error("Erro ao carregar projetos");
    } finally {
      setLoading(false);
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

  const handleDrop = async (projectId: string, newStatus: ProjectStatus) => {
    try {
      setProjects(prevProjects => 
        prevProjects.map(project => 
          project.id === projectId 
            ? { ...project, status: newStatus } 
            : project
        )
      );
      
      const success = await updateProjectStatus(projectId, newStatus);
      
      if (success) {
        toast.success("Status do projeto atualizado");
      } else {
        toast.error("Erro ao atualizar status do projeto");
        loadProjects();
      }
    } catch (error) {
      console.error("Error updating project status:", error);
      toast.error("Erro ao atualizar status do projeto");
      loadProjects();
    }
  };

  const handleProjectClick = (project: ProjectWithPayments) => {
    setSelectedProject(project);
    setIsDetailOpen(true);
  };

  const handleCreateProject = (newProject: ProjectWithPayments) => {
    setProjects(prev => [...prev, newProject]);
    toast.success("Projeto criado com sucesso");
    setIsCreateOpen(false);
  };

  const handleDeleteProject = async (projectId: string) => {
    try {
      const success = await deleteProject(projectId);
      
      if (success) {
        setProjects(prevProjects => prevProjects.filter(p => p.id !== projectId));
        toast.success("Projeto excluído com sucesso");
      } else {
        toast.error("Erro ao excluir projeto");
      }
    } catch (error) {
      console.error("Error deleting project:", error);
      toast.error("Erro ao excluir projeto");
    }
  };

  const newProjects = projects.filter(p => p.status === ProjectStatus.NEW);
  const inProgressProjects = projects.filter(p => p.status === ProjectStatus.IN_PROGRESS);
  const inProductionProjects = projects.filter(p => p.status === ProjectStatus.IN_PRODUCTION);
  const activeProjects = projects.filter(p => p.status === ProjectStatus.ACTIVE);
  
  const calculateTotalValue = (projects: ProjectWithPayments[]) => 
    projects.reduce((total, project) => total + project.totalValue, 0);
    
  const newTotal = calculateTotalValue(newProjects);
  const inProgressTotal = calculateTotalValue(inProgressProjects);
  const inProductionTotal = calculateTotalValue(inProductionProjects);
  const activeTotal = calculateTotalValue(activeProjects);
  const grandTotal = calculateTotalValue(projects);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-xl text-muted-foreground">Carregando projetos...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projetos</h1>
          <p className="text-muted-foreground">Gerencie seus projetos com facilidade</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => window.location.href = '/team'}
          >
            Gerenciar Desenvolvedores
          </Button>
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Projeto
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center">
            <span className="text-sm text-muted-foreground">Novos</span>
            <span className="text-xl font-semibold">
              {new Intl.NumberFormat('pt-BR', { 
                style: 'currency', 
                currency: 'BRL',
                maximumFractionDigits: 0 
              }).format(newTotal)}
            </span>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center">
            <span className="text-sm text-muted-foreground">Em Andamento</span>
            <span className="text-xl font-semibold">
              {new Intl.NumberFormat('pt-BR', { 
                style: 'currency', 
                currency: 'BRL',
                maximumFractionDigits: 0 
              }).format(inProgressTotal)}
            </span>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center">
            <span className="text-sm text-muted-foreground">Em Produção</span>
            <span className="text-xl font-semibold">
              {new Intl.NumberFormat('pt-BR', { 
                style: 'currency', 
                currency: 'BRL',
                maximumFractionDigits: 0 
              }).format(inProductionTotal)}
            </span>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center">
            <span className="text-sm text-muted-foreground">Ativos</span>
            <span className="text-xl font-semibold">
              {new Intl.NumberFormat('pt-BR', { 
                style: 'currency', 
                currency: 'BRL',
                maximumFractionDigits: 0 
              }).format(activeTotal)}
            </span>
          </CardContent>
        </Card>
        
        <Card className="bg-primary/10">
          <CardContent className="p-4 flex flex-col items-center justify-center">
            <span className="text-sm text-muted-foreground">Total Geral</span>
            <span className="text-xl font-semibold">
              {new Intl.NumberFormat('pt-BR', { 
                style: 'currency', 
                currency: 'BRL',
                maximumFractionDigits: 0 
              }).format(grandTotal)}
            </span>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-6 overflow-x-auto pb-4">
        <KanbanColumn 
          title="Novos" 
          status={ProjectStatus.NEW} 
          projects={newProjects} 
          color="border-kanban-new"
          onDrop={handleDrop}
          onProjectClick={handleProjectClick}
          onDeleteProject={handleDeleteProject}
        />
        
        <KanbanColumn 
          title="Em Andamento" 
          status={ProjectStatus.IN_PROGRESS} 
          projects={inProgressProjects} 
          color="border-kanban-progress"
          onDrop={handleDrop}
          onProjectClick={handleProjectClick}
          onDeleteProject={handleDeleteProject}
        />
        
        <KanbanColumn 
          title="Em Produção" 
          status={ProjectStatus.IN_PRODUCTION} 
          projects={inProductionProjects} 
          color="border-kanban-production"
          onDrop={handleDrop}
          onProjectClick={handleProjectClick}
          onDeleteProject={handleDeleteProject}
        />
        
        <KanbanColumn 
          title="Ativos" 
          status={ProjectStatus.ACTIVE} 
          projects={activeProjects} 
          color="border-kanban-active"
          onDrop={handleDrop}
          onProjectClick={handleProjectClick}
          onDeleteProject={handleDeleteProject}
        />
      </div>

      {selectedProject && (
        <ProjectDetailDialog 
          project={selectedProject} 
          open={isDetailOpen}
          onOpenChange={setIsDetailOpen}
        />
      )}

      <CreateProjectDialog 
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSubmit={handleCreateProject}
        users={users}
      />
    </div>
  );
}
