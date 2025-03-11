
import { cn } from "@/lib/utils";
import { ProjectStatus, ProjectWithPayments } from "@/types";
import ProjectCard from "./ProjectCard";
import { getProjectTeamMembers } from "@/data/mockData";

interface KanbanColumnProps {
  title: string;
  status: ProjectStatus;
  projects: ProjectWithPayments[];
  color: string;
  onDrop: (projectId: string, status: ProjectStatus) => void;
  onProjectClick: (project: ProjectWithPayments) => void;
}

export default function KanbanColumn({
  title,
  status,
  projects,
  color,
  onDrop,
  onProjectClick
}: KanbanColumnProps) {
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const projectId = e.dataTransfer.getData("projectId");
    onDrop(projectId, status);
  };
  
  return (
    <div 
      className={cn("kanban-column", color)}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div className="kanban-header">
        <span>{title}</span>
        <span className="inline-flex items-center justify-center w-6 h-6 text-xs font-medium rounded-full bg-muted">
          {projects.length}
        </span>
      </div>
      
      <div className="kanban-cards">
        {projects.map(project => {
          const teamMembers = getProjectTeamMembers(project);
          return (
            <ProjectCard 
              key={project.id} 
              project={project} 
              teamMembers={teamMembers}
              onClick={() => onProjectClick(project)}
            />
          );
        })}
        {projects.length === 0 && (
          <div className="h-20 flex items-center justify-center text-muted-foreground text-sm italic">
            Nenhum projeto nesta coluna
          </div>
        )}
      </div>
    </div>
  );
}
