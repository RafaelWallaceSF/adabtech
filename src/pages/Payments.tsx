
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Payment, PaymentStatus, Project } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { fetchProjects, createPayment, markPaymentAsPaid, deletePayment, enableRealtimeForPayments } from '@/services/supabaseService';
import { CreatePaymentDialog } from '@/components/payments/CreatePaymentDialog';
import { PaymentDetailDialog } from '@/components/payments/PaymentDetailDialog';
import { DataTable } from '@/components/payments/PaymentsTable';
import { columns } from '@/components/payments/columns';

const Payments = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

  useEffect(() => {
    loadPayments();
    loadProjects();

    const handleRealtimePaymentEvent = (newPayment: Payment) => {
      setPayments(prevPayments => {
        // Check if payment already exists
        const exists = prevPayments.some(p => p.id === newPayment.id);
        if (exists) {
          // Update existing payment
          return prevPayments.map(p => p.id === newPayment.id ? newPayment : p);
        } else {
          // Add new payment
          return [...prevPayments, newPayment];
        }
      });
    };

    enableRealtimeForPayments();

    return () => {
      // Cleanup subscription
    };
  }, []);

  const loadPayments = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .order('due_date', { ascending: false });

      if (error) {
        toast.error("Erro ao carregar pagamentos");
        console.error("Error fetching payments:", error);
        return;
      }

      const mappedPayments: Payment[] = data.map(payment => ({
        id: payment.id,
        projectId: payment.project_id,
        amount: payment.amount,
        dueDate: new Date(payment.due_date),
        status: payment.status as PaymentStatus,
        paidDate: payment.paid_date ? new Date(payment.paid_date) : undefined,
        description: payment.description || ''
      }));

      setPayments(mappedPayments);
    } catch (error) {
      toast.error("Erro ao carregar pagamentos");
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadProjects = async () => {
    try {
      const projectsData = await fetchProjects();
      setProjects(projectsData);
    } catch (error) {
      toast.error("Erro ao carregar projetos");
      console.error("Error fetching projects:", error);
    }
  };

  const handlePaymentCreated = async (payment: Payment) => {
    try {
      const newPayment = await createPayment({
        projectId: payment.projectId,
        amount: payment.amount,
        dueDate: payment.dueDate,
        description: payment.description
      });

      if (newPayment) {
        setPayments(prev => [newPayment, ...prev]);
        toast.success("Pagamento criado com sucesso!");
      } else {
        toast.error("Erro ao criar pagamento");
      }
    } catch (error) {
      console.error("Error creating payment:", error);
      toast.error("Erro ao criar pagamento");
    }
  };

  const handleMarkAsPaid = async (paymentId: string) => {
    try {
      const success = await markPaymentAsPaid(paymentId);
      if (success) {
        loadPayments();
        toast.success("Pagamento marcado como pago!");
      } else {
        toast.error("Erro ao marcar pagamento como pago");
      }
    } catch (error) {
      console.error("Error marking payment as paid:", error);
      toast.error("Erro ao marcar pagamento como pago");
    }
  };

  const handleDeletePayment = async (paymentId: string) => {
    try {
      const success = await deletePayment(paymentId);
      if (success) {
        setPayments(prev => prev.filter(p => p.id !== paymentId));
        toast.success("Pagamento excluído com sucesso!");
      } else {
        toast.error("Erro ao excluir pagamento");
      }
    } catch (error) {
      console.error("Error deleting payment:", error);
      toast.error("Erro ao excluir pagamento");
    }
  };

  const handleOpenPaymentDetail = (payment: Payment) => {
    setSelectedPayment(payment);
    setIsDetailDialogOpen(true);
  };

  const getProjectName = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    return project ? project.name : 'Projeto não encontrado';
  };

  const pendingPayments = payments.filter(p => p.status === PaymentStatus.PENDING);
  const paidPayments = payments.filter(p => p.status === PaymentStatus.PAID);
  const overduePayments = payments.filter(p => p.status === PaymentStatus.OVERDUE);

  const totalPending = pendingPayments.reduce((sum, p) => sum + p.amount, 0);
  const totalPaid = paidPayments.reduce((sum, p) => sum + p.amount, 0);
  const totalOverdue = overduePayments.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pagamentos</h1>
          <p className="text-muted-foreground">
            Gerencie os pagamentos dos seus projetos
          </p>
        </div>
        <Button className="flex items-center gap-2" onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4" />
          Adicionar Pagamento
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Pagamentos Pendentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalPending)}
            </div>
            <p className="text-xs text-muted-foreground">
              {pendingPayments.length} pagamentos pendentes
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Pagamentos Realizados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalPaid)}
            </div>
            <p className="text-xs text-muted-foreground">
              {paidPayments.length} pagamentos realizados
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Pagamentos Atrasados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalOverdue)}
            </div>
            <p className="text-xs text-muted-foreground">
              {overduePayments.length} pagamentos atrasados
            </p>
          </CardContent>
        </Card>
      </div>

      {loading ? (
        <div className="flex justify-center p-8">
          <p>Carregando pagamentos...</p>
        </div>
      ) : (
        <DataTable 
          columns={columns({ 
            getProjectName, 
            onMarkAsPaid: handleMarkAsPaid,
            onDelete: handleDeletePayment,
            onViewDetails: handleOpenPaymentDetail
          })} 
          data={payments} 
        />
      )}

      <CreatePaymentDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onPaymentCreated={handlePaymentCreated}
        projects={projects}
      />

      {selectedPayment && (
        <PaymentDetailDialog
          open={isDetailDialogOpen}
          onOpenChange={setIsDetailDialogOpen}
          payment={selectedPayment}
          projectName={getProjectName(selectedPayment.projectId)}
          onMarkAsPaid={handleMarkAsPaid}
          onDelete={handleDeletePayment}
        />
      )}
    </div>
  );
};

export default Payments;
