
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Payment } from "@/types";
import { format } from "date-fns";
import { CheckCircle, Trash } from "lucide-react";
import { PaymentStatus } from "@/types";

interface PaymentDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payment: Payment;
  projectName: string;
  onMarkAsPaid: (paymentId: string) => void;
  onDelete: (paymentId: string) => void;
}

export function PaymentDetailDialog({
  open,
  onOpenChange,
  payment,
  projectName,
  onMarkAsPaid,
  onDelete,
}: PaymentDetailDialogProps) {
  const handleMarkAsPaid = () => {
    onMarkAsPaid(payment.id);
    onOpenChange(false);
  };

  const handleDelete = () => {
    onDelete(payment.id);
    onOpenChange(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Detalhes do Pagamento</DialogTitle>
          <DialogDescription>
            Informações detalhadas sobre este pagamento.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium mb-1">Projeto</h4>
              <p className="text-sm">{projectName}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium mb-1">Valor</h4>
              <p className="text-sm font-semibold">{formatCurrency(payment.amount)}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium mb-1">Data de Vencimento</h4>
              <p className="text-sm">{format(payment.dueDate, 'dd/MM/yyyy')}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium mb-1">Status</h4>
              <div className={`text-sm inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                payment.status === PaymentStatus.PAID 
                  ? 'bg-green-100 text-green-800' 
                  : payment.status === PaymentStatus.PENDING 
                  ? 'bg-yellow-100 text-yellow-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {payment.status === PaymentStatus.PAID 
                  ? 'Pago' 
                  : payment.status === PaymentStatus.PENDING 
                  ? 'Pendente' 
                  : 'Atrasado'}
              </div>
            </div>
          </div>
          
          {payment.paidDate && (
            <div>
              <h4 className="text-sm font-medium mb-1">Data de Pagamento</h4>
              <p className="text-sm">{format(payment.paidDate, 'dd/MM/yyyy')}</p>
            </div>
          )}
          
          {payment.description && (
            <div>
              <h4 className="text-sm font-medium mb-1">Descrição</h4>
              <p className="text-sm">{payment.description}</p>
            </div>
          )}
        </div>
        
        <DialogFooter className="flex space-x-2">
          {payment.status !== PaymentStatus.PAID && (
            <Button 
              onClick={handleMarkAsPaid}
              className="flex items-center gap-2"
              variant="outline"
            >
              <CheckCircle className="h-4 w-4" />
              Marcar como Pago
            </Button>
          )}
          <Button 
            onClick={handleDelete}
            variant="destructive"
            className="flex items-center gap-2"
          >
            <Trash className="h-4 w-4" />
            Excluir
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default PaymentDetailDialog;
