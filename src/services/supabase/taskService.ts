
import { supabase } from "@/integrations/supabase/client";
import { Task } from "@/types";
import { mapSupabaseTask } from "./mappers";

export const fetchTasks = async (projectId: string): Promise<Task[]> => {
  try {
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("project_id", projectId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching tasks:", error);
      return [];
    }

    return data.map(mapSupabaseTask);
  } catch (error) {
    console.error("Exception fetching tasks:", error);
    return [];
  }
};

export const createTask = async (task: Omit<Task, "id" | "createdAt">): Promise<Task | null> => {
  try {
    const { data, error } = await supabase
      .from("tasks")
      .insert({
        title: task.title,
        completed: task.completed,
        project_id: task.projectId,
        description: task.description,
        due_date: task.dueDate,
        assigned_to: task.assignedTo
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating task:", error);
      return null;
    }

    return mapSupabaseTask(data);
  } catch (error) {
    console.error("Exception creating task:", error);
    return null;
  }
};

export const updateTask = async (task: Partial<Task> & { id: string }): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("tasks")
      .update(task)
      .eq("id", task.id);
    
    if (error) {
      console.error("Error updating task:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Exception updating task:", error);
    return false;
  }
};

export const updateTaskStatus = async (taskId: string, completed: boolean): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("tasks")
      .update({ completed })
      .eq("id", taskId);
    
    if (error) {
      console.error("Error updating task status:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Exception updating task status:", error);
    return false;
  }
};

export const deleteTask = async (taskId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("tasks")
      .delete()
      .eq("id", taskId);

    if (error) {
      console.error("Error deleting task:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Exception deleting task:", error);
    return false;
  }
};
