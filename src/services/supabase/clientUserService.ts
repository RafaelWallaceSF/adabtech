
import { supabase } from "@/integrations/supabase/client";
import { User } from "@/types";
import { mapSupabaseUser } from "./mappers";

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
