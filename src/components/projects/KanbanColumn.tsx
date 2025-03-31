
import { cn } from "@/lib/utils";
import { ProjectStatus, ProjectWithPayments } from "@/types";
import ProjectCard from "./ProjectCard";
import { getProjectTeamMembers } from "@/data/mockData";
import { Trash2 } from "lucide-react";
import { Button } from "../ui/button";

interface KanbanColumnProps {
  title: string;
  status: ProjectStatus;
  projects: ProjectWithPayments[];
  color: string;
  onDrop: (projectId: string, status: ProjectStatus) => void;
  onProjectClick: (project: ProjectWithPayments) => void;
  onDeleteProject: (projectId: string) => void;
}

export default function KanbanColumn({
  title,
  status,
  projects,
  color,
  onDrop,
  onProjectClick,
  onDeleteProject
}: KanbanColumnProps) {
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const projectId = e.dataTransfer.getData("projectId");
    if (projectId) {
      onDrop(projectId, status);
    }
  };
  
  return (
    <div 
      className={cn("kanban-column", color)}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div className="kanban-header flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span>{title}</span>
          <span className="inline-flex items-center justify-center w-6 h-6 text-xs font-medium rounded-full bg-muted">
            {projects.length}
          </span>
        </div>
      </div>
      
      <div className="kanban-cards">
        {projects.map(project => {
          const teamMembers = getProjectTeamMembers(project);
          return (
            <div key={project.id} className="group relative">
              <ProjectCard 
                project={project} 
                teamMembers={teamMembers}
                onClick={() => onProjectClick(project)}
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute -right-2 -top-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteProject(project.id);
                }}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
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
