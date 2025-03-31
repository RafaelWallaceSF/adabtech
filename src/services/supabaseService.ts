import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { Payment, PaymentStatus, Project, ProjectStatus, Task, User } from "@/types";

// Adiciona o tipo payment_date que está faltando
type ProjectWithPaymentDate = Database["public"]["Tables"]["projects"]["Row"] & { 
  payment_date?: string | null 
};

// Convert Supabase project data to our application Project type
export const mapSupabaseProject = (project: ProjectWithPaymentDate): Project => {
  return {
    id: project.id,
    name: project.name,
    client: project.client,
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
    paymentDate: project.payment_date ? new Date(project.payment_date) : undefined
  };
};

// Convert Supabase payment data to our application Payment type
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

// Convert Supabase task data to our application Task type
export const mapSupabaseTask = (task: Database["public"]["Tables"]["tasks"]["Row"]): Task => {
  return {
    id: task.id,
    title: task.title,
    completed: task.completed || false,
    projectId: task.project_id
  };
};

// Convert Supabase profile data to our application User type
export const mapSupabaseUser = (profile: Database["public"]["Tables"]["profiles"]["Row"]): User => {
  return {
    id: profile.id,
    name: profile.name || "Unknown User",
    email: profile.email || "",
    role: profile.role || "developer",
    avatarUrl: profile.avatar_url
  };
};

// Update project status
export const updateProjectStatus = async (projectId: string, status: ProjectStatus): Promise<boolean> => {
  console.log(`Updating project status in database: Project ID ${projectId}, new status: ${status}`);
  
  try {
    // Validate UUID format manually
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(projectId)) {
      console.error(`Invalid UUID format for project ID: ${projectId}`);
      return false;
    }

    const { error } = await supabase
      .from("projects")
      .update({ status })
      .eq("id", projectId);

    if (error) {
      console.error("Error updating project status:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Exception updating project status:", error);
    return false;
  }
};

// Fetch all projects
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

// Fetch a project with its payments and tasks
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

  // Fetch payments for the project
  const { data: paymentsData, error: paymentsError } = await supabase
    .from("payments")
    .select("*")
    .eq("project_id", projectId);

  if (paymentsError) {
    console.error("Error fetching payments:", paymentsError);
    return project;
  }

  const payments = paymentsData.map(mapSupabasePayment);

  // Fetch tasks for the project
  const { data: tasksData, error: tasksError } = await supabase
    .from("tasks")
    .select("*")
    .eq("project_id", projectId);

  if (tasksError) {
    console.error("Error fetching tasks:", tasksError);
    return { ...project, payments };
  }

  const tasks = tasksData.map(mapSupabaseTask);

  // Calculate paid amount
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

// Create a new project
export const createProject = async (project: Omit<Project, "id" | "createdAt">): Promise<Project | null> => {
  const { data, error } = await supabase
    .from("projects")
    .insert({
      name: project.name,
      client: project.client,
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
      payment_date: project.paymentDate?.toISOString()
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating project:", error);
    return null;
  }

  return mapSupabaseProject(data as ProjectWithPaymentDate);
};

// Delete a project
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

// Create a new payment
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

// Mark a payment as paid
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

// Fetch user profiles
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
