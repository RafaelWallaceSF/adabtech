
import { useState, useEffect } from "react";
import { UserPlus, UserCog, Pencil } from "lucide-react";
import { User, UserRole } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CreateUserDialog } from "@/components/team/CreateUserDialog";
import { EditUserDialog } from "@/components/team/EditUserDialog";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/components/auth/AuthProvider";

const Team = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [teamMembers, setTeamMembers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Verificar se o usuário atual é administrador
    const checkIfAdmin = async () => {
      if (!user) return;
      
      if (user.email === "admin@adabtech.com") {
        setIsAdmin(true);
        return;
      }
      
      setIsAdmin(false);
    };

    checkIfAdmin();
  }, [user]);

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  const fetchTeamMembers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('name');

      if (error) {
        toast.error("Erro ao carregar membros da equipe");
        console.error("Error fetching team members:", error);
      } else {
        setTeamMembers(data as User[]);
      }
    } catch (error) {
      toast.error("Erro ao carregar membros da equipe");
      console.error("Error fetching team members:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUserCreated = () => {
    fetchTeamMembers();
    toast.success("Membro adicionado com sucesso!");
  };

  const handleUserUpdated = () => {
    fetchTeamMembers();
    toast.success("Membro atualizado com sucesso!");
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setIsEditDialogOpen(true);
  };

  const getRoleBadgeStyles = (role: string) => {
    switch (role) {
      case 'admin':
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case 'developer':
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case 'finance':
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  const renderRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return "Administrador";
      case 'developer':
        return "Desenvolvedor";
      case 'finance':
        return "Financeiro";
      default:
        return role;
    }
  };

  const getDeveloperCount = () => {
    return teamMembers.filter(member => member.role === 'developer').length;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Equipe</h1>
          <p className="text-muted-foreground">
            Gerencie os membros da sua equipe e suas funções
          </p>
        </div>
        {isAdmin && (
          <Button className="flex items-center gap-2" onClick={() => setIsCreateDialogOpen(true)}>
            <UserPlus className="h-4 w-4" />
            Adicionar Membro
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center">
            <span className="text-sm text-muted-foreground">Total de Membros</span>
            <span className="text-2xl font-semibold">{teamMembers.length}</span>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center">
            <span className="text-sm text-muted-foreground">Desenvolvedores</span>
            <span className="text-2xl font-semibold">{getDeveloperCount()}</span>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center">
            <span className="text-sm text-muted-foreground">Administradores</span>
            <span className="text-2xl font-semibold">
              {teamMembers.filter(member => member.role === 'admin').length}
            </span>
          </CardContent>
        </Card>
      </div>

      {loading ? (
        <div className="flex justify-center p-8">
          <p>Carregando membros da equipe...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teamMembers.map((member) => (
            <Card key={member.id} className="overflow-hidden">
              <CardHeader className="bg-muted/50 pb-2">
                <CardTitle className="text-lg flex items-center justify-between">
                  <span>{member.name || "Usuário"}</span>
                  <div className="flex items-center gap-2">
                    <Badge className={getRoleBadgeStyles(member.role)}>
                      {renderRoleLabel(member.role)}
                    </Badge>
                    {isAdmin && (
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleEditUser(member)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={member.avatarUrl} alt={member.name || "Usuário"} />
                    <AvatarFallback>
                      {member.name
                        ? member.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()
                        : "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{member.email}</div>
                    <div className="text-sm text-muted-foreground">
                      {member.role === "developer" && "Disponível para projetos"}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <CreateUserDialog 
        open={isCreateDialogOpen} 
        onOpenChange={setIsCreateDialogOpen} 
        onUserCreated={handleUserCreated}
      />
      
      <EditUserDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onUserUpdated={handleUserUpdated}
        user={selectedUser}
        isAdmin={isAdmin}
      />
    </div>
  );
};

export default Team;
