
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ProjectWithPayments, User, ProjectStatus } from '@/types';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, DollarSign, Users, ListTodo } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AvatarGroup } from '@/components/ui/avatar-group';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface ProjectCardProps {
  project: ProjectWithPayments;
  teamMembers: User[];
  onClick: () => void;
}

export default function ProjectCard({ project, teamMembers, onClick }: ProjectCardProps) {
  const [showPendingTasks, setShowPendingTasks] = useState(false);
  const isOverdue = project.deadline < new Date() && project.status !== ProjectStatus.ACTIVE;
  const isDraggable = project.status !== ProjectStatus.ACTIVE;
  
  // Count pending payments (those that are not paid)
  const pendingPayments = project.payments.filter(p => p.status !== 'paid');
  const hasPendingTasks = pendingPayments.length > 0;
  
  const statusColors = {
    [ProjectStatus.NEW]: 'border-kanban-new',
    [ProjectStatus.IN_PROGRESS]: 'border-kanban-progress',
    [ProjectStatus.IN_PRODUCTION]: 'border-kanban-production',
    [ProjectStatus.ACTIVE]: 'border-kanban-active',
  };
  
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData('projectId', project.id);
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't trigger the card click when clicking on the pending tasks button
    if ((e.target as HTMLElement).closest('.pending-tasks-trigger')) {
      e.stopPropagation();
      return;
    }
    onClick();
  };
  
  return (
    <div 
      className={cn(
        "kanban-card group animate-fade-in relative",
        "kanban-card-highlight",
        statusColors[project.status],
        isDraggable && "cursor-grab active:cursor-grabbing"
      )}
      draggable={isDraggable}
      onDragStart={isDraggable ? handleDragStart : undefined}
      onClick={handleCardClick}
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
        
        {hasPendingTasks && (
          <Popover>
            <PopoverTrigger asChild>
              <button 
                className="pending-tasks-trigger flex items-center text-xs text-amber-500 hover:text-amber-600 transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <ListTodo className="h-4 w-4 mr-1" />
                <span>{pendingPayments.length}</span>
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
              <div className="p-3 border-b">
                <h3 className="font-medium">Pendências</h3>
                <p className="text-xs text-muted-foreground">Pagamentos pendentes ou em atraso</p>
              </div>
              <div className="max-h-60 overflow-auto p-2">
                {pendingPayments.length > 0 ? (
                  <div className="space-y-2">
                    {pendingPayments.map(payment => (
                      <div 
                        key={payment.id} 
                        className={cn(
                          "p-2 text-xs rounded border",
                          payment.status === 'overdue' ? 'border-destructive/40 bg-destructive/10' : 'border-amber-500/40 bg-amber-500/10'
                        )}
                      >
                        <div className="font-medium">{payment.description}</div>
                        <div className="flex justify-between mt-1">
                          <span>
                            Vencimento: {format(payment.dueDate, 'dd/MM/yyyy', { locale: ptBR })}
                          </span>
                          <span className="font-medium">
                            {new Intl.NumberFormat('pt-BR', { 
                              style: 'currency', 
                              currency: 'BRL'
                            }).format(payment.amount)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    Nenhuma pendência para este projeto
                  </div>
                )}
              </div>
            </PopoverContent>
          </Popover>
        )}
      </div>
    </div>
  );
}
