import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://nqgdzfsydjvshisncuzc.supabase.co';
const supabaseAnonKey = 'sb_publishable_etg2earaaPMom4VHrVsaQw_1QOQhfiV';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkProfiles() {
  console.log('Checking username column in profiles table...');
  const { data, error } = await supabase
    .from('profiles')
    .select('username')
    .limit(1);

  if (error) {
    console.error('Error fetching username column:', error);
  } else {
    console.log('Success! The username column exists. Fetch result:', data);
  }
}

checkProfiles();
