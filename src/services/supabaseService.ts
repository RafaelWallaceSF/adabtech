import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { Payment, PaymentStatus, Project, ProjectStatus, Task, User } from "@/types";

type ProjectWithPaymentDate = Database["public"]["Tables"]["projects"]["Row"] & { 
  payment_date?: string | null,
  developer_shares?: Record<string, number> | null
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
    developerShares: project.developer_shares as Record<string, number> || {}
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

type SupabaseTask = Database["public"]["Tables"]["tasks"]["Row"] & {
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

export const updateProjectStatus = async (projectId: string, status: ProjectStatus): Promise<boolean> => {
  console.log(`Updating project status in database: Project ID ${projectId}, new status: ${status}`);
  
  try {
    if (projectId.startsWith('temp-')) {
      console.log(`Project ID ${projectId} is temporary. Skipping database update.`);
      return true;
    }
    
    const { error } = await supabase
      .from("projects")
      .update({ status })
      .eq("id", projectId);

    if (error) {
      console.error("Error updating project status:", error);
      return false;
    }

    if (status === ProjectStatus.ACTIVE) {
      await createRecurringPayments(projectId);
    }

    return true;
  } catch (error) {
    console.error("Exception updating project status:", error);
    return false;
  }
};

const createRecurringPayments = async (projectId: string): Promise<void> => {
  try {
    const { data: projectData, error: projectError } = await supabase
      .from("projects")
      .select("*")
      .eq("id", projectId)
      .single();
    
    if (projectError || !projectData) {
      console.error("Error fetching project for recurring payments:", projectError);
      return;
    }
    
    const project = mapSupabaseProject(projectData);
    
    if (!project.isRecurring) {
      console.log("Project is not recurring. Skipping payment creation.");
      return;
    }
    
    let monthlyAmount = project.totalValue;
    if (project.isInstallment && project.installmentCount) {
      monthlyAmount = project.totalValue / project.installmentCount;
    } else {
      monthlyAmount = project.totalValue / 12;
    }
    
    const startDate = project.paymentDate || new Date();
    
    const installmentCount = project.isInstallment && project.installmentCount 
      ? project.installmentCount 
      : 12;
    
    for (let i = 0; i < installmentCount; i++) {
      const dueDate = new Date(startDate);
      dueDate.setMonth(dueDate.getMonth() + i);
      
      await createPayment({
        projectId: project.id,
        amount: monthlyAmount,
        dueDate: dueDate,
        status: PaymentStatus.PENDING,
        description: `Pagamento ${i + 1} de ${installmentCount} - ${project.name}`
      });
    }
    
    console.log(`Created ${installmentCount} recurring payments for project ${project.id}`);
  } catch (error) {
    console.error("Error creating recurring payments:", error);
  }
};

export const updateProject = async (
  projectId: string, 
  updates: {
    name?: string;
    client?: string;
    client_id?: string;
    description?: string;
    total_value?: number;
    deadline?: Date;
    status?: ProjectStatus;
    team_members?: string[];
    developer_shares?: Record<string, number>;
  }
): Promise<boolean> => {
  console.log(`Updating project in database: Project ID ${projectId}`, updates);
  
  try {
    if (projectId.startsWith('temp-')) {
      console.log(`Project ID ${projectId} is temporary. Skipping database update.`);
      return true;
    }
    
    const updatedValues = { 
      ...updates,
      deadline: updates.deadline ? updates.deadline.toISOString() : undefined
    };
    
    const { error } = await supabase
      .from("projects")
      .update(updatedValues)
      .eq("id", projectId);

    if (error) {
      console.error("Error updating project:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Exception updating project:", error);
    return false;
  }
};

export const fetchProjects = async (): Promise<Project[]> => {
  const { data: projectsData, error: projectsError } = await supabase
    .from("projects")
    .select("*");

  if (projectsError) {
    console.error("Error fetching projects:", projectsError);
    return [];
  }

  return projectsData.map(project => mapSupabaseProject(project as ProjectWithPaymentDate));
};

export const fetchProjectWithDetails = async (projectId: string) => {
  const { data: projectData, error: projectError } = await supabase
    .from("projects")
    .select("*")
    .eq("id", projectId)
    .single();

  if (projectError) {
    console.error("Error fetching project:", projectError);
    return null;
  }

  const project = mapSupabaseProject(projectData as ProjectWithPaymentDate);

  const { data: paymentsData, error: paymentsError } = await supabase
    .from("payments")
    .select("*")
    .eq("project_id", projectId);

  if (paymentsError) {
    console.error("Error fetching payments:", paymentsError);
    return project;
  }

  const payments = paymentsData.map(mapSupabasePayment);

  const { data: tasksData, error: tasksError } = await supabase
    .from("tasks")
    .select("*")
    .eq("project_id", projectId);

  if (tasksError) {
    console.error("Error fetching tasks:", tasksError);
    return { ...project, payments };
  }

  const tasks = tasksData.map(mapSupabaseTask);

  const paidAmount = payments
    .filter(payment => payment.status === PaymentStatus.PAID)
    .reduce((sum, payment) => sum + payment.amount, 0);

  return {
    ...project,
    payments,
    tasks,
    paidAmount,
    remainingAmount: project.totalValue - paidAmount
  };
};

export const createProject = async (project: Omit<Project, "id" | "createdAt">): Promise<Project | null> => {
  const { data, error } = await supabase
    .from("projects")
    .insert({
      name: project.name,
      client: project.client,
      client_id: project.clientId,
      total_value: project.totalValue,
      status: project.status,
      team_members: project.teamMembers,
      deadline: project.deadline.toISOString(),
      description: project.description,
      is_recurring: project.isRecurring,
      has_implementation_fee: project.hasImplementationFee,
      implementation_fee: project.implementationFee,
      is_installment: project.isInstallment,
      installment_count: project.installmentCount,
      payment_date: project.paymentDate?.toISOString(),
      developer_shares: project.developerShares || {}
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating project:", error);
    return null;
  }

  return mapSupabaseProject(data as ProjectWithPaymentDate);
};

export const deleteProject = async (projectId: string): Promise<boolean> => {
  const { error } = await supabase
    .from("projects")
    .delete()
    .eq("id", projectId);

  if (error) {
    console.error("Error deleting project:", error);
    return false;
  }

  return true;
};

export const createPayment = async (payment: Omit<Payment, "id">): Promise<Payment | null> => {
  const { data, error } = await supabase
    .from("payments")
    .insert({
      project_id: payment.projectId,
      amount: payment.amount,
      due_date: payment.dueDate.toISOString(),
      status: payment.status,
      paid_date: payment.paidDate?.toISOString(),
      description: payment.description
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating payment:", error);
    return null;
  }

  return mapSupabasePayment(data);
};

export const markPaymentAsPaid = async (paymentId: string): Promise<boolean> => {
  const { error } = await supabase
    .from("payments")
    .update({ 
      status: PaymentStatus.PAID, 
      paid_date: new Date().toISOString() 
    })
    .eq("id", paymentId);

  if (error) {
    console.error("Error marking payment as paid:", error);
    return false;
  }

  return true;
};

export const fetchUsers = async (): Promise<User[]> => {
  const { data, error } = await supabase
    .from("profiles")
    .select("*");

  if (error) {
    console.error("Error fetching users:", error);
    return [];
  }

  return data.map(mapSupabaseUser);
};

export const fetchClients = async () => {
  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .order("name");

  if (error) {
    console.error("Error fetching clients:", error);
    return [];
  }

  return data;
};

export const fetchTasks = async (): Promise<Task[]> => {
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching tasks:", error);
    return [];
  }

  return data.map(task => mapSupabaseTask(task as SupabaseTask));
};

export const createTask = async (task: {
  title: string;
  description?: string;
  due_date?: string;
  project_id: string;
  assigned_to?: string;
  completed?: boolean;
}): Promise<Task | null> => {
  const { data, error } = await supabase
    .from("tasks")
    .insert(task)
    .select()
    .single();

  if (error) {
    console.error("Error creating task:", error);
    return null;
  }

  return mapSupabaseTask(data as SupabaseTask);
};

export const updateTask = async (taskId: string, task: Partial<Task>): Promise<boolean> => {
  if (taskId.startsWith('temp-')) {
    return true;
  }

  const { error } = await supabase
    .from("tasks")
    .update({
      title: task.title,
      description: task.description,
      due_date: task.dueDate,
      project_id: task.projectId,
      assigned_to: task.assignedTo,
      completed: task.completed
    })
    .eq("id", taskId);

  if (error) {
    console.error("Error updating task:", error);
    return false;
  }

  return true;
};

export const updateTaskStatus = async (taskId: string, completed: boolean): Promise<boolean> => {
  if (taskId.startsWith('temp-')) {
    return true;
  }

  const { error } = await supabase
    .from("tasks")
    .update({ completed })
    .eq("id", taskId);

  if (error) {
    console.error("Error updating task status:", error);
    return false;
  }

  return true;
};

export const deleteTask = async (taskId: string): Promise<boolean> => {
  if (taskId.startsWith('temp-')) {
    return true;
  }

  const { error } = await supabase
    .from("tasks")
    .delete()
    .eq("id", taskId);

  if (error) {
    console.error("Error deleting task:", error);
    return false;
  }

  return true;
};

export const deletePayment = async (paymentId: string): Promise<boolean> => {
  if (paymentId.startsWith('temp-')) {
    return true;
  }

  try {
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(paymentId)) {
      console.error("Invalid payment ID format. Expected UUID format.", paymentId);
      return false;
    }

    const { error } = await supabase
      .from("payments")
      .delete()
      .eq("id", paymentId);

    if (error) {
      console.error("Error deleting payment:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Exception deleting payment:", error);
    return false;
  }
};
