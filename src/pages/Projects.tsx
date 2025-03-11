
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { getProjectsWithPayments, getProjectTeamMembers, users } from "@/data/mockData";
import { ProjectStatus, ProjectWithPayments, User } from "@/types";
import { toast } from "sonner";
import KanbanColumn from "@/components/projects/KanbanColumn";
import ProjectDetailDialog from "@/components/projects/ProjectDetailDialog";
import CreateProjectDialog from "@/components/projects/CreateProjectDialog";

export default function Projects() {
  const [projects, setProjects] = useState<ProjectWithPayments[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<ProjectWithPayments | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  useEffect(() => {
    // Simulate loading from API
    setTimeout(() => {
      setProjects(getProjectsWithPayments());
      setLoading(false);
    }, 500);
  }, []);

  const handleDrop = (projectId: string, newStatus: ProjectStatus) => {
    setProjects(prevProjects => 
      prevProjects.map(project => 
        project.id === projectId 
          ? { ...project, status: newStatus } 
          : project
      )
    );
    
    toast.success("Status do projeto atualizado");
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
  
  // Filter projects by status
  const newProjects = projects.filter(p => p.status === ProjectStatus.NEW);
  const inProgressProjects = projects.filter(p => p.status === ProjectStatus.IN_PROGRESS);
  const inProductionProjects = projects.filter(p => p.status === ProjectStatus.IN_PRODUCTION);
  const activeProjects = projects.filter(p => p.status === ProjectStatus.ACTIVE);

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
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Projeto
        </Button>
      </div>

      <div className="flex gap-6 overflow-x-auto pb-4">
        <KanbanColumn 
          title="Novos" 
          status={ProjectStatus.NEW} 
          projects={newProjects} 
          color="border-kanban-new"
          onDrop={handleDrop}
          onProjectClick={handleProjectClick}
        />
        
        <KanbanColumn 
          title="Em Andamento" 
          status={ProjectStatus.IN_PROGRESS} 
          projects={inProgressProjects} 
          color="border-kanban-progress"
          onDrop={handleDrop}
          onProjectClick={handleProjectClick}
        />
        
        <KanbanColumn 
          title="Em Produção" 
          status={ProjectStatus.IN_PRODUCTION} 
          projects={inProductionProjects} 
          color="border-kanban-production"
          onDrop={handleDrop}
          onProjectClick={handleProjectClick}
        />
        
        <KanbanColumn 
          title="Ativos" 
          status={ProjectStatus.ACTIVE} 
          projects={activeProjects} 
          color="border-kanban-active"
          onDrop={handleDrop}
          onProjectClick={handleProjectClick}
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
