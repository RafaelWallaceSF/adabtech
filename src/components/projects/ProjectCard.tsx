
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ProjectWithPayments, User, ProjectStatus } from '@/types';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, DollarSign, Users } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AvatarGroup } from '@/components/ui/avatar-group';
import { cn } from '@/lib/utils';

interface ProjectCardProps {
  project: ProjectWithPayments;
  teamMembers: User[];
  onClick: () => void;
}

export default function ProjectCard({ project, teamMembers, onClick }: ProjectCardProps) {
  const isOverdue = project.deadline < new Date() && project.status !== ProjectStatus.ACTIVE;
  const isDraggable = project.status !== ProjectStatus.ACTIVE;
  
  const statusColors = {
    [ProjectStatus.NEW]: 'border-kanban-new',
    [ProjectStatus.IN_PROGRESS]: 'border-kanban-progress',
    [ProjectStatus.IN_PRODUCTION]: 'border-kanban-production',
    [ProjectStatus.ACTIVE]: 'border-kanban-active',
  };
  
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData('projectId', project.id);
  };
  
  return (
    <div 
      className={cn(
        "kanban-card group animate-fade-in",
        "kanban-card-highlight",
        statusColors[project.status],
        isDraggable && "cursor-grab active:cursor-grabbing"
      )}
      draggable={isDraggable}
      onDragStart={isDraggable ? handleDragStart : undefined}
      onClick={onClick}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="font-medium">{project.name}</div>
        <Badge variant="outline" className="text-xs">
          {new Intl.NumberFormat('pt-BR', { 
            style: 'currency', 
            currency: 'BRL',
            maximumFractionDigits: 0
          }).format(project.totalValue)}
        </Badge>
      </div>
      
      <div className="text-sm text-muted-foreground mb-3">
        {project.client}
      </div>
      
      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
        <DollarSign className="h-3 w-3" />
        <div>
          {Math.round((project.paidAmount / project.totalValue) * 100)}% pago
        </div>
      </div>
      
      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
        <CalendarDays className="h-3 w-3" />
        <div className={cn(isOverdue && 'text-destructive')}>
          {isOverdue ? 'Em atraso' : 'Prazo'}: {format(project.deadline, 'dd MMM yyyy', { locale: ptBR })}
        </div>
      </div>
      
      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center gap-2">
          <Users className="h-3 w-3 text-muted-foreground" />
          <AvatarGroup>
            {teamMembers.map(member => (
              <Avatar key={member.id} className="h-6 w-6 border-2 border-background">
                <AvatarImage src={member.avatarUrl} alt={member.name} />
                <AvatarFallback className="text-[10px]">
                  {member.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
            ))}
          </AvatarGroup>
        </div>
      </div>
    </div>
  );
}
