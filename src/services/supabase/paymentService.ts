
import { supabase } from "@/integrations/supabase/client";
import { Payment, PaymentStatus } from "@/types";
import { mapSupabasePayment } from "./mappers";

export const createPayment = async (payment: Omit<Payment, "id" | "status">): Promise<Payment | null> => {
  try {
    const { data, error } = await supabase
      .from("payments")
      .insert({
        project_id: payment.projectId,
        amount: payment.amount,
        due_date: payment.dueDate.toISOString(),
        status: PaymentStatus.PENDING,
        description: payment.description
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating payment:", error);
      return null;
    }

    return mapSupabasePayment(data);
  } catch (error) {
    console.error("Exception creating payment:", error);
    return null;
  }
};

export const markPaymentAsPaid = async (paymentId: string): Promise<boolean> => {
  try {
    const paidDate = new Date();
    const { error } = await supabase
      .from("payments")
      .update({
        status: "paid",
        paid_date: paidDate.toISOString()
      })
      .eq("id", paymentId);

    if (error) {
      console.error("Error marking payment as paid:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Exception marking payment as paid:", error);
    return false;
  }
};

export const deletePayment = async (paymentId: string): Promise<boolean> => {
  try {
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

export const enableRealtimeForPayments = (): void => {
  try {
    const channel = supabase
      .channel('public:payments')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'payments' 
      }, (payload: any) => {
        console.log("Payment change detected:", payload);
      })
      .subscribe();
      
    console.log("Realtime for payments enabled");
  } catch (error) {
    console.error("Error enabling realtime for payments:", error);
  }
};
