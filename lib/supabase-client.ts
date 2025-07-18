import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ljssfjezseekmelqtldw.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxqc3NmamV6c2Vla21lbHF0bGR3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5MjY0NTAsImV4cCI6MjA2NzUwMjQ1MH0.x-2snJSq_KqdnBUsBzk2NiWPquadt46wUjYVvRsRy6Q'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)