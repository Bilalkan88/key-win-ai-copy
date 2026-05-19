import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../../../../.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAndAddColumn() {
  console.log('Checking for marketplace column...');
  
  // We can't easily check columns with anon key if RLS is tight, 
  // but we can try to select it.
  const { data, error } = await supabase
    .from('exclusive_keywords')
    .select('marketplace')
    .limit(1);

  if (error) {
    if (error.message.includes('column "marketplace" does not exist')) {
      console.log('Column "marketplace" does not exist. Please add it via Supabase SQL Editor:');
      console.log('ALTER TABLE exclusive_keywords ADD COLUMN marketplace TEXT;');
    } else {
      console.error('Error checking column:', error.message);
    }
  } else {
    console.log('Column "marketplace" already exists.');
  }
}

checkAndAddColumn();
