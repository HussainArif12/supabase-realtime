import { createClient } from "@supabase/supabase-js";

//Timestamp: 3:29
const supabaseClient = createClient("<SUPABASE_URL>", "<SUPABASE_ANON_KEY>");
export default supabaseClient;
