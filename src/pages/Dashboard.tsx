
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { 
  Briefcase, 
  Clock, 
  DollarSign, 
  Users, 
  AlertCircle,
  CheckCircle
} from "lucide-react";
import { ProjectStatus, ProjectWithPayments, PaymentStatus } from "@/types";
import { fetchProjects } from "@/services/supabaseService";
import { toast } from "sonner";

export default function Dashboard() {
  const [projects, setProjects] = useState<ProjectWithPayments[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProjects = async () => {
      setLoading(true);
      try {
        console.log("Fetching projects for dashboard...");
        const projectsData = await fetchProjects();
        
        // Convert to ProjectWithPayments format
        const projectsWithPayments = projectsData.map(project => ({
          ...project,
          payments: [],
          paidAmount: 0, // For now, assume no payments
          remainingAmount: project.totalValue,
          tasks: []
        }));
        
        setProjects(projectsWithPayments);
      } catch (error) {
        console.error("Error loading projects for dashboard:", error);
        toast.error("Erro ao carregar projetos para o dashboard");
      } finally {
        setLoading(false);
      }
    };
    
    loadProjects();
  }, []);

  // Calculate summary stats
  const totalProjects = projects.length;
  const activeProjects = projects.filter(p => p.status !== ProjectStatus.ACTIVE).length;
  
  const totalValue = projects.reduce((sum, project) => sum + project.totalValue, 0);
  const totalPaid = projects.reduce((sum, project) => sum + (project.paidAmount || 0), 0);
  const totalPending = totalValue - totalPaid;
  
  const overduePayments = projects.flatMap(p => p.payments || []).filter(
    p => p?.status === PaymentStatus.OVERDUE
  ).length;

  // Data for project status chart
  const statusData = [
    { name: 'Novos', value: projects.filter(p => p.status === ProjectStatus.NEW).length },
    { name: 'Em Andamento', value: projects.filter(p => p.status === ProjectStatus.IN_PROGRESS).length },
    { name: 'Em Produção', value: projects.filter(p => p.status === ProjectStatus.IN_PRODUCTION).length },
    { name: 'Ativos', value: projects.filter(p => p.status === ProjectStatus.ACTIVE).length }
  ];

  // Group projects by month for financial chart
  const currentYear = new Date().getFullYear();
  const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  
  // Initialize with all months
  const financialDataByMonth: {[key: string]: number} = {};
  monthNames.forEach((month, index) => {
    financialDataByMonth[month] = 0;
  });
  
  // Sum project values by month (using creation date)
  projects.forEach(project => {
    const projectMonth = project.createdAt.getMonth();
    const monthName = monthNames[projectMonth];
    financialDataByMonth[monthName] = (financialDataByMonth[monthName] || 0) + project.totalValue;
  });
  
  // Convert to array format for chart
  const financialData = Object.entries(financialDataByMonth).map(([name, value]) => ({
    name,
    value
  }));

  const COLORS = ['#4361ee', '#4cc9f0', '#f72585', '#4ade80'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-xl text-muted-foreground">Carregando dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Visão geral dos projetos e finanças</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Projetos
            </CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProjects}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {activeProjects} em andamento
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Faturado
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalValue)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Desde o início
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pagamentos Pendentes
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalPending)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {overduePayments > 0 ? (
                <span className="flex items-center text-destructive">
                  <AlertCircle className="h-3 w-3 mr-1" /> {overduePayments} em atraso
                </span>
              ) : (
                <span className="flex items-center text-green-500">
                  <CheckCircle className="h-3 w-3 mr-1" /> Todos em dia
                </span>
              )}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Taxa de Conclusão
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalProjects > 0 
                ? Math.round((projects.filter(p => p.status === ProjectStatus.ACTIVE).length / totalProjects) * 100)
                : 0}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Projetos concluídos
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Status dos Projetos</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Faturamento Mensal</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={financialData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis 
                    tickFormatter={(value) => 
                      new Intl.NumberFormat('pt-BR', { 
                        notation: 'compact',
                        compactDisplay: 'short',
                        currency: 'BRL'
                      }).format(value)
                    }
                  />
                  <Tooltip 
                    formatter={(value) => 
                      new Intl.NumberFormat('pt-BR', { 
                        style: 'currency', 
                        currency: 'BRL' 
                      }).format(value as number)
                    }
                  />
                  <Bar dataKey="value" fill="#4361ee" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
