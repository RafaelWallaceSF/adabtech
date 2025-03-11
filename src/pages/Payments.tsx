
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getProjectsWithPayments } from "@/data/mockData";
import { Payment, PaymentStatus, ProjectWithPayments } from "@/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Filter, 
  Download,
  Plus,
  ArrowUp,
  ArrowDown,
  Search
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";

export default function Payments() {
  const [projects, setProjects] = useState<ProjectWithPayments[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    setTimeout(() => {
      setProjects(getProjectsWithPayments());
      setLoading(false);
    }, 500);
  }, []);

  // Function to mark a payment as paid
  const markAsPaid = (paymentId: string) => {
    setProjects(prevProjects => {
      const newProjects = prevProjects.map(project => {
        const updatedPayments = project.payments.map(payment => {
          if (payment.id === paymentId) {
            return {
              ...payment,
              status: PaymentStatus.PAID,
              paidDate: new Date()
            };
          }
          return payment;
        });
        
        // Recalculate paid and remaining amounts
        const paidAmount = updatedPayments
          .filter(payment => payment.status === PaymentStatus.PAID)
          .reduce((sum, payment) => sum + payment.amount, 0);
        
        return {
          ...project,
          payments: updatedPayments,
          paidAmount,
          remainingAmount: project.totalValue - paidAmount
        };
      });
      
      return newProjects;
    });
    
    toast({
      title: "Pagamento confirmado",
      description: "O pagamento foi marcado como pago com sucesso.",
    });
  };

  // Extract all payments from all projects
  const allPayments = projects.flatMap(project => 
    project.payments.map(payment => ({
      ...payment,
      projectName: project.name,
      client: project.client
    }))
  );

  // Filter by status and search term
  const pendingPayments = allPayments
    .filter(payment => payment.status === PaymentStatus.PENDING || payment.status === PaymentStatus.OVERDUE)
    .filter(payment => 
      payment.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const paidPayments = allPayments
    .filter(payment => payment.status === PaymentStatus.PAID)
    .filter(payment => 
      payment.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const overduePayments = allPayments
    .filter(payment => payment.status === PaymentStatus.OVERDUE)
    .filter(payment => 
      payment.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

  // Calculate totals
  const totalPending = pendingPayments.reduce((sum, payment) => sum + payment.amount, 0);
  const totalPaid = paidPayments.reduce((sum, payment) => sum + payment.amount, 0);
  const totalOverdue = overduePayments.reduce((sum, payment) => sum + payment.amount, 0);

  const paymentStatusIcon = {
    [PaymentStatus.PAID]: <CheckCircle className="h-4 w-4 text-green-500" />,
    [PaymentStatus.PENDING]: <Clock className="h-4 w-4 text-yellow-500" />,
    [PaymentStatus.OVERDUE]: <AlertCircle className="h-4 w-4 text-destructive" />,
  };
  
  const paymentStatusLabel = {
    [PaymentStatus.PAID]: "Pago",
    [PaymentStatus.PENDING]: "Pendente",
    [PaymentStatus.OVERDUE]: "Em Atraso",
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-xl text-muted-foreground">Carregando pagamentos...</div>
      </div>
    );
  }

  // Create a reusable payment row component that includes the action button
  const PaymentRow = ({ payment, includeActionButton = false }: { payment: Payment & { projectName: string, client: string }, includeActionButton?: boolean }) => (
    <TableRow key={payment.id}>
      <TableCell>
        <div className="flex items-center">
          {paymentStatusIcon[payment.status]}
          <span className="ml-2 text-xs">{paymentStatusLabel[payment.status]}</span>
        </div>
      </TableCell>
      <TableCell>{payment.projectName}</TableCell>
      <TableCell>{payment.client}</TableCell>
      <TableCell>{payment.description}</TableCell>
      <TableCell>
        {format(payment.dueDate, 'dd/MM/yyyy')}
        {payment.status === PaymentStatus.PAID && payment.paidDate && (
          <div className="text-xs text-muted-foreground">
            Pago em: {format(payment.paidDate, 'dd/MM/yyyy')}
          </div>
        )}
        {payment.status === PaymentStatus.OVERDUE && (
          <div className="text-xs text-destructive">
            {Math.ceil((Date.now() - payment.dueDate.getTime()) / (1000 * 60 * 60 * 24))} dias em atraso
          </div>
        )}
      </TableCell>
      <TableCell className="text-right font-medium">
        {new Intl.NumberFormat('pt-BR', { 
          style: 'currency', 
          currency: 'BRL' 
        }).format(payment.amount)}
      </TableCell>
      {includeActionButton && payment.status !== PaymentStatus.PAID && (
        <TableCell>
          <Button 
            size="sm" 
            variant="outline" 
            className="flex items-center gap-1" 
            onClick={() => markAsPaid(payment.id)}
          >
            <CheckCircle className="h-3 w-3" />
            Confirmar Pagamento
          </Button>
        </TableCell>
      )}
    </TableRow>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pagamentos</h1>
          <p className="text-muted-foreground">Gerencie todos os pagamentos dos projetos</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Novo Pagamento
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Clock className="mr-2 h-4 w-4 text-yellow-500" />
              Pagamentos Pendentes
            </CardTitle>
            <CardDescription>
              {pendingPayments.length} pagamento(s)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('pt-BR', { 
                style: 'currency', 
                currency: 'BRL' 
              }).format(totalPending)}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
              Pagamentos Recebidos
            </CardTitle>
            <CardDescription>
              {paidPayments.length} pagamento(s)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('pt-BR', { 
                style: 'currency', 
                currency: 'BRL' 
              }).format(totalPaid)}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <AlertCircle className="mr-2 h-4 w-4 text-destructive" />
              Pagamentos em Atraso
            </CardTitle>
            <CardDescription>
              {overduePayments.length} pagamento(s)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('pt-BR', { 
                style: 'currency', 
                currency: 'BRL' 
              }).format(totalOverdue)}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar pagamentos..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline" size="icon">
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">Todos</TabsTrigger>
          <TabsTrigger value="pending">Pendentes</TabsTrigger>
          <TabsTrigger value="paid">Pagos</TabsTrigger>
          <TabsTrigger value="overdue">Em Atraso</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="space-y-4">
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Status</TableHead>
                  <TableHead>Projeto</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Vencimento</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead>Ação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allPayments.length > 0 ? (
                  allPayments.map(payment => (
                    <PaymentRow 
                      key={payment.id} 
                      payment={payment} 
                      includeActionButton={true} 
                    />
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-4 text-muted-foreground">
                      Nenhum pagamento encontrado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
        
        <TabsContent value="pending" className="space-y-4">
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Status</TableHead>
                  <TableHead>Projeto</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Vencimento</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead>Ação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingPayments.length > 0 ? (
                  pendingPayments.map(payment => (
                    <PaymentRow 
                      key={payment.id} 
                      payment={payment} 
                      includeActionButton={true} 
                    />
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-4 text-muted-foreground">
                      Nenhum pagamento pendente encontrado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
        
        <TabsContent value="paid" className="space-y-4">
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Status</TableHead>
                  <TableHead>Projeto</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Data de Pagamento</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paidPayments.length > 0 ? (
                  paidPayments.map(payment => (
                    <PaymentRow 
                      key={payment.id} 
                      payment={payment} 
                    />
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                      Nenhum pagamento pago encontrado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
        
        <TabsContent value="overdue" className="space-y-4">
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Status</TableHead>
                  <TableHead>Projeto</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Vencimento</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead>Ação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {overduePayments.length > 0 ? (
                  overduePayments.map(payment => (
                    <PaymentRow 
                      key={payment.id} 
                      payment={payment} 
                      includeActionButton={true} 
                    />
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-4 text-muted-foreground">
                      Nenhum pagamento em atraso encontrado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
