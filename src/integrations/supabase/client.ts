// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://fyvznpujppxphynfbarm.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5dnpucHVqcHB4cGh5bmZiYXJtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1NDM3MDEsImV4cCI6MjA2NTExOTcwMX0.zG0bO4vdK4yS2L8v59FkKld_ylcV63HNN7gtQMiY8j8";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);