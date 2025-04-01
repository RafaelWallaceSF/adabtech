import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ProjectStatus, ProjectWithPayments, User } from "@/types";
import { format } from "date-fns";
import { CalendarIcon, CreditCard, DollarSign, Loader2, Repeat, User as UserIcon, UserPlus } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CheckIcon } from "lucide-react";
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
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ptBR } from "date-fns/locale";
import { createProject } from "@/services/supabaseService";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
  const [developerShares, setDeveloperShares] = useState<Record<string, number>>({});
  const [shareType, setShareType] = useState<'percentage' | 'value'>('percentage');
  const [clients, setClients] = useState<Array<{ id: string, name: string }>>([]);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("details");
  
  const [developerCost, setDeveloperCost] = useState("");
  const [infrastructureCost, setInfrastructureCost] = useState("");
  const [hostingCost, setHostingCost] = useState("");
  const [licensesCost, setLicensesCost] = useState("");
  const [toolsCost, setToolsCost] = useState("");
  const [marketingCost, setMarketingCost] = useState("");
  const [otherCosts, setOtherCosts] = useState("");
  
  const [isRecurring, setIsRecurring] = useState(false);
  const [hasImplementationFee, setHasImplementationFee] = useState(false);
  const [implementationFee, setImplementationFee] = useState("");
  const [isInstallment, setIsInstallment] = useState(false);
  const [installmentCount, setInstallmentCount] = useState("");
  const [paymentDate, setPaymentDate] = useState<Date | undefined>(undefined);
  const [searchDeveloper, setSearchDeveloper] = useState("");
  const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState(false);

  useEffect(() => {
    if (open) {
      fetchDevelopers();
      fetchClients();
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

  const fetchClients = async () => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('id, name')
        .order('name');

      if (error) {
        toast.error("Erro ao carregar clientes");
        console.error("Error fetching clients:", error);
      } else {
        setClients(data || []);
      }
    } catch (error) {
      toast.error("Erro ao carregar clientes");
      console.error("Error fetching clients:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !selectedClientId || !totalValue || !deadline) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }
    
    if (isRecurring && !paymentDate) {
      toast.error("Para projetos recorrentes, selecione a data de pagamento mensal");
      return;
    }
    
    try {
      const tempId = `temp-${Date.now()}`;
      console.log("Creating temp project with ID:", tempId);
      
      const projectCosts = {
        developer: parseFloat(developerCost) || 0,
        infrastructure: parseFloat(infrastructureCost) || 0,
        hosting: parseFloat(hostingCost) || 0,
        licenses: parseFloat(licensesCost) || 0,
        tools: parseFloat(toolsCost) || 0,
        marketing: parseFloat(marketingCost) || 0,
        other: parseFloat(otherCosts) || 0
      };
      
      const totalCost = Object.values(projectCosts).reduce((sum, cost) => sum + cost, 0);
      
      const tempProject: ProjectWithPayments = {
        id: tempId,
        name,
        client: clients.find(c => c.id === selectedClientId)?.name || "",
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
        installmentCount: isInstallment ? parseInt(installmentCount) : undefined,
        paymentDate: isRecurring ? paymentDate : undefined,
        projectCosts,
        developerShares
      };
      
      onSubmit(tempProject);
      
      const projectData = {
        name,
        client: clients.find(c => c.id === selectedClientId)?.name || "",
        clientId: selectedClientId,
        totalValue: parseFloat(totalValue),
        status: ProjectStatus.NEW,
        teamMembers: selectedTeamMembers,
        deadline,
        description,
        isRecurring,
        hasImplementationFee,
        implementationFee: hasImplementationFee ? parseFloat(implementationFee) : undefined,
        isInstallment,
        installmentCount: isInstallment ? parseInt(installmentCount) : undefined,
        paymentDate: isRecurring ? paymentDate : undefined,
        developerShares,
        projectCosts,
        totalCost
      };
      
      console.log("Saving project to Supabase with data:", projectData);
      const savedProject = await createProject(projectData);
      
      if (!savedProject) {
        console.error("Falha ao salvar o projeto no banco de dados");
        toast.error("Erro ao salvar o projeto. Tente novamente mais tarde.");
      } else {
        console.log("Projeto salvo com sucesso:", savedProject);
      }
      
      resetForm();
    } catch (error) {
      console.error("Erro ao criar projeto:", error);
      toast.error("Erro ao criar projeto. Tente novamente.");
    }
  };
  
  const resetForm = () => {
    setName("");
    setClient("");
    setTotalValue("");
    setDescription("");
    setDeadline(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000));
    setSelectedTeamMembers([]);
    setDeveloperShares({});
    setShareType('percentage');
    setSelectedClientId(null);
    setPaymentDate(undefined);
    setIsRecurring(false);
    setHasImplementationFee(false);
    setImplementationFee("");
    setIsInstallment(false);
    setInstallmentCount("");
    setDeveloperCost("");
    setInfrastructureCost("");
    setHostingCost("");
    setLicensesCost("");
    setToolsCost("");
    setMarketingCost("");
    setOtherCosts("");
    setActiveTab("details");
    setSearchDeveloper("");
    setIsSearchDropdownOpen(false);
  };
  
  const toggleTeamMember = (userId: string) => {
    setSelectedTeamMembers(prev => {
      const newMembers = prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId];
      
      if (prev.includes(userId) && !newMembers.includes(userId)) {
        setDeveloperShares(shares => {
          const newShares = {...shares};
          delete newShares[userId];
          return newShares;
        });
      }
      
      return newMembers;
    });
  };

  const updateDeveloperShare = (userId: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    setDeveloperShares(prev => ({
      ...prev,
      [userId]: numValue
    }));
  };

  const getTotalShare = (): number => {
    if (shareType === 'percentage') {
      return Object.values(developerShares).reduce((sum, share) => sum + share, 0);
    } else {
      const totalShareValue = Object.values(developerShares).reduce((sum, share) => sum + share, 0);
      return totalValue ? (totalShareValue / parseFloat(totalValue)) * 100 : 0;
    }
  };

  const getDeveloperName = (id: string): string => {
    const developer = developers.find(dev => dev.id === id);
    return developer ? (developer.name || developer.email) : 'Desenvolvedor';
  };

  const handlePaymentDateSelect = (date: Date | undefined) => {
    console.log("Selected payment date:", date);
    setPaymentDate(date);
  };

  const calculateTotalCost = (): number => {
    return (
      (parseFloat(developerCost) || 0) +
      (parseFloat(infrastructureCost) || 0) +
      (parseFloat(hostingCost) || 0) +
      (parseFloat(licensesCost) || 0) +
      (parseFloat(toolsCost) || 0) +
      (parseFloat(marketingCost) || 0) +
      (parseFloat(otherCosts) || 0)
    );
  };

  const calculateProfitMargin = (): number => {
    const totalCost = calculateTotalCost();
    const revenue = parseFloat(totalValue) || 0;
    
    if (totalCost === 0 || revenue === 0) return 0;
    
    return ((revenue - totalCost) / revenue) * 100;
  };

  const getDeveloperInitials = (name: string): string => {
    if (!name) return "??";
    
    const parts = name.split(' ');
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const filteredDevelopers = developers.filter(dev => {
    if (!searchDeveloper) return true;
    
    const developerName = (dev.name || '').toLowerCase();
    const developerEmail = (dev.email || '').toLowerCase();
    const searchTerm = searchDeveloper.toLowerCase();
    
    return developerName.includes(searchTerm) || developerEmail.includes(searchTerm);
  });

  const selectDeveloperFromDropdown = (dev: User) => {
    toggleTeamMember(dev.id);
    setIsSearchDropdownOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-xl">Novo Projeto</DialogTitle>
          <DialogDescription>
            Preencha os dados para criar um novo projeto
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="details">Detalhes</TabsTrigger>
            <TabsTrigger value="payment">Pagamento</TabsTrigger>
            <TabsTrigger value="costs">Custos</TabsTrigger>
          </TabsList>
          
          <ScrollArea className="max-h-[70vh] overflow-y-auto">
            <form onSubmit={handleSubmit} className="space-y-4 px-1 py-4">
              <TabsContent value="details" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome do Projeto *</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Nome do projeto"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="client">Cliente *</Label>
                    <Select
                      value={selectedClientId || ""}
                      onValueChange={setSelectedClientId}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um cliente" />
                      </SelectTrigger>
                      <SelectContent>
                        {clients.length > 0 ? (
                          clients.map((client) => (
                            <SelectItem key={client.id} value={client.id}>
                              {client.name}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="empty" disabled>
                            Nenhum cliente encontrado
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    
                    {clients.length === 0 && (
                      <div className="text-sm text-amber-600 mt-2">
                        <p>
                          Nenhum cliente cadastrado. 
                          <Button 
                            variant="link" 
                            className="h-auto p-0 text-amber-600 font-semibold hover:text-amber-800"
                            onClick={() => {
                              onOpenChange(false);
                              window.location.href = '/clients';
                            }}
                          >
                            Vá até a página de Clientes
                          </Button> 
                          para cadastrar clientes.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="totalValue">Valor Total (R$) *</Label>
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
                    <Label>Prazo *</Label>
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
                
                <div className="space-y-4 border rounded-lg p-4">
                  <h3 className="font-semibold flex items-center">
                    <UserIcon className="h-4 w-4 mr-2" />
                    Desenvolvedores
                  </h3>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">Distribuição por:</span>
                      <div className="flex border rounded-md overflow-hidden">
                        <Button 
                          type="button"
                          variant={shareType === 'percentage' ? "default" : "ghost"} 
                          size="sm"
                          onClick={() => setShareType('percentage')} 
                          className="rounded-none"
                        >
                          Percentual
                        </Button>
                        <Button 
                          type="button"
                          variant={shareType === 'value' ? "default" : "ghost"} 
                          size="sm"
                          onClick={() => setShareType('value')} 
                          className="rounded-none"
                        >
                          Valor
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <div className="relative flex-grow">
                        <DropdownMenu open={isSearchDropdownOpen} onOpenChange={setIsSearchDropdownOpen}>
                          <DropdownMenuTrigger asChild>
                            <div className="relative w-full">
                              <Input
                                placeholder="Buscar desenvolvedor"
                                value={searchDeveloper}
                                onChange={(e) => {
                                  setSearchDeveloper(e.target.value);
                                  if (e.target.value.length > 0) {
                                    setIsSearchDropdownOpen(true);
                                  }
                                }}
                                onClick={() => {
                                  if (searchDeveloper.length > 0 || developers.length > 0) {
                                    setIsSearchDropdownOpen(true);
                                  }
                                }}
                                className="w-full pr-8"
                              />
                              {searchDeveloper && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSearchDeveloper("");
                                    setIsSearchDropdownOpen(false);
                                  }}
                                >
                                  ×
                                </Button>
                              )}
                            </div>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="w-full min-w-[300px]" align="start">
                            {loadingDevelopers ? (
                              <div className="flex items-center justify-center p-4">
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                <span>Carregando...</span>
                              </div>
                            ) : filteredDevelopers.length > 0 ? (
                              filteredDevelopers.map((dev) => (
                                <DropdownMenuItem 
                                  key={dev.id}
                                  onClick={() => selectDeveloperFromDropdown(dev)}
                                  className="flex items-center cursor-pointer"
                                >
                                  <div className="flex items-center w-full">
                                    <Avatar className="h-6 w-6 mr-2">
                                      <AvatarImage src={dev.avatarUrl || ''} alt={dev.name} />
                                      <AvatarFallback>{getDeveloperInitials(dev.name)}</AvatarFallback>
                                    </Avatar>
                                    <span className="flex-grow">{dev.name || dev.email}</span>
                                    {selectedTeamMembers.includes(dev.id) && (
                                      <CheckIcon className="h-4 w-4 ml-2" />
                                    )}
                                  </div>
                                </DropdownMenuItem>
                              ))
                            ) : (
                              <div className="p-2 text-center text-sm text-muted-foreground">
                                Nenhum desenvolvedor encontrado
                              </div>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" size="icon" className="shrink-0">
                            <UserPlus className="h-4 w-4" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80 p-0">
                          <Command>
                            <CommandInput 
                              placeholder="Buscar desenvolvedor..."
                              value={searchDeveloper}
                              onValueChange={setSearchDeveloper}
                            />
                            <CommandEmpty>
                              {loadingDevelopers ? (
                                <div className="flex items-center justify-center p-4">
                                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                  <span>Carregando...</span>
                                </div>
                              ) : (
                                <div className="py-6 text-center text-sm">
                                  Nenhum desenvolvedor encontrado
                                </div>
                              )}
                            </CommandEmpty>
                            
                            <CommandGroup>
                              {filteredDevelopers.map((dev) => (
                                <CommandItem
                                  key={dev.id}
                                  onSelect={() => toggleTeamMember(dev.id)}
                                  className="flex items-center"
                                >
                                  <Avatar className="h-6 w-6 mr-2">
                                    <AvatarImage src={dev.avatarUrl || ''} alt={dev.name} />
                                    <AvatarFallback>{getDeveloperInitials(dev.name)}</AvatarFallback>
                                  </Avatar>
                                  <span>{dev.name || dev.email}</span>
                                  <CheckIcon
                                    className={cn(
                                      "ml-auto h-4 w-4",
                                      selectedTeamMembers.includes(dev.id) ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>
                    
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
                      <div className="border rounded-md p-4 space-y-3">
                        {selectedTeamMembers.map(devId => {
                          const dev = developers.find(d => d.id === devId);
                          return (
                            <div key={devId} className="grid grid-cols-12 gap-2 items-center">
                              <div className="col-span-5 truncate font-medium flex items-center">
                                <Avatar className="h-6 w-6 mr-2">
                                  <AvatarImage src={dev?.avatarUrl || ''} alt={dev?.name} />
                                  <AvatarFallback>{getDeveloperInitials(dev?.name || '')}</AvatarFallback>
                                </Avatar>
                                {getDeveloperName(devId)}
                              </div>
                              <div className="col-span-5">
                                <div className="flex items-center border rounded-md">
                                  <Input
                                    type="number"
                                    min="0"
                                    step={shareType === 'percentage' ? "0.1" : "0.01"}
                                    value={developerShares[devId] || ""}
                                    onChange={(e) => updateDeveloperShare(devId, e.target.value)}
                                    className="border-0 focus-visible:ring-0 text-right pr-0"
                                    placeholder="0"
                                  />
                                  <span className="pr-3 text-muted-foreground">
                                    {shareType === 'percentage' ? '%' : 'R$'}
                                  </span>
                                </div>
                              </div>
                              <div className="col-span-2 flex justify-end">
                                <Button 
                                  type="button"
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => toggleTeamMember(devId)}
                                >
                                  <span className="text-xs">×</span>
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                        
                        <div className="pt-2 border-t flex justify-between items-center">
                          <span className="font-medium">Total:</span>
                          <span className={`font-medium ${getTotalShare() > 100 && shareType === 'percentage' ? 'text-red-500' : ''}`}>
                            {getTotalShare().toFixed(1)}
                            {shareType === 'percentage' ? '%' : ` R$ de ${parseFloat(totalValue).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`}
                          </span>
                        </div>
                        
                        {getTotalShare() > 100 && shareType === 'percentage' && (
                          <div className="text-xs text-red-500">
                            Atenção: O total excede 100%. Por favor, ajuste as porcentagens.
                          </div>
                        )}
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
              </TabsContent>
              
              <TabsContent value="payment" className="space-y-4">
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
                  
                  {isRecurring && (
                    <div className="space-y-2">
                      <Label htmlFor="payment-date">Data de Pagamento Mensal</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal"
                            id="payment-date"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {paymentDate ? (
                              format(paymentDate, "dd 'de' MMMM", { locale: ptBR })
                            ) : (
                              <span>Selecione o dia do pagamento</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 pointer-events-auto" align="start">
                          <Calendar
                            mode="single"
                            selected={paymentDate}
                            onSelect={handlePaymentDateSelect}
                            initialFocus
                            disabled={(date) => {
                              return date.getDate() > 28;
                            }}
                          />
                        </PopoverContent>
                      </Popover>
                      <p className="text-xs text-muted-foreground">
                        Selecione o dia do mês em que o pagamento recorrente será devido (de 1 a 28).
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="costs" className="space-y-4">
                <div className="space-y-4 border rounded-lg p-4">
                  <h3 className="font-semibold">Custos do Projeto</h3>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="developerCost">Custo com Desenvolvedores (R$)</Label>
                        <Input
                          id="developerCost"
                          type="number"
                          min="0"
                          step="0.01"
                          value={developerCost}
                          onChange={(e) => setDeveloperCost(e.target.value)}
                          placeholder="0,00"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="infrastructureCost">Infraestrutura (R$)</Label>
                        <Input
                          id="infrastructureCost"
                          type="number"
                          min="0"
                          step="0.01"
                          value={infrastructureCost}
                          onChange={(e) => setInfrastructureCost(e.target.value)}
                          placeholder="0,00"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="hostingCost">Hospedagem (R$)</Label>
                        <Input
                          id="hostingCost"
                          type="number"
                          min="0"
                          step="0.01"
                          value={hostingCost}
                          onChange={(e) => setHostingCost(e.target.value)}
                          placeholder="0,00"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="licensesCost">Licenças (R$)</Label>
                        <Input
                          id="licensesCost"
                          type="number"
                          min="0"
                          step="0.01"
                          value={licensesCost}
                          onChange={(e) => setLicensesCost(e.target.value)}
                          placeholder="0,00"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="toolsCost">Ferramentas (R$)</Label>
                        <Input
                          id="toolsCost"
                          type="number"
                          min="0"
                          step="0.01"
                          value={toolsCost}
                          onChange={(e) => setToolsCost(e.target.value)}
                          placeholder="0,00"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="marketingCost">Marketing (R$)</Label>
                        <Input
                          id="marketingCost"
                          type="number"
                          min="0"
                          step="0.01"
                          value={marketingCost}
                          onChange={(e) => setMarketingCost(e.target.value)}
                          placeholder="0,00"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="otherCosts">Outros Custos (R$)</Label>
                        <Input
                          id="otherCosts"
                          type="number"
                          min="0"
                          step="0.01"
                          value={otherCosts}
                          onChange={(e) => setOtherCosts(e.target.value)}
                          placeholder="0,00"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Margem de Lucro</Label>
                        <div className="h-10 px-3 py-2 border rounded-md flex items-center justify-between">
                          <span className={calculateProfitMargin() < 0 ? "text-red-500" : ""}>
                            {calculateProfitMargin().toFixed(2)}%
                          </span>
                          <span className="text-muted-foreground text-sm">
                            {calculateTotalCost().toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <div className="pt-6 flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit">
                  Criar Projeto
                </Button>
              </div>
            </form>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
