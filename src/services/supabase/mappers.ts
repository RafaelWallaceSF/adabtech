
import { Database } from "@/integrations/supabase/types";
import { Payment, PaymentStatus, Project, ProjectStatus, Task, User } from "@/types";

export type ProjectWithPaymentDate = Database["public"]["Tables"]["projects"]["Row"] & { 
  payment_date?: string | null,
  developer_shares?: Record<string, number> | null,
  project_costs?: Record<string, number> | null,
  total_cost?: number | null
};

export const mapSupabaseProject = (project: ProjectWithPaymentDate): Project => {
  return {
    id: project.id,
    name: project.name,
    client: project.client,
    clientId: project.client_id || undefined,
    totalValue: Number(project.total_value),
    status: project.status as ProjectStatus,
    teamMembers: project.team_members || [],
    deadline: new Date(project.deadline || Date.now()),
    description: project.description || "",
    createdAt: new Date(project.created_at),
    isRecurring: project.is_recurring || false,
    hasImplementationFee: project.has_implementation_fee || false,
    implementationFee: project.implementation_fee ? Number(project.implementation_fee) : undefined,
    isInstallment: project.is_installment || false,
    installmentCount: project.installment_count || undefined,
    paymentDate: project.payment_date ? new Date(project.payment_date) : undefined,
    developerShares: project.developer_shares as Record<string, number> || {},
    projectCosts: project.project_costs as Record<string, number> || {},
    totalCost: project.total_cost ? Number(project.total_cost) : undefined
  };
};

export const mapSupabasePayment = (payment: Database["public"]["Tables"]["payments"]["Row"]): Payment => {
  return {
    id: payment.id,
    projectId: payment.project_id,
    amount: Number(payment.amount),
    dueDate: new Date(payment.due_date),
    status: payment.status as PaymentStatus,
    paidDate: payment.paid_date ? new Date(payment.paid_date) : undefined,
    description: payment.description || ""
  };
};

export type SupabaseTask = Database["public"]["Tables"]["tasks"]["Row"] & {
  description?: string | null;
  due_date?: string | null;
  assigned_to?: string | null;
};

export const mapSupabaseTask = (task: SupabaseTask): Task => {
  return {
    id: task.id,
    title: task.title,
    description: task.description || undefined,
    completed: task.completed || false,
    projectId: task.project_id,
    dueDate: task.due_date || undefined,
    assignedTo: task.assigned_to || undefined,
    createdAt: task.created_at
  };
};

export const mapSupabaseUser = (profile: Database["public"]["Tables"]["profiles"]["Row"]): User => {
  return {
    id: profile.id,
    name: profile.name || "Unknown User",
    email: profile.email || "",
    role: profile.role || "developer",
    avatarUrl: profile.avatar_url
  };
};
