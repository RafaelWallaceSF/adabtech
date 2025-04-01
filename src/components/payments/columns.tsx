
import { ColumnDef } from "@tanstack/react-table";
import { Payment, PaymentStatus } from "@/types";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { CheckCircle, MoreHorizontal, Pencil, Trash } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ColumnOptions {
  getProjectName: (projectId: string) => string;
  onMarkAsPaid: (paymentId: string) => void;
  onDelete: (paymentId: string) => void;
  onViewDetails: (payment: Payment) => void;
}

export const columns = ({
  getProjectName,
  onMarkAsPaid,
  onDelete,
  onViewDetails,
}: ColumnOptions): ColumnDef<Payment>[] => [
  {
    accessorKey: "projectId",
    header: "Projeto",
    cell: ({ row }) => {
      const projectId = row.getValue("projectId") as string;
      return <div>{getProjectName(projectId)}</div>;
    },
  },
  {
    accessorKey: "description",
    header: "Descrição",
    cell: ({ row }) => {
      const description = row.getValue("description") as string;
      return <div>{description || "-"}</div>;
    },
  },
  {
    accessorKey: "amount",
    header: "Valor",
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("amount"));
      const formatted = new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(amount);
      return <div className="font-medium">{formatted}</div>;
    },
  },
  {
    accessorKey: "dueDate",
    header: "Vencimento",
    cell: ({ row }) => {
      const date = row.original.dueDate;
      return <div>{format(date, "dd/MM/yyyy")}</div>;
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as PaymentStatus;
      return (
        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          status === PaymentStatus.PAID 
            ? 'bg-green-100 text-green-800' 
            : status === PaymentStatus.PENDING 
            ? 'bg-yellow-100 text-yellow-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {status === PaymentStatus.PAID 
            ? 'Pago' 
            : status === PaymentStatus.PENDING 
            ? 'Pendente' 
            : 'Atrasado'}
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const payment = row.original;
      
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Abrir menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Ações</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => onViewDetails(payment)}>
              <Pencil className="mr-2 h-4 w-4" />
              Ver detalhes
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {payment.status !== PaymentStatus.PAID && (
              <DropdownMenuItem onClick={() => onMarkAsPaid(payment.id)}>
                <CheckCircle className="mr-2 h-4 w-4" />
                Marcar como pago
              </DropdownMenuItem>
            )}
            <DropdownMenuItem 
              className="text-destructive focus:text-destructive" 
              onClick={() => onDelete(payment.id)}
            >
              <Trash className="mr-2 h-4 w-4" />
              Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
