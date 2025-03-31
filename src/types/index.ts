
export enum ProjectStatus {
  NEW = "new",
  IN_PROGRESS = "in_progress",
  IN_PRODUCTION = "in_production",
  ACTIVE = "active"
}

export enum PaymentStatus {
  PAID = "paid",
  PENDING = "pending",
  OVERDUE = "overdue"
}

export enum UserRole {
  ADMIN = "admin",
  DEVELOPER = "developer",
  FINANCE = "finance"
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarUrl?: string;
}

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  projectId: string;
}

export interface Project {
  id: string;
  name: string;
  client: string;
  totalValue: number;
  status: ProjectStatus;
  teamMembers: string[];
  deadline: Date;
  description: string;
  createdAt: Date;
  isRecurring?: boolean;
  hasImplementationFee?: boolean;
  implementationFee?: number;
  isInstallment?: boolean;
  installmentCount?: number;
  paymentDate?: Date; // Nova propriedade para data de pagamento recorrente
}

export interface Payment {
  id: string;
  projectId: string;
  amount: number;
  dueDate: Date;
  status: PaymentStatus;
  paidDate?: Date;
  description: string;
}

export interface ProjectWithPayments extends Project {
  payments: Payment[];
  paidAmount: number;
  remainingAmount: number;
  tasks?: Task[];
}

export interface ProjectCardProps {
  project: ProjectWithPayments;
  teamMembers: User[];
  onDragStart?: (e: React.DragEvent<HTMLDivElement>) => void;
}

export interface KanbanColumnProps {
  title: string;
  status: ProjectStatus;
  projects: ProjectWithPayments[];
  color: string;
  onDrop: (projectId: string, status: ProjectStatus) => void;
}
