// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://qcnvwwyvbcvfjidacfcu.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFjbnZ3d3l2YmN2ZmppZGFjZmN1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM0NTMxOTIsImV4cCI6MjA1OTAyOTE5Mn0.4GhrAe3-BB0TvL2qhzzzuxJnr6DC9S2Xmg-CC1FnDio";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);