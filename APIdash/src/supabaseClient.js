import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://kpwcckyvqenzlhzthsov.supabase.co'
const supabaseAnonKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtwd2Nja3l2cWVuemxoenRoc292Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg2MDA5NDYsImV4cCI6MjA2NDE3Njk0Nn0.3OEw46klza3uO27IQRoNUXx6-wjiar_r6KLn8WRLNsA'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
