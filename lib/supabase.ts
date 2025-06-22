import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://yyfdzkojeidbxzlnefeg.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl5ZmR6a29qZWlkYnh6bG5lZmVnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1NDU5MzQsImV4cCI6MjA2NjEyMTkzNH0.BGwgdCSSX4FVB8iPf77CsHZ41Hd833KVq2OtXHIX74U';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
}); 