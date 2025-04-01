
import { Payment, PaymentStatus, Project, ProjectStatus, Task } from "@/types";
import { Json } from "@/integrations/supabase/types";

export interface ProjectWithPaymentDate {
  id: string;
  name: string;
  client: string;
  client_id: string | null;
  total_value: number;
  status: string;
  team_members: string[] | null;
  deadline: string | null;
  description: string | null;
  created_at: string;
  is_recurring: boolean | null;
  has_implementation_fee: boolean | null;
  implementation_fee: number | null;
  is_installment: boolean | null;
  installment_count: number | null;
  payment_date: string | null;
  developer_shares: Json | null;
  project_costs: Json | null;
  total_cost: number | null;
}

export const mapSupabaseProject = (project: ProjectWithPaymentDate): Project => {
  return {
    id: project.id,
    name: project.name,
    client: project.client,
    clientId: project.client_id || undefined,
    totalValue: project.total_value,
    status: project.status as ProjectStatus,
    teamMembers: project.team_members || [],
    deadline: project.deadline ? new Date(project.deadline) : new Date(),
    description: project.description || "",
    createdAt: new Date(project.created_at),
    isRecurring: project.is_recurring || false,
    hasImplementationFee: project.has_implementation_fee || false,
    implementationFee: project.implementation_fee || undefined,
    isInstallment: project.is_installment || false,
    installmentCount: project.installment_count || undefined,
    paymentDate: project.payment_date ? new Date(project.payment_date) : undefined,
    developerShares: project.developer_shares ? project.developer_shares as Record<string, number> : undefined,
    projectCosts: project.project_costs ? project.project_costs as Record<string, number> : undefined,
    totalCost: project.total_cost !== null ? project.total_cost as number : undefined
  };
};

export const mapSupabasePayment = (payment: any): Payment => {
  return {
    id: payment.id,
    projectId: payment.project_id,
    amount: payment.amount,
    dueDate: new Date(payment.due_date),
    status: payment.status as PaymentStatus,
    paidDate: payment.paid_date ? new Date(payment.paid_date) : undefined,
    description: payment.description || ""
  };
};

export const mapSupabaseTask = (task: any): Task => {
  return {
    id: task.id,
    title: task.title,
    completed: task.completed || false,
    projectId: task.project_id,
    description: task.description || undefined,
    dueDate: task.due_date || undefined,
    assignedTo: task.assigned_to || undefined,
    createdAt: task.created_at || undefined
  };
};

export const mapSupabaseUser = (user: any) => {
  return {
    id: user.id,
    name: user.name || "",
    email: user.email || "",
    role: user.role || "",
    avatarUrl: user.avatar_url
  };
};
