import { supabase } from "@/integrations/supabase/client";
import { Project, ProjectStatus } from "@/types";
import { mapSupabaseProject, ProjectWithPaymentDate } from "./mappers";

export const updateProjectStatus = async (projectId: string, newStatus: ProjectStatus): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("projects")
      .update({ status: newStatus })
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

export const updateProject = async (project: Partial<Project> & { id: string }): Promise<boolean> => {
  try {
    const supabaseProject: any = { ...project };
    
    if (project.deadline instanceof Date) {
      supabaseProject.deadline = project.deadline.toISOString();
    }
    if (project.paymentDate instanceof Date) {
      supabaseProject.payment_date = project.paymentDate.toISOString();
      delete supabaseProject.paymentDate;
    }
    
    if ('clientId' in project) {
      supabaseProject.client_id = project.clientId;
      delete supabaseProject.clientId;
    }
    
    if ('totalValue' in project) {
      supabaseProject.total_value = project.totalValue;
      delete supabaseProject.totalValue;
    }
    
    if ('teamMembers' in project && Array.isArray(project.teamMembers)) {
      supabaseProject.team_members = project.teamMembers;
      delete supabaseProject.teamMembers;
    }
    
    if ('isRecurring' in project) {
      supabaseProject.is_recurring = project.isRecurring;
      delete supabaseProject.isRecurring;
    }
    
    if ('hasImplementationFee' in project) {
      supabaseProject.has_implementation_fee = project.hasImplementationFee;
      delete supabaseProject.hasImplementationFee;
    }
    
    if ('implementationFee' in project) {
      supabaseProject.implementation_fee = project.implementationFee;
      delete supabaseProject.implementationFee;
    }
    
    if ('isInstallment' in project) {
      supabaseProject.is_installment = project.isInstallment;
      delete supabaseProject.isInstallment;
    }
    
    if ('installmentCount' in project) {
      supabaseProject.installment_count = project.installmentCount;
      delete supabaseProject.installmentCount;
    }
    
    if ('developerShares' in project) {
      supabaseProject.developer_shares = project.developerShares;
      delete supabaseProject.developerShares;
    }
    
    if ('projectCosts' in project) {
      supabaseProject.project_costs = project.projectCosts;
      delete supabaseProject.projectCosts;
    }
    
    if ('totalCost' in project) {
      supabaseProject.total_cost = project.totalCost;
      delete supabaseProject.totalCost;
    }

    const { error } = await supabase
      .from("projects")
      .update(supabaseProject)
      .eq("id", project.id);
    
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
  try {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching projects:", error);
      return [];
    }

    return data.map(mapSupabaseProject);
  } catch (error) {
    console.error("Exception fetching projects:", error);
    return [];
  }
};

export const fetchProjectWithDetails = async (projectId: string): Promise<Project | null> => {
  try {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("id", projectId)
      .single();

    if (error) {
      console.error("Error fetching project details:", error);
      return null;
    }

    return mapSupabaseProject(data as ProjectWithPaymentDate);
  } catch (error) {
    console.error("Exception fetching project details:", error);
    return null;
  }
};

export const createProject = async (project: Omit<Project, "id" | "createdAt">): Promise<Project | null> => {
  try {
    const dataToInsert = {
      name: project.name,
      client: project.client,
      client_id: project.clientId,
      total_value: project.totalValue,
      status: project.status,
      team_members: Array.isArray(project.teamMembers) ? project.teamMembers : [],
      deadline: project.deadline?.toISOString(),
      description: project.description,
      is_recurring: project.isRecurring,
      has_implementation_fee: project.hasImplementationFee,
      implementation_fee: project.implementationFee || 0,
      is_installment: project.isInstallment,
      installment_count: project.installmentCount || 1,
      payment_date: project.paymentDate?.toISOString(),
      developer_shares: project.developerShares || {},
      project_costs: project.projectCosts || {},
      total_cost: project.totalCost || 0
    };

    const { data, error } = await supabase
      .from("projects")
      .insert(dataToInsert)
      .select()
      .single();

    if (error) {
      console.error("Error creating project:", error);
      return null;
    }

    return mapSupabaseProject(data as ProjectWithPaymentDate);
  } catch (error) {
    console.error("Exception creating project:", error);
    return null;
  }
};

export const deleteProject = async (projectId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("projects")
      .delete()
      .eq("id", projectId);

    if (error) {
      console.error("Error deleting project:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Exception deleting project:", error);
    return false;
  }
};
