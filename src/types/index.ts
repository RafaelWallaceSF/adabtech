export enum ProjectStatus {
  NEW = 'new',
  IN_PROGRESS = 'in_progress',
  IN_PRODUCTION = 'in_production',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  OVERDUE = 'overdue',
  CANCELLED = 'cancelled'
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
  description?: string;
  dueDate?: string;
  assignedTo?: string;
  createdAt?: string;
}

export interface Project {
  id: string;
  name: string;
  client: string;
  clientId?: string;
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
  paymentDate?: Date;
  developerShares?: Record<string, number>;
  projectCosts?: Record<string, number>;
  totalCost?: number;
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
  tasks?: Task[];
  paidAmount: number;
  remainingAmount: number;
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
  onProjectClick: (project: ProjectWithPayments) => void;
  onDeleteProject: (projectId: string) => void;
}

export interface Client {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  notes: string | null;
}
