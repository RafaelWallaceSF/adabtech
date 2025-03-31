
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ProjectStatus, ProjectWithPayments, User } from "@/types";
import { format } from "date-fns";
import { CalendarIcon, CreditCard, DollarSign, Loader2, Percent, Repeat } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CheckIcon, ChevronsUpDown } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from "@/components/ui/form";

interface CreateProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (project: ProjectWithPayments) => void;
  users: User[];
}

export default function CreateProjectDialog({
  open,
  onOpenChange,
  onSubmit,
  users
}: CreateProjectDialogProps) {
  const [name, setName] = useState("");
  const [client, setClient] = useState("");
  const [totalValue, setTotalValue] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState<Date | undefined>(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  );
  const [selectedTeamMembers, setSelectedTeamMembers] = useState<string[]>([]);
  const [developers, setDevelopers] = useState<User[]>([]);
  const [loadingDevelopers, setLoadingDevelopers] = useState(false);
  
  // New payment option states
  const [isRecurring, setIsRecurring] = useState(false);
  const [hasImplementationFee, setHasImplementationFee] = useState(false);
  const [implementationFee, setImplementationFee] = useState("");
  const [isInstallment, setIsInstallment] = useState(false);
  const [installmentCount, setInstallmentCount] = useState("1");

  useEffect(() => {
    if (open) {
      fetchDevelopers();
    }
  }, [open]);

  const fetchDevelopers = async () => {
    setLoadingDevelopers(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'developer');

      if (error) {
        toast.error("Erro ao carregar desenvolvedores");
        console.error("Error fetching developers:", error);
      } else {
        setDevelopers(data as User[]);
      }
    } catch (error) {
      toast.error("Erro ao carregar desenvolvedores");
      console.error("Error fetching developers:", error);
    } finally {
      setLoadingDevelopers(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !client || !totalValue || !deadline) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }
    
    const newProject: ProjectWithPayments = {
      id: String(Date.now()),
      name,
      client,
      totalValue: parseFloat(totalValue),
      status: ProjectStatus.NEW,
      teamMembers: selectedTeamMembers,
      deadline,
      description,
      createdAt: new Date(),
      payments: [],
      paidAmount: 0,
      remainingAmount: parseFloat(totalValue),
      isRecurring,
      hasImplementationFee,
      implementationFee: hasImplementationFee ? parseFloat(implementationFee) : undefined,
      isInstallment,
      installmentCount: isInstallment ? parseInt(installmentCount) : undefined
    };
    
    onSubmit(newProject);
    resetForm();
  };
  
  const resetForm = () => {
    setName("");
    setClient("");
    setTotalValue("");
    setDescription("");
    setDeadline(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000));
    setSelectedTeamMembers([]);
    setIsRecurring(false);
    setHasImplementationFee(false);
    setImplementationFee("");
    setIsInstallment(false);
    setInstallmentCount("1");
  };
  
  const toggleTeamMember = (userId: string) => {
    setSelectedTeamMembers(prev => 
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const getDeveloperName = (id: string): string => {
    const developer = developers.find(dev => dev.id === id);
    return developer ? (developer.name || developer.email) : 'Desenvolvedor';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-xl">Novo Projeto</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Projeto</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nome do projeto"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="client">Cliente</Label>
              <Input
                id="client"
                value={client}
                onChange={(e) => setClient(e.target.value)}
                placeholder="Nome do cliente"
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="totalValue">Valor Total (R$)</Label>
              <Input
                id="totalValue"
                type="number"
                min="0"
                step="0.01"
                value={totalValue}
                onChange={(e) => setTotalValue(e.target.value)}
                placeholder="0,00"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label>Prazo</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !deadline && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {deadline ? format(deadline, "dd/MM/yyyy") : <span>Selecione uma data</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 pointer-events-auto" align="start">
                  <Calendar
                    mode="single"
                    selected={deadline}
                    onSelect={setDeadline}
                    initialFocus
                    disabled={(date) => date < new Date()}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          {/* New payment options section */}
          <div className="space-y-4 border rounded-lg p-4">
            <h3 className="font-semibold">Opções de Pagamento</h3>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Repeat className="h-4 w-4 text-muted-foreground" />
                <Label htmlFor="isRecurring" className="cursor-pointer">
                  Cobrança Mensal Recorrente
                </Label>
              </div>
              <Switch 
                id="isRecurring" 
                checked={isRecurring} 
                onCheckedChange={setIsRecurring} 
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <Label htmlFor="hasImplementationFee" className="cursor-pointer">
                  Possui Taxa de Implantação
                </Label>
              </div>
              <Switch 
                id="hasImplementationFee" 
                checked={hasImplementationFee} 
                onCheckedChange={setHasImplementationFee} 
              />
            </div>
            
            {hasImplementationFee && (
              <div className="grid grid-cols-2 gap-4 pl-6 mt-2">
                <div className="space-y-2">
                  <Label htmlFor="implementationFee">Valor da Implantação (R$)</Label>
                  <Input
                    id="implementationFee"
                    type="number"
                    min="0"
                    step="0.01"
                    value={implementationFee}
                    onChange={(e) => setImplementationFee(e.target.value)}
                    placeholder="0,00"
                    required={hasImplementationFee}
                  />
                </div>
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                <Label htmlFor="isInstallment" className="cursor-pointer">
                  Pagamento Parcelado
                </Label>
              </div>
              <Switch 
                id="isInstallment" 
                checked={isInstallment} 
                onCheckedChange={setIsInstallment} 
              />
            </div>
            
            {isInstallment && (
              <div className="grid grid-cols-2 gap-4 pl-6 mt-2">
                <div className="space-y-2">
                  <Label htmlFor="installmentCount">Número de Parcelas</Label>
                  <Select
                    value={installmentCount}
                    onValueChange={setInstallmentCount}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o número de parcelas" />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((num) => (
                        <SelectItem key={num} value={num.toString()}>
                          {num}x
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <Label>Desenvolvedores</Label>
            <div className="space-y-4">
              <Select onValueChange={(value) => toggleTeamMember(value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione um desenvolvedor para adicionar" />
                </SelectTrigger>
                <SelectContent>
                  {loadingDevelopers ? (
                    <div className="flex items-center justify-center p-4">
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      <span>Carregando...</span>
                    </div>
                  ) : developers.length > 0 ? (
                    developers.map((dev) => (
                      <SelectItem 
                        key={dev.id} 
                        value={dev.id}
                        disabled={selectedTeamMembers.includes(dev.id)}
                      >
                        {dev.name || dev.email}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="empty" disabled>
                      Nenhum desenvolvedor encontrado
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              
              {developers.length === 0 && !loadingDevelopers && (
                <div className="text-sm text-amber-600 mt-2">
                  <p>
                    Nenhum desenvolvedor cadastrado. 
                    <Button 
                      variant="link" 
                      className="h-auto p-0 text-amber-600 font-semibold hover:text-amber-800"
                      onClick={() => {
                        onOpenChange(false);
                        window.location.href = '/team';
                      }}
                    >
                      Vá até a página de Equipe
                    </Button> 
                    para cadastrar desenvolvedores.
                  </p>
                </div>
              )}
              
              {selectedTeamMembers.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedTeamMembers.map(id => (
                    <Badge 
                      key={id} 
                      variant="secondary"
                      className="flex items-center gap-1 cursor-pointer"
                      onClick={() => toggleTeamMember(id)}
                    >
                      {getDeveloperName(id)}
                      <span className="text-xs ml-1">×</span>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva o projeto..."
              rows={4}
            />
          </div>
          
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">Criar Projeto</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
