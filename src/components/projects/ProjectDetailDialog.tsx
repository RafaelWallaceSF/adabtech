
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ProjectWithPayments, ProjectStatus, User } from "@/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { updateProject } from "@/services/supabaseService";

interface ProjectDetailDialogProps {
  project: ProjectWithPayments;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProjectUpdate: (updatedProject: ProjectWithPayments) => void;
}

export default function ProjectDetailDialog({
  project,
  open,
  onOpenChange,
  onProjectUpdate,
}: ProjectDetailDialogProps) {
  const [formData, setFormData] = useState({
    name: project.name,
    client: project.client,
    totalValue: project.totalValue,
    status: project.status,
    deadline: project.deadline,
    description: project.description,
    teamMembers: project.teamMembers,
  });
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    setFormData({
      name: project.name,
      client: project.client,
      totalValue: project.totalValue,
      status: project.status,
      deadline: project.deadline,
      description: project.description,
      teamMembers: project.teamMembers,
    });
  }, [project]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleStatusChange = (value: ProjectStatus) => {
    setFormData(prev => ({ ...prev, status: value }));
  };

  const handleDeadlineChange = (date: Date | undefined) => {
    setFormData(prev => ({ ...prev, deadline: date as Date }));
  };

  const handleUpdateProject = async () => {
    try {
      setUpdating(true);

      // Format the deadline properly before sending to updateProject
      const projectDataToUpdate = {
        id: project.id,
        name: formData.name,
        client: formData.client,
        totalValue: formData.totalValue,
        status: formData.status,
        deadline: formData.deadline,
        description: formData.description,
        teamMembers: formData.teamMembers
      };

      const success = await updateProject(projectDataToUpdate);

      if (success) {
        const updatedProject: ProjectWithPayments = {
          ...project,
          name: formData.name,
          client: formData.client,
          totalValue: formData.totalValue,
          status: formData.status,
          deadline: formData.deadline,
          description: formData.description,
          teamMembers: formData.teamMembers,
        };
        onProjectUpdate(updatedProject);
        toast.success("Projeto atualizado com sucesso!");
      } else {
        toast.error("Erro ao atualizar projeto");
      }
    } catch (error) {
      console.error("Error updating project:", error);
      toast.error("Erro ao atualizar projeto");
    } finally {
      setUpdating(false);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Detalhes do Projeto</DialogTitle>
          <DialogDescription>
            Visualize e edite os detalhes do projeto.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Projeto</Label>
            <Input
              type="text"
              id="name"
              value={formData.name}
              onChange={handleInputChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="client">Cliente</Label>
            <Input
              type="text"
              id="client"
              value={formData.client}
              onChange={handleInputChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="totalValue">Valor Total (R$)</Label>
            <Input
              type="number"
              id="totalValue"
              value={formData.totalValue}
              onChange={handleInputChange}
            />
          </div>

          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={formData.status} onValueChange={handleStatusChange}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ProjectStatus.NEW}>Novo</SelectItem>
                <SelectItem value={ProjectStatus.IN_PROGRESS}>Em Andamento</SelectItem>
                <SelectItem value={ProjectStatus.IN_PRODUCTION}>Em Produção</SelectItem>
                <SelectItem value={ProjectStatus.ACTIVE}>Ativo</SelectItem>
                <SelectItem value={ProjectStatus.COMPLETED}>Concluído</SelectItem>
                <SelectItem value={ProjectStatus.CANCELLED}>Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Prazo</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formData.deadline && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.deadline ? (
                    format(formData.deadline, "dd/MM/yyyy")
                  ) : (
                    <span>Selecione uma data</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={formData.deadline}
                  onSelect={handleDeadlineChange}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Descrição</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={handleInputChange}
          />
        </div>

        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleUpdateProject} disabled={updating}>
            {updating ? "Atualizando..." : "Salvar"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
