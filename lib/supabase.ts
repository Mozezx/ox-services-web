import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vbaurywfeiynlluvhfvj.supabase.co';
const supabaseAnonKey = 'sb_publishable_LzyhrGPW-wXT2c9JxmpYFA_UbdjoMK0';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
