import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://nqgdzfsydjvshisncuzc.supabase.co';
const supabaseAnonKey = 'sb_publishable_etg2earaaPMom4VHrVsaQw_1QOQhfiV';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
