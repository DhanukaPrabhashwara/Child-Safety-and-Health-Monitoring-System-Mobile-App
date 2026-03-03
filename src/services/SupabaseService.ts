import 'react-native-url-polyfill/auto';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://ebyjzoxpbgbhehxrijpp.supabase.co';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVieWp6b3hwYmdiaGVoeHJpanBwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA0Nzk4ODMsImV4cCI6MjA4NjA1NTg4M30.r7e8Tkzi7vTQKiRyXK2lE9L8478jyjQEkdJeqKmNrCI';

export const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export interface VoiceLog {
  id: number;
  child_id: string;
  device_id: string;
  voice_vector: number[];
  vector_dim: number;
  audio_source: string;
  model_name: string;
  location_lat: number;
  location_lon: number;
  timestamp: number;
  created_at?: string;
}

class SupabaseService {
    
    async getVoicesForChild(childId: string): Promise<VoiceLog[]> {
        try {
            const { data, error } = await supabase
                .from('detected_voices')
                .select('*')
                .eq('child_id', childId)
                .order('timestamp', { ascending: false });

            if (error) {
                console.error('Error fetching voices:', error);
                throw error;
            }

            return (data as VoiceLog[]) || [];
        } catch (error) {
            console.error('getVoicesForChild failed', error);
            return [];
        }
    }

    // Helper to log in anonymously if needed to align with Watch App RLS policies
    async ensureAuthenticated(): Promise<string | null> {
        try {
            const { data: sessionData } = await supabase.auth.getSession();
            if (sessionData.session) {
                return sessionData.session.user.id;
            }

            const { data, error } = await supabase.auth.signInAnonymously();
            if (error) {
                console.error('Error signing in anonymously:', error);
                return null;
            }
            return data.user?.id || null;
        } catch (error) {
            console.error('ensureAuthenticated failed', error);
            return null;
        }
    }
}

export default new SupabaseService();
