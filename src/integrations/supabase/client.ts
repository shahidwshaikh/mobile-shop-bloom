// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://yqbilncouplzvqfrzibn.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlxYmlsbmNvdXBsenZxZnJ6aWJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQyOTQ0ODAsImV4cCI6MjA1OTg3MDQ4MH0.O2IN5LHqn_8FLK_gir_3Wu6Xy2aDsF5T7-wTexrwX9g";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);