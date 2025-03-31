
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
  Search,
  Trash2
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { CreatePaymentDialog } from "@/components/payments/CreatePaymentDialog";
import DeleteConfirmDialog from "@/components/ui/delete-confirm-dialog";
import { deletePayment, markPaymentAsPaid } from "@/services/supabaseService";

export default function Payments() {
  const [projects, setProjects] = useState<ProjectWithPayments[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState<Payment & { projectName: string, client: string } | null>(null);

  useEffect(() => {
    setTimeout(() => {
      setProjects(getProjectsWithPayments());
      setLoading(false);
    }, 500);
  }, []);

  const markAsPaid = async (paymentId: string) => {
    try {
      // For mock data, check if paymentId is not a UUID and handle accordingly
      if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(paymentId)) {
        // Handle mock data payment update locally
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
        
        return;
      }
      
      // If it's a valid UUID, use the Supabase service
      const success = await markPaymentAsPaid(paymentId);
      
      if (success) {
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
      } else {
        toast({
          title: "Erro",
          description: "Não foi possível marcar o pagamento como pago.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error marking payment as paid:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao marcar o pagamento como pago.",
        variant: "destructive",
      });
    }
  };

  const handlePaymentCreated = (newPayment: Payment) => {
    setProjects(prevProjects => {
      const newProjects = prevProjects.map(project => {
        if (project.id === newPayment.projectId) {
          const updatedPayments = [...project.payments, newPayment];
          
          return {
            ...project,
            payments: updatedPayments,
            remainingAmount: project.totalValue - project.paidAmount
          };
        }
        return project;
      });
      
      return newProjects;
    });
  };

  const handleDeletePayment = async () => {
    if (!paymentToDelete) return;
    
    try {
      console.log("Deleting payment with ID:", paymentToDelete.id);
      
      // For mock data, check if paymentId is not a UUID and handle accordingly
      if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(paymentToDelete.id)) {
        // Handle mock data payment deletion locally
        setProjects(prevProjects => {
          return prevProjects.map(project => {
            if (project.id === paymentToDelete.projectId) {
              const updatedPayments = project.payments.filter(
                payment => payment.id !== paymentToDelete.id
              );
              
              const paidAmount = updatedPayments
                .filter(payment => payment.status === PaymentStatus.PAID)
                .reduce((sum, payment) => sum + payment.amount, 0);
              
              return {
                ...project,
                payments: updatedPayments,
                paidAmount,
                remainingAmount: project.totalValue - paidAmount
              };
            }
            return project;
          });
        });
        
        toast({
          title: "Pagamento excluído",
          description: "O pagamento foi excluído com sucesso.",
        });
        
        setPaymentToDelete(null);
        setIsDeleteDialogOpen(false);
        return;
      }
      
      // If it's a valid UUID, use the Supabase service
      const success = await deletePayment(paymentToDelete.id);
      
      if (success) {
        setProjects(prevProjects => {
          return prevProjects.map(project => {
            if (project.id === paymentToDelete.projectId) {
              const updatedPayments = project.payments.filter(
                payment => payment.id !== paymentToDelete.id
              );
              
              const paidAmount = updatedPayments
                .filter(payment => payment.status === PaymentStatus.PAID)
                .reduce((sum, payment) => sum + payment.amount, 0);
              
              return {
                ...project,
                payments: updatedPayments,
                paidAmount,
                remainingAmount: project.totalValue - paidAmount
              };
            }
            return project;
          });
        });
        
        toast({
          title: "Pagamento excluído",
          description: "O pagamento foi excluído com sucesso.",
        });
      } else {
        toast({
          title: "Erro",
          description: "Não foi possível excluir o pagamento.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error deleting payment:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao excluir o pagamento.",
        variant: "destructive",
      });
    } finally {
      setPaymentToDelete(null);
      setIsDeleteDialogOpen(false);
    }
  };

  const confirmDeletePayment = (payment: Payment & { projectName: string, client: string }) => {
    console.log("Confirming deletion of payment:", payment.id);
    setPaymentToDelete(payment);
    setIsDeleteDialogOpen(true);
  };

  const allPayments = projects.flatMap(project => 
    project.payments.map(payment => ({
      ...payment,
      projectName: project.name,
      client: project.client
    }))
  );

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
      <TableCell>
        <div className="flex gap-2 justify-end">
          {includeActionButton && payment.status !== PaymentStatus.PAID && (
            <Button 
              size="sm" 
              variant="outline" 
              className="flex items-center gap-1" 
              onClick={() => markAsPaid(payment.id)}
            >
              <CheckCircle className="h-3 w-3" />
              Confirmar
            </Button>
          )}
          <Button 
            size="sm" 
            variant="outline" 
            className="flex items-center gap-1 text-destructive hover:text-destructive" 
            onClick={() => confirmDeletePayment(payment)}
          >
            <Trash2 className="h-3 w-3" />
            Excluir
          </Button>
        </div>
      </TableCell>
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
          <CreatePaymentDialog 
            projects={projects} 
            onPaymentCreated={handlePaymentCreated} 
          />
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
                  <TableHead className="text-right">Ações</TableHead>
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
                  <TableHead className="text-right">Ações</TableHead>
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
                  <TableHead className="text-right">Ações</TableHead>
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
                    <TableCell colSpan={7} className="text-center py-4 text-muted-foreground">
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
                  <TableHead className="text-right">Ações</TableHead>
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

      <DeleteConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Excluir pagamento"
        description={`Tem certeza que deseja excluir o pagamento ${paymentToDelete?.description || ''} no valor de ${
          paymentToDelete ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(paymentToDelete.amount) : ''
        }? Esta ação não pode ser desfeita.`}
        onConfirm={handleDeletePayment}
      />
    </div>
  );
}
