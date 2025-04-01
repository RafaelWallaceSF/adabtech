
import { supabase } from "@/integrations/supabase/client";
import { Project, ProjectStatus, PaymentStatus } from "@/types";
import { ProjectWithPaymentDate, mapSupabaseProject, mapSupabasePayment, mapSupabaseTask } from "./mappers";
import { createPayment } from "./paymentService";

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

export const createRecurringPayments = async (projectId: string): Promise<void> => {
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
    
    const project = mapSupabaseProject({
      ...projectData,
      developer_shares: projectData.developer_shares as Record<string, number> | null,
      project_costs: projectData.project_costs as Record<string, number> | null,
      total_cost: projectData.total_cost as number | null
    });
    
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
    project_costs?: Record<string, number>;
    total_cost?: number;
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

  const payments = paymentsData.map(payment => mapSupabasePayment(payment));

  const { data: tasksData, error: tasksError } = await supabase
    .from("tasks")
    .select("*")
    .eq("project_id", projectId);

  if (tasksError) {
    console.error("Error fetching tasks:", tasksError);
    return { ...project, payments };
  }

  const tasks = tasksData.map(task => mapSupabaseTask(task));

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
      developer_shares: project.developerShares || {},
      project_costs: project.projectCosts || {},
      total_cost: project.totalCost || 0
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
