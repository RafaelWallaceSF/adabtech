
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Kanban, Users, FileText, Settings, CreditCard, LogOut, Building2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/components/auth/AuthProvider";

const navItems = [
  {
    icon: LayoutDashboard,
    label: "Dashboard",
    path: "/"
  },
  {
    icon: Kanban,
    label: "Projetos",
    path: "/projects"
  },
  {
    icon: Building2,
    label: "Clientes",
    path: "/clients"
  },
  {
    icon: CreditCard,
    label: "Pagamentos",
    path: "/payments"
  },
  {
    icon: Users,
    label: "Equipe",
    path: "/team"
  },
  {
    icon: FileText,
    label: "Relatórios",
    path: "/reports"
  },
  {
    icon: Settings,
    label: "Configurações",
    path: "/settings"
  }
];

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("Logout realizado com sucesso!");
      navigate("/login");
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
      toast.error("Erro ao fazer logout. Tente novamente.");
    }
  };
  
  return <div className="bg-sidebar w-64 h-full flex flex-col border-r border-border">
      <div className="p-6">
        <h1 className="text-xl font-bold text-sidebar-foreground flex items-center gap-2">
          <span className="text-primary">Adabtech</span>PayTrack
        </h1>
      </div>
      
      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        {navItems.map(item => <Link key={item.path} to={item.path} className={cn("sidebar-nav-item", location.pathname === item.path && "active")}>
            <item.icon className="h-5 w-5" />
            <span>{item.label}</span>
          </Link>)}
      </nav>
      
      <div className="p-4 border-t border-sidebar-border mt-auto">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src="" />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {user?.email?.substring(0, 2).toUpperCase() || "AD"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">
              {user?.email?.split('@')[0] || "Admin"}
            </p>
            <p className="text-xs text-sidebar-foreground/70 truncate">
              {user?.email || "admin@example.com"}
            </p>
          </div>
          <LogOut 
            className="h-5 w-5 text-sidebar-foreground/70 hover:text-sidebar-foreground cursor-pointer" 
            onClick={handleLogout}
          />
        </div>
      </div>
    </div>;
}
