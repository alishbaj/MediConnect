import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://lvfyxjtyehzzpsnjejip.supabase.co";
const supabaseAnon = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx2Znl4anR5ZWh6enBzbmplamlwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ2MDc1MzIsImV4cCI6MjA4MDE4MzUzMn0.ikLsKD6M7LYn3_2MK69l1_nDhNhThU7HatwmnGBRkmQ"; // Public anon key

export const supabase = createClient(supabaseUrl, supabaseAnon);
