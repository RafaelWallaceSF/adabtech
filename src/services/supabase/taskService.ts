
import { supabase } from "@/integrations/supabase/client";
import { Task } from "@/types";
import { SupabaseTask, mapSupabaseTask } from "./mappers";

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
