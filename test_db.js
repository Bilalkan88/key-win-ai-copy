const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://nqgdzfsydjvshisncuzc.supabase.co', process.env.VITE_SUPABASE_SERVICE_ROLE_KEY);
require('dotenv').config({path: '.env.local'});
async function run() {
    const { error } = await supabase.from('exclusive_keywords').update({sold_to: 'test'}).eq('id', 1).select();
    console.log("Error:", error);
}
run();
