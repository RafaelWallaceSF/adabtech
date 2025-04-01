
import { supabase } from "@/integrations/supabase/client";
import { Payment, PaymentStatus } from "@/types";
import { mapSupabasePayment } from "./mappers";

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

export const deletePayment = async (paymentId: string): Promise<boolean> => {
  if (paymentId.startsWith('temp-')) {
    return true;
  }

  try {
    console.log("Attempting to delete payment with ID:", paymentId);
    
    const { error } = await supabase
      .from("payments")
      .delete()
      .eq("id", paymentId);

    if (error) {
      console.error("Error deleting payment:", error);
      return false;
    }

    console.log("Payment successfully deleted");
    return true;
  } catch (error) {
    console.error("Exception deleting payment:", error);
    return false;
  }
};

export const enableRealtimeForPayments = async (): Promise<void> => {
  try {
    // Enable realtime for payments table
    await supabase.rpc('supabase_functions.enable_realtime', {
      table_name: 'payments'
    } as any);
    
    // Also enable realtime for clients table
    await supabase.rpc('supabase_functions.enable_realtime', {
      table_name: 'clients'
    } as any);
    
    console.log("Realtime enabled for payments and clients tables");
  } catch (error) {
    console.error("Error enabling realtime:", error);
  }
};
