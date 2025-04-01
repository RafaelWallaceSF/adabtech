
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
    const { error } = await supabase
      .from("projects")
      .update(project)
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
      team_members: project.teamMembers,
      deadline: project.deadline?.toISOString(),
      description: project.description,
      is_recurring: project.isRecurring,
      has_implementation_fee: project.hasImplementationFee,
      implementation_fee: project.implementationFee || 0,
      is_installment: project.isInstallment,
      installment_count: project.installmentCount || 1,
      payment_date: project.paymentDate?.toISOString(),
      developer_shares: project.developerShares,
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
